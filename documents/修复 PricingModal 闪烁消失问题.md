根据分析，页面元素（PricingModal）闪烁后消失的问题很可能是由于点击事件冒泡引起的。当用户点击 `CreditsPopover` 中的“升级”按钮时，点击事件冒泡到了父容器 `div.topBadge`，触发了其 `onClick` 处理函数，导致状态管理的冲突或不必要的重绘。

我的修复计划如下：

1.  **修复事件冒泡**：
    *   修改 `frontend/src/components/common/CreditsPopover.tsx`。
    *   在 `handleUpgradeClick` 中调用 `e.stopPropagation()`，防止点击事件冒泡到父组件。

2.  **增强调试能力与健壮性**：
    *   修改 `frontend/src/components/common/PricingModal.tsx`，在关闭逻辑中添加日志，以便确认关闭是由遮罩层点击还是其他原因触发的。

3.  **验证**：
    *   确保修改后的代码通过编译。
    *   重启前端服务以应用更改。

这将直接解决因事件冒泡导致的状态重置问题，从而修复“闪烁后消失”的现象。