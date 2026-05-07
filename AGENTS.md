
<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Overview

This repository is a Next.js 16 + React 19 application scaffolded for production apps with Tailwind CSS v4, Shadcn with Radix UI, Tanstakc Query Query, Jotai

## Setup & Commands

- Install dependencies: `bun install`
- Start dev server (Turbopack, port 3001): `bun run dev`
- Build (production): `bun run build`

Notes:

- Package manager: bun (see `packageManager` in `package.json`).
- TypeScript strict mode is enabled.
- Pre-commit hooks run ESLint and Prettier via `lint-staged`.

## Tech Stack

- Next.js 16 (App Router), React 19
- UI foundations: Shadcn Radix UI primitives, motion (Framer Motion v12 API)
- State & data: React Query (@tanstack), Zustand
- Icons: `@egoist/tailwindcss-icons` with Iconify packs (lucide, mingcute, simple-icons)
- Notifications: `sonner`

## Project Structure

- `app/`
  - Next.js App Router entries (`layout.tsx`, `page.tsx`, errors, metadata). The root layout wires providers and global theme wrapper.
- `prisma/`
  - Schema Prisma, seed, and migrations
- `components/`
  - `layout/`: app and content layout
  - `common/`: general-purpose wrappers (providers composer, client-only helpers)
  - `ui/`: design-system components (button, dialog, select, input, form, tooltip, hover-card, sheet, etc.)
  - `widgets/`: higher-level, app-specific UI
- `src/providers/root/`
  - Composition of cross-cutting providers: Theme, React Query, Jotai, Modal stack, Event bus, Page scroll info, Debug, Toaster. Framer features are lazy-loaded.
- `globals.css`
  - Tailwind v4 entry, pluginsDefines custom variants, typography, container, and scrollbar styling.
- `lib/`
  - Utilities such as `cn`/`cx` (Tailwind merge + clsx), DOM helpers, request, route builder, etc.
  - for crud, auth, and other utility
- `hooks/`
  - hooks like check isMobile
- `services/`
  - integration client side using tanstack query and serverside
- `lib/constants.ts`

Path alias: `~/*` → `./src/*` (see `tsconfig.json`).

## Providers & App Wiring

- `app/layout.tsx` imports `AuthProvider`, `QueryProider` and wraps the app body. The page content is under a `<div data-theme>` wrapper.

## UI System

All UI components live under `components/ui/*`. They are built on Radix primitives and Tailwind, with consistent variants and tokens.

You need to use these existing components. If they don't meet your needs,first search from shadnc ui `https://ui.shadcn.com/`, you should perform an extension. Or create new components using the same UI design style with Radix.

Usage guidelines:

## Patterns: Store + Actions (Zustand)

Complex feature modules must follow the Store + Actions pattern:

- Keep serializable state only in a Zustand store (`store.ts`).
- Expose all business logic and side-effects through a global `*Actions` singleton.
- Components subscribe with selectors and call actions directly; components never mutate store state.

## Integrations (`services/`)

Put third-party SDKs, HTTP/API clients, and integration adapters under `services/` for both client and server:

- **Client-side**: code used from Client Components (`"use client"`, hooks, browser calls). Example: `services/client.ts`.
- **Server-side**: code used only from Server Components, Route Handlers, server actions, or `lib/server`. Keep secrets and privileged SDK usage here so they never ship to the client.
- Shared request/response types and DTOs can live next to those modules (e.g. `services/apiTypes.ts`).

Prefer `services/` over scattering integration logic inside `components/` or route files.

## Linting & Style

- Prettier: `prettier` config.
- Run `bun run lint` and `bun run format` before committing.

## Build & Analyze

- Production build: `bun run build`

## Agent Notes

- For any new complex feature, set up `store.ts` + `*Actions` per the internal guides.
- For api integration in client, use tanstack query from `/services/client.ts`
