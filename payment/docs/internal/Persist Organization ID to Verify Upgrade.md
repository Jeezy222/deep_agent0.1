I will fix the issue where the plan doesn't appear to upgrade by ensuring the Dashboard loads the *correct* organization.

**Root Cause:**
Currently, every time the Dashboard loads (including returning from the Success page), it calls `initDemo()`, which creates a **brand new** Organization with a default Basic plan. You are seeing this new organization instead of the one you just upgraded.

**Solution:**
I will modify `App.tsx` to persist the Organization ID in `localStorage`.
1.  On load, check if an `org_id` already exists in `localStorage`.
2.  If yes, load that organization's data (so you see your upgraded plan).
3.  Only create a new demo organization if no ID exists.

**Verification:**
After this fix, returning to the Dashboard will show the *same* organization you started with, correctly reflecting the "Pro" plan and 40,000 credit limit.