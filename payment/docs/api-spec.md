# 支付模块 API 接口规范

**版本**: 1.0.0  
**最后更新**: 2025-12-09  
**协议**: HTTPS  
**Host**: `api.deepagent.com` (示例)  
**Base URL**: `/api/v1/payment`

## 1. 概述与鉴权

### 鉴权 (Authentication)
所有接口（除回调接口外）均需在 Header 中携带 JWT Token。
- `Authorization: Bearer <token>`

### 公共请求头 (Common Headers)
- `Content-Type: application/json`
- `X-Request-ID`: 用于链路追踪的唯一 ID (UUID)
- `Idempotency-Key`: **(仅支付初始化接口)** 用于保证支付请求幂等性的唯一 Key (UUID)

---

## 2. 接口定义

### 2.1 升级资格校验 (Check Eligibility)

在用户点击升级按钮前或进入支付页面时调用，用于校验用户是否满足购买特定方案的条件（例如：是否已经是 Pro 用户，是否存在未支付订单）。

- **Endpoint**: `POST /check-eligibility`
- **Auth**: Required

#### 请求参数 (Request Body)

| 字段名 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `planId` | string | 是 | 订阅方案 ID (例如: `pro_monthly`, `team_annual`) |

```json
{
  "planId": "pro_monthly"
}
```

#### 响应参数 (Response Body)

| 字段名 | 类型 | 说明 |
| :--- | :--- | :--- |
| `isEligible` | boolean | 是否有资格升级 |
| `reason` | string | 不具备资格的原因代码 (仅当 isEligible=false 时返回) |
| `message` | string | 用户友好的提示信息 |
| `currentPlan` | object | 当前生效的订阅信息 (可选) |
| `upgradePrice` | object | 升级所需补差价金额 (可选) |

```json
{
  "isEligible": true,
  "message": "可以升级",
  "upgradePrice": {
    "amount": 9900,
    "currency": "CNY",
    "display": "¥99.00"
  }
}
```

**不可升级示例:**
```json
{
  "isEligible": false,
  "reason": "ALREADY_SUBSCRIBED",
  "message": "您当前已经是 Pro 会员，无需重复订阅",
  "currentPlan": {
    "planId": "pro_monthly",
    "expireAt": "2025-12-31T23:59:59Z"
  }
}
```

---

### 2.2 支付流程初始化 (Initiate Payment)

用户确认支付时调用。系统将在内部创建订单，并向第三方支付网关（如 Stripe, 支付宝, 微信）申请支付凭证。

- **Endpoint**: `POST /initiate`
- **Auth**: Required
- **Idempotency**: Required (Header `Idempotency-Key`)

#### 请求参数 (Request Body)

| 字段名 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `planId` | string | 是 | 订阅方案 ID |
| `provider` | string | 是 | 支付渠道: `alipay`, `wechat`, `stripe` |
| `redirectUrl` | string | 否 | 支付成功后的前端回跳地址 |
| `couponCode` | string | 否 | 优惠券代码 |

```json
{
  "planId": "pro_monthly",
  "provider": "alipay",
  "redirectUrl": "https://deepagent.com/settings/billing",
  "couponCode": "WELCOME_2025"
}
```

#### 响应参数 (Response Body)

| 字段名 | 类型 | 说明 |
| :--- | :--- | :--- |
| `orderId` | string | 内部系统生成的唯一订单号 |
| `paymentUrl` | string | 跳转至第三方支付页面的 URL (适用于网页支付) |
| `sdkPayload` | object | 用于前端 SDK 调起的支付参数 (适用于 App/小程序) |
| `expireAt` | string | 支付链接/订单过期时间 (ISO 8601) |
| `amount` | integer | 实际应付金额 (单位: 分) |

```json
{
  "orderId": "ord_20251209102455_x8z92a",
  "paymentUrl": "https://qr.alipay.com/bax092...",
  "expireAt": "2025-12-09T10:39:55Z",
  "amount": 9900
}
```

---

### 2.3 支付结果回调 (Payment Callback)

接收第三方支付网关的异步通知。此接口不需 JWT 鉴权，但必须进行签名验证。

- **Endpoint**: `POST /callback`
- **Auth**: None (Signature Verification Required)

#### 请求参数 (Request Body)

*注意：此结构依支付渠道不同而异，以下为归一化后的通用结构示例。实际实现中可能需要根据 URL 参数（如 `/callback/alipay`）区分处理或在 Body 中解析原始数据。*

| 字段名 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `transaction_id` | string | 是 | 第三方支付流水号 |
| `order_id` | string | 是 | 我方订单号 (透传参数) |
| `status` | string | 是 | 支付状态: `success`, `fail` |
| `amount` | integer | 是 | 实际支付金额 |
| `currency` | string | 是 | 货币类型 |
| `timestamp` | string | 是 | 通知的毫秒级时间戳 |
| `signature` | string | 是 | 签名字符串，用于验签 |

```json
{
  "transaction_id": "2025120922001456...",
  "order_id": "ord_20251209102455_x8z92a",
  "status": "success",
  "amount": 9900,
  "currency": "CNY",
  "timestamp": "1702118234567",
  "signature": "f8a0s9d8f0a9s8d0f98as0d9f8..."
}
```

#### 响应参数 (Response Body)

支付回调通常要求返回纯文本或特定 JSON 以确认收到通知，否则第三方会重试。

```json
{
  "received": true
}
```
或纯文本: `SUCCESS`

---

## 3. 状态码与错误码对照表

### HTTP 状态码
- `200 OK`: 请求成功
- `400 Bad Request`: 参数错误
- `401 Unauthorized`: 未登录或 Token 过期
- `402 Payment Required`: 余额不足或支付被拒绝
- `403 Forbidden`: 无权操作
- `409 Conflict`: 资源冲突 (如幂等性校验失败)
- `429 Too Many Requests`: 请求过于频繁
- `500 Internal Server Error`: 服务器内部错误

### 业务错误码 (ErrorCode)

| 错误码 | 描述 | 建议处理方式 |
| :--- | :--- | :--- |
| `PAY_INVALID_PLAN` | 订阅方案 ID 不存在或已下架 | 提示用户刷新页面或联系客服 |
| `PAY_NOT_ELIGIBLE` | 用户不具备购买资格 | 展示具体的 `reason` 字段信息 |
| `PAY_ALREADY_SUBSCRIBED`| 用户已订阅该方案且未过期 | 引导用户查看当前订阅 |
| `PAY_PROVIDER_ERROR` | 支付渠道初始化失败 | 稍后重试或切换支付方式 |
| `PAY_IDEMPOTENCY_CONFLICT` | 幂等 Key 冲突 (重复请求) | 检查是否重复提交，返回已有订单信息 |
| `PAY_ORDER_EXPIRED` | 订单已过期 | 引导用户重新发起支付 |
| `PAY_SIGNATURE_FAILED` | 回调验签失败 | (系统级) 记录安全日志，拦截请求 |
| `PAY_AMOUNT_MISMATCH` | 支付金额与订单金额不一致 | (系统级) 标记异常订单，人工介入 |

## 4. 数据字典

### 支付状态 (Payment Status)
- `PENDING`: 待支付 (订单已创建)
- `PAID`: 支付成功
- `FAILED`: 支付失败
- `CANCELLED`: 用户取消
- `REFUNDED`: 已退款

### 订阅状态 (Subscription Status)
- `ACTIVE`: 生效中
- `EXPIRED`: 已过期
- `CANCELED`: 已取消 (但在当前周期结束前可能仍有效)
