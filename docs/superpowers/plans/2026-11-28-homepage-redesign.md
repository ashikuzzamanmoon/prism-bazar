# Prism Bazar Homepage & Admin Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform Prism Bazar's homepage and admin dashboard into a completely original, modern, authentic marketplace experience for pure organic foods and educational resources, eradicating all residual OneTech computer shop layouts and terminology.

**Architecture:** 
1. Clean up Admin product condition forms (removing "Pre-Owned" and defaulting to "Fresh / New").
2. Replace OneTech's 3-box electronics hero banner layout with a modern, high-impact full-width responsive carousel.
3. Replace OneTech's awkward 3x3 diagonal split `CategoryDisplay` with a modern 5-column Category Grid.
4. Replace "Pre-Owned Products" with dedicated dual collections: "খাঁটি অর্গানিক সম্ভার" and "সেরা শিক্ষা সামগ্রী ও শিট".
5. Replace dark gaming newsletter box with a warm, welcoming organic offer card.

**Tech Stack:** Next.js 16 (App Router), Tailwind CSS, Lucide React, TypeScript, Redux Toolkit.

**Spec:** `docs/superpowers/specs/2026-11-28-homepage-redesign-design.md`

## Global Constraints
- No breaking schema migrations or Prisma backend changes.
- Zero references to "Pre-Owned", "laptop", or OneTech in UI copy.
- Full responsive support (mobile, tablet, desktop).
- All TypeScript typechecks must pass cleanly (`pnpm --filter @prism-bazar/web typecheck` and `pnpm --filter @prism-bazar/admin typecheck`).

## Review Focus
1. Mobile responsive view: verify banners and category cards stack cleanly without horizontal overflow.
2. Fast navigation: category cards and buttons must link to active filtered catalog routes (`/products?category=...` or `/products?collection=...`).
3. Currency & Pricing: all prices display in Bangladeshi Taka (`৳`) with standard discount calculation.
4. Add to Cart & Buy Now: buttons must seamlessly dispatch to Redux cart and drawer.
5. Admin product editing: existing products load correctly without type errors when editing condition.

---

### Task 1: Admin Dashboard Cleanups (Eliminate "Pre-Owned" condition)

**Files:**
- Modify: `apps/admin/components/NewProducts/CreateProduct.tsx`
- Modify: `apps/admin/components/NewProducts/UpdateProduct.tsx`
- Modify: `apps/admin/components/NewProducts/ViewProduct.tsx`

**Interfaces:**
- Produces: Updated condition label dictionary mapping `FRESH` to `"নতুন / ফ্রেশ (Fresh)"` and defaulting to `FRESH`.

- [ ] **Step 1: Update `CreateProduct.tsx`**
  - In `condition` select field: remove `PRE_OWNED: "ব্যবহৃত (Pre-Owned)"`, retain `FRESH: "নতুন / ফ্রেশ (Fresh)"`, and set default form value to `"FRESH"`.

- [ ] **Step 2: Update `UpdateProduct.tsx` and `ViewProduct.tsx`**
  - Ensure condition display maps `FRESH` to `"নতুন / ফ্রেশ"`. If any existing DB item has `PRE_OWNED`, map gracefully to `"স্ট্যান্ডার্ড"`.

- [ ] **Step 3: Run admin typecheck**
  - Run: `pnpm --filter @prism-bazar/admin typecheck`
  - Expected: PASS with 0 errors.

- [ ] **Step 4: Commit**
  - Run: `git commit -am "fix(admin): remove pre-owned condition option and default to fresh"`

---

### Task 2: Modern Full-Width Hero Banner ([MainBanner.tsx](file:///e:/my-projects/prism-bazar/apps/web/src/components/common/MainBanner.tsx))

**Files:**
- Modify: `apps/web/src/components/common/MainBanner.tsx`

**Interfaces:**
- Consumes: `IBanner[]` from backend `API_ENDPOINTS.BANNER.GetAll`.
- Produces: Responsive full-width hero slider with dual CTA buttons and clean Bengali messaging.

- [ ] **Step 1: Refactor `MainBanner.tsx` layout**
  - Remove the legacy side banner 1/3 column container on the right.
  - Make the hero carousel occupy the full container width (`max-w-7xl mx-auto`).
  - Add gradient overlays, bold readable Bengali typography, and dual CTA buttons ("খাঁটি অর্গানিক খাদ্য" -> `/products?type=ORGANIC_FOOD` and "শিক্ষা সহায়িকা ও শিট" -> `/products?type=DIGITAL_PRODUCT`).

- [ ] **Step 2: Test rendering & typecheck**
  - Run: `pnpm --filter @prism-bazar/web typecheck`
  - Expected: PASS with 0 errors.

- [ ] **Step 3: Commit**
  - Run: `git commit -am "feat(web): transform hero banner into full-width modern carousel"`

---

### Task 3: Modern Trust Badges Bar ([LocalDeliveryBanner.tsx](file:///e:/my-projects/prism-bazar/apps/web/src/components/HomeComponents/LocalDeliveryBanner.tsx))

**Files:**
- Modify: `apps/web/src/components/HomeComponents/LocalDeliveryBanner.tsx`

**Interfaces:**
- Produces: 4-pillar trust badge row highlighting 100% Pure Organic, Fast Sirajganj-Kazipur Delivery, Instant PDF Sheet Download, and Cash on Delivery.

- [ ] **Step 1: Polish `LocalDeliveryBanner.tsx`**
  - Modernize card styling with subtle rounded-2xl border, rich emerald/green gradient, and high-visibility feature badges.
  - Link directly to `/products` and `/contact`.

- [ ] **Step 2: Commit**
  - Run: `git commit -am "feat(web): polish trust badges and local delivery banner"`

---

### Task 4: Modern Category Grid (Replace `CategoryDisplay.tsx`)

**Files:**
- Create: `apps/web/src/components/HomeComponents/CategoryGrid.tsx`
- Delete: `apps/web/src/components/HomeComponents/CategoryDisplay.tsx`

**Interfaces:**
- Consumes: `categories: ICollection[]` from backend.
- Produces: Clean 5-column responsive card grid displaying category names, icons, and quick links.

- [ ] **Step 1: Create `CategoryGrid.tsx`**
  - Build responsive grid (2 columns on mobile, 3 on tablet, 5 on desktop).
  - Include categories:
    1. খাঁটি মধু ও ঘি (`pure-honey-and-ghee`)
    2. ঘানিভাঙা সরিষার তেল (`pure-oil-and-herbs`)
    3. ড্রাই ফ্রুটস ও বাদাম (`organic-dry-fruits`)
    4. শিক্ষা সহায়ক বই ও গাইড (`education-books-guides`)
    5. ডিজিটাল শিট ও হ্যান্ডনোট (পিডিএফ) (`digital-sheets-pdf`)
  - Add clean hover animations and direct links to `/products?category=${slug}`.

- [ ] **Step 2: Delete `CategoryDisplay.tsx`**
  - Remove legacy `apps/web/src/components/HomeComponents/CategoryDisplay.tsx`.

- [ ] **Step 3: Commit**
  - Run: `git commit -am "feat(web): replace legacy explore stats box with modern CategoryGrid"`

---

### Task 5: Curated Dual Product Showcases (Replace `PreOwnedProducts.tsx`)

**Files:**
- Create: `apps/web/src/components/HomeComponents/OrganicProductsShowcase.tsx`
- Create: `apps/web/src/components/HomeComponents/EducationProductsShowcase.tsx`
- Delete: `apps/web/src/components/HomeComponents/PreOwnedProducts.tsx`

**Interfaces:**
- Consumes: `IProduct[]`
- Produces: Two distinct curated carousel showcases:
  1. "খাঁটি অর্গানিক সম্ভার" with emerald accents and organic product tags.
  2. "সেরা শিক্ষা সামগ্রী ও শিট" with royal navy/gold accents and academic tags.

- [ ] **Step 1: Create `OrganicProductsShowcase.tsx`**
  - Carousel component showcasing fresh organic foods with "সবগুলো দেখুন" linking to organic filter.

- [ ] **Step 2: Create `EducationProductsShowcase.tsx`**
  - Carousel component showcasing study sheets and guides with "সবগুলো দেখুন" linking to education filter.

- [ ] **Step 3: Delete `PreOwnedProducts.tsx`**
  - Remove legacy `apps/web/src/components/HomeComponents/PreOwnedProducts.tsx`.

- [ ] **Step 4: Commit**
  - Run: `git commit -am "feat(web): replace pre-owned products with curated organic and education showcases"`

---

### Task 6: Warm Subscription Offer Card ([SubscriptionOffer.tsx](file:///e:/my-projects/prism-bazar/apps/web/src/components/HomeComponents/SubscriptionOffer.tsx))

**Files:**
- Modify: `apps/web/src/components/HomeComponents/SubscriptionOffer.tsx`

**Interfaces:**
- Produces: Redesigned subscription card using warm emerald and golden honey tones instead of dark gaming neon `#1a1a2e`.

- [ ] **Step 1: Redesign `SubscriptionOffer.tsx`**
  - Replace `#1a1a2e` background with an elegant, warm emerald gradient (`from-emerald-900 via-green-800 to-teal-900`).
  - Friendly Bengali copy inviting users to get seasonal discounts on honey/ghee and new exam study sheet updates.

- [ ] **Step 2: Commit**
  - Run: `git commit -am "feat(web): redesign subscription offer into warm organic theme"`

---

### Task 7: Homepage Assembly, Monorepo Typecheck & Verification

**Files:**
- Modify: `apps/web/src/app/(commonLayout)/page.tsx`

**Interfaces:**
- Assembles: `MainBanner`, `LocalDeliveryBanner`, `CategoryGrid`, `BrandsShowing`, `OrganicProductsShowcase`, `EducationProductsShowcase`, `Testimonials`, `SubscriptionOffer`.

- [ ] **Step 1: Update `page.tsx`**
  - Import new components and remove legacy imports.
  - Wire up backend data feeds appropriately.

- [ ] **Step 2: Run monorepo typecheck**
  - Run: `pnpm --filter @prism-bazar/web typecheck`
  - Run: `pnpm --filter @prism-bazar/admin typecheck`
  - Expected: PASS with 0 errors across all apps.

- [ ] **Step 3: Verify in browser**
  - Fetch `http://localhost:3000/` and verify clean HTTP 200 OK with zero broken images or OneTech leftovers.

- [ ] **Step 4: Final commit & push**
  - Run: `git push origin main`
