# MUSE WEAR Setup

## Cloudflare

- Pages project: `muse-wear`
- D1 database: `muse-wear`
- Wrangler binding: `DB`
- Migration: `migrations/0001_initial_schema.sql`

Apply future migrations with `npx wrangler d1 migrations apply muse-wear --remote`
after adding them to the versioned `migrations/` directory. Do not execute
schema changes ad hoc.

## Initial administrator

The initial administrator is `admin@muse.com`. Its password was supplied
out-of-band during provisioning and stored only as a PBKDF2-derived value in
D1. Change the password after the first successful login. Do not put the
password in source control, migration files, logs, or screenshots.

To provision or rotate the seed hash manually, set `MUSE_ADMIN_PASSWORD` in
the shell and run `node scripts/seed-admin.mjs`; pipe the resulting SQL directly
to Wrangler. The script intentionally refuses to run without that environment
variable and never contains the password itself.

## Deployment architecture

The storefront remains a static Next export for the existing Pages asset build.
Runtime authentication and D1 operations are implemented in
`functions/api/[[path]].ts`, which Cloudflare Pages deploys alongside `out/`.
The Pages Function requires the `DB` D1 binding in `wrangler.toml`.

The storefront, cart, wishlist, admin UI, and order creation still need to be
migrated from the legacy demo arrays/local state to these runtime endpoints
before a production deployment should be made.
