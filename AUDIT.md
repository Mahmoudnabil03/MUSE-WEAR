# MUSE WEAR Audit

Date: 2026-09-02

## Scope and live crawl

The deployed site at `https://muse-wear.pages.dev` was checked with direct HTTP
requests. The responses below describe HTTP availability; client-side behavior
was verified from the source because this environment does not provide a browser
console session.

| Route | HTTP | Current behavior | Data/errors |
| --- | ---: | --- | --- |
| `/` | 200 | Loads the branded home page | Reads the hardcoded `products`, `categories`, and `brands` arrays |
| `/men/` | 200 | Loads product listing and client filters | Hardcoded product array; no network data request |
| `/women/` | 200 | Loads product listing and client filters | Hardcoded product array; no network data request |
| `/accessories/` | 200 | Loads product listing and client filters | Hardcoded product array; no network data request |
| `/search/` | 200 | Loads query results | Searches hardcoded product array |
| `/product/mw-001/` | 200 | Loads static product detail | Generated from hardcoded products; only IDs known at build time exist |
| `/product/unknown/` | 200 | Shows a not-found message inside the exported shell | No server 404 because the site is a static export |
| `/cart/` | 200 | Loads cart UI | Cart is browser `localStorage`, not persistent per account |
| `/checkout/` | 200 | Loads checkout UI | Confirmation only clears local state; no order is written |
| `/wishlist/` | 200 | Loads wishlist UI | Wishlist is browser `localStorage`, not persistent per account |
| `/login/` | 200 | Loads login form | Verifies plaintext passwords in browser `localStorage`; demo behavior |
| `/signup/` | 200 | Loads signup form | Stores plaintext passwords in browser `localStorage`; demo behavior |
| `/account/` | 200 | Redirects client-side when logged out | Auth state is browser-only; admin link is shown to every logged-in user |
| `/admin/` | 200 | Loads dashboard for any visitor | No role gate; product list is hardcoded; Firebase panels are unrelated to store auth |
| `/timeclock/` | 404 | Route does not exist | Employee timeclock is missing |
| `/api/firebase/auth` | 405/implementation-dependent | Existing route handler | Firebase Admin integration, not the requested D1 contract |
| `/api/firebase/firestore` | 405/implementation-dependent | Existing route handler | Firebase Admin integration, not the requested D1 contract |
| `/api/attendance/logs` | 405/implementation-dependent | Existing untracked route | Separate attendance implementation; not connected to store users/timesheets |
| `/api/attendance/export` | 405/implementation-dependent | Existing untracked route | Separate attendance implementation; not connected to store users/timesheets |

The live deployment returned HTTP 200 for `/`, `/login/`, `/signup/`, and
`/admin/` on the audit date. The previously reported 404 state is therefore no
longer present at the HTTP layer, but the pages remain functionally demo-only.

## Navigation and broken behavior

- Header links reach the existing routes, but the `Dashboard` link is visible
  to logged-out visitors and is not role-aware.
- Account always renders an Admin card for any authenticated local user.
- Footer `Contact us`, `IG Shop`, and `FB Catalog` point to `/admin/` rather
  than user-facing destinations.
- Product cards show a Quick View label but it is not interactive; only the
  product link works.
- Add to Bag, quantity changes, wishlist, login, and signup mutate only browser
  state and therefore reset across devices and are not tied to an account.
- Checkout does not create an order, reserve stock, or persist delivery data.
- Forgot password is a non-functional text span.
- Product detail pages use `generateStaticParams()` from the demo array, so a
  product added later in an admin UI could never be rendered by the deployed
  static build.

## Demo and placeholder sources

- `src/lib/products.ts` contains 12 hardcoded products plus hardcoded category
  and brand metadata.
- `src/lib/store.tsx` persists cart and wishlist JSON in `localStorage`.
- `src/lib/auth.tsx` persists users and plaintext passwords in `localStorage`.
- `src/app/page.tsx` contains hardcoded marketing copy and a hardcoded example
  price badge (`899 EGP`).
- `src/app/admin/page.tsx` reads the hardcoded catalog and contains placeholder
  marketing/order panels plus Firebase Admin SDK panels.
- Several UI labels claim Paymob, Meta, shipping, reviews, and factory data
  that have no backing integration or database records.

## Architecture decision

The current `next.config.ts` uses `output: "export"` and `wrangler.toml`
publishes the generated `out/` directory. Static export cannot execute secure
Next route handlers, read Cloudflare D1 bindings, set httpOnly session cookies,
or enforce server-side roles. The implementation must therefore migrate the
Pages deployment to a server-capable Next-on-Cloudflare adapter (or a Pages
Functions/API boundary) before replacing the demo state. D1 migrations will be
committed under `migrations/` and the binding will be declared in Wrangler.

## Implementation order

1. Add reproducible D1 schema and server-side database/session helpers.
2. Replace local auth with D1 users and secure cookie sessions.
3. Replace product, cart, wishlist, and checkout demo paths with D1 APIs.
4. Add role-gated admin catalog/order/user screens.
5. Add employee/admin timeclock and admin timesheet reporting.
6. Remove demo arrays and Firebase storefront dependencies, then build and
   deploy using the server-capable Pages configuration.
