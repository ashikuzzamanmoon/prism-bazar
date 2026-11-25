# 06. Sequential Atomic Execution Plan — OneTech → Prism Bazar Conversion

> **Strict Rule:** Complete steps in exact order (`1 → 2 → 3...`). NEVER mark `[x]` until EVERY command in that step's `Verification Gate` passes with exit code `0`.

---

## Phase 1: Monorepo Scaffold & Turborepo Setup

- [x] Step 1: Turborepo monorepo scaffold
  - **Vault Refs:** `vault/04-STACK.md`
  - **Description:** Delete all 3 `node_modules` folders. Create root `package.json`, `pnpm-workspace.yaml`, `turbo.json`. Move `one-landing/` → `apps/web/`, `one-server/` → `apps/server/`, `one-tech-portal/` → `apps/admin/`. Create `packages/shared/` with `package.json` and `tsconfig.json`. Update each app's `package.json` name to `@prism-bazar/web`, `@prism-bazar/server`, `@prism-bazar/admin`, `@prism-bazar/shared`.
  - **Target Files:** `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `apps/web/package.json`, `apps/server/package.json`, `apps/admin/package.json`, `packages/shared/package.json`, `packages/shared/tsconfig.json`
  - **Done Criteria:** `pnpm install` completes without errors; all 3 apps and shared package resolve correctly.
  - **Verification Gate:** `pnpm install`

- [x] Step 2: Verify all apps build successfully in Turborepo
  - **Vault Refs:** `vault/04-STACK.md`
  - **Description:** Configure `turbo.json` pipelines for `build`, `dev`, `lint`, `typecheck`. Ensure each app's `tsconfig.json` and build scripts are correct. Fix any import path or config issues. Add shared package as dependency to web and admin.
  - **Target Files:** `turbo.json`, `apps/web/tsconfig.json`, `apps/server/tsconfig.json`, `apps/admin/tsconfig.json`
  - **Done Criteria:** `pnpm turbo build` succeeds for all apps; no TypeScript errors.
  - **Verification Gate:** `pnpm turbo build`

---

## Phase 2: Branding & Theme Conversion (OneTech → Prism Bazar)

- [x] Step 3: Global branding rename — text, metadata, titles
  - **Vault Refs:** `vault/01-PRD.md`, `vault/03-TOKENS.md`
  - **Description:** Replace all occurrences of "OneTech", "1tech", "one-tech", "one tech", "Ecom Server" with "Prism Bazar" / "prism-bazar" across all source files, metadata, SEO titles, layout headers, footers, Swagger docs, CORS origins, cookie names. Update `main.ts` CORS origins placeholder. Update admin portal cookie name `oneTTkn` → `pbToken`. Update Swagger title/description.
  - **Target Files:** All `layout.tsx`, `page.tsx` files with brand names; `apps/server/src/main.ts`; `apps/admin/middleware.ts`; SEO files (`robots.ts`, `sitemap.ts`, meta helpers).
  - **Done Criteria:** `grep -ri "onetech\|1tech\|one-tech\|one tech\|oneTTkn" apps/ packages/` returns zero results (excluding node_modules & .next).
  - **Verification Gate:** `Get-ChildItem -Path apps,packages -Recurse -Include *.ts,*.tsx,*.json,*.md -Exclude node_modules,.next,dist | Select-String -Pattern "onetech|1tech|one-tech|one tech|oneTTkn|Ecom Server" | Measure-Object` → Count must be 0.

- [x] Step 4: Color theme & design token update
  - **Vault Refs:** `vault/03-TOKENS.md`
  - **Description:** Update Tailwind CSS config and global styles from tech-blue/dark theme to Fresh Green & Earthy tone. Update CSS variables, button styles, header/footer colors, accent colors. Ensure light-mode primary design.
  - **Target Files:** `apps/web/src/app/globals.css`, `apps/admin/app/globals.css`, any theme config files, component files with hardcoded color classes.
  - **Done Criteria:** Site visually uses green/earthy color scheme; no blue/tech-themed hardcoded colors remain.
  - **Verification Gate:** `pnpm turbo build`

---

## Phase 3: Database Schema Evolution

- [x] Step 5: Prisma schema update — new models & field additions
  - **Vault Refs:** `vault/05-SCHEMA.md`
  - **Description:** Add `DeliveryZone` and `DigitalFile` models. Add new fields to `Product` model (`expiryDate`, `ingredients`, `nutritionInfo`, `isDigital`, `author`, `publisher`, `digitalFiles`). Add `deliveryZoneId`, `deliveryZone`, `deliveryCharge` to `Order` model. Update `ProductType`, `ProductCondition`, `PaymentMethod` enums. Create Prisma migration.
  - **Target Files:** `apps/server/prisma/schema.prisma`
  - **Done Criteria:** `prisma generate` and `prisma migrate dev --name prism-bazar-init` succeed.
  - **Verification Gate:** `cd apps/server && pnpm prisma generate`

- [x] Step 6: Shared types package — TypeScript interfaces
  - **Vault Refs:** `vault/05-SCHEMA.md`
  - **Description:** Create shared TypeScript types in `packages/shared/src/types.ts` matching the updated schema: `ProductType`, `ProductCondition`, `PaymentMethod`, `DeliveryZoneRecord`, `DigitalFileRecord`, `OrderStatus` and other shared interfaces. Export from package index.
  - **Target Files:** `packages/shared/src/types.ts`, `packages/shared/src/index.ts`, `packages/shared/package.json`
  - **Done Criteria:** Types compile cleanly; web and admin can import from `@prism-bazar/shared`.
  - **Verification Gate:** `cd packages/shared && pnpm tsc --noEmit`

---

## Phase 4: Backend API — New Modules

- [x] Step 7: DeliveryZone module (CRUD API)
  - **Vault Refs:** `vault/05-SCHEMA.md`, `vault/01-PRD.md`
  - **Description:** Create NestJS module `delivery-zones` with controller, service, DTOs. Public GET endpoint for active zones; Admin-only POST/PATCH/DELETE. Proper validation and guards.
  - **Target Files:** `apps/server/src/module/delivery-zones/` (controller, service, module, DTOs)
  - **Done Criteria:** All 4 CRUD endpoints functional; validation works; role guards enforced.
  - **Verification Gate:** `cd apps/server && pnpm run build`

- [x] Step 8: Digital file upload & download endpoints
  - **Vault Refs:** `vault/05-SCHEMA.md`, `vault/01-PRD.md`
  - **Description:** Create endpoints for admin to upload digital files (PDF) linked to a product, and authenticated user endpoint to download purchased files. Files stored on server disk (not public directory). Stream response with proper headers.
  - **Target Files:** `apps/server/src/module/digital-files/` (controller, service, module, DTOs)
  - **Done Criteria:** Admin can upload PDF; authenticated user with verified payment can download; unauthenticated access returns 401.
  - **Verification Gate:** `cd apps/server && pnpm run build`

- [x] Step 9: Order flow update — COD + manual bKash/Nagad
  - **Vault Refs:** `vault/05-SCHEMA.md`, `vault/01-PRD.md`
  - **Description:** Modify orders service: add `manual-payment` endpoint (accepts bKash/Nagad trxId), add `verify-payment` admin endpoint, integrate `deliveryZoneId` and `deliveryCharge` into order creation. Remove/disable SSLCommerz integration. Update COD flow to include delivery zone.
  - **Target Files:** `apps/server/src/module/orders/` (service, controller, DTOs)
  - **Done Criteria:** COD order with delivery zone works; manual payment order with trxId works; admin can verify payment.
  - **Verification Gate:** `cd apps/server && pnpm run build`

- [x] Step 10: Product fields adaptation for organic food & education
  - **Vault Refs:** `vault/05-SCHEMA.md`
  - **Description:** Update products service/controller/DTOs to accept and return new fields: `expiryDate`, `ingredients`, `nutritionInfo`, `isDigital`, `author`, `publisher`. Update product creation and update flows. Ensure `ProductType` enum is used for filtering.
  - **Target Files:** `apps/server/src/module/products/` (service, controller, DTOs)
  - **Done Criteria:** Create product with organic food fields works; create product with education fields works; API returns new fields.
  - **Verification Gate:** `cd apps/server && pnpm run build`

---

## Phase 5: Frontend — Customer Storefront Adaptation

- [x] Step 11: Homepage & navigation update for Prism Bazar
  - **Vault Refs:** `vault/01-PRD.md`, `vault/03-TOKENS.md`
  - **Description:** Update homepage layout: hero section with organic food imagery/text, category sections for "অর্গানিক খাদ্য" and "শিক্ষা উপকরণ", featured products, delivery zone info banner. Update navigation menus and footer.
  - **Target Files:** `apps/web/src/app/(commonLayout)/` pages, header, footer, hero components
  - **Done Criteria:** Homepage shows Prism Bazar branding with organic food & education categories; navigation links work.
  - **Verification Gate:** `cd apps/web && pnpm run build`

- [x] Step 12: Product detail page — organic food & book fields
  - **Vault Refs:** `vault/05-SCHEMA.md`, `vault/01-PRD.md`
  - **Description:** Update product detail page to show weight/quantity variants (not color), ingredients, nutrition info, expiry date for food products; author, publisher, class/subject for books; "ডিজিটাল ডাউনলোড" badge for digital products. Remove electronics-specific UI (warranty, specs table).
  - **Target Files:** `apps/web/src/` product detail components
  - **Done Criteria:** Product page displays food-specific or education-specific fields based on product type.
  - **Verification Gate:** `cd apps/web && pnpm run build`

- [x] Step 13: Checkout flow — delivery zone selection & manual payment
  - **Vault Refs:** `vault/01-PRD.md`, `vault/05-SCHEMA.md`
  - **Description:** Update checkout page: add delivery zone dropdown (fetched from API), show delivery charge dynamically, add bKash/Nagad manual payment option (show merchant number, trxId input field). Remove SSLCommerz payment option. For digital-only orders, skip delivery zone.
  - **Target Files:** `apps/web/src/app/(commonLayout)/checkout/` components
  - **Done Criteria:** Checkout shows delivery zones with charges; COD and manual payment options work; digital products skip delivery.
  - **Verification Gate:** `cd apps/web && pnpm run build`

- [x] Step 14: User dashboard — order history & digital downloads
  - **Vault Refs:** `vault/01-PRD.md`
  - **Description:** Update user dashboard to show order history with payment status (pending verification, verified, etc.), and a "ডাউনলোড" section for purchased digital products (download button active only after payment verified).
  - **Target Files:** `apps/web/src/app/(commonLayout)/dashboard/` components
  - **Done Criteria:** Dashboard shows orders with correct statuses; digital download button works for verified orders.
  - **Verification Gate:** `cd apps/web && pnpm run build`

---

## Phase 6: Admin Portal Adaptation

- [x] Step 15: Admin — product form update for organic food & education fields
  - **Vault Refs:** `vault/05-SCHEMA.md`
  - **Description:** Update admin product creation/edit form: add fields for expiryDate, ingredients, nutritionInfo (food); author, publisher (education); isDigital toggle; digital file upload. Rename "Color" section to "ভ্যারিয়েন্ট (ওজন/পরিমাণ)". Add ProductType selector.
  - **Target Files:** `apps/admin/app/(dashboardLayout)/admin/products/` components
  - **Done Criteria:** Admin can create organic food product with new fields; can create education product with book fields; can upload digital files.
  - **Verification Gate:** `cd apps/admin && pnpm run build`

- [x] Step 16: Admin — delivery zone management page
  - **Vault Refs:** `vault/05-SCHEMA.md`
  - **Description:** Create new admin page for delivery zone CRUD: list zones, add/edit zone (name, area, charge, estimated time), toggle active status, sort order. Accessible from admin sidebar.
  - **Target Files:** `apps/admin/app/(dashboardLayout)/admin/delivery-zones/` page & components
  - **Done Criteria:** Admin can list, create, edit, delete delivery zones; sidebar link works.
  - **Verification Gate:** `cd apps/admin && pnpm run build`

- [x] Step 17: Admin — order management with manual payment verification
  - **Vault Refs:** `vault/01-PRD.md`
  - **Description:** Update admin order detail page: show payment method (COD/bKash/Nagad), show submitted trxId for manual payments, add "পেমেন্ট ভেরিফাই করুন" button for manual payments. Show delivery zone info on order.
  - **Target Files:** `apps/admin/app/(dashboardLayout)/admin/orders/` components
  - **Done Criteria:** Admin can see payment details; can verify manual payments; order status updates correctly.
  - **Verification Gate:** `cd apps/admin && pnpm run build`

---

## Phase 7: Cleanup & Final Verification

- [x] Step 18: Remove electronics-specific code, pages & assets
  - **Vault Refs:** `vault/01-PRD.md`
  - **Description:** Remove/update warranty policy page, electronics-specific comparison logic, tech spec tables, old OneTech logos/images. Remove old SSLCommerz integration code. Update policy pages (return/refund, privacy) text for Prism Bazar. Clean up unused imports and dead code.
  - **Target Files:** Across all apps — policy pages, comparison features, old assets
  - **Done Criteria:** No electronics-specific text, images or dead SSLCommerz code remains; policy pages reflect Prism Bazar.
  - **Verification Gate:** `pnpm turbo build`

- [x] Step 19: Environment variables & configuration cleanup
  - **Vault Refs:** `vault/04-STACK.md`
  - **Description:** Create `.env.example` files for all apps with Prism Bazar variable names. Remove old OneTech-specific env references (SSL_STORE_ID, old bucket names). Update `.gitignore` files. Update `ecosystem.config.js` for production PM2 config with new app names.
  - **Target Files:** `apps/web/.env.example`, `apps/server/.env.example`, `apps/admin/.env.example`, `apps/admin/ecosystem.config.js`
  - **Done Criteria:** Each app has `.env.example` with all required variables documented; no old credentials in example files.
  - **Verification Gate:** `pnpm turbo build`

- [x] Step 20: Full project verification & vault completion
  - **Vault Refs:** `vault/01-PRD.md`, `vault/04-STACK.md`
  - **Description:** Run full lint, typecheck, and build for all apps. Verify all PRD features are addressed. Update `vault/02-STATE.md` to `COMPLETE`.
  - **Target Files:** *(No new features; verify full project)*
  - **Done Criteria:** Clean lint, strict typecheck, clean production build for all 3 apps; vault `02-STATE.md` status = `COMPLETE`.
  - **Verification Gate:** `pnpm turbo build`
