# MOD Pizza — multi-store prototype, iteration 2

> **App experience update — 6 October 2026:** The current prototype now has separate customer, store-manager and HQ workspaces, expanded loyalty/deals, saved preferences and scheduling. See the [current feature guide](README-MOD-Pizza-App-Experience.md) and [README](README.md) for the implemented experience. Earlier sections below remain useful as baseline/history.


This iteration expands the original single-store HTML/CSS/JavaScript prototype into an illustrative six-store network. It is a working local demonstration, not a production MOD management system.

## Critical review update — 6 October 2026

See the [Enterprise readiness and UX audit](README-MOD-Pizza-Enterprise-Readiness-Audit.md) for the complete capability-gap register. Daily operations now remain visible, with Network insights and Manage & configure grouped behind disclosure controls. These are navigation groups, not access restrictions. Menu, Offers and Settings show only applicable configuration scope. Populated-cart store changes now have a before/after review, changed checkout pricing requires acknowledgement, and cancellation opens a tender/points refund preview before confirmation. The local data model and production limitations below still apply.

## Open the experience

Start the server from this directory if it is not already running:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

- Network dashboard: http://127.0.0.1:4173/#admin
- Store comparison: http://127.0.0.1:4173/#admin/compare
- Fulfillment board: http://127.0.0.1:4173/#admin/fulfillment
- Customer website: http://127.0.0.1:4173/#menu

Refresh an existing browser tab to load the changes. Existing version-1 customer balances, cart, orders and preferences are retained during migration. The sample network is added once. Resetting all demo data is available from an individual store’s Settings page.

## Sample data

| Data | Included |
| --- | --- |
| Locations | 6 illustrative stores: Downtown Seattle, Bellevue Square, Pearl District, South Congress, Cherry Creek and Arcadia |
| Regions | Pacific Northwest, Central, Mountain and Southwest |
| Orders | 900 seeded operational orders over 30 days, plus the original live delivery example; newly placed orders add to the same network |
| Customers | 24 sample customers, plus the storefront profile; 5 historical sample orders are assigned to the storefront profile |
| Fulfillment | Delivery and pickup, completed and canceled orders, active queues, delay examples, preparation durations and promised times |
| Store differences | Prices, menus, paused state, fees, preparation estimates, hours, managers, team size, capacity and promotional availability |
| Support | 6 sample cases with open/resolved states; customer-submitted cases are added to the appropriate store |
| Wallet | Opening balance activity, points, gift funds, service credit, checkout entries, demo top-ups/redemption and refund events |

Names, addresses, hours and performance are illustrative and are not claims about actual MOD locations or operating results. Date filters use the browser’s timezone. The seeded history is generated on first migration/reset; it does not regenerate on every visit.

## Administrative navigation

| View | Implemented interactions |
| --- | --- |
| Overview | Network/store metrics, daily sales chart, fulfillment mix, store-performance table, paused/delayed alerts and scoped recent changes |
| Stores | Location cards with hours, manager, sales and active orders; detailed location modal; dashboard/settings drill-down |
| Compare stores | Choose stores, sort by sales/orders/on-time/name, compare orders, sales, AOV, delivery/pickup mix, on-time rates, active orders, cancellations/refund value and average preparation |
| Orders | Search by order/customer/store, status filter, pagination, receipts, line items, payment breakdown, order advancement and full demo cancellation |
| Fulfillment | Four queues for new/preparing/oven/dispatched-or-ready orders; delay indicators; order details and next-stage controls |
| Menu | Select an individual store and edit product price or availability; all other store menus stay unchanged |
| Customers | Customers associated with scoped orders, order/spend totals, profile detail, points, gift funds and service credit; credit issuance targets the selected customer |
| Support | Scoped cases, order drill-down and resolution action |
| Offers | Enable/disable MOD10 independently at each selected store |
| Settings | Individual-store name, manager, hours, planned staffing, capacity, prep estimate, delivery fee, fulfillment capabilities and order acceptance |

### Scope controls

- **Store:** All stores for a network view, or one store for focused operations. This is independent of the customer’s selected store.
- **Period:** Today, last 7 days or last 30 days, including the current calendar day.
- **Fulfillment:** All, Delivery or Pickup.
- **Order status/search:** Additional filters on the Orders view; Clear filters resets status/search/fulfillment without changing the store or period.
- **Export orders CSV:** Downloads orders for the current scope. On the Orders page it also honors search and status. Exports contain order, store, customer, date, fulfillment, status and the monetary breakdown.
- Filter selections persist in the current browser tab’s session across reloads. They are not shared as customer store selections.

Dates and fulfillment filters apply to operational records and metrics. Menu, offers and settings are current store configuration, so they do not change when the date range changes. Customer wallet values are customer-wide; spend/order counts are scoped. Alerts and support counts use the selected record scope.

### Metric definitions

| Metric | Definition |
| --- | --- |
| Net merchandise sales | Non-canceled merchandise subtotal less merchandise discounts; excludes tax, delivery fees and tips |
| Orders received | All orders created in the selected period, including cancellations |
| Average order value | Net merchandise sales divided by non-canceled order count |
| Delivery / pickup | Counts of non-canceled orders by fulfillment mode |
| Active orders | Non-canceled orders that have not reached Delivered/Collected |
| Completed orders | Delivered or Collected orders |
| On-time fulfillment | Completed orders with recorded timing that met their promised duration, divided by completed orders with recorded timing |
| Average preparation | Mean recorded preparation duration among completed orders with timing |
| Canceled / refunded | Canceled order count and full illustrative total returned, including tax, delivery and tips |
| Daily sales | Net merchandise sales grouped by order creation date |

Orders without recorded fulfillment timings do not contribute zeros to averages or on-time rates. A scope without timing displays “—”. The store comparison uses the same metric calculations as the overview.

## Store isolation and customer ordering

The storefront now has **Change store** and a store-selection dialog. Selecting a store changes menu prices, availability, delivery fee, prep estimate, promotional eligibility and order acceptance. Existing bag items remain but are repriced for the selected store; a before/after review now requires acceptance before the store changes. Unavailable items must be removed before checkout.

Every new order stores its own `storeId`, customer identity, item prices and order totals. Subsequent store/menu changes do not rewrite those historical snapshots. Administrative filtering does not move a cart to another store. Pickup/delivery capability is validated during checkout, including if an administrator changes availability after the bag is created.

The customer order history displays only the storefront profile’s orders, rather than the entire network’s customer history. Issuing credit to another sample customer does not modify the storefront customer’s wallet.

## Interaction refinements

- Saved favorites clears an incompatible vegetarian filter so saved pizzas are actually visible.
- Rewards now has a direct return-to-checkout action when a bag exists.
- Guest name, email, address and delivery instructions survive in-app navigation between checkout and rewards during the current page session.
- Gift funds support a local **Add demo funds** flow and a once-per-browser sample gift redemption code, `MODGIFT25`.
- Invalid and already-redeemed gift codes show inline feedback; no real gift cards or charges are involved.
- The delivery contact button opens a local chat with message history and clearly labeled automated demo replies; a real support case can be created in the local admin inbox.
- The map zoom and recenter buttons change the illustrative route viewport.
- Detailed order views, full receipts, queue advancement, store drill-down, pagination, sorting, CSV export and support resolution have working behavior.
- The narrow-screen wallet layout accommodates larger balances and longer activity history without page overflow.

## Demo clock and recorded samples

Newly placed orders and **Preview a moving delivery** use the existing accelerated delivery simulation. The historical network data uses recorded sample statuses, including a stable active queue that can be advanced manually. It is intentionally labeled as sample/recorded data; it is not a live integration with MOD stores.

Hours, staffing and capacity are editable planning values. They do not enforce labor scheduling or automatically open/close the store. Pause, fulfillment capabilities, delivery fees and prep estimates do affect the ordering flow. Changes persist to browser LocalStorage and synchronize across tabs on the same origin.

## Verification

The test suites use Playwright with Google Chrome against the local server:

```sh
node --check app.js
node --check operations.js
node tests/prototype.cjs
node tests/operations.cjs
```

Set `NODE_PATH` if Playwright is available in an external dependency directory. No application build step is required.

Checks cover:

- Existing ordering, customization, rewards, split-wallet payment, refunds, courier motion and pause behavior.
- Store/date/fulfillment scope, comparison selection/sorting, CSV download, order search and pagination.
- Store-specific price/availability, pause and fee changes; independent customer/admin selection.
- Separate customer balances, top-ups, invalid/duplicate gift redemption, support resolution and fulfillment advancement.
- Cross-tab persistence, customer favorites navigation, checkout draft retention, chat, map zoom/recenter and responsive page widths.

Desktop Chrome is tested at resized mobile/tablet/desktop widths. Physical iOS/Android devices, Safari, full accessibility conformance and production load are not yet validated.

## Technical organization and remaining work

- `operations.js` contains sample-network migration, store/metric helpers, administration views, store selection and additional wallet/chat workflows.
- `app.js` retains customer ordering, local state, wallet/order mutations, tracking and shared UI helpers.
- `styles.css` covers both experiences; `index.html` loads the two scripts in order.
- Data remains under the existing `mod-pizza-prototype-v1` key, with a multi-store schema extension. Operations filters use a separate SessionStorage key.

Production still needs authenticated headquarters/regional/store roles, server-enforced store access, transactional ledgers, database-backed order state, real payment/tax/gift-card/loyalty integrations, actual POS/KDS and courier APIs, geocoded addresses, operational monitoring and audit controls. LocalStorage is not an authoritative financial or multi-user datastore. Partial refunds, granular permissions, inventory synchronization and true workforce/capacity enforcement are not implemented in this iteration.

The comprehensive requirements remain in [Product scope](README-MOD-Pizza-USA-Product-Scope.md) and [Implementation plan](README-MOD-Pizza-USA-Implementation-Plan.md). This document records the implemented second prototype slice, not completion of every feature in those plans.
