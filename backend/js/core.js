/* MOD Back Office — core: state, persistence, roles & permissions, audit, approvals, publishing, metrics.
   All money values are integer cents. Prototype only: data lives in this browser (localStorage). */
(function () {
  'use strict';
  const KEY = 'mod.hq.v1';
  const PUB_KEY = 'mod.hq.published.v1';   // read by the customer web + mobile apps (js/data.js)
  const APP_PREFIXES = ['modproto.v2.', 'modapp.v2.', 'modproto.mobile.v2.'];

  /* ---------------- utils ---------------- */
  const clone = (o) => JSON.parse(JSON.stringify(o));
  let uidN = 0;
  const uid = (p = 'id') => p + '-' + Date.now().toString(36).slice(-5) + (++uidN).toString(36) + Math.random().toString(36).slice(2, 5);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = (c, opts = {}) => {
    if (c == null || isNaN(c)) return '—';
    const neg = c < 0; const v = Math.abs(c) / 100;
    const s = v.toLocaleString('en-US', { minimumFractionDigits: opts.whole ? 0 : 2, maximumFractionDigits: opts.whole ? 0 : 2 });
    return (neg ? '−$' : '$') + s;
  };
  const num = (n) => (n == null ? '—' : Number(n).toLocaleString('en-US'));
  const pct = (n, d = 0) => (n == null || isNaN(n) ? '—' : (n * 100).toFixed(d) + '%');
  const DAY = 864e5;
  const fmtDate = (t) => t ? new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
  const fmtShort = (t) => t ? new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—';
  const fmtTime = (t) => t ? new Date(t).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '—';
  const fmtDT = (t) => t ? fmtShort(t) + ', ' + fmtTime(t) : '—';
  const isoDate = (t) => t ? new Date(t - new Date(t).getTimezoneOffset() * 6e4).toISOString().slice(0, 10) : '';
  const fromIso = (s) => s ? new Date(s + 'T00:00:00').getTime() : null;
  const rel = (t) => {
    if (!t) return '—'; const d = Date.now() - t; const a = Math.abs(d); const f = d >= 0 ? (x) => x + ' ago' : (x) => 'in ' + x;
    if (a < 6e4) return d >= 0 ? 'just now' : 'in a moment';
    if (a < 36e5) return f(Math.round(a / 6e4) + 'm'); if (a < DAY) return f(Math.round(a / 36e5) + 'h');
    if (a < 30 * DAY) return f(Math.round(a / DAY) + 'd'); return fmtDate(t);
  };
  const minToHHMM = (m) => { m = ((m % 1440) + 1440) % 1440; const h = Math.floor(m / 60), mm = m % 60; const ap = h >= 12 ? 'PM' : 'AM'; const h12 = h % 12 || 12; return `${h12}:${String(mm).padStart(2, '0')} ${ap}`; };
  const hhmmToMin = (s) => { if (!s) return 0; const [h, m] = s.split(':').map(Number); return h * 60 + m; };
  const minToInput = (m) => { m = Math.min(m, 1439); return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); };
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const sum = (a, f = (x) => x) => a.reduce((s, x) => s + (f(x) || 0), 0);
  const by = (k, dir = 1) => (a, b) => { const x = typeof k === 'function' ? k(a) : a[k], y = typeof k === 'function' ? k(b) : b[k]; return (x > y ? 1 : x < y ? -1 : 0) * dir; };
  const groupBy = (a, f) => a.reduce((m, x) => { const k = f(x); (m[k] = m[k] || []).push(x); return m; }, {});

  /* ---------------- roles & permissions ---------------- */
  const PERMS = {
    'catalog.edit': 'Edit menu, ingredients and categories', 'catalog.publish': 'Publish changes to customer apps',
    'offers.edit': 'Create and edit coupons & offers', 'campaigns.edit': 'Create and edit campaigns', 'campaigns.launch': 'Launch campaigns',
    'content.edit': 'Edit app content and banners', 'loyalty.rules': 'Change loyalty program rules, tiers and rewards', 'loyalty.adjust': 'Adjust member points',
    'members.view': 'View customers & members', 'members.pii': 'See full contact details (PII)', 'members.manage': 'Block, merge, export or delete members',
    'orders.manage': 'Manage orders and fulfillment', 'refund.issue': 'Issue refunds and service credit', 'stores.edit': 'Edit store setup, hours and fees',
    'support.manage': 'Work the support inbox', 'reports.view': 'View reports & insights', 'finance.view': 'View financials and loyalty liability',
    'approvals.decide': 'Approve or reject requests', 'users.manage': 'Manage users and roles', 'settings.edit': 'Edit platform settings', 'audit.view': 'View the audit log',
    'store.workspace': 'Use the store workspace', 'franchise.participation': 'Opt stores in or out of HQ promotions'
  };
  const ALL = Object.keys(PERMS);
  const ROLES = {
    super: { name: 'Super admin', desc: 'Full access to every workspace and setting.', perms: ALL, hq: true },
    marketing: { name: 'Marketing manager', desc: 'Campaigns, offers, content and segments.', perms: ['offers.edit', 'campaigns.edit', 'content.edit', 'members.view', 'reports.view', 'catalog.edit'], hq: true },
    loyalty: { name: 'Loyalty manager', desc: 'Program rules, rewards, members and points.', perms: ['loyalty.rules', 'loyalty.adjust', 'members.view', 'members.pii', 'members.manage', 'reports.view', 'campaigns.edit', 'offers.edit', 'finance.view'], hq: true },
    ops: { name: 'Operations', desc: 'Stores, orders, fulfillment and support.', perms: ['orders.manage', 'refund.issue', 'stores.edit', 'support.manage', 'members.view', 'reports.view', 'store.workspace', 'catalog.edit'], hq: true },
    finance: { name: 'Finance (approver)', desc: 'Read-only reporting plus approvals.', perms: ['reports.view', 'finance.view', 'approvals.decide', 'audit.view', 'members.view'], hq: true },
    manager: { name: 'Store manager', desc: 'Store workspace for assigned stores.', perms: ['store.workspace', 'orders.manage', 'support.manage', 'refund.issue'], hq: false },
    franchisee: { name: 'Franchise owner', desc: 'Owned stores, including promo participation.', perms: ['store.workspace', 'orders.manage', 'support.manage', 'refund.issue', 'franchise.participation', 'reports.view'], hq: false }
  };

  /* ---------------- state ---------------- */
  let S = null;
  function load() {
    try { const raw = localStorage.getItem(KEY); if (raw) { S = JSON.parse(raw); if (S && S.schema === 3) return; } } catch (e) { /* ignore */ }
    S = window.ADM_SEED.build(); save();
  }
  let saveT = null;
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { console.warn('save failed', e); } }
  function commit() { clearTimeout(saveT); saveT = setTimeout(save, 60); }
  function reset() { localStorage.removeItem(KEY); localStorage.removeItem(PUB_KEY); S = window.ADM_SEED.build(); save(); }

  const me = () => S.users.find(u => u.id === S.session.userId) || S.users[0];
  const role = () => ROLES[me().role];
  const can = (p) => role().perms.includes(p);
  const canStore = (sid) => role().hq ? can('store.workspace') || me().role === 'super' : (me().stores || []).includes(sid);

  function audit(action, entity, detail, extra = {}) {
    S.audit.unshift(Object.assign({ id: uid('au'), at: Date.now(), userId: me().id, user: me().name, role: role().name, action, entity, detail }, extra));
    if (S.audit.length > 1500) S.audit.length = 1500;
  }
  function notify(text, link) { S.notifications.unshift({ id: uid('n'), at: Date.now(), text, link, read: false }); if (S.notifications.length > 100) S.notifications.length = 100; }

  /* ---------------- catalog draft / publish ---------------- */
  const CATALOG_KEYS = ['CONFIG', 'STORES', 'INGREDIENTS', 'PRODUCTS', 'BUILDER_PRODUCTS', 'CATEGORIES', 'OFFERS', 'REWARDS', 'CONTENT'];
  function markDraft(area, label) { S.draft.changes.unshift({ at: Date.now(), area, label, user: me().name }); if (S.draft.changes.length > 200) S.draft.changes.length = 200; }
  function publishedSnap() { const h = S.publishHistory[0]; return h ? h.snapshot : null; }
  function diff() {
    const live = publishedSnap(); const out = [];
    CATALOG_KEYS.forEach(k => {
      const d = S.catalog[k], l = live ? live[k] : null;
      if (Array.isArray(d)) {
        const lm = Object.fromEntries((l || []).map(x => [x.id, x])); const dm = Object.fromEntries(d.map(x => [x.id, x]));
        d.forEach(x => { if (!lm[x.id]) out.push({ k, id: x.id, name: x.name || x.title || x.code || x.id, type: 'added' }); else if (JSON.stringify(lm[x.id]) !== JSON.stringify(x)) out.push({ k, id: x.id, name: x.name || x.title || x.code || x.id, type: 'changed' }); });
        (l || []).forEach(x => { if (!dm[x.id]) out.push({ k, id: x.id, name: x.name || x.title || x.code || x.id, type: 'removed' }); });
      } else if (JSON.stringify(d) !== JSON.stringify(l)) {
        const keys = Object.keys(Object.assign({}, d, l || {})).filter(x => JSON.stringify((d || {})[x]) !== JSON.stringify((l || {})[x]));
        keys.forEach(x => out.push({ k, id: x, name: x, type: 'changed' }));
      }
    });
    return out;
  }
  // Rules that run at publish: franchise opt-outs narrow offer store lists; rewards/offers past their end are left as-is (apps hide them).
  function buildPayload() {
    const c = clone(S.catalog);
    const allStores = c.STORES.map(s => s.id);
    c.OFFERS = c.OFFERS.filter(o => ['live', 'scheduled', 'ended'].includes(o.status || 'live')).map(o => {
      const outs = (S.franchise.optOuts[o.id] || []);
      if (outs.length) o.stores = (o.stores || allStores).filter(id => !outs.includes(id));
      delete o.status; delete o.usage; delete o.daysOfWeek; delete o.daypart; delete o.budget; delete o.campaignId; delete o.notes; delete o.franchiseOptOut; delete o.codes;
      return o;
    });
    c.REWARDS = c.REWARDS.filter(r => ['live', 'scheduled'].includes(r.status || 'live') && !rewardBlocked(r)).map(r => { const o = clone(r); delete o.status; delete o.linkedProductId; delete o.notes; return o; });
    c.PRODUCTS = c.PRODUCTS.map(p => { const o = clone(p); delete o.notes; delete o.sku; delete o.cost; return o; });
    return c;
  }
  function rewardBlocked(r) {
    if (!r.linkedProductId) return false;
    const p = S.catalog.PRODUCTS.find(x => x.id === r.linkedProductId);
    return !p || p.published === false || p.available === false;
  }
  function publish(note) {
    const snapshot = clone(S.catalog);
    const v = (S.publishHistory[0] ? S.publishHistory[0].v : 0) + 1;
    const changes = diff();
    S.publishHistory.unshift({ v, at: Date.now(), by: me().name, note: note || '', changes: changes.length, summary: summarize(changes), snapshot });
    if (S.publishHistory.length > 25) S.publishHistory.length = 25;
    writeLive();
    S.draft.changes = [];
    audit('publish', 'catalog', `Published v${v} to customer web + mobile apps (${changes.length} change${changes.length === 1 ? '' : 's'})${note ? ' — ' + note : ''}`);
    notify(`Catalog v${v} is live in the customer apps`, '#/hq/publish');
    return v;
  }
  function writeLive() {
    const h = S.publishHistory[0]; if (!h) return;
    const tmp = S.catalog; S.catalog = clone(h.snapshot);
    const data = buildPayload(); S.catalog = tmp;
    try { localStorage.setItem(PUB_KEY, JSON.stringify({ v: h.v, at: h.at, data })); } catch (e) { console.warn(e); }
  }
  function rollback(v) {
    const h = S.publishHistory.find(x => x.v === v); if (!h) return;
    S.catalog = clone(h.snapshot); audit('rollback', 'catalog', `Restored draft from v${v}`); markDraft('catalog', `Rolled back draft to v${v}`);
  }
  // Operational changes (pause, prep time, 86'd items) go live immediately without a catalog publish.
  function liveStorePatch(storeId, patch, label) {
    const s = S.catalog.STORES.find(x => x.id === storeId); if (!s) return;
    Object.assign(s, patch);
    const h = S.publishHistory[0];
    if (h) { const ls = h.snapshot.STORES.find(x => x.id === storeId); if (ls) Object.assign(ls, clone(patch)); writeLive(); }
    audit('store.live', 'store:' + storeId, `${s.name}: ${label}`);
  }
  function summarize(ch) { const g = groupBy(ch, x => x.k); return Object.entries(g).map(([k, a]) => `${a.length} ${k.toLowerCase().replace('_', ' ')}`).join(' · '); }

  /* ---------------- approvals ---------------- */
  function requestApproval(type, title, detail, payload) {
    const a = { id: uid('ap'), type, title, detail, payload, at: Date.now(), by: me().name, byId: me().id, status: 'pending' };
    S.approvals.unshift(a); audit('approval.request', type, title); notify(`Approval requested: ${title}`, '#/hq/approvals');
    return a;
  }
  const APPROVAL_RUN = {}; // filled by modules: type -> fn(payload) applies the change
  function decide(id, ok, comment) {
    const a = S.approvals.find(x => x.id === id); if (!a || a.status !== 'pending') return;
    a.status = ok ? 'approved' : 'rejected'; a.decidedBy = me().name; a.decidedAt = Date.now(); a.comment = comment || '';
    if (ok && APPROVAL_RUN[a.type]) APPROVAL_RUN[a.type](a.payload, a);
    audit(ok ? 'approval.approve' : 'approval.reject', a.type, `${a.title}${comment ? ' — ' + comment : ''}`);
  }

  /* ---------------- live app orders (read-only bridge) ---------------- */
  function appOrders() {
    const out = [];
    APP_PREFIXES.forEach(px => ['guest', 'member'].forEach(j => {
      try {
        const raw = localStorage.getItem(px + j); if (!raw) return; const js = JSON.parse(raw);
        (js.orders || []).forEach(o => { if (o.sample) return; out.push(Object.assign({}, o, { _src: px.startsWith('modapp') ? 'Mobile app' : 'Web app', _journey: j })); });
      } catch (e) { /* ignore */ }
    }));
    return out;
  }
  function appStage(o) {
    const st = (S.catalog.CONFIG.stages || {})[o.mode]; if (!st) return 'received';
    if (o.canceled) return 'canceled';
    let start = o.createdAt;
    if (o.schedule && o.schedule.type === 'later' && o.schedule.slot) start = Math.max(o.createdAt, o.schedule.slot - (o.prepMin + (o.mode === 'delivery' ? 20 : 0)) * 6e4);
    if (Date.now() < start) return 'scheduled';
    const el = (Date.now() - start) / 1000; let id = st[0][0]; st.forEach(([sid, sec]) => { if (el >= sec) id = sid; }); return id;
  }
  // Normalised order list (seeded network orders + any orders placed in the customer apps on this browser).
  function allOrders() {
    const live = appOrders().map(o => ({
      id: o.id, live: true, src: o._src, storeId: o.storeId, createdAt: o.createdAt, mode: o.mode, channel: o._src === 'Mobile app' ? 'app' : 'web',
      customer: o.contact ? o.contact.name : 'Guest', email: o.contact ? o.contact.email : '', memberId: o._journey === 'member' ? 'm-sample' : null,
      lines: (o.lines || []).map(l => ({ name: l.name, qty: l.qty, total: l.total })), subtotal: o.totals.subtotal, discount: o.totals.discount, tax: o.totals.tax, tip: o.totals.tip,
      deliveryFee: o.totals.deliveryFee, total: o.totals.total, code: o.couponId ? (S.catalog.OFFERS.find(x => x.id === o.couponId) || {}).code : null,
      stage: appStage(o), points: o.pointsEstimate || 0, refunded: o.refund && o.refund.status === 'approved' ? o.refund.amount : 0, rating: o.feedback ? o.feedback.rating : null, prepMin: null, onTime: null
    }));
    return live.concat(S.orders);
  }
  const ACTIVE = ['scheduled', 'received', 'accepted', 'preparing', 'baking', 'ready', 'out'];
  const DONE = ['completed', 'delivered'];
  const STAGE_LABEL = { scheduled: 'Scheduled', received: 'New', accepted: 'Accepted', preparing: 'Preparing', baking: 'In the oven', ready: 'Ready for pickup', out: 'Out for delivery', delivered: 'Delivered', completed: 'Picked up', canceled: 'Canceled', refunded: 'Refunded' };
  function nextStage(o) {
    const flow = o.mode === 'delivery' ? ['received', 'accepted', 'preparing', 'baking', 'out', 'delivered'] : ['received', 'accepted', 'preparing', 'baking', 'ready', 'completed'];
    const i = flow.indexOf(o.stage); return i > -1 && i < flow.length - 1 ? flow[i + 1] : null;
  }

  /* ---------------- metrics ---------------- */
  function scope(orders, f = {}) {
    const from = f.days ? Date.now() - f.days * DAY : 0;
    return orders.filter(o => (!f.store || f.store === 'all' || o.storeId === f.store) && (!f.region || f.region === 'all' || regionOf(o.storeId) === f.region) && (!f.mode || f.mode === 'all' || o.mode === f.mode) && (!f.channel || f.channel === 'all' || o.channel === f.channel) && o.createdAt >= from);
  }
  function regionOf(sid) { const s = S.catalog.STORES.find(x => x.id === sid); return s ? (S.storeMeta[sid] || {}).region || 'Other' : 'Other'; }
  function metrics(orders) {
    const ok = orders.filter(o => o.stage !== 'canceled');
    const done = orders.filter(o => DONE.includes(o.stage));
    const net = sum(ok, o => o.subtotal - o.discount) - sum(orders, o => o.refunded || 0);
    const timed = done.filter(o => o.onTime != null);
    return {
      count: orders.length, net, gross: sum(ok, o => o.total), aov: ok.length ? Math.round(net / ok.length) : 0, canceled: orders.length - ok.length, completed: done.length,
      onTime: timed.length ? timed.filter(o => o.onTime).length / timed.length : null, active: orders.filter(o => ACTIVE.includes(o.stage)).length,
      delivery: ok.filter(o => o.mode === 'delivery').length, pickup: ok.filter(o => o.mode === 'pickup').length,
      discount: sum(ok, o => o.discount), tips: sum(ok, o => o.tip), prep: done.filter(o => o.prepMin).length ? Math.round(sum(done, o => o.prepMin) / done.filter(o => o.prepMin).length) : null,
      rating: ok.filter(o => o.rating).length ? sum(ok, o => o.rating) / ok.filter(o => o.rating).length : null, refunds: sum(orders, o => o.refunded || 0)
    };
  }
  function dailySeries(orders, days) {
    const out = []; const start = new Date(); start.setHours(0, 0, 0, 0);
    for (let i = days - 1; i >= 0; i--) {
      const d0 = start.getTime() - i * DAY, d1 = d0 + DAY; const os = orders.filter(o => o.createdAt >= d0 && o.createdAt < d1 && o.stage !== 'canceled');
      out.push({ t: d0, label: fmtShort(d0), net: sum(os, o => o.subtotal - o.discount), count: os.length });
    }
    return out;
  }

  /* ---------------- loyalty helpers ---------------- */
  const tiers = () => S.catalog.CONFIG.tiers;
  const tierOf = (lifetime) => { let t = tiers()[0]; tiers().forEach(x => { if (lifetime >= x.min) t = x; }); return t; };
  const pointValueCents = () => Math.round(S.catalog.REWARDS.filter(r => r.value && r.cost).reduce((a, r) => Math.min(a, r.value / r.cost), 1) * 100) / 100; // cheapest $ per point
  function liability() {
    const pts = sum(S.members.filter(m => m.status !== 'deleted'), m => m.points);
    const breakage = S.loyalty.breakageRate; const cpp = S.loyalty.costPerPoint; // cents per point, configured by finance
    return { points: pts, gross: Math.round(pts * cpp), net: Math.round(pts * cpp * (1 - breakage)) };
  }
  function adjustPoints(memberId, points, reason, type = 'adjust', meta = {}) {
    const m = S.members.find(x => x.id === memberId); if (!m) return;
    m.points = Math.max(0, m.points + points); if (points > 0 && type !== 'adjust') m.lifetime += points;
    S.ledger.unshift(Object.assign({ id: uid('lg'), memberId, at: Date.now(), type, points, reason, by: me().name }, meta));
    audit('points.' + type, 'member:' + memberId, `${points > 0 ? '+' : ''}${points} pts · ${m.name} · ${reason}`);
  }
  // Segment engine: evaluates rule rows against member profiles.
  const SEG_FIELDS = {
    recency: { label: 'Days since last order', type: 'num', get: m => m.lastOrder ? Math.floor((Date.now() - m.lastOrder) / DAY) : 9999 },
    frequency: { label: 'Orders in last 90 days', type: 'num', get: m => m.orders90 },
    orders: { label: 'Lifetime orders', type: 'num', get: m => m.orderCount },
    spend: { label: 'Lifetime spend ($)', type: 'num', get: m => Math.round(m.spend / 100) },
    points: { label: 'Points balance', type: 'num', get: m => m.points },
    joined: { label: 'Days since joined', type: 'num', get: m => Math.floor((Date.now() - m.joined) / DAY) },
    tier: { label: 'Tier', type: 'enum', opts: () => tiers().map(t => [t.id, t.name]), get: m => tierOf(m.lifetime).id },
    homeStore: { label: 'Home store', type: 'enum', opts: () => S.catalog.STORES.map(s => [s.id, s.name]), get: m => m.homeStore },
    daypart: { label: 'Usual day part', type: 'enum', opts: () => [['breakfast', 'Breakfast'], ['lunch', 'Lunch'], ['afternoon', 'Afternoon'], ['dinner', 'Dinner'], ['late', 'Late night']], get: m => m.daypart },
    weekday: { label: 'Usual day of week', type: 'enum', opts: () => DAYS.map((d, i) => [String(i), d]), get: m => String(m.weekday) },
    channel: { label: 'Preferred channel', type: 'enum', opts: () => [['app', 'Mobile app'], ['web', 'Web'], ['instore', 'In store']], get: m => m.channel },
    mode: { label: 'Usual fulfillment', type: 'enum', opts: () => [['pickup', 'Pickup'], ['delivery', 'Delivery']], get: m => m.mode },
    favCat: { label: 'Favorite category', type: 'enum', opts: () => S.catalog.CATEGORIES.map(c => [c.id, c.name]), get: m => m.favCat },
    birthMonth: { label: 'Birthday month', type: 'enum', opts: () => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((x, i) => [String(i), x]), get: m => m.birthMonth == null ? '' : String(m.birthMonth) },
    emailOk: { label: 'Email opt-in', type: 'bool', get: m => !!m.emailOk }, smsOk: { label: 'SMS opt-in', type: 'bool', get: m => !!m.smsOk }, pushOk: { label: 'Push enabled', type: 'bool', get: m => !!m.pushOk }
  };
  function segMatch(seg, m) {
    if (m.status === 'deleted' || m.status === 'blocked') return false;
    if (seg.ids) return seg.ids.includes(m.id);
    const rows = seg.rules || []; if (!rows.length) return true;
    const test = (r) => {
      const f = SEG_FIELDS[r.field]; if (!f) return true; const v = f.get(m);
      if (f.type === 'num') { const x = Number(r.value); return r.op === 'gte' ? v >= x : r.op === 'lte' ? v <= x : r.op === 'eq' ? v === x : r.op === 'between' ? v >= x && v <= Number(r.value2) : true; }
      if (f.type === 'bool') return String(v) === String(r.value);
      const vals = String(r.value).split(','); return r.op === 'not' ? !vals.includes(v) : vals.includes(v);
    };
    return seg.match === 'any' ? rows.some(test) : rows.every(test);
  }
  const segCount = (seg) => S.members.filter(m => segMatch(seg, m)).length;
  const segMembers = (seg) => S.members.filter(m => segMatch(seg, m));

  window.ADM = {
    get S() { return S; }, load, save, commit, reset, KEY, PUB_KEY,
    clone, uid, esc, money, num, pct, DAY, DAYS, fmtDate, fmtShort, fmtTime, fmtDT, isoDate, fromIso, rel, minToHHMM, hhmmToMin, minToInput, sum, by, groupBy,
    PERMS, ROLES, me, role, can, canStore, audit, notify,
    CATALOG_KEYS, markDraft, diff, publish, rollback, writeLive, liveStorePatch, buildPayload, rewardBlocked, publishedSnap,
    requestApproval, APPROVAL_RUN, decide,
    appOrders, allOrders, ACTIVE, DONE, STAGE_LABEL, nextStage, scope, metrics, dailySeries, regionOf,
    tierOf, tiers, liability, adjustPoints, pointValueCents, SEG_FIELDS, segMatch, segCount, segMembers
  };
})();
