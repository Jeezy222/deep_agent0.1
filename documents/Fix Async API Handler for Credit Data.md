Based on the diagnosis by the Fullstack Engineer agent, the issue is a simple **asynchronous handling error** in the backend `main.py`.

**The Problem:**
I defined `get_organizations` in the service as `async def`, but the route handler `get_all_orgs` in `main.py` was defined as a synchronous `def` and failed to `await` the service call. This resulted in the API returning a coroutine object instead of the data, or failing silently in a way that resulted in missing fields.

**The Fix:**
1.  **Modify `apps/server/main.py`**:
    *   Change `def get_all_orgs(...)` to `async def get_all_orgs(...)`.
    *   Add `await` before `service.get_organizations(...)`.
2.  **Restart Backend**: Ensure the changes take effect.

**Verification:**
After this change, the API will return the correct JSON structure including `credit_balance`, and the frontend will automatically render the data (0 or initial values) instead of "-".

I will apply this fix immediately.
