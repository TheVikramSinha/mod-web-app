> Update, 7 October 2026: [Menu and loyalty implementation](README-MOD-Pizza-Menu-and-Loyalty-Comparison.md) supersedes earlier seven-item-menu and hard-coded-reward descriptions. Earlier audit counts are historical.

# MOD Pizza — responsive working prototype

> **App experience update — 6 October 2026:** The current prototype now has separate customer, store-manager and HQ workspaces, expanded loyalty/deals, saved preferences and scheduling. See the [current feature guide](README-MOD-Pizza-App-Experience.md) and [README](README.md) for the implemented experience. Earlier sections below remain useful as baseline/history.


Responsive prototype of the USA product scope, built with plain HTML, CSS and JavaScript. Customer and administration views share browser-local demo data. Brand colors are `#c4122f` and `#8b0f05`.

## Critical review — 6 October 2026

The [Enterprise readiness and UX audit](README-MOD-Pizza-Enterprise-Readiness-Audit.md) covers all 120 capabilities and identifies production blockers. This remains a local prototype. The latest UI pass groups secondary admin navigation, hides irrelevant reporting filters on configuration pages, shortens the mobile hero, adds an explicit populated-bag store-change preview, requires review of changed checkout pricing and adds refund confirmation with tender/points details. `experience.js` implements these review/disclosure behaviors; `tests/readiness.cjs` verifies them.

## Latest iteration

The prototype now includes six sample stores, 900 historical/operational sample orders plus a live example, store comparisons, scoped order/fulfillment views, independent store menus/settings and richer wallet/support interactions. See the [multi-store administration guide](README-MOD-Pizza-Multi-Store-Administration.md) for the current feature matrix, workflows and metric definitions. Existing local customer data is migrated automatically on refresh.

## Run it

From this directory:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

- Customer storefront: http://127.0.0.1:4173/#menu
- Administration: http://127.0.0.1:4173/#admin
- Orders and delivery preview: http://127.0.0.1:4173/#orders

Use the same hostname and port in both tabs to share data. Open Chrome DevTools → Toggle device toolbar to try a phone or tablet, or resize the browser. The mobile view has bottom navigation, a floating cart, touch controls and bottom-sheet customization dialogs. Desktop uses a wider catalog and an order-summary sidebar. No build step is needed.

The current loopback server is accessible only on this computer. This is a responsive website, not yet an installable PWA or native app.

## Try the complete flow

1. Select **Build my pizza**, choose crust, size, sauce and toppings, then add it to the bag.
2. Visit **Rewards**, select the $5 reward, and continue to checkout.
3. Use service credit and gift funds together, select a simulated payment method for any remainder, and place the demo order.
4. Watch confirmation, preparation, oven, dispatch and delivery stages. The courier moves along an illustrative map after dispatch. Use **Next stage** or **Pause demo** to inspect the experience.
5. Open administration in another tab. Inspect the order, advance it, or cancel it to restore the demo wallet balances and eligible points.
6. Change menu availability or price in administration and check the storefront. Submit an order support request and resolve it in the administration inbox.

For an immediate moving-delivery preview, open **My orders → Preview a moving delivery**. A new sample order begins at the dispatch stage. Reset all local data under **Administration → Settings → Reset demo data**.

## Implemented features

| Area | Working prototype behavior |
| --- | --- |
| Responsive navigation | Desktop navigation; mobile bottom navigation; cart indicator; persistent address and fulfillment mode |
| Menu discovery | Categories, search, vegetarian filter, favorites, photographs, prices, sold-out state |
| Customization | Pizza size, crust, sauce and included toppings; price updates; edit existing cart item |
| Bag | Quantity controls, removal, customization summary, persistent items, computed totals |
| Fulfillment | Delivery/pickup selection, saved address, delivery notes, demo store identity |
| Checkout | Guest name/email, delivery address, tips, MOD10 promotion, reward redemption, gift funds plus service credit, simulated payment choices |
| Wallet | Separate gift and service-credit balances, transaction history, checkout deductions, cancellation restoration |
| Loyalty | Seeded points, three sample rewards, eligibility checks, points deducted on order placement, points earned once on completion |
| Tracking | Five timed stages, animated courier, changing ETA, pause/resume/advance controls, illustrative route, delivery partner card |
| Order history | Active/completed/canceled orders, reorder, receipt and item details |
| Profile | Local profile details and marketing preference |
| Support | Customer request form linked to an order; administration inbox and resolution |
| Admin overview | Demo order value, active orders, available products, support counts and recent changes |
| Admin orders | Status filters, details, stage advance, cancellation and full demo refund reconciliation |
| Admin menu | Edit prices and availability; updates reflected in customer view |
| Admin customers | Demo customer balances and points; issue service credits with a reason |
| Admin offers | Toggle the sample MOD10 promotion |
| Admin store | Store display name, pause/resume ordering, fresh delivery preview, reset demo data |
| Persistence | LocalStorage; cross-tab updates on the same origin |
| Accessibility foundations | Semantic controls, labeled fields, native modal focus handling, visible keyboard focus, skip link and live toast announcements |

## Simulation boundaries

- All orders, payment methods, funds, loyalty rules, prices and nutrition values are demonstration data. Apple Pay/Google Pay choices do not invoke payment-provider SDKs. No card details are collected and no money is charged.
- The wallet starts with $25 in gift funds and $5 in service credit; the customer starts with 125 points. This is not a claim about MOD's actual rewards program.
- The illustrative route is fixed, not geocoded to the entered address. Courier movement is a browser timer, not GPS. The full lifecycle runs in 180 seconds; displayed minute estimates are accelerated demo values. Pickup does not move the courier.
- Tax is a fixed illustrative 8.75% on eligible discounted merchandise; delivery fees vary by selected sample store (starting at $2.99). Production needs jurisdiction-aware tax and provider-backed fees.
- Funds, points and inventory have no server authority. Tabs share state, but concurrent writes are not transactional. Do not use this prototype for real commerce or personal customer data.
- Administration has no authentication or permissions. Local profile editing is not account registration/sign-in. There is no backend, POS/KDS dispatch, live courier contact, email/SMS/push, actual refund processing, delivery eligibility validation, or payment tokenization.
- Wallet top-ups and gift-card redemption now have local demo flows. Real gift-card purchase, payment-funded top-ups and redemption still require integrations.
- Local assets work without fetching menu images. Google Fonts is optional; system font fallbacks apply when offline. Offline ordering/service-worker behavior is not implemented.

## Scope continuity and next implementation parts

The prototype demonstrates the core customer/admin journey; it does **not** implement the entire earlier feature inventory. The comprehensive scope and implementation plan remain the source of truth:

- [USA product scope](README-MOD-Pizza-USA-Product-Scope.md)
- [USA implementation plan](README-MOD-Pizza-USA-Implementation-Plan.md)
- Original requirements: `MOD-Web-App.xlsx`

Suggested next parts, following those documents:

1. **Complete customer journeys:** store finder and delivery zones, address validation, scheduled orders, richer modifier/allergen rules, guest/account flows, saved preferences, group/catering flows and remaining scoped ordering features.
2. **Durable backend and administration:** identity, roles, multi-store menus, inventory, authoritative order state, database-backed wallet/loyalty ledger, audit trails, operational reports and support workflows.
3. **Commerce integrations:** payment provider, gift cards, tax, promotions, partial/full refunds, reconciliation and POS/KDS integration.
4. **Real delivery:** delivery-provider dispatch, authenticated location feed, real mapping/routing, webhook-driven state, ETA updates, delay/unavailable-driver states and notifications.
5. **App readiness and release quality:** installable PWA, permitted notification flows, resilient reconnect/offline behavior, accessibility audit, device/browser testing, monitoring, security and performance validation.

No production deployment is included in this slice.

## Files and verification

- `index.html`: document shell, viewport metadata and app entry point.
- `styles.css`: branding, layouts and responsive rules.
- `app.js`: customer routing, state, commerce simulation and tracking.
- `operations.js`: multi-store data, administration, metrics, store selection and extended interactions.
- `assets/`: locally optimized menu photography.
- `tests/prototype.cjs` and `tests/operations.cjs`: optional Playwright browser regression checks.

JavaScript syntax check:

```sh
node --check app.js
```

With Playwright and Google Chrome available, start the local server and run:

```sh
node tests/prototype.cjs
```

If Playwright lives in another dependency directory, set `NODE_PATH` to that directory. Screenshots default to `/private/tmp/mod-prototype-qa`; set `QA_OUTPUT` to change it.

Browser checks cover catalog image loading, layouts from 320–1920 pixels, checkout at phone/tablet/desktop widths, customization, reward and split-wallet deductions, moving/paused courier, support submission, cancellation refunds, menu changes and persistence. Verification is in desktop Chrome with resized viewports; physical iOS/Android devices and Safari have not been tested. This is not a full accessibility audit.

## Visual asset attribution

Menu photographs originate from the public [MOD Pizza menu](https://modpizza.com/menu/) and are included locally for this requested brand prototype. Branding and photography belong to their respective owners; this exploration is not an official MOD production service. See [asset sources](assets/SOURCES.md) for the source URLs. The MOD wordmark treatment is a typographic approximation, not an official logo asset. Interface icons and the delivery illustration are code-generated SVGs. Barlow Condensed and DM Sans are loaded through Google Fonts.
