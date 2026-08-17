# Frontend Engineering Standards

Coding standards, UI architecture, and component discipline for the OmniHR Next.js frontend.

---

## 1. Core Principles & Discipline

### 1.1 SOLID Principles

- **SRP**: Presentation components handle UI rendering; Custom React hooks encapsulate form state, side effects, and API submissions; Dedicated API modules handle HTTP transport.
- **OCP**: UI primitives (`Button`, `Input`, `Badge`, `Alert`, `Card`) extend via props and variants without modifying core element markup.
- **ISP**: Component props and hook return contracts expose strictly required properties per component.

### 1.2 DRY & YAGNI

- Reuse atomic UI primitives in `src/components/ui/` (`Button`, `Input`, `Badge`, `Alert`, `Card`, `PageLayout`).
- Reuse custom hooks (`useAuthForm`) for feature state and validation.

### 1.3 Feature Slice Directory Architecture

- Group code into feature slices under `src/features/{auth, users, leaves, payroll}` containing dedicated `components/`, `hooks/`, `api/`, and `types/`.

### 1.4 Prohibition of Inline Types

- All TypeScript types and interfaces MUST be declared in dedicated type files (`types/*.ts` or `features/*/types/*.ts`). Zero inline type definitions.

### 1.5 Expressive Naming Standard

- Use self-descriptive names for variables, parameters, props, and functions (`selectedEmailAddress`, `isLoginModeActive`, `handleFormSubmit`). Cryptic single-letter or abbreviated names are strictly forbidden.

---

## 2. Technology Stack

- **Core**: Next.js 16 (App Router), React 19, TypeScript (Strict Mode `"strict": true`).
- **Styling**: Tailwind CSS with HSL dark mode tokens and glassmorphism.
- **State Management**: Zustand for global auth state; custom React hooks for component state.
