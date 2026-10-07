# MOD Pizza — customer app, store manager and HQ

Updated **7 October 2026**. A working HTML/CSS/JavaScript prototype with MOD branding, an app-style customer experience and distinct store/HQ workspaces.

## Open the app

Start the local server from this directory:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

- [Customer app](http://127.0.0.1:4173/?v=9#home)
- [Store manager — Downtown Seattle](http://127.0.0.1:4173/?v=9#store/sea/today)
- [HQ workspace](http://127.0.0.1:4173/?v=9#admin)

Refresh an existing tab to load the redesign. The workspace picker offers all six store-manager previews. Resize the browser or use DevTools device mode to try phone and tablet layouts.

## Coupon removal and membership enrollment

- Bag and checkout show **Remove coupon** whenever a code is selected. Removal clears the saved code and recalculates discount, tax and payment due; checkout contact details and bag are preserved. Invalid codes can also be removed directly.
- **Join MOD Rewards** appears on Home below the main shopping actions, Rewards, More and checkout. The sample form validates name/email, offers optional marketing consent (unchecked), allows cancellation and persists enrollment locally. After joining, these invitations become member-pass shortcuts.
- This enrollment uses the existing sample customer, points and wallet data without adding a sign-up bonus or resetting the bag. It does not create a live MOD account. Authentication, email verification, account linking and real membership terms remain integration work for a later phase.
- Browser coverage: `tests/membership-coupons.cjs` checks removal, totals, persistence, form validation/cancel, enrollment, consent, preserved checkout details and mobile/desktop layouts.

## Latest update: faster ordering and redesigned workspaces

Mobile Home now follows the supplied Screenshot 1: pizza hero, **Order now / Deals for you**, **Start a group order**, reorder, and menu categories. Rewards and active-order details follow those primary actions. The mobile home hides the greeting and fulfillment panel; **Order now** opens Menu with **Pickup / Delivery** and **ASAP / Later** controls. Desktop retains the fuller ordering panel. Group order opens creation directly. Later opens a day-and-time picker covering the next seven days, using the selected store's timezone and sample opening hours. Selections persist through refresh, browsing and checkout; group orders inherit the chosen time. ASAP clears the scheduled selection.

HQ and store-manager interfaces have been redesigned with light navigation, compact dashboard typography, task shortcuts, clearer cards and mobile navigation drawers. HQ emphasizes network comparison and reporting; stores emphasize kitchen, orders, stock and guest recovery.

[Ordering entry and workspace details](README-MOD-Pizza-Ordering-Entry.md)

## Pooja discovery and stakeholder roadmap

- **[Features & roadmap](http://127.0.0.1:4173/?v=9#roadmap):** navigation page separating working features from proposed phases 2, 3 and 4, with audience filters and feature links.
- **[Group orders](http://127.0.0.1:4173/?v=9#group):** host-paid groups, participant baskets and budgets, readiness, deadlines, named items, one checkout and tracking. Try a sample group to explore immediately.
- **[Coupon management](http://127.0.0.1:4173/?v=9#admin/coupons):** draft/review/approval, shared or member-issued codes, date/use limits and customer coupon wallet.
- **[Campaign results](http://127.0.0.1:4173/?v=9#admin/campaign-results):** attributed sample sales, discounts, orders, customers and CSV export.

[Discovery review and complete phase scope](README-MOD-Pizza-Discovery-and-Roadmap.md) explains Pooja's source references, current implementation, sample walkthroughs and remaining proposals. All additions use sample data.

## Menu and loyalty administration

- **46 menu items, seven categories:** compact category browsing, expanded pizza toppings, salad/kids/cake-pop selections, pickup-only drinks, free extras and store-specific availability.
- **[HQ loyalty administration](http://127.0.0.1:4173/?v=9#admin/loyalty):** program rules, tier multipliers, reward editor, member audiences/ledgers, recovery approvals and results.
- **[Store rewards & recovery](http://127.0.0.1:4173/?v=9#store/sea/rewards):** local reward rules and compensation requests that HQ reviews before issuance.
- Rewards and earning rules now feed the working customer checkout. Refunds reconcile points and reward use.

Read [Menu and Ember loyalty comparison](README-MOD-Pizza-Menu-and-Loyalty-Comparison.md) for the implementation, source assumptions, walkthrough and explicit deferrals. The supplied Ember README was comparison material; MOD does not claim all of Ember's capabilities.

## What’s new

**Customer:** home, points progress, earn/redeem rewards, receipt claims, one-time bonuses, wallet, member pass, deals and bundles, saved pizzas, address book, scheduled orders, go-to reorder, order history, animated tracking, chat and feedback.

**Store manager:** assigned-store shift dashboard, kitchen tickets, item/ingredient availability, team status, checklist, guest cases/feedback, pause/resume and prep-time controls. No network selector or HQ campaign editor in this workspace.

**HQ:** regional/store reporting, comparisons, exports, guest/product insights and campaign creation with participating-store controls. Campaigns feed the customer Deals screen.

## Full walkthrough and feature guide

Read [App experience and workspaces](README-MOD-Pizza-App-Experience.md) for every new interaction, sample offer rule, research reference and test command.

Quick demo: claim `DEMO40` in Rewards → Earn points, collect the welcome bonus, then redeem the pizza reward. `MODGIFT25` adds a sample gift card once. Both are local prototype flows.

## Documentation

| Document | Purpose |
| --- | --- |
| [App experience and workspaces](README-MOD-Pizza-App-Experience.md) | Current customer, store-manager and HQ experience; walkthrough and verification |
| [Multi-store administration](README-MOD-Pizza-Multi-Store-Administration.md) | Store data, reporting definitions and shared admin behavior |
| [Prototype guide](README-MOD-Pizza-Prototype.md) | Original ordering/wallet/tracking setup and behavior |
| [Product scope](README-MOD-Pizza-USA-Product-Scope.md) | Full requirements and original workbook inventory |
| [Implementation plan](README-MOD-Pizza-USA-Implementation-Plan.md) | Overall design and work packages |
| [Readiness audit](README-MOD-Pizza-Enterprise-Readiness-Audit.md) | Background capability coverage and future system considerations |

## Files

- `index.html`, `styles.css`, `app-experience.css`: responsive app shell and visual design.
- `app.js`: shared ordering, local state, wallet and tracking.
- `operations.js`: sample network, administrative reporting and store configuration.
- `experience.js`: store-price review, checkout review and refund confirmation.
- `journeys.js`: customer home, deals, loyalty, saved preferences and related journeys.
- `workspaces.js`: distinct store-manager and HQ experiences.
- `tests/`: four Playwright suites for customer, operations, review and new app journeys.

No build step is required. Existing browser data is migrated, not reset. All transactions, staff personas and courier movements are demonstrations; no real orders or messages are sent to restaurants or drivers.

## New verification suite

With Playwright and Chrome available, run `node tests/loyalty-catalog.cjs` alongside the four existing suites. Set `NODE_PATH` if Playwright lives in a shared dependency directory. This covers menu selection, reward configuration/redemption, earning snapshots, refunds, adjustment validation, recovery approval, store isolation and responsive layouts.

Run `node tests/discovery-groups.cjs` for group ordering, coupon lifecycle and stakeholder-page verification.
