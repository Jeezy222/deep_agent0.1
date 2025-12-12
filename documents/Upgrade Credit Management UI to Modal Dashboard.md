I will upgrade the existing credit detail view into a full-featured **Credit Management Modal** as requested.

**Plan:**

1.  **Refactor `CreditDetailCard.tsx`**:
    *   Convert it from a small popover to a **Modal with Backdrop**.
    *   Implement **Data Visualization**: Add a CSS-based "Donut Chart" to visualize the credit distribution.
    *   **Card Layout**: Display the 5 credit types in a responsive Grid layout (independent cards for each type).
    *   **Interaction**: Add click-outside-to-close (backdrop click) and smooth entry animations.

2.  **Update `AdminPage.tsx`**:
    *   Move the `CreditDetailCard` rendering **outside** the table structure to the top level of the page. This ensures the modal overlays the entire screen correctly without being clipped by the table's scroll container.
    *   Update the state logic to pass the full selected tenant object to the modal.

This approach satisfies all requirements: visual dashboard, modal interaction, detailed breakdown, and responsive design.
