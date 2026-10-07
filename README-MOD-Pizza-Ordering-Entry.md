# MOD Pizza — ordering entry and workspace redesign

Updated 7 October 2026.

## Customer entry points

The Menu screen and desktop Home begin with a familiar ordering panel:

- Current store selector.
- Prominent **Group order** button that opens creation immediately, without first visiting a group listing.
- **Pickup / Delivery** toggle.
- **ASAP / Later** toggle and visible selected-time summary.
- Desktop Home additionally provides **Order now** or **Order for later** as the primary continuation.

Desktop navigation also includes Group order. Existing group links in More and the group hub remain available.

## Mobile app handoff — Screenshot 1

At widths up to 767px, Home starts with the pizza hero and Build my pizza action, then Order now / Deals for you, the direct group creation card, Your usual and menu categories. The greeting and fulfillment panel are hidden on mobile Home. Rewards and active-order details remain further down; the five-tab bottom navigation remains available.

Order now opens Menu, where pickup/delivery and ASAP/later can be selected before browsing. Group creation opens immediately from the Home card. This is the responsive app presentation in the same HTML/CSS/JS codebase, usable in DevTools device emulation; it is not a separate native binary. Desktop retains its ordering panel and two-column Home. Developers should preserve this hierarchy when building a native shell.

## Scheduling

Later opens a day selector and time selector. Slots are generated in 30-minute intervals across the next seven days, allowing at least 30 minutes or the store's preparation-plus-delivery lead time. Sample store opening/closing hours constrain the slots, including a 15-minute closing buffer.

Times use the selected store's timezone: Pacific for the Pacific Northwest stores, Central for Austin, Mountain for Denver and Arizona time for Phoenix. Scheduled summaries in customer history/tracking use the order's store timezone.

The selected timestamp persists in browser state, initializes checkout after reload, and is inherited by new group drafts. Both the day/time picker and the existing checkout time selector remain functional. Selecting ASAP clears the scheduled timestamp. Checkout rechecks slot eligibility so stale selections cannot silently place an order at an invalid time. Order timing remains a local prototype; preparation capacity is not reserved.

Personal bag timing is preserved when a group order parks and later restores that bag. An order retains its own scheduled timestamp after placement, while the next ordinary order returns to ASAP.

## HQ workspace

- Light sidebar with grouped navigation and red active-state accents.
- Persistent workspace identity and quick links for Overview, Compare stores, Orders, Loyalty and Campaign results.
- Compact operational headings, filter bar, sales cards and report tables.
- Mobile navigation drawer with explicit open/close controls.

## Store workspace

- Assigned-store identity and a separate shift dashboard.
- Direct shortcuts for shift overview, kitchen, orders, stock and guest recovery.
- Visible pause/resume and preparation-time controls.
- Green operational KPI accents, kitchen queue and team checklist, with MOD red actions.
- No network filter or HQ configuration controls added to the store view.

## Code and verification

`ordering-ui.js` owns the ordering panel, schedule picker, slot generation and shared staff console. Existing customer, group and workspace modules connect those controls to the order state. The existing prototype remains plain HTML, CSS and JavaScript.

`tests/ordering-entry.cjs` exercises visible mobile group entry, day/time selection, persistence, group inheritance, scheduled checkout, ASAP reset, mobile navigation and responsive layouts. The six existing suites remain regression checks for ordering, rewards, groups and store administration.

Verification completed: all seven browser suites passed (`prototype`, `operations`, `loyalty-catalog`, `app-experience`, `discovery-groups`, `readiness`, and `ordering-entry`). Responsive checks cover 320, 390, 768, 1024 and 1440 pixel widths. Customer mobile and staff desktop screenshots were visually reviewed.

Screenshot 1 revision: `ordering-entry` passed again, including mobile hero/action/group/reorder/rewards order, direct group creation, scheduling via Menu, persistence, checkout and responsive widths.
