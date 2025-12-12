I have analyzed the issues and requirements.

**Issues Identified:**
1.  **Div Content (`systemOverview.activeTenants`):** The logic likely just counts rows, but the user says it displays "page number" or incorrect data. Actually, the code `systemOverview.activeTenants` filters by `subscription_status === 'active'`. If the user sees incorrect data, it might be due to pagination (calculating only based on the *current page* of tenants instead of the total). Since `tenants` in context is just the current page, `systemOverview` is inaccurate.
2.  **Td Layout:** The "Credit Overview" column (`td`) is functional but basic. The request asks for UI/UX improvements: better spacing, responsiveness, modern design, visual hierarchy, and animations.
3.  **Data Consistency:** The dashboard at `localhost:5173` (port 3000 effectively) and Admin at `5174` might be showing different data if one uses the new `CreditBalance` and the other uses `UsageRecord`.

**Plan:**

1.  **Fix `systemOverview` Logic:**
    *   The `TenantContext` only holds the *current page* of tenants. To get accurate global stats (Active Tenants, Total Points), the backend API (`/api/v1/debug/orgs`) needs to return these aggregated stats in the response, rather than the frontend calculating them from a partial list.
    *   **Action:** Update `apps/server/services/organization_service.py` to calculate global stats and return them in the meta section of the response.
    *   **Action:** Update frontend `TenantContext` and `AdminPage` to use these server-provided stats.

2.  **UI/UX Overhaul for Credit Column (`td`):**
    *   Redesign the button trigger to look more like a "Credit Badge" or "Wallet Card".
    *   Add a subtle progress bar or sparkline directly in the cell.
    *   Improve typography (font weights, colors).

3.  **Data Consistency Check:**
    *   Ensure the Admin Page uses the same `CreditBalance` source of truth as the user dashboard. (It already does via the updated Service).

**Implementation Steps:**

1.  **Backend:** Modify `get_organizations` in `OrganizationService` to return `total_active_tenants` and `total_system_points` in the response envelope.
2.  **Frontend API/Context:** Update `PaginatedOrgs` interface and `TenantContext` to store and expose these global stats.
3.  **Frontend UI:**
    *   Update `AdminPage` to use `totalActiveTenants` from context instead of calculating it.
    *   Refactor the `td` content in `AdminPage` with Tailwind classes for a polished look (e.g., `ring`, `shadow-sm`, `rounded-md`, gradient accents).

I will start by updating the backend service to provide accurate global statistics.
