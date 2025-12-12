I have analyzed the logs and the code. The user is reporting a `Subscription not found` error, which happens when the frontend tries to load usage data for an organization that exists but doesn't have a valid subscription, or the organization ID stored in `localStorage` is invalid/stale.

**1. Log Analysis:**
*   **Error:** `API Error: Subscription not found`
*   **Location:** `httpClient.ts`, `App.tsx` (loadUsage), `PricingModal.tsx` (loadData).
*   **Cause:** The backend returns a 404 for `/api/v1/orgs/{orgId}/subscription` or `/api/v1/orgs/{orgId}/usage/current`.
*   **Context:** `App.tsx` has logic to auto-recover if the *Organization* is not found (status 404), but it doesn't seem to handle the case where the *Organization* exists but the *Subscription* is missing, or if the specific error message "Subscription not found" needs distinct handling.

**2. Database Connection Task:**
The user also asked to "implement button with database connection". In the context of the previous request (architecture refactoring), this likely means verifying the "Initialize Demo Data" or "Create Tenant" buttons actually persist to the DB via the new service layer. Since I've already refactored the backend to use `OrganizationService` and `OrganizationRepository`, the "database connection" is technically established via SQLAlchemy.

**Plan:**

1.  **Fix "Subscription Not Found" Error in `App.tsx`**:
    *   Enhance the `catch` block in `loadUsage`.
    *   If the error indicates "Subscription not found" (which might also be a 404), treat it similarly to "Organization not found" by clearing the stale `org_id` and re-initializing. This ensures the user isn't stuck in a broken state.

2.  **Verify Database Connection (Button Functionality)**:
    *   The "Create New Tenant" button in `TenantSwitcher` and the "Initialize Demo Data" button in `AdminPage` already call the API.
    *   I will ensure `App.tsx` properly handles the re-initialization flow so that clicking "Create New Tenant" (which calls `initDemo`) correctly updates the UI without errors.

Let's start by improving the error handling in `App.tsx` to resolve the immediate console errors.
