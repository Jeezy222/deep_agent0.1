# Redis集成和缓存策略

## 概述

Redis将作为多租户计费系统的核心缓存层，支持实时用量追踪、配额管理、速率限制和会话存储。本策略详细说明了Redis的集成方案、缓存设计、性能优化和运维保障。

## 架构设计

### 1. Redis部署架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Application   │    │   Redis Cluster │    │   Monitoring    │
│                 │───▶│                 │◀───│                 │
│  - Cache Layer  │    │  - Master-Slave │    │  - Prometheus   │
│  - Rate Limit   │    │  - Sentinel     │    │  - Grafana      │
│  - Session      │    │  - Cluster Mode │    │  - Alerting     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Persistence   │    │   Backup/Restore│    │   Auto-Scaling  │
│                 │    │                 │    │                 │
│  - AOF + RDB    │    │  - Daily Backup │    │  - HPA          │
│  - Data Retention│    │  - Point-in-time│    │  - VPA          │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 2. 缓存分层策略

| 缓存层级 | 用途 | TTL | 更新策略 | 示例 |
|---------|------|-----|----------|-------|
| L1 - 热点数据 | 实时用量、配额状态 | 1-5分钟 | 写穿透 | 组织当前token用量 |
| L2 - 会话数据 | 用户会话、API密钥 | 30分钟-2小时 | 懒加载 | 用户登录状态 |
| L3 - 配置数据 | 套餐信息、费率 | 1小时-24小时 | 定时刷新 | 定价计划详情 |
| L4 - 统计缓存 | 聚合统计、报表 | 5分钟-1小时 | 异步更新 | 月度用量统计 |

## 核心缓存策略

### 1. 用量缓存策略

#### 实时用量缓存
```python
class UsageCacheStrategy:
    """用量缓存策略"""
    
    def __init__(self, redis_client):
        self.redis = redis_client
        self.prefix = "usage"
        
    def _get_key(self, org_id: str, granularity: str = "realtime") -> str:
        """生成缓存键"""
        return f"{self.prefix}:{granularity}:org:{org_id}"
    
    async def get_realtime_usage(self, org_id: str) -> Dict:
        """获取实时用量"""
        key = self._get_key(org_id, "realtime")
        
        # 尝试从缓存获取
        cached = await self.redis.hgetall(key)
        if cached:
            return self._decode_usage_data(cached)
        
        # 缓存未命中，查询数据库
        usage = await self._query_database(org_id)
        
        # 写入缓存（5分钟TTL）
        await self._set_cache(key, usage, ttl=300)
        
        return usage
    
    async def update_usage(self, org_id: str, delta: Dict):
        """更新用量（增量更新）"""
        key = self._get_key(org_id, "realtime")
        
        # 使用pipeline保证原子性
        async with self.redis.pipeline() as pipe:
            # 增量更新各个字段
            for field, value in delta.items():
                if field in ["total_tokens", "request_count"]:
                    await pipe.hincrby(key, field, int(value))
                elif field == "total_cost":
                    await pipe.hincrbyfloat(key, field, float(value))
            
            # 更新过期时间
            await pipe.expire(key, 300)
            
            # 执行pipeline
            await pipe.execute()
    
    async def invalidate_usage_cache(self, org_id: str):
        """使应用缓存失效"""
        # 删除相关缓存键
        patterns = [
            self._get_key(org_id, "realtime"),
            self._get_key(org_id, "hourly"),
            self._get_key(org_id, "daily"),
            f"{self.prefix}:stats:org:{org_id}"
        ]
        
        for pattern in patterns:
            await self.redis.delete(pattern)
```

#### 聚合缓存策略
```python
class AggregationCacheStrategy:
    """聚合缓存策略"""
    
    def __init__(self, redis_client):
        self.redis = redis_client
        self.prefix = "aggregation"
        
    async def get_hourly_usage(self, org_id: str, hour: datetime) -> Optional[Dict]:
        """获取小时级聚合数据"""
        key = f"{self.prefix}:hourly:{hour.strftime('%Y%m%d%H')}:org:{org_id}"
        
        cached = await self.redis.get(key)
        if cached:
            return json.loads(cached)
        
        return None
    
    async def set_hourly_usage(self, org_id: str, hour: datetime, data: Dict):
        """设置小时级聚合数据"""
        key = f"{self.prefix}:hourly:{hour.strftime('%Y%m%d%H')}:org:{org_id}"
        
        # 计算TTL到下一个小时
        next_hour = hour.replace(minute=0, second=0, microsecond=0) + timedelta(hours=1)
        ttl = int((next_hour - datetime.utcnow()).total_seconds())
        
        await self.redis.setex(key, max(ttl, 300), json.dumps(data))
```

### 2. 配额缓存策略

#### 配额状态缓存
```python
class QuotaCacheStrategy:
    """配额缓存策略"""
    
    def __init__(self, redis_client):
        self.redis = redis_client
        self.prefix = "quota"
        
    async def check_quota_available(self, org_id: str, required_tokens: int) -> Dict:
        """检查配额是否可用"""
        key = f"{self.prefix}:status:org:{org_id}"
        
        # 获取当前配额状态
        quota_info = await self.redis.hgetall(key)
        
        if not quota_info:
            # 缓存未命中，查询数据库
            quota_info = await self._query_quota_from_db(org_id)
            if quota_info:
                await self._set_quota_cache(key, quota_info)
        
        # 解析配额信息
        current_usage = int(quota_info.get(b"current_usage", 0))
        monthly_limit = int(quota_info.get(b"monthly_limit", 0))
        
        # 计算剩余配额
        remaining = monthly_limit - current_usage
        
        return {
            "available": remaining >= required_tokens,
            "current_usage": current_usage,
            "monthly_limit": monthly_limit,
            "remaining": max(remaining, 0),
            "usage_percentage": (current_usage / monthly_limit * 100) if monthly_limit > 0 else 0
        }
    
    async def update_quota_usage(self, org_id: str, token_delta: int):
        """更新配额用量"""
        key = f"{self.prefix}:status:org:{org_id}"
        
        # 原子性更新用量
        async with self.redis.pipeline() as pipe:
            await pipe.hincrby(key, "current_usage", token_delta)
            await pipe.expire(key, 3600)  # 1小时TTL
            await pipe.execute()
    
    async def _set_quota_cache(self, key: str, quota_info: Dict):
        """设置配额缓存"""
        await self.redis.hmset(key, quota_info)
        await self.redis.expire(key, 3600)  # 1小时TTL
```

### 3. 速率限制缓存策略

#### 令牌桶算法实现
```python
class RateLimitStrategy:
    """速率限制缓存策略（令牌桶算法）"""
    
    def __init__(self, redis_client):
        self.redis = redis_client
        self.prefix = "ratelimit"
        
    async def check_rate_limit(self, key: str, limit: int, window: int) -> Dict:
        """
        检查速率限制
        
        Args:
            key: 限制键（如用户ID或组织ID）
            limit: 限制数量
            window: 时间窗口（秒）
            
        Returns:
            Dict: 限制结果和剩余信息
        """
        cache_key = f"{self.prefix}:{key}"
        
        # 使用Lua脚本保证原子性
        lua_script = """
        local key = KEYS[1]
        local limit = tonumber(ARGV[1])
        local window = tonumber(ARGV[2])
        local now = tonumber(ARGV[3])
        
        -- 清理过期令牌
        redis.call('ZREMRANGEBYSCORE', key, 0, now - window)
        
        -- 获取当前令牌数
        local current = redis.call('ZCARD', key)
        
        -- 检查是否超限
        if current >= limit then
            return {0, current}
        end
        
        -- 添加新令牌
        redis.call('ZADD', key, now, now)
        redis.call('EXPIRE', key, window)
        
        return {1, current + 1}
        """
        
        now = int(time.time())
        
        # 执行Lua脚本
        result = await self.redis.eval(
            lua_script,
            1,  # KEYS数量
            cache_key,
            limit,
            window,
            now
        )
        
        allowed = bool(result[0])
        current_count = result[1]
        
        return {
            "allowed": allowed,
            "current": current_count,
            "limit": limit,
            "remaining": max(0, limit - current_count),
            "reset_time": now + window
        }
```

#### 滑动窗口计数器
```python
class SlidingWindowRateLimit:
    """滑动窗口速率限制"""
    
    def __init__(self, redis_client):
        self.redis = redis_client
        self.prefix = "sliding_window"
        
    async def is_allowed(self, key: str, limit: int, window: int) -> bool:
        """检查是否允许请求"""
        cache_key = f"{self.prefix}:{key}"
        now = datetime.utcnow()
        
        # 清理过期数据
        await self.redis.zremrangebyscore(
            cache_key,
            0,
            (now - timedelta(seconds=window)).timestamp()
        )
        
        # 获取当前计数
        current_count = await self.redis.zcard(cache_key)
        
        if current_count >= limit:
            return False
        
        # 添加当前请求
        await self.redis.zadd(cache_key, {now.timestamp(): now.timestamp()})
        await self.redis.expire(cache_key, window + 60)  # 额外1分钟缓冲
        
        return True
```

### 4. 会话缓存策略

#### 分布式会话存储
```python
class SessionCacheStrategy:
    """会话缓存策略"""
    
    def __init__(self, redis_client):
        self.redis = redis_client
        self.prefix = "session"
        self.default_ttl = 7200  # 2小时
        
    async def store_session(self, session_id: str, user_data: Dict, ttl: Optional[int] = None):
        """存储会话数据"""
        key = f"{self.prefix}:{session_id}"
        ttl = ttl or self.default_ttl
        
        # 序列化用户数据
        session_data = {
            "user_id": user_data.get("id"),
            "organization_id": user_data.get("organization_id"),
            "role": user_data.get("role"),
            "permissions": user_data.get("permissions", []),
            "created_at": datetime.utcnow().isoformat(),
            "last_accessed": datetime.utcnow().isoformat()
        }
        
        await self.redis.setex(key, ttl, json.dumps(session_data))
    
    async def get_session(self, session_id: str) -> Optional[Dict]:
        """获取会话数据"""
        key = f"{self.prefix}:{session_id}"
        
        data = await self.redis.get(key)
        if not data:
            return None
        
        try:
            session_data = json.loads(data)
            
            # 更新最后访问时间
            session_data["last_accessed"] = datetime.utcnow().isoformat()
            await self.redis.setex(key, self.default_ttl, json.dumps(session_data))
            
            return session_data
            
        except json.JSONDecodeError:
            await self.redis.delete(key)
            return None
    
    async def invalidate_session(self, session_id: str):
        """使会话失效"""
        key = f"{self.prefix}:{session_id}"
        await self.redis.delete(key)
    
    async def invalidate_user_sessions(self, user_id: str):
        """使用户的所有会话失效"""
        # 查找用户的所有会话
        pattern = f"{self.prefix}:*"
        
        async for key in self.redis.scan_iter(match=pattern):
            data = await self.redis.get(key)
            if data:
                try:
                    session_data = json.loads(data)
                    if session_data.get("user_id") == user_id:
                        await self.redis.delete(key)
                except json.JSONDecodeError:
                    continue
```

## 数据结构与键设计

### 1. 键命名规范

```
格式: {service}:{resource}:{granularity}:{identifier}:{sub_identifier}

示例:
- usage:realtime:org:12345
- quota:status:org:12345
- ratelimit:api:user:67890
- session:active:user:67890
- config:plan:pro:features
```

### 2. 核心数据结构

#### 用量数据 (Hash)
```python
{
    "total_tokens": 1250000,
    "total_cost": 15.75,
    "request_count": 342,
    "last_updated": "2024-01-15T10:30:00Z",
    "hourly_tokens": 45000,
    "daily_tokens": 125000
}
```

#### 配额状态 (Hash)
```python
{
    "current_usage": 850000,
    "monthly_limit": 1000000,
    "remaining": 150000,
    "usage_percentage": 85.0,
    "last_reset": "2024-01-01T00:00:00Z",
    "alert_sent_80": True,
    "alert_sent_100": False
}
```

#### 速率限制 (Sorted Set)
```python
# 令牌桶实现
# 成员: 时间戳, 分数: 时间戳
[
    (1705318200, 1705318200),
    (1705318201, 1705318201),
    (1705318202, 1705318202)
]
```

## 性能优化策略

### 1. 连接池优化

```python
class RedisConnectionPool:
    """Redis连接池管理"""
    
    def __init__(self):
        self.pools = {}
        
    async def get_pool(self, name: str = "default"):
        """获取连接池"""
        if name not in self.pools:
            self.pools[name] = aioredis.ConnectionPool.from_url(
                settings.REDIS_URL,
                max_connections=100,
                retry_on_timeout=True,
                socket_keepalive=True,
                socket_keepalive_options={},
                health_check_interval=30
            )
        
        return self.pools[name]
    
    async def close_all(self):
        """关闭所有连接池"""
        for pool in self.pools.values():
            await pool.disconnect()
```

### 2. Pipeline批处理

```python
async def batch_update_usage(self, updates: List[Dict]):
    """批量更新用量数据"""
    async with redis.pipeline() as pipe:
        for update in updates:
            key = f"usage:realtime:org:{update['org_id']}"
            
            # 增量更新
            pipe.hincrby(key, "total_tokens", update["tokens"])
            pipe.hincrbyfloat(key, "total_cost", update["cost"])
            pipe.hincrby(key, "request_count", 1)
            
            # 设置过期时间
            pipe.expire(key, 300)
        
        # 执行所有命令
        results = await pipe.execute()
        return results
```

### 3. Lua脚本原子操作

```lua
-- 配额检查和更新脚本
local quota_key = KEYS[1]
local usage_key = KEYS[2]
local required_tokens = tonumber(ARGV[1])
local monthly_limit = tonumber(ARGV[2])

-- 获取当前用量
local current_usage = redis.call('HGET', quota_key, 'current_usage')
current_usage = tonumber(current_usage) or 0

-- 检查是否超限
if current_usage + required_tokens > monthly_limit then
    return {0, current_usage, monthly_limit - current_usage}
end

-- 更新用量
redis.call('HINCRBY', quota_key, 'current_usage', required_tokens)
redis.call('HINCRBY', usage_key, 'total_tokens', required_tokens)

return {1, current_usage + required_tokens, monthly_limit - current_usage - required_tokens}
```

### 4. 缓存预热策略

```python
class CacheWarmer:
    """缓存预热器"""
    
    def __init__(self, redis_client, db_session):
        self.redis = redis_client
        self.db = db_session
        
    async def warm_active_organizations(self):
        """预热活跃组织的缓存"""
        # 查询最近24小时内有活动的组织
        active_orgs = await self.db.execute(
            select(Organization.id)
            .join(UsageRecord)
            .where(UsageRecord.created_at > datetime.utcnow() - timedelta(hours=24))
            .distinct()
        )
        
        for org_id in active_orgs.scalars():
            # 预热用量缓存
            await self._warm_usage_cache(org_id)
            
            # 预热配额缓存
            await self._warm_quota_cache(org_id)
    
    async def _warm_usage_cache(self, org_id: str):
        """预热用量缓存"""
        # 查询数据库获取最新用量
        usage_data = await self._query_latest_usage(org_id)
        
        if usage_data:
            key = f"usage:realtime:org:{org_id}"
            await self.redis.hmset(key, usage_data)
            await self.redis.expire(key, 300)
```

## 监控与告警

### 1. 关键指标监控

```python
class RedisMetricsCollector:
    """Redis指标收集器"""
    
    def __init__(self, redis_client):
        self.redis = redis_client
        
    async def collect_metrics(self) -> Dict:
        """收集Redis指标"""
        info = await self.redis.info()
        
        return {
            # 内存指标
            "used_memory": info.get("used_memory", 0),
            "used_memory_human": info.get("used_memory_human", "0B"),
            "memory_fragmentation_ratio": info.get("mem_fragmentation_ratio", 0),
            
            # 性能指标
            "connected_clients": info.get("connected_clients", 0),
            "blocked_clients": info.get("blocked_clients", 0),
            "instantaneous_ops_per_sec": info.get("instantaneous_ops_per_sec", 0),
            
            # 命中率
            "keyspace_hits": info.get("keyspace_hits", 0),
            "keyspace_misses": info.get("keyspace_misses", 0),
            "hit_rate": self._calculate_hit_rate(info),
            
            # 持久化指标
            "rdb_last_save_time": info.get("rdb_last_save_time", 0),
            "aof_last_rewrite_time_sec": info.get("aof_last_rewrite_time_sec", 0),
            
            # 集群指标
            "cluster_enabled": info.get("cluster_enabled", 0),
        }
    
    def _calculate_hit_rate(self, info: Dict) -> float:
        """计算缓存命中率"""
        hits = info.get("keyspace_hits", 0)
        misses = info.get("keyspace_misses", 0)
        
        if hits + misses == 0:
            return 0.0
        
        return hits / (hits + misses) * 100
```

### 2. 告警规则配置

```yaml
# Prometheus告警规则
groups:
- name: redis_alerts
  rules:
  - alert: RedisDown
    expr: redis_up == 0
    for: 0m
    labels:
      severity: critical
    annotations:
      summary: "Redis instance is down"
      
  - alert: RedisHighMemoryUsage
    expr: redis_memory_used_bytes / redis_memory_max_bytes > 0.9
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "Redis memory usage is above 90%"
      
  - alert: RedisLowHitRate
    expr: rate(redis_keyspace_hits_total[5m]) / (rate(redis_keyspace_hits_total[5m]) + rate(redis_keyspace_misses_total[5m])) < 0.8
    for: 15m
    labels:
      severity: warning
    annotations:
      summary: "Redis cache hit rate is below 80%"
      
  - alert: RedisTooManyConnections
    expr: redis_connected_clients > 1000
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "Redis has too many connections"
```

### 3. 性能监控仪表板

```python
class RedisDashboard:
    """Redis监控仪表板"""
    
    def __init__(self, metrics_collector):
        self.collector = metrics_collector
        
    async def generate_dashboard_data(self) -> Dict:
        """生成仪表板数据"""
        metrics = await self.collector.collect_metrics()
        
        return {
            "overview": {
                "status": "healthy" if metrics["connected_clients"] < 100 else "warning",
                "memory_usage": self._format_memory_usage(metrics["used_memory_human"]),
                "hit_rate": f"{metrics['hit_rate']:.1f}%",
                "connections": metrics["connected_clients"]
            },
            "performance": {
                "ops_per_second": metrics["instantaneous_ops_per_sec"],
                "blocked_clients": metrics["blocked_clients"],
                "fragmentation_ratio": f"{metrics['memory_fragmentation_ratio']:.2f}"
            },
            "cache_analysis": {
                "total_keys": await self._get_total_keys(),
                "expiring_keys": await self._get_expiring_keys(),
                "avg_ttl": await self._get_avg_ttl()
            }
        }
```

## 高可用与容灾

### 1. Redis集群部署

```yaml
# Kubernetes Redis集群配置
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: redis-cluster
spec:
  serviceName: redis-cluster
  replicas: 6
  selector:
    matchLabels:
      app: redis-cluster
  template:
    metadata:
      labels:
        app: redis-cluster
    spec:
      containers:
      - name: redis
        image: redis:7-alpine
        command: ["redis-server"]
        args: ["/conf/redis.conf"]
        ports:
        - containerPort: 6379
          name: redis
        volumeMounts:
        - name: conf
          mountPath: /conf
          readOnly: true
        - name: data
          mountPath: /data
        resources:
          requests:
            cpu: 100m
            memory: 256Mi
          limits:
            cpu: 500m
            memory: 512Mi
      volumes:
      - name: conf
        configMap:
          name: redis-config
  volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 10Gi
```

### 2. 数据持久化策略

```bash
# Redis配置 - 混合持久化
save 900 1      # 15分钟内有1个key变化就触发RDB
save 300 10     # 5分钟内有10个key变化就触发RDB  
save 60 10000   # 1分钟内有10000个key变化就触发RDB

appendonly yes          # 开启AOF
appendfsync everysec    # 每秒同步一次
no-appendfsync-on-rewrite yes  # 重写时不进行fsync
auto-aof-rewrite-percentage 100 # AOF文件增长100%时重写
auto-aof-rewrite-min-size 64mb  # AOF文件最小64MB时重写
```

### 3. 备份与恢复

```python
class RedisBackupManager:
    """Redis备份管理器"""
    
    def __init__(self, redis_client, s3_client):
        self.redis = redis_client
        self.s3 = s3_client
        self.backup_bucket = "redis-backups"
        
    async def create_backup(self, backup_name: str) -> bool:
        """创建备份"""
        try:
            # 执行BGSAVE
            await self.redis.bgsave()
            
            # 等待备份完成
            while True:
                info = await self.redis.info()
                if info.get("rdb_bgsave_in_progress") == 0:
                    break
                await asyncio.sleep(1)
            
            # 上传到S3
            backup_file = f"dump-{int(time.time())}.rdb"
            await self._upload_to_s3(backup_file, backup_name)
            
            logger.info(f"Backup created successfully: {backup_name}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to create backup: {e}")
            return False
    
    async def restore_backup(self, backup_name: str) -> bool:
        """恢复备份"""
        try:
            # 从S3下载备份
            backup_data = await self._download_from_s3(backup_name)
            
            # 停止Redis服务
            await self._stop_redis()
            
            # 替换dump.rdb文件
            await self._replace_dump_file(backup_data)
            
            # 重启Redis服务
            await self._start_redis()
            
            logger.info(f"Backup restored successfully: {backup_name}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to restore backup: {e}")
            return False
```

## 实施计划

### 第一阶段：基础集成 (1周)
- [ ] Redis集群部署和配置
- [ ] 连接池和基础缓存实现
- [ ] 用量缓存策略开发
- [ ] 基础监控指标收集

### 第二阶段：高级功能 (1周)
- [ ] 配额和速率限制缓存
- [ ] 会话管理缓存
- [ ] Lua脚本优化
- [ ] Pipeline批处理优化

### 第三阶段：性能优化 (1周)
- [ ] 缓存预热策略
- [ ] 数据分片策略
- [ ] 性能调优和测试
- [ ] 监控告警完善

### 第四阶段：高可用 (1周)
- [ ] 集群高可用配置
- [ ] 数据持久化策略
- [ ] 备份恢复机制
- [ ] 容灾测试验证

## 预期收益

1. **性能提升**：缓存命中率>90%，响应时间减少80%
2. **可扩展性**：支持10万+并发用户
3. **可靠性**：99.9%可用性，自动故障转移
4. **成本优化**：减少数据库查询90%，降低服务器成本
5. **用户体验**：毫秒级响应，无感知配额检查

## 风险评估与应对

| 风险 | 概率 | 影响 | 应对措施 |
|------|------|------|----------|
| Redis内存溢出 | 中 | 高 | 设置内存限制，配置LRU淘汰策略 |
| 缓存穿透 | 中 | 中 | 布隆过滤器，空值缓存 |
| 缓存雪崩 | 低 | 高 | 随机TTL，多级缓存 |
| 数据不一致 | 中 | 中 | 最终一致性，定期校验 |
| 网络分区 | 低 | 高 | 集群部署，哨兵模式 |