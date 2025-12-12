I have investigated the issue where the Credit Overview `td` element in the Admin Page (`AdminPage.tsx`) displays as empty (or `-`). 

**Diagnosis:**
1.  **Frontend Logic:** The code conditionally renders the credit details only if `org.credit_balance` is present. If missing, it renders a `-`. The user likely sees this `-` or a blank space and interprets it as "empty/broken".
2.  **Backend Logic:** The `OrganizationService` is designed to populate `credit_balance`. If it's missing, it implies the backend server might be running an older version of the code (not reloaded) or there is a silent failure in fetching/creating the credit balance.
3.  **Safety:** The frontend rendering `org.credit_balance.total_points.toLocaleString()` is risky if `total_points` is undefined, which could cause a crash, though the presence of `-` suggests it's just falling through the check.

**Plan:**
1.  **Enhance AdminPage.tsx:**
    -   Add robust null-checking for `credit_balance` and `total_points`.
    -   Add a tooltip or explicit "No Data" state instead of just `-` to make it clear.
    -   Add `console.log` to debug the incoming `tenants` data to verify if `credit_balance` is arriving from the API.
2.  **Trigger Backend Reload:**
    -   Add a log message to `apps/server/main.py` and `apps/server/services/organization_service.py` to force the development server (uvicorn) to reload and ensure the latest code is active.
3.  **Verify Data Flow:**
    -   The backend `get_organizations` method will be touched to ensure it correctly lazy-initializes credit balances for all returned organizations.

This approach addresses the root cause (potential stale backend state) and improves frontend resilience.
