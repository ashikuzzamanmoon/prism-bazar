# Prism Bazar SEO Architecture

This storefront is optimized around Next.js App Router SEO and internal search performance.

## SEO architecture

- Shared Metadata API helpers live in `src/lib/seo/site.ts`.
- Structured data builders live in `src/lib/seo/schema.ts`.
- The root layout publishes Organization and WebSite search box JSON-LD.
- Product pages publish Product and Breadcrumb JSON-LD.
- Search lives on `/search?q=...` with server-rendered results and a cached internal API.
- `src/app/robots.ts` and `src/app/sitemap.ts` control crawl and discovery.

## Search architecture

- `src/app/api/search/route.ts` is the internal search API endpoint.
- `src/lib/search/catalog.ts` fetches upstream products with revalidation.
- `src/lib/search/ranking.ts` scores results by title relevance, description match, typo tolerance, ratings, reviews, and popularity signals.
- Header autocomplete requests `/api/search?mode=suggest&q=...`.

## Indexing policy

- Index homepage, product listing, product detail, about, and contact pages.
- Do not index checkout, dashboard, profile, auth, or API routes.
- Filter-heavy listing URLs canonicalize to a reduced SEO-safe parameter set.

## Performance notes

- Critical metadata is rendered on the server.
- Search API responses are cached with `s-maxage` and stale-while-revalidate.
- Homepage uses ISR via `revalidate = 1800`.
- Search route uses `revalidate = 300`.
- Next Image is used throughout product surfaces for image optimization.

## Local development

```bash
npm install
npm run dev
```
