I have analyzed the request. The user wants to extend the tenant data model with detailed credit (points) management, implement real-time synchronization between the backend (port 8001) and the frontend (port 3000) using WebSocket, and visualize this data on the chat interface.

**Requirements Breakdown:**

1.  **Data Model Extension:**
    *   Add fields to `UsageRecord` or create a new `CreditBalance` model (more appropriate for balance tracking vs usage history).
    *   Fields: `monthly_points`, `daily_points`, `event_points`, `additional_points`, `free_points`.
    *   Expiration management: `expiration_date` for each type.

2.  **Real-time Synchronization (WebSocket):**
    *   Backend (FastAPI) needs to support WebSocket connections.
    *   Frontend (Next.js/React on port 3000) needs a WebSocket client.
    *   Trigger sync on data changes (likely via an event bus or direct notification in the service layer).

3.  **Frontend Display (Port 3000 - `chat.tsx`):**
    *   Display each point type independently.
    *   Highlight points expiring in < 24h.
    *   Smooth animations.

4.  **Technical Requirements:**
    *   JSON Schema validation (Pydantic models).
    *   Incremental updates.
    *   Unit tests.

**Architecture Decisions:**

*   **Model:** I will create a new `CreditBalance` table linked to `Organization`. This is cleaner than overloading `UsageRecord` which is typically an append-only log.
*   **WebSocket:** I will add a WebSocket endpoint to `main.py` (or a new router) that clients (port 3000) connect to.
*   **Event Mechanism:** I will add a simple in-memory event manager to broadcast updates to connected clients when `OrganizationService` modifies credits.

**Plan:**

1.  **Backend - Models & Schemas:**
    *   Modify `apps/server/models.py` to add `CreditBalance`.
    *   Modify `apps/server/schemas.py` to add `CreditBalance` Pydantic models with validation.
    *   Update database migration (create tables).

2.  **Backend - WebSocket & Service Logic:**
    *   Add `ConnectionManager` for WebSockets in `apps/server/services/socket_service.py`.
    *   Update `OrganizationService` to update `CreditBalance` and trigger WebSocket broadcasts.
    *   Add WebSocket route in `main.py`.

3.  **Frontend (Port 3000) - Integration:**
    *   Modify `deep main html/deep_agent0.1-main/frontend/src/pages/chat.tsx` (and potentially a new component) to connect to `ws://localhost:8001/ws/{org_id}`.
    *   Implement the UI to display the detailed points and handle updates.

4.  **Testing:**
    *   Create a test script `test_credits.py` to simulate credit updates and verify WebSocket messages (programmatically).

I will start by defining the backend models.
