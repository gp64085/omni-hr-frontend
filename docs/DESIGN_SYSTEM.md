# Frontend Design System & Component Library

OmniHR features a sleek, dark-mode glassmorphic design system built with Tailwind CSS, HSL vibrant accent gradients, and micro-animations.

---

## 1. Color Palette & Dark Theme Tokens

- **Background**: `#0A0D14` (Deep obsidian dark background)
- **Glassmorphism Panels**: `bg-slate-900/60 border border-slate-800/90 backdrop-blur-xl`
- **Accent Gradients**: `bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500`
- **Typography**: System sans-serif with `text-slate-100` headings and `text-slate-400` body copy.

---

## 2. Reusable UI Primitives (`src/components/ui/`)

### 1. `Button` (`Button.tsx`)

Supports 4 variants (`gradient`, `primary`, `secondary`, `outline`), size controls, and an inline loading spinner.

```tsx
import { Button } from "@/components/ui/Button";

<Button variant="gradient" isLoading={false}>
  Submit Action
</Button>;
```

### 2. `Input` (`Input.tsx`)

Supports label, input type, left icon, and validation error messages.

```tsx
import { Input } from "@/components/ui/Input";
import { Mail } from "lucide-react";

<Input label="Email Address" type="email" icon={Mail} placeholder="you@company.com" />;
```

### 3. `Badge` (`Badge.tsx`)

Supports 5 color variants (`indigo`, `emerald`, `rose`, `purple`, `amber`).

```tsx
import { Badge } from "@/components/ui/Badge";

<Badge variant="indigo">Enterprise v1.0</Badge>;
```

### 4. `Alert` (`Alert.tsx`)

Supports 3 message variants (`error`, `success`, `info`).

```tsx
import { Alert } from "@/components/ui/Alert";

<Alert variant="error">Invalid email or password.</Alert>;
```

### 5. `Card` (`Card.tsx`)

Glassmorphism container card.

```tsx
import { Card } from "@/components/ui/Card";

<Card>
  <h2>Card Title</h2>
</Card>;
```

### 6. `PageLayout` (`PageLayout.tsx`)

Page shell with top Header, bottom Footer, and radial glow background.

```tsx
import { PageLayout } from "@/components/ui/PageLayout";

export default function MyPage() {
  return (
    <PageLayout>
      <h1>Page Content</h1>
    </PageLayout>
  );
}
```
