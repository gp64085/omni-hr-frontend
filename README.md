# ⚡ OmniHR Frontend — Modern Next.js 16 Web Application

The frontend client for **OmniHR** built with Next.js 16 (Turbopack), React 19, TypeScript, TailwindCSS, and Zustand.

---

## 🌟 Highlights

- **Aesthetic Glassmorphism Design**: Custom dark-mode UI tokens with sleek gradient accents and micro-animations.
- **Modular Form Architecture**: Dedicated `forms/` folders within every feature module, cleanly separating form validation, state, and submissions from modal wrappers and pages.
- **Enterprise Auth & Account Recovery**: Comprehensive authentication flow including login, anti-enumeration forgot-password request, and single-use password reset with token verification.
- **Third-Party Integrations & AI Engine**: Dedicated generic configuration dashboard (`/integrations`) for managing Slack and Groq AI credentials, testing live connectivity, viewing webhook endpoints, and dynamically adding custom credential fields.
- **Unified Monthly Workspace Calendar**: Rich interactive calendar featuring multi-layer badge overlays (Holidays, Leaves, Timesheets) and date inspector modals.
- **Custom UI Components**:
  - `<DatePicker />`: Glassmorphic date popover with month/year navigation and quick presets.
  - `<TimeSelect />`: Work hours duration selector with standard presets (`1h`, `2h`, `4h Half-Day`, `8h Full-Day`).
  - `<DataTable<T> />`: Generic, strongly-typed data table with loading skeleton, pagination controls, and empty states.
  - `<ConfirmDialog />`: Production confirmation dialogs replacing browser native alerts.
  - `<StatusBadge />`: Adaptive status pill supporting all domain statuses.
  - `<FilterBar />`: Search & categorical filter toolbar.
- **Granular RBAC Guarding**: Automatically adapts UI elements, tabs, and action buttons based on user permissions.
- **Zustand State Management**: Reactive auth state persistence and permission validation helpers (`hasPermission`).

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy the environment template from `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

---

## 🛠️ Available Scripts

| Script                  | Command                | Purpose                                        |
| :---------------------- | :--------------------- | :--------------------------------------------- |
| **`npm run dev`**       | `next dev --turbopack` | Starts local development server with Turbopack |
| **`npm run build`**     | `next build`           | Creates optimized production build             |
| **`npm run start`**     | `next start`           | Starts production server                       |
| **`npm run lint`**      | `eslint`               | Runs ESLint 9 code quality check               |
| **`npm run lint:fix`**  | `eslint --fix`         | Automatically fixes autofixable lint issues    |
| **`npm run typecheck`** | `tsc --noEmit`         | Runs full TypeScript compiler type check       |

---

## 📂 Source Code Structure

```
frontend/src/
├── app/                      # App router route handlers & lightweight pages
│   ├── layout.tsx            # Global RootLayout with ToastProvider & Providers
│   ├── page.tsx              # Landing / Redirection
│   ├── login/                # Authentication page
│   ├── forgot-password/      # Self-service password recovery request
│   ├── reset-password/       # Secure token-based password reset
│   ├── dashboard/            # Executive dashboard & month calendar
│   ├── leaves/               # Leaves portal, team approvals, company holidays
│   ├── timesheets/           # Timesheet logging & weekly manager reviews
│   ├── projects/             # Projects directory & CRUD modals
│   ├── employees/            # Employee directory & user management
│   ├── roles/                # RBAC roles & permissions matrix catalog
│   ├── audit-logs/           # System audit trail inspector
│   └── profile/              # Self-service employee profile
│
├── components/
│   ├── layout/               # AppShell, Navbar, Sidebar
│   ├── providers/            # ToastProvider, AuthProvider
│   └── ui/                   # Reusable atomic UI library (DatePicker, TimeSelect, Modal, etc.)
│
├── constants/                # Permissions, roles, routes, pagination, timesheets, calendar
├── features/                 # Domain modules (api, types, components, forms)
│   ├── audit/                # api, components, types
│   ├── auth/                 # api, components, forms (LoginForm, ForgotPasswordForm, ResetPasswordForm)
│   ├── dashboard/            # components, hooks, types
│   ├── leaves/               # api, components, forms (ApplyLeaveForm, CreateHolidayForm)
│   ├── projects/             # api, components, forms (CreateProjectForm, EditProjectForm)
│   ├── roles/                # api, components, forms (CreateRoleForm, EditRoleForm, CreatePermissionForm, EditPermissionForm)
│   ├── timesheets/           # api, components, forms (LogTimesheetForm), utils
│   └── users/                # api, components, forms (PersonalDetailsForm, BankingDetailsForm, CreateUserForm, EditUserForm)
│
├── lib/                      # api-client, date-utils, error-utils
├── store/                    # Zustand stores (use-auth-store)
└── types/                    # api.ts, user.ts
```
