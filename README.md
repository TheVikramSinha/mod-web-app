# MOD Customer App — Prototype

Customer-facing ordering prototype in plain HTML, CSS and JavaScript. No build step, no backend.

## Run

Open `index.html` in a browser, or serve the folder:

```
python3 -m http.server 8080
# then visit http://localhost:8080
```

Serving is recommended for group-order participant windows (same-browser sync uses `localStorage`).

## Files

| File | Purpose |
|---|---|
| `index.html` | App shell, live regions, script order |
| `css/styles.css` | Design system (brand red `#c4122f`, dark red `#8b0f05`, ink `#231f20`, white) and layouts |
| `js/data.js` | Configurable sample stores, menu, ingredients, offers, rewards, pricing rules |
| `js/core.js` | State, storage, scheduling, pricing (integer cents), offers, rewards, points, orders, groups, refunds |
| `js/ui.js` | Icons, pizza/food illustrations, dialogs (focus-managed), toasts, announcements |
| `js/views.js` | Screens: home, menu, cart, checkout, tracking, orders, receipt, offers, rewards, wallet, pass, account, groups, support |
| `js/builder.js` | Pizza/salad/kids/cake-pop builders, half-and-half, after-order topping editor, order setup, store-change and chat dialogs |
| `js/app.js` | Hash router, rendering, actions, forms, timers, cross-window sync, PDF invoice |
| `vendor/jspdf.umd.min.js` | Local copy of jsPDF for invoice download |
| `custom.jpg` | Home hero pizza photo |
| `mobile-app/` | iOS/Android app prototype with device preview — see `mobile-app/README.md` |

## Demo tips

- **Journey switch:** header chip (Guest / points) or Account. Not real sign-in.
- **Order timeline:** simulated, about 6 minutes from placement to completion. Topping edits allowed while “Order received”.
- **Refund request:** reviewed automatically after about 20 seconds (simulated outcome).
- **Codes:** `WELCOME20`, `PICKUP5`, `2PIZZA25`, `SWEETDEAL`, `MILEHIGH` (Denver only), `MEMBER10` (member), `SUMMER15` (expired).
- **Rewards:** receipt claim `DEMO40`; gift card `MODGIFT25`.
- **Stores:** Bellevue is out of Tristan and artichokes; West Loop is out of bacon and Greek salad; South Congress is pickup only; Union Square is paused.
- **Group order:** create a group, add people, “Open as …” opens a participant window that syncs while the host window is open.
- **Separate storage:** add `?storage=mobile` to the URL for an independent demo data set (e.g. a separate mobile-view prototype).
- **Reset:** Account → Reset all demo data.

## Boundaries

Authentication, payments, gift-card validation, email, notifications, GPS, address verification and cross-device groups are simulated or not implemented. Nutrition and tax values are samples. No admin, operations or order-stage controls are included.
