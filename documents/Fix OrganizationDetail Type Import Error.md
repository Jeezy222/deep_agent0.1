It seems we are facing a similar issue again: `OrganizationDetail` is an `interface` (a TypeScript type), but `TenantContext.tsx` is likely trying to import it as a value, or `api.ts` is not exporting it in a way that the bundler likes when mixed with value imports.

**The Issue:**
In `apps/web/src/contexts/TenantContext.tsx`:
```typescript
import { getOrgs, ..., OrganizationDetail } from '../services/api';
```

If `OrganizationDetail` is only used as a type, it should be imported using `import type` or destructured in a type-only import to avoid runtime errors where the bundler looks for a JavaScript value named `OrganizationDetail`.

**Plan:**

1.  **Modify `apps/web/src/contexts/TenantContext.tsx`**:
    *   Separate the imports from `../services/api`.
    *   Import values (`getOrgs`, `createOrg`, etc.) in one statement.
    *   Import types (`OrganizationDetail`) in a separate `import type` statement.

This pattern is safer for modern bundlers (like Vite) that compile files in isolation.

Let's fix it.
