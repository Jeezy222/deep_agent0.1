# 实现支付宝订阅支付流程

要实现"点击订阅跳转支付宝"，最标准且符合您当前界面（Powered by Stripe）的做法是使用 **Stripe Checkout 集成 Alipay**。

考虑到这是一个原型系统，且您可能暂时没有配置好的 Stripe 密钥，我将为您实现一套 **"双模"支付系统**：
1.  **真实模式**：如果您配置了 Stripe Key，它会调用真实接口跳转到 Stripe 托管的支付宝页面。
2.  **演示模式（默认）**：如果没有 Key，它会跳转到一个我为您构建的 **"模拟支付宝页面"**，让您能完整体验从"点击订阅" -> "跳转支付" -> "支付成功" -> "回调更新权益" 的全流程。

## 技术实现方案

### 1. 后端改造 (Python/FastAPI)
*   **引入 Stripe SDK**：添加 `stripe` 依赖。
*   **新增 API `/api/v1/checkout/create-session`**：
    *   接收参数：`plan_id`, `cycle`, `payment_method` ('alipay' | 'card')。
    *   **智能路由逻辑**：检测环境变量 `STRIPE_API_KEY`。
        *   **有 Key**：创建真实的 Stripe Checkout Session，返回 Stripe 支付链接。
        *   **无 Key**：生成本地模拟链接 `/mock-alipay?amount=...&plan=...`。

### 2. 前端开发 (React)
*   **改造 `CheckoutPage.tsx`**：
    *   将"订阅"按钮对接新的后端 API。
    *   获取返回的 URL 后，使用 `window.location.href` 进行跳转。
*   **新增 `MockAlipayPage.tsx`**：
    *   **视觉复刻**：模仿支付宝收银台界面（蓝色主题、二维码占位、金额显示）。
    *   **交互**：点击"立即支付"模拟 2秒 处理延迟，然后调用回调接口。
*   **新增 `SuccessPage.tsx`**：
    *   支付成功后的着陆页，显示"订阅已激活"，并引导回 Dashboard。

### 3. 路由配置
*   在 `App.tsx` 中注册 `/mock-alipay` 和 `/success` 路由。

## 预期效果
1.  在收银台选择"支付宝"，点击"订阅"。
2.  页面自动跳转到"模拟支付宝收银台"。
3.  确认支付后，自动跳回"支付成功页"。
4.  回到首页，您会发现账户已自动升级到对应的 Pro/Standard 计划，配额已刷新。

准备好后，请确认开始实施。
