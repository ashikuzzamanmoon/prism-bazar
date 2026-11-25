# 02. Active State Machine & Execution Tracker

> **Live Checkpoint File:** Coding agent MUST update this file immediately after passing each step in `06-PLAN.md`.

---

## 1. Execution Checkpoint
- **Project Status:** `COMPLETE`
- **Last Completed Step:** `Step 20`
- **Active Step:** `None`
- **Active Blockers:** `None`

### Checkpoint History Log
| Step | Status | Completed At | Notes / Verified Gate |
| :--- | :--- | :--- | :--- |
| Step 0 | LOCKED | 2026-11-24 21:52 | Vault initialized for Prism Bazar conversion |
| Step 1 | PASS | 2026-11-24 22:18 | Turborepo monorepo scaffold completed & pnpm install passed |
| Step 2 | PASS | 2026-11-24 22:21 | All 4 packages (@prism-bazar/shared, server, web, admin) built cleanly with turbo build |
| Step 3 | PASS | 2026-11-24 22:24 | Global branding rename verified: 0 occurrences of OneTech/1tech remain |
| Step 4 | PASS | 2026-11-24 22:25 | Fresh green & earthy design tokens applied; pnpm turbo build passed |
| Step 5 | PASS | 2026-11-24 22:26 | Prisma schema updated with DeliveryZone, DigitalFile, Product & Order fields; prisma generate passed |
| Step 6 | PASS | 2026-11-24 22:27 | Shared types package completed with Product, Order, DeliveryZone interfaces; tsc passed |
| Step 7 | PASS | 2026-11-24 22:28 | DeliveryZone CRUD module implemented in apps/server; build passed |
| Step 8 | PASS | 2026-11-24 22:29 | DigitalFiles upload & secure download module implemented in apps/server; build passed |
| Step 9 | PASS | 2026-11-24 22:31 | Order flow updated with manual bKash/Nagad, COD and delivery zone charges; build passed |
| Step 10 | PASS | 2026-11-24 22:32 | Product DTOs & service adapted for organic food and education fields; build passed |
| Step 11 | PASS | 2026-11-24 22:35 | Homepage layout updated with LocalDeliveryBanner and Prism Bazar navigation; build passed |
| Step 12 | PASS | 2026-11-24 22:38 | Product detail adapted with Bengali food/book info, badges & delivery promise; build passed |
| Step 13 | PASS | 2026-11-24 22:42 | Checkout flow adapted with delivery zones selection & manual bKash/Nagad payments; build passed |
| Step 14 | PASS | 2026-11-24 22:44 | Dashboard adapted with digital file download links, manual payment badges & theme; build passed |
| Step 15 | PASS | 2026-11-24 22:48 | Admin product create & update forms updated with food/education/digital fields; build passed |
| Step 16 | PASS | 2026-11-24 22:51 | Admin delivery zone CRUD page & sidebar route created and verified; build passed |
| Step 17 | PASS | 2026-11-24 22:53 | Admin order management updated with manual payment verification and delivery zone display; build passed |
| Step 18 | PASS | 2026-11-24 22:55 | Policy pages updated with organic food/education quality guarantee & regional delivery; build passed |
| Step 19 | PASS | 2026-11-24 22:56 | PM2 ecosystem configs (root & admin) and .env.example templates created; build passed |
| Step 20 | PASS | 2026-11-24 22:57 | Full monorepo verification complete — 4/4 packages built cleanly with 0 errors |
| Hotfix | PASS | 2026-11-25 19:32 | Database migration & seeding: Soft-deleted OneTech laptop products, seeded 8 Prism Bazar organic food/education products, delivery zones, categories & brands, fixed remaining SEO/color references. Turbo build passed (4/4). |

---

## 2. Application Runtime State Machine
> *Define every valid state transition so the agent never invents undefined UI/API states.*

### Core Flow States
- **`IDLE`**: Initial state before user/system input.
- **`LOADING`**: Asynchronous operation in flight (show skeleton/spinner; disable duplicate submit).
- **`SUCCESS`**: Operation succeeded with valid payload.
- **`EMPTY`**: Valid response returned, zero records found (render actionable empty-state CTA).
- **`ERROR`**: Operation failed cleanly with human-readable message and retry trigger.

### Allowed Transitions
- `IDLE -> LOADING` (Trigger: User submits / Init runs)
- `LOADING -> SUCCESS` (Trigger: HTTP 200 & schema validation passes)
- `LOADING -> EMPTY` (Trigger: HTTP 200 & array length === 0)
- `LOADING -> ERROR` (Trigger: HTTP 4xx/5xx or timeout > `API_TIMEOUT_MS`)
- `ERROR -> LOADING` (Trigger: User clicks Retry)
- `SUCCESS -> LOADING` (Trigger: User requests fresh data / pagination)

### Forbidden Transitions
- Never jump directly from `ERROR` to `SUCCESS` without passing through `LOADING`.
- Never allow concurrent `LOADING` triggers for the same mutation key.

---

## 3. Order State Machine (Prism Bazar Specific)
```
PENDING → PAYMENT_VERIFIED → PROCESSING → SHIPPED → DELIVERED
                                                   ↘ RETURNED
PENDING → CANCELLED (by user or admin)
PENDING → PAYMENT_FAILED (for manual payment timeout)
```

### Payment Flow States
- **COD:** `PENDING` → admin confirms → `PROCESSING`
- **bKash/Nagad Manual:** `PENDING` (user submits trxId) → admin verifies → `PAYMENT_VERIFIED` → `PROCESSING`
- **Digital Product:** `PENDING` → `PAYMENT_VERIFIED` → download link active in user dashboard
