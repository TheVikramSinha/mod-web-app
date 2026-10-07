> Stakeholder sequencing update: [Current prototype and proposed phases 2–4](README-MOD-Pizza-Discovery-and-Roadmap.md) is the current stakeholder-facing plan. This earlier document remains the detailed planning baseline.

# MOD Pizza USA — Responsive Web App Implementation Plan

> **App experience update — 6 October 2026:** The current prototype now has separate customer, store-manager and HQ workspaces, expanded loyalty/deals, saved preferences and scheduling. See the [current feature guide](README-MOD-Pizza-App-Experience.md) and [README](README.md) for the implemented experience. Earlier sections below remain useful as baseline/history.


> **Implementation review — 6 October 2026:** This document remains the requirements/design baseline, not a statement that every feature is built. The [Enterprise readiness and UX audit](README-MOD-Pizza-Enterprise-Readiness-Audit.md) maps all 120 capabilities to current evidence and gaps. The prototype is for journey validation, not live enterprise operation. See [README](README.md) for current code, changes and verification.


Version 1.0 · October 5, 2026 · Planning deliverable; application development has not started.

Companion document: [Full product scope](README-MOD-Pizza-USA-Product-Scope.md). The scope defines what is included and its US suitability; this plan defines how to deliver it, in what order, and how to verify it. Scope IDs and original workbook IDs are retained in the coverage appendices.

## 1. Delivery objective and interpretation

Build one responsive web application with a desktop website experience, a touch-friendly tablet experience, and an app-like mobile experience. The same URL must adapt automatically when a user opens browser developer tools, selects a device preset, enters a custom viewport, rotates a device, resizes a window, or uses tablet split-screen. No separate mobile URL, manual mobile switch, browser-extension dependency, or fixed phone-frame mockup is required.

“Web view” in this plan means the normal browser experience. An embedded iOS/Android WebView wrapper is not assumed. “Mobile app-like” means responsive navigation, appropriate touch controls, persistent state, deliberate transitions, good loading/recovery behavior, and optional home-screen installation. It does not imply access to every native device capability. Core purchasing works in the browser without installation.

The original scope's P0/P1/P2 priorities remain intact. Every item is planned, including later and conditional features; inclusion in the plan does not mean all features ship in the first release. All P0 customer screens must work on mobile, tablet, and desktop from their first implementation. Native applications remain conditional; an optional PWA installation layer is planned as an extension to this responsive web app.

## 2. Assumptions and decision log

| Decision | Proposed planning baseline | Required evidence / owner |
| --- | --- | --- |
| Market and currency | USA; USD | Confirmed user direction; Product |
| Channels | Mobile browser, tablet browser, desktop browser | Confirmed user direction |
| Existing brand replacement | Unconfirmed | Product confirms relationship to current MOD estate |
| Visual identity | MOD-approved assets and recognizable brand treatment | Design obtains approved assets and usage rules |
| Ordering/POS/loyalty vendors | Integrate existing authoritative services where possible | Engineering and Operations inventory contracts and sandbox access |
| Native app | Separate conditional scope; no native dependency for web checkout | Product decision before native work |
| Loyalty rules | Approved source-of-truth configuration, not copied public thresholds | Loyalty owner resolves discrepancies recorded in scope |
| Payments | Existing/selected US processor with hosted payment fields and supported wallets | Payments owner verifies integrations and split-tender behavior |
| Fulfillment | Pickup and direct delivery where pilot stores support them | Operations confirms store/provider capabilities |
| Schedule | Dependency-based milestones; no committed dates before discovery | Delivery lead estimates after contracts, staffing, and migration are understood |

Unresolved vendors do not block design or adapter-based prototype work. They do block claiming production payment, loyalty, or store integration readiness. Demonstration data must be visibly separated from live operation.

## 3. Responsive and app-like experience contract

### 3.1 Layout system

Use mobile-first CSS, fluid sizing, flexible grids, content-driven breakpoints, and component/container adaptation. Widths below are initial layout rules to validate, not a list of the only supported devices. All intermediate widths must work.

| CSS viewport width | Initial layout | Navigation and cart |
| --- | --- | --- |
| 320–479 px | Compact single column; readable card content, compact category control | Four-item bottom navigation; context-specific bottom purchase action |
| 480–767 px | Spacious phone/small-window layout; additional columns only when content fits | Same app-like navigation; full-width sheets for complex interactions |
| 768–1023 px | Tablet: flexible one/two-column layout; wide touch targets | Compact top navigation if it fits; otherwise bottom navigation; one active cart presentation |
| 1024–1279 px | Small desktop/tablet landscape: menu plus optional summary panel | Top navigation; sticky summary when height/width permit |
| 1280 px and wider | Desktop: centered content with roughly 1440 px maximum working width; flexible gutters | Full header and cart/summary panel; avoid stretched forms |

Tablet behavior follows usable viewport and input capability, not the device's marketing name. A desktop browser narrowed to 390 px gets the same compact layout. Desktop-touch and tablet-keyboard combinations must work. Use CSS width rules for layout and capability detection for pointer/hover features; do not make user-agent detection the primary layout mechanism.

### 3.2 Required responsive behavior

- Add viewport metadata; do not disable pinch zoom. Use CSS pixels and test different device-pixel ratios.
- Keep text, controls, images, and forms inside the viewport from 320 px upward. Do not hide overflow globally to disguise layout defects.
- Use approximately 44×44 CSS px minimum primary touch targets as a project target; allow sufficient spacing. No hover-only actions or drag-only controls.
- Respect safe-area insets and dynamic viewport height. The on-screen keyboard must not cover the focused field, error, or next action.
- Give sticky cart actions and bottom navigation reserved space. During checkout or a full-screen builder, reduce redundant navigation rather than stack multiple bars over content.
- Convert desktop dialogs to suitable mobile sheets/full-screen panels. Include visible close/back controls, focus management, scroll locking, and focus restoration.
- Support browser Back/Forward and route restoration. Sheets must not create traps or an unexpected browser-history loop.
- Preserve cart, selected fulfillment, customization, and form progress when resizing or rotating. Re-layout must never remount a second independent cart or submit an order.
- Desktop and mobile presentations share business state and rules. Avoid duplicate hidden focusable forms in the DOM.
- Collapse multi-column layouts for short landscape screens and at high zoom; use scrollable document flow rather than inaccessible nested panes.
- Respect reduced motion. Use lightweight transitions that do not delay actions, mask loading, or create motion-dependent meaning.
- Every screen specifies loading, empty, populated, validation-error, permission-denied, stale-data, offline, and dependency-failure states where applicable.

### 3.3 Screen inventory and device behavior

| Screen family | Phone behavior | Tablet / desktop behavior | Required states |
| --- | --- | --- | --- |
| Home / Order | Fulfillment context, usual order or menu, limited offers | Wider menu discovery with familiar priority | New, returning, active-order, store unknown |
| Store/fulfillment selector | Search-first sheet; list before optional map | Search/list with map when useful | Permission denied, no service, closed, changed store |
| Menu and dietary filters | Category control, readable cards, filter sheet | Grid with visible categories and optional filter panel | Sold out, no matches, late menu refresh |
| Pizza/salad builder | Sections with summary and sticky Add/Edit action | Choices and live text/visual summary side by side | Invalid combination, premium upgrade, unavailable ingredient |
| Cart | Full route or accessible sheet; editable items | Main cart with side summary | Empty, stale price, changed reward, fulfillment change |
| Checkout | One-column grouped form; visible total and payment action | Form plus readable sticky order summary | Guest/member, decline, pending, retry, changed quote |
| Order confirmation/status | Large status, ETA, pickup/contact/help actions | Timeline and supplementary details | Pending acceptance, delayed, provider unavailable |
| Rewards and wallet | Separate labeled balance cards and simple Apply actions | Cards plus readable transaction history | Pending points, expired offer, incompatible benefit |
| Sign-in/account/preferences | Keyboard-aware forms and progressive sections | Constrained form width; navigable sections | Expired code, recovery, merged identity, signed out |
| History/favorites/reorder | Compact item summaries and clear Reorder | Cards/list with details | Removed product, new price, store unavailable |
| Support/refund | Order-linked choices and status | Context and case history side by side | Submitted, needs evidence, escalated, resolved |
| Group/catering/gifting | Guided inputs and share actions | Organizer overview and expanded summaries | Deadline reached, capacity full, payment incomplete |
| Store/admin/support tools | Critical actions as cards; readable detail drilldown | Dense tables with filters and detail panels | Limited permission, conflict, audit history |

Desktop-wide reporting tables may use labeled horizontal scrolling within their own region, plus mobile summaries/detail views. Core customer ordering pages must not require horizontal scrolling. Screens for later features inherit this same responsive contract.

## 4. Proposed technical architecture

Use a modular application with clear domains before considering independently deployed services. This reduces early operational overhead while allowing vendor adapters and background processing to evolve.

| Layer | Proposed baseline | Reason and boundary |
| --- | --- | --- |
| Web UI | TypeScript, React, Next.js; CSS design tokens and responsive components | Public store/menu rendering plus interactive ordering; exact supported versions pinned when implementation begins |
| UI accessibility | Semantic HTML and a reviewed accessible component foundation | Shared dialogs, sheets, controls, validation, and focus behavior |
| Application API | Server-side application layer / backend-for-frontend with validated contracts | Keeps vendor credentials and business validation out of the browser |
| Persistence | PostgreSQL for application-owned transactional records where not vendor-owned | Constraints, durable state, auditability; avoid competing authorities for balances |
| Jobs/events | Durable queue or transactional outbox with workers | Provider callbacks, notifications, reconciliation, exports, retries |
| Storage/CDN | Managed object storage and CDN for approved public imagery and appropriate uploads | Responsive images, access boundaries, controlled retention |
| Cache | Add only for measured needs; never use cache as balance/payment authority | Menu/public-content acceleration with explicit invalidation |
| Integrations | Typed adapters for identity, menu, ordering/POS, payments, loyalty, gift cards, delivery, CRM/BI | Swappable sandbox/live implementations and clear error behavior |
| Validation | Unit/domain tests, contract tests, browser E2E, accessibility checks, visual review | High-risk state transitions and cross-device task completion |
| Observability | Structured logs, traces, error tracking, metrics, operational dashboards | Correlate order/payment/provider events without exposing sensitive data |

Next.js supports full-stack React application patterns; select a supported release and review its production/security configuration at build time. This is a recommendation, not an installed dependency. [Next.js documentation](https://nextjs.org/docs)

Proposed repository organization, to create only when implementation starts:

```text
src/
  app/                    public/customer and protected staff routes
  components/             design system and responsive shells
  features/               identity, stores, menu, cart, checkout, rewards, orders, support
  server/                 domain services, authorization, orchestration
  integrations/           vendor adapters and contract mappings
  jobs/                   notifications, reconciliation, exports, expiry
  analytics/              event contracts, metric definitions, experiments
  styles/                 tokens, layout, typography, motion
tests/
  domain/ contract/ e2e/ accessibility/ visual/
docs/
  decisions/ contracts/ runbooks/ acceptance/
```

### 4.1 State and data ownership

| Domain | Records/contracts to define | Important invariant |
| --- | --- | --- |
| Identity | Customer, guest session, verified contacts, preferences, consent history, identity links | Account linking requires ownership verification |
| Store/menu | Store, hours/timezone, service zone, capability flags, menu version, ingredient, modifier group, price | Every purchasable combination resolves to valid store/POS data |
| Fulfillment | Address, quote, slot, capacity hold if supported, ETA | Selected timing and service eligibility revalidate before submission |
| Cart | Versioned cart/items/builds and pricing quote with expiry | Server validates totals; stale writes do not overwrite newer choices |
| Payment | Payment attempt, provider reference, tender allocations, refund attempt | Money uses integer cents or exact decimal conventions, never floating arithmetic |
| Order | Order intent, immutable purchase snapshot, provider IDs, status events | Browser redirects do not prove payment or store acceptance |
| Loyalty | Account reference, ledger events/reservations, rewards, expiry, claim | Points and dollars remain distinct; no duplicate earn/redeem |
| Stored value | Gift/service-credit reference, allocation, reservation, restoration | App never invents an available balance independently of its authority |
| Support | Case, category, evidence, status, routing, adjustment reason | Every financial action is authorized and traceable |
| Marketing | Campaign, offer, segment, experiment assignment, suppression, attribution | Transactional communication and marketing permissions are separate |
| Operations | Roles/store scopes, audit entry, reconciliation exception, configuration version | A staff member cannot access another store/customer outside assigned scope |

Store timestamps in UTC and retain the store's IANA timezone for scheduling, hours, cutoff times, and daylight-saving transitions. Snapshot ordered descriptions, modifier selections, price, tax, discounts, and policy versions so historical receipts do not change with the menu. Define retention and deletion boundaries for each data class; purge customer-specific browser state on logout appropriately.

### 4.2 API and integration contract checklist

Document schemas, authentication, authorization, pagination, versioning, timeouts, retry rules, rate limits, correlation IDs, and error codes. Proposed endpoint families include store search, store menu, fulfillment quote, versioned carts, pricing quote, checkout intent, payment status, order lookup/status, rewards/reservations, receipt claims, support/refunds, and protected staff commands. Exact URLs depend on the selected framework and providers.

Use idempotency keys for purchase/refund/credit commands and durable deduplication for provider events. Authenticate callback signatures and verify resource ownership on every customer and staff request. Treat webhook arrival order as unreliable; reconcile late or missing events against the provider. Define provider-specific acceptance, cancellation, capture, and refund semantics before integration.

## 5. Delivery work packages

Each package produces UI where applicable, domain behavior, integration contracts, error states, analytics, and verification evidence. Named roles indicate responsibility, not hired staff or separate agents.

| Package | Work and concrete outputs | Dependencies | Lead role | Completion evidence |
| --- | --- | --- | --- | --- |
| WP-00 Discovery/contracts | Confirm pilot, source systems, policies, assets, vendor sandboxes, data ownership, capability flags, decision log | Product/operations access | Product + Technical lead | Signed-off requirements/contracts; unresolved items carry explicit dispositions |
| WP-01 Responsive foundation | Design tokens, navigation, shells, forms, sheets, cards, skeletons, state handling, component examples, CI scaffold | WP-00 initial journeys | Design + Frontend | All shells work across viewport matrix and keyboard/touch input |
| WP-02 Identity/preferences | Guest/member sessions, passwordless flow, recovery, merge, account pages, consent, secure guest access | WP-01; identity contract | Full-stack | Guest/member/recovery flows pass; cart survives authentication |
| WP-03 Stores/fulfillment/discovery | Locator, manual/geolocation paths, store pages, service eligibility, slots, fees, Maps destinations, direct links | WP-00 store data; WP-01 | Full-stack + Operations | Denied location, closed store, no service, DST, and capacity cases pass |
| WP-04 Menu/customization | Menu/modifier schema, nutrition/filtering, pizza/salad builder, favorites, combo rules, availability handling | WP-03 menu/store contract | Frontend + Backend | Valid builds round-trip to provider; price/nutrition/modifiers are consistent |
| WP-05 Cart/checkout/payments | Persistent cart, server quote, tender allocations, checkout intent, hosted payment, wallets, receipt, retry recovery | WP-02–04; payment contract; WP-06 redemption contract | Backend + Payments | Sandbox success/decline/timeout/split-tender/duplicate tests pass |
| WP-06 Rewards/wallet | Balances, history, pending/expiry, eligibility, in-store scan, claims, reservation/release, catalog/admin rules | WP-02; approved loyalty/gift contracts | Backend + Loyalty | Earn/redeem/failure/refund reconciliation matches authority |
| WP-07 Order/fulfillment lifecycle | Submission, acceptance, status, ETA, pickup handoff, delivery contact, notifications, reorders, change/cancel | WP-03–06; POS/delivery contracts | Backend + Operations | Sandbox order reaches store and customer status reflects real events |
| WP-08 Support/refunds | Order-linked help, cases, routing, refund/credit tools, restored/reversed value, escalation | WP-05–07 | Full-stack + Support | Full/partial refund and failed-provider cases reconcile end to end |
| WP-09 Staff/content/operations | Protected tools, roles, audit, menu pauses, capacity settings, franchise rules, CMS preview/publish/rollback | WP-00; WP-01; relevant domain contracts | Full-stack + Operations | Store-scoped access and controlled updates verified |
| WP-10 Data/analytics/experiments | Event dictionary, metrics, dashboards, exports/connectors, experiment assignment and holdouts | WP-00 metric definitions; instrument each package | Data + Engineering | Metrics reconcile to authoritative orders; no duplicate purchase counts |
| WP-11 Growth/personalization | Segments, lifecycle orchestration, recovery, referrals/milestones, offers, recommendations, feedback | WP-06; WP-09–10; consent controls | Marketing + Engineering | Campaign eligibility/suppression and measurable outcomes validated |
| WP-12 Group/catering/community | Shared carts, host/deadline, catering packages, gifting, fundraiser/donation flows | WP-03–08; operating policies | Product + Full-stack | Organizer/payment/capacity/attribution journeys pass on all layouts |
| WP-13 App continuity/PWA | Manifest, install experience, scoped cache/offline handling, update lifecycle; optional native handoff work | WP-01; WP-05–07 stable; browser capability tests | Frontend + Platform | Browser remains complete; standalone/relaunch/update flows verified |
| WP-14 Optional innovations | Tiers/missions, points-plus-cash, card linking, top-up/subscription, AI, advanced pickup and native features | WP-00 experiment decision; relevant core packages | Product + domain owner | Each pilot has hypothesis, gate, implementation, control, and stop rule |
| WP-15 Quality/release/migration | Device/accessibility/performance/security/reliability tests, migration, monitoring, runbooks, pilot and rollout | Starts with WP-01; release depends on completed P0 packages | QA + Platform + Operations | Launch checklist, reconciliation, restore/rollback rehearsal, pilot sign-off |

### 5.1 Milestones and critical path

| Milestone | Deliverables | Exit gate |
| --- | --- | --- |
| M0 — Definition | WP-00; scope traceability, integration inventory, approved data/rule ownership | No unknown authority for money, orders, or points; unresolved optional features explicitly flagged |
| M1 — Responsive interactive prototype | WP-01; representative store/menu/builder/cart/reward/status flows using labeled fixtures | User can exercise phone/tablet/desktop and resize without losing state; not production payment readiness |
| M2 — Integrated commerce foundations | WP-02–04 and WP-06 core; staff/config foundation and baseline instrumentation | Real sandbox data validates identity, menu, fulfillment, rewards; interface contracts stable |
| M3 — Complete transactional journey | WP-05–08; required WP-09–10 operations | Order, receipt, fulfillment, support, and full/partial refund work end to end in sandbox |
| M4 — Production readiness and pilot | WP-15; migration if applicable; staff training, monitoring, rollback | All P0 acceptance evidence and store readiness reviewed; release authorized by launch owner |
| M5 — Expansion | Selected P1 work in WP-04–06, WP-09–13 and WP-15 | Same cross-device and operational standards as launch; measure effect against baseline |
| M6 — Experiments | Selected P2/conditional work in WP-14 and related packages | Proceed, change, or stop based on adoption, customer benefit, and contribution margin |

Critical path: vendor/policy discovery → menu/fulfillment/identity contracts → server quote and loyalty/tender reservation → payment and store acceptance → fulfillment and refunds → resilience/migration/pilot. Design and infrastructure can advance alongside contract discovery; production readiness cannot be inferred from a fixture-backed prototype.

Estimate each selected feature as UI, domain/API, integration, data/migration, verification, and rollout work. Record optimistic/likely/pessimistic effort and external lead time after M0. Do not add package durations as if parallel work were sequential or omit vendor onboarding from the critical path. Review scope/risks at every milestone; a P0 deferral requires an explicit scope decision and viable customer/operational alternative.

## 6. Transactional implementation sequence

### 6.1 Checkout and order state machine

Define separate payment and order state machines. An order can be awaiting store acceptance while payment is authorized; neither state implies food preparation has begun.

1. Load a versioned cart with store, fulfillment, items, modifiers, and requested benefits.
2. Request a server-side quote: current availability, slot, price, discounts, taxes, fees, tip, balance eligibility, total, and expiry.
3. Show changes and obtain customer confirmation before submitting a different total or selection.
4. Create a durable checkout intent with idempotency key and stable provider references.
5. Reserve slot/rewards/stored value when supported; record expirations and compensation rules.
6. Authorize/capture payment and submit the order in the sequence supported by the selected processor/POS. Specify this sequence in a provider-specific contract; there is no assumed distributed atomic transaction.
7. Await verified provider events or query results. Show pending when the outcome is uncertain; do not invite another purchase while reconciling the first.
8. On confirmed acceptance, finalize tender/benefit allocations and deliver receipt/status. Post loyalty earnings at the approved lifecycle point.
9. On failure, void/refund the appropriate payment, release reservations, restore eligible value, and notify the customer. Queue unresolved exceptions for staff reconciliation.
10. Reconcile durable records against provider records; retry with the same identity, not a new charge intent.

Order states include draft, submitting, awaiting acceptance, accepted, preparing, ready, dispatched, completed, canceled, rejected, and needs reconciliation. Payment states include not started, pending, authorized, captured, declined, voided, partially refunded, refunded, and unknown/reconciling. Define permitted transitions and actor permissions. Processing delays must never advance food status through a decorative timer alone.

### 6.2 Rewards and refund implementation

Use vendor authority or an application-owned append-only ledger only where ownership is explicit. Record earn, reservation, redemption, release, expiry, adjustment, and reversal events with order/provider references. Prevent concurrent redemptions from spending the same value. Use compensating entries instead of erasing financial history.

For a refund, calculate item/modifier/discount/tax/tip treatment under the approved policy; allocate refunds by original tender and remaining refundable value; reverse earned points and restore redeemed benefits when required. Test item rewards, partial gift-card use, service credits, and multiple refund attempts. Define how negative loyalty balances, expired rewards, and already-spent earnings are handled; do not invent these rules in UI code.

### 6.3 Menu, fulfillment, and integration details

Create stable mappings between customer-visible products/modifiers and POS identifiers. Validate required/max selections, incompatible choices, included versus paid toppings, half placement if supported, and combos. Nutrition data must have an authoritative source/version and defined missing-data behavior.

Validate delivery addresses against actual service areas, not only distance. Display store-local scheduling times. Hold capacity only if the provider supports it; otherwise recheck immediately before submission and recover cleanly when a slot is lost. Changes to store, address, or method trigger re-quotation without silently dropping selections.

For each adapter, define sandbox fixtures, success/error contracts, retryability, circuit-breaker/fallback behavior, callback verification, reconciliation query, and human escalation. Core adapters: identity, store/menu, ordering/POS, payments/tax, loyalty, gift cards, delivery, messaging. Expansion adapters: CRM/CDP, warehouse/BI, referral, card linking, subscriptions, native handoff, and optional hardware.

## 7. Detailed expansion and innovation delivery

| Feature group | Implementation approach | Gate and verification |
| --- | --- | --- |
| Rich builder, sharing, half-and-half | Accessible illustration layer over validated build model; share stable recipe data, not stale price; provider-supported half modifiers | Text parity; recipient-store revalidation; exact kitchen ticket |
| Best offer / PayPal / Venmo | Server eligibility comparison and explanations; processor-supported additional tenders | No silent points spend; no incompatible stacking; payment-return/retry tests |
| BOGO/multipliers/modifier/dine-in rewards | Versioned rules, product/store/channel eligibility, qualified purchase definitions | Boundary/rounding/refund tests and existing entitlement continuity |
| Milestones/referrals | Verified eligibility, qualifying completed orders, delayed grant/reversal, duplicate/self-referral controls | Cancellation/refund does not leave unearned benefits |
| Gift-card purchase/sending | Processor/provider issuance, scheduled job, secure claim, resend/support, balance lookup | One issuance per payment; interrupted sending recoverable; funds remain distinct |
| Segments and lifecycle marketing | Governed event inputs, rule previews, scheduled/triggered journeys, suppression, frequency control | Opt-out propagation, purchased-cart suppression, message deduplication |
| Personalization and upsells | Begin with favorites and rules; inventory-aware suggestions; later model adapters | Baseline/control comparison; no latency dependency for checkout |
| Experiments and measurement | Stable assignment, exposure logging, holdout, metric windows, stop/rollback controls | No assignment changes during checkout; measure margin as well as conversion |
| Feedback/ratings/social proof | Order-linked feedback, moderation, aggregation threshold, honest labels | No fabricated or unsupported claims; ratings hidden when insufficient evidence |
| Group/catering | Shared order draft with participant ownership, host lock/deadline, single payer, lead-time/capacity rules | Concurrent edits, expired invite, removed item, organizer cancellation |
| Fundraising/donation | Approved campaign/beneficiary, attribution, receipt disclosure, separate settlement report | Order/refund/benefit reconciliation and campaign boundaries |
| Multi-payer group order | Participant commitments and deadline; determine all-or-nothing vs partial acceptance policy | Partial payment/cancellation compensation tested before pilot |
| Tiers/missions/punch cards | Separate progress evaluator and benefit issuance; versioned eligibility/time windows | Easy-to-understand progress; refunds/duplicate events do not inflate status |
| Points-plus-cash/dollar rewards | Explicit approved conversion and tender/discount classification | No implied cash value for existing points; customer and ledger clarity |
| Card-linked earning | Opt-in provider enrollment, matched transaction ingest, receipt fallback | Duplicate matching, shared cards, refunds, unmatched purchases |
| Top-up/auto-reload/subscription | Dedicated funded-value or recurring billing integration, explicit enrollment, limits, history, cancellation | Failed renewal/top-up, duplicate callback, refunds and entitlements reconciled |
| Curbside/QR/table order | Store-specific flags, table/arrival identity, staff queue and handoff | Store operating procedure and customer error recovery validated |
| Arrival-aware preparation | Explicit location opt-in, travel estimate, staff override, timeout/manual fallback | Location denied/inaccurate/late arrival; food quality and operational pilot |
| Lockers/native live activities/car/voice | Separate provider/platform proof of concept, secure order linking and fallback | Hardware/native availability demonstrated; no web launch dependency |
| AI analytics/segments/recommendations | Governed read access, source-linked outputs, validation, human review for actions | Quality/cost/latency evaluation; no direct uncontrolled pricing/refund changes |
| AI ordering assistant | Translate requests into the same validated cart, show full review, require explicit purchase | Invalid menu request, ambiguity, allergy data limits, prompt injection, duplicate submission |
| Mini-games/bingo | Campaign-isolated experience and authoritative reward issuance | Abuse controls, accessibility, no ordering interruption, measurable value |
| Reservations/retail/coalition | Discovery-only until business model supports it; then dedicated partner contracts and settlement | Explicit product decision before technical implementation |

## 8. PWA, browser capabilities, and native boundaries

Plan installability as optional P1 work: app manifest, suitable icons, start URL/scope, standalone display, HTTPS hosting, and install guidance appropriate to the browser. Browser installation support and prompts vary; the order flow must remain complete without them. [MDN installability guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable)

Cache versioned public assets and an offline explanation if a service worker is introduced. Do not cache private account/payment responses in a shared cache. Treat cached menu data as potentially stale and revalidate before purchase. Never queue an offline payment or food order for silent later submission. Offline users can see recoverable local draft state and reconnect guidance, not a false order confirmation.

Define update behavior: avoid forced reload during checkout; prompt/apply a new version at a safe point; expire stale caches; support rollback. Test refresh, app relaunch, Back/Forward, provider payment redirects, expired sessions, and interrupted updates in both browser and installed modes.

Device emulation changes viewport/input simulation; it does not install an app or emulate every native capability. Location, camera, payment wallets, push, keyboard, and safe-area behavior require real-device checks. Native wrappers, universal links to an existing app, native lock-screen updates, and App Store distribution remain separate conditional tasks.

## 9. Data, security, analytics, and administration

Implement staff roles for store operations, customer support, marketing, finance, and administrators with store/region restrictions. Define permissions for menu availability, campaign publishing, exports, refunds, and manual credits. Record actor, reason, affected record, timestamp, and before/after reference for sensitive changes.

Keep secrets server-side. Use provider-hosted tokenization rather than storing raw card details. Validate input, output encoding, session/CSRF protections, callback signatures, resource authorization, and rate limits. Do not store payment credentials in browser storage or log tokens, contact details, gift-card secrets, or full addresses indiscriminately. Configure upload size/type controls, restricted access, retention, and malware handling as appropriate for receipt/support evidence. Complete processor-specific security requirements before real payments.

Define events before UI instrumentation: store selected, fulfillment selected, menu viewed, builder started/completed, cart changed, checkout started, quote changed, payment attempted/result, order accepted/rejected, reward reserved/redeemed/released, refund resolved, and support opened/resolved. Use pseudonymous identifiers where possible, stable event/order IDs, consent boundaries, and server confirmation for purchase events. A customer opening a confirmation page twice must not create two purchases in reporting.

Define metric denominators, refund treatment, time windows, and channel attribution. Separate total loyalty-member revenue from causal loyalty lift. Separate observed revenue from modeled CLV. Reconcile sales/refunds/benefits to authorities before exposing AI business Q&A. Integrate warehouse/BI/CRM/CDP only where confirmed; support controlled exports first when appropriate.

CMS delivery includes image/text/offer templates, content validation, accessibility requirements, preview across breakpoints, store overrides, effective dates, scheduled publication, audit, and rollback. “No engineering required” applies to these supported fields and rules, not arbitrary new functionality.

## 10. Verification strategy and acceptance suites

Verification is continuous per work package. All results below are planned, not completed tests of an application.

| Suite | Coverage | Evidence |
| --- | --- | --- |
| T-01 Responsive/navigation | All routes, shells, viewport boundaries, resize/rotation, sticky regions, Back/Forward | Browser E2E, screenshots, manual touch/keyboard review |
| T-02 Identity/privacy | Guest/member, expired codes, recovery/merge, logout, data requests, ownership checks | Domain + API authorization + browser flows |
| T-03 Store/fulfillment | Hours, zones, no service, permissions, fees, schedule/DST, slot conflict, store switch | Contract + browser scenarios |
| T-04 Menu/build | Modifier limits, paid extras, combos, allergens/nutrition, sold out, saved/shared builds | Domain fixtures and provider round-trip verification |
| T-05 Cart/payment | Quotes, tax/fee/tip, declines, unknown results, retry, concurrency, wallets, split tender | Provider sandbox + failure injection + browser E2E |
| T-06 Loyalty/value | Earn/redeem/expiry/claim, concurrent spend, release, credits, gift funds, tiers/referrals | Ledger/provider reconciliation with boundary cases |
| T-07 Order/delivery | Acceptance, status ordering, delays, contact fallback, pickup, changes/cancel, notifications | Contract replay and end-to-end store sandbox |
| T-08 Support/refunds | Correct routing, full/partial refund, repeated refund attempt, restored benefits, case permissions | End-to-end reconciliation and staff workflow review |
| T-09 Operations/access | Store controls, roles, scoped data, CMS preview/publish/rollback, configuration conflicts | API access tests and operator acceptance |
| T-10 Analytics/growth | Deduplication, metric reconciliation, consent/suppression, experiment exposure, campaigns | Known event dataset and expected outcomes |
| T-11 Group/community | Concurrent participants, host deadline, catering capacity, gifting, attribution, partial payment | Multi-session browser flows and settlement checks |
| T-12 PWA/native capabilities | Installation, offline/reconnect, cache privacy, updates, handoff, payment return | Supported real devices plus browser automation |
| T-13 Accessibility/performance | WCAG target, focus, text zoom, motion, contrast, slow network, Core Web Vitals | Automated checks plus manual VoiceOver/TalkBack/keyboard review |
| T-14 Reliability/security/migration | Provider outage, delayed/duplicate events, access abuse, load, backups, migrations/rollback | Failure/load exercise and reconciliation reports |
| T-15 Pilot evaluation | Optional feature usefulness, economics, operational load, kill switch | Controlled pilot report and go/change/stop decision |

### 10.1 Viewport and browser matrix

| Class | Representative CSS viewport samples | Special checks |
| --- | --- | --- |
| Small phone | 320×568, 360×640 | Long labels, keyboard, reward amounts, no horizontal overflow |
| Typical phone | 375×812, 390×844, 414×896, 430×932 | Bottom action/nav, safe areas, forms, sheets |
| Phone landscape | 844×390 and short-height custom sizes | Keyboard and sticky elements do not consume usable screen |
| Tablet portrait | 768×1024, 820×1180 | Touch-friendly multi-column behavior and overlays |
| Tablet landscape | 1024×768, 1180×820 | Hybrid input, summary panel, short-height scrolling |
| Tablet split-screen | 500×900, 600×900 | Adapt to available viewport, not device identity |
| Laptop/desktop | 1280×720, 1366×768, 1440×900, 1920×1080 | Readable line lengths, summary, keyboard, constrained form widths |
| Wide / fluid | 2560×1440; arbitrary widths such as 537 and 913 px | Sensible max width and no dependence on named devices |
| Breakpoint edges | 479/480, 767/768, 1023/1024, 1279/1280 px | No jump causing lost state, overlap, or hidden primary actions |

Cover current stable Chrome/Edge/Firefox and Safari on desktop, iOS Safari, Android Chrome, and an iPad/tablet browser; record exact versions at release and agree the support floor during M0. Include 200% text zoom and reflow checks at a 320 CSS px effective width. Include touch, mouse, keyboard, reduced motion, denied permissions, slow network, offline, and expired sessions.

Run core commerce E2E in Chromium, Firefox, and WebKit with selected emulated viewports. Run the full viewport matrix for layout/critical-task checks rather than every theoretical combination. Playwright can emulate viewport, touch, device scale, and other context properties; browser emulation is supplemented by actual iOS and Android hardware. [Playwright emulation](https://playwright.dev/docs/emulation)

### 10.2 Inspect Element acceptance procedure

1. Open the application URL in Chrome/Edge and open Developer Tools using Inspect.
2. Toggle the device toolbar; select Responsive or a phone/tablet preset. Enter width and height in CSS pixels.
3. At 390×844, confirm app-like compact navigation, correctly positioned cart/action, readable menu, and touch-sized controls.
4. Select a store, customize an item, add it to cart, view rewards, and reach checkout. Use sandbox payment only in a test environment.
5. Change to 820×1180, 1440×900, and an arbitrary width without resetting the session. Confirm selections and totals remain intact.
6. Rotate, resize across each breakpoint, open dialogs, use Back/Forward, trigger validation errors, and inspect long-content behavior.
7. Throttle the network and disable location. Confirm loading/recovery/manual-location behavior; do not infer hardware performance solely from emulation.
8. Repeat critical payment, keyboard, permission, camera, install, and safe-area flows on real devices before release.

Chrome describes Device Mode as an approximation of mobile behavior, not actual execution on a mobile device. This plan therefore makes both DevTools usability and real-device validation acceptance requirements. [Chrome Device Mode](https://developer.chrome.com/docs/devtools/device-mode)

### 10.3 Quantitative gates

- All selected P0 capabilities have owner, contract, implementation, negative-case coverage, and acceptance evidence.
- Two navigation taps to core destinations; two primary actions for an eligible saved reorder, with payment authentication excluded and counted separately.
- Proposed ≥90% unassisted core-task completion in usability testing with representative new/returning customers.
- No duplicate accepted orders/charges or lost benefits in specified retry/failure/concurrency tests.
- WCAG 2.2 AA target with manual review; no unresolved critical accessibility blocker. [WCAG](https://www.w3.org/TR/WCAG22/)
- Target field p75 LCP ≤2.5 s, INP ≤200 ms, CLS ≤0.1; use lab budgets before sufficient field data exists and do not label a lab result a field pass. [Web Vitals](https://web.dev/articles/vitals)
- Set numerical availability, provider timeout, reconciliation-lag, peak-load, recovery-time, and recovery-point targets in M0 using vendor SLAs and business impact. Release requires measured evidence against the agreed values.

## 11. Environments, CI/CD, migration, and rollout

Use local fixture development, shared integration/sandbox, production-like staging, and production with separate credentials/data. Demo mode must not send real payments, messages, or kitchen orders. Keep fixture switching inaccessible to production customers. CI should run formatting/types, relevant domain/contract tests, dependency checks, build, and core browser tests; staging gates add provider sandbox, accessibility, performance, and operator review.

Select hosting during M0 based on server/background-job/database requirements, data handling, cost, and operating ownership. Provision TLS, secrets management, backups, monitoring, deployment health checks, and controlled feature flags. Use backward-compatible database changes and separate schema migration from destructive cleanup.

If replacing an existing experience:

1. Inventory and map customer IDs, balances, rewards, expiry, consents, favorites, and available history.
2. Resolve duplicate identities with verified rules; do not infer ownership from a shared name.
3. Perform a sandbox migration and reconcile record counts, financial/loyalty totals, and sample histories.
4. Define freeze/delta-capture or vendor-supported cutover procedure; avoid double earning/redemption across old/new systems.
5. Rehearse rollback and document how orders/payments accepted during cutover remain fulfillable.
6. Pilot a small set of ready stores, monitor outcomes, and expand only after agreed stability criteria.

Operational runbooks cover failed payment/order reconciliation, missing points, refunds, delivery outages, store pause, menu error, campaign rollback, account recovery, vendor escalation, data incident, and restore from backup. Assign on-call and business contacts. Train store/support staff before opening live ordering.

Rollout flags operate by store/channel/cohort where appropriate. Turning off a new checkout must not abandon already accepted orders, refunds, or balance reservations. Application rollback does not reverse financial transactions: use reconciliation and compensating operations. Pilot dashboards track payment/order acceptance, duplicate events, reconciliation exceptions, ETA accuracy, support contacts, refunds, conversion, and reward use.

## 12. Completeness, definition of done, and handoff

Appendix A maps every consolidated capability to delivery packages and acceptance suites. Appendix B maps every original workbook entry to implementation ownership and verification. Both inherit original priorities, including later and conditional work. Overlapping entries share implementation rather than multiply scope.

A feature is complete only when customer/staff behavior, responsive layouts, domain rules, authorization, integration, loading/error/failure states, instrumentation, tests, and operating documentation are complete for the selected release. A later/conditional feature requires an explicit disposition and trigger; it must not disappear from tracking or be reported as implemented.

Required implementation handoff artifacts: architecture decisions, approved responsive designs, component catalog, data dictionary, API/vendor contracts, state machines, configured policy versions, traceable backlog, environment/run instructions, acceptance evidence, migration/reconciliation results if applicable, dashboards/alerts, operating runbooks, and release/rollback plan.

This planning deliverable does not create code, install dependencies, configure providers, charge customers, or deploy a site. The next implementation activity, once requested, starts with M0/M1 and preserves this traceability.

## Appendix A. Consolidated capability implementation coverage

Each row inherits the exact priority from the scope. Package details are in section 5; acceptance-suite definitions are in section 10. All customer-facing rows also require T-01 and T-13. Conditional features require the relevant M0 decision before production implementation.

| Scope ID | Capability | Inherited priority | Delivery packages | Acceptance suites | Milestone / disposition |
| --- | --- | --- | --- | --- | --- |
| AC-01 | One identity across ordering and loyalty; preserve recognition through the journey | P0 / Core US fit | WP-02 | T-02 | M1 responsive; M2–M4 implementation/release |
| AC-02 | Guest checkout with optional account creation and eligible order linking after purchase | P0 / Core US fit | WP-02 | T-02 | M1 responsive; M2–M4 implementation/release |
| AC-03 | Passwordless sign-in with recovery and alternate contact verification; preserve cart during login | P0 / Core US fit | WP-02 | T-02 | M1 responsive; M2–M4 implementation/release |
| AC-04 | Saved addresses, favorite store, saved payment tokens, profile and communication preferences | P0 / Core US fit | WP-02 | T-02 | M1 responsive; M2–M4 implementation/release |
| AC-05 | Secure sessions, staff MFA, and risk-based customer verification for sensitive actions | P0 / Core US fit | WP-02 | T-02 | M1 responsive; M2–M4 implementation/release |
| AC-06 | Safe account recovery and duplicate-account merging with verified ownership and balance history | P0 / Core US fit | WP-02 | T-02 | M1 responsive; M2–M4 implementation/release |
| AC-07 | Unified identity across available channels; use third-party identity only where data and permissions support it | P0 / Conditional | WP-02 | T-02 | M1 responsive; M2–M4 implementation/release |
| AC-08 | Customer data access/deletion request workflows and separate marketing choices | P0 / Core US fit | WP-02, WP-09 | T-02, T-09 | M1 responsive; M2–M4 implementation/release |
| ST-01 | Store locator with manual address/ZIP entry, optional location access, and remembered store | P0 / Core US fit | WP-03 | T-03 | M1 responsive; M2–M4 implementation/release |
| ST-02 | Suggest a suitable store using service area, opening hours, menu availability, and capacity; allow correction | P0 / Core US fit | WP-03 | T-03 | M1 responsive; M2–M4 implementation/release |
| ST-03 | Pickup/delivery selection with address validation, apartment/unit, drop-off instructions, and saved locations | P0 / Core US fit | WP-03 | T-03 | M1 responsive; M2–M4 implementation/release |
| ST-04 | Store-specific hours, holiday closures, temporary pauses, delivery zones, fees, and minimums | P0 / Core US fit | WP-03 | T-03 | M1 responsive; M2–M4 implementation/release |
| ST-05 | ASAP and scheduled ordering with capacity-controlled slots and realistic lead times | P0 / Core US fit | WP-03 | T-03 | M1 responsive; M2–M4 implementation/release |
| ST-06 | Change-store preview identifying price, item, reward, and time changes before acceptance | P0 / Core US fit | WP-03 | T-03 | M1 responsive; M2–M4 implementation/release |
| ST-07 | Search-friendly store pages and accurate Google/Apple Maps ordering destinations | P0 / Core US fit | WP-03, WP-01 | T-03, T-13 | M1 responsive; M2–M4 implementation/release |
| ST-08 | Store capability flags for curbside, dine-in, catering, special menus, and other supported services | P0 foundation; services conditional | WP-03 | T-03 | M1 responsive; M2–M4 implementation/release |
| MN-01 | Store-specific menu, price, item/ingredient availability, imagery, categories, and limited-time items | P0 / Core US fit | WP-04 | T-04 | M1 responsive; M2–M4 implementation/release |
| MN-02 | Signature or custom pizza/salad; supported sizes, bases/crusts, sauces, cheese, toppings, and finishes/dressings | P0 / Core US fit | WP-04 | T-04 | M1 responsive; M2–M4 implementation/release |
| MN-03 | Clear included-versus-paid modifiers, required choices, incompatible combinations, and running price | P0 / Core US fit | WP-04 | T-04 | M1 responsive; M2–M4 implementation/release |
| MN-04 | Fast topping selection, readable summary, remove/reset/edit actions, and visual size guidance | P0 / Core US fit | WP-04 | T-04 | M1 responsive; M2–M4 implementation/release |
| MN-05 | Ingredient details, dietary filters, authoritative nutrition calculations, and cross-contact information | P0 / Core US fit | WP-04 | T-04 | M1 responsive; M2–M4 implementation/release |
| MN-06 | Sold-out ingredient handling and customer-approved replacements; never silently substitute | P0 / Core US fit | WP-04 | T-04 | M1 responsive; M2–M4 implementation/release |
| MN-07 | Save/name a build, favorite an item, and validate it against the current menu on reuse | P0 / Core US fit | WP-04 | T-04 | M1 responsive; M2–M4 implementation/release |
| MN-08 | Supported combo configuration with required selections and pricing rules | P0 / Conditional on live menu | WP-04 | T-04 | M1 responsive; M2–M4 implementation/release |
| MN-09 | Rich topping visualization with an accessible text equivalent | P1 / US pilot | WP-04 | T-04 | M5 after dependency/fit gate |
| MN-10 | Share a saved build through a link; recipient sees current store availability and price | P1 / Core US fit | WP-04 | T-04 | M5 after dependency/fit gate |
| MN-11 | Half-and-half configuration | P1 / Conditional on MOD kitchen and POS support | WP-04 | T-04 | M5 after dependency/fit gate |
| CK-01 | Persistent cart with quantity, edit, duplicate, remove, and full customization summaries | P0 / Core US fit | WP-05 | T-05 | M1 responsive; M2–M4 implementation/release |
| CK-02 | Explicit cart revalidation for stale prices, unavailable items, expired offers, and store changes | P0 / Core US fit | WP-05 | T-05 | M1 responsive; M2–M4 implementation/release |
| CK-03 | Guest/member checkout, minimal fields, autofill support, and optional loyalty enrollment | P0 / Core US fit | WP-05 | T-05 | M1 responsive; M2–M4 implementation/release |
| CK-04 | Cards, Apple Pay, and Google Pay where supported; saved payment tokens | P0 / Core US fit | WP-05 | T-05 | M1 responsive; M2–M4 implementation/release |
| CK-05 | Gift-card balance check and supported split tender; preserve unused value | P0 / Core US fit | WP-05 | T-05 | M1 responsive; M2–M4 implementation/release |
| CK-06 | Itemized subtotal, discount, credits, taxes, fees, tip, and final payable amount before confirmation | P0 / Core US fit | WP-05 | T-05 | M1 responsive; M2–M4 implementation/release |
| CK-07 | Available rewards and validated promo codes in cart/checkout; clear incompatibility explanations | P0 / Core US fit | WP-05, WP-06 | T-05, T-06 | M1 responsive; M2–M4 implementation/release |
| CK-08 | Payment decline/timeout recovery, duplicate-submission prevention, and uncertain-result reconciliation | P0 / Core US fit | WP-05 | T-05 | M1 responsive; M2–M4 implementation/release |
| CK-09 | Confirmation only after reliable order acceptance; distinguish pending payment/order states | P0 / Core US fit | WP-05 | T-05 | M1 responsive; M2–M4 implementation/release |
| CK-10 | Order receipt and secure guest order lookup | P0 / Core US fit | WP-05 | T-05 | M1 responsive; M2–M4 implementation/release |
| CK-11 | PayPal and Venmo | P1 / Conditional on processor, demand, and operating economics | WP-05 | T-05 | M5 after dependency/fit gate |
| CK-12 | Best eligible offer recommendation with savings preview; ask before consuming points or stored value | P1 / US pilot | WP-05, WP-11 | T-05, T-10, T-15 | M5 after dependency/fit gate |
| CK-13 | Small optional add-on area based on the order; no extra mandatory checkout stage | P1 / Core US fit | WP-05, WP-11 | T-05, T-10 | M5 after dependency/fit gate |
| RW-01 | One Rewards & Wallet destination; contextual reward visibility on home, cart, and checkout | P0 / Core US fit | WP-06 | T-06 | M1 responsive; M2–M4 implementation/release |
| RW-02 | Points balance, pending earnings, history, progress, expiration, and available item rewards | P0 / Core US fit | WP-06 | T-06 | M1 responsive; M2–M4 implementation/release |
| RW-03 | Earn/redeem online and at supported stores through scan or supported identity lookup | P0 / Core US fit | WP-06 | T-06 | M1 responsive; M2–M4 implementation/release |
| RW-04 | Missing-points receipt claim, manual entry fallback, claim status, duplicate-claim protection | P0 / Core US fit | WP-06 | T-06 | M1 responsive; M2–M4 implementation/release |
| RW-05 | Separate gift-card funds, service credits, promotional rewards, points, and saved payment methods | P0 / Core US fit | WP-06 | T-06 | M1 responsive; M2–M4 implementation/release |
| RW-06 | Partial credit use, balance history, applicable restrictions, and clear remaining value | P0 / Core US fit | WP-06 | T-06 | M1 responsive; M2–M4 implementation/release |
| RW-07 | Reserve/apply/release rewards safely; restore appropriate value after failed orders or refunds | P0 / Core US fit | WP-06 | T-06 | M1 responsive; M2–M4 implementation/release |
| RW-08 | Configurable reward catalog, eligibility, store participation, stacking, earning, expiry, and rounding | P0 / Core US fit | WP-06, WP-09 | T-06, T-09 | M1 responsive; M2–M4 implementation/release |
| RW-09 | Restricted staff adjustments with reason, audit history, and redemption-abuse monitoring | P0 / Core US fit | WP-06, WP-09 | T-06, T-09, T-14 | M1 responsive; M2–M4 implementation/release |
| RW-10 | BOGO, product/item rewards, bonus points, and multipliers | P1; P0 where needed to preserve live programs | WP-06 | T-06 | M2–M4 core/continuity; M5 expansion |
| RW-11 | Birthday/anniversary benefits and qualified-purchase referral rewards | P1 / Core US fit | WP-06, WP-11 | T-06, T-10 | M5 after dependency/fit gate |
| RW-12 | Digital gift-card purchase, message, scheduled sending, claiming, and support | P1 / Core US fit | WP-06, WP-12 | T-05, T-06, T-11 | M5 after dependency/fit gate |
| RW-13 | Modifier-specific and dine-in-only benefits | P1 / Conditional on menu, POS, and strategy | WP-06 | T-06 | M5 after dependency/fit gate |
| RW-14 | Tiers, missions, punch cards, purchase journeys, and item-completion challenges | P2 / US pilot | WP-06, WP-14 | T-06, T-15 | M6 pilot after explicit decision |
| RW-15 | Points-plus-cash or earned dollar rewards | P2 / US pilot; program redesign, not a silent change to MOD points | WP-05, WP-06, WP-14 | T-05, T-06, T-15 | M6 pilot after explicit decision |
| RW-16 | Card-linked automatic earning with receipt fallback | P2 / US pilot; explicit enrollment and provider support | WP-06, WP-14 | T-06, T-14, T-15 | M6 pilot after explicit decision |
| RW-17 | Customer-funded wallet top-ups and optional auto-reload | P2 / US pilot; separate stored-value operating model | WP-05, WP-06, WP-14 | T-05, T-06, T-15 | M6 pilot after explicit decision |
| RW-18 | Mini-games and bingo campaigns | P2 / US pilot; keep outside the primary ordering flow | WP-11, WP-14 | T-06, T-10, T-15 | M6 pilot after explicit decision |
| OR-01 | Current/history order views, favorites, and Order Again with current-price validation | P0 / Core US fit | WP-07 | T-07 | M1 responsive; M2–M4 implementation/release |
| OR-02 | Accepted, preparing, ready/dispatched, completed, delayed, rejected, and canceled status handling | P0 / Core US fit | WP-07 | T-07 | M1 responsive; M2–M4 implementation/release |
| OR-03 | ETA and proactive delay updates using operational data; distinguish estimates from confirmed events | P0 / Core US fit | WP-07 | T-07 | M1 responsive; M2–M4 implementation/release |
| OR-04 | Transactional email/SMS and in-site status; push only where supported and opted into | P0 / Core US fit | WP-07 | T-07 | M1 responsive; M2–M4 implementation/release |
| OR-05 | Pickup instructions, location/directions, order identifier, and collection handoff | P0 / Core US fit | WP-07 | T-07 | M1 responsive; M2–M4 implementation/release |
| OR-06 | Delivery tracking, contact-free instructions, and proof of delivery where available | P0 / Conditional on delivery provider | WP-07 | T-07 | M1 responsive; M2–M4 implementation/release |
| OR-07 | Masked driver messaging/calling where supported; store/support fallback | P0 / Conditional on provider | WP-07 | T-07 | M1 responsive; M2–M4 implementation/release |
| OR-08 | Order modification/cancellation policy by preparation stage and support routing when self-service is unavailable | P0 / Core US fit | WP-07, WP-08 | T-07, T-08 | M1 responsive; M2–M4 implementation/release |
| OR-09 | Curbside arrival and vehicle details | P1 / Conditional on staffed store workflow | WP-07 | T-07 | M5 after dependency/fit gate |
| OR-10 | QR/table ordering or dine-in check-in | P1 / US pilot at suitable locations | WP-07 | T-07 | M5 after dependency/fit gate |
| OR-11 | Arrival-based preparation using optional location sharing | P2 / US pilot; requires kitchen integration and robust fallback | WP-07, WP-14 | T-03, T-07, T-15 | M6 pilot after explicit decision |
| OR-12 | Pickup lockers/portals | P2 / Limited initial fit; separate hardware and store investment | WP-07, WP-14 | T-07, T-15 | M6 pilot after explicit decision |
| OR-13 | Native lock-screen/live activity updates | P2 / Conditional on native app strategy | WP-13, WP-14 | T-07, T-12, T-15 | M6 pilot after explicit decision |
| CS-01 | Order-linked help with pickup/store and delivery/central routing | P0 / Core US fit | WP-08 | T-08 | M1 responsive; M2–M4 implementation/release |
| CS-02 | Missing, incorrect, late, damaged, undelivered, and duplicate-order issue categories | P0 / Core US fit | WP-08 | T-08 | M1 responsive; M2–M4 implementation/release |
| CS-03 | Refund request, eligibility, full/partial refund, status, and customer communication | P0 / Core US fit | WP-08 | T-08 | M1 responsive; M2–M4 implementation/release |
| CS-04 | Reconcile payment, gift-card funds, redeemed rewards, credits, and earned points after adjustments | P0 / Core US fit | WP-08 | T-08 | M1 responsive; M2–M4 implementation/release |
| CS-05 | Appropriate service credit with reason and restrictions; do not silently replace a refund with a promotion | P0 / Core US fit | WP-08 | T-08 | M1 responsive; M2–M4 implementation/release |
| CS-06 | Support console showing order, payment, loyalty, and delivery context with controlled access | P0 / Core US fit | WP-08 | T-08 | M1 responsive; M2–M4 implementation/release |
| CS-07 | Escalation ownership and response targets; continuity if provider contact fails | P0 / Core US fit | WP-08 | T-08 | M1 responsive; M2–M4 implementation/release |
| CS-08 | Post-order feedback and recovery follow-up; public item ratings only with moderation and evidence | P1 feedback; P2 public ratings | WP-08, WP-11, WP-14 | T-08, T-10, T-15 | M5 feedback; M6 public ratings |
| GP-01 | Shared group-order link, named items, deadline, organizer review, and one payer initially | P1 / Core US fit | WP-12 | T-11 | M5 after dependency/fit gate |
| GP-02 | Catering packages, headcount guidance, lead time, capacity check, business receipts, and support | P1 / Conditional on operations | WP-12 | T-11 | M5 after dependency/fit gate |
| GP-03 | Fundraiser attribution, local campaign pages/codes, and reporting | P1 / Core US fit | WP-12, WP-10 | T-06, T-10, T-11 | M5 after dependency/fit gate |
| GP-04 | Optional reward donation/Pay It Forward with approved beneficiaries and visible accounting | P1 / Conditional on approved program | WP-12, WP-06 | T-06, T-11 | M5 after dependency/fit gate |
| GP-05 | Multiple-payer group ordering | P2 / US pilot; define incomplete payments, refunds, and cutoff behavior | WP-12, WP-05, WP-14 | T-05, T-11, T-15 | M6 pilot after explicit decision |
| GP-06 | Paid membership/subscription benefits | P2 / US pilot; validate frequency, margin, billing, and cancellation model | WP-05, WP-06, WP-14 | T-05, T-06, T-15 | M6 pilot after explicit decision |
| GP-07 | Table booking, retail-product earning, and airline/coalition rewards | Limited fit; retain only if MOD's business model expands | WP-00, WP-14 | T-11, T-15 | M0 disposition; M6 only if business model changes |
| MK-01 | Manage imagery, banners, featured items, limited-time offers, and loyalty placements | P0 / Core US fit | WP-09, WP-01 | T-09, T-13 | M1 responsive; M2–M4 implementation/release |
| MK-02 | Persistent favorites and order history as the first personalization layer | P0 / Core US fit | WP-04, WP-07 | T-04, T-07 | M1 responsive; M2–M4 implementation/release |
| MK-03 | Detect/report abandonment by stage and channel | P0 / Core US fit | WP-10 | T-10 | M1 responsive; M2–M4 implementation/release |
| MK-04 | Prebuilt/custom segments by frequency, spend, products, daypart, activity, and lifecycle | P1 / Core US fit | WP-11 | T-10 | M5 after dependency/fit gate |
| MK-05 | Dynamic segment membership, personalized home content, rewards, offers, and win-back content | P1 / Core US fit | WP-11 | T-10 | M5 after dependency/fit gate |
| MK-06 | Email, SMS, supported push, and in-app orchestration with preferences, suppression, and frequency caps | P1; controls P0 whenever messaging is enabled | WP-11 | T-10 | M2–M4 core/continuity; M5 expansion |
| MK-07 | Cart recovery; compare reminders against incentives; suppress after purchase or unresolved service issues | P1 / Core US fit | WP-11 | T-10 | M5 after dependency/fit gate |
| MK-08 | Store-specific popular products and order-aware add-ons; no fabricated social proof | P1 / Core US fit | WP-11 | T-10 | M5 after dependency/fit gate |
| MK-09 | Controlled tests of messages, rewards, offers, placements, checkout, and no-offer holdouts | P1 / Core US fit | WP-10, WP-11 | T-10 | M5 after dependency/fit gate |
| MK-10 | Conversion, incremental revenue, promotional effectiveness, and contribution-margin measurement | P1 / Core US fit | WP-10 | T-10 | M5 after dependency/fit gate |
| MK-11 | AI recommendations, segment generation, natural-language segments, and real-time behavioral adaptation | P2 / US pilot | WP-10, WP-11, WP-14 | T-10, T-14, T-15 | M6 pilot after explicit decision |
| MK-12 | AI ordering assistant and voice/car ordering | P2 / US pilot; structured ordering remains available | WP-05, WP-13, WP-14 | T-04, T-05, T-12, T-15 | M6 pilot after explicit decision |
| OP-01 | Store order pause/resume, ingredient availability, prep-time and slot-capacity controls | P0 / Core US fit | WP-09 | T-09 | M1 responsive; M2–M4 implementation/release |
| OP-02 | Order acceptance acknowledgement, failed-order queue, escalation, and reconciliation | P0 / Core US fit | WP-07, WP-09 | T-07, T-09, T-14 | M1 responsive; M2–M4 implementation/release |
| OP-03 | Store/franchise participation and allocation rules for discounts, credits, and refunds | P0 / Core US fit | WP-00, WP-09 | T-06, T-08, T-09 | M1 responsive; M2–M4 implementation/release |
| OP-04 | Role-based access, staff MFA, audit logs, controlled refunds/credits, and change approval by policy | P0 / Core US fit | WP-09 | T-09 | M1 responsive; M2–M4 implementation/release |
| OP-05 | Content templates, preview, scheduling, publishing, rollback, and store-specific overrides | P0 / Core US fit | WP-09 | T-09 | M1 responsive; M2–M4 implementation/release |
| OP-06 | Assign authoritative owners for menu, price, availability, identity, points, payment, and order status | P0 / Core US fit | WP-00 | T-14 | M0 ownership; validated throughout |
| OP-07 | Ordering/Olo, POS, payment, loyalty, delivery, and messaging integrations as required by the confirmed stack | P0 / Conditional on existing systems | WP-00, WP-03, WP-05, WP-06, WP-07 | T-03, T-05, T-06, T-07, T-14 | M1 responsive; M2–M4 implementation/release |
| OP-08 | Customer/order data export, event APIs, retry handling, duplicate-event protection, and access controls | P0 / Core US fit | WP-10, WP-15 | T-10, T-14 | M1 responsive; M2–M4 implementation/release |
| OP-09 | CRM, CDP, Snowflake, and Tableau/BI connectors | P1 / Conditional; promote only confirmed launch dependencies | WP-10 | T-10, T-14 | M5 after dependency/fit gate |
| OP-10 | Sales, item/store/operational performance, retention, loyalty enrollment/activation/attach/revenue, cart conversion | P0 / Core US fit | WP-10 | T-10 | M1 responsive; M2–M4 implementation/release |
| OP-11 | Customer behavior, campaign performance, customer lifetime value, first-/third-party data provenance | P1; provenance foundation P0 | WP-10 | T-10 | M2–M4 core/continuity; M5 expansion |
| OP-12 | Payment success, failed store submissions, ETA accuracy, support contacts, refunds, and margin | P0 / Core US fit | WP-10, WP-15 | T-10, T-14 | M1 responsive; M2–M4 implementation/release |
| OP-13 | AI summaries, business Q&A, and suggested actions grounded in governed metrics | P2 / US pilot; human review before consequential actions | WP-10, WP-14 | T-10, T-14, T-15 | M6 pilot after explicit decision |
| OP-14 | Migration of identities, balances, consents, favorites, and available order history; reconciliation and rollback | P0 / Conditional on replacing an existing experience | WP-02, WP-06, WP-15 | T-02, T-06, T-14 | M4 if replacement/migration applies |
| QA-01 | Responsive mobile/desktop UI, accessible controls, keyboard/screen-reader support, readable errors | P0 / Core US fit | WP-01, WP-15 | T-01, T-13 | M1 responsive; M2–M4 implementation/release |
| QA-02 | Performance budgets, low-bandwidth behavior, cart recovery, monitoring, and dependency outage handling | P0 / Core US fit | WP-01, WP-15 | T-01, T-13, T-14 | M1 responsive; M2–M4 implementation/release |
| QA-03 | Secure payment tokenization, least-privilege access, abuse controls, protected customer data, and recovery procedures | P0 / Core US fit | WP-02, WP-05, WP-15 | T-02, T-05, T-14 | M1 responsive; M2–M4 implementation/release |
| QA-04 | Indexable store/menu pages, accurate metadata, stable URLs, and product/category/offer deep links | P0 / Core US fit | WP-01, WP-03, WP-04 | T-01, T-03, T-04, T-13 | M1 responsive; M2–M4 implementation/release |
| QA-05 | Structured, accurate public content for search and AI discovery; no ranking guarantee | P1 / Core US fit | WP-03, WP-10 | T-03, T-10, T-13 | M5 after dependency/fit gate |
| QA-06 | Native app ordering/design and consistent shared capabilities | P1 / Conditional on native app scope; preserve existing app continuity | WP-13 | T-01, T-12 | M5 after dependency/fit gate |
| QA-07 | Optional app-install prompts/QR codes, supported Open in App links, and validated cart/session handoff | P1 / Conditional; do not promise universal installed-app detection | WP-13 | T-01, T-12 | M5 after dependency/fit gate |
| QA-08 | Remote content/configuration updates within supported platform boundaries | P1 / Conditional; code/capability changes may still require releases | WP-09, WP-13 | T-09, T-12 | M5 after dependency/fit gate |

## Appendix B. All 169 original workbook features mapped to delivery

Source IDs refer to Sheet1 rows in the original workbook. Descriptions and scope treatment remain preserved in the companion scope README. This index assigns implementation packages and verification to every original entry; feature priorities are inherited verbatim. All customer UI also follows T-01/T-13. See the package dependency table for sequencing; P0 work reaches M4, P1 expands in M5, and P2 is gated in M6 unless continuity requires earlier delivery.

| Source ID | Original feature | Inherited priority | Delivery packages | Acceptance suites |
| --- | --- | --- | --- | --- |
| X002 | Single sign-on between ordering and loyalty | P0 | WP-02 | T-02 |
| X003 | Passwordless/SMS login | P0 | WP-02 | T-02 |
| X004 | Recognize logged-in customers across ordering journey | P0 | WP-02 | T-02 |
| X005 | First-party vs third-party reporting | P0 | WP-10 | T-10 |
| X006 | Retention | P0 | WP-10 | T-10 |
| X007 | Customer lifetime value | P1 | WP-10 | T-10 |
| X008 | Customer behaviour reporting | P1 | WP-10 | T-10 |
| X009 | Loyalty attach rate | P0 | WP-10 | T-10 |
| X010 | AI-generated performance summaries | P2 / US pilot | WP-10, WP-14 | T-10, T-14, T-15 |
| X011 | AI reporting/business Q&A | P2 / US pilot | WP-10, WP-14 | T-10, T-14, T-15 |
| X012 | AI-recommended actions | P2 / US pilot | WP-10, WP-14 | T-10, T-14, T-15 |
| X013 | Sales reporting | P0 | WP-10 | T-10 |
| X014 | Item performance | P0 | WP-10 | T-10 |
| X015 | Store-level analytics | P0 | WP-10 | T-10 |
| X016 | Operational reporting | P0 | WP-10 | T-10 |
| X017 | Loyalty enrollment | P0 | WP-10 | T-10 |
| X018 | Loyalty activation | P0 | WP-10 | T-10 |
| X019 | Loyalty revenue | P0 | WP-10 | T-10 |
| X020 | Cart conversion | P0 | WP-10 | T-10 |
| X021 | Campaign performance | P1 | WP-10 | T-10 |
| X022 | Fully customizable app | P1 / Conditional | WP-09, WP-13 | T-09, T-12 |
| X023 | Fully customizable website | P0 | WP-09 | T-09 |
| X024 | Allow business/marketing teams to change front-end content without engineering | P0 | WP-09 | T-09 |
| X025 | Make changes without vendor/support tickets | P0 | WP-09 | T-09 |
| X026 | Make appropriate changes without requiring an app-store release | P1 / Conditional | WP-09, WP-13 | T-09, T-12 |
| X027 | Detect abandoned carts | P0 | WP-10, WP-11 | T-10 |
| X028 | Cart-abandonment reporting | P0 | WP-10, WP-11 | T-10 |
| X029 | Channel-level abandonment tracking | P0 | WP-10, WP-11 | T-10 |
| X030 | Automated abandoned-cart messages | P1 | WP-10, WP-11 | T-10 |
| X031 | Test reminder vs discount recovery | P1 | WP-10, WP-11 | T-10 |
| X032 | Venmo | P1 / Conditional | WP-05, WP-06 | T-05, T-06 |
| X033 | PayPal | P1 / Conditional | WP-05, WP-06 | T-05, T-06 |
| X034 | Apple Pay | P0 | WP-05, WP-06 | T-05, T-06 |
| X035 | Google Pay | P0 | WP-05, WP-06 | T-05, T-06 |
| X036 | Loyalty enrollment during checkout | P0 | WP-02, WP-05, WP-06 | T-02, T-05, T-06 |
| X037 | Show available rewards during checkout | P0 | WP-05, WP-06 | T-05, T-06 |
| X038 | Snowflake integration | P1 / Conditional | WP-00, WP-10 | T-10, T-14 |
| X039 | Tableau/BI integration | P1 / Conditional | WP-00, WP-10 | T-10, T-14 |
| X040 | CRM integration | P1 / Conditional | WP-00, WP-10 | T-10, T-14 |
| X041 | CDP integration | P1 / Conditional | WP-00, WP-10 | T-10, T-14 |
| X042 | Olo integration/compatibility | P0 / Conditional | WP-00, WP-03, WP-04, WP-07 | T-03, T-04, T-07, T-14 |
| X043 | Central customer profile/data | P0 | WP-02, WP-10, WP-15 | T-02, T-10, T-14 |
| X044 | Real-time customer data | P0 | WP-00, WP-10 | T-10, T-14 |
| X045 | Customer data available to MOD | P0 | WP-00, WP-10 | T-10, T-14 |
| X046 | Send customer/order data downstream | P0 | WP-00, WP-10 | T-10, T-14 |
| X047 | Real-time APIs | P0 | WP-00, WP-10 | T-10, T-14 |
| X048 | POS integration | P0 / Conditional | WP-00, WP-03, WP-04, WP-07 | T-03, T-04, T-07, T-14 |
| X161 | Unified customer identity | P0 / Conditional | WP-02, WP-10, WP-15 | T-02, T-10, T-14 |
| X162 | Account merge and identity resolution | P0 | WP-02, WP-10, WP-15 | T-02, T-10, T-14 |
| X049 | Pre-built customer segments | P1 | WP-11 | T-10 |
| X050 | Custom customer segments | P1 | WP-11 | T-10 |
| X051 | AI-generated customer segments | P2 / US pilot | WP-11, WP-14 | T-10, T-14, T-15 |
| X052 | Natural-language segment creation | P2 / US pilot | WP-11, WP-14 | T-10, T-14, T-15 |
| X053 | Segment by purchase frequency | P1 | WP-11 | T-10 |
| X054 | Segment by spend | P1 | WP-11 | T-10 |
| X055 | Segment by purchased products | P1 | WP-11 | T-10 |
| X056 | Segment by daypart | P1 | WP-11 | T-10 |
| X057 | Identify lapsed customers | P1 | WP-11 | T-10 |
| X058 | Automatically move customers between segments as behaviour changes | P1 | WP-11 | T-10 |
| X059 | Pickup issues routed to store | P0 | WP-08 | T-08 |
| X060 | Delivery issues routed to centralized support | P0 | WP-08 | T-08 |
| X061 | Customer-driver messaging | P0 / Conditional | WP-07, WP-08 | T-07, T-08 |
| X062 | Customer-driver calling | P0 / Conditional | WP-07, WP-08 | T-07, T-08 |
| X063 | Real-time delivery tracking | P0 / Conditional | WP-07, WP-08 | T-07, T-08 |
| X064 | Accurate delivery ETA | P0 / Conditional | WP-07, WP-08 | T-07, T-08 |
| X065 | Driver/Dasher contact | P0 / Conditional | WP-07, WP-08 | T-07, T-08 |
| X066 | Delivery issue handling | P0 | WP-07, WP-08 | T-07, T-08 |
| X067 | Delivery refund handling | P0 | WP-07, WP-08 | T-07, T-08 |
| X068 | Built-in experimentation capability | P1 | WP-10, WP-11 | T-10 |
| X069 | Message vs message tests | P1 | WP-10, WP-11 | T-10 |
| X070 | Reward vs reward tests | P1 | WP-10, WP-11 | T-10 |
| X071 | Offer vs no-offer tests | P1 | WP-10, WP-11 | T-10 |
| X072 | Control groups | P1 | WP-10, WP-11 | T-10 |
| X073 | Test merchandising/banner placement | P1 | WP-10, WP-11 | T-10 |
| X074 | Test reward placement/visibility | P1 | WP-10, WP-11 | T-10 |
| X075 | Test checkout/conversion improvements | P1 | WP-10, WP-11 | T-10 |
| X076 | Measure conversion lift | P1 | WP-10, WP-11 | T-10 |
| X077 | Measure incremental revenue | P1 | WP-10, WP-11 | T-10 |
| X078 | Measure promotional effectiveness | P1 | WP-10, WP-11 | T-10 |
| X079 | Loyalty challenges/missions | P2 / US pilot | WP-06, WP-14 | T-06, T-15 |
| X080 | Punch cards | P2 / US pilot | WP-06, WP-14 | T-06, T-15 |
| X081 | Progress tracking | P0 core / P2 missions | WP-06, WP-14 | T-06, T-15 |
| X082 | Purchase-based journeys | P2 / US pilot | WP-06, WP-14 | T-06, T-15 |
| X083 | Item-completion challenges | P2 / US pilot | WP-06, WP-14 | T-06, T-15 |
| X084 | Interactive games/mini-games | P2 / US pilot | WP-06, WP-14 | T-06, T-15 |
| X085 | Bingo-style campaigns | P2 / US pilot | WP-06, WP-14 | T-06, T-15 |
| X086 | Dine-in-only rewards | P1 / Conditional | WP-06 | T-06 |
| X087 | Points/reward multipliers | P1 / Conditional | WP-06 | T-06 |
| X088 | Modifier-level rewards | P1 / Conditional | WP-06 | T-06 |
| X089 | Loyalty integrated directly into ordering | P0 | WP-06 | T-06 |
| X090 | Show loyalty information on homepage | P0 | WP-06 | T-06 |
| X091 | Show loyalty/rewards in cart | P0 | WP-06 | T-06 |
| X092 | Show loyalty/rewards at checkout | P0 | WP-06 | T-06 |
| X093 | Loyalty sign-up during checkout | P0 | WP-02, WP-05, WP-06 | T-02, T-05, T-06 |
| X094 | Scan-to-earn for in-store purchases | P0 | WP-06 | T-06 |
| X095 | Scan-to-redeem in store | P0 | WP-06 | T-06 |
| X096 | Create rewards | P0 | WP-06, WP-09 | T-06, T-09 |
| X097 | BOGO rewards | P1 / Conditional | WP-06 | T-06 |
| X098 | Bonus points | P1 / Conditional | WP-06 | T-06 |
| X099 | Product-specific rewards | P1 / Conditional | WP-06 | T-06 |
| X100 | Menu-item-level rewards | P1 / Conditional | WP-06 | T-06 |
| X101 | Loyalty configuration without engineering | P0 | WP-06, WP-09 | T-06, T-09 |
| X155 | Configurable loyalty tiers | P2 / US pilot | WP-06, WP-14 | T-06, T-15 |
| X156 | Real-time points balance and history | P0 | WP-06 | T-06 |
| X157 | Points expiration management | P0 | WP-06 | T-06 |
| X158 | Referral program | P1 | WP-06, WP-11 | T-06, T-10 |
| X159 | Birthday and anniversary rewards | P1 | WP-06, WP-11 | T-06, T-10 |
| X160 | Fraud detection | P0 | WP-06, WP-09, WP-15 | T-06, T-09, T-14 |
| X102 | Hero/promotional banners | P0 | WP-09, WP-11 | T-09, T-10 |
| X103 | Visual rather than text-only merchandising | P0 | WP-09, WP-11 | T-09, T-10 |
| X104 | Limited-time-offer promotion | P0 | WP-09, WP-11 | T-09, T-10 |
| X105 | Featured-product promotion | P0 | WP-09, WP-11 | T-09, T-10 |
| X106 | Loyalty-promotion banners | P0 | WP-09, WP-11 | T-09, T-10 |
| X107 | Push notifications | P1 / Conditional | WP-07, WP-11, WP-13 | T-07, T-10, T-12 |
| X108 | Email campaigns | P1 | WP-09, WP-11 | T-09, T-10 |
| X109 | Lifecycle campaigns | P1 | WP-09, WP-11 | T-09, T-10 |
| X110 | Win-back campaigns | P1 | WP-09, WP-11 | T-09, T-10 |
| X111 | Automated marketing campaigns | P1 | WP-09, WP-11 | T-09, T-10 |
| X163 | Push, SMS, email and in-app orchestration | P1 | WP-07, WP-11, WP-13 | T-07, T-10, T-12 |
| X164 | Frequency capping and suppression lists | P0 when messaging enabled | WP-07, WP-11, WP-13 | T-07, T-10, T-12 |
| X112 | Remember and suggest previously used store | P0 | WP-03 | T-03 |
| X113 | Personalized ordering experience based on customer behaviour | P1 | WP-11 | T-10 |
| X114 | Mobile app ordering | P1 / Conditional | WP-01, WP-13 | T-01, T-12 |
| X115 | Web ordering | P0 | WP-01, WP-05, WP-15 | T-01, T-05, T-13 |
| X116 | Consistent experience between web and app | P0 shared / Conditional native | WP-01, WP-13 | T-01, T-12 |
| X117 | Reduce clicks/steps required to place an order | P0 | WP-01, WP-05, WP-15 | T-01, T-05, T-13 |
| X118 | Automatically select closest store | P0 | WP-03 | T-03 |
| X119 | “Order Again” using previous purchases | P0 | WP-04, WP-05, WP-07 | T-04, T-05, T-07 |
| X120 | Deep links directly to products/menu categories/offers | P0 | WP-01, WP-03, WP-04 | T-01, T-03, T-04 |
| X165 | Guest checkout | P0 | WP-02, WP-05 | T-02, T-05 |
| X166 | Multi-factor authentication | P0 | WP-02, WP-09 | T-02, T-09, T-14 |
| X167 | Save this build | P0 save / P1 share | WP-04 | T-04 |
| X168 | Nutrition and allergen filtering | P0 | WP-04 | T-04 |
| X169 | Gift card balance and split tender | P0 | WP-05, WP-06 | T-05, T-06 |
| X170 | Real-time order status | P0 | WP-07 | T-07 |
| X121 | Personalized homepage | P1 | WP-11 | T-10 |
| X122 | Different content for different customer segments | P1 | WP-11 | T-10 |
| X123 | Personalized promotions | P1 | WP-11 | T-10 |
| X124 | Personalized rewards | P1 | WP-11 | T-10 |
| X125 | New-customer onboarding content | P0 | WP-01 | T-01, T-13 |
| X126 | Win-back content for lapsed customers | P1 | WP-11 | T-10 |
| X127 | Real-time personalization based on behaviour | P2 / US pilot | WP-05, WP-11, WP-14 | T-05, T-10, T-15 |
| X128 | Store-specific popular-item recommendations | P1 | WP-11 | T-10 |
| X129 | “Most liked” items | P2 / US pilot | WP-08, WP-11, WP-14 | T-08, T-10, T-15 |
| X130 | Customer ratings | P2 / US pilot | WP-08, WP-11, WP-14 | T-08, T-10, T-15 |
| X131 | Social-proof indicators | P2 / US pilot | WP-08, WP-11, WP-14 | T-08, T-10, T-15 |
| X132 | AI-driven cart recommendations | P2 / US pilot | WP-05, WP-11, WP-14 | T-05, T-10, T-15 |
| X133 | Pizza-specific ordering flow | P0 | WP-04 | T-04 |
| X134 | Visual pizza size selection | P0 | WP-04 | T-04 |
| X135 | Pizza topping visualization | P1 / US pilot | WP-04 | T-04 |
| X136 | Modifier handling | P0 | WP-04 | T-04 |
| X137 | Half-and-half pizza configuration | P1 / Conditional | WP-04 | T-04 |
| X138 | Combo configuration | P0 / Conditional | WP-04 | T-04 |
| X139 | Improved topping-selection workflow | P0 | WP-04 | T-04 |
| X140 | Search-engine-friendly store pages | P0 | WP-01, WP-03 | T-03, T-13 |
| X141 | Search-engine-indexable menus | P0 | WP-01, WP-03 | T-03, T-13 |
| X142 | Google Maps discoverability | P0 | WP-01, WP-03 | T-03, T-13 |
| X143 | Apple Maps discoverability | P0 | WP-01, WP-03 | T-03, T-13 |
| X144 | AI/LLM search discoverability | P1 | WP-03, WP-10 | T-03, T-10, T-13 |
| X145 | Improve site speed/Core Web Vitals | P0 | WP-01, WP-15 | T-01, T-13 |
| X146 | Reduce search-to-order clicks | P0 | WP-01, WP-03 | T-03, T-13 |
| X147 | Cart-level upselling | P1 | WP-05, WP-11 | T-05, T-10 |
| X148 | AI product recommendations | P2 / US pilot | WP-05, WP-11, WP-14 | T-05, T-10, T-15 |
| X149 | Recommendations using previous purchases | P1 | WP-05, WP-11 | T-05, T-10 |
| X150 | Recommendations using customer/order behaviour | P1 | WP-05, WP-11 | T-05, T-10 |
| X151 | Encourage web customers to download app | P1 / Conditional | WP-13 | T-12 |
| X152 | QR-code app download | P1 / Conditional | WP-13 | T-12 |
| X153 | Detect installed app and offer “Open in App” | P1 / Conditional | WP-13 | T-12 |
| X154 | Smooth transition between website and app | P1 / Conditional | WP-13 | T-12 |

## Appendix C. Plan verification and change control

- Coverage checked when this document was created: **120 consolidated capability IDs** and **169 original workbook feature IDs**, each appearing once in its respective coverage matrix.
- This checks inventory completeness, not implementation or business-rule completeness. Vendor contracts and acceptance criteria are refined during M0 and each package.
- All 18 failure scenarios in scope section 6 are assigned to transaction behavior, responsive recovery, provider contracts, or the acceptance suites in this plan.
- Keep the scope README as the feature/policy baseline; keep this README as the delivery/verification baseline. Revise both when a feature changes priority or meaning.
- Before execution, give each selected capability a backlog owner, explicit dependencies, acceptance examples, estimate, and status. No item is marked complete merely because its UI exists.

| Version | Date | Change |
| --- | --- | --- |
| 1.0 | October 5, 2026 | Detailed responsive implementation plan, work packages, milestones, integration/recovery design, device matrix, rollout, and complete scope traceability |
