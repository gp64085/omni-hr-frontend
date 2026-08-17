# API Contract & Specification: OmniHR

## 1. General Conventions

- **Base URL:** `/api/v1`
- **Authentication Header:** `Authorization: Bearer <JWT_TOKEN>`
- **Standard Response Format (Success):**
  ```json
  {
    "success": true,
    "data": { ... },
    "error": null,
    "meta": {
      "page": 1,
      "limit": 20,
      "total": 100
    }
  }
  ```
- **Standard Error Format:**
  ```json
  {
    "success": false,
    "data": null,
    "error": {
      "code": "OVERLAPPING_LEAVE_REQUEST",
      "message": "Leave request overlaps with an existing pending or approved leave.",
      "details": { "conflicting_request_id": "uuid-here" }
    }
  }
  ```

## 2. HTTP Status Codes & Error Taxonomy

| HTTP Code           | Error Code                                | Description                                                            |
| ------------------- | ----------------------------------------- | ---------------------------------------------------------------------- |
| `400 Bad Request`   | `INVALID_INPUT` / `DATE_MISMATCH`         | Malformed parameters or invalid date ranges (`end_date < start_date`). |
| `401 Unauthorized`  | `UNAUTHORIZED` / `TOKEN_EXPIRED`          | Missing, expired, or revoked JWT token.                                |
| `403 Forbidden`     | `FORBIDDEN` / `INSUFFICIENT_PERMISSIONS`  | Authenticated user lacks required role/permissions for operation.      |
| `404 Not Found`     | `RESOURCE_NOT_FOUND`                      | User, leave request, or pay run ID does not exist.                     |
| `409 Conflict`      | `OVERLAPPING_LEAVE` / `DUPLICATE_PAY_RUN` | Overlapping leave application or duplicate monthly pay run.            |
| `422 Unprocessable` | `INSUFFICIENT_LEAVE_BALANCE`              | Requested days exceed remaining allocated leave balance.               |
| `500 Server Error`  | `INTERNAL_SERVER_ERROR`                   | Unexpected server fault or database execution failure.                 |

## 3. Detailed Endpoint Specs

### 3.1 Authentication & Profile

- `POST /api/v1/auth/login` - Authenticate with email/password & return JWT access + refresh tokens.
- `POST /api/v1/auth/refresh` - Rotate refresh token to obtain a new access token.
- `POST /api/v1/auth/logout` - Revoke current refresh token and invalidate session.
- `GET /api/v1/auth/me` - Validate session and fetch current authenticated user profile context.

### 3.2 Roles & Permissions Management (RBAC)

- `GET /api/v1/roles` - Searchable, paginated roles list (`page`, `limit`, `search`) returning role metadata and `permission_ids` array.
- `POST /api/v1/roles` - Create a new custom role with assigned permission IDs (Super Admin only).
- `GET /api/v1/roles/{role_id}` - Get detailed role specifications and permission IDs.
- `GET /api/v1/roles/{role_id}/permissions` - Dedicated endpoint to fetch full permissions list for a specific role.
- `PUT /api/v1/roles/{role_id}` - Update role metadata and permissions list (Super Admin only).
- `DELETE /api/v1/roles/{role_id}` - Delete custom role (Protected against deleting system roles or roles in use).
- `GET /api/v1/permissions` - Searchable, paginated system permissions list (`page`, `limit`, `search`, `module`).
- `POST /api/v1/permissions` - Register new system permission code (Super Admin only).

### 3.3 User & Profile Management

- `GET /api/v1/users/me` - Fetch current user's full account record (`department`, `designation`, `role`, `manager`).
- `GET /api/v1/users/me/profile` - Fetch self-service profile details (phone, bank, emergency contacts).
- `PUT /api/v1/users/me/profile` - Update allowed self-service profile fields.
- `GET /api/v1/users` - Searchable, paginated user list with filters by `department_id`, `role_id`, or `role_name`.
- `POST /api/v1/users` - Create user account with optional `role_id` (enforces Super Admin role assignment restriction).
- `GET /api/v1/users/{user_id}` - Fetch single user record by ID.
- `PUT /api/v1/users/{user_id}` - Update user account metadata, role, or active status.
- `DELETE /api/v1/users/{user_id}` - Delete user account (prevents self-deletion).

### 3.4 Leaves & Accruals Module

- `GET /api/v1/leaves/types` - Get available leave types (Casual, Sick, Earned, Unpaid).
- `GET /api/v1/leaves/balance` - Get leave allocations, calculated remaining balances, and comp-off credits.
- `POST /api/v1/leaves/requests` - Submit leave request (Calculates working days excluding weekends/holidays, checks balance & overlapping requests).
- `GET /api/v1/leaves/requests` - List leave requests (filterable by status, date range, and user_id).
- `PATCH /api/v1/leaves/requests/{id}/status` - Approve or reject leave request (Manager/HR approval workflow).
- `DELETE /api/v1/leaves/requests/{id}` - Cancel pending or upcoming leave request (Restores quota if previously approved).
- `POST /api/v1/leaves/policies` - Configure role-based periodic accrual policy (`monthly`, `quarterly`, `half_yearly`, `yearly`, `manual`).
- `GET /api/v1/leaves/policies` - List active accrual policy configurations.
- `POST /api/v1/leaves/allocations/grant` - Manually grant/credit leave days to a user.
- `POST /api/v1/leaves/accruals/run` - Trigger periodic accrual engine on-demand.
- `GET /api/v1/leaves/audit-logs` - Fetch audit log trail for leave accruals, manual grants, and policy changes.

### 3.5 Company Holidays Calendar

- `GET /api/v1/holidays` - Fetch company holiday calendar for specified year.
- `POST /api/v1/holidays` - Add company holiday (HR Manager / Admin only).
