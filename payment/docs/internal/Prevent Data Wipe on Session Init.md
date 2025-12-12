I will fix the "Order Expired" persistence issue by making the backend less destructive.

**Root Cause:**
The current `init_demo_data` backend function deletes **ALL** database records every time it runs. When you return to the Dashboard, it runs again, wiping out the previous organization data. If there's any timing mismatch or if you try to use a link generated *before* the latest wipe, you get a 404.

**Solution:**
I will modify the backend to **stop deleting existing data** when initializing a demo session. Instead, it will simply create a *new* organization and user. This ensures that:
1.  Old sessions remain valid (no random 404s).
2.  The current session is guaranteed to exist.

**Files to Modify:**
-   `apps/server/main.py`: Remove the `db.query(...).delete()` lines from `init_demo_data`.

**Verification:**
After this change, you can refresh the page or navigate back and forth as much as you want without invalidating your active orders.