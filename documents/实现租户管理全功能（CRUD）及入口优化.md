基于用户的需求，我制定了以下实施计划，旨在完善租户管理功能。

### 核心任务

1.  **后端 API 扩展** (`apps/server/main.py`, `apps/server/schemas.py`):
    *   目前后端仅提供了 `get_all_orgs` 和 `init_demo_data`，缺乏标准的增删改查（CRUD）接口。
    *   **新增 API**:
        *   `POST /api/v1/orgs`: 创建新租户。
        *   `PUT /api/v1/orgs/{org_id}`: 更新租户信息。
        *   `DELETE /api/v1/orgs/{org_id}`: 删除租户。
    *   **更新 Schemas**: 添加 `OrganizationCreate` 和 `OrganizationUpdate` 模型。

2.  **前端功能增强** (`apps/web/src/pages/AdminPage.tsx`, `apps/web/src/contexts/TenantContext.tsx`):
    *   **状态管理**: 更新 `TenantContext` 以支持 `createTenant`, `updateTenant`, `deleteTenant` 操作。
    *   **UI 升级**:
        *   添加“新增租户”按钮，弹出模态框表单。
        *   在表格操作列添加“编辑”和“删除”按钮。
        *   实现删除确认对话框（Double Confirm）。
        *   完善表单验证（必填项检查）。

3.  **导航入口优化** (`apps/web/src/App.tsx`, `apps/web/src/App.tsx` (Dashboard)):
    *   在 Dashboard 页面（`App.tsx` 中的 `Dashboard` 组件）添加一个明显的“管理后台”入口按钮，链接到 `/admin`。
    *   确保入口在移动端和桌面端均适配。

### 具体实施步骤

#### 第一步：后端开发
1.  修改 `apps/server/schemas.py`: 添加 `OrganizationCreate` (name, plan_id) 和 `OrganizationUpdate` (name) 模型。
2.  修改 `apps/server/main.py`: 实现 `create_org`, `update_org`, `delete_org` 路由处理函数。删除逻辑需级联删除关联的 `Subscription`, `UsageRecord` 等数据。

#### 第二步：前端状态管理
1.  修改 `apps/web/src/contexts/TenantContext.tsx`:
    *   添加 `createTenant`, `updateTenant`, `deleteTenant` 方法。
    *   在这些方法中调用对应的后端 API，并在成功后刷新列表。

#### 第三步：前端 UI 开发
1.  修改 `apps/web/src/pages/AdminPage.tsx`:
    *   引入 `lucide-react` 图标（Trash2, Edit, Plus）。
    *   实现 `CreateEditTenantModal` 组件，用于新增和编辑。
    *   实现 `DeleteConfirmModal` 组件。
    *   整合到主页面逻辑中。

#### 第四步：入口与测试
1.  修改 `apps/web/src/App.tsx`: 在 Dashboard 组件中添加“管理后台”按钮。
2.  全面测试增删改查流程，验证数据同步和 UI 响应。

这个计划涵盖了后端 API 的补全和前端交互的完整实现，确保租户管理功能闭环。