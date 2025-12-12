I will optimize the `AdminPage` to meet the requirements. Since no charting library is installed, I will use CSS-based visualizations (progress bars/segments) for the "History/Trend" requirement (interpreting it as composition analysis or simple visual trends).

**Plan:**

1.  **Create `CreditDetailPopover` Component:**
    *   Since I don't want to install new dependencies, I'll build a custom Popover/Card using `fixed` positioning or a modal-like behavior that triggers on click.
    *   It will display:
        *   Total Points (Large).
        *   Breakdown: Monthly, Daily, Event, Additional, Free.
        *   Expiration dates for each.
        *   Visual bars indicating proportion.

2.  **Update `AdminPage.tsx`:**
    *   **Header Section:** Add a "System Overview" card at the top displaying:
        *   Total Points across all loaded tenants.
        *   "Live" indicator with "Last updated" timestamp.
    *   **Table Column:**
        *   Replace the simple text with a clickable `CreditDetailPopover` trigger.
        *   Use a "Badge" style for the main number.

3.  **Performance:**
    *   The `TenantContext` already polls. I will add a local state for `lastUpdated` timestamp in `AdminPage` that updates whenever `tenants` changes.

4.  **Files to Create/Edit:**
    *   Create `apps/web/src/components/CreditDetailCard.tsx`.
    *   Edit `apps/web/src/pages/AdminPage.tsx`.

Let's implement.
