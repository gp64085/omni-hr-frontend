# Frontend API Integration & Client Specifications

The frontend communicates with the backend API (`http://localhost:8000/api/v1`) using a centralized Axios HTTP client.

---

## 1. Centralized Axios Client (`src/lib/api-client.ts`)

- **Base URL**: Configured via `NEXT_PUBLIC_API_URL` environment variable in `.env.local`.
- **Authorization Interceptor**: Automatically attaches Bearer token header (`Authorization: Bearer <access_token>`) from `localStorage`.
- **Response Handling**: Unwraps backend standardized JSON response envelope `StandardResponse[T]`.

---

## 2. Feature API Modules

- **Auth API (`src/features/auth/api/auth-api.ts`)**:
  - `login(payload: LoginPayload)` $\rightarrow$ `POST /auth/login`
  - `register(payload: RegisterPayload)` $\rightarrow$ `POST /auth/register`
  - `getMe(token: string)` $\rightarrow$ `GET /auth/me`
  - `logout(refreshToken: string)` $\rightarrow$ `POST /auth/logout`

- **Users API (`src/features/users/api/users-api.ts`)**:
  - `getCurrentUser()` $\rightarrow$ `GET /users/me`
  - `getProfile()` $\rightarrow$ `GET /users/me/profile`
  - `updateProfile(payload: ProfileUpdatePayload)` $\rightarrow$ `PUT /users/me/profile`
  - `listUsers(params?: UserListParams)` $\rightarrow$ `GET /users` (paginated filters: `role_id`, `role_name`, `department_id`, `search`, `page`, `limit`)
  - `getUserById(id: string)` $\rightarrow$ `GET /users/{id}`
  - `updateUser(id: string, payload: UserUpdatePayload)` $\rightarrow$ `PUT /users/{id}`
  - `deleteUser(id: string)` $\rightarrow$ `DELETE /users/{id}`

- **Leaves & Accruals API (`src/features/leaves/api/leaves-api.ts`)**:
  - `getLeaveTypes()` $\rightarrow$ `GET /leaves/types`
  - `getLeaveBalance(year?: number)` $\rightarrow$ `GET /leaves/balance`
  - `applyLeave(payload: LeaveRequestCreatePayload)` $\rightarrow$ `POST /leaves/requests`
  - `listLeaveRequests(params?: LeaveRequestListParams)` $\rightarrow$ `GET /leaves/requests`
  - `updateLeaveStatus(id: string, payload: LeaveStatusUpdatePayload)` $\rightarrow$ `PATCH /leaves/requests/{id}/status`
  - `cancelLeave(id: string)` $\rightarrow$ `DELETE /leaves/requests/{id}`
  - `createAccrualPolicy(payload: LeaveAccrualPolicyCreatePayload)` $\rightarrow$ `POST /leaves/policies`
  - `listAccrualPolicies()` $\rightarrow$ `GET /leaves/policies`
  - `grantManualAllocation(payload: ManualAllocationGrantPayload)` $\rightarrow$ `POST /leaves/allocations/grant`
  - `runPeriodicAccruals(targetDate?: string)` $\rightarrow$ `POST /leaves/accruals/run`
  - `listHolidays(year?: number)` $\rightarrow$ `GET /holidays`
  - `createHoliday(payload: HolidayCreatePayload)` $\rightarrow$ `POST /holidays`

- **Roles & Permissions API (`src/features/roles/api/roles-api.ts`)**:
  - `listRoles(params?: RoleListParams)` $\rightarrow$ `GET /roles` (returns paginated `RoleRead[]` with `permission_ids: string[]`)
  - `getRole(roleId: string)` $\rightarrow$ `GET /roles/{role_id}`
  - `getRolePermissions(roleId: string)` $\rightarrow$ `GET /roles/{role_id}/permissions` (dedicated endpoint returning full `PermissionRead[]` for a role)
  - `createRole(payload: RoleCreatePayload)` $\rightarrow$ `POST /roles`
  - `updateRole(roleId: string, payload: RoleUpdatePayload)` $\rightarrow$ `PUT /roles/{role_id}`
  - `deleteRole(roleId: string)` $\rightarrow$ `DELETE /roles/{role_id}`
  - `listPermissions(params?: PermissionListParams)` $\rightarrow$ `GET /permissions` (returns paginated `PermissionRead[]` with `search` and `module` filters)
  - `createPermission(payload: PermissionCreatePayload)` $\rightarrow$ `POST /permissions`
