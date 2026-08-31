# DMart Ecommerce

This project is the attached DMart storefront upgraded with a simple custom backend. The storefront keeps the original direction—green DMart palette, everyday-value messaging, aisle navigation, product cards, wishlist, bag, and checkout—while catalog, cart, stock, order placement, and fulfilment status are persisted on the server.

## Project structure

| Area | Location | Responsibility |
|---|---|---|
| Frontend | `client/src/` | Pages, components, styles, browser cart context, and customer interactions |
| Backend procedures | `server/dmart/` | Catalog, cart, checkout, order, inventory, and fulfilment business logic |
| Backend entrypoint | `server/routers.ts` | Mounts the DMart tRPC router under `dmart` |
| Database schema | `drizzle/schema.ts` | Users, products, carts, cart lines, orders, and order lines |
| Shared contract | `shared/dmart.ts` | Typed shapes exchanged between the server procedures and frontend |
| Database migration | `drizzle/0001_boring_sunset_bain.sql` | Creates the DMart tables |

The frontend never queries the database directly. It calls typed procedures such as `dmart.catalog.list`, `dmart.cart.addItem`, and `dmart.checkout.place`. The backend is kept separate from the UI so catalog and fulfilment changes do not require editing page components.

## Run locally

Install dependencies and start the managed development server with:

```bash
pnpm install
pnpm dev
```

The project uses the database connection supplied by the runtime. The migration is already applied in the project database. On the first catalog request, the backend inserts the attached DMart product catalogue only when the products table is empty; it does not overwrite existing catalogue data.

Before delivering changes, run:

```bash
pnpm check
pnpm test
pnpm build
```

## Store operations

The protected operations page is available at `/admin/products` for the store owner account. It lets an administrator update product price, stock, availability, and order fulfilment status. The storefront immediately reflects stock and availability changes, and checkout performs a final server-side stock check before creating an order.

Customers can browse by aisle or search, add products to a persisted bag, adjust quantities within available stock, apply the supported checkout rules, place an order, and view private order history after signing in. Guest checkout is supported; guests receive the order number on the confirmation page, while signed-in customers also receive order history.

The checkout currently records the selected payment preference and deliberately does not collect card details. Cash on delivery is ready for direct operation. A real UPI or card charge should only be enabled after adding a payment provider and its server-side verification flow.

## Routes

| Route | Purpose |
|---|---|
| `/` | DMart landing page and featured products |
| `/products` | Searchable live catalogue |
| `/products/:category` | Category-filtered catalogue |
| `/product/:slug` | Product details and add-to-bag |
| `/cart` | Persisted shopping bag |
| `/checkout` | Validated address and order placement |
| `/orders` | Signed-in customer order history |
| `/wishlist` | Device-persisted saved products |
| `/admin/products` | Protected catalog and fulfilment operations |

## Notes for production operation

The attached product image URLs are retained as the initial visual baseline and each product has a placeholder fallback. For production, replace those URLs with approved product photography managed through the project’s storage workflow. Do not add fabricated reviews, ratings, or testimonials. Keep prices and stock changes in the operations page, and use the database migration as the source of truth for the backend schema.
