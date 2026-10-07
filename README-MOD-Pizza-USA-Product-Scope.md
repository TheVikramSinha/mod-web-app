# MOD Pizza USA — Web App Product Scope

> **App experience update — 6 October 2026:** The current prototype now has separate customer, store-manager and HQ workspaces, expanded loyalty/deals, saved preferences and scheduling. See the [current feature guide](README-MOD-Pizza-App-Experience.md) and [README](README.md) for the implemented experience. Earlier sections below remain useful as baseline/history.


> **Implementation review — 6 October 2026:** This document remains the requirements/design baseline, not a statement that every feature is built. The [Enterprise readiness and UX audit](README-MOD-Pizza-Enterprise-Readiness-Audit.md) maps all 120 capabilities to current evidence and gaps. The prototype is for journey validation, not live enterprise operation. See [README](README.md) for current code, changes and verification.


Version: 1.0 · October 5, 2026 · Status: proposed scope for review; development has not started.

## 1. Purpose and scope boundaries

Create a seamless MOD Pizza ordering experience for the United States, with an excellent mobile website and a consistent desktop experience. Customers should be able to discover food, customize a pizza or salad, understand the price, order, earn or use rewards, track fulfillment, and resolve problems easily.

This document combines all 169 feature entries from `MOD-Web-App.xlsx`, Sheet1 rows 2–170, with the additional requirements identified during comparative research. Appendix A preserves every original feature and description, grouped into its original category, with a proposed priority and treatment. Overlapping workbook entries are retained for traceability, not counted as separate systems to build.

The scope is USA-first. International examples are inspiration, not evidence that a feature suits US MOD customers. US fit classifications below are product judgments to validate with customers and store operators, not measured market demand. Being unfamiliar in the USA is not a reason to reject a useful innovation; it is a reason to pilot it before broad rollout.

This is a capability scope, not a final implementation estimate, vendor selection, approved loyalty policy, or authorization to develop the app. Existing MOD systems, program obligations, and restaurant workflows remain discovery inputs.

### Priority and suitability labels

| Label | Meaning |
| --- | --- |
| P0 | Required capability for a dependable launch; an existing integrated service may provide it |
| P1 | Expansion after the core experience is dependable |
| P2 | Experiment or later enhancement requiring evidence of value |
| Conditional | Include only after the identified business, vendor, store, or channel dependency is confirmed |
| Core US fit | Directly supports the proposed US customer journey |
| US pilot | Plausible innovation; test adoption, usability, operations, and economics |
| Limited fit | Retain as an option, but do not include in the initial MOD web app |

Priority is sequencing, not a judgment that later features lack value. If an existing customer entitlement or supported workflow is already live, preserve continuity even when its proposed new-development priority is P1 or P2.

## 2. Product principles

1. Ordering, an active order, and repeat purchasing take precedence over promotions.
2. Use two taps as a navigation target, not a promise that every custom order takes two taps.
3. Guest customers can browse and purchase without joining loyalty or downloading an app.
4. Make store, fulfillment method, timing, and price visible before commitment.
5. Preserve selections through navigation, authentication, and recoverable errors.
6. Keep rewards visible at the moment they can help the customer.
7. Distinguish points, promotional rewards, service credits, gift-card funds, and payment methods.
8. Show actual operational status and label estimates or delayed updates honestly.
9. Use personalization to remove effort; keep optional upsells unobtrusive.
10. Deliver a complete mobile-web experience. Native app work is a separate decision.

MOD's published menu emphasizes individually sized pizzas and salads and unlimited toppings at one price. The builder should reflect that model, with explicit store-configured premium exceptions, rather than assume all toppings cost extra. [MOD menu](https://modpizza.com/menu/)

## 3. Customer experience and navigation

Proposed primary navigation: **Order · Rewards · Orders · Account**. Keep the cart available with item count and total. Keep the selected store and pickup/delivery context visible.

| Journey | Proposed route | Important condition |
| --- | --- | --- |
| Start a new order | Choose fulfillment → menu/customize → review and pay | These are stages, not a fixed count of taps |
| Repeat an order | Reorder → review and confirm | Valid identity, payment, address/store, items, and hours; payment authentication may add actions |
| Use a reward | Rewards → choose/apply, or apply directly in cart | Do not require a detour through a separate loyalty site |
| Track an order | Active-order card → status | Guests can use secure order access |
| Get help | Active order → Help | Carry order context into support |
| Check balances | Rewards → Wallet | Keep balance types separate |
| Change fulfillment | Fulfillment control → selection | Explain affected items, price, availability, and timing |
| Manage saved information | Account → addresses/payments/preferences | Avoid re-entering information already known |

Use a signature-item route and a Create Your Own route. The customizer should use manageable sections with a persistent summary and Add to Cart action. Topping choices, input fields, authentication, and confirmations are meaningful interactions and are not hidden from usability measurement simply to claim two clicks.

Use a contextual home view: ordering first for a new visitor, a usual order for a returning customer, and status first when an order is active. Display a small number of useful offers, not a screen dominated by carousels. Avoid forced onboarding, forced app installation, automatic points spending, and repeated checkout upsell interruptions.

## 4. Categorized functional scope

The IDs below define consolidated capabilities and additions. Appendix A contains the complete original inventory; both sections are part of the full scope.

### A. Identity, accounts, and preferences

| ID | Feature and expected behavior | Priority / fit |
| --- | --- | --- |
| AC-01 | One identity across ordering and loyalty; preserve recognition through the journey | P0 / Core US fit |
| AC-02 | Guest checkout with optional account creation and eligible order linking after purchase | P0 / Core US fit |
| AC-03 | Passwordless sign-in with recovery and alternate contact verification; preserve cart during login | P0 / Core US fit |
| AC-04 | Saved addresses, favorite store, saved payment tokens, profile and communication preferences | P0 / Core US fit |
| AC-05 | Secure sessions, staff MFA, and risk-based customer verification for sensitive actions | P0 / Core US fit |
| AC-06 | Safe account recovery and duplicate-account merging with verified ownership and balance history | P0 / Core US fit |
| AC-07 | Unified identity across available channels; use third-party identity only where data and permissions support it | P0 / Conditional |
| AC-08 | Customer data access/deletion request workflows and separate marketing choices | P0 / Core US fit |

### B. Store discovery and fulfillment selection

| ID | Feature and expected behavior | Priority / fit |
| --- | --- | --- |
| ST-01 | Store locator with manual address/ZIP entry, optional location access, and remembered store | P0 / Core US fit |
| ST-02 | Suggest a suitable store using service area, opening hours, menu availability, and capacity; allow correction | P0 / Core US fit |
| ST-03 | Pickup/delivery selection with address validation, apartment/unit, drop-off instructions, and saved locations | P0 / Core US fit |
| ST-04 | Store-specific hours, holiday closures, temporary pauses, delivery zones, fees, and minimums | P0 / Core US fit |
| ST-05 | ASAP and scheduled ordering with capacity-controlled slots and realistic lead times | P0 / Core US fit |
| ST-06 | Change-store preview identifying price, item, reward, and time changes before acceptance | P0 / Core US fit |
| ST-07 | Search-friendly store pages and accurate Google/Apple Maps ordering destinations | P0 / Core US fit |
| ST-08 | Store capability flags for curbside, dine-in, catering, special menus, and other supported services | P0 foundation; services conditional |

### C. Menu, pizza/salad builder, and food information

| ID | Feature and expected behavior | Priority / fit |
| --- | --- | --- |
| MN-01 | Store-specific menu, price, item/ingredient availability, imagery, categories, and limited-time items | P0 / Core US fit |
| MN-02 | Signature or custom pizza/salad; supported sizes, bases/crusts, sauces, cheese, toppings, and finishes/dressings | P0 / Core US fit |
| MN-03 | Clear included-versus-paid modifiers, required choices, incompatible combinations, and running price | P0 / Core US fit |
| MN-04 | Fast topping selection, readable summary, remove/reset/edit actions, and visual size guidance | P0 / Core US fit |
| MN-05 | Ingredient details, dietary filters, authoritative nutrition calculations, and cross-contact information | P0 / Core US fit |
| MN-06 | Sold-out ingredient handling and customer-approved replacements; never silently substitute | P0 / Core US fit |
| MN-07 | Save/name a build, favorite an item, and validate it against the current menu on reuse | P0 / Core US fit |
| MN-08 | Supported combo configuration with required selections and pricing rules | P0 / Conditional on live menu |
| MN-09 | Rich topping visualization with an accessible text equivalent | P1 / US pilot |
| MN-10 | Share a saved build through a link; recipient sees current store availability and price | P1 / Core US fit |
| MN-11 | Half-and-half configuration | P1 / Conditional on MOD kitchen and POS support |

### D. Cart, checkout, and payment

| ID | Feature and expected behavior | Priority / fit |
| --- | --- | --- |
| CK-01 | Persistent cart with quantity, edit, duplicate, remove, and full customization summaries | P0 / Core US fit |
| CK-02 | Explicit cart revalidation for stale prices, unavailable items, expired offers, and store changes | P0 / Core US fit |
| CK-03 | Guest/member checkout, minimal fields, autofill support, and optional loyalty enrollment | P0 / Core US fit |
| CK-04 | Cards, Apple Pay, and Google Pay where supported; saved payment tokens | P0 / Core US fit |
| CK-05 | Gift-card balance check and supported split tender; preserve unused value | P0 / Core US fit |
| CK-06 | Itemized subtotal, discount, credits, taxes, fees, tip, and final payable amount before confirmation | P0 / Core US fit |
| CK-07 | Available rewards and validated promo codes in cart/checkout; clear incompatibility explanations | P0 / Core US fit |
| CK-08 | Payment decline/timeout recovery, duplicate-submission prevention, and uncertain-result reconciliation | P0 / Core US fit |
| CK-09 | Confirmation only after reliable order acceptance; distinguish pending payment/order states | P0 / Core US fit |
| CK-10 | Order receipt and secure guest order lookup | P0 / Core US fit |
| CK-11 | PayPal and Venmo | P1 / Conditional on processor, demand, and operating economics |
| CK-12 | Best eligible offer recommendation with savings preview; ask before consuming points or stored value | P1 / US pilot |
| CK-13 | Small optional add-on area based on the order; no extra mandatory checkout stage | P1 / Core US fit |

### E. Rewards, wallet, points, and credits

| ID | Feature and expected behavior | Priority / fit |
| --- | --- | --- |
| RW-01 | One Rewards & Wallet destination; contextual reward visibility on home, cart, and checkout | P0 / Core US fit |
| RW-02 | Points balance, pending earnings, history, progress, expiration, and available item rewards | P0 / Core US fit |
| RW-03 | Earn/redeem online and at supported stores through scan or supported identity lookup | P0 / Core US fit |
| RW-04 | Missing-points receipt claim, manual entry fallback, claim status, duplicate-claim protection | P0 / Core US fit |
| RW-05 | Separate gift-card funds, service credits, promotional rewards, points, and saved payment methods | P0 / Core US fit |
| RW-06 | Partial credit use, balance history, applicable restrictions, and clear remaining value | P0 / Core US fit |
| RW-07 | Reserve/apply/release rewards safely; restore appropriate value after failed orders or refunds | P0 / Core US fit |
| RW-08 | Configurable reward catalog, eligibility, store participation, stacking, earning, expiry, and rounding | P0 / Core US fit |
| RW-09 | Restricted staff adjustments with reason, audit history, and redemption-abuse monitoring | P0 / Core US fit |
| RW-10 | BOGO, product/item rewards, bonus points, and multipliers | P1; P0 where needed to preserve live programs |
| RW-11 | Birthday/anniversary benefits and qualified-purchase referral rewards | P1 / Core US fit |
| RW-12 | Digital gift-card purchase, message, scheduled sending, claiming, and support | P1 / Core US fit |
| RW-13 | Modifier-specific and dine-in-only benefits | P1 / Conditional on menu, POS, and strategy |
| RW-14 | Tiers, missions, punch cards, purchase journeys, and item-completion challenges | P2 / US pilot |
| RW-15 | Points-plus-cash or earned dollar rewards | P2 / US pilot; program redesign, not a silent change to MOD points |
| RW-16 | Card-linked automatic earning with receipt fallback | P2 / US pilot; explicit enrollment and provider support |
| RW-17 | Customer-funded wallet top-ups and optional auto-reload | P2 / US pilot; separate stored-value operating model |
| RW-18 | Mini-games and bingo campaigns | P2 / US pilot; keep outside the primary ordering flow |

### F. Order lifecycle, pickup, and delivery

| ID | Feature and expected behavior | Priority / fit |
| --- | --- | --- |
| OR-01 | Current/history order views, favorites, and Order Again with current-price validation | P0 / Core US fit |
| OR-02 | Accepted, preparing, ready/dispatched, completed, delayed, rejected, and canceled status handling | P0 / Core US fit |
| OR-03 | ETA and proactive delay updates using operational data; distinguish estimates from confirmed events | P0 / Core US fit |
| OR-04 | Transactional email/SMS and in-site status; push only where supported and opted into | P0 / Core US fit |
| OR-05 | Pickup instructions, location/directions, order identifier, and collection handoff | P0 / Core US fit |
| OR-06 | Delivery tracking, contact-free instructions, and proof of delivery where available | P0 / Conditional on delivery provider |
| OR-07 | Masked driver messaging/calling where supported; store/support fallback | P0 / Conditional on provider |
| OR-08 | Order modification/cancellation policy by preparation stage and support routing when self-service is unavailable | P0 / Core US fit |
| OR-09 | Curbside arrival and vehicle details | P1 / Conditional on staffed store workflow |
| OR-10 | QR/table ordering or dine-in check-in | P1 / US pilot at suitable locations |
| OR-11 | Arrival-based preparation using optional location sharing | P2 / US pilot; requires kitchen integration and robust fallback |
| OR-12 | Pickup lockers/portals | P2 / Limited initial fit; separate hardware and store investment |
| OR-13 | Native lock-screen/live activity updates | P2 / Conditional on native app strategy |

### G. Customer support and service recovery

| ID | Feature and expected behavior | Priority / fit |
| --- | --- | --- |
| CS-01 | Order-linked help with pickup/store and delivery/central routing | P0 / Core US fit |
| CS-02 | Missing, incorrect, late, damaged, undelivered, and duplicate-order issue categories | P0 / Core US fit |
| CS-03 | Refund request, eligibility, full/partial refund, status, and customer communication | P0 / Core US fit |
| CS-04 | Reconcile payment, gift-card funds, redeemed rewards, credits, and earned points after adjustments | P0 / Core US fit |
| CS-05 | Appropriate service credit with reason and restrictions; do not silently replace a refund with a promotion | P0 / Core US fit |
| CS-06 | Support console showing order, payment, loyalty, and delivery context with controlled access | P0 / Core US fit |
| CS-07 | Escalation ownership and response targets; continuity if provider contact fails | P0 / Core US fit |
| CS-08 | Post-order feedback and recovery follow-up; public item ratings only with moderation and evidence | P1 feedback; P2 public ratings |

### H. Group ordering, catering, and community

| ID | Feature and expected behavior | Priority / fit |
| --- | --- | --- |
| GP-01 | Shared group-order link, named items, deadline, organizer review, and one payer initially | P1 / Core US fit |
| GP-02 | Catering packages, headcount guidance, lead time, capacity check, business receipts, and support | P1 / Conditional on operations |
| GP-03 | Fundraiser attribution, local campaign pages/codes, and reporting | P1 / Core US fit |
| GP-04 | Optional reward donation/Pay It Forward with approved beneficiaries and visible accounting | P1 / Conditional on approved program |
| GP-05 | Multiple-payer group ordering | P2 / US pilot; define incomplete payments, refunds, and cutoff behavior |
| GP-06 | Paid membership/subscription benefits | P2 / US pilot; validate frequency, margin, billing, and cancellation model |
| GP-07 | Table booking, retail-product earning, and airline/coalition rewards | Limited fit; retain only if MOD's business model expands |

### I. Marketing, segmentation, personalization, and experimentation

| ID | Feature and expected behavior | Priority / fit |
| --- | --- | --- |
| MK-01 | Manage imagery, banners, featured items, limited-time offers, and loyalty placements | P0 / Core US fit |
| MK-02 | Persistent favorites and order history as the first personalization layer | P0 / Core US fit |
| MK-03 | Detect/report abandonment by stage and channel | P0 / Core US fit |
| MK-04 | Prebuilt/custom segments by frequency, spend, products, daypart, activity, and lifecycle | P1 / Core US fit |
| MK-05 | Dynamic segment membership, personalized home content, rewards, offers, and win-back content | P1 / Core US fit |
| MK-06 | Email, SMS, supported push, and in-app orchestration with preferences, suppression, and frequency caps | P1; controls P0 whenever messaging is enabled |
| MK-07 | Cart recovery; compare reminders against incentives; suppress after purchase or unresolved service issues | P1 / Core US fit |
| MK-08 | Store-specific popular products and order-aware add-ons; no fabricated social proof | P1 / Core US fit |
| MK-09 | Controlled tests of messages, rewards, offers, placements, checkout, and no-offer holdouts | P1 / Core US fit |
| MK-10 | Conversion, incremental revenue, promotional effectiveness, and contribution-margin measurement | P1 / Core US fit |
| MK-11 | AI recommendations, segment generation, natural-language segments, and real-time behavioral adaptation | P2 / US pilot |
| MK-12 | AI ordering assistant and voice/car ordering | P2 / US pilot; structured ordering remains available |

### J. Operations, administration, integration, and analytics

| ID | Feature and expected behavior | Priority / fit |
| --- | --- | --- |
| OP-01 | Store order pause/resume, ingredient availability, prep-time and slot-capacity controls | P0 / Core US fit |
| OP-02 | Order acceptance acknowledgement, failed-order queue, escalation, and reconciliation | P0 / Core US fit |
| OP-03 | Store/franchise participation and allocation rules for discounts, credits, and refunds | P0 / Core US fit |
| OP-04 | Role-based access, staff MFA, audit logs, controlled refunds/credits, and change approval by policy | P0 / Core US fit |
| OP-05 | Content templates, preview, scheduling, publishing, rollback, and store-specific overrides | P0 / Core US fit |
| OP-06 | Assign authoritative owners for menu, price, availability, identity, points, payment, and order status | P0 / Core US fit |
| OP-07 | Ordering/Olo, POS, payment, loyalty, delivery, and messaging integrations as required by the confirmed stack | P0 / Conditional on existing systems |
| OP-08 | Customer/order data export, event APIs, retry handling, duplicate-event protection, and access controls | P0 / Core US fit |
| OP-09 | CRM, CDP, Snowflake, and Tableau/BI connectors | P1 / Conditional; promote only confirmed launch dependencies |
| OP-10 | Sales, item/store/operational performance, retention, loyalty enrollment/activation/attach/revenue, cart conversion | P0 / Core US fit |
| OP-11 | Customer behavior, campaign performance, customer lifetime value, first-/third-party data provenance | P1; provenance foundation P0 |
| OP-12 | Payment success, failed store submissions, ETA accuracy, support contacts, refunds, and margin | P0 / Core US fit |
| OP-13 | AI summaries, business Q&A, and suggested actions grounded in governed metrics | P2 / US pilot; human review before consequential actions |
| OP-14 | Migration of identities, balances, consents, favorites, and available order history; reconciliation and rollback | P0 / Conditional on replacing an existing experience |

### K. Platform quality, discoverability, and channel continuity

| ID | Feature and expected behavior | Priority / fit |
| --- | --- | --- |
| QA-01 | Responsive mobile/desktop UI, accessible controls, keyboard/screen-reader support, readable errors | P0 / Core US fit |
| QA-02 | Performance budgets, low-bandwidth behavior, cart recovery, monitoring, and dependency outage handling | P0 / Core US fit |
| QA-03 | Secure payment tokenization, least-privilege access, abuse controls, protected customer data, and recovery procedures | P0 / Core US fit |
| QA-04 | Indexable store/menu pages, accurate metadata, stable URLs, and product/category/offer deep links | P0 / Core US fit |
| QA-05 | Structured, accurate public content for search and AI discovery; no ranking guarantee | P1 / Core US fit |
| QA-06 | Native app ordering/design and consistent shared capabilities | P1 / Conditional on native app scope; preserve existing app continuity |
| QA-07 | Optional app-install prompts/QR codes, supported Open in App links, and validated cart/session handoff | P1 / Conditional; do not promise universal installed-app detection |
| QA-08 | Remote content/configuration updates within supported platform boundaries | P1 / Conditional; code/capability changes may still require releases |

## 5. Wallet and loyalty operating rules

| Customer-visible component | Meaning | Required distinction |
| --- | --- | --- |
| Points | Progress earned through eligible activity | Not cash or purchased funds |
| Available rewards | Item/discount benefits unlocked or redeemable | Show applicability and expiration |
| Service credit | Dollar-denominated value issued to resolve an issue | Show reason, remaining amount, and approved terms |
| Gift cards | Purchased/gifted value | Maintain separate records and partial-use history |
| Offers | Conditional promotions | Show minimums, exclusions, and stacking rules |
| Saved payments | Ways to pay the remaining amount | Apple Pay/Google Pay/cards are not MOD-held balances |

Before implementation, define earning basis and rounding; participating channels/stores; excluded items; pending/available timing; redemption reservation; expiry rules; stacking; balance consumption order; taxes/fees/tips eligibility; refund restoration/reversal; transfer/merge rules; manual adjustment controls; and franchise settlement responsibilities. Confirm stored-value and promotional policies with the responsible business, finance, and legal owners before publishing terms.

Suggest eligible savings, but let customers choose whether to spend accumulated points, credits, or gift-card value. Do not add a top-up requirement to normal checkout. Do not award points twice for purchasing a gift card and spending its value unless that is an explicit approved promotion.

Existing MOD public sources disagree: the rewards landing page lists a regular pizza at 175 points, while its FAQ describes 150-point rewards and differing conversion behavior. These are unresolved source discrepancies, not approved requirements. The authoritative loyalty system and program owner must determine the actual rules. [MOD Rewards](https://modpizza.com/rewards/) · [MOD FAQ](https://modpizza.com/rewards-faq/)

## 6. Required failure and edge-case behavior

| Scenario | Expected outcome |
| --- | --- |
| Customer denies location | Manual location entry remains available |
| Selected store closes or pauses | Explain the change, offer valid alternatives, preserve recoverable cart choices |
| Store or fulfillment changes | Revalidate items, prices, rewards, fees, and time before confirmation |
| Item/ingredient sells out | Request a choice; do not silently substitute |
| Scheduled slot fills | Offer valid slots and preserve the cart |
| Login or session expires | Recover sign-in without losing the order; allow guest checkout where appropriate |
| Payment declines | Explain next action without clearing the cart |
| Payment result is unknown | Check the existing transaction before retrying; prevent duplicate charges |
| Payment succeeds but store acceptance fails | Show pending/failure accurately; resolve payment and release reserved value |
| Customer taps repeatedly or events arrive twice | One intended purchase produces one accepted order and consistent balances |
| Offer expires during checkout | Explain changed savings and require review of the new total |
| Reward reserved but order abandoned/fails | Release the reservation according to policy; no unexplained loss |
| Partial refund | Reconcile each tender and associated earnings/redemptions accurately |
| Tracking provider is unavailable | Show last reliable status, update age, and a help route |
| SMS/email/push fails | Status and receipt remain available through secure order access |
| Preparation has started | Follow defined change/cancellation policy with an immediate support route |
| Duplicate account or receipt claim | Verify ownership, prevent duplicate benefits, and retain an audit trail |
| Loyalty service is unavailable | Explain unavailable benefits; define an approved claim/recovery route without promising impossible redemption |

Direct MOD orders fulfilled by a delivery partner and orders placed on an external marketplace are different channels. Define loyalty eligibility, data availability, payment responsibility, and support ownership separately.

## 7. US suitability and innovation decisions

| Feature family | Decision for USA scope | Validation needed |
| --- | --- | --- |
| Guest checkout, fast payment, saved orders, clear pickup/delivery | Core US fit; launch | Customer usability and end-to-end integration |
| Points, gift cards, service credits, transparent rewards | Core US fit; launch | Existing program rules and reconciliation |
| PayPal/Venmo | Retain as US payment options, not foreign-market ideas | Processor support, usage, checkout impact |
| Group orders, catering, gifting, referrals, community fundraisers | US expansion candidates | Demand, kitchen workflow, unit economics |
| Best-offer recommendation and easier reward application | High-value US pilots | Actual savings, margin, stacking complexity |
| Card-linked earning | US pilot; there are US pizza precedents | Enrollment consent, provider coverage, receipt fallback |
| Tiers, missions, punch cards, dollar rewards, points-plus-cash | US pilots, not all enabled together | Comprehension, incremental retention, program cost |
| Top-ups, auto-reload, subscription | Defer pending evidence | Customer frequency, benefit clarity, operating model |
| QR/table ordering, curbside, half-and-half | Store/model-dependent | MOD service design, staffing, POS/kitchen support |
| Arrival-based cooking and pickup lockers | Later operational pilots | Reliability, hardware/staffing investment, pickup improvement |
| Full-service reservations, retail earning, coalition rewards | Limited fit for initial app | A change in MOD's business/channel strategy |
| Mini-games, voice/car ordering, AI assistant | Optional later experiments | Adoption and task success without harming core ordering |

International cash-on-delivery flows, local currencies, local wallet brands, and country-specific service guarantees are not assumed US launch requirements. Their underlying lessons—payment choice, transparent value, and effective recovery—remain relevant. No global reward rate, expiry rule, guarantee, or refund restriction should be copied into US policy automatically.

## 8. Release gates and acceptance criteria

| Release | Scope and exit condition |
| --- | --- |
| Launch | P0 customer journeys and enabling operations; pilot stores can reliably receive, fulfill, reconcile, and support orders |
| Expansion | Selected P1 capabilities after core conversion, order accuracy, support, and store performance are understood |
| Experiments | Individually approved P2 pilots with hypotheses, success metrics, margin/operational guardrails, and rollback |

Proposed measurable acceptance targets:

- Primary functions reachable within two navigation taps; measure actual end-to-end interaction counts separately.
- Eligible saved reorder completed in two primary actions, excluding payment authentication; current total/store/address/time reviewed.
- At least 90% unassisted completion of agreed core tasks in representative usability testing; this is a proposed target, not an observed result.
- Complete payable total shown before purchase; no silent substitution or acceptance of price changes.
- Retry, duplicate-event, refund, and failed-order scenarios preserve consistent orders, payments, and balances.
- Accessibility target: WCAG 2.2 AA, with manual keyboard and screen-reader checks. [W3C](https://www.w3.org/TR/WCAG22/)
- Mobile performance targets at the 75th percentile: LCP ≤2.5 seconds, INP ≤200 ms, CLS ≤0.1. [Web Vitals](https://web.dev/articles/vitals)
- Test mobile Safari, mobile Chrome, agreed desktop browsers, small screens, zoom, slow connections, expired sessions, and payment return flows.
- Establish operational targets for availability, integration freshness, reconciliation time, and support response during discovery; do not promise instantaneous external-system updates.
- Baseline conversion, repeat purchase, payment success, order acceptance, ETA accuracy, refunds, support contacts, reward use, and contribution margin before setting improvement commitments.

## 9. Dependencies and decisions before estimation

1. Confirm whether this replaces the existing MOD website/app or is a separate concept; USA is confirmed, replacement scope is not.
2. Select pilot stores, participating franchises, fulfillment modes, and rollout ownership.
3. Confirm authoritative systems and available API contracts for ordering, POS, menus, loyalty, gift cards, payments, and delivery.
4. Confirm existing MOD earning/redemption policies, balances, promotional obligations, and migration requirements.
5. Decide which service-credit and gift-card tender combinations are supported.
6. Confirm kitchen support for customization, half-and-half, substitutions, large orders, and scheduled capacity.
7. Confirm delivery contact/tracking capabilities and support/refund responsibility by channel.
8. Confirm native app scope; mobile web must not depend on it.
9. Define content-authoring boundaries: routine content/configuration changes versus engineering changes.
10. Select P1/P2 pilots using customer research, store impact, implementation dependencies, and economics.

Avoid rebuilding CRM, POS, payment processing, loyalty accounting, or delivery dispatch merely to satisfy a feature label. Integrate proven authoritative systems where appropriate. Snowflake, Tableau, Olo, CRM, and CDP are candidates from the workbook, not a verified description of MOD's installed stack.

## 10. Comparative evidence register

Research snapshot from the preceding analysis, October 5, 2026. Based on official public pages; not exhaustive across every chain or a transactional audit of every app. Current participation and capability availability must be revalidated before implementation. Product recommendations in this document are our proposed synthesis, not competitor facts.

| Brand / market | Observed pattern | Source |
| --- | --- | --- |
| MOD / USA | Saved creations, rewards, reordering; public reward rules conflict | [Rewards](https://modpizza.com/rewards/) · [FAQ](https://modpizza.com/rewards-faq/) |
| Domino's / USA | Saved order with fulfillment and payment details; order tracking | [Easy Order](https://anyware.dominos.com/) · [Tracker](https://www.dominos.com/en/about-pizza/gps-tracker/) |
| Papa Johns / USA | Dollar-denominated Papa Dough rewards | [Papa Rewards](https://www.papajohns.com/papa-rewards/) |
| Pizza Hut / USA | Passwordless login, rewards, challenges, milestone benefits | [FAQ](https://www.pizzahut.com/faq-help) |
| Little Caesars / USA | Participating-store Pizza Portal pickup and app challenges | [Pickup](https://order.littlecaesars.com/en-us/order/pickup/stores/search/Hurst%20tx/) · [Challenges](https://information.littlecaesars.com/en-us/little-caesars-challenges-terms-and-conditions) |
| Blaze / USA | Registered-card earning and receipt fallback | [Earning Flames](https://blazepizzaloyalty.zendesk.com/hc/en-us/articles/31242483169303-How-do-I-earn-flames) |
| &pizza / USA | Card-linked loyalty across channels and exclusive rewards | [Loyalty](https://andpizza.com/loyalty/) |
| Papa Murphy's / USA | Per-pizza earning, favorites, birthday benefits | [MySLICE](https://www.papamurphys.com/newmyslice-rewards/) |
| Pizza Ranch / USA | Dollar rewards usable online and in restaurants | [Ranch Rewards](https://pizzaranch.com/ranch-rewards) |
| Pizza Pizza / Canada | Separate gift funds and loyalty dollars, reloads, scan-to-pay | [Club 11/11](https://www.pizzapizza.ca/for-you/club-eleven-eleven-learn-more/) |
| PizzaExpress / UK | Stamps/tiers, restaurant check-in and bill payment, cross-channel earning | [Club](https://www.pizzaexpress.com/club) |
| Telepizza / Spain | Free products and points-plus-money offers | [MiTelepi](https://www.telepizza.es/mitelepi) |
| Domino's / India | Service-guarantee wallet credits; wallet does not accept customer deposits | [Terms](https://tnc.dominos.co.in/) |
| Domino's / Australia | Published arrival-aware preparation concept; store availability unverified | [On-Time Cooking](https://www.dominos.com.au/about-us/technology/ontimecooking) |
| Pizza Hut / Singapore | Points exchanged for vouchers held in a Rewards Wallet | [Rewards](https://www.pizzahut.com.sg/hut-rewards) |
| Papa Johns / UAE | Tiered earning; page contains inconsistent numerical descriptions | [Rewards](https://papajohns.ae/papa-rewards) |
| Debonairs / South Africa | Direct ordering, delivery eligibility, vouchers plus remaining payment | [Ordering](https://debonairspizza.co.za/ways-to-order-pizza/) · [Terms](https://debonairspizza.co.za/terms-and-conditions/) |

## Appendix A. Complete workbook feature inventory

Every original feature and description follows, grouped by source category. `Xnnn` refers to the original Sheet1 row number, so gaps in numbering within a category are intentional. Priorities and treatment notes are proposed additions. The consolidated requirements above govern overlap, US applicability, operational dependencies, and acceptance behavior.

### A1. Accounts

| Source ID | Original feature | Original description | Proposed priority | Scope treatment |
| --- | --- | --- | --- | --- |
| X002 | Single sign-on between ordering and loyalty | Lets customers use one login for both ordering and loyalty instead of signing in twice. | P0 | AC-01–06: unify identity, recovery, and session behavior. |
| X003 | Passwordless/SMS login | Lets customers sign in with a text message code instead of remembering a password. | P0 | AC-01–06: unify identity, recovery, and session behavior. |
| X004 | Recognize logged-in customers across ordering journey | Keeps a customer recognized as they move through the ordering process after signing in. | P0 | AC-01–06: unify identity, recovery, and session behavior. |

### A2. Analytics

| Source ID | Original feature | Original description | Proposed priority | Scope treatment |
| --- | --- | --- | --- | --- |
| X005 | First-party vs third-party reporting | Shows which reports are based on data MOD owns directly versus data provided by outside partners. | P0 | OP-11: establish data provenance at launch; expand reporting as data becomes available. |
| X006 | Retention | Shows how many customers come back and keep purchasing over time. | P0 | OP-10–12: define metrics and data ownership. |
| X007 | Customer lifetime value | Estimates how much revenue a customer is likely to generate over their full relationship with MOD. | P1 | OP-11: expand behavioral/campaign/CLV analysis after reliable baseline instrumentation. |
| X008 | Customer behaviour reporting | Shows how customers browse, order, spend, and interact with MOD over time. | P1 | OP-11: expand behavioral/campaign/CLV analysis after reliable baseline instrumentation. |
| X009 | Loyalty attach rate | Shows what share of orders or customers are connected to the loyalty program. | P0 | OP-10–12: define metrics and data ownership. |
| X010 | AI-generated performance summaries | Uses AI to turn performance data into short, easy-to-read summaries. | P2 / US pilot | OP-13: governed metrics and human-reviewed AI output; not autonomous business changes. |
| X011 | AI reporting/business Q&A | Lets teams ask business questions in everyday language and get answers from reporting data. | P2 / US pilot | OP-13: governed metrics and human-reviewed AI output; not autonomous business changes. |
| X012 | AI-recommended actions | Uses AI to suggest actions teams can take based on performance trends and customer data. | P2 / US pilot | OP-13: governed metrics and human-reviewed AI output; not autonomous business changes. |
| X013 | Sales reporting | Shows sales results by useful views such as time period, channel, store, or product. | P0 | OP-10–12: define metrics and data ownership. |
| X014 | Item performance | Shows how individual menu items are selling and performing. | P0 | OP-10–12: define metrics and data ownership. |
| X015 | Store-level analytics | Shows performance for each store so teams can compare locations and spot issues. | P0 | OP-10–12: define metrics and data ownership. |
| X016 | Operational reporting | Reports on day-to-day operating metrics that help teams understand how the business is running. | P0 | OP-10–12: define metrics and data ownership. |
| X017 | Loyalty enrollment | Tracks how many customers join the loyalty program. | P0 | OP-10–12: define metrics and data ownership. |
| X018 | Loyalty activation | Tracks how many enrolled loyalty members actually start using the program. | P0 | OP-10–12: define metrics and data ownership. |
| X019 | Loyalty revenue | Shows how much revenue comes from loyalty members and loyalty-driven activity. | P0 | OP-10–12: define metrics and data ownership. |
| X020 | Cart conversion | Shows what percentage of customers who add items to a cart go on to complete an order. | P0 | OP-10–12: define metrics and data ownership. |
| X021 | Campaign performance | Shows how marketing campaigns perform, including engagement, orders, and revenue. | P1 | OP-11: expand behavioral/campaign/CLV analysis after reliable baseline instrumentation. |

### A3. App/Web Management

| Source ID | Original feature | Original description | Proposed priority | Scope treatment |
| --- | --- | --- | --- | --- |
| X022 | Fully customizable app | Lets MOD control the app design, layout, content, and experience to match its brand and needs. | P1 / Conditional | QA-06–08: native scope is separate; remote configuration cannot replace every app release. |
| X023 | Fully customizable website | Lets MOD control the website design, layout, content, and experience to match its brand and needs. | P0 | OP-05: define editable content/settings; arbitrary product changes still require engineering. |
| X024 | Allow business/marketing teams to change front-end content without engineering | Lets business or marketing teams update customer-facing content without needing developers. | P0 | OP-05: define editable content/settings; arbitrary product changes still require engineering. |
| X025 | Make changes without vendor/support tickets | Lets MOD make routine changes directly instead of opening a support request with the vendor. | P0 | OP-05: define editable content/settings; arbitrary product changes still require engineering. |
| X026 | Make appropriate changes without requiring an app-store release | Lets MOD update supported app content or settings without publishing a new app version each time. | P1 / Conditional | QA-06–08: native scope is separate; remote configuration cannot replace every app release. |

### A4. Cart Abandonment

| Source ID | Original feature | Original description | Proposed priority | Scope treatment |
| --- | --- | --- | --- | --- |
| X027 | Detect abandoned carts | Identifies when a customer adds items to a cart but leaves without placing the order. | P0 | MK-03: use consistent events and abandonment definitions. |
| X028 | Cart-abandonment reporting | Reports how often carts are abandoned and where customers tend to drop off. | P0 | MK-03: use consistent events and abandonment definitions. |
| X029 | Channel-level abandonment tracking | Shows cart abandonment separately by channel, such as web, app, or other ordering sources. | P0 | MK-03: use consistent events and abandonment definitions. |
| X030 | Automated abandoned-cart messages | Automatically sends reminders or follow-up messages to customers who leave items in their cart. | P1 | MK-07: preference-aware recovery; suppress after purchase and test reminder versus discount. |
| X031 | Test reminder vs discount recovery | Lets teams compare whether a simple reminder or a discount works better at bringing customers back. | P1 | MK-07: preference-aware recovery; suppress after purchase and test reminder versus discount. |

### A5. Checkout

| Source ID | Original feature | Original description | Proposed priority | Scope treatment |
| --- | --- | --- | --- | --- |
| X032 | Venmo | Lets customers pay with Venmo at checkout. | P1 / Conditional | CK-11: US-relevant payment options; validate processor support and demand. |
| X033 | PayPal | Lets customers pay with PayPal at checkout. | P1 / Conditional | CK-11: US-relevant payment options; validate processor support and demand. |
| X034 | Apple Pay | Lets customers pay quickly using Apple Pay. | P0 | CK-03–07: integrate into checkout without another journey. |
| X035 | Google Pay | Lets customers pay quickly using Google Pay. | P0 | CK-03–07: integrate into checkout without another journey. |
| X036 | Loyalty enrollment during checkout | Lets customers join the loyalty program while they are checking out. | P0 | AC-02 / CK-03: same optional enrollment capability; retain both source entries for traceability. |
| X037 | Show available rewards during checkout | Shows customers which rewards they can use before they finish paying. | P0 | RW-01 / CK-07: same checkout reward surface, not separate implementations. |

### A6. Customer Data

| Source ID | Original feature | Original description | Proposed priority | Scope treatment |
| --- | --- | --- | --- | --- |
| X038 | Snowflake integration | Connects customer and order data with Snowflake for storage, analysis, and reporting. | P1 / Conditional | OP-09: named integration is not a confirmed installed system; promote if a launch dependency. |
| X039 | Tableau/BI integration | Makes data available to Tableau or other business intelligence tools for dashboards and analysis. | P1 / Conditional | OP-09: named integration is not a confirmed installed system; promote if a launch dependency. |
| X040 | CRM integration | Connects customer information and activity with MOD's CRM system. | P1 / Conditional | OP-09: named integration is not a confirmed installed system; promote if a launch dependency. |
| X041 | CDP integration | Connects with a customer data platform so customer information can be combined and activated across systems. | P1 / Conditional | OP-09: named integration is not a confirmed installed system; promote if a launch dependency. |
| X042 | Olo integration/compatibility | Works cleanly with Olo where needed so ordering, customer, or related data can move between systems. | P0 / Conditional | OP-07: integrate the confirmed ordering/POS stack; Olo is a candidate, not a verified dependency. |
| X043 | Central customer profile/data | Keeps key customer information in one shared profile instead of spreading it across separate systems. | P0 | OP-06–08 and AC-07: authoritative records and permitted access. |
| X044 | Real-time customer data | Updates customer information quickly enough for teams and systems to act on recent behavior. | P0 | OP-08 / RW-02: specify freshness expectations, pending states, and delayed-integration behavior. |
| X045 | Customer data available to MOD | Gives MOD direct access to the customer data needed for analysis, marketing, and operations. | P0 | OP-06–08 and AC-07: authoritative records and permitted access. |
| X046 | Send customer/order data downstream | Sends customer and order data to other systems that need it, such as analytics, CRM, or marketing tools. | P0 | OP-06–08 and AC-07: authoritative records and permitted access. |
| X047 | Real-time APIs | Provides APIs that can send or receive data with little delay. | P0 | OP-08 / RW-02: specify freshness expectations, pending states, and delayed-integration behavior. |
| X048 | POS integration | Connects with the point-of-sale system so orders, customer activity, and store data can stay in sync. | P0 / Conditional | OP-07: integrate the confirmed ordering/POS stack; Olo is a candidate, not a verified dependency. |
| X161 | Unified customer identity | Single profile across web, mobile, in-store and third-party channels. | P0 / Conditional | AC-07: unify supported first-party channels; third-party identity depends on available data and permissions. |
| X162 | Account merge and identity resolution | Merge duplicate accounts and identities. | P0 | AC-06 / OP-14: verified ownership, balance preservation, and auditable account merging. |

### A7. Customer Segmentation

| Source ID | Original feature | Original description | Proposed priority | Scope treatment |
| --- | --- | --- | --- | --- |
| X049 | Pre-built customer segments | Provides ready-made customer groups for common use cases, such as new, loyal, or inactive customers. | P1 | MK-04–05: governed, measurable audience rules. |
| X050 | Custom customer segments | Lets teams build their own customer groups using rules that fit a specific campaign or business need. | P1 | MK-04–05: governed, measurable audience rules. |
| X051 | AI-generated customer segments | Uses AI to suggest or create useful customer groups from available data. | P2 / US pilot | MK-11: AI segment suggestions require governed fields, validation, and staff review. |
| X052 | Natural-language segment creation | Lets a user describe the audience they want in plain English and turns it into a customer segment. | P2 / US pilot | MK-11: AI segment suggestions require governed fields, validation, and staff review. |
| X053 | Segment by purchase frequency | Groups customers based on how often they purchase. | P1 | MK-04–05: governed, measurable audience rules. |
| X054 | Segment by spend | Groups customers based on how much they spend. | P1 | MK-04–05: governed, measurable audience rules. |
| X055 | Segment by purchased products | Groups customers based on the products or menu items they buy. | P1 | MK-04–05: governed, measurable audience rules. |
| X056 | Segment by daypart | Groups customers based on when they usually order, such as breakfast, lunch, or dinner. | P1 | MK-04–05: governed, measurable audience rules. |
| X057 | Identify lapsed customers | Finds customers who used to purchase but have not ordered again within a chosen period. | P1 | MK-04–05: governed, measurable audience rules. |
| X058 | Automatically move customers between segments as behaviour changes | Automatically updates a customer's segment when their behavior changes. | P1 | MK-04–05: governed, measurable audience rules. |

### A8. Customer Support

| Source ID | Original feature | Original description | Proposed priority | Scope treatment |
| --- | --- | --- | --- | --- |
| X059 | Pickup issues routed to store | Sends pickup-related customer problems to the store that can best resolve them. | P0 | CS-01–07: route with order context and accountable ownership. |
| X060 | Delivery issues routed to centralized support | Sends delivery-related customer problems to a central support team for consistent handling. | P0 | CS-01–07: route with order context and accountable ownership. |

### A9. Delivery

| Source ID | Original feature | Original description | Proposed priority | Scope treatment |
| --- | --- | --- | --- | --- |
| X061 | Customer-driver messaging | Lets customers message their delivery driver about the order or drop-off. | P0 / Conditional | OR-07: one provider-supported contact capability; masked contact and support fallback. |
| X062 | Customer-driver calling | Lets customers call their delivery driver when needed. | P0 / Conditional | OR-07: one provider-supported contact capability; masked contact and support fallback. |
| X063 | Real-time delivery tracking | Shows the customer where the delivery is in real time after the order leaves the store. | P0 / Conditional | OR-03–07 and CS-01–04: delivery-provider capabilities must be confirmed. |
| X064 | Accurate delivery ETA | Provides a reliable estimate of when the delivery should arrive. | P0 / Conditional | OR-03–07 and CS-01–04: delivery-provider capabilities must be confirmed. |
| X065 | Driver/Dasher contact | Gives customers a way to contact the assigned driver or Dasher when appropriate. | P0 / Conditional | OR-07: one provider-supported contact capability; masked contact and support fallback. |
| X066 | Delivery issue handling | Provides a clear process for reporting and resolving delivery problems. | P0 | CS-02–04: customer issue/refund handling remains required even if provider automation is unavailable. |
| X067 | Delivery refund handling | Supports refunds for eligible delivery problems without a confusing or manual process. | P0 | CS-02–04: customer issue/refund handling remains required even if provider automation is unavailable. |

### A10. Experimentation / A-B Testing

| Source ID | Original feature | Original description | Proposed priority | Scope treatment |
| --- | --- | --- | --- | --- |
| X068 | Built-in experimentation capability | Includes tools for running controlled product, marketing, or experience tests without building everything from scratch. | P1 | MK-09–10: controlled experiments, holdouts, and margin guardrails. |
| X069 | Message vs message tests | Compares different message versions to see which one performs better. | P1 | MK-09–10: controlled experiments, holdouts, and margin guardrails. |
| X070 | Reward vs reward tests | Compares different rewards to see which one drives better customer behavior or results. | P1 | MK-09–10: controlled experiments, holdouts, and margin guardrails. |
| X071 | Offer vs no-offer tests | Compares giving an offer with giving no offer to understand the offer's true impact. | P1 | MK-09–10: controlled experiments, holdouts, and margin guardrails. |
| X072 | Control groups | Keeps a similar group of customers unchanged so results can be compared fairly against the test group. | P1 | MK-09–10: controlled experiments, holdouts, and margin guardrails. |
| X073 | Test merchandising/banner placement | Tests where banners or promoted content appear to see which placement performs best. | P1 | MK-09–10: controlled experiments, holdouts, and margin guardrails. |
| X074 | Test reward placement/visibility | Tests where and how rewards are shown to see what gets more customers to notice and use them. | P1 | MK-09–10: controlled experiments, holdouts, and margin guardrails. |
| X075 | Test checkout/conversion improvements | Tests checkout changes to learn which experience helps more customers complete an order. | P1 | MK-09–10: controlled experiments, holdouts, and margin guardrails. |
| X076 | Measure conversion lift | Measures how much a test or change increases completed orders compared with the baseline. | P1 | MK-09–10: controlled experiments, holdouts, and margin guardrails. |
| X077 | Measure incremental revenue | Measures how much additional revenue was actually caused by a campaign, offer, or test. | P1 | MK-09–10: controlled experiments, holdouts, and margin guardrails. |
| X078 | Measure promotional effectiveness | Measures whether a promotion creates extra value rather than only discounting purchases that would have happened anyway. | P1 | MK-09–10: controlled experiments, holdouts, and margin guardrails. |

### A11. Gamification

| Source ID | Original feature | Original description | Proposed priority | Scope treatment |
| --- | --- | --- | --- | --- |
| X079 | Loyalty challenges/missions | Lets customers complete goals or missions to earn points, rewards, or other benefits. | P2 / US pilot | RW-14–18: optional engagement outside the primary purchase path. |
| X080 | Punch cards | Rewards customers after a set number of qualifying purchases, similar to a digital stamp card. | P2 / US pilot | RW-14–18: optional engagement outside the primary purchase path. |
| X081 | Progress tracking | Shows customers how close they are to completing a challenge, earning a reward, or reaching a goal. | P0 core / P2 missions | RW-02 provides normal reward progress at launch; mission progress accompanies later experiments. |
| X082 | Purchase-based journeys | Guides customers through a series of purchase steps or milestones over time. | P2 / US pilot | RW-14–18: optional engagement outside the primary purchase path. |
| X083 | Item-completion challenges | Rewards customers for buying a required set or number of specific items. | P2 / US pilot | RW-14–18: optional engagement outside the primary purchase path. |
| X084 | Interactive games/mini-games | Adds simple games or interactive experiences customers can play as part of promotions or loyalty. | P2 / US pilot | RW-14–18: optional engagement outside the primary purchase path. |
| X085 | Bingo-style campaigns | Runs bingo-style promotions where customers complete different actions or purchases to fill a card. | P2 / US pilot | RW-14–18: optional engagement outside the primary purchase path. |

### A12. Loyalty

| Source ID | Original feature | Original description | Proposed priority | Scope treatment |
| --- | --- | --- | --- | --- |
| X086 | Dine-in-only rewards | Creates rewards that can only be earned or used for dine-in purchases. | P1 / Conditional | RW-13: validate MOD service model, paid modifiers, store eligibility, and POS support. |
| X087 | Points/reward multipliers | Lets MOD award extra points or reward value for selected purchases, times, or customer groups. | P1 / Conditional | RW-10: preserve existing live offers at launch; new promotional mechanics follow approved rules. |
| X088 | Modifier-level rewards | Lets rewards apply to a specific modifier or add-on, not just the main menu item. | P1 / Conditional | RW-13: validate MOD service model, paid modifiers, store eligibility, and POS support. |
| X089 | Loyalty integrated directly into ordering | Builds loyalty into the ordering experience so customers can earn, view, and use rewards without leaving the flow. | P0 | RW-01–09: approved rules, visible eligibility, and consistent balances. |
| X090 | Show loyalty information on homepage | Shows points, status, or available rewards on the homepage so customers see their loyalty value quickly. | P0 | RW-01–09: approved rules, visible eligibility, and consistent balances. |
| X091 | Show loyalty/rewards in cart | Shows loyalty details and usable rewards while customers review their cart. | P0 | RW-01–09: approved rules, visible eligibility, and consistent balances. |
| X092 | Show loyalty/rewards at checkout | Shows loyalty details and usable rewards during checkout before payment is completed. | P0 | RW-01 / CK-07: same checkout reward surface, not separate implementations. |
| X093 | Loyalty sign-up during checkout | Lets customers join loyalty at checkout without leaving the order flow. | P0 | AC-02 / CK-03: same optional enrollment capability; retain both source entries for traceability. |
| X094 | Scan-to-earn for in-store purchases | Lets in-store customers scan something, such as a code or receipt, to earn loyalty credit for their purchase. | P0 | RW-01–09: approved rules, visible eligibility, and consistent balances. |
| X095 | Scan-to-redeem in store | Lets customers scan at the store to use an eligible loyalty reward. | P0 | RW-01–09: approved rules, visible eligibility, and consistent balances. |
| X096 | Create rewards | Lets authorized teams create and set up new loyalty rewards. | P0 | RW-08 / OP-04–05: authorized configuration with validation, audit history, and controlled publishing. |
| X097 | BOGO rewards | Supports buy-one-get-one reward offers with defined qualifying and free items. | P1 / Conditional | RW-10: preserve existing live offers at launch; new promotional mechanics follow approved rules. |
| X098 | Bonus points | Lets MOD award extra loyalty points for selected actions, purchases, or campaigns. | P1 / Conditional | RW-10: preserve existing live offers at launch; new promotional mechanics follow approved rules. |
| X099 | Product-specific rewards | Creates rewards tied to a specific product or product group. | P1 / Conditional | RW-10: preserve existing live offers at launch; new promotional mechanics follow approved rules. |
| X100 | Menu-item-level rewards | Creates rewards tied to a specific menu item. | P1 / Conditional | RW-10: preserve existing live offers at launch; new promotional mechanics follow approved rules. |
| X101 | Loyalty configuration without engineering | Lets business teams change loyalty rules, rewards, and settings without needing engineering work. | P0 | RW-08 / OP-04–05: authorized configuration with validation, audit history, and controlled publishing. |
| X155 | Configurable loyalty tiers | Support tier qualification, progression rules and tier benefits. | P2 / US pilot | RW-14: test understandable tiers and benefits; preserve existing entitlements if applicable. |
| X156 | Real-time points balance and history | Display balances and transaction history in real time. | P0 | OP-08 / RW-02: specify freshness expectations, pending states, and delayed-integration behavior. |
| X157 | Points expiration management | Rolling, fixed and event-driven expiration rules. | P0 | RW-08: approved expiry policy with customer-visible dates and audited rule changes. |
| X158 | Referral program | Referral rewards and tracking. | P1 | RW-11: verify qualifying actions, milestone dates, eligibility, and abuse controls. |
| X159 | Birthday and anniversary rewards | Automated milestone rewards. | P1 | RW-11: verify qualifying actions, milestone dates, eligibility, and abuse controls. |
| X160 | Fraud detection | Detect duplicate receipts, redemption velocity and suspicious patterns. | P0 | RW-09: duplicate claims, unusual redemption activity, controlled adjustments, and recovery. |

### A13. Marketing

| Source ID | Original feature | Original description | Proposed priority | Scope treatment |
| --- | --- | --- | --- | --- |
| X102 | Hero/promotional banners | Displays large promotional banners in prominent places such as the homepage. | P0 | MK-01: controlled merchandising; order and active-order tasks retain prominence. |
| X103 | Visual rather than text-only merchandising | Uses images and visual placements to promote products and offers instead of relying only on text. | P0 | MK-01: controlled merchandising; order and active-order tasks retain prominence. |
| X104 | Limited-time-offer promotion | Highlights limited-time menu items or offers so customers can easily discover them before they expire. | P0 | MK-01: controlled merchandising; order and active-order tasks retain prominence. |
| X105 | Featured-product promotion | Gives selected products extra visibility to help drive discovery and sales. | P0 | MK-01: controlled merchandising; order and active-order tasks retain prominence. |
| X106 | Loyalty-promotion banners | Uses banners to promote loyalty benefits, rewards, or member-only offers. | P0 | MK-01: controlled merchandising; order and active-order tasks retain prominence. |
| X107 | Push notifications | Sends timely messages directly to customers through app push notifications. | P1 / Conditional | MK-06 / OR-04: supported opt-in push; transactional status must also work without push. |
| X108 | Email campaigns | Lets teams create and send marketing emails to selected customer groups. | P1 | MK-01–07: customer preferences, message suppression, and frequency controls. |
| X109 | Lifecycle campaigns | Sends messages based on where a customer is in their journey, such as new, active, or at risk of lapsing. | P1 | MK-01–07: customer preferences, message suppression, and frequency controls. |
| X110 | Win-back campaigns | Targets customers who have stopped ordering with messages or offers designed to bring them back. | P1 | MK-01–07: customer preferences, message suppression, and frequency controls. |
| X111 | Automated marketing campaigns | Automatically runs marketing messages or journeys when defined customer actions or conditions happen. | P1 | MK-01–07: customer preferences, message suppression, and frequency controls. |
| X163 | Push, SMS, email and in-app orchestration | Cross-channel engagement journeys. | P1 | MK-06: cross-channel coordination using explicit preferences and transactional/marketing separation. |
| X164 | Frequency capping and suppression lists | Messaging controls and compliance. | P0 when messaging enabled | MK-06: suppression and frequency controls precede automated campaigns. |

### A14. Ordering

| Source ID | Original feature | Original description | Proposed priority | Scope treatment |
| --- | --- | --- | --- | --- |
| X112 | Remember and suggest previously used store | Remembers the store a customer used before and suggests it the next time they order. | P0 | ST, MN, CK, and OR capabilities: preserve a coherent customer journey. |
| X113 | Personalized ordering experience based on customer behaviour | Changes the ordering experience based on what the customer has viewed, bought, or preferred in the past. | P1 | MK-05–08: relevance using approved customer data; favorites and order history are P0. |
| X114 | Mobile app ordering | Lets customers browse the menu and place orders in the mobile app. | P1 / Conditional | QA-06: native app ordering is separate from P0 responsive web ordering; preserve current app continuity. |
| X115 | Web ordering | Lets customers browse the menu and place orders on the website. | P0 | ST, MN, CK, and OR capabilities: preserve a coherent customer journey. |
| X116 | Consistent experience between web and app | Keeps key features, design, and ordering behavior consistent across the website and mobile app. | P0 shared / Conditional native | QA-06: consistent data and rules with any retained app; new native development is separately scoped. |
| X117 | Reduce clicks/steps required to place an order | Simplifies the ordering flow so customers can complete an order with fewer taps, clicks, or screens. | P0 | Section 3: two taps to primary functions; two primary actions for eligible reorders, not every custom order. |
| X118 | Automatically select closest store | Uses location to suggest or select the nearest suitable store for the customer. | P0 | ST-02: suggest the nearest suitable store and allow correction; do not silently overwrite user choice. |
| X119 | “Order Again” using previous purchases | Lets customers quickly rebuild a previous order instead of selecting every item again. | P0 | ST, MN, CK, and OR capabilities: preserve a coherent customer journey. |
| X120 | Deep links directly to products/menu categories/offers | Opens customers directly to a specific product, menu section, or offer from a link. | P0 | ST, MN, CK, and OR capabilities: preserve a coherent customer journey. |
| X165 | Guest checkout | Support guest ordering flow. | P0 | AC-02 / CK-03: guest purchase without forced account creation; secure post-order access. |
| X166 | Multi-factor authentication | Support MFA and secure session management. | P0 | AC-05 / OP-04: staff MFA and risk-based customer verification; avoid unnecessary repeat authentication. |
| X167 | Save this build | Persist and share custom product configurations. | P0 save / P1 share | MN-07 / MN-10: preserve custom build; revalidate before reorder or sharing-based purchase. |
| X168 | Nutrition and allergen filtering | Calorie calculation and allergen transparency. | P0 | MN-05: authoritative ingredient/nutrition data; filters do not imply cross-contact-free preparation. |
| X169 | Gift card balance and split tender | Gift card checkout capabilities. | P0 | CK-05 / RW-05–07: gift balance plus supported second tender, including reversal/refund behavior. |
| X170 | Real-time order status | Live order updates across channels. | P0 | OR-02–04: operational events, pending/delayed states, and guest tracking; no simulated certainty. |

### A15. Personalization

| Source ID | Original feature | Original description | Proposed priority | Scope treatment |
| --- | --- | --- | --- | --- |
| X121 | Personalized homepage | Changes the homepage to show content that is more relevant to each customer. | P1 | MK-05–08: relevance using approved customer data; favorites and order history are P0. |
| X122 | Different content for different customer segments | Shows different content to different customer groups based on their needs or behavior. | P1 | MK-05–08: relevance using approved customer data; favorites and order history are P0. |
| X123 | Personalized promotions | Gives customers promotions selected for their interests, history, or segment. | P1 | MK-05–08: relevance using approved customer data; favorites and order history are P0. |
| X124 | Personalized rewards | Gives customers rewards selected for their interests, history, or segment. | P1 | MK-05–08: relevance using approved customer data; favorites and order history are P0. |
| X125 | New-customer onboarding content | Shows helpful introductory content to first-time customers so they understand the experience and key benefits. | P0 | Section 3: short contextual guidance; no mandatory onboarding before browsing or purchase. |
| X126 | Win-back content for lapsed customers | Shows targeted content designed to encourage inactive customers to return and order again. | P1 | MK-05–08: relevance using approved customer data; favorites and order history are P0. |
| X127 | Real-time personalization based on behaviour | Updates the customer experience based on what the person is doing right now, not only on past behavior. | P2 / US pilot | MK-11: introduce AI/real-time adaptation only after simpler recommendations demonstrate value. |
| X128 | Store-specific popular-item recommendations | Recommends items that are currently popular at the specific store the customer is ordering from. | P1 | MK-05–08: relevance using approved customer data; favorites and order history are P0. |
| X129 | “Most liked” items | Highlights items that customers like or choose most often. | P2 / US pilot | CS-08 / MK-08: genuine evidence, moderation, and useful volume; no invented ratings or popularity. |
| X130 | Customer ratings | Lets customers rate items or experiences and shows those ratings where useful. | P2 / US pilot | CS-08 / MK-08: genuine evidence, moderation, and useful volume; no invented ratings or popularity. |
| X131 | Social-proof indicators | Shows signals such as popularity, ratings, or purchase activity that help customers feel confident about a choice. | P2 / US pilot | CS-08 / MK-08: genuine evidence, moderation, and useful volume; no invented ratings or popularity. |
| X132 | AI-driven cart recommendations | Uses AI to suggest additional items in the cart that fit the customer's current order. | P2 / US pilot | MK-11: introduce AI/real-time adaptation only after simpler recommendations demonstrate value. |

### A16. Pizza UX

| Source ID | Original feature | Original description | Proposed priority | Scope treatment |
| --- | --- | --- | --- | --- |
| X133 | Pizza-specific ordering flow | Provides an ordering experience designed specifically for building and customizing pizzas. | P0 | MN-02–08: MOD-specific customization and menu rules. |
| X134 | Visual pizza size selection | Lets customers choose pizza size using clear visual options rather than text alone. | P0 | MN-02–08: MOD-specific customization and menu rules. |
| X135 | Pizza topping visualization | Shows toppings visually on the pizza as the customer adds or removes them. | P1 / US pilot | MN-09: rich visual rendering is optional; accessible text summary is P0. |
| X136 | Modifier handling | Handles pizza choices and add-ons cleanly, including rules, pricing, and combinations. | P0 | MN-02–08: MOD-specific customization and menu rules. |
| X137 | Half-and-half pizza configuration | Lets customers choose different toppings on each half of a pizza. | P1 / Conditional | MN-11: kitchen/POS support and MOD menu fit must be confirmed; not assumed because competitors offer it. |
| X138 | Combo configuration | Lets customers configure bundled meals or combos while handling required choices correctly. | P0 / Conditional | MN-08: required for supported live combos; do not invent unsupported menu bundles. |
| X139 | Improved topping-selection workflow | Makes selecting, changing, and reviewing pizza toppings faster and easier. | P0 | MN-02–08: MOD-specific customization and menu rules. |

### A17. SEO / Discovery

| Source ID | Original feature | Original description | Proposed priority | Scope treatment |
| --- | --- | --- | --- | --- |
| X140 | Search-engine-friendly store pages | Creates store pages that search engines can understand and show in search results. | P0 | ST-07 and QA-02–05: accurate, accessible public content and direct ordering links. |
| X141 | Search-engine-indexable menus | Lets search engines read and index menu pages so customers can discover specific items through search. | P0 | ST-07 and QA-02–05: accurate, accessible public content and direct ordering links. |
| X142 | Google Maps discoverability | Helps MOD locations and ordering options appear correctly when customers search in Google Maps. | P0 | ST-07 and QA-02–05: accurate, accessible public content and direct ordering links. |
| X143 | Apple Maps discoverability | Helps MOD locations and ordering options appear correctly when customers search in Apple Maps. | P0 | ST-07 and QA-02–05: accurate, accessible public content and direct ordering links. |
| X144 | AI/LLM search discoverability | Makes MOD content easier for AI search tools and assistants to find, understand, and reference. | P1 | QA-05: structured, accurate public content; no promise of AI search rankings. |
| X145 | Improve site speed/Core Web Vitals | Improves website loading speed and key user-experience measures that affect customers and search performance. | P0 | ST-07 and QA-02–05: accurate, accessible public content and direct ordering links. |
| X146 | Reduce search-to-order clicks | Makes it faster for someone coming from search to reach the menu and place an order. | P0 | ST-07 and QA-02–05: accurate, accessible public content and direct ordering links. |

### A18. Upselling

| Source ID | Original feature | Original description | Proposed priority | Scope treatment |
| --- | --- | --- | --- | --- |
| X147 | Cart-level upselling | Suggests useful add-on items while the customer is reviewing the cart. | P1 | CK-13 and MK-08: small optional add-on area with no extra checkout stage. |
| X148 | AI product recommendations | Uses AI to recommend products that fit the customer or current order. | P2 / US pilot | MK-11: introduce AI/real-time adaptation only after simpler recommendations demonstrate value. |
| X149 | Recommendations using previous purchases | Recommends items based on what the customer has purchased before. | P1 | CK-13 and MK-08: small optional add-on area with no extra checkout stage. |
| X150 | Recommendations using customer/order behaviour | Recommends items based on broader customer and order patterns, such as common combinations or similar behavior. | P1 | CK-13 and MK-08: small optional add-on area with no extra checkout stage. |

### A19. Web → App

| Source ID | Original feature | Original description | Proposed priority | Scope treatment |
| --- | --- | --- | --- | --- |
| X151 | Encourage web customers to download app | Prompts website customers to install the mobile app when it is likely to provide a better ongoing experience. | P1 / Conditional | QA-07: optional app discovery; never block checkout or core rewards behind installation. |
| X152 | QR-code app download | Lets customers scan a QR code that takes them directly to the app download page. | P1 / Conditional | QA-07: optional app discovery; never block checkout or core rewards behind installation. |
| X153 | Detect installed app and offer “Open in App” | Detects when the app is already installed and gives the customer an option to continue there. | P1 / Conditional | QA-07: supported app/universal links and web fallback; universal installed-app detection is not assumed. |
| X154 | Smooth transition between website and app | Keeps the customer's journey as seamless as possible when moving from the website into the app. | P1 / Conditional | QA-07: secure, tested cart/session handoff; do not assume a link automatically transfers authentication. |

## Appendix B. Scope maintenance

Maintain stable capability IDs and workbook source IDs when revising this document. Record accepted changes, deferred ideas, dependencies, and the owner of each policy decision. A later delivery backlog should add owner, acceptance criteria, dependencies, estimate, and release to each selected capability; inclusion here does not mean every feature ships at launch.

| Version | Date | Change |
| --- | --- | --- |
| 1.0 | October 5, 2026 | Initial USA-first scope, categorized capabilities, international applicability decisions, and complete 169-entry workbook inventory |
