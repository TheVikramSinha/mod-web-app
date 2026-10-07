# MOD Pizza — Pooja discovery, group ordering and stakeholder roadmap

Updated 7 October 2026. All new workflows use sample data in the existing HTML/CSS/JavaScript prototype.

## Open the new experiences

- [Stakeholder view](http://127.0.0.1:4173/?v=6#roadmap)
- [HQ stakeholder navigation](http://127.0.0.1:4173/?v=6#admin/roadmap)
- [Group orders](http://127.0.0.1:4173/?v=6#group)
- [Coupon management](http://127.0.0.1:4173/?v=6#admin/coupons)
- [Campaign results](http://127.0.0.1:4173/?v=6#admin/campaign-results)

The Features & roadmap page is in HQ navigation, store-manager navigation, customer More and the customer footer. It has four phase tabs, audience filtering, search, working-feature links and a print-this-phase option. Later phases are labeled **Proposed**, with no pretend working buttons.

## Discovery review and decisions

The folder contains 161 PNG screenshots, two workbooks and one PDF, plus filesystem metadata. The full scope sheets were extracted and reviewed; screenshot review focused on representative group-order, campaign-priority and qualification screens, with the wider screenshot folders inventoried by capability. This is not a claim that every screenshot was individually audited.

| Reference | Finding | Implementation decision |
|---|---|---|
| `Pooja_Discoverywines/Extensive/Scope.xlsx` — Ordering app website | Broad ordering coverage including group/bulk orders, store eligibility, payment exceptions and service recovery | Implement host-paid group ordering now; make unbuilt guest-service scenarios visible in phase 2 |
| Same workbook — Admin Layer Loyalty | Explicit distinction between offers, rewards, coupons and campaigns; lifecycle, budgets, limits and validation | Add coupon records separately from existing campaigns; inherit underlying offer eligibility and check coupon limits at checkout |
| Same workbook — Layout design | Organize loyalty configuration, segments, offers, coupons, campaigns, validation, reporting and audit | Keep grouped HQ navigation; add Coupon management and Campaign results under Loyalty & growth |
| Chowly app / Group order screenshot | Organizer pays when everyone is ready; participants contribute to one order | One host, named baskets, readiness gates, food budgets, one checkout and one tracked order |
| Punch / Campaign Priorities and qualification screenshots | Rules and governance need explicit operating surfaces | Coupon draft/review/approval and clear inherited eligibility; generalized priority/stacking engines remain phase 3 |
| Campaign Details - Default View.xlsx | Campaign-oriented reporting distinguishes customers, spend, rewards and redemptions | Report actual local sample order attribution; do not invent reach, opens, causal uplift or ROI from order counts |
| Invoice-Redesigned.pdf | A sample franchise debit memo with sales-based fees, despite its coupon-report folder | Treat as a phase-4 financial-reconciliation reference, not a coupon-redemption report |

No source campaign amounts, customer lists, business identifiers, invoice balances or contact details were imported. Existing sample stores, members and transactions remain the demo dataset. Source files were not edited.

## Group ordering: implemented flow

### Organizer

1. Choose a store and Pickup or Delivery in the customer app.
2. Start a group from Home, Menu or More. Enter a name, food budget per person and selection deadline.
3. Add participants, or select **Try a sample group** for three ready-to-review people.
4. Open the group link, preview participants, review their labeled items and readiness.
5. Once everyone has items and is ready, select **Review & pay together**.
6. Apply one coupon or points reward, optionally use the host's gift funds/service credit, choose timing and place one order.
7. Track it normally; item labels remain visible in receipts and the store's order details.

### Participants

The participant selector simulates separate people in the same browser. Each can add to or remove from their own open basket and mark themselves ready. The host can manage all contributions and remove participants with their items.

The item picker supports pizza size/crust/sauce/toppings, salad greens/dressing, kids-meal topping/drink and cake-pop flavors. Quantity and a preparation/label note are captured. Store availability, pickup-only drinks and unavailable toppings are checked.

### Rules and edge cases

- One store, one fulfillment mode, one destination and one host payment per group.
- Default food budget: $20 per participant; creation allows $5–$200. Merchandise is assessed before discounts; tax, delivery and tip are added once at checkout.
- Up to 20 participants in the sample flow. A participant must have items and be ready before host checkout.
- Ready participants reopen their selections before editing. Passed deadlines stop selection changes; the host may extend by 30 minutes. An already-ready group may still check out.
- A group with unavailable products/ingredients or an exceeded budget cannot check out.
- The shared bag is locked for direct quantity edits; reopen the group to change it. Checkout rejects unexpected changes to the shared bag or fulfillment context.
- Ordinary personal-bag items are parked separately, then restored when the host places the group order or reopens group selections.
- The host spends/earns loyalty points. Individual participants are not separately charged or credited.
- Placing an order marks the group Placed and stores its order ID; it cannot be placed again through the group flow.
- Canceling an open group changes only that draft. After placement, order cancellation/refund follows the existing order workflow.
- Group drafts and checkout state persist after reload. Same-origin browser tabs see persisted state through the existing storage mechanism; separate-device collaboration is not simulated by the link.
- Participant invitations are not transmitted. Copying a group link does not send email, SMS or other messages.

Per-person payment, advanced invitations and group-change/refund policies are phase-2 proposals. The current host-paid flow is a working requirement, not deferred scope.

## Coupon lifecycle and reporting

### Implemented

- Single shared code or numbered batch of up to ten codes.
- Issuance to any member or a selected sample member.
- Underlying offer association: products, minimum spend, fulfillment and stores come from that offer.
- Start/end dates, total uses and per-member use limits.
- Draft → In review → Active; approved codes may be paused/resumed. Scheduled, Expired and Used up are derived states.
- Required approval note and audit entries for generation, submission, approval and activation changes.
- Drafts and in-review codes cannot discount checkout.
- Member, lifecycle, dates, store, fulfillment, product/spend and use limits are rechecked at checkout.
- Customer Deals includes a coupon wallet with available, used and expired status.
- Non-canceled orders consume coupon uses. Full refunds restore eligibility by excluding the canceled redemption.
- Seed code **TEAM5** uses the existing two-pizza/$5-off offer, with one use per member and a sample total limit of 25.
- Campaign results use selected stores, period and fulfillment filters and offer CSV export. They show attributed unique customers, order counts, gross merchandise, discount, net merchandise and average order value.

Coupon approval is a local HQ workflow; the prototype does not represent separate authenticated approvers. Full campaign scheduling/delivery and configurable approval roles remain proposed. A coupon's date window does not schedule an external message.

### Deliberately not inferred

Email/push reach and opens are not populated from the reference workbook. Attributed sales are not incremental sales. Discount given is not fulfillment cost or profit. ROI and causal lift require the proposed delivery/experiment/economic models.

## Stakeholder phase definitions

Phase 1 describes the working prototype today. Phases 2–4 are suggested scope groupings and acceptance outcomes, not dates or estimates. All can first be demonstrated with sample data.

### Current prototype — Explore working flows

Demonstrate the complete order, rewards and store-to-HQ journey with sample data.

Acceptance: customer checkout, group handoff, rewards and refunds reconcile across the three workspaces.

| Area | Audience | Capability | Scope |
|---|---|---|---|
| Order | Customer | Menu & customization | 46 items, seven categories, pizza builder, meal choices, search, favorites and store availability. |
| Order | Customer | Checkout & wallet | Pickup/delivery, scheduling, gift funds, service credit, one reward or deal, simulated card payments. |
| Order | Customer | Group ordering | Host-paid groups, named contributions, per-person food budgets, readiness, deadlines, shared review and one tracked order. Local participant simulation. |
| Order | Customer | Order aftercare | Animated delivery, history, receipts, reorder, support cases, ratings and full-order refund simulation. |
| Order | Customer | Saved preferences | Addresses and named custom pizzas. |
| Loyalty | Customer | Rewards & earning | Configurable earning, points rewards, receipt claims, welcome/explorer bonuses and reward activity. |
| Loyalty | HQ | Program administration | Points per dollar, purchase caps, optional tiers/multipliers and active member controls. |
| Loyalty | HQ | Reward qualification | Item/category, minimum spend, tier, date range, store participation and member-use limits. |
| Loyalty | HQ | Member audiences & ledger | Search, five dynamic audiences, consent visibility and reasoned points corrections. |
| Loyalty | HQ | Coupon lifecycle | Batch/shared/member-issued codes, draft/review/approval, validity, total/member limits, customer wallet and checkout validation. |
| Loyalty | HQ | Campaign results | Offer orders, attributed customer count, gross/net merchandise, discounts, average order and CSV export. |
| Loyalty | Store | Recovery approvals | Own-store requests, HQ approval, once-only credit/points issuance and observed return tracking. |
| Operations | Store | Shift workspace | Kitchen, orders, availability, ingredients, team/checklist, guest care and order pause/prep settings. |
| Operations | HQ | Network administration | Six stores, region/store filters, sales comparisons, fulfillment, pricing and order CSV exports. |
| Operations | HQ | Offer configuration | Dollar/percentage campaigns and seeded pizza/cake bundles with participating stores. |

### Phase 2 — Guest convenience & service

Make more everyday ordering and recovery situations easy to handle.

Acceptance: edge cases for group changes, pickup, substitutions and item refunds can be demonstrated end to end.

| Area | Audience | Capability | Scope |
|---|---|---|---|
| Order | Customer | Expanded group coordination | Guest join screens, invitation/reminder simulations, participant removal after lock, richer group customization and scheduled group deadlines. |
| Order | Customer | Split contributions | Per-person payment simulation, unpaid/failed contributions, host cover and participant refunds. Current groups have one payer. |
| Order | Customer | Catering & bulk orders | Headcount bundles, lead times, store capacity review and large-order preparation slots. |
| Order | Customer | Pickup & curbside | Vehicle details, arrival notification, pickup instructions and collection confirmation. |
| Order | Customer | Dine-in exploration | Optional store/table QR ordering and pay-at-table demonstrations where appropriate. |
| Order | Customer | More precise pizza builder | Half/whole placement, premium toppings, sauces, dietary/allergen and nutrition detail. |
| Order | Customer | Guest account journeys | Guest checkout, enrollment, sample verification, saved payment preferences and account deletion preview. |
| Order | Customer | Location eligibility | ZIP search, delivery zones, address validation examples, holiday hours and time-specific menus. |
| Order | Customer | Service edge cases | Payment failure/retry, missing items, substitutions, partial/item refunds and failed delivery. |
| Operations | Store | Actionable notifications | Sample order/ETA/refund notification inbox and escalation controls. |

### Phase 3 — Loyalty & growth operations

Give marketing teams precise control over audiences, incentives and lifecycle campaigns.

Acceptance: eligibility, budget, consent and holdout rules explain every campaign outcome.

| Area | Audience | Capability | Scope |
|---|---|---|---|
| Loyalty | HQ | Audience builder | AND/OR conditions, exclusions, 30/60/90-day recency, birthday, first-purchase and frozen segments. |
| Loyalty | HQ | Campaign orchestration | Draft/approval/schedule states for full campaigns, sample Email/SMS/Push reach, consent and frequency caps. |
| Loyalty | HQ | Promotion engine expansion | BOGO, Buy X Get Y, category exclusions, first-order rules, day/time schedules, priorities and controlled stacking. |
| Loyalty | HQ | Liability & budgets | Points/reward budgets, incentive-cost assumptions, outstanding liability, expiration and breakage views. |
| Loyalty | Customer | Lifecycle engagement | Birthday/referral incentives, point expiration warnings, challenges, surveys and gift-card purchase/gifting. |
| Loyalty | HQ | Automated journeys | Signup, first purchase, inactivity and redemption triggers with queued sample actions. |
| Loyalty | HQ | Controlled experiments | A/B/holdout assignment, incremental outcomes and contribution assumptions kept separate from attributed sales. |
| Loyalty | HQ | Fraud & diagnostics | Suspicious redemption queue, barcode/check-in failures, rule evidence and reviewer decisions. |

### Phase 4 — Network scale & connected operations

Extend operational visibility, integrations and commercial reporting across the network.

Acceptance: store scope, event reconciliation and financial reporting remain consistent at network scale.

| Area | Audience | Capability | Scope |
|---|---|---|---|
| Operations | HQ | Integration event hub | POS, ordering aggregator, delivery partner and payment adapters with simulated inbound/outbound events and retries. |
| Operations | HQ | Financial reconciliation | Tender settlement, taxes/fees, voids/refunds and franchise fee/debit-memo examples. |
| Operations | HQ | Delegated administration | Configurable team roles, territories, franchise scope and approval limits. |
| Operations | HQ | Data center | Field-selected/scheduled exports, backup/restore, warehouse extracts and retention controls. |
| Operations | HQ | Network capacity | Demand planning, preparation forecasts, stock-aware offers and cross-store exception management. |
| Loyalty | HQ | Intelligence & assistance | Explainable customer recommendations and campaign planning assistance with human review. |
| Loyalty | Customer | Optional business models | Paid memberships, merchandise, partner experiences and household benefits after core flows are validated. |

## Files and verification

New modules:

- `groups.js`: shared groups, participant baskets, budgets, deadlines and host checkout handoff.
- `discovery.js`: coupon records, approvals, checkout validation, coupon wallet and campaign results/CSV.
- `stakeholder.js`: phase manifest and stakeholder page. This is the owning feature list for the navigation page.

Existing ordering, loyalty, store operations and styling connect these modules. Browser migrations preserve existing sample state.

`tests/discovery-groups.cjs` covers participant budgets, readiness/host controls, labeled group checkout, coupon application, personal-bag restoration, store order details, coupon generation/approval/member limits/refund, CSV download, deadlines, cancellation, reopen/reload, roadmap filtering and responsive layouts. Existing five suites continue to cover ordering, store administration, price review, rewards and menu behavior.

### Verification result — 7 October 2026

All six browser suites passed: prototype, operations, readiness, app-experience, loyalty-catalog and discovery-groups. Syntax checks passed for the changed application modules. New views were checked at 320, 390, 768 and 1440 pixels without horizontal page overflow or browser script errors; the desktop stakeholder page and mobile group workspace were visually inspected. Later-phase cards have no misleading working-feature links.
