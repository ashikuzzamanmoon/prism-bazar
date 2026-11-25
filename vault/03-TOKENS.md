# 03. Design Tokens & System Constants

> **Single Source of Truth:** All colors, fonts, spacing, and operational limits live here. Mirror these into Tailwind CSS config and theme files.

---

## 1. Color Palette — Fresh Green & Earthy Tone (অর্গানিক ফুড ভাইব)

### Primary Brand Colors
- **Brand Primary (Fresh Green):** `#16A34A` (green-600)
- **Brand Primary Hover:** `#15803D` (green-700)
- **Brand Primary Light:** `#DCFCE7` (green-100, backgrounds/badges)
- **Brand Accent (Earthy Gold):** `#CA8A04` (yellow-600, promotional/sale tags)
- **Brand Accent Light:** `#FEF9C3` (yellow-100)

### Backgrounds (60%)
- **Primary Surface (Light):** `#FFFFFF`
- **Secondary Surface:** `#F9FAFB` (gray-50)
- **Card Surface:** `#FFFFFF` with `border: 1px solid #E5E7EB`
- **Elevated Surface / Modal Overlay:** `rgba(0, 0, 0, 0.5)`

### Text & Borders (30%)
- **Text Primary:** `#111827` (gray-900)
- **Text Secondary:** `#4B5563` (gray-600)
- **Text Muted:** `#9CA3AF` (gray-400)
- **Border Default:** `#E5E7EB` (gray-200)
- **Border Focus:** `#16A34A` (brand green)

### Semantic Accents (10%)
- **Success:** `#16A34A` (green-600, same as brand)
- **Warning:** `#F59E0B` (amber-500)
- **Danger / Error:** `#EF4444` (red-500)
- **Info:** `#3B82F6` (blue-500)

### Category-Specific Accent Colors
- **অর্গানিক ফুড ক্যাটাগরি:** `#16A34A` (green)
- **শিক্ষা উপকরণ ক্যাটাগরি:** `#2563EB` (blue-600)
- **ডেলিভারি/লজিস্টিক:** `#EA580C` (orange-600)

---

## 2. Typography
- **Heading / UI Font:** `Inter`, sans-serif
- **Bangla Font:** `Hind Siliguri`, sans-serif (for Bengali text)
- **Monospace Font:** `JetBrains Mono`, monospace (admin panel code/IDs)
- **Type Scale:**
  - `h1`: `32px` / weight `700` / line-height `1.2`
  - `h2`: `24px` / weight `600` / line-height `1.3`
  - `h3`: `20px` / weight `600` / line-height `1.4`
  - `body`: `16px` / weight `400` / line-height `1.5`
  - `body-sm`: `14px` / weight `400` / line-height `1.5`
  - `caption`: `12px` / weight `500` / line-height `1.4`
  - `price`: `24px` / weight `700` / line-height `1.2` (product price display)

---

## 3. Layout, Spacing & Motion
- **Grid Unit:** `4px` base (`4, 8, 12, 16, 24, 32, 48, 64px`)
- **Max Content Width:** `1280px`
- **Border Radius:** Small `6px`, Card `12px`, Button `8px`, Pill `9999px`
- **Transitions:** `200ms cubic-bezier(0.16, 1, 0.3, 1)` (never linear)
- **Shadows:**
  - Card: `0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)`
  - Elevated: `0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)`

---

## 4. Operational Constants
- `API_TIMEOUT_MS`: `10000`
- `MAX_RETRY_ATTEMPTS`: `3`
- `DEFAULT_PAGE_SIZE`: `20`
- `OTP_EXPIRY_SECONDS`: `300` (5 minutes)
- `OTP_RATE_LIMIT_PER_MINUTE`: `1`
- `OTP_RATE_LIMIT_PER_HOUR`: `5`
- `MAX_UPLOAD_SIZE_MB`: `10` (product images)
- `MAX_DIGITAL_FILE_SIZE_MB`: `50` (PDF downloads)
- `DELIVERY_FREE_THRESHOLD_BDT`: `500` (৫০০ টাকার উপরে ফ্রি ডেলিভারি — কনফিগারেবল)
