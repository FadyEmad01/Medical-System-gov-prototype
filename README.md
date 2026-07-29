# Feature-Based Architecture

A Next.js 16 application built with a strict **feature-based architecture** that communicates with a separate backend via API. This document is the single source of truth for every developer working on this project.

---

## Tech Stack

| Category | Technology | Details |
|----------|-----------|---------|
| **Framework** | Next.js 16 | App Router + React Compiler |
| **React** | React 19 | Server Components by default |
| **Language** | TypeScript 5 | Strict mode |
| **API Layer** | Native fetch + TanStack Query | Server Components: native `fetch`; Client Components: TanStack Query |
| **Styling** | Tailwind CSS v4 | `@tailwindcss/postcss` |
| **UI Components** | shadcn/ui | Radix primitives + CVA |
| **State Management** | TanStack Query + Zustand | See State Taxonomy below |
| **Linting/Formatting** | Biome | Replaces ESLint + Prettier |
| **Animation** | tw-animate-css | Tailwind animation utilities |
| **Class Utilities** | clsx + tailwind-merge | Combined via `cn()` helper |
| **Internationalization** | next-intl | ICU message syntax, per-feature translations, locale-based routing |

---

## Architectural Philosophy: Feature-Based Design

### The "Delete Test"

Every business domain lives in `src/features/[feature-name]`. **If a feature folder is deleted, the app must compile without errors** (aside from the routing entry point that references it). This enforces true feature independence and prevents hidden coupling between domains.

### The "Rule of Two" (No Premature Abstractions)

Code only moves to the global `src/components/` or `src/lib/` directories **if it is actively used by at least two distinct features**. Minor duplication across features is preferred over premature abstraction. Keep code local to the feature until a global need is proven.

### No Barrel Files

**Rule:** Do not create `index.ts` barrel re-export files inside feature directories. Barrel files hurt performance — bundlers must read and process every re-exported module, slowing compilation, dev reloads, and production loads.

**Implementation:** Import directly from the source file path. Configure path aliases in your bundler for shorter imports if needed.

```tsx
// ❌ BAD — barrel import (slows bundler, hurts tree-shaking)
import { FeatureContainer } from '@/features/my-feature';

// ✅ GOOD — direct import (fast, tree-shakable)
import { FeatureContainer } from '@/features/my-feature/components/feature-container';
```

### Named React Imports

**Rule:** Always use named imports for React hooks and types. Never use `React.useState`, `React.useEffect`, etc. Named imports are shorter, keep component logic cleaner, and make dependencies explicit.

```tsx
// ❌ BAD — namespace access (longer, redundant)
import React from 'react';
const [count, setCount] = React.useState(0);

// ✅ GOOD — named imports (concise, explicit)
import { useState } from 'react';
const [count, setCount] = useState(0);
```

Barrel files are acceptable only in **published packages/libraries** where a clean public API is needed for external consumers.

---

## Directory Structure

```text
src/
├── app/                      # ROUTING LAYER (Strictly thin — no business logic)
│   ├── layout.tsx            # Root layout (minimal — metadata + children pass-through)
│   └── [locale]/             # Dynamic locale segment (redirects handled by proxy)
│       ├── layout.tsx        # Locale-aware root layout (fonts, html lang, dir, RTL, i18n)
│       ├── (dashboard)/      # Authenticated routes
│       ├── (public)/         # Public routes
│       │   ├── layout.tsx    # Public layout wrapper
│       │   ├── (landing)/    # Landing/home page route group
│       │   └── auth/         # Public auth routes (sign-in, sign-up)
│       └── page.tsx          # Localized home page
│
├── i18n/                     # INTERNATIONALIZATION CONFIGURATION
│   ├── routing.ts            # Locales definition, default locale, prefix strategy
│   ├── request.ts            # Loads per-feature translations, validates locale
│   └── navigation.ts         # Locale-aware Link, redirect, usePathname, useRouter
│
├── components/               # SHARED DESIGN SYSTEM (Domain-agnostic UI only)
│   ├── background/           # Ambient visual layers (e.g., NoiseOverlay)
│   └── ui/                   # shadcn/ui components (Button, Card, etc.)
│
├── features/                 # BUSINESS DOMAINS (80–90% of app code)
│   ├── auth/                 # Registration & Login
│   │   ├── translations/     # Per-feature translation files
│   │   │   ├── ar.json       # Arabic translations
│   │   │   └── en.json       # English translations
│   │   ├── components/
│   │   │   ├── login-form.tsx
│   │   │   ├── register-form.tsx
│   │   │   └── otp-verify.tsx
│   │   ├── hooks/
│   │   │   ├── use-auth.ts
│   │   │   └── use-session.ts
│   │   └── api/
│   │       ├── login.ts
│   │       ├── register.ts
│   │       └── verify-otp.ts
│   │
│   ├── patients/             # Patient Profiles & Search
│   │   ├── translations/
│   │   │   ├── ar.json
│   │   │   └── en.json
│   │   ├── components/
│   │   │   ├── patient-profile.tsx
│   │   │   ├── patient-form.tsx
│   │   │   ├── patient-search.tsx
│   │   │   ├── patient-card.tsx
│   │   │   ├── medical-summary.tsx
│   │   │   ├── medical-history.tsx
│   │   │   └── emergency-contact.tsx
│   │   ├── hooks/
│   │   │   ├── use-patient.ts
│   │   │   ├── use-patient-search.ts
│   │   │   └── use-medical-history.ts
│   │   └── api/
│   │       ├── get-patient.ts
│   │       ├── search-patients.ts
│   │       ├── create-patient.ts
│   │       └── update-patient.ts
│   │
│   ├── visits/               # Consultation Flow
│   │   ├── translations/
│   │   │   ├── ar.json
│   │   │   └── en.json
│   │   ├── components/
│   │   │   ├── visit-list.tsx
│   │   │   ├── visit-form.tsx
│   │   │   ├── visit-detail.tsx
│   │   │   ├── chief-complaint.tsx
│   │   │   ├── symptoms-section.tsx
│   │   │   ├── vital-signs.tsx
│   │   │   ├── examination-section.tsx
│   │   │   ├── diagnosis-section.tsx
│   │   │   ├── visit-summary.tsx
│   │   │   └── follow-up-section.tsx
│   │   ├── hooks/
│   │   │   ├── use-visit.ts
│   │   │   ├── use-visits.ts
│   │   │   └── use-visit-summary.ts
│   │   └── api/
│   │       ├── create-visit.ts
│   │       ├── get-visit.ts
│   │       ├── close-visit.ts
│   │       └── update-visit.ts
│   │
│   ├── prescriptions/        # Medicine Prescriptions
│   │   ├── translations/
│   │   │   ├── ar.json
│   │   │   └── en.json
│   │   ├── components/
│   │   │   ├── prescription-list.tsx
│   │   │   ├── prescription-form.tsx
│   │   │   └── medicine-select.tsx
│   │   ├── hooks/
│   │   │   ├── use-prescription.ts
│   │   │   └── use-prescriptions.ts
│   │   └── api/
│   │       ├── create-prescription.ts
│   │       └── get-prescriptions.ts
│   │
│   ├── lab-requests/         # Lab Test Orders
│   │   ├── translations/
│   │   │   ├── ar.json
│   │   │   └── en.json
│   │   ├── components/
│   │   │   ├── lab-request-list.tsx
│   │   │   ├── lab-request-form.tsx
│   │   │   └── test-select.tsx
│   │   ├── hooks/
│   │   │   ├── use-lab-request.ts
│   │   │   └── use-lab-requests.ts
│   │   └── api/
│   │       ├── create-lab-request.ts
│   │       └── get-lab-requests.ts
│   │
│   └── radiology/            # Imaging Requests
│       ├── translations/
│       │   ├── ar.json
│       │   └── en.json
│       ├── components/
│       │   ├── imaging-request-list.tsx
│       │   ├── imaging-request-form.tsx
│       │   └── imaging-type-select.tsx
│       ├── hooks/
│       │   ├── use-imaging-request.ts
│       │   └── use-imaging-requests.ts
│       └── api/
│           ├── create-imaging-request.ts
│           └── get-imaging-requests.ts
│
├── lib/                      # UTILITIES
│   └── utils.ts              # cn() helper (clsx + tailwind-merge)
│
├── styles/                   # CSS (Tailwind v4 theme + custom properties)
│   └── globals.css
│
├── proxy.ts                  # Next.js 16 proxy — locale detection, redirection
│                              # (uses next-intl middleware; handles root / → /ar)
```

---

## Routing, Data Fetching & Caching

### The "Thin App" Rule

Route files (`page.tsx`) in `src/app/` must be **whisper-thin**. They only handle:

- URL params and search params
- `Metadata` / OpenGraph generation
- Rendering the feature's parent component wrapped in `<Suspense>`

```tsx
// ❌ BAD — business logic in a route file
export default function Page() {
  const { data } = useQuery(...);
  return <div>Complex UI Logic Here</div>;
}

// ✅ GOOD — delegate immediately to the feature
import { FeatureContainer } from '@/features/my-feature/components/feature-container';

export default function Page() {
  return <FeatureContainer />;
}
```

### Data Fetching

- **Initial data fetching** happens in React Server Components inside the feature directory using native `fetch`.
- **Client-side fetching & mutations** use TanStack Query co-located in the feature's `hooks/` and `api/` folders.
- The backend API base URL should be defined in a single place (e.g., env var `NEXT_PUBLIC_API_URL`).

### Caching & Revalidation Strategy

#### `revalidateTag` (Recommended)

Selectively purge specific cached data across **all pages** simultaneously. Next.js recommends this over `revalidatePath` because it is more precise and avoids unnecessary page re-renders.

- **Scope:** Targets data assigned to a custom tag via `fetch(..., { next: { tags: ['...'] } })`
- **Use when:** A piece of data (posts, profiles, listings) is shared across multiple pages. Revalidating the tag updates that data universally.

```ts
import { revalidateTag } from 'next/cache';

revalidateTag('latest-posts');
```

#### `revalidatePath`

Clear the cache for an **entire page or layout**.

- **Scope:** Targets a specific URL path (e.g., `/dashboard`)
- **Use when:** A user action modifies the UI of a particular page and you need to guarantee fresh data on next visit.

```ts
import { revalidatePath } from 'next/cache';

revalidatePath('/dashboard');
```

---

## State Management Taxonomy

Choose the correct tool based on this strict hierarchy. **No Redux.**

| Priority | State Type | Tool | Location |
|----------|-----------|------|----------|
| 1 | **Server State** (API data) | TanStack Query (React Query) | Feature `hooks/` |
| 2 | **UI Filters, Sorting, Pagination** | URL Search Parameters | `useSearchParams` in components |
| 3 | **Local Component UI** (toggles, inputs) | `useState` / `useReducer` | Closest relevant component |
| 4 | **Shared Feature UI State** | Zustand | Feature-scoped stores in `hooks/` |

### Rules

- **Never** sync server data into global client stores.
- **Zustand stores** must be small, feature-scoped, and live inside the feature's `hooks/` directory. Avoid global monolithic stores.
- **URL params** are the default for any state that affects what data is displayed (filters, pagination, search queries).

---

## Styling & Tooling

### Tailwind CSS v4

Standard utility classes. Custom fonts (Geist, Inter) are loaded via `next/font/google` in the locale layout and applied as CSS variables. The project uses:

- **Animations:** `tw-animate-css` for pre-built animation utilities

### Biome

Replaces ESLint + Prettier. Commands:

```bash
npm run lint      # biome check
npm run format    # biome format --write
```

## Internationalization

Uses [next-intl](https://next-intl.dev) with **locale-based routing** (sub-path prefix).

### Locales

| Locale | Code | Direction |
|--------|------|-----------|
| Arabic | `ar` | RTL (right-to-left) |
| English | `en` | LTR (left-to-right) |

Default locale is **Arabic** (`ar`). Users are automatically redirected to `/ar` or `/en` based on their browser's `Accept-Language` header.

### Per-Feature Translations

Each feature owns its translation files in `translations/{ar,en}.json`. This preserves the **Delete Test** — removing a feature removes its translations without affecting other features. The central registry `src/i18n/request.ts` imports all feature translations at request time:

```ts
// src/i18n/request.ts — loads translations from all features
export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale ?? 'ar'

  const [auth, patients, visits, prescriptions, labRequests, radiology] =
    await Promise.all([
      import(`../features/auth/translations/${locale}.json`),
      import(`../features/patients/translations/${locale}.json`),
      import(`../features/visits/translations/${locale}.json`),
      import(`../features/prescriptions/translations/${locale}.json`),
      import(`../features/lab-requests/translations/${locale}.json`),
      import(`../features/radiology/translations/${locale}.json`),
    ])

  return {
    locale,
    messages: { auth, patients, visits, prescriptions, labRequests, radiology },
  }
})
```

### Usage

**Server Components** — use the async `getTranslations`:

```tsx
import { getTranslations, setRequestLocale } from 'next-intl/server';

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('auth');
  return <h1>{t('login')}</h1>;
}
```

**Client Components** — use the `useTranslations` hook:

```tsx
'use client';
import { useTranslations } from 'next-intl';

export function LoginButton() {
  const t = useTranslations('auth');
  return <button>{t('login')}</button>;
}
```

### Adding a New Feature

1. Create the feature folder with `components/`, `hooks/`, `api/`, and `translations/`
2. Add `ar.json` and `en.json` files inside `translations/`
3. Add one import line in `src/i18n/request.ts` to register the translations

### Adding a New Locale

1. Add the locale code to `src/i18n/routing.ts`
2. Add `translations/{locale}.json` to every feature
3. (Optional) Add to `rtlLocales` in `[locale]/layout.tsx` if RTL

---

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your backend API URL

# Run development server
npm run dev

# Open in browser
# http://localhost:3000
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run Biome linter |
| `npm run format` | Format code with Biome |
