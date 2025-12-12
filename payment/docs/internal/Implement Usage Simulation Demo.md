I will add a "Simulate AI Request" button to the Dashboard to demonstrate the metering system in action.

**Implementation Steps:**

1.  **Update `apps/web/src/services/api.ts`**:
    -   Add `simulateAiRequest(orgId: string, prompt: string)` function to call the backend `/api/v1/ai/proxy` endpoint.

2.  **Update `apps/web/src/App.tsx`**:
    -   Add a "Simulate AI Task" button to the Dashboard UI.
    -   Implement the handler to call the simulation API and then refresh usage stats.
    -   Add a visual indicator (loading state) during the simulation.

**Outcome:**
You will be able to click a button on the dashboard to "spend" tokens and immediately see the usage bar update, verifying the billing system's core value proposition (usage-based metering).