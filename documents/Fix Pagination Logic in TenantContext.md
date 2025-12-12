I have identified the cause of the "Next Page" button failure.

**The Issue:**
In `apps/web/src/contexts/TenantContext.tsx`, the `updateFilter` function contains a logic error. It is designed to reset the page to 1 whenever a filter changes (which is correct for search/status changes), but it **also** forces the page to 1 when you try to change the page number itself.

```typescript
// Current Code
const updateFilter = (key: string, value: any) => {
  // This overwrites any 'page' update with 'page: 1'
  setFilters(prev => ({ ...prev, [key]: value, page: 1 })); 
};
```

**The Fix:**
I will modify `updateFilter` to only reset the page number when the changed filter is *not* the page itself.

**Plan:**

1. **Edit** **`apps/web/src/contexts/TenantContext.tsx`**: Update the `updateFilter` function to conditionally reset `page`.
2. **Verify**: No additional server restarts are needed, as this is a frontend-only logic fix. The change will be reflected immediately in the running React app.

