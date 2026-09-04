This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
"# MUSE-WEAR" 
# Taager Fulfillment

Taager imports are grouped into one MUSE WEAR product when names differ only by
size or color. Each grouped product stores a `product_variants` row containing
the exact Taager product ID/SKU. Customers select the grouped product and size;
the order endpoint resolves the matching source SKU server-side and calculates
the customer price as `Taager price * 1.75`.

Preview an export before importing:

```bash
curl -X POST https://YOUR-DOMAIN/api/taager/preview \
  -H 'content-type: application/json' \
  -H 'cookie: muse_session=ADMIN_SESSION' \
  --data-binary @taager-products.json
```

The import endpoint is the same request sent to `/api/taager/import`. A product
record may include `size`, `color`, `sku`, `basePrice`, `images`, `vendorId`,
and `vendorName`. The importer excludes MUSE products and non-clothing records.

If `TAAGER_API_URL`, `TAAGER_API_TOKEN`, and `TAAGER_STORE_ID` are configured as
Cloudflare Pages secrets, a successful order is submitted to the configured
adapter after it is stored locally. Without them, the order remains `queued`
for manual fulfillment; it is never sent to a guessed Taager endpoint.
