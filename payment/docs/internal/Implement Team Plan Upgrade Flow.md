I will implement the **Team Plan** functionality triggered by the "获取团队版" button.

**Implementation Plan:**

1.  **Create `TeamUpgradeModal` Component**:
    -   Replicate the "Team (Beta)" modal UI from the screenshot.
    -   **Features**:
        -   Billing cycle toggle (Monthly: $40/seat, Yearly: $400/seat).
        -   Seat counter (min 2, default 10).
        -   Real-time calculation of Total Credits (8,000 * seats) and Total Price.
    -   **Actions**:
        -   "Upgrade": Initiates a checkout session for the Team Plan.
        -   "Contact Sales": Opens the Sales Inquiry modal.

2.  **Create `ContactSalesModal` Component**:
    -   Replicate the Sales Inquiry form.
    -   Fields: Name, Work Email, Phone, Company Size, Usage Plan.
    -   Action: "Send Request" (Mock submission).

3.  **Integrate with `PricingModal`**:
    -   Add `onClick` handler to the "获取团队版" button to open `TeamUpgradeModal`.

**Outcome:**
Clicking "获取团队版" will open a functional interactive modal to configure and purchase a Team Plan, or contact sales.