/* MOD Customer Prototype — state, persistence, scheduling, pricing, offers, rewards and order lifecycle.
   No backend: everything is simulated in browser-local storage. Money is integer cents. */
(function () {
  'use strict';
  const { CONFIG, STORES, INGREDIENTS, PRODUCTS, OFFERS, REWARDS, KIDS_DRINKS, CAKEPOP_FLAVORS, SAMPLE_RECEIPTS } = window.MOD_DATA;

  const ING = Object.fromEntries(INGREDIENTS.map(i => [i.id, i]));
  const PROD = Object.fromEntries(PRODUCTS.map(p => [p.id, p]));
  const STORE = Object.fromEntries(STORES.map(s => [s.id, s]));
  const OFFER = Object.fromEntries(OFFERS.map(o => [o.id, o]));
  const REWARD = Object.fromEntries(REWARDS.map(r => [r.id, r]));
  const SIZE = Object.fromEntries(CONFIG.sizes.map(s => [s.id, s]));
  const CRUST = Object.fromEntries(CONFIG.crusts.map(s => [s.id, s]));

  const clone = (o) => (o === undefined ? undefined : JSON.parse(JSON.stringify(o)));
  const uid = (p = '') => p + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
  const digits = (n) => String(Math.floor(Math.random() * Math.pow(10, n))).padStart(n, '0');

  /* ---------------- Storage (safe) ---------------- */
  const PREFIX = window.MOD_STORAGE_PREFIX || ((new URLSearchParams(location.search).get('storage') === 'mobile') ? 'modproto.mobile.v1.' : 'modproto.v1.');
  const memory = {};
  let storageOK = true;
  try { localStorage.setItem(PREFIX + '__t', '1'); localStorage.removeItem(PREFIX + '__t'); } catch (e) { storageOK = false; }
  function load(key, fallback) {
    if (storageOK) {
      try { const raw = localStorage.getItem(PREFIX + key); if (raw) return JSON.parse(raw); } catch (e) { /* ignore */ }
    } else if (key in memory) return clone(memory[key]);
    return typeof fallback === 'function' ? fallback() : clone(fallback);
  }
  function save(key, val) {
    memory[key] = clone(val);
    if (!storageOK) return;
    try { localStorage.setItem(PREFIX + key, JSON.stringify(val)); } catch (e) { storageOK = false; }
  }

  /* ---------------- Defaults ---------------- */
  const defaultShared = () => ({
    journey: 'guest', storeId: 's1', mode: 'pickup', pickupMethod: 'instore', dropoff: 'door', otp: null, searchLoc: null,
    schedule: { type: 'asap', slot: null },
    cart: { lines: [], couponId: null, rewardId: null },
    tip: { kind: 'pct', value: 18, custom: 0 },
    pay: { method: 'card', useCredit: false, useGift: false },
    parked: null, groupCheckout: null, draft: {}
  });
  const emptyJourney = () => ({
    profile: { name: '', email: '', phone: '', birthday: '', marketing: false },
    addresses: [], selectedAddressId: null, favorites: [], savedPizzas: [], savedOffers: [], assignedOffers: [],
    orders: [], goTo: null, activity: [], points: 0, lifetime: 0, wallet: { gift: 0, credit: 0 }, claims: {}, enrolled: false
  });
  const defaultGuest = () => emptyJourney();
  function defaultMember() {
    const j = emptyJourney();
    j.profile = { name: 'Jordan Rivera', email: 'jordan.rivera@example.com', phone: '(206) 555-0142', birthday: '', marketing: false };
    j.memberId = '7730 4821 0093';
    j.points = 1240; j.lifetime = 3100;
    j.wallet = { gift: 2500, credit: 500 };
    j.addresses = [
      { id: 'a1', label: 'Home', line: '415 E Pine St, Apt 3B, Seattle, WA 98122', instructions: 'Buzz 3B. Leave at the door.' },
      { id: 'a2', label: 'Work', line: '1201 2nd Ave, Floor 9, Seattle, WA 98101', instructions: 'Check in at the front desk.' }
    ];
    j.selectedAddressId = 'a1';
    j.favorites = ['p-maddog', 'x-nonamecake'];
    j.savedOffers = ['o-member'];
    j.assignedOffers = ['o-member'];
    j.savedPizzas = [{ id: 'sp1', name: 'Friday Night Spicy', productId: 'p-cyo', savedAt: Date.now() - 864e5 * 9,
      config: { size: 'regular', crust: 'original', split: false, whole: { sauce: { id: 'buffalo-sauce', amt: 'regular', place: 'whole' },
        items: [{ id: 'mozzarella', amt: 'regular', place: 'whole' }, { id: 'pepperoni', amt: 'extra', place: 'whole' }, { id: 'jalapeno', amt: 'regular', place: 'right' }, { id: 'red-onion', amt: 'light', place: 'whole' }] }, halves: null } }];
    j.activity = [
      { id: uid('a'), at: Date.now() - 864e5 * 40, type: 'bonus', text: 'Welcome bonus (sample profile)', points: 200 },
      { id: uid('a'), at: Date.now() - 864e5 * 6, type: 'wallet', text: 'Gift card added to wallet (sample)', amount: 2500 },
      { id: uid('a'), at: Date.now() - 864e5 * 5, type: 'credit', text: 'Service credit from support (sample)', amount: 500 }
    ];
    j.enrolled = false; // sample rewards profile until enrollment is completed
    return j;
  }

  /* ---------------- State ---------------- */
  const S = {
    shared: load('shared', defaultShared),
    journeys: { guest: load('guest', defaultGuest), member: load('member', null) },
    groups: load('groups', []),
    listeners: new Set()
  };

  const J = () => S.journeys[S.shared.journey];
  const isMember = () => S.shared.journey === 'member';
  const curStore = () => STORE[S.shared.storeId] || STORES[0];

  function persist(which) {
    const all = !which;
    if (all || which === 'shared') save('shared', S.shared);
    if (all || which === 'journey') { save('guest', S.journeys.guest); save('member', S.journeys.member); }
    if (all || which === 'groups') save('groups', S.groups);
  }
  function commit(which) { persist(which); S.listeners.forEach(fn => { try { fn(which); } catch (e) { console.error(e); } }); }
  function reloadFromStorage(key) {
    if (key === 'shared') S.shared = Object.assign(defaultShared(), load('shared', defaultShared));
    if (key === 'guest') S.journeys.guest = Object.assign(emptyJourney(), load('guest', defaultGuest));
    if (key === 'member') { const m = load('member', null); if (m) S.journeys.member = Object.assign(emptyJourney(), m); }
    if (key === 'groups') S.groups = load('groups', []);
  }

  /* ---------------- Formatting ---------------- */
  const money = (c) => (c < 0 ? '−' : '') + '$' + (Math.abs(c) / 100).toFixed(2);
  function tzParts(epoch, tz) {
    const f = new Intl.DateTimeFormat('en-US', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', weekday: 'short' });
    const p = {}; f.formatToParts(new Date(epoch)).forEach(x => { p[x.type] = x.value; });
    return { y: +p.year, m: +p.month, d: +p.day, h: +p.hour % 24, mi: +p.minute, wd: p.weekday };
  }
  function zonedToEpoch(y, m, d, h, mi, tz) {
    const guess = Date.UTC(y, m - 1, d, h, mi);
    let e = guess;
    for (let i = 0; i < 2; i++) {
      const p = tzParts(e, tz);
      const off = Date.UTC(p.y, p.m - 1, p.d, p.h, p.mi) - e;
      e = guess - off;
    }
    return e;
  }
  function fmtTime(epoch, tz, opts = {}) {
    const o = Object.assign({ hour: 'numeric', minute: '2-digit' }, opts.date ? { weekday: 'short', month: 'short', day: 'numeric' } : {}, opts.tzName === false ? {} : { timeZoneName: 'short' });
    return new Intl.DateTimeFormat('en-US', Object.assign({ timeZone: tz }, o)).format(new Date(epoch));
  }
  const fmtDate = (epoch, tz) => new Intl.DateTimeFormat('en-US', { timeZone: tz, month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(epoch));
  const fmtMins = (m) => { const h = Math.floor(m / 60) % 24, mi = m % 60; const ap = h >= 12 ? 'PM' : 'AM'; const hh = h % 12 || 12; return `${hh}:${String(mi).padStart(2, '0')} ${ap}`; };
  const hoursText = (s) => `${fmtMins(s.open)} – ${s.close >= 1440 ? '12:00 AM' : fmtMins(s.close)}`;

  /* ---------------- Store & scheduling ---------------- */
  function localMinutes(store, now = Date.now()) { const p = tzParts(now, store.tz); return p.h * 60 + p.mi; }
  function leadMin(store, mode) { return store.prepMin + (mode === 'delivery' ? CONFIG.deliveryLeadMin : 0); }
  function storeStatus(store, mode, now = Date.now()) {
    if (!store.accepting) return { ok: false, asap: false, reason: store.pausedReason || 'Ordering is paused.' };
    if (mode && !store.modes.includes(mode)) return { ok: false, asap: false, reason: `${mode === 'delivery' ? 'Delivery' : 'Pickup'} isn’t offered at this store.` };
    const lm = localMinutes(store, now);
    const lead = leadMin(store, mode || 'pickup');
    const asap = lm >= store.open && lm + lead <= store.close - CONFIG.closingBufferMin;
    return { ok: true, asap, open: lm >= store.open && lm < store.close, reason: asap ? '' : 'Closed for ASAP orders right now — schedule for later.' };
  }
  function slotsFor(store, mode, now = Date.now()) {
    const days = [];
    if (!store.accepting || !store.modes.includes(mode)) return days;
    const lead = leadMin(store, mode);
    const step = CONFIG.slotStepMin;
    for (let i = 0; i < CONFIG.slotDays; i++) {
      const p = tzParts(now + i * 864e5, store.tz);
      const slots = [];
      const first = Math.ceil((store.open + lead) / step) * step;
      const last = store.close - CONFIG.closingBufferMin;
      for (let t = first; t <= last; t += step) {
        const e = zonedToEpoch(p.y, p.m, p.d, Math.floor(t / 60), t % 60, store.tz);
        if (e >= now + lead * 60000) slots.push(e);
      }
      days.push({ key: `${p.y}-${p.m}-${p.d}`, label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : `${p.wd} ${p.m}/${p.d}`, slots });
    }
    return days;
  }
  function slotValid(store, mode, slot, now = Date.now()) {
    if (!slot) return false;
    return slotsFor(store, mode, now).some(d => d.slots.includes(slot));
  }
  function scheduleText(sched, store) {
    if (!sched || sched.type !== 'later' || !sched.slot) return 'ASAP';
    return fmtTime(sched.slot, store.tz, { date: true });
  }

  /* ---------------- Products & recipes ---------------- */
  const isPublished = (p) => p && p.published !== false;
  function productIssue(p, store, mode) {
    if (!p || !isPublished(p)) return 'No longer on the menu';
    if (p.available === false) return 'Sold out';
    if (store.outProducts.includes(p.id)) return `Unavailable at ${store.name}`;
    if (p.pickupOnly && mode === 'delivery') return 'Pickup only — not available for delivery';
    return '';
  }
  const ingOut = (id, store) => store.outIngredients.includes(id);
  const basePrice = (p, store) => Math.round(p.price * (store.priceFactor || 1));

  function defaultPizzaConfig(p) {
    return { size: 'regular', crust: 'original', split: false,
      whole: { sauce: { id: p.recipe.sauce, amt: 'regular', place: 'whole' }, items: p.recipe.items.map(id => ({ id, amt: 'regular', place: 'whole' })) },
      halves: null };
  }
  function halvesFromWhole(whole) {
    const mk = (side) => ({
      sauce: { id: whole.sauce.id, amt: whole.sauce.id === 'no-sauce' ? 'regular' : whole.sauce.amt },
      items: whole.items.filter(i => i.place === 'whole' || i.place === side).map(i => ({ id: i.id, amt: i.amt }))
    });
    return { left: mk('left'), right: mk('right') };
  }
  function defaultConfig(p) {
    if (!p.builder) return null;
    if (p.builder === 'pizza') return defaultPizzaConfig(p);
    if (p.builder === 'salad') return { greens: p.recipe.greens, dressing: p.recipe.dressing, toppings: p.recipe.toppings.slice() };
    if (p.builder === 'kids') return { topping: 'cheese', drink: 'apple-juice' };
    if (p.builder === 'cakepop') return { f1: 'pink-vanilla', f2: 'pumpkin-spice' };
    return null;
  }
  function pizzaIngredients(cfg) {
    if (!cfg) return [];
    if (cfg.split && cfg.halves) {
      const ids = new Set();
      ['left', 'right'].forEach(s => { ids.add(cfg.halves[s].sauce.id); cfg.halves[s].items.forEach(i => ids.add(i.id)); });
      return [...ids];
    }
    return [cfg.whole.sauce.id, ...cfg.whole.items.map(i => i.id)];
  }
  function lineIngredients(line) {
    const p = PROD[line.productId]; const c = line.config;
    if (!p || !c) return [];
    if (p.builder === 'pizza') return pizzaIngredients(c);
    if (p.builder === 'salad') return [c.greens, c.dressing, ...c.toppings];
    if (p.builder === 'kids') return ['tomato-sauce', 'mozzarella', ...(c.topping !== 'cheese' ? [c.topping] : [])];
    return [];
  }
  function dietOf(line) {
    const p = PROD[line.productId];
    if (!p.builder || p.builder === 'cakepop') return p.diet;
    const ids = lineIngredients(line);
    let diet = 'vegan';
    if (p.builder === 'kids') { const d = KIDS_DRINKS.find(x => x.id === line.config.drink); diet = 'veg'; if (d && d.diet === 'nonveg') diet = 'nonveg'; }
    for (const id of ids) { const i = ING[id]; if (!i) continue; if (i.diet === 'nonveg') return 'nonveg'; if (i.diet === 'veg') diet = 'veg'; }
    return diet;
  }
  const countToppings = (items) => items.filter(i => ING[i.id] && (ING[i.id].type === 'meat' || ING[i.id].type === 'veggie')).length;

  function configIssues(p, cfg, store) {
    const issues = [];
    if (!cfg) return issues;
    if (p.builder === 'pizza') {
      const out = pizzaIngredients(cfg).filter(id => ingOut(id, store));
      if (out.length) issues.push(`${out.map(id => ING[id].name).join(', ')} unavailable at ${store.name}`);
      if (p.toppingLimit != null) {
        if (cfg.split) issues.push('Half-and-half isn’t available for this pizza');
        else if (countToppings(cfg.whole.items) > p.toppingLimit) issues.push(`Limit ${p.toppingLimit} non-cheese topping`);
      }
      if (cfg.split && !p.splitAllowed) issues.push('Half-and-half is only available on Create Your Own');
    } else if (p.builder === 'salad') {
      const out = [cfg.greens, cfg.dressing, ...cfg.toppings].filter(id => ingOut(id, store));
      if (out.length) issues.push(`${out.map(id => ING[id].name).join(', ')} unavailable at ${store.name}`);
    } else if (p.builder === 'kids') {
      if (cfg.topping !== 'cheese' && ingOut(cfg.topping, store)) issues.push(`${ING[cfg.topping].name} unavailable at ${store.name}`);
    }
    return issues;
  }
  function unitPrice(line, store) {
    const p = PROD[line.productId];
    let u = basePrice(p, store);
    if (p.builder === 'pizza' && line.config) u += (SIZE[line.config.size] || SIZE.regular).adj + (CRUST[line.config.crust] || CRUST.original).adj;
    return Math.max(0, u);
  }
  function lineIssues(line, store, mode) {
    const p = PROD[line.productId];
    const a = productIssue(p, store, mode);
    const out = a ? [a] : [];
    return out.concat(p ? configIssues(p, line.config, store) : []);
  }

  /* -------- Descriptions -------- */
  const AMT = { light: 'Light', regular: 'Regular', extra: 'Extra' };
  const PLACE = { left: 'Left ½', whole: 'Whole', right: 'Right ½' };
  function mods(amt, place) { const a = []; if (amt && amt !== 'regular') a.push(AMT[amt]); if (place && place !== 'whole') a.push(PLACE[place]); return a.length ? ` (${a.join(', ')})` : ''; }
  function describeHalf(h) {
    const parts = [];
    parts.push(h.sauce.id === 'no-sauce' ? 'No sauce' : ING[h.sauce.id].name + mods(h.sauce.amt));
    if (!h.items.length) parts.push('no cheese or toppings');
    h.items.forEach(i => parts.push(ING[i.id].name + mods(i.amt)));
    return parts.join(' · ');
  }
  function describe(line) {
    const p = PROD[line.productId]; const c = line.config; const out = [];
    if (!p || !c) return out;
    if (p.builder === 'pizza') {
      const sz = SIZE[c.size], cr = CRUST[c.crust];
      if (c.size !== 'regular' || c.crust !== 'original') out.push(`${sz.name} · ${cr.name} crust`);
      if (c.split && c.halves) {
        out.push('Half & half');
        out.push('Left ½: ' + describeHalf(c.halves.left));
        out.push('Right ½: ' + describeHalf(c.halves.right));
        return out;
      }
      const w = c.whole; const def = p.recipe;
      if (w.sauce.id !== def.sauce) out.push(w.sauce.id === 'no-sauce' ? 'No sauce' : `Sauce: ${ING[w.sauce.id].name}${mods(w.sauce.amt, w.sauce.place)}`);
      else if (w.sauce.id !== 'no-sauce' && (w.sauce.amt !== 'regular' || w.sauce.place !== 'whole')) out.push(`${ING[w.sauce.id].name} sauce${mods(w.sauce.amt, w.sauce.place)}`);
      const ids = w.items.map(i => i.id);
      def.items.filter(id => !ids.includes(id)).forEach(id => out.push(`No ${ING[id].name}`));
      w.items.forEach(i => {
        if (!def.items.includes(i.id)) out.push(`Add ${ING[i.id].name}${mods(i.amt, i.place)}`);
        else if (i.amt !== 'regular' || i.place !== 'whole') out.push(`${ING[i.id].name}${mods(i.amt, i.place)}`);
      });
    } else if (p.builder === 'salad') {
      const d = p.recipe;
      if (c.greens !== d.greens) out.push(`Greens: ${ING[c.greens].name}`);
      if (c.dressing !== d.dressing) out.push(c.dressing === 'no-dressing' ? 'No dressing' : `Dressing: ${ING[c.dressing].name}`);
      d.toppings.filter(t => !c.toppings.includes(t)).forEach(t => out.push(`No ${ING[t].name}`));
      c.toppings.filter(t => !d.toppings.includes(t)).forEach(t => out.push(`Add ${ING[t].name}`));
    } else if (p.builder === 'kids') {
      out.push(c.topping === 'cheese' ? 'Cheese only' : ING[c.topping].name);
      out.push((KIDS_DRINKS.find(d => d.id === c.drink) || {}).name);
    } else if (p.builder === 'cakepop') {
      const f = (id) => (CAKEPOP_FLAVORS.find(x => x.id === id) || {}).name;
      out.push(`${f(c.f1)} + ${f(c.f2)}`);
    }
    return out;
  }
  // Full recipe (for invoices): every ingredient with portions/placement.
  function fullRecipe(line) {
    const p = PROD[line.productId]; const c = line.config;
    if (!p || !c || p.builder !== 'pizza') return describe(line);
    const sz = SIZE[c.size], cr = CRUST[c.crust];
    const head = `${sz.name} · ${cr.name} crust`;
    if (c.split && c.halves) return [head, 'Left ½: ' + describeHalf(c.halves.left), 'Right ½: ' + describeHalf(c.halves.right)];
    const w = c.whole;
    const parts = [w.sauce.id === 'no-sauce' ? 'No sauce' : ING[w.sauce.id].name + ' sauce' + mods(w.sauce.amt, w.sauce.place)];
    w.items.forEach(i => parts.push(ING[i.id].name + mods(i.amt, i.place)));
    return [head, parts.join(' · ')];
  }

  /* ---------------- Points, tiers ---------------- */
  function tierOf(j) {
    if (!CONFIG.tiersEnabled) return CONFIG.tiers[0];
    let t = CONFIG.tiers[0];
    CONFIG.tiers.forEach(x => { if ((j.lifetime || 0) >= x.min) t = x; });
    return t;
  }
  function nextTier(j) { const t = tierOf(j); const i = CONFIG.tiers.indexOf(t); return CONFIG.tiers[i + 1] || null; }
  const sameDay = (a, b) => new Date(a).toDateString() === new Date(b).toDateString();
  function pointsToday(j, now = Date.now()) {
    let n = 0;
    j.activity.forEach(a => { if (a.type === 'earn' && sameDay(a.at, now)) n += a.points; });
    j.orders.forEach(o => { if (!o.canceled && !o.pointsAwarded && o.pointsEstimate && sameDay(o.createdAt, now)) n += o.pointsEstimate; });
    return n;
  }
  function pendingPoints(j) { return j.orders.filter(o => !o.canceled && !o.pointsAwarded).reduce((s, o) => s + (o.pointsEstimate || 0), 0); }
  function estimatePoints(j, merch) {
    const t = tierOf(j);
    const raw = Math.floor(Math.floor(merch / 100) * CONFIG.pointsPerDollar * t.mult);
    const room = Math.max(0, CONFIG.dailyPointCap - pointsToday(j));
    return { points: Math.min(raw, room), raw, capped: raw > room, rule: { rate: CONFIG.pointsPerDollar, mult: t.mult, tier: t.name, cap: CONFIG.dailyPointCap } };
  }

  /* ---------------- Offers & rewards ---------------- */
  const PIZZA = (l) => PROD[l.productId] && PROD[l.productId].cat === 'pizzas';
  const DESSERT = (l) => PROD[l.productId] && PROD[l.productId].cat === 'desserts';
  function unitsOf(priced, pred) { const u = []; priced.forEach(x => { if (pred(x.line)) for (let i = 0; i < x.line.qty; i++) u.push(x.unit); }); return u.sort((a, b) => b - a); }
  function couponUses(j, offerId) { return j.orders.filter(o => o.couponId === offerId && !o.canceled).length; }
  function rewardUses(j, rewardId) { return j.orders.filter(o => o.reward && o.reward.id === rewardId && !o.canceled).length; }

  function evalOffer(offer, ctx) {
    const { j, store, mode, priced, subtotal, now = Date.now(), journey } = ctx;
    const fail = (reason, extra = {}) => Object.assign({ ok: false, reason, discount: 0 }, extra);
    if (!offer) return fail('Code not recognised');
    if (offer.audience === 'member' && (journey !== 'member' || !j.assignedOffers.includes(offer.id))) return fail('This coupon is assigned to a member account');
    if (now < offer.start) return fail('This offer hasn’t started yet');
    if (now > offer.end) return fail('This offer has expired');
    if (offer.stores && !offer.stores.includes(store.id)) return fail(`Not valid at ${store.name} — participating stores only`);
    if (!offer.modes.includes(mode)) return fail(`Valid for ${offer.modes.join(' / ')} orders only`);
    if (couponUses(j, offer.id) >= offer.limit) return fail('You’ve reached the usage limit for this offer');
    if (subtotal < offer.minSpend) return fail(`Add ${money(offer.minSpend - subtotal)} more food to reach the ${money(offer.minSpend)} minimum`, { needMore: offer.minSpend - subtotal });
    let discount = 0;
    if (offer.kind === 'pct') discount = Math.min(Math.round(subtotal * offer.value / 100), offer.maxDiscount || Infinity);
    else if (offer.kind === 'fixed') discount = offer.value;
    else if (offer.kind === 'twoPizza') {
      const u = unitsOf(priced, PIZZA);
      if (u.length < 2) return fail(`Add ${2 - u.length} more pizza${u.length === 1 ? '' : 's'} to use this deal`, { needItems: 'twoPizza' });
      discount = Math.max(0, u[0] + u[1] - offer.value);
      if (!discount) return fail('Your two pizzas already cost $25 or less');
    } else if (offer.kind === 'pizzaDessert') {
      const pz = unitsOf(priced, PIZZA), ds = unitsOf(priced, DESSERT);
      if (!pz.length || !ds.length) return fail(`Add ${!pz.length ? 'a pizza' : ''}${!pz.length && !ds.length ? ' and ' : ''}${!ds.length ? 'a dessert' : ''} to use this deal`, { needItems: 'pizzaDessert' });
      discount = Math.min(ds[ds.length - 1], offer.value);
    }
    return { ok: true, discount: Math.min(discount, subtotal), reason: '' };
  }
  function evalReward(r, ctx) {
    const { j, store, mode, priced, subtotal, now = Date.now(), journey } = ctx;
    const fail = (reason) => ({ ok: false, reason, discount: 0 });
    if (!r) return fail('Reward not found');
    if (journey !== 'member') return fail('Rewards are for members — switch to the sample member journey');
    if (j.points < r.cost) return fail(`You need ${(r.cost - j.points).toLocaleString()} more points`);
    if (r.tier) { const rank = CONFIG.tiers.findIndex(t => t.id === r.tier); if (CONFIG.tiers.indexOf(tierOf(j)) < rank) return fail(`${CONFIG.tiers[rank].name} tier required`); }
    if (now < r.start || now > r.end) return fail('This reward isn’t currently available');
    if (r.stores && !r.stores.includes(store.id)) return fail(`Not valid at ${store.name}`);
    if (r.limit != null && rewardUses(j, r.id) >= r.limit) return fail('Usage limit reached for this reward');
    if (subtotal < r.minSpend) return fail(`Minimum food spend ${money(r.minSpend)}`);
    let discount = 0, freeDelivery = false;
    if (r.kind === 'orderOff') discount = r.value;
    else if (r.kind === 'delivery') { if (mode !== 'delivery') return fail('Delivery orders only'); freeDelivery = true; }
    else if (r.kind === 'dessert') { const d = unitsOf(priced, DESSERT); if (!d.length) return fail('Add a dessert to use this reward'); discount = Math.min(d[d.length - 1], r.value); }
    else if (r.kind === 'pizza') { const p = unitsOf(priced, PIZZA); if (!p.length) return fail('Add a pizza to use this reward'); discount = Math.min(p[0], r.value); }
    return { ok: true, discount: Math.min(discount, subtotal), freeDelivery, reason: '' };
  }

  /* ---------------- Quote ---------------- */
  function quote(o = {}) {
    const sh = S.shared;
    const journey = o.journey || sh.journey;
    const j = S.journeys[journey];
    const store = STORE[o.storeId || sh.storeId];
    const mode = o.mode || sh.mode;
    const lines = o.lines || sh.cart.lines;
    const couponId = o.couponId !== undefined ? o.couponId : sh.cart.couponId;
    const rewardId = o.rewardId !== undefined ? o.rewardId : sh.cart.rewardId;
    const tip = o.tip || sh.tip; const pay = o.pay || sh.pay;
    const priced = lines.map(line => { const unit = unitPrice(line, store); return { line, unit, total: unit * line.qty, issues: lineIssues(line, store, mode) }; });
    const subtotal = priced.reduce((s, x) => s + x.total, 0);
    const ctx = { j, store, mode, priced, subtotal, journey };
    let discount = 0, discountLabel = '', freeDelivery = false, couponEval = null, rewardEval = null;
    if (couponId) { couponEval = evalOffer(OFFER[couponId], ctx); if (couponEval.ok) { discount = couponEval.discount; discountLabel = OFFER[couponId].code; } }
    else if (rewardId) { rewardEval = evalReward(REWARD[rewardId], ctx); if (rewardEval.ok) { discount = rewardEval.discount; freeDelivery = rewardEval.freeDelivery; discountLabel = REWARD[rewardId].name; } }
    const foodAfter = Math.max(0, subtotal - discount);
    const baseDelivery = mode === 'delivery' ? (store.deliveryFee || 0) : 0;
    const deliveryFee = freeDelivery ? 0 : baseDelivery;
    const tax = Math.round(foodAfter * CONFIG.taxRate);
    let tipAmt = 0;
    if (tip.kind === 'pct') tipAmt = Math.round(foodAfter * tip.value / 100);
    else tipAmt = Math.max(0, Math.round(tip.custom || 0));
    const total = foodAfter + deliveryFee + tax + tipAmt;
    // tender allocation: service credit first, then gift funds, then other method
    let credit = 0, gift = 0, other = total, shortfall = 0;
    if (journey === 'member') {
      if (pay.useCredit) credit = Math.min(j.wallet.credit, total);
      const rest = total - credit;
      if (pay.method === 'wallet') { gift = Math.min(j.wallet.gift, rest); shortfall = rest - gift; other = 0; }
      else if (pay.useGift) { gift = Math.min(j.wallet.gift, rest); other = rest - gift; }
      else other = rest;
    }
    const pts = journey === 'member' ? estimatePoints(j, foodAfter) : { points: 0, raw: 0, capped: false, rule: null };
    return { store, mode, priced, subtotal, discount, discountLabel, freeDelivery, baseDelivery, couponEval, rewardEval, foodAfter, deliveryFee, tax, tipAmt, total, credit, gift, other, shortfall, points: pts, journey };
  }

  /* ---------------- Cart ops ---------------- */
  function sameConfig(a, b) { return JSON.stringify(a || null) === JSON.stringify(b || null); }
  function addToCart(productId, config, qty = 1, extra = {}) {
    const lines = S.shared.cart.lines;
    const existing = lines.find(l => l.productId === productId && sameConfig(l.config, config) && !l.participant && !l.locked && !extra.note);
    if (existing) existing.qty = Math.min(20, existing.qty + qty);
    else lines.push(Object.assign({ uid: uid('l'), productId, config: clone(config), qty }, extra));
    commit('shared');
  }
  function updateLine(uidv, patch) { const l = S.shared.cart.lines.find(x => x.uid === uidv); if (l && !l.locked) { Object.assign(l, clone(patch)); commit('shared'); } return l; }
  function removeLine(uidv) { const lines = S.shared.cart.lines; const i = lines.findIndex(x => x.uid === uidv); if (i > -1 && !lines[i].locked) { lines.splice(i, 1); commit('shared'); } }
  function setQty(uidv, q) { const l = S.shared.cart.lines.find(x => x.uid === uidv); if (!l || l.locked) return; if (q <= 0) return removeLine(uidv); l.qty = Math.min(20, q); commit('shared'); }
  const cartCount = () => S.shared.cart.lines.reduce((s, l) => s + l.qty, 0);
  function suggestion() {
    const store = curStore(), mode = S.shared.mode;
    const inCart = new Set(S.shared.cart.lines.map(l => l.productId));
    const cats = new Set(S.shared.cart.lines.map(l => PROD[l.productId] && PROD[l.productId].cat));
    const order = [];
    if (!cats.has('desserts')) order.push('x-nonamecake', 'x-cookie', 'x-cinnamon');
    if (!cats.has('sides')) order.push('d-garlic', 'd-cheesy');
    if (!cats.has('beverages')) order.push('b-lemonade', 'b-tea', 'b-rootbeer');
    order.push('x-cookie', 'b-water', 'd-garlic');
    if (!S.shared.cart.lines.length) return null;
    for (const id of order) { const p = PROD[id]; if (!inCart.has(id) && !productIssue(p, store, mode) && !p.builder) return p; }
    return null;
  }

  /* ---------------- Store / mode / schedule changes ---------------- */
  function previewStoreChange(newId) {
    const from = curStore(), to = STORE[newId], mode = S.shared.mode;
    const newMode = to.modes.includes(mode) ? mode : to.modes[0];
    const rows = S.shared.cart.lines.map(l => ({ line: l, name: PROD[l.productId].name, oldUnit: unitPrice(l, from), newUnit: unitPrice(l, to), issues: lineIssues(l, to, newMode) }));
    const oldFee = mode === 'delivery' ? from.deliveryFee : 0, newFee = newMode === 'delivery' ? to.deliveryFee : 0;
    return { from, to, mode, newMode, rows, oldFee, newFee, status: storeStatus(to, newMode) };
  }
  function fixPickupMethod() {
    const st = curStore();
    if (!(st.pickupMethods || ['instore']).includes(S.shared.pickupMethod)) S.shared.pickupMethod = 'instore';
  }
  function setPickupMethod(m) { if (!(curStore().pickupMethods || ['instore']).includes(m)) return false; S.shared.pickupMethod = m; commit('shared'); return true; }
  function setDropoff(d) { S.shared.dropoff = d === 'hand' ? 'hand' : 'door'; commit('shared'); }
  function applyStore(newId) {
    const to = STORE[newId];
    S.shared.storeId = newId;
    S.shared.pickupMethod = (to.pickupMethods || ['instore']).includes(S.shared.pickupMethod) ? S.shared.pickupMethod : 'instore';
    if (!to.modes.includes(S.shared.mode)) S.shared.mode = to.modes[0];
    if (S.shared.schedule.type === 'later' && !slotValid(to, S.shared.mode, S.shared.schedule.slot)) S.shared.schedule = { type: 'asap', slot: null };
    commit('shared');
  }
  function setMode(mode) {
    if (!curStore().modes.includes(mode)) return false;
    S.shared.mode = mode;
    if (S.shared.schedule.type === 'later' && !slotValid(curStore(), mode, S.shared.schedule.slot)) S.shared.schedule = { type: 'asap', slot: null };
    if (mode === 'pickup' && S.shared.cart.rewardId === 'r-delivery') S.shared.cart.rewardId = null;
    commit('shared'); return true;
  }
  function setSchedule(type, slot) { S.shared.schedule = type === 'later' ? { type, slot } : { type: 'asap', slot: null }; commit('shared'); }

  /* ---------------- Journey switching ---------------- */
  function switchJourney(to) {
    if (S.shared.groupCheckout) return { ok: false, reason: 'Finish or reopen the group checkout before switching journeys.' };
    if (to === S.shared.journey) return { ok: true };
    S.shared.journey = to;
    S.shared.cart.couponId = null; S.shared.cart.rewardId = null;
    S.shared.pay = { method: 'card', useCredit: false, useGift: false };
    S.shared.draft = {};
    if (S.shared.tip.kind !== 'pct') S.shared.tip = { kind: 'pct', value: 18, custom: 0 };
    commit();
    return { ok: true };
  }

  /* ---------------- Activity ---------------- */
  function activity(j, entry) { j.activity.unshift(Object.assign({ id: uid('a'), at: Date.now() }, entry)); }

  /* ---------------- Orders ---------------- */
  function orderStart(o) {
    if (o.schedule && o.schedule.type === 'later' && o.schedule.slot) {
      const lead = (o.prepMin + (o.mode === 'delivery' ? CONFIG.deliveryLeadMin : 0)) * 60000;
      return Math.max(o.createdAt, o.schedule.slot - lead);
    }
    return o.createdAt;
  }
  const STAGE_LABEL = { scheduled: 'Scheduled', received: 'Order received', accepted: 'Order accepted', preparing: 'Preparing', baking: 'In the oven', out: 'Out for delivery', delivered: 'Delivered', ready: 'Ready for pickup', completed: 'Picked up', canceled: 'Canceled' };
  function stageOf(o, now = Date.now()) {
    const st = CONFIG.stages[o.mode];
    if (o.canceled) return { id: 'canceled', idx: -1, done: true, label: o.refund && o.refund.status === 'approved' ? 'Canceled · Refunded' : 'Canceled', steps: st };
    if (o.sample) return { id: st[st.length - 1][0], idx: st.length - 1, done: true, label: STAGE_LABEL[st[st.length - 1][0]], steps: st };
    const start = orderStart(o);
    if (now < start) return { id: 'scheduled', idx: -1, done: false, label: 'Scheduled', steps: st, start };
    const el = (now - start) / 1000;
    let idx = 0; st.forEach(([, sec], i) => { if (el >= sec) idx = i; });
    const id = st[idx][0];
    const next = st[idx + 1];
    return { id, idx, done: idx === st.length - 1, label: STAGE_LABEL[id], steps: st, start, nextAt: next ? start + next[1] * 1000 : null, progress: Math.min(1, el / st[st.length - 1][1]) };
  }
  const canAmend = (o) => { const s = stageOf(o); return !o.canceled && (s.id === 'scheduled' || s.id === 'received' || s.id === 'accepted'); };
  function etaOf(o) {
    if (o.schedule && o.schedule.type === 'later' && o.schedule.slot) return o.schedule.slot;
    return orderStart(o) + CONFIG.stages[o.mode].slice(-1)[0][1] * 1000;
  }
  function snapshotLine(x) {
    const p = PROD[x.line.productId];
    return { uid: x.line.uid, productId: p.id, name: p.name, cat: p.cat, qty: x.line.qty, unit: x.unit, total: x.total, config: clone(x.line.config),
      desc: describe(x.line), recipe: fullRecipe(x.line), participant: x.line.participant || null, note: x.line.note || null, diet: dietOf(x.line) };
  }

  function validateCheckout(form, opts = {}) {
    const q = quote();
    const sh = S.shared; const store = q.store;
    const fe = {}; const blockers = [];
    const nonFree = q.priced.filter(x => !PROD[x.line.productId].free);
    if (!sh.cart.lines.length) blockers.push('Your cart is empty.');
    else if (!nonFree.length) blockers.push('Add at least one menu item — free extras can’t be ordered on their own.');
    if (!form.name || !form.name.trim()) fe.name = 'Enter your name.';
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) fe.email = 'Enter a valid email address.';
    const pd = (form.phone || '').replace(/\D/g, '');
    if (pd.length < 10 || pd.length > 15) fe.phone = 'Phone number must contain 10–15 digits.';
    if (q.mode === 'delivery' && (!form.address || form.address.trim().length < 6)) fe.address = 'Enter a delivery address.';
    if (q.mode === 'pickup' && sh.pickupMethod === 'curbside' && (!form.vehicle || form.vehicle.trim().length < 3)) fe.vehicle = 'Describe your vehicle so we can find you (e.g. Blue Honda Civic).';
    if (q.mode === 'pickup' && !(store.pickupMethods || ['instore']).includes(sh.pickupMethod)) blockers.push(`${CONFIG.pickupMethods[sh.pickupMethod]} isn’t available at ${store.name}. Choose another pickup option.`);
    const st = storeStatus(store, q.mode);
    if (!st.ok) blockers.push(st.reason);
    if (sh.schedule.type === 'later') { if (!slotValid(store, q.mode, sh.schedule.slot)) blockers.push('Your scheduled time has expired or is no longer available — choose a new time.'); }
    else if (st.ok && !st.asap) blockers.push('This store can’t take ASAP orders right now — schedule for later.');
    const bad = q.priced.filter(x => x.issues.length);
    if (bad.length) blockers.push(`${bad.length} item${bad.length > 1 ? 's need' : ' needs'} attention: ${bad.map(x => PROD[x.line.productId].name + ' — ' + x.issues[0]).join('; ')}.`);
    if (q.couponEval && !q.couponEval.ok) blockers.push(`Coupon ${OFFER[sh.cart.couponId].code}: ${q.couponEval.reason}.`);
    if (q.rewardEval && !q.rewardEval.ok) blockers.push(`Reward: ${q.rewardEval.reason}.`);
    if (sh.journey === 'member' && sh.pay.method === 'wallet' && q.shortfall > 0) blockers.push(`Wallet funds are ${money(q.shortfall)} short. Top up or choose another payment method.`);
    if (sh.groupCheckout) {
      const g = S.groups.find(x => x.id === sh.groupCheckout);
      if (!g || g.status !== 'locked') blockers.push('The group order is no longer locked for checkout. Reopen it from the group page.');
    }
    if (opts.expectedTotal != null && opts.expectedTotal !== q.total) blockers.push(`Prices or eligibility changed — your total is now ${money(q.total)}. Review and confirm again.`);
    return { fe, blockers, q, review: opts.expectedTotal != null && opts.expectedTotal !== q.total };
  }

  function placeOrder(form) {
    const sh = S.shared; const j = J(); const q = quote(); const store = q.store;
    const now = Date.now();
    const order = {
      id: 'MOD-' + digits(6), createdAt: now, journey: sh.journey, storeId: store.id, storeName: store.name, storeCity: store.city, storeAddress: store.address,
      tz: store.tz, prepMin: store.prepMin, mode: q.mode, schedule: clone(sh.schedule), pickupNote: store.pickupNote,
      contact: { name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() },
      address: q.mode === 'delivery' ? form.address.trim() : null, instructions: q.mode === 'delivery' ? (form.instructions || '').trim() : null,
      allergens: form.allergens || [], kitchenNote: (form.kitchenNote || '').trim(),
      pickupMethod: q.mode === 'pickup' ? sh.pickupMethod : null, vehicle: q.mode === 'pickup' && sh.pickupMethod === 'curbside' ? (form.vehicle || '').trim() : null,
      dropoff: q.mode === 'delivery' ? sh.dropoff : null, arrived: null,
      lines: q.priced.map(snapshotLine),
      totals: { subtotal: q.subtotal, discount: q.discount, discountLabel: q.discountLabel, deliveryFee: q.deliveryFee, baseDelivery: q.baseDelivery, tax: q.tax, tip: q.tipAmt, total: q.total, foodAfter: q.foodAfter },
      tipRule: clone(sh.tip),
      couponId: sh.cart.couponId && q.couponEval && q.couponEval.ok ? sh.cart.couponId : null,
      reward: sh.cart.rewardId && q.rewardEval && q.rewardEval.ok ? { id: sh.cart.rewardId, name: REWARD[sh.cart.rewardId].name, cost: REWARD[sh.cart.rewardId].cost } : null,
      payment: { method: sh.journey === 'member' ? sh.pay.method : (sh.pay.method === 'wallet' ? 'card' : sh.pay.method), credit: q.credit, gift: q.gift, other: sh.journey === 'member' ? q.other : q.total },
      earnRule: q.points.rule, pointsEstimate: q.points.points, pointsAwarded: false, pointsEarned: 0,
      invoice: { id: 'INV-' + digits(7), revision: 1 }, amendments: [], support: [], chat: [], feedback: null, refund: null, canceled: false,
      group: null
    };
    if (sh.groupCheckout) {
      const g = S.groups.find(x => x.id === sh.groupCheckout);
      if (g) { order.group = { id: g.id, name: g.name, participants: g.participants.map(p => p.name) }; g.status = 'placed'; g.orderId = order.id; g.placedAt = now; }
    }
    if (sh.journey === 'member') {
      if (order.reward) { j.points -= order.reward.cost; activity(j, { type: 'redeem', text: `Redeemed ${order.reward.name} · ${order.id}`, points: -order.reward.cost, orderId: order.id }); }
      if (q.credit) { j.wallet.credit -= q.credit; activity(j, { type: 'credit', text: `Service credit applied · ${order.id}`, amount: -q.credit, orderId: order.id }); }
      if (q.gift) { j.wallet.gift -= q.gift; activity(j, { type: 'wallet', text: `Wallet payment · ${order.id}`, amount: -q.gift, orderId: order.id }); }
    }
    // retain contact details for later orders
    j.profile.name = j.profile.name || order.contact.name;
    if (sh.journey === 'guest') { j.profile.name = order.contact.name; j.profile.email = order.contact.email; j.profile.phone = order.contact.phone; }
    j.orders.unshift(order);
    // clear purchased cart; restore parked personal cart after group checkout
    if (sh.groupCheckout && sh.parked) { restoreParked(); }
    else { sh.cart = { lines: [], couponId: null, rewardId: null }; }
    sh.groupCheckout = null;
    sh.pay = { method: 'card', useCredit: false, useGift: false };
    sh.draft = {};
    commit();
    return order;
  }
  function restoreParked() {
    const sh = S.shared; const p = sh.parked;
    if (!p) { sh.cart = { lines: [], couponId: null, rewardId: null }; return; }
    sh.cart = p.cart; sh.schedule = p.schedule; sh.storeId = p.storeId; sh.mode = p.mode;
    sh.parked = null;
  }
  function findOrder(id) {
    for (const k of ['guest', 'member']) { const o = S.journeys[k].orders.find(x => x.id === id); if (o) return { order: o, journey: k, j: S.journeys[k] }; }
    return null;
  }
  function reorder(o) {
    const store = curStore(); const added = [], skipped = [];
    o.lines.forEach(l => {
      const p = PROD[l.productId];
      const line = { productId: l.productId, config: clone(l.config), qty: l.qty };
      const issues = p ? lineIssues(line, store, S.shared.mode) : ['No longer on the menu'];
      if (issues.length) skipped.push(`${l.name}: ${issues[0]}`);
      else { addToCart(l.productId, l.config, l.qty); added.push(l.name); }
    });
    return { added, skipped };
  }

  /* -------- After-order amendments -------- */
  function amendOrder(orderId, lineUid, newConfig) {
    const f = findOrder(orderId); if (!f) return { ok: false, reason: 'Order not found' };
    const o = f.order;
    if (!canAmend(o)) return { ok: false, reason: 'Preparation has started — this order can no longer be changed.' };
    const l = o.lines.find(x => x.uid === lineUid); if (!l) return { ok: false, reason: 'Pizza not found' };
    const p = PROD[l.productId]; const store = STORE[o.storeId];
    const cfg = Object.assign(clone(l.config), { size: l.config.size, crust: l.config.crust });
    Object.assign(cfg, clone(newConfig), { size: l.config.size, crust: l.config.crust });
    const issues = configIssues(p, cfg, store);
    if (issues.length) return { ok: false, reason: issues.join('; ') };
    const before = describe({ productId: l.productId, config: l.config }).join(', ') || 'Standard recipe';
    l.config = cfg;
    const tmp = { productId: l.productId, config: cfg };
    l.desc = describe(tmp); l.recipe = fullRecipe(tmp); l.diet = dietOf(tmp);
    const after = l.desc.join(', ') || 'Standard recipe';
    o.amendments.push({ at: Date.now(), line: l.name, before, after, charge: 0 });
    o.invoice.revision += 1;
    commit('journey');
    return { ok: true, before, after };
  }

  /* -------- Support, feedback, refunds -------- */
  function addSupport(orderId, type, message) {
    const f = findOrder(orderId); if (!f) return null;
    const req = { id: 'SR-' + digits(5), at: Date.now(), type, message, status: 'Received' };
    f.order.support.push(req);
    if (type === 'refund' && !f.order.canceled && !f.order.refund) { f.order.refund = { status: 'review', requestedAt: Date.now(), requestId: req.id }; req.status = 'Under review'; }
    commit('journey');
    return req;
  }
  function restoreTenders(o, j) {
    if (o.reward) { j.points += o.reward.cost; activity(j, { type: 'refund', text: `Reward points restored · ${o.id}`, points: o.reward.cost, orderId: o.id }); }
    if (o.payment.credit) { j.wallet.credit += o.payment.credit; activity(j, { type: 'credit', text: `Service credit restored · ${o.id}`, amount: o.payment.credit, orderId: o.id }); }
    if (o.payment.gift) { j.wallet.gift += o.payment.gift; activity(j, { type: 'wallet', text: `Wallet funds restored · ${o.id}`, amount: o.payment.gift, orderId: o.id }); }
  }
  function cancelOrder(id, reason) {
    const f = findOrder(id); if (!f) return { ok: false, reason: 'Order not found' };
    const o = f.order;
    if (o.canceled) return { ok: false, reason: 'This order is already canceled.' };
    if (!canAmend(o)) return { ok: false, reason: 'We’ve started preparing this order, so it can’t be canceled here. Contact support for help.' };
    o.canceled = true; o.canceledAt = Date.now(); o.cancelReason = reason || 'Canceled by customer';
    o.refund = { status: 'approved', self: true, requestedAt: Date.now(), resolvedAt: Date.now(), amount: o.payment.other };
    if (f.journey === 'member') restoreTenders(o, f.j);
    o.support.push({ id: 'SR-' + digits(5), at: Date.now(), type: 'cancel', message: o.cancelReason, status: 'Canceled · full refund (simulated)' });
    commit('journey');
    return { ok: true, order: o };
  }
  function imHere(id) { const f = findOrder(id); if (!f) return false; f.order.arrived = Date.now(); commit('journey'); return true; }
  function reconcileRefund(f) {
    const o = f.order; const j = f.j;
    if (f.journey === 'member' && o.pointsAwarded && o.pointsEarned > j.points) {
      o.refund.status = 'blocked';
      o.refund.reason = `Points earned on this order (${o.pointsEarned}) have already been spent, so the refund can’t be reconciled automatically. Support will follow up.`;
      return;
    }
    o.canceled = true; o.canceledAt = Date.now();
    o.refund.status = 'approved'; o.refund.resolvedAt = Date.now(); o.refund.amount = o.payment.other;
    if (f.journey === 'member') {
      restoreTenders(o, j);
      if (o.pointsAwarded && o.pointsEarned) { j.points -= o.pointsEarned; j.lifetime = Math.max(0, j.lifetime - o.pointsEarned); activity(j, { type: 'reverse', text: `Points reversed (refund) · ${o.id}`, points: -o.pointsEarned, orderId: o.id }); }
    }
    const req = o.support.find(s => s.id === o.refund.requestId); if (req) req.status = 'Refund approved (simulated)';
  }
  function setFeedback(orderId, rating, comment) {
    const f = findOrder(orderId); if (!f) return false;
    const o = f.order; const s = stageOf(o);
    if (o.canceled || !s.done) return false;
    o.feedback = { rating, comment, at: Date.now(), edited: !!o.feedback };
    commit('journey'); return true;
  }

  /* -------- Lifecycle tick -------- */
  function tick() {
    let changed = false; const now = Date.now();
    ['guest', 'member'].forEach(k => {
      const j = S.journeys[k];
      j.orders.forEach(o => {
        const s = stageOf(o, now);
        if (k === 'member' && !o.canceled && s.done && !o.pointsAwarded) {
          o.pointsAwarded = true; o.pointsEarned = o.pointsEstimate || 0; o.completedAt = now;
          if (o.pointsEarned) { j.points += o.pointsEarned; j.lifetime += o.pointsEarned; activity(j, { type: 'earn', text: `Earned on ${o.id}`, points: o.pointsEarned, orderId: o.id }); }
          changed = true;
        } else if (k === 'guest' && s.done && !o.pointsAwarded && !o.canceled) { o.pointsAwarded = true; o.completedAt = now; changed = true; }
        if (o.refund && o.refund.status === 'review' && now - o.refund.requestedAt > CONFIG.refundReviewSec * 1000) {
          reconcileRefund({ order: o, journey: k, j }); changed = true;
        }
      });
    });
    if (changed) commit('journey');
    return changed;
  }

  /* -------- Loyalty extras -------- */
  function challengeProgress(j) {
    const set = new Set();
    j.orders.filter(o => !o.canceled && stageOf(o).done).forEach(o => o.lines.forEach(l => { const p = PROD[l.productId]; if (p && p.signature) set.add(p.id); }));
    return { count: Math.min(set.size, CONFIG.challenge.need), ids: [...set] };
  }
  function claim(kind, input) {
    const j = J();
    if (!isMember()) return { ok: false, reason: 'Switch to the sample member journey to claim points.' };
    if (kind === 'receipt' && /^RCPT-/i.test((input || '').trim())) return claim('scan', input);
    if (kind === 'receipt') {
      if ((input || '').trim().toUpperCase() !== CONFIG.receiptClaim.code) return { ok: false, reason: 'That code wasn’t found. Check the code on your receipt.' };
      if (j.claims.receipt) return { ok: false, reason: 'This receipt has already been claimed.' };
      j.claims.receipt = Date.now(); j.points += CONFIG.receiptClaim.points; j.lifetime += CONFIG.receiptClaim.points;
      activity(j, { type: 'bonus', text: `Receipt claim ${CONFIG.receiptClaim.code}`, points: CONFIG.receiptClaim.points });
    } else if (kind === 'scan') {
      const code = (input || '').trim().toUpperCase();
      const r = SAMPLE_RECEIPTS.find(x => x.id === code);
      if (!r) return { ok: false, reason: 'We couldn’t read that receipt. Try again, or enter the code printed under the barcode.' };
      j.claims.receipts = j.claims.receipts || [];
      if (j.claims.receipts.includes(r.id)) return { ok: false, reason: 'This receipt has already been credited.' };
      if (r.daysAgo > CONFIG.receiptMaxAgeDays) return { ok: false, reason: `Receipts must be scanned within ${CONFIG.receiptMaxAgeDays} days of purchase.` };
      const est = estimatePoints(j, r.total);
      if (!est.points) return { ok: false, reason: 'Daily points cap reached — try again tomorrow.' };
      j.claims.receipts.push(r.id); j.points += est.points; j.lifetime += est.points;
      activity(j, { type: 'bonus', text: `In-store receipt ${r.id} · ${STORE[r.storeId].name}`, points: est.points });
      commit('journey');
      return { ok: true, points: est.points, receipt: r };
    } else if (kind === 'profile') {
      if (j.claims.profile) return { ok: false, reason: 'Profile bonus already claimed.' };
      const p = j.profile; if (!p.name || !p.email || !p.phone || !p.birthday) return { ok: false, reason: 'Add your name, email, phone and birthday first.' };
      j.claims.profile = Date.now(); j.points += CONFIG.profileBonus; j.lifetime += CONFIG.profileBonus;
      activity(j, { type: 'bonus', text: 'Complete-your-profile bonus', points: CONFIG.profileBonus });
    } else if (kind === 'challenge') {
      if (j.claims.challenge) return { ok: false, reason: 'Challenge already claimed.' };
      if (challengeProgress(j).count < CONFIG.challenge.need) return { ok: false, reason: 'Challenge not complete yet.' };
      j.claims.challenge = Date.now(); j.points += CONFIG.challenge.points; j.lifetime += CONFIG.challenge.points;
      activity(j, { type: 'bonus', text: `${CONFIG.challenge.name} challenge`, points: CONFIG.challenge.points });
    } else if (kind === 'giftcard') {
      if ((input || '').trim().toUpperCase() !== CONFIG.sampleGiftCard.code) return { ok: false, reason: 'Gift card code not recognised (sample code: MODGIFT25).' };
      if (j.claims.giftcard) return { ok: false, reason: 'This sample gift card has already been redeemed.' };
      j.claims.giftcard = Date.now(); j.wallet.gift += CONFIG.sampleGiftCard.amount;
      activity(j, { type: 'wallet', text: 'Sample gift card redeemed', amount: CONFIG.sampleGiftCard.amount });
    }
    commit('journey');
    return { ok: true };
  }
  function topUp(amount, method) {
    const j = J(); if (!isMember()) return false;
    j.wallet.gift += amount; activity(j, { type: 'wallet', text: `Wallet top-up (${method}, simulated)`, amount });
    commit('journey'); return true;
  }

  /* -------- Store search by ZIP / location -------- */
  function geocodeZip(zip) {
    const z = (zip || '').trim(); const D = window.MOD_DATA;
    if (!/^\d{5}$/.test(z)) return { ok: false, reason: 'Enter a 5-digit US ZIP code.' };
    if (D.ZIPS[z]) { const [lat, lng, city] = D.ZIPS[z]; return { ok: true, lat, lng, label: `${z} · ${city}`, approx: false }; }
    const p = D.ZIP_PREFIX[z.slice(0, 3)] || D.ZIP_REGION[z[0]];
    if (p) return { ok: true, lat: p[0], lng: p[1], label: `${z} · ${p[2]} (approximate)`, approx: true };
    return { ok: false, reason: 'We couldn’t find that ZIP code.' };
  }
  function milesBetween(a, b) {
    const R = 3958.8, rad = (x) => x * Math.PI / 180;
    const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }
  function storesNear(loc) { return STORES.map(s => ({ store: s, miles: milesBetween(loc, s) })).sort((a, b) => a.miles - b.miles); }
  const fmtMiles = (m) => m < 0.1 ? '< 0.1 mi' : m < 10 ? `${m.toFixed(1)} mi` : `${Math.round(m).toLocaleString()} mi`;
  function setSearchLoc(loc) { S.shared.searchLoc = loc; commit('shared'); }

  /* -------- Passwordless sign-in (simulated OTP) -------- */
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function requestOtp(channel, value) {
    const v = (value || '').trim();
    if (channel === 'email' && !EMAIL_RE.test(v)) return { ok: false, reason: 'Enter a valid email address.' };
    if (channel === 'sms') { const d = v.replace(/\D/g, ''); if (d.length < 10 || d.length > 15) return { ok: false, reason: 'Enter a mobile number with 10–15 digits.' }; }
    const prev = S.shared.otp; const now = Date.now();
    if (prev && prev.value === v && prev.channel === channel && now - prev.sentAt < CONFIG.otp.resendSec * 1000) return { ok: false, reason: `Please wait ${Math.ceil((CONFIG.otp.resendSec * 1000 - (now - prev.sentAt)) / 1000)}s before requesting another code.` };
    const code = String(Math.floor(Math.random() * 1e6)).padStart(CONFIG.otp.length, '0');
    S.shared.otp = { channel, value: v, code, sentAt: now, expires: now + CONFIG.otp.ttlSec * 1000, attempts: 0 };
    commit('shared');
    return { ok: true, code };
  }
  function verifyOtp(code) {
    const o = S.shared.otp; if (!o) return { ok: false, reason: 'Request a new code to continue.' };
    if (Date.now() > o.expires) return { ok: false, reason: 'This code has expired. Request a new one.', expired: true };
    if (o.attempts >= CONFIG.otp.maxAttempts) return { ok: false, reason: 'Too many attempts. Request a new code.', locked: true };
    if ((code || '').replace(/\D/g, '') !== o.code) { o.attempts++; commit('shared'); const left = CONFIG.otp.maxAttempts - o.attempts; return { ok: false, reason: left ? `That code isn’t right. ${left} attempt${left > 1 ? 's' : ''} left.` : 'Too many attempts. Request a new code.', locked: !left }; }
    const m = S.journeys.member.profile;
    const known = o.channel === 'email' ? o.value.toLowerCase() === (m.email || '').toLowerCase() : o.value.replace(/\D/g, '').slice(-10) === (m.phone || '').replace(/\D/g, '').slice(-10);
    const ident = { channel: o.channel, value: o.value };
    const sw = switchJourney('member'); if (!sw.ok) return { ok: false, reason: sw.reason };
    S.shared.otp = null; S.journeys.member.signedInAt = Date.now(); S.journeys.member.signedInWith = ident;
    commit();
    return { ok: true, known, ident };
  }
  function signOut() { const r = switchJourney('guest'); if (r.ok) { S.journeys.member.signedInAt = null; commit('journey'); } return r; }

  /* -------- Groups -------- */
  function createGroup({ name, budget, deadlineMin, hostName }) {
    const sh = S.shared; const j = J();
    const addr = j.addresses.find(a => a.id === j.selectedAddressId) || null;
    const g = { id: 'G' + digits(5), name, budget, deadline: Date.now() + deadlineMin * 60000, owner: sh.journey,
      storeId: sh.storeId, mode: sh.mode, schedule: clone(sh.schedule), address: addr ? { line: addr.line, instructions: addr.instructions } : null,
      status: 'open', createdAt: Date.now(), orderId: null,
      participants: [{ id: 'host', name: hostName || 'Host', host: true, ready: false, items: [] }] };
    S.groups.unshift(g); commit('groups'); return g;
  }
  const getGroup = (id) => S.groups.find(g => g.id === id);
  const groupLocked = (g) => g.status !== 'open' || Date.now() > g.deadline;
  function participantSubtotal(g, p) { const store = STORE[g.storeId]; return p.items.reduce((s, l) => s + unitPrice(l, store) * l.qty, 0); }
  function groupCheckIssues(g) {
    const store = STORE[g.storeId]; const issues = [];
    const withItems = g.participants.filter(p => p.items.length);
    if (!withItems.length) issues.push('No one has added food yet.');
    g.participants.forEach(p => {
      if (p.items.length && !p.ready) issues.push(`${p.name} hasn’t marked ready.`);
      if (g.budget && participantSubtotal(g, p) > g.budget) issues.push(`${p.name} is over the ${money(g.budget)} budget.`);
      p.items.forEach(l => { const iss = lineIssues(l, store, g.mode); if (iss.length) issues.push(`${p.name}: ${PROD[l.productId].name} — ${iss[0]}`); });
    });
    if (g.owner !== S.shared.journey) issues.push('Only the host journey can check out this group.');
    const st = storeStatus(store, g.mode); if (!st.ok) issues.push(st.reason);
    return issues;
  }
  function startGroupCheckout(gid) {
    const g = getGroup(gid); const sh = S.shared;
    const issues = groupCheckIssues(g); if (issues.length) return { ok: false, issues };
    if (sh.groupCheckout) return { ok: false, issues: ['Another group checkout is already in progress.'] };
    sh.parked = { cart: clone(sh.cart), schedule: clone(sh.schedule), storeId: sh.storeId, mode: sh.mode };
    sh.cart = { lines: [], couponId: null, rewardId: null };
    g.participants.forEach(p => p.items.forEach(l => sh.cart.lines.push(Object.assign(clone(l), { uid: uid('l'), participant: p.name, locked: true }))));
    sh.storeId = g.storeId; sh.mode = g.mode; sh.schedule = clone(g.schedule);
    if (sh.schedule.type === 'later' && !slotValid(STORE[g.storeId], g.mode, sh.schedule.slot)) sh.schedule = { type: 'asap', slot: null };
    sh.groupCheckout = gid;
    g.status = 'locked';
    commit(); return { ok: true };
  }
  function reopenGroup(gid) {
    const g = getGroup(gid); const sh = S.shared;
    if (!g || g.status === 'placed' || g.status === 'canceled') return false;
    g.status = 'open';
    if (sh.groupCheckout === gid) { restoreParked(); sh.groupCheckout = null; }
    g.participants.forEach(p => { p.ready = false; });
    commit(); return true;
  }
  function cancelGroup(gid) {
    const g = getGroup(gid); if (!g || g.status === 'placed') return false;
    if (S.shared.groupCheckout === gid) { restoreParked(); S.shared.groupCheckout = null; }
    g.status = 'canceled'; commit(); return true;
  }

  /* -------- Sample member order history -------- */
  function seedMemberOrders(j) {
    const store = STORE.s1; const now = Date.now();
    const mk = (daysAgo, lines, opts = {}) => {
      const priced = lines.map(l => { const line = Object.assign({ uid: uid('l') }, l); const unit = unitPrice(line, store); return { line, unit, total: unit * line.qty, issues: [] }; });
      const subtotal = priced.reduce((s, x) => s + x.total, 0);
      const fee = opts.mode === 'delivery' ? store.deliveryFee : 0; const tax = Math.round(subtotal * CONFIG.taxRate); const tip = Math.round(subtotal * 0.18);
      const created = now - daysAgo * 864e5;
      const pts = Math.floor(Math.floor(subtotal / 100) * 10 * 1.25);
      return { id: 'MOD-' + digits(6), sample: true, createdAt: created, journey: 'member', storeId: store.id, storeName: store.name, storeCity: store.city, storeAddress: store.address,
        tz: store.tz, prepMin: store.prepMin, mode: opts.mode || 'pickup', schedule: { type: 'asap', slot: null }, pickupNote: store.pickupNote,
        contact: { name: 'Jordan Rivera', email: 'jordan.rivera@example.com', phone: '(206) 555-0142' },
        address: opts.mode === 'delivery' ? j.addresses[0].line : null, instructions: opts.mode === 'delivery' ? j.addresses[0].instructions : null,
        allergens: [], kitchenNote: '', lines: priced.map(snapshotLine),
        totals: { subtotal, discount: 0, discountLabel: '', deliveryFee: fee, baseDelivery: fee, tax, tip, total: subtotal + fee + tax + tip, foodAfter: subtotal },
        tipRule: { kind: 'pct', value: 18 }, couponId: null, reward: null, payment: { method: 'card', credit: 0, gift: 0, other: subtotal + fee + tax + tip },
        earnRule: { rate: 10, mult: 1.25, tier: 'Silver', cap: CONFIG.dailyPointCap }, pointsEstimate: opts.canceled ? 0 : pts, pointsAwarded: !opts.canceled, pointsEarned: opts.canceled ? 0 : pts,
        invoice: { id: 'INV-' + digits(7), revision: 1 }, amendments: [], support: [], chat: [], feedback: opts.feedback || null,
        refund: opts.canceled ? { status: 'approved', requestedAt: created + 6e5, resolvedAt: created + 9e5, amount: subtotal + fee + tax + tip } : null,
        canceled: !!opts.canceled, canceledAt: opts.canceled ? created + 9e5 : null, group: null, completedAt: created + 33e5 };
    };
    const maddog = PROD['p-maddog'];
    const o1 = mk(3, [{ productId: 'p-maddog', config: defaultPizzaConfig(maddog), qty: 1 }, { productId: 'p-cyo', config: j.savedPizzas[0].config, qty: 1 }, { productId: 'x-nonamecake', config: null, qty: 2 }, { productId: 'b-lemonade', config: null, qty: 2 }], { mode: 'delivery', feedback: { rating: 5, comment: 'Hot and fast. Loved the extra pepperoni.', at: now - 864e5 * 3 } });
    const o2 = mk(12, [{ productId: 'p-garden', config: defaultPizzaConfig(PROD['p-garden']), qty: 1 }, { productId: 's-italian', config: defaultConfig(PROD['s-italian']), qty: 1 }], { mode: 'pickup' });
    const o3 = mk(20, [{ productId: 'p-caspian', config: defaultPizzaConfig(PROD['p-caspian']), qty: 2 }], { mode: 'delivery', canceled: true });
    o3.support.push({ id: 'SR-' + digits(5), at: o3.createdAt + 6e5, type: 'refund', message: 'Ordered by mistake — please cancel.', status: 'Refund approved (simulated)' });
    j.orders = [o1, o2, o3];
    j.goTo = o1.id;
    j.activity.unshift({ id: uid('a'), at: o1.createdAt + 33e5, type: 'earn', text: `Earned on ${o1.id}`, points: o1.pointsEarned, orderId: o1.id });
    j.activity.push({ id: uid('a'), at: o2.createdAt + 33e5, type: 'earn', text: `Earned on ${o2.id}`, points: o2.pointsEarned, orderId: o2.id });
    j.activity.sort((a, b) => b.at - a.at);
  }

  function resetDemo() {
    try { Object.keys(localStorage).filter(k => k.startsWith(PREFIX)).forEach(k => localStorage.removeItem(k)); } catch (e) { /* ignore */ }
    Object.keys(memory).forEach(k => delete memory[k]);
  }

  /* -------- Init (after all helpers are defined) -------- */
  if (!S.journeys.member) { S.journeys.member = defaultMember(); seedMemberOrders(S.journeys.member); save('member', S.journeys.member); }
  S.shared = Object.assign(defaultShared(), S.shared);
  ['guest', 'member'].forEach(k => { S.journeys[k] = Object.assign(emptyJourney(), S.journeys[k]); });

  window.MOD = {
    S, J, isMember, curStore, commit, persist, reloadFromStorage, PREFIX, storageOK: () => storageOK,
    ING, PROD, STORE, OFFER, REWARD, SIZE, CRUST, CONFIG, clone, uid,
    money, fmtTime, fmtDate, fmtMins, hoursText, tzParts,
    storeStatus, slotsFor, slotValid, scheduleText, leadMin,
    productIssue, ingOut, basePrice, defaultConfig, defaultPizzaConfig, halvesFromWhole, configIssues, unitPrice, lineIssues, describe, fullRecipe, dietOf, countToppings, isPublished,
    tierOf, nextTier, pendingPoints, estimatePoints, evalOffer, evalReward, couponUses, quote,
    addToCart, updateLine, removeLine, setQty, cartCount, suggestion, sameConfig,
    previewStoreChange, applyStore, setMode, setSchedule, switchJourney,
    stageOf, STAGE_LABEL, canAmend, etaOf, validateCheckout, placeOrder, findOrder, reorder, amendOrder,
    addSupport, setFeedback, tick, cancelOrder, imHere, geocodeZip, milesBetween, storesNear, fmtMiles, setSearchLoc, setPickupMethod, setDropoff, fixPickupMethod, requestOtp, verifyOtp, signOut, challengeProgress, claim, topUp, activity,
    createGroup, getGroup, groupLocked, participantSubtotal, groupCheckIssues, startGroupCheckout, reopenGroup, cancelGroup, resetDemo
  };
})();
