I have identified the issue. The error `SyntaxError: The requested module ... does not provide an export named 'AxiosInstance'` occurs because `AxiosInstance` is a **type**, not a value, but I tried to import it as a named export in `httpClient.ts`. In some bundler/transpiler configurations (like Vite/ESBuild), mixing type and value imports can cause issues if not handled correctly, or if `axios`'s export structure is interpreted strictly.

However, the specific error usually means `axios` default export should be used, or types should be imported with `import type`.

In `apps/web/src/lib/httpClient.ts`, I wrote:
```typescript
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
```

I will fix this by separating the type imports to ensure the bundler treats them correctly.

**Plan:**
1.  **Modify `apps/web/src/lib/httpClient.ts`**:
    *   Change the import statement to explicitly separate type imports using `import type`.

**Verification:**
*   This is a compile-time/bundler-time fix. Once saved, the Vite dev server (running in terminal 9) should automatically reload and the error in the browser console should disappear.

Let's apply the fix.
