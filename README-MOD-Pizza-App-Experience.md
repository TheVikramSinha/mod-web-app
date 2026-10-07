> Update, 7 October 2026: [Menu and loyalty implementation](README-MOD-Pizza-Menu-and-Loyalty-Comparison.md) supersedes earlier seven-item-menu and hard-coded-reward descriptions. Earlier audit counts are historical.

# MOD Pizza — customer app, store manager and HQ workspaces

Updated **6 October 2026**. This iteration focuses on a feature-rich, usable prototype. It keeps MOD’s `#c4122f` and `#8b0f05` branding and replaces the basic customer landing view with an app-style home and complete connected journeys.

## Open the three experiences

Run `python3 -m http.server 4173 --bind 127.0.0.1` in this directory, then open:

| Experience | Link | Designed for |
| --- | --- | --- |
| Customer app | http://127.0.0.1:4173/?v=4#home | Order, earn, find deals, redeem, reorder and track |
| Store manager | http://127.0.0.1:4173/?v=4#store/sea/today | The assigned store’s shift and guest operations |
| HQ | http://127.0.0.1:4173/?v=4#admin | Network performance, campaigns, reporting and store configuration |

**Explore workspaces** on the customer More page, or **Switch workspace** in staff views, opens the role preview selector. Other store previews use `#store/bel/today`, `#store/por/today`, `#store/aus/today`, `#store/den/today` and `#store/phx/today`.

These are intentionally different interfaces. A store manager has no all-store selector, regional report, network comparison or HQ campaign editor in their workspace. HQ retains the cross-store tools. The selector is a prototype persona switch, not an authentication screen.

## Customer app — working features

### Home and navigation

- Personalized greeting, prominent points balance, reward progress and pending earnings.
- Active-order card showing the current stage and a direct tracking link.
- Pizza-builder shortcut, direct menu/deal actions and category shortcuts.
- A saved go-to order or recent order that can be reordered into the bag at current prices.
- Five mobile destinations: **Home, Menu, Rewards, Orders, More**.
- Contextual Deals entry points on Home, Menu and More, plus desktop navigation.
- Persistent store/fulfillment context and floating bag summary when it is relevant.

### Menu, saved pizzas and addresses

- Search, category selection, vegetarian filter, favorites and per-store availability.
- Configurable pizza size, crust, sauce and toppings with current pricing.
- Optional name-and-save field inside the builder. Saved creations are available under More → My pizza creations.
- Add a saved build back to the bag, with current item and ingredient availability checked.
- Saved Home and Work examples, plus add/edit/remove address and instructions.
- Selected addresses carry into checkout without overwriting other saved locations.
- Store changes retain the bag and preview prices, fulfillment and unavailable items before acceptance.

### Deals that actually affect checkout

| Offer code | Sample behavior |
| --- | --- |
| MOD10 | 10% off food at participating stores where the local offer is enabled |
| TWOTOGETHER | $5 off when at least two pizzas are in the bag |
| PICKUP15 | 15% off a pickup food subtotal of $15 or more |
| SWEETFINISH | One free No Name Cake when a pizza and cake are in the bag, at participating stores |

- All, Pickup perks and Saved deals filters.
- Deal detail shows code, fulfillment, minimum spend and eligibility feedback.
- Save/remove a deal for later.
- **Add qualifying items** adds only missing items for the pizza-pair or pizza-and-cake bundle.
- **Use this deal** selects it and leads into ordering/review. Pickup-only deals select pickup explicitly.
- Only one campaign or points reward applies to an order; choosing one replaces the other selection.
- HQ-created campaigns appear in customer Deals and calculate a real local checkout discount.
- Paused campaigns, store participation, minimums and required items are checked again at checkout.

All rates and offers are sample MOD-concept rules, not copied Domino’s or official MOD commercial terms.

### Earn, redeem and wallet

Rewards uses four subviews: **My rewards, Earn points, Wallet, Activity**. Secondary features stay inside this destination.

| Feature | Working behavior |
| --- | --- |
| Earn on orders | 1 point per full dollar of food after merchandise discounts, awarded once when the order completes |
| Pending points | Shows earnings from the customer’s incomplete, eligible orders |
| Reward shop | $5 off at 100 points; pizza discount up to $12.49 at 175; cake at 85; delivery at 75 |
| Redeem | Points are deducted only when the eligible order is placed; upgrades remain payable for the pizza reward |
| Receipt claim | Enter `DEMO40` under Earn points to add 40 sample points; duplicate claims are rejected |
| Welcome bonus | A completed local profile can collect 15 points once |
| Pizza explorer | Three different pizzas in completed orders unlock a 25-point bonus, collectible once |
| Member pass | Illustrative barcode, member identity and balance in a dedicated view |
| Gift funds | Add sample funds or redeem `MODGIFT25` once |
| Service credit | Kept separate from gift funds and applied at checkout when selected |
| Activity | Order earnings, receipt claims, bonuses, spending, funding and refund entries |

The initial customer starts at 125 points. Claim `DEMO40`, then collect the welcome bonus to reach 180 and try the pizza reward without needing to complete several orders first.

### Ordering, scheduling, reorder and tracking

- Guest checkout with preserved form details, wallet split tender, tips and applied offer/reward.
- Points-to-earn preview before placing the order.
- ASAP or one of eight future half-hour slots, starting at least one hour ahead, shown in the browser’s local time.
- Scheduled orders retain their requested time and do not begin the accelerated journey before that time. The preview’s Next stage control deliberately starts/advances them early when testing.
- In progress / Past orders / All orders tabs with receipts, support, reorder and Save as my go-to.
- A go-to order is promoted on Home; reordering adds a reviewed bag rather than placing an order automatically.
- Animated route, stage timeline, ETA, pause/advance controls and local delivery-partner chat.
- Rate a completed order and leave a comment. Feedback appears in the corresponding store’s Guest care view.

Scheduling is a prototype journey using local time slots. It does not claim live kitchen capacity or store-timezone/holiday validation. The member barcode and delivery location are illustrative. Demo payments do not collect money.

## Store manager — the assigned store’s work

| View | Manager capabilities |
| --- | --- |
| My shift | Today’s own-store orders/sales, kitchen and handoff counts, next tickets, shift tasks and guest-care count |
| Kitchen board | Own-store preparation queues, delay labels, ticket detail and stage advancement |
| Store orders | Own-store search, status filtering, details, receipts and reviewed cancellation |
| Availability | Toggle menu items and individual ingredients for this store only |
| Team & checklist | Change team status between On shift, On break and Off shift; complete persistent shift tasks |
| Guest care | Store-linked cases, case resolution and completed-order customer feedback |
| Store settings | Own-store hours, manager, fulfillment options, preparation estimate and other store settings |

Quick controls pause/resume new orders and add five minutes to the quoted prep time. Ingredient changes are reflected in the customer builder and revalidated before adding/ordering; nothing is silently substituted. Headquarters filter choices are restored when leaving a store preview and returning to HQ.

If an existing browser’s sample history has no active orders for the current day, the first visit to a store workspace creates three clearly sample shift tickets for that store. This keeps the shift preview usable as the saved sample data ages, without replacing existing orders or customer balances.

## HQ — network decisions and campaigns

- Six-store network overview, store drill-down, comparisons and CSV exports.
- Region, store, date and fulfillment reporting filters.
- Existing order, support, customer-credit, menu and store-setting controls.
- **Guest insights:** popular products, channel mix, campaign order count, reward redemptions and customers with repeat orders within the selected scope.
- **Campaigns:** create/edit percentage or dollar offers; configure code, title, description, value, minimum spend, fulfillment and participating stores; activate/pause.
- Existing two-pizza and cake-bundle offers have editable participation and terms while retaining their configured bundle type.
- Campaign use and attributed food-sales metrics draw from sample/placed orders carrying the campaign ID. These are descriptive attribution, not proof of incremental campaign impact.
- Campaign views filter by selected participating store; per-campaign usage follows that store selection. Other configuration settings remain current rather than historical.
- Open an individual manager workspace from a store’s detail dialog or the workspace selector.

## Research translated into prototype decisions

The official Domino’s USA app description emphasizes ordering, deals/rewards and tracking, including native Live Activities. This informed a clear customer home, a dedicated rewards experience and visible active-order progress; no native Live Activity implementation is claimed here. [Domino’s USA app listing](https://apps.apple.com/us/app/dominos-pizza-usa/id436491861)

Domino’s separates its deal catalog from its member rewards experience. The prototype similarly lets customers browse deals, then see eligibility and the applied benefit through checkout, while points remain in a separate rewards balance. The commercial rates in this prototype are invented sample values. [Domino’s deals](https://www.dominos.com/deals) · [Domino’s rewards](https://www.dominos.com/my-deals-and-rewards)

Domino’s Tracker documentation informed the visible progression from acceptance through preparation and fulfillment. The existing moving courier view is retained as an accelerated local illustration. [Domino’s Tracker fact sheet](https://biz.dominos.com/content/files/Dominos-Tracker-Fact-Sheet.pdf)

## UI organization

- Home surfaces the current order, points and next action; it does not display every account setting.
- Rewards, earning, wallet and activity use subviews, not four new bottom tabs.
- Saved addresses/builds and profile tools live in More or the relevant builder.
- Deals use simple cards with details disclosed on demand.
- Order help, feedback and reorder live with the order.
- A manager gets shift-specific actions, while HQ gets reporting and campaign configuration.
- MOD colors and typography remain consistent, but the layout adapts to phone, tablet and desktop instead of shrinking the desktop sidebar onto the customer’s phone.

## Try the connected demo

1. Open the customer app, then Rewards → Earn points. Claim `DEMO40` and the welcome bonus.
2. Redeem the pizza reward, build a pizza and optionally save it with a name.
3. Choose a future time or ASAP, place the order and use Next stage to explore tracking and completion.
4. Open Past orders, save it as your go-to and rate it. Check Home and the store’s Guest care page.
5. Open Deals → Better together → Add qualifying items. Check the $5 discount in the bag.
6. Switch to HQ → Campaigns. Create a percentage offer for one store; return to the customer app to apply it.
7. Switch to that store’s manager view. Mark an ingredient unavailable, change a team member’s shift status, and complete a checklist item.
8. Return to the customer builder to see the ingredient change. Other stores retain their own availability.

## Code and verification

New modules:

- `journeys.js`: app home, customer chrome, reward/earn/wallet tabs, deals, receipt claims, bonuses, saved builds/addresses, scheduling fields and feedback.
- `workspaces.js`: persona picker, store manager workspace, shift operations, HQ campaign editor and guest insights.
- `app-experience.css`: app-style responsive layouts and workspace styling.

Existing shared ordering, tracking, money arithmetic and cross-tab persistence remain in `app.js`, `operations.js` and `experience.js`. State extensions migrate existing local data without resetting it.

`tests/app-experience.cjs` covers earning/redemption, duplicate claims, bonus collection, saved builds, scheduling, deal bundles, HQ campaign use and store participation, customer ratings reaching only the matching store, persona-specific UI, store availability isolation, team/checklist changes, regional filters, address selection and responsive screens. The three existing suites retain the core ordering, wallet/refund, tracking, price-review, support and multi-store checks.

Use Chrome with Playwright available, and set `NODE_PATH` when using a shared dependency directory:

```sh
node --check journeys.js
node --check workspaces.js
node tests/prototype.cjs
node tests/operations.cjs
node tests/readiness.cjs
node tests/app-experience.cjs
```

The current focus is prototype completeness and usability. The earlier enterprise-readiness audit is retained as background, not as a reason to delay these prototype features.

Verification on 6 October 2026: all four browser suites passed. The new experience suite also checked 19 screens at 320, 390, 768, 1024 and 1440 pixels, with no horizontal page overflow or browser script errors.
