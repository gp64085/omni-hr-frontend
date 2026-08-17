# Frontend Architecture: OmniHR UI

Next.js 16 (App Router), React 19, TypeScript (Strict Mode), Zustand state management, and Tailwind CSS.

---

## 1. Directory Structure

```
frontend/
├── src/
│   ├── app/                            # App Router Routes (/, /login, /dashboard)
│   ├── components/
│   │   ├── layout/                     # Header, Footer
│   │   └── ui/                         # Atomic UI Primitives (Button, Input, Badge, Alert, Card, PageLayout)
│   ├── features/                       # Feature Slices (auth, users, leaves, payroll)
│   │   └── auth/                       # api, components, hooks, types
│   ├── store/                          # Zustand Global Auth Store
│   ├── types/                          # Centralized TypeScript Interfaces (user.ts)
│   └── lib/                            # Axios API Client with Bearer Interceptor
└── package.json
```

---

## 2. Architecture Principles

- **Zero Inline Types**: All types are declared in dedicated type files (`types/*.ts` or `features/*/types/*.ts`).
- **Atomic UI Primitives**: Reusable UI components in `components/ui/` have zero feature logic dependencies.
- **Custom Hooks for Logic**: Form state, validation, and API submissions are isolated from presentation JSX inside custom React hooks (`useAuthForm`).
- **Dedicated Route Pages**: Route pages (`/`, `/login`, `/dashboard`) serve strictly as composition containers.

---

## 3. Development Workflow

```bash
# Install dependencies
npm install

# Start Next.js development server
npm run dev

# Build production bundle
npm run build
```
