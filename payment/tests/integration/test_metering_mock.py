#!/usr/bin/env python3
"""
测试异步计量服务 - Mock Redis版本
用于在没有Redis环境的情况下测试计量逻辑
"""
import asyncio
import json
from datetime import datetime
from dataclasses import dataclass, asdict
from enum import Enum
from typing import Optional, Dict, Any, List
from collections import defaultdict

class EventType(Enum):
    AI_REQUEST = "ai_request"
    TOKEN_USAGE = "token_usage"
    RATE_LIMIT = "rate_limit"

@dataclass
class UsageEvent:
    organization_id: str
    user_id: str
    event_type: EventType
    input_tokens: int
    output_tokens: int
    total_tokens: int
    model: str
    timestamp: datetime
    metadata: Optional[Dict[str, Any]] = None

class MockRedis:
    """Mock Redis实现，用于测试"""
    def __init__(self):
        self.data = defaultdict(dict)
        self.streams = defaultdict(list)
        self.groups = defaultdict(dict)
        self.pending_messages = defaultdict(list)
        
    def from_url(self, url, **kwargs):
        return self
    
    async def xgroup_create(self, stream_name, group_name, id="0-0", mkstream=True):
        if stream_name not in self.groups:
            self.groups[stream_name] = {}
        if group_name in self.groups[stream_name]:
            raise Exception(f"BUSYGROUP Consumer Group name already exists: {group_name}")
        self.groups[stream_name][group_name] = {"id": id}
        print(f"✅ 创建消费者组: {group_name}")
    
    async def xadd(self, stream_name, data, maxlen=100000):
        message_id = f"{len(self.streams[stream_name])}-0"
        self.streams[stream_name].append((message_id, data))
        return message_id
    
    async def xreadgroup(self, group_name, consumer_name, streams, count=100, block=1000):
        result = []
        for stream_name, stream_id in streams.items():
            if stream_name in self.streams:
                messages = []
                for msg_id, msg_data in self.streams[stream_name]:
                    if stream_id == ">" or msg_id > stream_id:
                        messages.append((msg_id, msg_data))
                if messages:
                    result.append((stream_name, messages))
        return result
    
    async def xack(self, stream_name, group_name, message_id):
        # 模拟消息确认
        pass
    
    async def incrby(self, key, amount):
        if key not in self.data:
            self.data[key] = "0"
        current = int(self.data[key])
        new_value = current + amount
        self.data[key] = str(new_value)
        return new_value
    
    async def get(self, key):
        return self.data.get(key)
    
    async def expire(self, key, seconds):
        # 模拟过期设置
        pass
    
    async def close(self):
        pass

class AsyncMeteringService:
    def __init__(self, redis_url: str = "redis://localhost:6379"):
        self.redis_client = None
        self.stream_name = "usage_events"
        self.consumer_group = "metering_workers"
        self.consumer_name = "test_worker_1"
        self.cache_prefix = "metering"
        self.batch_size = 100
        self.batch_timeout = 1.0

    async def initialize(self):
        """初始化Redis连接和消费者组"""
        self.redis_client = MockRedis()
        
        try:
            await self.redis_client.xgroup_create(
                self.stream_name,
                self.consumer_group,
                id="0-0",
                mkstream=True
            )
            print(f"✅ 创建消费者组: {self.consumer_group}")
        except Exception as e:
            if "BUSYGROUP" in str(e):
                print(f"ℹ️  消费者组已存在: {self.consumer_group}")
            else:
                raise

    async def record_usage_event(self, event: UsageEvent) -> bool:
        """记录用量事件到Redis Streams"""
        event_data = {
            **asdict(event),
            "timestamp": event.timestamp.isoformat(),
            "event_type": event.event_type.value,
            "metadata": json.dumps(event.metadata) if event.metadata else "{}"
        }
        
        message_id = await self.redis_client.xadd(
            self.stream_name,
            event_data,
            maxlen=100000
        )
        
        print(f"✅ 记录事件: {message_id}")
        return True

    async def process_usage_events(self) -> int:
        """处理待处理的用量事件"""
        messages = await self.redis_client.xreadgroup(
            self.consumer_group,
            self.consumer_name,
            {self.stream_name: ">"},
            count=self.batch_size,
            block=int(self.batch_timeout * 1000)
        )
        
        if not messages:
            print("ℹ️  没有新事件需要处理")
            return 0
        
        processed_count = 0
        for stream_name, stream_messages in messages:
            for message_id, data in stream_messages:
                try:
                    # 处理事件
                    await self._process_single_event(message_id, data)
                    
                    # 确认消息已处理
                    await self.redis_client.xack(
                        self.stream_name,
                        self.consumer_group,
                        message_id
                    )
                    processed_count += 1
                    
                except Exception as e:
                    print(f"❌ 处理事件失败 {message_id}: {e}")
                    # 将失败的消息发送到死信队列
                    await self._send_to_dlq(message_id, data, str(e))
        
        print(f"✅ 处理了 {processed_count} 个事件")
        return processed_count

    async def _process_single_event(self, message_id: str, data: Dict[str, Any]):
        """处理单个事件"""
        print(f"🔄 处理事件 {message_id}:")
        print(f"   组织ID: {data.get('organization_id')}")
        print(f"   用户ID: {data.get('user_id')}")
        print(f"   事件类型: {data.get('event_type')}")
        print(f"   输入Tokens: {data.get('input_tokens')}")
        print(f"   输出Tokens: {data.get('output_tokens')}")
        print(f"   总Tokens: {data.get('total_tokens')}")
        print(f"   模型: {data.get('model')}")
        
        # 模拟处理时间
        await asyncio.sleep(0.1)
        
        # 更新缓存中的用量数据
        org_id = data.get('organization_id')
        total_tokens = int(data.get('total_tokens', 0))
        
        if org_id and total_tokens > 0:
            cache_key = f"{self.cache_prefix}:usage:{org_id}"
            await self.redis_client.incrby(cache_key, total_tokens)
            await self.redis_client.expire(cache_key, 3600)  # 1小时过期
            print(f"💾 更新缓存: {cache_key} += {total_tokens}")

    async def _send_to_dlq(self, message_id: str, data: Dict[str, Any], error: str):
        """发送失败消息到死信队列"""
        print(f"⚠️  消息发送到DLQ: {message_id} - {error}")

    async def get_usage_stats(self, organization_id: str) -> Dict[str, Any]:
        """获取组织的用量统计"""
        cache_key = f"{self.cache_prefix}:usage:{organization_id}"
        cached_usage = await self.redis_client.get(cache_key)
        
        if cached_usage:
            usage = int(cached_usage)
            print(f"📊 从缓存获取用量: {usage}")
        else:
            usage = 0
            print(f"📊 缓存未命中，用量为: {usage}")
        
        return {
            "organization_id": organization_id,
            "current_usage": usage,
            "cache_hit": cached_usage is not None
        }

    async def close(self):
        """关闭Redis连接"""
        if self.redis_client:
            await self.redis_client.close()

async def test_metering_service():
    """测试异步计量服务"""
    print("🚀 开始测试异步计量服务...")
    
    # 创建服务实例
    service = AsyncMeteringService()
    
    try:
        # 初始化
        await service.initialize()
        
        # 创建测试事件
        test_event = UsageEvent(
            organization_id="test-org-123",
            user_id="test-user-456",
            event_type=EventType.AI_REQUEST,
            input_tokens=50,
            output_tokens=150,
            total_tokens=200,
            model="gpt-3.5-turbo",
            timestamp=datetime.now(),
            metadata={"request_id": "test-001", "endpoint": "/api/v1/ai/proxy"}
        )
        
        # 记录事件
        print("\n📤 记录测试事件...")
        await service.record_usage_event(test_event)
        
        # 处理事件
        print("\n⚙️  处理事件...")
        processed = await service.process_usage_events()
        
        # 获取用量统计
        print("\n📈 获取用量统计...")
        stats = await service.get_usage_stats("test-org-123")
        print(f"用量统计: {json.dumps(stats, indent=2, ensure_ascii=False)}")
        
        # 再次记录更多事件
        print("\n📤 记录更多事件...")
        for i in range(3):
            event = UsageEvent(
                organization_id="test-org-123",
                user_id=f"test-user-{i}",
                event_type=EventType.AI_REQUEST,
                input_tokens=10 * (i + 1),
                output_tokens=30 * (i + 1),
                total_tokens=40 * (i + 1),
                model="gpt-4",
                timestamp=datetime.now(),
                metadata={"batch_id": f"batch-{i}"}
            )
            await service.record_usage_event(event)
        
        # 批量处理
        print("\n⚙️  批量处理事件...")
        processed = await service.process_usage_events()
        
        # 最终用量统计
        print("\n📊 最终用量统计...")
        final_stats = await service.get_usage_stats("test-org-123")
        print(f"最终统计: {json.dumps(final_stats, indent=2, ensure_ascii=False)}")
        
        print("\n✅ 测试完成！")
        
    except Exception as e:
        print(f"\n❌ 测试失败: {e}")
        import traceback
        traceback.print_exc()
        
    finally:
        await service.close()

if __name__ == "__main__":
    asyncio.run(test_metering_service())