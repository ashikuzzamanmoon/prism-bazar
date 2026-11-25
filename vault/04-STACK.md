# 04. Technology Stack, Versions & Tooling

> **Strict Environment Lock:** Agent must ONLY use libraries listed here. Introducing unapproved packages requires explicit user confirmation.

---

## 1. Core Runtime & Language
- **Runtime:** Node.js `v20+`
- **Language:** TypeScript `5.x` (`strict: true`)
- **Package Manager:** `pnpm` (workspaces + Turborepo)
- **Monorepo Tool:** Turborepo `^2.x`

---

## 2. Project Structure (Turborepo Monorepo)
```text
prism-bazar/                          # Root (was: one-tech/)
├── turbo.json                        # Turborepo pipeline config
├── pnpm-workspace.yaml               # pnpm workspace definition
├── package.json                      # Root package.json (scripts, devDependencies)
├── AGENTS.md                         # Vault master router
├── vault/                            # Context Architecture Vault
├── apps/
│   ├── web/                          # Customer storefront (was: one-landing)
│   │   ├── src/app/                  # Next.js App Router pages
│   │   ├── package.json
│   │   └── ...
│   ├── server/                       # Backend API (was: one-server)
│   │   ├── src/
│   │   │   ├── module/               # NestJS feature modules
│   │   │   ├── authentication/
│   │   │   ├── prisma/
│   │   │   └── ...
│   │   ├── prisma/schema.prisma
│   │   ├── package.json
│   │   └── ...
│   └── admin/                        # Admin portal (was: one-tech-portal)
│       ├── app/
│       ├── components/
│       ├── package.json
│       └── ...
└── packages/
    └── shared/                       # Shared TypeScript types & utilities
        ├── src/types.ts
        ├── package.json
        └── tsconfig.json
```

---

## 3. Approved Frameworks & Dependencies

### apps/web (Customer Storefront)
| Category | Package | Target Version | Purpose |
| :--- | :--- | :--- | :--- |
| Framework | Next.js | `^16.x` | App Router, SSR, ISR |
| UI | React | `^19.x` | UI rendering |
| State | @reduxjs/toolkit | `^2.x` | Global state management |
| State persist | redux-persist | `^6.x` | Cart & auth persistence |
| UI Components | radix-ui | `^1.x` | Accessible UI primitives |
| Styling | Tailwind CSS | `^4.x` | Utility-first CSS |
| Icons | lucide-react | `^0.5x` | Icon library |
| Forms | react-hook-form | `^7.x` | Form handling |
| Toast | sonner | `^2.x` | Notifications |
| Carousel | embla-carousel-react | `^8.x` | Product carousels |
| Theme | next-themes | `^0.4.x` | Dark/light mode |

### apps/server (Backend API)
| Category | Package | Target Version | Purpose |
| :--- | :--- | :--- | :--- |
| Framework | NestJS | `^11.x` | API framework |
| ORM | Prisma | `^7.x` | Database ORM |
| Database | PostgreSQL (pg) | `^8.x` | Primary database |
| Auth | @nestjs/jwt, passport-jwt | latest | JWT authentication |
| Validation | class-validator, class-transformer | latest | DTO validation |
| File Upload | multer | `^2.x` | Multipart file handling |
| Logging | winston | `^3.x` | Structured logging |
| API Docs | @nestjs/swagger | `^11.x` | Swagger UI |
| Storage | @aws-sdk/client-s3 | `^3.x` | S3-compatible file storage |

### apps/admin (Admin Portal)
| Category | Package | Target Version | Purpose |
| :--- | :--- | :--- | :--- |
| Framework | Next.js | `^15.x` | App Router, Turbopack |
| UI | React | `^19.x` | UI rendering |
| Charts | Recharts | `^3.x` | Sales/order analytics |
| Forms | react-hook-form + zod | latest | Form validation |
| DnD | @dnd-kit | latest | Drag-and-drop sorting |
| State | @reduxjs/toolkit | `^2.x` | State management |

### packages/shared
| Category | Package | Purpose |
| :--- | :--- | :--- |
| Types | TypeScript interfaces | Shared Product, Order, DeliveryZone types |
| Constants | Enums & constants | PaymentMethod, ProductType, OrderStatus |

---

## 4. Forbidden Libraries & Anti-Patterns
- **DO NOT** install `moment.js` (use `date-fns` or native `Intl`).
- **DO NOT** disable TypeScript checks (`@ts-ignore`, `any` without justification).
- **DO NOT** bypass schema validation on API inputs.
- **DO NOT** hardcode secrets/keys in source files (use `.env`).
- **DO NOT** install SSLCommerz SDK (out of scope for v1).
- **DO NOT** install any CSS-in-JS library (Tailwind CSS only).
- **DO NOT** make `node_modules` or `.env` files part of git commits.

---

## 5. Canonical Verification Commands
> *Every Verification Gate in `06-PLAN.md` builds on these commands:*

- **Typecheck (all):** `pnpm turbo typecheck`
- **Lint (all):** `pnpm turbo lint`
- **Build (all):** `pnpm turbo build`
- **Test (server):** `cd apps/server && pnpm test`
- **Dev (all):** `pnpm dev` (runs all apps concurrently)
- **Prisma Generate:** `cd apps/server && pnpm prisma generate`
- **Prisma Migrate:** `cd apps/server && pnpm prisma migrate dev`
