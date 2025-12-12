经过对代码的详细分析，我发现 `TenantSwitcher.tsx`、`api.ts` 和 `main.py` 的数据链路存在一个关键的不一致问题。

### 发现的问题

1.  **数据来源不一致**：
    *   **前端 (`TenantSwitcher.tsx`)**：使用 `api.getAllOrgs()`，该方法请求 `/debug/orgs`。
    *   **前端 (`api.ts`)**：`getAllOrgs` 期望返回 `OrganizationDetail[]` 数组。
    *   **后端 (`main.py`)**：`/api/v1/debug/orgs` 返回的是一个 **分页对象** `{ data: [...], total: ..., page: ..., size: ... }`，而不是直接的数组。
    *   **结果**：`TenantSwitcher` 中的 `setOrgs(data)` 会将整个分页对象（字典）赋值给 `orgs` 状态，而 `orgs` 应该是一个数组。这会导致 `orgs.length` 报错或 `orgs.map` 失败（虽然在 JS 中 `map` 对象会报错，但在 React 渲染中可能只是不显示或崩溃）。此外，`TenantSwitcher` 中显示 "33 个可用" 是因为 `orgs.length` 可能是 undefined 或者如果 `data` 是对象则没有 `length` 属性。

2.  **API 定义与使用不匹配**：
    *   `TenantSwitcher.tsx` 第 31 行：`setOrgs(data);` 期望 `data` 是数组。
    *   `main.py` 第 357 行：返回的是字典结构。

### 修复计划

1.  **修改 `api.ts`**：
    *   更新 `getAllOrgs` 方法，使其能够正确解析后端返回的分页结构，并只返回 `data` 字段（租户列表）。
    *   或者修改 `TenantSwitcher.tsx` 来处理分页响应。考虑到 `TenantSwitcher` 是一个简单的下拉列表，一次性获取所有（或前 N 个）租户更合适。

2.  **增强 `TenantSwitcher.tsx`**：
    *   更新 `loadOrgs` 函数，正确处理后端响应：`setOrgs(data.data || [])`。
    *   添加错误处理和空状态提示。

3.  **验证后端逻辑**：
    *   `/api/v1/debug/orgs` 的实现看起来是正确的（支持分页和筛选），但前端调用时需要适配其返回格式。

### 执行步骤

1.  **修改 `apps/web/src/services/api.ts`**：
    *   更新 `getAllOrgs` 的返回类型定义，或者在函数内部解包。
    *   为了保持 API 方法的纯净性，我建议在 `api.ts` 中定义正确的响应接口，并在 `TenantSwitcher` 中处理。

2.  **修改 `apps/web/src/components/TenantSwitcher.tsx`**：
    *   修改 `loadOrgs` 函数：`const res = await api.getAllOrgs(); setOrgs(res.data);`（假设 `api.getAllOrgs` 返回完整响应）。
    *   注意：`api.ts` 中的 `getAllOrgs` 目前是 `const res = await api.get<OrganizationDetail[]>('/debug/orgs'); return res.data;`。这里的泛型 `<OrganizationDetail[]>` 是错误的，因为实际返回的是分页对象。

**修正后的 `api.ts` 计划**：
```typescript
export interface PaginatedOrgs {
  data: OrganizationDetail[];
  total: number;
  page: number;
  size: number;
}

export const getAllOrgs = async () => {
  // 请求 limit=100 以在切换器中显示足够多的租户
  const res = await api.get<PaginatedOrgs>('/debug/orgs?limit=100');
  return res.data; // 这里返回的是 PaginatedOrgs 对象
};
```

**修正后的 `TenantSwitcher.tsx` 计划**：
```typescript
const loadOrgs = async () => {
  setLoading(true);
  try {
    const response = await api.getAllOrgs();
    setOrgs(response.data); // 从分页对象中提取 data 数组
  } catch (e) {
    console.error(e);
  } finally {
    setLoading(false);
  }
};
```

这个修复将解决 `div` (TenantSwitcher) 与后端的数据连接问题，确保租户列表能正确显示。