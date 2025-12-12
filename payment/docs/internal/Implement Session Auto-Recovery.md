I will fix the console errors caused by stale session data after the database reset.

**Root Cause:**
The frontend is trying to load data for an Organization ID stored in your browser's `localStorage`, but that organization was deleted when we reset the database to add the Team Plan features. This results in 404 errors.

**Solution: Implement Auto-Recovery**
I will modify `App.tsx` to handle these 404 errors gracefully:
1.  **Detect 404**: When `loadUsage` fails, check if it's because the organization is missing.
2.  **Auto-Fix**: If missing, automatically clear the stale ID and generate a new valid session.
3.  **Refresh**: Reload the dashboard with the fresh data seamlessly.

**Verification:**
Once applied, simply refreshing the page (or even just waiting) will clear the errors and restore the dashboard to a working state automatically.