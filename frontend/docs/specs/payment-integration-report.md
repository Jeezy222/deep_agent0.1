# 支付模块集成测试报告

## 1. 前端跳转 URL 构造规则

Deep Agent 前端通过 `CreditsPopover` 组件中的 "升级" 按钮触发跳转。URL 构造逻辑如下：

- **基础 URL**: `http://localhost:5173/` (支付应用本地开发地址)
- **参数列表**:

| 参数名 | 示例值 | 说明 |
| :--- | :--- | :--- |
| `userId` | `user_123` | 当前用户的唯一标识（目前为占位符） |
| `orgId` | `org_default` | 用户所属的组织 ID，用于多租户隔离 |
| `planType` | `PRO` | 目标订阅计划类型 |
| `source` | `chat_upgrade_btn` | 流量来源标识，用于支付应用侧的自动行为触发 |

**代码实现参考**:
```typescript
// frontend/src/components/common/CreditsPopover.tsx

const handleUpgradeClick = () => {
  setIsRedirecting(true);
  
  const paymentUrl = new URL('http://localhost:5173/');
  paymentUrl.searchParams.append('userId', 'user_123');
  paymentUrl.searchParams.append('orgId', 'org_default');
  paymentUrl.searchParams.append('planType', 'PRO');
  paymentUrl.searchParams.append('source', 'chat_upgrade_btn');

  window.location.href = paymentUrl.toString();
};
```

## 2. 支付模块参数解析

支付应用 (`apps/web`) 在初始化时解析 URL 参数，并执行相应的自动操作。

**解析逻辑**:
1.  **提取 `orgId`**: 从 URL 中获取 `orgId`，如果存在则将其存入 `localStorage` 并设置为当前会话的组织 ID。
2.  **提取 `source`**: 检查 `source` 参数。
3.  **自动触发**: 如果 `source === 'chat_upgrade_btn'`，则自动打开定价模态框 (`PricingModal`)，让用户直接进入支付流程。

**代码实现参考**:
```typescript
// apps/web/src/App.tsx

const init = async () => {
  const params = new URLSearchParams(window.location.search);
  const urlOrgId = params.get('orgId');
  
  if (urlOrgId) {
    localStorage.setItem('org_id', urlOrgId);
    setOrgId(urlOrgId);
    loadUsage(urlOrgId);
    
    // Auto-open modal if triggered from upgrade button
    if (params.get('source') === 'chat_upgrade_btn') {
        setIsModalOpen(true);
    }
    return;
  }
  // ...
}
```

## 3. UI 状态变化

跳转过程中的用户体验设计如下：

1.  **初始状态**: 按钮显示 "升级"，可点击。
2.  **点击后 (Loading)**:
    -   按钮文本变为 "跳转中..."
    -   按钮进入 `disabled` 状态，防止重复点击
    -   按钮透明度降低 (opacity: 0.7)
3.  **跳转 (Redirect)**: 浏览器地址栏变化，页面跳转至支付应用。
4.  **目标页加载**: 支付应用加载，并自动弹出支付/订阅方案选择框。

## 4. 本地验证

### 验证步骤
1.  启动 Deep Agent 前端服务 (`npm run dev` in `frontend`).
2.  启动支付应用服务 (`npm run dev` in `apps/web`).
3.  在 Deep Agent 聊天界面，点击积分区域的 "升级" 按钮。
4.  观察按钮状态变为 "跳转中..."。
5.  确认浏览器跳转至 `http://localhost:5173/?userId=...&source=chat_upgrade_btn...`.
6.  确认支付页面自动弹出订阅方案选择框。

### 验证截图

**1. 点击前：积分面板**
![点击前截图](placeholder_before_click.png)
*(请在此处插入点击升级按钮前的截图)*

**2. 跳转中：按钮状态变化**
![跳转中截图](placeholder_redirecting.png)
*(请在此处插入按钮变为"跳转中..."的截图)*

**3. 跳转后：支付应用自动弹窗**
![跳转后截图](placeholder_payment_modal.png)
*(请在此处插入支付应用自动打开 Modal 的截图)*
