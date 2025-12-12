I have analyzed the current system and the requirements. The system already has a basic separation (Frontend React + Backend FastAPI), but the backend logic is tightly coupled in `main.py`, and the frontend lacks a unified HTTP client with error handling. The database access is also direct via SQLAlchemy sessions in controllers.

I will implement the following plan to achieve the requested decoupling and architecture improvements:

### Phase 1: Backend Architecture Refactoring (Decoupling)

1.  **Create Repository Layer (`apps/server/repositories/`)**:
    -   Define `BaseRepository` interface (Abstract Base Class) for pluggable adapters.
    -   Implement `OrganizationRepository` using SQLAlchemy.
    -   This isolates database logic from business logic.

2.  **Create Service Layer (`apps/server/services/`)**:
    -   Create `OrganizationService` to handle business logic (CRUD, validation, error handling).
    -   Move logic from `main.py` (e.g., `create_org`, `get_all_orgs`) into this service.
    -   Inject `OrganizationRepository` into `OrganizationService`.

3.  **Refactor `main.py`**:
    -   Remove direct DB queries.
    -   Use `OrganizationService` in route handlers.
    -   Ensure `database.py` reads from environment variables (already does, but will verify/enhance).

### Phase 2: Frontend Architecture Refactoring

1.  **Create Unified HTTP Client (`apps/web/src/lib/httpClient.ts`)**:
    -   Wrap `axios` (already used in `api.ts`) or `fetch`.
    -   Add **Interceptors** for:
        -   Global Error Handling (logging, user notifications).
        -   Request/Response formatting.
        -   Simple Retry logic (as requested).

2.  **Update `api.ts`**:
    -   Refactor `apps/web/src/services/api.ts` to use `httpClient.ts`.
    -   Ensure all direct API calls in `TenantContext.tsx` are moved to `api.ts` (currently `TenantContext` uses `fetch` directly for some calls).

3.  **Refactor `TenantContext.tsx`**:
    -   Replace direct `fetch` calls with `api.ts` functions.
    -   Remove local error string parsing logic (delegate to global handler or simplified catch).

### Phase 3: Testing & Verification

1.  **Backend Tests**:
    -   Create `tests/test_architecture.py` to verify the Service -> Repository flow.
2.  **Verification**:
    -   Restart server.
    -   Verify Admin Page functionality (CRUD) works with the new architecture.

This plan ensures a clean separation of concerns:
-   **Controller**: HTTP req/res.
-   **Service**: Business Logic.
-   **Repository**: Data Access (Pluggable).
-   **Frontend API**: Unified access point.

I will start by creating the backend directory structure and the repository layer.
