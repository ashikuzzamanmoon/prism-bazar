# Design Specification: Prism Bazar Homepage & Admin Overhaul (Eliminating OneTech Legacy)

- **Date:** 2026-11-28
- **Author:** Antigravity AI & Ashikuzzaman Moon
- **Status:** Proposed (Awaiting Approval)
- **Target Repository:** `prism-bazar` (`apps/web`, `apps/admin`)

---

## 1. Intent & Problem Statement

Prism Bazar is an e-commerce platform based in Sirajganj, Bangladesh, specializing in:
1. **খাঁটি অর্গানিক খাদ্যপণ্য (Pure Organic Foods):** Sundarban honey, pure desi cow ghee, wood-pressed mustard oil, organic nuts & dry fruits.
2. **শিক্ষণ সামগ্রী ও ডিজিটাল শিট (Educational Resources & Digital Sheets):** Primary job preparation, BCS guides, SSC/HSC notes, printed books, and downloadable PDF sheets.

The current codebase originated from a fork of "OneTech", a laptop and computer accessories e-commerce website. While laptop and OneTech product references have been cleared from the database, the **homepage layout, styling, and admin forms still strongly resemble a computer shop template**:
- A "Pre-Owned Products" section (belonging to refurbished laptops).
- An awkward 3x3 diagonal split "EXPLORE" stats box (`CategoryDisplay`) originally built for computer warranty stats.
- A hero banner layout with 2 stacked side banners designed for electronics banners.
- Dark gaming/tech neon newsletter subscription styling (`#1a1a2e`).
- Residual OneTech orange (`#ff7200`) accents scattered inconsistently with the new Prism Bazar identity.
- Admin product forms offering a "Pre-Owned" condition option on organic foods.

The goal of this overhaul is to make Prism Bazar's homepage and admin completely original, welcoming, trustworthy, and tailored specifically to organic food and educational resources.

---

## 2. Goals, Non-Goals & Anti-Goals

### Goals
- **Bespoke Homepage Layout:** Transform the homepage into an authentic, premium, warm e-commerce experience designed for organic foods and academic books/sheets.
- **Remove All Tech-Store Layout Artifacts:** Replace "Pre-Owned", `CategoryDisplay` 3x3 stat grid, and gaming neon blocks with purposeful, high-converting organic & educational sections.
- **Consistent Brand Aesthetic:** Establish a harmonious color scheme:
  - Deep Navy Blue (`#0f172a` / `#1e293b`) for premium brand typography.
  - Emerald Green (`#16a34a` / `#15803d`) for organic freshness.
  - Warm Honey Gold (`#d97706` / `#f59e0b`) for organic honey, ghee, and badge accents.
- **Local Value Proposition:** Prominently feature Sirajganj & Kazipur fast local delivery, Cash on Delivery, and instant PDF downloads.
- **Admin Alignment:** Clean up admin product forms so condition defaults to `FRESH / NEW` and removes irrelevant electronics options.

### Non-Goals
- Changing the backend schema or Prisma models.
- Changing the authentication or checkout flow.

### Anti-Goals
- Keeping any residual "computer shop" or "laptop template" components or terminology.
- Over-complicating the homepage with slow, heavy animations that degrade mobile responsiveness.

---

## 3. Approaches Considered

### Approach 1: Modern Organic & Education Superstore (Selected)
- **Hero Section:** Full-width high-impact responsive banner highlighting the dual product lines (Organic Foods + Study Materials) with clear dual CTA buttons.
- **Trust Badges Row:** 4 pillars: 100% খাঁটি অর্গানিক, সিরাজগঞ্জ-কাজীপুর সেম-ডে ডেলিভারি, ডিজিটাল শিট ইনস্ট্যান্ট ডাউনলোড, ক্যাশ অন ডেলিভারি।
- **Curated Category Cards:** Modern visual card grid showcasing Honey & Ghee, Pure Oils, Dry Fruits, Exam Guides, and Digital PDFs.
- **Official Brands Showcase:** The 4 official Prism Bazar brands with clean emblem logos.
- **Dual Featured Collections:**
  1. *খাঁটি অর্গানিক সম্ভার (Organic Foods Showcase)*
  2. *সেরা শিক্ষা সামগ্রী ও ডিজিটাল শিট (Academic Guides & Sheets)*
- **Local Delivery Highlights:** Sirajganj & Kazipur local delivery map/info card with transparent charges.
- **Warm Subscription Box:** Clean emerald/honey gradient card with friendly Bengali text.
- **Admin Cleanups:** Remove "Pre-Owned" from product condition dropdowns in Admin.

### Approach 2: Minimalist Utility Store Grid
- Pure barebones grid similar to grocery delivery apps (Chaldal style).
- *Why not selected:* Lacks the educational book/sheet storytelling and visual trust needed for a regional dual-niche brand in Bangladesh.

---

## 4. Detailed Component Specifications

### 4.1. Web Homepage (`apps/web/src/app/(commonLayout)/page.tsx`)
1. **`HeroBanner` ([MainBanner.tsx](file:///e:/my-projects/prism-bazar/apps/web/src/components/common/MainBanner.tsx)):**
   - Full-width modern banner slider.
   - Elegant typography with clear Bengali headings and high-contrast badges.
   - Dual CTA: "অর্গানিক খাবার দেখুন" & "স্টাডি শিট ও বই".
2. **`TrustBadges` ([LocalDeliveryBanner.tsx](file:///e:/my-projects/prism-bazar/apps/web/src/components/HomeComponents/LocalDeliveryBanner.tsx)):**
   - 4 trust pillars with clean icons:
     - 🍯 ১০০% খাঁটি ও নির্ভেজাল
     - 🚚 সিরাজগঞ্জ ও কাজীপুর দ্রুত ডেলিভারি
     - 📄 ডিজিটাল শিট তাৎক্ষণিক ডাউনলোড
     - 🛡️ ক্যাশ অন ডেলিভারি ও সহজ রিটার্ন
3. **`CategoryGrid` (Replacing `CategoryDisplay.tsx`):**
   - Clean 5-column responsive grid with rounded cards, soft hover effects, category icon/badge, and direct links to `/products?category=...`.
4. **`BrandsShowing` ([BrandsShowing.tsx](file:///e:/my-projects/prism-bazar/apps/web/src/components/HomeComponents/BrandsShowing.tsx)):**
   - Retained and polished carousel featuring the 4 new official brand emblems.
5. **`FeaturedOrganicProducts` (Replacing generic `NewProductsShowing.tsx`):**
   - Filtered/curated for `type === "ORGANIC_FOOD"` or honey/ghee products with clean "অর্গানিক ফুড" badge.
6. **`FeaturedEducationProducts` (Replacing `PreOwnedProducts.tsx`):**
   - Filtered/curated for `type === "DIGITAL_PRODUCT"` or books/sheets with "শিক্ষা উপকরণ" badge.
7. **`LocalDeliveryZone`:**
   - Dedicated local area badge card for Sirajganj, Kazipur, and national courier options.
8. **`Testimonials` ([Testimonials.tsx](file:///e:/my-projects/prism-bazar/apps/web/src/components/HomeComponents/Testimonials.tsx)):**
   - Verified and polished for organic customers and students/examinees.
9. **`SubscriptionOffer` ([SubscriptionOffer.tsx](file:///e:/my-projects/prism-bazar/apps/web/src/components/HomeComponents/SubscriptionOffer.tsx)):**
   - Warm emerald & gold gradient container replacing the dark tech box.

### 4.2. Admin Dashboard Cleanups
- In `CreateProduct.tsx`, `UpdateProduct.tsx`, and `ViewProduct.tsx`:
  - Update `condition` dropdown: default to `FRESH` ("নতুন / ফ্রেশ").
  - Hide or remove `PRE_OWNED` option to avoid confusion on food and books.
  - Ensure labels reflect "প্রিজম বাজার পণ্য" instead of legacy gadget terms.

---

## 5. Verification Plan
1. **UI Verification:**
   - Run dev server on port 3000 and inspect desktop & mobile viewports.
   - Verify zero occurrences of "Pre-Owned", "OneTech", or laptop artifacts.
2. **Typecheck & Build:**
   - Run `pnpm --filter @prism-bazar/web typecheck` (0 errors).
   - Run `pnpm --filter @prism-bazar/admin typecheck` (0 errors).
3. **Commit & Push:**
   - Commit changes cleanly and push to GitHub `origin/main`.
