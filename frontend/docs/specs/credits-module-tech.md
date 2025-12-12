# Credits 模块技术方案 v1.0

## 1. 模块集成方案

### 1.1 组件结构 (CreditsPopover)

`CreditsPopover` 是一个展示用户积分信息并提供升级入口的悬浮组件。

- **路径**: `frontend/src/components/common/CreditsPopover.tsx`
- **主要区域**:
  1.  **Header**: 包含 "免费" 标签和 "升级" 按钮。
  2.  **Points Section**: 显示总积分和免费积分详情。
  3.  **Daily Refresh Section**: 显示每日刷新额度和刷新规则说明。
  4.  **Footer**: "查看使用情况" 链接。

### 1.2 样式隔离

组件使用 CSS Modules 进行样式隔离，依赖于 `frontend/src/styles/chat.module.css`。

**核心类名**:
- `.creditsPopover`: 容器样式，控制背景、阴影、圆角。
- `.popoverHeader`: 头部布局。
- `.upgradeBtn`: 升级按钮样式，支持不同状态（默认、禁用、成功、失败）。
- `.popoverSection`: 内容区块分割。
- `.creditsRow`: 标签与数值的行布局。
- `.creditsLabel` & `.creditsValue`: 文本样式。
- `.iconSparkle` & `.iconCalendar`: 图标样式。

### 1.3 交互逻辑

1.  **升级流程**:
    - 用户点击 "升级" 按钮。
    - 组件状态 `isUpgrading` 置为 `true`，`paymentStatus` 置为 `'processing'`。
    - 按钮显示 "处理中..." 并被禁用。
    - 调用后端接口创建订单。
    - 启动轮询机制检查订单状态。

2.  **状态反馈**:
    - **处理中**: 按钮灰色，不可点击。
    - **成功**: 按钮变为绿色 (#10b981)，显示 "已升级"。3秒后自动重置为默认状态。
    - **失败**: 按钮变为红色 (#ef4444)，显示 "重试"，用户可再次点击。

## 2. 接口文档

### 2.1 创建订单

- **URL**: `/api/payment/create-order`
- **Method**: `POST`
- **描述**: 初始化支付流程，生成订单 ID。

**请求示例**:
```json
// Body: {}
```

**响应示例 (200 OK)**:
```json
{
  "orderId": "ORDER_1715234567890_1234",
  "paymentUrl": "https://mock-payment-gateway.com/pay?orderId=..."
}
```

**响应示例 (Error)**:
```json
{
  "message": "Internal Server Error"
}
```

### 2.2 查询订单状态

- **URL**: `/api/payment/order-status`
- **Method**: `GET`
- **描述**: 根据订单 ID 查询支付状态。

**请求参数**:
- `orderId`: string (Required)

**请求示例**:
`GET /api/payment/order-status?orderId=ORDER_1715234567890_1234`

**响应示例 (200 OK)**:
```json
{
  "status": "success" // 可能值: 'pending' | 'success' | 'failed'
}
```

**响应示例 (400 Bad Request)**:
```json
{
  "message": "Missing or invalid orderId"
}
```

## 3. 错误处理机制

### 3.1 支付失败处理
- 当 `/order-status` 返回 `status: 'failed'` 时。
- UI 表现：升级按钮变红，文案变为 "重试"。
- 逻辑：`isUpgrading` 重置为 `false`，允许用户重新发起请求。

### 3.2 超时处理
- 前端实现了轮询计数器 `attempts`。
- 策略：每 1 秒轮询一次，最大尝试次数为 10 次。
- 触发条件：`attempts > 10` 且状态仍未明确。
- 处理：视为支付失败，停止轮询，更新 UI 为失败状态。

### 3.3 网络/系统错误
- 捕获 `fetch` 异常或非 200 响应。
- 处理：控制台输出错误日志，UI 更新为失败状态，防止界面卡死在 "处理中"。

## 4. 版本记录

| 版本 | 日期 | 作者 | 描述 |
| :--- | :--- | :--- | :--- |
| v1.0 | 2025-12-09 | Trae | 初始版本：CreditsPopover 组件及基础支付流程 |
