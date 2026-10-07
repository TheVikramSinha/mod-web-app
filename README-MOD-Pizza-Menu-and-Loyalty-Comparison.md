> Later update, 7 October 2026: [Pooja discovery and roadmap](README-MOD-Pizza-Discovery-and-Roadmap.md) adds group orders, coupon lifecycle and campaign results. Those items are no longer deferred as described in this earlier comparison.

# MOD Pizza — menu expansion and Ember loyalty comparison

Updated 7 October 2026. This is the implementation record for the supplied MOD menu screenshot and the Ember README at `/Users/vikram/Downloads/README.md`.

## Product assessment

The existing MOD prototype already connected ordering, customization, wallet tenders, scheduled orders, tracking, store operations and HQ campaigns. Its main weaknesses were a seven-item menu, rewards embedded in code, an earning rate that administrators could not control, and no complete store-request/HQ-approval compensation flow.

Ember is a broader loyalty and marketing operations product. Its README is useful comparison material, not source code or proof that those capabilities already exist in MOD. The useful next step was to connect the loyalty foundation to MOD's working ordering experience, rather than add 26 new navigation destinations. US dollars, existing sample stores and the existing MOD customer account are retained; Ember's India locations and rupee examples are not imported.

## What is now implemented

### Customer menu

The catalog contains **46 items across seven categories**:

| Category | Count | Included items |
|---|---:|---|
| Pizzas | 14 | The MOD, Spicy Thai, Maddy’s Favorite, The Honor Roll, One Topping, OG Pepperoni, Carnivore, Aloha, Firebird, Loaded Legend, MOD-gherita, Perfect Pesto, Smoke Show, Veg Out |
| Salads | 3 | The MOD Salad, Caesar salad, Italian Chop |
| Sides | 1 | Cheesy Garlic Bread |
| Desserts | 5 | No Name Cake, CinnaMOD, Pumpkin Spice Cake Pop, Pink Vanilla Cake Pop, 2 for $5 Cake Pops |
| Kids Meal | 1 | Small one-topping pizza with a beverage |
| Beverages | 17 | Both fountain sizes; Mexican Coke; Coke Zero, Classic and Diet; Sprite; Barq’s; both Boylans; three San Pellegrino drinks; juice; milk; chocolate milk; water |
| Extras | 5 | Red pepper flakes, parmesan, salt, pepper, wrapped utensils |

Categories, search, favorites and vegetarian filtering remain together above compact product cards. Selecting a category displays only that category. The all-items view groups products under headings rather than mixing drinks, pizzas and packets. Store availability and HQ menu editing have category filters as well.

Connected menu behavior:

- Pizza customization includes 22 ingredient choices. The One Topping pizza limits non-cheese toppings to one.
- Salads have greens, dressing and topping choices.
- Kids meals have a topping and beverage selection; cake-pop pairs have two flavor selections.
- These selections survive bag editing, checkout, receipts and reorder.
- Fountain drinks are pickup-only, checked when adding and at checkout; reorder skips items that are not eligible in the current fulfillment mode.
- Unavailable ingredients are checked in builders and again at checkout.
- Extras are free in the sample. An extras-only order cannot be placed.
- New products appear in each store independently; changing one store's price or availability does not change others.
- Migration adds missing products without resetting wallets, orders, saved builds or per-store edits. The old default $3.49 cake is updated to the screenshot's $3.99; independently edited prices are retained.

### HQ loyalty administration

Open `#admin/loyalty`. Five tabs share one destination:

1. **Program rules:** base points per dollar, purchase-points daily cap, optional Member/Silver/Gold tiers, spend thresholds and earning multipliers.
2. **Reward catalog:** create/edit/pause rewards; fixed-dollar, percentage, one-item and delivery-fee benefits; points price, minimum merchandise spend, item/category qualification, tier, participating stores, validity dates and per-member use limits.
3. **Members & audiences:** member search, points, tier, completed visits and spend; all members, regulars, lapsed, reward-affordable and consented audiences; member ledger, reasoned point corrections and membership pause/resume.
4. **Recovery approvals:** store requests, HQ approval/rejection with a note, once-only points or service-credit issuance, and observed return-purchase status.
5. **Activity & results:** purchase points, non-canceled reward orders, reward-discount value, pending requests and ledger events, following the applicable store/period filters.

Program settings are network-wide. Catalog, member and recovery lists have a store filter; historical period/channel filters appear only for the reporting tab. The customer-facing interface still has five mobile navigation items.

### Store-manager rewards view

Open `#store/sea/rewards`, or use another store ID. Managers can inspect local reward participation and submit recovery requests for guests with an order at their own store. They cannot edit the program or approve compensation from this workspace. Other stores' requests are not shown.

A request may reference an order. A supplied reference must match the member and store; a second pending/approved request for the same order is rejected. Maximum request amounts are 500 whole points or $50 service credit. Two explicitly labeled sample pending cases are provided.

### Customer rewards and checkout

- Customer reward cards are now sourced from HQ's saved catalog.
- Eligibility is checked at checkout, not just when the card is selected.
- A points reward and a deal cannot stack. Points are spent only when an order is placed.
- One-item rewards apply to one cheapest qualifying unit, capped at the configured amount; upgrades above the cap remain payable.
- Percentage benefits reduce merchandise, fixed discounts cannot exceed merchandise, and delivery benefits waive the actual fee.
- Earning excludes discounts, taxes, tips and delivery. Gift funds and service credit remain separate payment balances.
- Placed orders snapshot their earning rate and purchase cap. Later program changes apply to new orders.
- Completion awards points once. The daily cap counts positive purchase awards on the browser's local completion date. Refunds do not reopen that day's earning allowance.
- Full refunds restore redeemed points and reverse earned points. If those earned points have already been spent, the refund is blocked until the balance can support reversal.
- Receipt claims and one-time bonuses remain, use the points ledger, and are separate from the purchase cap. Paused memberships cannot claim them.
- Opening balances are recorded at the upgrade; pre-upgrade point transactions are not fabricated retrospectively.
- Reward use limits exclude canceled orders. Reward dates are inclusive browser-local calendar dates.
- Points themselves do not expire in this version.

## Ember-to-MOD comparison and scope decisions

“Existing” means present before this iteration. “Added” means connected behavior delivered here. “Deferred” means no claim of equivalent functionality.

| Ember area | MOD decision and current coverage |
|---|---|
| Customer profiles | Existing profile/consent/wallet; added member tiers, pause/resume, reasoned point corrections and structured points ledger |
| Audiences | Added five transparent, dynamic groups. Deferred arbitrary AND/OR builders, exclusions, tags and frozen audiences |
| Banked-points loyalty | Added configurable earning, caps and optional tier multipliers |
| Visit-based, points-to-reward issuance and points-to-currency modes | Deferred; one understandable banked-points model avoids conflicting checkout balances |
| Reward catalog | Added four useful reward types, dates, stores, spend, tier and member limits |
| BOGO, Buy X Get Y, rollback prices, weighted gifts | Existing two-pizza/cake deal examples retained; general-purpose promotion engine deferred |
| Shared/unique coupons | Existing shared campaign codes; unique coupon pools, quotas and customer-specific distribution deferred |
| Checkout, wallet and refunds | Existing order/payment simulation enhanced with shared loyalty rules, earning snapshots and reconciled ledger entries |
| Membership subscriptions | Deferred recurring plans and renewals; not needed to demonstrate core MOD order/reward behavior |
| Member passes and identification | Existing illustrative member pass; signed passes and identity demonstrations deferred |
| Campaigns | Existing HQ deal creation and store participation retained; no new outbound marketing launch workflow |
| Email/SMS/push consent and frequency caps | Consent visible and usable as an audience filter; no simulated marketing delivery or frequency-cap engine added |
| Journeys | Deferred event/delay automation builder and simulation clock; order-completion earning remains automatic |
| Engagement | Existing welcome/explorer bonuses and feedback; referrals, surveys-for-points, games and donations deferred |
| Merchandise | Deferred points-priced physical goods, variants and shipping |
| Multi-store operations | Existing separate manager/HQ views, pricing, stock, fulfillment and reporting retained; store rewards/recovery added |
| Fraud | Negative point balances, duplicate receipt/bonus claims, duplicate order recovery, repeated approval and refund reversal checks; dedicated fraud-case console deferred |
| Integrations | Deferred adapter simulators and retry/event consoles |
| Data and backup | Existing order CSV exports and browser persistence retained; generalized export schedules, restore and undo deferred |
| Roles and permissions | Existing persona workspaces extended with store request/HQ approval controls; configurable team permission designer deferred |
| Customer intelligence | Added explainable regular/lapsed/reward-ready groups; no churn score or lifetime-value model claimed |
| Campaign copilot | Deferred; deterministic goal-to-campaign UI would not improve the core menu/reward flow yet |
| Recovery center | Added request → review → actual member balance → observed return. Reply transmission and automated complaint intake deferred |
| Experiences marketplace | Deferred partner bookings, entitlement capacity and non-food reservations |
| Profit & experiments | Reward discount value reported honestly; contribution models, holdouts and synthetic experiments deferred until product costs are available |
| Household, pooled and cross-brand rewards | Deferred, as also excluded by the supplied Ember README |

## Source fidelity and deliberate simplifications

The screenshot supplies category names, item names, some descriptions, drink/dessert prices and some calories. It does not expose full recipes, every price, builder option rules, all allergen data or item photography.

- Visible drink/dessert/kids prices are used. Pizza, salad and garlic-bread prices are illustrative and remain editable by store.
- Existing pizza calorie figures are inherited prototype values, not verified against this screenshot. New items without visible nutrition use “Nutrition varies.”
- New recipes and selection options are prototype interpretations where the screenshot is incomplete. They are not presented as a verified MOD recipe specification.
- Existing seven product photos are retained. New items use neutral, locally created category artwork rather than misleading photos of another product. Item-specific photography is deferred.
- The six established sample stores remain. The screenshot's Overlake address, opening status and group-order control are reference context, not silently imported into all stores.
- Group ordering, curbside arrival, official nutrition lookup and full 40+ topping/finishing-sauce parity are deferred pending complete source details.
- No unrelated Ember repository or original uploaded README was modified.

## Walkthrough

1. Open Menu. Try Beverages in delivery mode, then pickup. Build a salad or a kids meal and inspect its bag details.
2. Open HQ → Loyalty & growth → Loyalty administration → Reward catalog. Create a 50-point, $10 item reward limited to Salads and Downtown Seattle.
3. Open customer Rewards, select it and order a salad. Confirm the discount and points at checkout.
4. Change the base earning rate in HQ, then complete the already-placed order. It retains its original rate.
5. Open Store manager → Rewards & recovery. Request 30 points for Alex at Seattle. The customer's balance does not change yet.
6. Open HQ → Recovery approvals. Review and approve. Customer Rewards and the member ledger now show the 30-point award.
7. Switch to Bellevue's manager workspace; Seattle's request is absent.

## Files and checks

- `catalog.js`: sample catalog, migrations, image mapping, configurable meals and staff category controls.
- `loyalty.js`: shared earning/redemption rules, member ledger, HQ UI, recovery approvals and store reward summary.
- Existing `app.js`, `journeys.js`, `operations.js`, `workspaces.js` and `experience.js` connect checkout, storefront and staff views.
- `assets/menu-*.svg`: locally authored category artwork.
- `tests/loyalty-catalog.cjs`: connected menu, rewards, recovery, rule and responsive checks.

Run the local server and browser suites as described in the main README. Tests use isolated browser contexts and do not reset the user's existing browser data.

### Verification result — 7 October 2026

All five browser suites passed: `prototype.cjs`, `operations.cjs`, `readiness.cjs`, `app-experience.cjs` and `loyalty-catalog.cjs`. JavaScript syntax checks passed for all seven application modules. The new suite checks phone/tablet/desktop widths (320, 390, 768 and 1440 pixels), all five loyalty tabs, loaded menu images, 46-item persistence, customer selection flows, earning snapshots, the daily cap, refunds, eligibility, HQ adjustments and store/HQ recovery isolation. Mobile menu and desktop reward-catalog screenshots were visually reviewed.
