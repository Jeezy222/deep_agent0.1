I have identified the issue. The error `TypeError: api.getAllOrgs is not a function` occurs because in my previous refactor of `api.ts`, I renamed `getAllOrgs` to `getOrgs` but forgot to update `apps/web/src/components/TenantSwitcher.tsx`.

The `TenantSwitcher.tsx` component is still trying to call the old `api.getAllOrgs` method, which no longer exists.

**Plan:**

1.  **Modify `apps/web/src/components/TenantSwitcher.tsx`**:
    *   Change the call `api.getAllOrgs()` to `api.getOrgs({ limit: 100 })`.
    *   The `getOrgs` method I added to `api.ts` accepts an optional params object, so passing `{ limit: 100 }` will replicate the previous behavior.

**Verification:**
*   This is a runtime fix. Once saved, the React app should reload, and the "Tenant Switcher" dropdown should work correctly again.

Let's apply the fix.
