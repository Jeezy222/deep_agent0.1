I will fix the "Payment Failed" issue and the inability to return.

**Root Cause:**
The 404 error occurs because the `org_id` in your current browser URL is likely stale (from a previous session), but the backend database has been reset (e.g., via `init-demo-data`), so that Organization ID no longer exists.

**Proposed Changes:**
1.  **Improve Error Handling in `MockAlipayPage.tsx`**:
    -   Detect 404 errors specifically.
    -   Show a clear message: "订单已失效或会话过期 (Order expired or session invalid)".
    -   Automatically redirect to the Dashboard (`/`) or offer a clear button to go back.
2.  **Fix Navigation**:
    -   Change the "取消并返回" (Cancel and Return) button to navigate explicitly to `/` (Dashboard) to ensure the user doesn't get stuck in a loop or invalid history state.

**File to Modify:**
-   `apps/web/src/pages/MockAlipayPage.tsx`

This will ensure that even if the payment fails, you can easily return to the main dashboard to restart the flow with valid data.