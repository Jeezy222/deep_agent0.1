I have analyzed the request. The user wants to ensure the newly added credit fields (monthly, daily, event, additional, free points) are visible and managed in the Admin Dashboard (`http://localhost:5174/admin`).

**Requirements Breakdown:**

1.  **Backend Verification:** Ensure the `CreditBalance` model is integrated and data is retrievable. (Already done in previous step, but `get_all_orgs` in `OrganizationService` needs to include this data).
2.  **Frontend Update (`AdminPage.tsx`):**
    *   Update the table to display credit information.
    *   Since there are many credit types, maybe show a summary or a "Details" view/modal.
    *   Format numbers and dates.
3.  **Data Fetching:** Ensure `getOrgs` API returns the credit balance.

**Gap Analysis:**

*   **Service Layer:** In `apps/server/services/organization_service.py`, the `get_organizations` method constructs the response list. It currently *does not* fetch or include `CreditBalance` info. I need to update this.
*   **Frontend Type:** `Tenant` interface in `TenantContext.tsx` and `api.ts` needs to include credit fields.
*   **Frontend UI:** `AdminPage.tsx` needs columns for credits. Given the space, I'll probably add a "Total Points" column and maybe a tooltip or expanded view for the breakdown.

**Plan:**

1.  **Backend - Update Service:**
    *   Modify `apps/server/services/organization_service.py` -> `get_organizations` method.
    *   Fetch `CreditBalance` for each org and include it in the response dictionary.

2.  **Frontend - Update Types:**
    *   Update `OrganizationDetail` in `apps/web/src/services/api.ts` to include `credit_balance` structure.
    *   Update `Tenant` in `apps/web/src/contexts/TenantContext.tsx` (it extends `OrganizationDetail`, so auto-updated).

3.  **Frontend - Update AdminPage:**
    *   Add columns to the table for "Total Points" and "Credit Breakdown" (or just show key points).
    *   Add a tooltip or popover to show expiration dates.
    *   Format timestamps.

I will start by updating the backend service to return the credit data.
