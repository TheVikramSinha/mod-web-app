# MOD Back Office — prototype

Admin back office for the MOD customer web and mobile apps: HQ, loyalty management and store workspaces. Plain HTML, CSS and JavaScript, no build step. The UI and data are simulated.

## Run

Serve the **project root**, so the back office and the customer apps share one origin:

```
python3 -m http.server 8080
# Back office:  http://localhost:8080/backend/
# Web app:      http://localhost:8080/
# Mobile app:   http://localhost:8080/mobile-app/
```

## How it connects to the customer apps

- The back office edits the same catalog the apps load (`../js/data.js`): menu, ingredients, categories, sizes and crusts, stores, offers, rewards, loyalty config and app content.
- Edits save to a **draft**. **Publish & versions** writes a numbered version to `localStorage['mod.hq.published.v1']`. On start, `js/data.js` in both apps applies the latest published version. You can roll back to any earlier version.
- **Operational changes go live immediately, without a publish.** These are pausing or resuming a store, changing prep time, and marking items or ingredients unavailable.
- Orders placed in the web or mobile app in the same browser appear in Orders, the fulfillment board and the store workspaces. They are labelled **Web app** or **Mobile app** and are read-only.

## Workspaces

| Workspace | Screens |
|---|---|
| **HQ** | Overview · Orders · Fulfillment board · Support inbox · Stores · Menu catalog (items, store availability, ingredients, categories, sizes/crusts/ordering) · App content · Publish & versions · Offers & coupons · Campaigns · Campaign results · Customers · Reports · Compare stores · Approvals · Users & roles · Audit log · Integrations · Settings |
| **Loyalty** | Program overview · Earn & program rules (with earn simulator) · Tiers · Rewards catalog · Bonus events · Segments (rule builder, live counts) · Lifecycle journeys · Loyalty campaigns · Members (profile, adjust, credit, home store, block, merge, DSAR export, delete) · Points ledger · Fraud & risk · Franchise participation · Liability & finance · Migration & launch (stealth mode) |
| **Store** | My shift · Kitchen board · Store orders · Availability · Hours & settings · Team & checklist · Guest care · Promotions (opt in/out, local promo requests) · Rewards & recovery · Store report |

## Enterprise controls

- **Roles:** Super admin, Marketing, Loyalty, Operations, Finance (approver), Store manager and Franchise owner. Each role grants specific permissions. Store roles only see their assigned stores.
- **Previewing roles:** use the account menu (top right) to switch persona.
- **Approvals (maker-checker):** these changes need a second person to approve them. Requesters can't approve their own requests. The thresholds are set in Loyalty → Earn & program rules.
  - Catalog publish, for roles without publish rights
  - Campaign launch
  - Points adjustments over the threshold
  - Refunds over the threshold
  - Store recovery over the store limits
  - Store hours changes
- **Audit log:** every change is recorded with who, when, which role and the detail.
- **Data handling:** contact details are masked for roles without PII access. Most tables export to CSV, and the full dataset exports from the account menu.
- **Search:** global search covers orders, members, menu items, offers, campaigns, stores and tickets. Press `/` to focus it.

## Files

| File | Purpose |
|---|---|
| `index.html` | Shell and script order (loads `../js/data.js` first) |
| `css/admin.css` | Design system (MOD 2026 brand: burgundy, Oswald + Barlow) |
| `js/seed.js` | Builds demo data from the shared catalog, plus seeded orders, members, tickets, campaigns, segments and journeys |
| `js/core.js` | State, persistence, roles and permissions, audit, approvals, draft/publish/rollback, metrics, segment engine |
| `js/ui.js` | Icons, data tables (sort/search/paging/bulk/CSV), dialogs, drawers, form fields, SVG charts |
| `js/app.js` | Router, navigation, global search, persona switcher, event delegation |
| `js/hq-ops.js` | Overview, orders, fulfillment, support, stores, compare, reports |
| `js/hq-catalog.js` | Menu catalog, app content, publish, offers, campaigns, results |
| `js/hq-gov.js` | Approvals, users and roles, audit, integrations, settings |
| `js/loyalty.js` | Loyalty management |
| `js/store.js` | Store workspace |

To reset the demo data, open the account menu and choose **Reset demo data**. This also clears what was published to the apps in this browser.
