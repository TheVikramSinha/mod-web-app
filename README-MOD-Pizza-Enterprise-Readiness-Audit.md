> Update, 7 October 2026: [Menu and loyalty implementation](README-MOD-Pizza-Menu-and-Loyalty-Comparison.md) supersedes earlier seven-item-menu and hard-coded-reward descriptions. Earlier audit counts are historical.

# MOD Pizza — critical readiness and UX audit

> **Subsequent prototype update:** This audit preceded the fuller app/workspace build. Current behavior is documented in [App experience and workspaces](README-MOD-Pizza-App-Experience.md). The capability rows below have been updated for the new local demonstrations; operational-system considerations remain background.


Reviewed: **6 October 2026**. Sources: current `app.js`, `operations.js`, `experience.js`, `styles.css`, the two original scope/implementation READMEs, and browser regression checks. This is an internal assessment of this prototype, not an assessment of MOD’s actual technology stack.

## Verdict

**Suitable for stakeholder demonstrations and moderated journey testing. Not suitable for live enterprise operations, real customer accounts, money, or store fulfillment.** Six stores and 900 sample orders improve the demonstration; they do not establish scale, reliability, security, or operational readiness. A browser-only application can look complete while lacking the systems needed to fulfill an order correctly.

The prototype validates presentation and local interactions. No claim of enterprise readiness, WCAG conformance, production payment safety, or scale-test success is made. Existing browser checks are regression evidence for the scenarios they exercise, not proof that all requirements are satisfied.

## Critical findings and delivery order

| Priority | Finding in the current code | Required outcome and acceptance evidence |
| --- | --- | --- |
| Block launch | No staff/customer authentication; every admin route is reachable | Real identity, staff MFA, server-enforced organization/region/store permissions; automated cross-store authorization-denial tests |
| Block launch | LocalStorage holds balances, orders and mutable audit data; last-writer-wins across tabs | Transactional persistent storage, authoritative ledger, authenticated APIs, idempotency and concurrency tests; restore/reconciliation drills |
| Block launch | Payment choices and confirmation are immediate simulation | Tokenized payment integration, pending/declined/unknown outcomes, reliable POS acceptance; payment-success/order-failure and duplicate-webhook tests |
| Block launch | Store hours/availability are mostly planning data; address is plain text | Address/zone validation, store timezone and holiday hours, scheduled capacity, cutoffs, inventory and order-acceptance acknowledgement |
| Block launch | Menu/nutrition and loyalty policies are illustrative | Confirm authoritative menu/modifier/allergen/nutrition and earning/redeeming/refund policies; contract-test snapshots against real systems |
| Block launch | Refunds lack partial allocation, staff approvals and reconciliation | Policy-based cancellation, tender-specific partial/full refunds, approvals and financial reconciliation; audit trail and reversal tests |
| High | Existing points reversal clamps a negative result to zero | Define redeemed-earned-points reversal/debt policy; a zero clamp is not an enterprise ledger policy |
| High | CSV/sample metrics are not operational observability | Metrics owners and definitions, stable event IDs, pipeline quality, payment/acceptance failure monitoring and alert ownership |
| High | Cases have no assignment, response targets or escalation | Staff ownership, severity, SLA timers, customer-visible request status and provider fallback |
| High | One growing set of global browser state and template strings | Modular domain services, explicit schemas/migrations, API boundaries, reusable components and contract/integration tests |
| High | Simulated timing has no provider freshness/failure state | Last reliable status and update age, reconnect/fallback, real delivery feed and pickup handoff |
| High | No measured accessibility, performance or device coverage | Manual keyboard/screen-reader/zoom testing, device/browser matrix, measured budgets, outage and load tests |
| Roadmap | Catering/group orders, campaign orchestration, referrals and other growth capabilities absent | Validate and stage these after reliable core ordering; avoid placing them all in the primary navigation |

Additional decisions needed before production design: existing integration contracts, headquarters/regional/store roles, franchise funding/settlement, data retention and consent owners, deployment/incident ownership, service targets, migration rollback, and representative pilot-store selection. Do not invent MOD’s internal systems from competitor patterns or a feature inventory.

## UX findings and changes made in this review

| Finding | Change | Remaining limitation |
| --- | --- | --- |
| Mobile promotional hero delays access to the menu | Shortened the hero, reduced decorative text and removed the mobile stamp | Real task-completion/scroll measurements with customers are still needed |
| Eleven equally prominent admin destinations compete for attention | Keep Overview, Orders, Fulfillment and Support visible; disclose Network insights and Manage & configure as groups | Groups are navigation only, not a substitute for role permissions |
| Dates/fulfillment/export appear on configuration pages where they do not apply | Menu, Offers and Settings now show the store selector and a current-configuration explanation | Reporting pages retain consistent scope; store cards still show scoped metrics |
| Switching stores reprices a populated bag without a detailed before/after decision | Added item price/availability, fee, fulfillment and prep preview with Keep current store / Use this store actions | Production still needs an authoritative quote and validated zone/time/reward eligibility |
| Cross-tab menu changes can silently change a checkout total | Changed configuration requires explicit checkout review; typed name/address/instructions are retained | Local review is not an atomic server quote or payment reservation |
| One-click refund is easy to trigger accidentally | Added tender/points refund preview and explicit confirmation | Staff policy/approval and partial refunds remain missing |

No new top-level customer destination was added. The four customer tabs remain **Order, Rewards, Orders, Account**. Store selection lives in the fulfillment context; wallet actions live inside Rewards; support lives with the order. Two taps means reachability of a task, not a promise that customization or checkout can safely finish in two taps.

## Rules to prevent feature bloat

1. **One main task per screen.** Menu discovers food; builder configures it; checkout confirms and pays; tracking follows the order. Avoid competing growth prompts during checkout.
2. **One primary action per decision.** Use disclosure for nutrition, terms, advanced settings and administrative breakdowns. Do not hide the payable total, unavailable items or consequential changes.
3. **Context before navigation.** Show store, fulfillment and relevant order status where the action happens. Put group/catering entry points on the ordering surface only when enabled and relevant; do not add a tab for every feature.
4. **Separate daily work from configuration.** Staff should reach their queue and exceptions immediately. Scope screens by server-authorized role/store in the production system.
5. **Keep the overview small.** Four decision-useful KPIs, exceptions and drill-down links; detailed tables/charts belong in reports. Let future customizable dashboards remain optional.
6. **Allow valid defaults, never silent financial changes.** Stored value, substitutions, changed prices and destructive actions need a clear decision at the appropriate step.
7. **Design non-happy paths first.** Loading, empty, offline, stale tracking, declined payment, sold-out item and failed acceptance need useful recovery; not just a toast.
8. **Progressively roll out growth features.** Scheduling and saved builds improve ordering; games, tiers and subscriptions need separate evidence and should not interrupt purchase.

## Coverage inventory — all 120 consolidated capabilities

Each ID maps directly to the full feature definition in the original [Product scope](README-MOD-Pizza-USA-Product-Scope.md). The full original definitions and all 169 workbook rows remain unchanged there. **Partial prototype** means that some local UI/behavior exists; it does not mean that the whole requirement is implemented or production-ready. **Not implemented** identifies absent launch-related scope. **Later / conditional** retains absent later-stage or conditional work rather than deleting it from scope.

Coverage classification: **61 partial prototype**, **21 not implemented**, **38 later / conditional**. These are not completion percentages. No requirement is certified for production by this audit.

### Identity and preferences

| Scope ID | Current status | Original priority / fit | Evidence and gap |
| --- | --- | --- | --- |
| AC-01 | Partial prototype | P0 / Core US fit | One local demo identity shares orders and points; no authenticated identity provider or cross-channel identity. |
| AC-02 | Partial prototype | P0 / Core US fit | Guest name/email checkout exists; no real account creation or verified post-purchase linking. |
| AC-03 | Not implemented | P0 / Core US fit | No sign-in, account recovery, verification or cart-preserving authentication flow. |
| AC-04 | Partial prototype | P0 / Core US fit | Saved address book, selected store, profile and favorites now work locally; payment tokens are not modeled. |
| AC-05 | Not implemented | P0 / Core US fit | No secure sessions, staff MFA or step-up verification. |
| AC-06 | Not implemented | P0 / Core US fit | No verified ownership, merge/recovery flow or balance-history reconciliation. |
| AC-07 | Not implemented | P0 / Conditional | No cross-channel identity integration or channel permission model. |
| AC-08 | Partial prototype | P0 / Core US fit | Local marketing checkbox only; no verified data-access/deletion workflow or consent history. |

### Stores and fulfillment selection

| Scope ID | Current status | Original priority / fit | Evidence and gap |
| --- | --- | --- | --- |
| ST-01 | Partial prototype | P0 / Core US fit | Six-store selector remembers selection; no ZIP/geolocation search, distance ranking or locator service. |
| ST-02 | Not implemented | P0 / Core US fit | No service-zone, distance, hours, inventory or capacity-based store suitability. |
| ST-03 | Partial prototype | P0 / Core US fit | Delivery/pickup, address text and instructions; no address validation or saved-address list. |
| ST-04 | Partial prototype | P0 / Core US fit | Store hours, pause, fee and fulfillment flags; hours are not enforced, and zones/holiday schedules/minimums are absent. |
| ST-05 | Partial prototype | P0 / Core US fit | ASAP and future half-hour scheduling works locally; scheduled orders wait until their start time. Live capacity and timezone/holiday rules are not modeled. |
| ST-06 | Partial prototype | P0 / Core US fit | Added before/after bag-price and availability preview with explicit store-change acceptance; no authoritative server quote. |
| ST-07 | Not implemented | P0 / Core US fit | No corresponding working implementation. Required before launch if confirmed in launch scope. |
| ST-08 | Partial prototype | P0 foundation; services conditional | Delivery/pickup flags only; other capabilities and operational workflows are absent. |

### Menu and customization

| Scope ID | Current status | Original priority / fit | Evidence and gap |
| --- | --- | --- | --- |
| MN-01 | Partial prototype | P0 / Core US fit | Per-store item prices/availability and photographs; no ingredient inventory, effective dates or limited-time publishing. |
| MN-02 | Partial prototype | P0 / Core US fit | Pizza size/crust/sauce/toppings work; salads and desserts are fixed items; full modifier taxonomy absent. |
| MN-03 | Partial prototype | P0 / Core US fit | Running demo price and paid size/crust options; no authoritative incompatibility/rule engine. |
| MN-04 | Partial prototype | P0 / Core US fit | Topping choice and cart editing; no named build reset or visual size guidance. |
| MN-05 | Partial prototype | P0 / Core US fit | Vegetarian filter and static allergen note; nutrition is not authoritative and recipe changes do not recalculate it. |
| MN-06 | Partial prototype | P0 / Core US fit | Store managers can toggle ingredient availability; builder and checkout block unavailable ingredients without silent substitution. |
| MN-07 | Partial prototype | P0 / Core US fit | Named custom builds can be saved in the builder and reused with current item/ingredient validation; sharing is not implemented. |
| MN-08 | Not implemented | P0 / Conditional on live menu | No combo builder; only add if supported by the actual MOD menu. |
| MN-09 | Later / conditional | P1 / US pilot | Not implemented. Retain in the roadmap; introduce only when its documented business/operational conditions are met. |
| MN-10 | Later / conditional | P1 / Core US fit | Not implemented. Retain in the roadmap; introduce only when its documented business/operational conditions are met. |
| MN-11 | Later / conditional | P1 / Conditional on MOD kitchen and POS support | Not implemented. Retain in the roadmap; introduce only when its documented business/operational conditions are met. |

### Checkout and payments

| Scope ID | Current status | Original priority / fit | Evidence and gap |
| --- | --- | --- | --- |
| CK-01 | Partial prototype | P0 / Core US fit | Persistent quantity/edit/remove cart; no dedicated duplicate-item control or cross-device cart. |
| CK-02 | Partial prototype | P0 / Core US fit | Added explicit review when checkout pricing/store config changes, plus store-change preview; still local and not atomic. |
| CK-03 | Partial prototype | P0 / Core US fit | Autofill and guest fields; no authentication or optional enrollment. |
| CK-04 | Partial prototype | P0 / Core US fit | Labeled demo payment choices only; no provider wallets, tokenization or payment authorization. |
| CK-05 | Partial prototype | P0 / Core US fit | Local gift funds and split tender arithmetic; no gift-provider balance check or reservation. |
| CK-06 | Partial prototype | P0 / Core US fit | Itemized demo totals; fixed illustrative tax rather than a jurisdiction-aware tax integration. |
| CK-07 | Partial prototype | P0 / Core US fit | Customer deal catalog, saved offers, eligible bundles and HQ-created percentage/dollar campaigns calculate checkout savings; stacking remains one deal or reward. |
| CK-08 | Not implemented | P0 / Core US fit | No decline, timeout, unknown-result recovery or server-side idempotency. |
| CK-09 | Partial prototype | P0 / Core US fit | Immediate local confirmation only; no pending/uncertain state or POS acceptance acknowledgement. |
| CK-10 | Partial prototype | P0 / Core US fit | Local receipts and history; no secure guest lookup or delivery of receipts. |
| CK-11 | Later / conditional | P1 / Conditional on processor, demand, and operating economics | Not implemented. Retain in the roadmap; introduce only when its documented business/operational conditions are met. |
| CK-12 | Later / conditional | P1 / US pilot | Not implemented. Retain in the roadmap; introduce only when its documented business/operational conditions are met. |
| CK-13 | Later / conditional | P1 / Core US fit | Not implemented. Retain in the roadmap; introduce only when its documented business/operational conditions are met. |

### Rewards and wallet

| Scope ID | Current status | Original priority / fit | Evidence and gap |
| --- | --- | --- | --- |
| RW-01 | Partial prototype | P0 / Core US fit | One Rewards destination plus cart/checkout links; usability not validated with representative customers. |
| RW-02 | Partial prototype | P0 / Core US fit | Available/pending points, reward progress and activity are displayed; expiration is not modeled. |
| RW-03 | Not implemented | P0 / Core US fit | No POS earning/redemption, member scan or identity lookup. |
| RW-04 | Partial prototype | P0 / Core US fit | DEMO40 receipt claim credits sample points once and rejects duplicate/invalid codes; no real receipt verification. |
| RW-05 | Partial prototype | P0 / Core US fit | Gift/service credit/points separated; no stored payment tokens or full promotional entitlements. |
| RW-06 | Partial prototype | P0 / Core US fit | Automatic partial balance consumption; no user-chosen dollar amount or authoritative restrictions. |
| RW-07 | Partial prototype | P0 / Core US fit | Local checkout deduction and full-cancel restoration; no durable reservations, atomicity or failure release. |
| RW-08 | Partial prototype | P0 / Core US fit | HQ edits campaign participation, minimums, mode and percentage/dollar values. The four-item reward catalog uses fixed demo rules. |
| RW-09 | Partial prototype | P0 / Core US fit | Credit reason and mutable local audit list; no staff authorization, approval threshold or abuse monitoring. |
| RW-10 | Not implemented | P1; P0 where needed to preserve live programs | No corresponding working implementation. Required before launch if confirmed in launch scope. |
| RW-11 | Later / conditional | P1 / Core US fit | Not implemented. Retain in the roadmap; introduce only when its documented business/operational conditions are met. |
| RW-12 | Later / conditional | P1 / Core US fit | Not implemented. Retain in the roadmap; introduce only when its documented business/operational conditions are met. |
| RW-13 | Later / conditional | P1 / Conditional on menu, POS, and strategy | Not implemented. Retain in the roadmap; introduce only when its documented business/operational conditions are met. |
| RW-14 | Partial prototype | P2 / US pilot | One-time welcome and three-pizza explorer bonuses have progress/claim behavior; full tiers, journeys and broader gamification are not implemented. |
| RW-15 | Later / conditional | P2 / US pilot; program redesign, not a silent change to MOD points | Not implemented. Retain in the roadmap; introduce only when its documented business/operational conditions are met. |
| RW-16 | Later / conditional | P2 / US pilot; explicit enrollment and provider support | Not implemented. Retain in the roadmap; introduce only when its documented business/operational conditions are met. |
| RW-17 | Partial prototype | P2 / US pilot; separate stored-value operating model | Demo top-up adds sample funds without payment; real top-ups/auto-reload remain an optional later product decision. |
| RW-18 | Later / conditional | P2 / US pilot; keep outside the primary ordering flow | Not implemented. Retain in the roadmap; introduce only when its documented business/operational conditions are met. |

### Order lifecycle

| Scope ID | Current status | Original priority / fit | Evidence and gap |
| --- | --- | --- | --- |
| OR-01 | Partial prototype | P0 / Core US fit | Own order history and reorder at current prices; no secure cross-device history or full modifier validation. |
| OR-02 | Partial prototype | P0 / Core US fit | Simulated stages and cancellation, plus recorded delay samples; rejected and uncertain handoff states absent. |
| OR-03 | Partial prototype | P0 / Core US fit | Accelerated demo ETA; no kitchen/provider feed, freshness indication or proactive notifications. |
| OR-04 | Not implemented | P0 / Core US fit | No corresponding working implementation. Required before launch if confirmed in launch scope. |
| OR-05 | Partial prototype | P0 / Core US fit | Pickup selection, store text and identifier; no validated directions, check-in or secure collection workflow. |
| OR-06 | Partial prototype | P0 / Conditional on delivery provider | Animated illustrative map and instructions; no real GPS, provider status or proof of delivery. |
| OR-07 | Partial prototype | P0 / Conditional on provider | Local demo chat with automated replies; no masked real calling/messaging or provider failover. |
| OR-08 | Partial prototype | P0 / Core US fit | Admin full cancellation now has a refund review; preparation-stage eligibility and customer self-service policy are absent. |
| OR-09 | Later / conditional | P1 / Conditional on staffed store workflow | Not implemented. Retain in the roadmap; introduce only when its documented business/operational conditions are met. |
| OR-10 | Later / conditional | P1 / US pilot at suitable locations | Not implemented. Retain in the roadmap; introduce only when its documented business/operational conditions are met. |
| OR-11 | Later / conditional | P2 / US pilot; requires kitchen integration and robust fallback | Not implemented. Retain in the roadmap; introduce only when its documented business/operational conditions are met. |
| OR-12 | Later / conditional | P2 / Limited initial fit; separate hardware and store investment | Not implemented. Retain in the roadmap; introduce only when its documented business/operational conditions are met. |
| OR-13 | Later / conditional | P2 / Conditional on native app strategy | Not implemented. Retain in the roadmap; introduce only when its documented business/operational conditions are met. |

### Support and recovery

| Scope ID | Current status | Original priority / fit | Evidence and gap |
| --- | --- | --- | --- |
| CS-01 | Partial prototype | P0 / Core US fit | Order-linked case creates a local store-associated inbox entry; no operational assignment or provider routing. |
| CS-02 | Partial prototype | P0 / Core US fit | Some issue categories; damaged, undelivered and duplicate-specific resolutions are absent. |
| CS-03 | Partial prototype | P0 / Core US fit | Full local cancellation only, now with confirmation; partial/refund-request state machine and communications absent. |
| CS-04 | Partial prototype | P0 / Core US fit | Local full-refund arithmetic; no provider reconciliation, partial tender allocation, reconciliation jobs or debt policy. |
| CS-05 | Partial prototype | P0 / Core US fit | Customer-specific credit with reason; no enforced eligibility, expiry or staff controls. |
| CS-06 | Partial prototype | P0 / Core US fit | Order/customer/payment demo context; no controlled access or authoritative integrated data. |
| CS-07 | Not implemented | P0 / Core US fit | No case assignment, response targets, escalation or provider continuity. |
| CS-08 | Partial prototype | P1 feedback; P2 public ratings | Completed orders accept a rating/comment that appears in the assigned store’s Guest care view; no public ratings feed. |

### Groups, catering and community

| Scope ID | Current status | Original priority / fit | Evidence and gap |
| --- | --- | --- | --- |
| GP-01 | Later / conditional | P1 / Core US fit | Not implemented. Retain in the roadmap; introduce only when its documented business/operational conditions are met. |
| GP-02 | Later / conditional | P1 / Conditional on operations | Not implemented. Retain in the roadmap; introduce only when its documented business/operational conditions are met. |
| GP-03 | Later / conditional | P1 / Core US fit | Not implemented. Retain in the roadmap; introduce only when its documented business/operational conditions are met. |
| GP-04 | Later / conditional | P1 / Conditional on approved program | Not implemented. Retain in the roadmap; introduce only when its documented business/operational conditions are met. |
| GP-05 | Later / conditional | P2 / US pilot; define incomplete payments, refunds, and cutoff behavior | Not implemented. Retain in the roadmap; introduce only when its documented business/operational conditions are met. |
| GP-06 | Later / conditional | P2 / US pilot; validate frequency, margin, billing, and cancellation model | Not implemented. Retain in the roadmap; introduce only when its documented business/operational conditions are met. |
| GP-07 | Later / conditional | Limited fit; retain only if MOD's business model expands | Not implemented. Retain in the roadmap; introduce only when its documented business/operational conditions are met. |

### Marketing and personalization

| Scope ID | Current status | Original priority / fit | Evidence and gap |
| --- | --- | --- | --- |
| MK-01 | Partial prototype | P0 / Core US fit | HQ campaign titles/descriptions/participation can be edited and appear in customer Deals; broader content CMS and scheduled publishing remain absent. |
| MK-02 | Partial prototype | P0 / Core US fit | Local favorites/history; no cross-device persistence or measured personalization. |
| MK-03 | Not implemented | P0 / Core US fit | No reliable event instrumentation or abandonment reporting. |
| MK-04 | Later / conditional | P1 / Core US fit | Not implemented. Retain in the roadmap; introduce only when its documented business/operational conditions are met. |
| MK-05 | Later / conditional | P1 / Core US fit | Not implemented. Retain in the roadmap; introduce only when its documented business/operational conditions are met. |
| MK-06 | Not implemented | P1; controls P0 whenever messaging is enabled | No corresponding working implementation. Required before launch if confirmed in launch scope. |
| MK-07 | Later / conditional | P1 / Core US fit | Not implemented. Retain in the roadmap; introduce only when its documented business/operational conditions are met. |
| MK-08 | Later / conditional | P1 / Core US fit | Not implemented. Retain in the roadmap; introduce only when its documented business/operational conditions are met. |
| MK-09 | Later / conditional | P1 / Core US fit | Not implemented. Retain in the roadmap; introduce only when its documented business/operational conditions are met. |
| MK-10 | Later / conditional | P1 / Core US fit | Not implemented. Retain in the roadmap; introduce only when its documented business/operational conditions are met. |
| MK-11 | Later / conditional | P2 / US pilot | Not implemented. Retain in the roadmap; introduce only when its documented business/operational conditions are met. |
| MK-12 | Later / conditional | P2 / US pilot; structured ordering remains available | Not implemented. Retain in the roadmap; introduce only when its documented business/operational conditions are met. |

### Operations and integrations

| Scope ID | Current status | Original priority / fit | Evidence and gap |
| --- | --- | --- | --- |
| OP-01 | Partial prototype | P0 / Core US fit | Store-specific pause, prep estimates, item and ingredient availability work; shift tasks/team statuses are demonstrated. Live capacity enforcement is absent. |
| OP-02 | Not implemented | P0 / Core US fit | No store-acceptance protocol, failed-order queue or reconciliation. |
| OP-03 | Not implemented | P0 / Core US fit | No franchise participation, funding allocation or settlement rules. |
| OP-04 | Partial prototype | P0 / Core US fit | Distinct store-manager/HQ demo personas expose different screens and scopes; this is UI-level persona modeling, not authenticated authorization. |
| OP-05 | Not implemented | P0 / Core US fit | No content workflow, scheduling, approval, rollback or override hierarchy. |
| OP-06 | Not implemented | P0 / Core US fit | Authoritative system ownership is unconfirmed and not implemented. |
| OP-07 | Not implemented | P0 / Conditional on existing systems | No ordering/POS/payment/loyalty/delivery/messaging integrations. |
| OP-08 | Partial prototype | P0 / Core US fit | Filtered local CSV download; no event API, authenticated access or duplicate/retry handling. |
| OP-09 | Later / conditional | P1 / Conditional; promote only confirmed launch dependencies | Not implemented. Retain in the roadmap; introduce only when its documented business/operational conditions are met. |
| OP-10 | Partial prototype | P0 / Core US fit | Store/regional reporting, item popularity, channel mix, campaign attribution, reward-use counts and repeat-customer counts work on demo records. |
| OP-11 | Not implemented | P1; provenance foundation P0 | No corresponding working implementation. Required before launch if confirmed in launch scope. |
| OP-12 | Partial prototype | P0 / Core US fit | Demo delay/refund/prep metrics; no measured payment success, failed submissions, ETA accuracy or margin. |
| OP-13 | Later / conditional | P2 / US pilot; human review before consequential actions | Not implemented. Retain in the roadmap; introduce only when its documented business/operational conditions are met. |
| OP-14 | Partial prototype | P0 / Conditional on replacing an existing experience | Migration preserves local prototype data; not migration from MOD production systems or financial reconciliation. |

### Quality and channel continuity

| Scope ID | Current status | Original priority / fit | Evidence and gap |
| --- | --- | --- | --- |
| QA-01 | Partial prototype | P0 / Core US fit | Responsive Chrome checks, native dialogs and labeled fields; no complete keyboard/screen-reader/contrast/device audit. |
| QA-02 | Partial prototype | P0 / Core US fit | Local assets and cart persistence; no quantified performance budgets, outage recovery, telemetry or scale validation. |
| QA-03 | Not implemented | P0 / Core US fit | No server-side authorization, tokenized payment boundary, abuse protection or recovery procedures. |
| QA-04 | Partial prototype | P0 / Core US fit | Hash routes and basic metadata; no indexable store/menu pages, sitemap or stable server-rendered public content. |
| QA-05 | Later / conditional | P1 / Core US fit | Not implemented. Retain in the roadmap; introduce only when its documented business/operational conditions are met. |
| QA-06 | Later / conditional | P1 / Conditional on native app scope; preserve existing app continuity | Not implemented. Retain in the roadmap; introduce only when its documented business/operational conditions are met. |
| QA-07 | Later / conditional | P1 / Conditional; do not promise universal installed-app detection | Not implemented. Retain in the roadmap; introduce only when its documented business/operational conditions are met. |
| QA-08 | Later / conditional | P1 / Conditional; code/capability changes may still require releases | Not implemented. Retain in the roadmap; introduce only when its documented business/operational conditions are met. |

## Recommended next slices

1. **Complete core journey behavior:** saved addresses/builds, scheduling with explicit capacity semantics, reliable revalidation, decline/unknown/pending order demonstrations, clear failure recovery and accessible errors. Keep these within the current four customer destinations.
2. **Establish the production foundation:** authoritative system contracts; identity/permissions; database-backed order and wallet models; payment/POS acceptance and idempotency; migration strategy and immutable audit. Do this before representing the tool as suitable for real stores.
3. **Operational control:** ingredient availability, store holiday/timezone enforcement, failed handoff/reconciliation queue, cancellation policies, partial refunds, support assignment/escalation and incident visibility.
4. **Release validation:** real integrations in a controlled pilot, financial reconciliation, accessibility/device testing, performance/load testing, backup recovery and staged rollback.
5. **Growth:** select group/catering, targeted campaigns, referrals or other documented P1 features using business value and operational readiness; keep P2 experiments optional.

## Verification and limits

Existing `tests/prototype.cjs` verifies core ordering, wallet/refund arithmetic, moving/paused delivery and responsive routes. `tests/operations.cjs` verifies multi-store filters, isolation, comparison, CSV exports, customer credits, support and navigation. New `tests/readiness.cjs` verifies explicit cross-tab price review, retained checkout fields, store-change preview/acceptance, refund confirmation, grouped navigation and contextual filters.

**Verification recorded 6 October 2026:** JavaScript syntax checks and all three browser suites (`prototype.cjs`, `operations.cjs`, `readiness.cjs`) passed. The coverage inventory was checked for exactly 120 unique IDs matching the product scope.

These are local Chrome tests using resized viewports, not a real-device or production load test. See [Prototype guide](README-MOD-Pizza-Prototype.md) for commands and [Multi-store guide](README-MOD-Pizza-Multi-Store-Administration.md) for data definitions. Runtime validation results should be recorded after running the corresponding suite, not inferred from the existence of a test file.

## README maintenance policy

Keep the original product scope and implementation plan as requirements/design documents. Record current implementation and limitations in the prototype and multi-store guides. Maintain this audit’s per-ID coverage and verification evidence when a capability changes. Do not mark a capability complete merely because a tab or button exists. Every implementation update should state behavior, remaining backend/provider dependencies, relevant tests and user-visible limitations.
