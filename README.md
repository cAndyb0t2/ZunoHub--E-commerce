# ZunoHub Ecommerce

This project is the attached storefront upgraded into ZunoHub with a simple custom backend. It keeps the established green value-led direction, aisle navigation, product cards, wishlist, bag, and checkout while catalog, cart, stock, order placement, delivery estimates, and fulfilment status are persisted or calculated through the server.

## Project structure

| Area | Location | Responsibility |
|---|---|---|
| Frontend | `client/src/` | Pages, components, styles, browser cart context, and customer interactions |
| Backend procedures | `server/zunoApp/` | Catalog, cart, checkout, order, inventory, and fulfilment business logic |
| Backend entrypoint | `server/routers.ts` | Mounts the custom commerce router under the internal `zunoApp` namespace |
| Database schema | `drizzle/schema.ts` | Users, products, carts, cart lines, orders, and order lines |
| Shared contract | `shared/zunoApp.ts` | Typed shapes exchanged between the server procedures and frontend |
| Database migration | `drizzle/0001_boring_sunset_bain.sql` | Creates the commerce tables |

The frontend never queries the database directly. It calls typed procedures such as `zunoApp.catalog.list`, `zunoApp.cart.addItem`, and `zunoApp.checkout.place`. The backend is kept separate from the UI so catalog and fulfilment changes do not require editing page components.

## How everything works

A customer opens the React frontend in `client/src/`. The header and page components ask the typed tRPC client for catalogue data. The request reaches `server/routers.ts`, which forwards it to the focused modules in `server/zunoApp/`. Those modules read or update the MySQL-compatible database through Drizzle and return small ZunoHub-specific objects defined in `shared/zunoApp.ts`. This keeps database column names and business rules out of the browser.

The catalog is seeded from the attached product baseline the first time the product table is empty. After that, the database is the source of truth. Product cards use the product slug for detail navigation and show the live price, discount, stock count, and availability. Search and category filtering are handled by the catalog procedure, so the UI does not need a second copy of the product list.

The bag is persistent. When the customer adds an item, the server creates a cart ID and the browser stores only that ID in local storage. Every quantity change is sent back to the server, where the requested quantity is capped by current stock. The cart response contains recalculated subtotal, product savings, delivery fee, and total, which means the browser does not control the final price.

Checkout collects delivery details and a payment preference. The final checkout procedure re-reads the cart, validates the coupon and address fields, checks every item’s current stock, decrements inventory inside one database transaction, creates an order snapshot, converts the cart, and removes its active lines. If any product cannot be supplied, the transaction fails instead of creating a partial order. Every order receives a new readable `DM...` order number; the database unique constraint is the final guard, and the service retries with a fresh token if a collision ever occurs. The confirmation page receives the saved order number, and signed-in customers can later see the same order through `/orders`.

Authentication is optional for shopping. Guest customers can browse, keep a bag, and place an order. The secure authentication integration is used for private order history and the protected operations page, while the customer-facing sign-in dialog uses neutral ZunoHub wording. The operations page checks the signed-in user’s admin role on the server; hiding a button in the frontend is not used as the security boundary.

The complete request flow is:

| Step | What happens |
|---|---|
| Browse | Frontend calls `zunoApp.catalog.list`; backend reads active products from the database. |
| Add to bag | Frontend sends a product ID; backend creates or updates the persisted cart and enforces stock. |
| Review bag | Frontend displays the backend-calculated totals returned for the cart ID. |
| Place order | Backend validates details, rechecks stock, decrements inventory, writes order and order lines, and closes the cart in one transaction. |
| Fulfilment | Admin changes the order from confirmed to packed, out for delivery, delivered, or cancelled. |
| History | Signed-in customers call `zunoApp.orders.mine` to see their own persisted order snapshots. |

## Run locally

Install dependencies and start the managed development server with:

```bash
pnpm install
pnpm dev
```

The project uses the database connection supplied by the runtime. The migration is already applied in the project database. On the first catalog request, the backend inserts the attached product catalogue only when the products table is empty; it does not overwrite existing catalogue data.

Before delivering changes, run:

```bash
pnpm check
pnpm test
pnpm build
```

## Store operations

The protected operations page is available at `/admin/products` for the store owner account. It lets an administrator update product price, stock, availability, and order fulfilment status. The storefront immediately reflects stock and availability changes, and checkout performs a final server-side stock check before creating an order.

Customers can browse by aisle or search, add products to a persisted bag, adjust quantities within available stock, apply the supported checkout rules, place an order, and view private order history after signing in. Guest checkout is supported; guests receive the order number on the confirmation page, while signed-in customers also receive order history.

Checkout supports cash on delivery plus a clearly labeled mock UPI/card gateway for testing. Use `demo@zunobank` for UPI or card `4242 4242 4242 4242`, expiry `12/30`, CVV `123`. The mock gateway returns a simulated transaction ID and never charges or stores real payment credentials. Replace it with a real provider and server-side verification before accepting live payments.

## Routes

| Route | Purpose |
|---|---|
| `/` | ZunoHub landing page and featured products |
| `/products` | Searchable live catalogue |
| `/products/:category` | Category-filtered catalogue |
| `/product/:slug` | Product details, pin-code delivery estimate, and add-to-bag |
| `/cart` | Persisted full shopping bag; the header also opens a live slide-out panel |
| `/checkout` | Validated address and order placement |
| `/orders` | Signed-in customer order history |
| `/wishlist` | Device-persisted saved products |
| `/admin/products` | Protected catalog and fulfilment operations |

## Notes for production operation

The attached product image URLs are retained as the initial visual baseline for ZunoHub and each product has a placeholder fallback. For production, replace those URLs with approved product photography managed through the project’s storage workflow. Do not add fabricated reviews, ratings, or testimonials. Keep prices and stock changes in the operations page, and use the database migration as the source of truth for the backend schema.

The customer-facing routes and sign-in dialog contain no visible Manus watermark or vendor branding. A few internal authentication/session keys and runtime diagnostic asset paths retain infrastructure names; they are not rendered in the storefront and should not be removed because the secure sign-in and hosted runtime depend on them.

## ZunoHub enhancements

Product pages include a pin-code checker backed by `zunoApp.delivery.estimate`. Enter a six-digit Indian pin code to receive a planning window calculated in business days. The response explicitly reports invalid or currently unsupported pin codes; it is an estimate, not a courier guarantee.

The header bag icon opens a slide-out panel on every storefront route. It reads the same server-calculated cart object as `/cart`, so quantity changes update stock limits, subtotal, delivery fee, savings, and total in the panel and full cart together. The browser never calculates the final payable amount itself.

The checkout payment step has two testing-only methods: mock UPI and mock card. UPI accepts `demo@zunobank`; card accepts `4242 4242 4242 4242`, `12/30`, and `123`. The backend validates those shapes and returns a simulated `ZUNO-UPI-...` or `ZUNO-CARD-...` transaction ID. No payment is captured and no card data is persisted. Cash on delivery remains available as the non-simulated option.

The customer-facing name is now ZunoHub, including the browser title, logo text, authentication copy, catalogue copy, order history, operations heading, seeded product brand, and confirmation copy. The implementation folders and tRPC namespace use `zunoApp`; only the legacy `DMART10` coupon and old browser storage keys remain accepted for backward compatibility.

## Latest ZunoHub refinements

The `/orders` page now serves as a private order history, with each purchase showing its fulfilment timeline and a link to `/orders/:orderNumber`. The tracking view loads the order by number through a protected backend procedure, so a signed-in customer can see only their own order, its current status, delivery address, payment summary, and item-level totals.

The header search now provides deferred product auto-suggestions after two characters. The catalogue search is URL-backed and supports category links plus price ranges: under ₹100, ₹100–₹300, ₹300–₹500, and ₹500 or more. Filter selections can be shared or refreshed without losing the current result state.

The visual theme uses a richer emerald primary, deep teal text, pale mint surfaces, warm citrus accents, and a softer border system. Focus rings, button contrast, touch targets, and responsive stacking are retained while the palette adds more separation between navigation, content, discounts, delivery details, and status badges.

The project-controlled feature folders are now named `client/src/components/zunoApp/`, `server/zunoApp/`, and `shared/zunoApp.ts`. The managed project root remains unchanged because it is controlled by the hosting workspace. Existing shoppers’ old `dmart-cart-id` and `dmart-wishlist` browser keys are read once as backward-compatible fallbacks, while new state is stored under `zunoApp` keys.

The reusable agent workflow is packaged separately at `/home/ubuntu/skills/zunohub-ecommerce-workflow/SKILL.md` and has passed the skill structure validator.

## Profile, login, and one navigation bar

The `/profile` page uses the existing authenticated session from `useAuth()`. Signed-in shoppers see their display name, email when available, secure-account status, links to orders and shopping, and a sign-out action. Signed-out visitors see a short explanation and a secure sign-in button. The existing OAuth flow starts only from the button action, and the storefront does not collect passwords.

The customer-facing header now uses one primary navigation bar. Brand, search, category links, account, location, and bag controls share the same responsive header instead of using a separate second navigation strip. On small screens, category links remain horizontally scrollable and account and bag controls use compact icon-first presentation.

## Account feedback, catalog growth, and demo payments

After a successful authenticated session becomes available, the storefront shows one welcome toast per browser session for that account. The profile page lets shoppers update their display name through a protected server mutation; successful saves show a confirmation toast, while invalid or failed saves show an error toast. Email remains supplied by the secure account connection rather than being edited as free-form checkout data.

The catalog initializer now adds only missing ZunoHub products, so expanding the seed does not overwrite existing prices, stock, or operator changes. The assortment includes additional staples such as Moong Dal, Poha, Green Peas, Plain Curd, Orange Juice, Masala Oats, Toilet Cleaner, and Kitchen Tissue Roll.

Mock UPI and card checkout now provide a short authorization state, input normalization for card groups and expiry dates, disabled duplicate submissions, explicit validation errors, and a simulated transaction result. These interactions are still testing-only: no real payment network is contacted, no card details are stored, and the demo credentials remain documented in the checkout guidance.
