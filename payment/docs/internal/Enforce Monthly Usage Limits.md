I will implement strict usage limit enforcement to ensure the system stops service when the quota is exceeded.

**Root Cause:**
The `ai_proxy` endpoint currently checks for a valid subscription but fails to check if the accumulated usage has exceeded the plan's monthly limit. It processes requests indefinitely regardless of the quota.

**Solution:**
I will modify the backend logic to enforce quotas:
1.  **Calculate Usage**: Before processing any AI request, query the total token usage for the organization.
2.  **Enforce Limit**: Compare the total usage against the plan's `monthly_credits`.
3.  **Reject Requests**: If the usage exceeds the limit, immediately reject the request with a `403 Forbidden` error and a specific message "Monthly usage limit exceeded".

**Verification:**
After this change, if you click "Simulate AI Request" while over the limit (e.g., 5240/4000), the request will fail, and you will receive an error message, confirming the billing enforcement is working.