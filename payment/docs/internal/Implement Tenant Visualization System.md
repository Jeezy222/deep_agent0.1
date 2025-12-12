I will implement a **Tenant Visualization & Switching System** to demonstrate the multi-tenant architecture.

**Features:**
1.  **Tenant List**: A dropdown/panel showing all available organizations (tenants) in the system.
2.  **Quick Switch**: Click to instantly switch the active session to another tenant.
3.  **Status Overview**: See the Plan (Basic/Pro) and ID for each tenant at a glance.
4.  **Create New**: A "New Tenant" button to spawn a fresh organization.

**Implementation Steps:**
1.  **Backend**: Add `GET /api/v1/debug/orgs` to list all organizations (with their subscription plans).
2.  **Frontend**:
    -   Create `TenantSwitcher` component.
    -   Add API method `getAllOrgs`.
    -   Integrate the switcher into the Dashboard header.

**Outcome:**
You will be able to see all the "Demo Team" organizations you've created, verify their different subscription states (some Pro, some Basic), and switch between them seamlessly.