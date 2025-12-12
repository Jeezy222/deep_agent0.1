I will implement the backend support for the **Team Plan**, enabling dynamic billing and usage limits based on the number of seats.

**Implementation Plan:**

1.  **Database Schema Update**:
    -   Add `seats` column to the `Subscription` model to track team size.
    -   **Note**: This requires resetting the database (`test.db`), so previous demo data will be cleared.

2.  **Backend Logic Updates**:
    -   **Checkout**: Calculate price dynamically: `Seats * Unit Price` (e.g., 10 * $40 = $400).
    -   **Upgrade**: Save the number of seats when upgrading.
    -   **Usage Enforcement**: Update the limit check to multiply the base quota by the number of seats (e.g., 10 seats * 8,000 = 80,000 limit).

3.  **Frontend Integration**:
    -   Update `api.ts` and `CheckoutPage` to pass the `seats` parameter during the checkout and upgrade process.

**Outcome:**
The "Team Plan" upgrade will fully work. You can select 10 seats, pay the correct amount, and receive a proportionally higher usage limit (80,000 credits) that is strictly enforced.