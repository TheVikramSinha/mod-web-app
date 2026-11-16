/* MOD Back Office — seed data. Catalog comes from the shared customer-app data (../js/data.js) so HQ edits the
   exact objects the apps consume. Operational history (orders, members, tickets, campaigns) is generated with a
   fixed random seed so the demo is stable between resets. */
(function () {
  'use strict';
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const DAY = 864e5;

  function build() {
    const R = rng(20261116);
    const pick = (a) => a[Math.floor(R() * a.length)];
    const int = (a, b) => a + Math.floor(R() * (b - a + 1));
    const D = JSON.parse(JSON.stringify(window.MOD_DATA));
    const now = Date.now();
    const id = (p, n) => p + '-' + String(n).padStart(4, '0');

    /* ---------- catalog ---------- */
    const CONTENT = {
      announcement: { on: false, text: 'Holiday hours: some stores close early on Dec 24.', link: '#/menu', tone: 'info' },
      hero: { eyebrow: 'Fired in minutes · toppings included', title1: 'Your pizza.', title2: 'Your way.', text: 'Pile on what you love, split it down the middle, or grab a go-to in two taps. Every pizza is made on demand.', cta: 'Start your order' },
      onboarding: [
        { title: 'Made your way', text: 'Pile on unlimited toppings, split it half and half, and save your favourite builds.' },
        { title: 'Earn as you eat', text: 'Points on every order, a free pizza faster than you think.' }
      ],
      checkoutLoyalty: { lead: 'This order adds you to MOD Rewards.', optOutRewards: 'No thanks, I’ll skip my free pizza', optOutEmail: 'No thanks, I like paying full price', optOutSms: 'No thanks, I’d rather miss the secret deals' },
      support: { phone: '1-800-555-0199', email: 'help@modpizza.example', faq: [['How do points work?', 'Earn points on food, redeem for rewards.'], ['Can I change my order?', 'Until the store accepts it.']] },
      legal: { terms: 'Sample terms of use.', privacy: 'Sample privacy notice.' }
    };
    D.OFFERS.forEach(o => Object.assign(o, { status: o.end < now ? 'ended' : 'live', usage: { policy: o.limit === 1 ? 'oncePerCustomer' : 'perPeriod', perOrder: 1, perCustomer: o.limit || null, period: 'campaign' }, daysOfWeek: [], daypart: null, budget: null, franchiseOptOut: true }));
    D.REWARDS.forEach(r => Object.assign(r, { status: 'live', linkedProductId: null }));
    D.PRODUCTS.forEach((p, i) => Object.assign(p, { sku: 'SKU-' + (1000 + i), cost: Math.round((p.price || 0) * (0.24 + R() * 0.1)) }));
    const catalog = { CONFIG: D.CONFIG, STORES: D.STORES, INGREDIENTS: D.INGREDIENTS, PRODUCTS: D.PRODUCTS, BUILDER_PRODUCTS: D.BUILDER_PRODUCTS || [], CATEGORIES: D.CATEGORIES, OFFERS: D.OFFERS, REWARDS: D.REWARDS, CONTENT };

    const storeMeta = {
      s1: { region: 'Pacific Northwest', ownership: 'corporate', owner: 'MOD Pizza (corporate)', manager: 'Morgan Ellis', phone: '(206) 555-0110', opened: '2014-03-02', taxRate: 0.1025, posId: 'POS-1302' },
      s2: { region: 'Pacific Northwest', ownership: 'corporate', owner: 'MOD Pizza (corporate)', manager: 'Priya Natarajan', phone: '(425) 555-0144', opened: '2016-08-19', taxRate: 0.101, posId: 'POS-0575' },
      s3: { region: 'Mountain', ownership: 'franchise', owner: 'Front Range Pies LLC', manager: 'Diego Alvarez', phone: '(303) 555-0161', opened: '2018-05-11', taxRate: 0.0881, posId: 'POS-1600' },
      s4: { region: 'Midwest', ownership: 'franchise', owner: 'Lakeshore Slice Group', manager: 'Aisha Grant', phone: '(312) 555-0187', opened: '2019-10-03', taxRate: 0.1025, posId: 'POS-1100' },
      s5: { region: 'South', ownership: 'franchise', owner: 'Lakeshore Slice Group', manager: 'Tyler Brooks', phone: '(512) 555-0122', opened: '2020-02-14', taxRate: 0.0825, posId: 'POS-1500' },
      s6: { region: 'Northeast', ownership: 'corporate', owner: 'MOD Pizza (corporate)', manager: 'Hannah Cho', phone: '(212) 555-0175', opened: '2021-06-30', taxRate: 0.08875, posId: 'POS-0030' }
    };

    const users = [
      { id: 'u1', name: 'Alex Rivera', email: 'alex.rivera@modpizza.example', role: 'super', stores: [], status: 'active', mfa: true, lastActive: now - 3e5 },
      { id: 'u2', name: 'Sam Whitaker', email: 'sam.whitaker@modpizza.example', role: 'marketing', stores: [], status: 'active', mfa: true, lastActive: now - 2 * 36e5 },
      { id: 'u3', name: 'Charae Monroe', email: 'charae.monroe@modpizza.example', role: 'loyalty', stores: [], status: 'active', mfa: true, lastActive: now - 5 * 36e5 },
      { id: 'u4', name: 'Tim Okafor', email: 'tim.okafor@modpizza.example', role: 'ops', stores: [], status: 'active', mfa: true, lastActive: now - 26 * 36e5 },
      { id: 'u5', name: 'Marina Kowalski', email: 'marina.k@modpizza.example', role: 'finance', stores: [], status: 'active', mfa: true, lastActive: now - 3 * DAY },
      { id: 'u6', name: 'Morgan Ellis', email: 'morgan.ellis@modpizza.example', role: 'manager', stores: ['s1'], status: 'active', mfa: false, lastActive: now - 9e5 },
      { id: 'u7', name: 'Diego Alvarez', email: 'diego@frontrangepies.example', role: 'franchisee', stores: ['s3'], status: 'active', mfa: true, lastActive: now - 7 * 36e5 },
      { id: 'u8', name: 'Aisha Grant', email: 'aisha@lakeshoreslice.example', role: 'franchisee', stores: ['s4', 's5'], status: 'active', mfa: true, lastActive: now - 30 * 36e5 },
      { id: 'u9', name: 'Jordan Pike', email: 'jordan.pike@modpizza.example', role: 'marketing', stores: [], status: 'invited', mfa: false, lastActive: null }
    ];

    /* ---------- members ---------- */
    const FIRST = ['Alex', 'Sam', 'Jamie', 'Taylor', 'Jordan', 'Casey', 'Riley', 'Morgan', 'Avery', 'Quinn', 'Rowan', 'Harper', 'Elena', 'Marcus', 'Priya', 'Noah', 'Mia', 'Liam', 'Zoe', 'Ethan', 'Aiden', 'Chloe', 'Lucas', 'Isla', 'Mateo', 'Nora', 'Kai', 'Leah', 'Omar', 'Grace', 'Theo', 'Ava', 'Hugo', 'Maya', 'Felix', 'Ruby'];
    const LAST = ['Morgan', 'Johnson', 'Nguyen', 'Garcia', 'Patel', 'Kim', 'Smith', 'Brown', 'Lopez', 'Chen', 'Davis', 'Wilson', 'Martin', 'Clark', 'Lewis', 'Walker', 'Young', 'Allen', 'Wright', 'Scott', 'Hill', 'Green', 'Adams', 'Baker', 'Rivera', 'Shah', 'Ito', 'Okoro'];
    const stores = D.STORES.map(s => s.id);
    const cats = ['pizzas', 'pizzas', 'pizzas', 'salads', 'desserts', 'sides'];
    const members = [];
    members.push({ id: 'm-sample', name: 'Jordan Rivera', email: 'jordan.rivera@example.com', phone: '(206) 555-0142', joined: now - 410 * DAY, points: 1240, lifetime: 3100, homeStore: 's1', lastOrder: now - 2 * DAY, orderCount: 37, orders90: 9, spend: 104300, birthMonth: 4, daypart: 'dinner', weekday: 5, channel: 'app', mode: 'delivery', favCat: 'pizzas', emailOk: true, smsOk: true, pushOk: true, status: 'active', wallet: 2500, credit: 0, tags: ['Sample member'], flags: [], source: 'app' });
    for (let i = 1; i <= 260; i++) {
      const fn = pick(FIRST), ln = pick(LAST); const joined = now - int(5, 900) * DAY;
      const freq = R(); const orderCount = freq < 0.3 ? int(0, 2) : freq < 0.75 ? int(3, 15) : int(16, 70);
      const lapsed = R() < 0.28; const lastOrder = orderCount ? now - (lapsed ? int(61, 240) : int(0, 59)) * DAY - int(0, 20) * 36e5 : null;
      const spend = orderCount * int(1800, 3600); const lifetime = Math.round(spend / 100 * 10 * (1 + R() * 0.2));
      const redeemed = Math.round(lifetime * R() * 0.6);
      members.push({
        id: id('m', i), name: fn + ' ' + ln, email: (fn + '.' + ln + i).toLowerCase() + '@example.com', phone: `(${pick(['206', '425', '303', '312', '512', '212'])}) 555-${String(int(1000, 9999))}`,
        joined, points: Math.max(0, lifetime - redeemed), lifetime, homeStore: pick(stores), lastOrder, orderCount, orders90: lastOrder && now - lastOrder < 90 * DAY ? Math.min(orderCount, int(1, 12)) : 0, spend,
        birthMonth: R() < 0.7 ? int(0, 11) : null, daypart: pick(['lunch', 'lunch', 'dinner', 'dinner', 'dinner', 'afternoon', 'late']), weekday: int(0, 6), channel: pick(['app', 'app', 'web', 'instore']), mode: pick(['pickup', 'pickup', 'delivery']), favCat: pick(cats),
        emailOk: R() < 0.7, smsOk: R() < 0.4, pushOk: R() < 0.55, status: R() < 0.015 ? 'blocked' : 'active', wallet: R() < 0.12 ? int(5, 60) * 100 : 0, credit: R() < 0.05 ? 500 : 0,
        tags: [], flags: R() < 0.02 ? ['Velocity: 6 receipt claims in 24h'] : [], source: pick(['app', 'web', 'migrated', 'migrated', 'instore'])
      });
    }

    /* ---------- orders ---------- */
    const prods = D.PRODUCTS.filter(p => p.published !== false && p.price > 0);
    const orders = []; let on = 1;
    const ordersPerDay = { s1: 9, s2: 7, s3: 7, s4: 6, s5: 5, s6: 6 };
    const memberIds = members.filter(m => m.orderCount).map(m => m.id);
    const offers = D.OFFERS.filter(o => o.status === 'live');
    for (let d = 29; d >= 0; d--) {
      const day0 = new Date(now - d * DAY); day0.setHours(0, 0, 0, 0);
      D.STORES.forEach(s => {
        if (s.id === 's6' && d < 2) return; // Union Square paused
        let n = Math.round(ordersPerDay[s.id] * (0.7 + R() * 0.6) * ([5, 6].includes(day0.getDay()) ? 1.35 : 1) * (day0.getDay() === 2 ? 1.15 : 1));
        if (d === 0) n = Math.max(3, Math.round(n * Math.min(1, (new Date().getHours() + 1) / 22)));
        for (let k = 0; k < n; k++) {
          const hour = pick([11, 11, 12, 12, 12, 13, 14, 16, 17, 17, 18, 18, 18, 19, 19, 20, 21]);
          let t = day0.getTime() + hour * 36e5 + int(0, 59) * 6e4; if (t > now) t = now - int(1, 50) * 6e4;
          const mode = s.modes.includes('delivery') && R() < 0.55 ? 'delivery' : 'pickup';
          const lines = []; const nl = int(1, 3);
          for (let j = 0; j < nl; j++) { const p = pick(prods); const qty = R() < 0.8 ? 1 : 2; lines.push({ productId: p.id, name: p.name, qty, total: Math.round(p.price * s.priceFactor) * qty }); }
          const subtotal = lines.reduce((a, l) => a + l.total, 0);
          const off = R() < 0.18 ? pick(offers) : null; const discount = off ? Math.min(Math.round(subtotal * 0.15), 1000) : 0;
          const tax = Math.round((subtotal - discount) * storeMeta[s.id].taxRate); const tip = Math.round((subtotal - discount) * pick([0, 0.15, 0.18, 0.2]));
          const fee = mode === 'delivery' ? s.deliveryFee || 0 : 0; const total = subtotal - discount + tax + tip + fee;
          const member = R() < 0.62 ? members.find(m => m.id === pick(memberIds)) : null;
          const age = (now - t) / 6e4; let stage;
          if (age < 4) stage = 'received'; else if (age < 7) stage = 'accepted'; else if (age < 13) stage = 'preparing'; else if (age < 20) stage = 'baking'; else if (age < 32) stage = mode === 'delivery' ? 'out' : 'ready';
          else stage = mode === 'delivery' ? 'delivered' : 'completed';
          if (age > 60 && R() < 0.035) stage = 'canceled';
          const prepMin = int(Math.max(8, s.prepMin - 6), s.prepMin + 12);
          orders.push({
            id: 'MOD-' + String(300000 + on++), storeId: s.id, createdAt: t, mode, channel: pick(['app', 'app', 'web', 'web', 'kiosk']), customer: member ? member.name : pick(FIRST) + ' ' + pick(LAST)[0] + '.', email: member ? member.email : '',
            memberId: member ? member.id : null, lines, subtotal, discount, tax, tip, deliveryFee: fee, total, code: off ? off.code : null, offerId: off ? off.id : null, stage,
            points: member ? Math.round((subtotal - discount) / 100 * 10) : 0, refunded: stage !== 'canceled' && R() < 0.012 ? Math.round(total * 0.5) : 0,
            rating: ['delivered', 'completed'].includes(stage) && R() < 0.3 ? pick([5, 5, 5, 4, 4, 3, 2]) : null, prepMin: ['delivered', 'completed'].includes(stage) ? prepMin : null,
            onTime: ['delivered', 'completed'].includes(stage) ? prepMin <= s.prepMin + 5 : null, driver: mode === 'delivery' ? pick(['Jamie R.', 'Chris P.', 'DoorDash Drive', 'Uber Direct']) : null,
            notes: R() < 0.08 ? pick(['Allergy: tree nuts', 'Extra napkins please', 'Gate code 4411', 'Cut in squares']) : ''
          });
        }
      });
    }
    orders.sort((a, b) => b.createdAt - a.createdAt);

    /* ---------- points ledger ---------- */
    const ledger = [];
    orders.filter(o => o.memberId && ['delivered', 'completed'].includes(o.stage)).slice(0, 600).forEach(o => ledger.push({ id: 'lg-' + o.id, memberId: o.memberId, at: o.createdAt + 40 * 6e4, type: 'earn', points: o.points, orderId: o.id, storeId: o.storeId, reason: 'Order completed', by: 'System' }));
    members.slice(0, 120).forEach((m, i) => { if (i % 4 === 0 && m.lifetime > 1500) ledger.push({ id: 'lg-r' + i, memberId: m.id, at: now - int(1, 60) * DAY, type: 'redeem', points: -pick([500, 600, 1500]), reason: pick(['$5 off your order', 'Free dessert', 'Free pizza']), by: 'System' }); });
    ledger.push({ id: 'lg-adj1', memberId: 'm-0012', at: now - 3 * DAY, type: 'adjust', points: 300, reason: 'Service recovery — late delivery', by: 'Morgan Ellis', storeId: 's1' });
    ledger.push({ id: 'lg-exp1', memberId: 'm-0044', at: now - 6 * DAY, type: 'expire', points: -820, reason: '12 months without activity', by: 'System' });
    ledger.push({ id: 'lg-bon1', memberId: 'm-sample', at: now - 9 * DAY, type: 'bonus', points: 200, reason: 'Welcome bonus', by: 'System' });
    ledger.sort((a, b) => b.at - a.at);

    /* ---------- support ---------- */
    const ISSUES = [['Late delivery', 'delivery'], ['Missing item', 'order'], ['Wrong toppings', 'order'], ['Cold food', 'quality'], ['Points not credited', 'loyalty'], ['Promo code not working', 'loyalty'], ['Charged twice', 'payment'], ['Allergy concern', 'safety'], ['Rude driver', 'delivery'], ['App crashed at checkout', 'app']];
    const tickets = [];
    for (let i = 1; i <= 34; i++) {
      const o = pick(orders.slice(0, 400)); const [issue, cat] = pick(ISSUES); const age = int(0, 9) * DAY + int(0, 23) * 36e5;
      const status = i < 12 ? 'open' : i < 18 ? 'pending' : 'resolved';
      tickets.push({
        id: 'TCK-' + (5100 + i), at: now - age, orderId: o.id, storeId: o.storeId, customer: o.customer, memberId: o.memberId, channel: pick(['In-app chat', 'Email', 'Phone', 'Social']), issue, cat,
        priority: cat === 'safety' || cat === 'payment' ? 'high' : pick(['normal', 'normal', 'low', 'high']), status, assignee: status === 'open' && R() < 0.4 ? null : pick(['Tim Okafor', 'Morgan Ellis', 'Support bot', 'Aisha Grant']),
        sla: now - age + (cat === 'safety' ? 2 : 24) * 36e5,
        messages: [{ from: 'customer', at: now - age, text: `${issue}. Order ${o.id}.` }].concat(status !== 'open' ? [{ from: 'agent', at: now - age + 36e5, text: 'Sorry about that — we’re on it.' }] : []),
        resolution: status === 'resolved' ? pick([{ type: 'credit', amount: 500 }, { type: 'points', amount: 300 }, { type: 'refund', amount: 899 }, { type: 'none' }]) : null
      });
    }

    /* ---------- loyalty program ---------- */
    const loyalty = {
      programName: 'MOD Rewards', status: 'live', earnBasis: 'food', rounding: 'floor', pendingUntil: 'completed', excludeTaxTipsFees: true,
      expiry: { enabled: true, months: 12, warnDays: 30, rule: 'inactivity' }, signupBonus: 100, birthday: { enabled: true, rewardId: 'r-dessert', daysValid: 14 },
      homeStore: { enabled: true, changeCooldownDays: 30 }, maxRedemptionsPerOrder: 1, combineWithCoupons: false, adjustApprovalThreshold: 1000, refundApprovalThreshold: 5000,
      storeRecoveryLimit: { credit: 1000, points: 500 }, costPerPoint: 0.5, breakageRate: 0.22,
      walletPolicy: { dormantMonths: 24, action: 'notify', notify: ['Finance', 'Legal'] }, stealth: { on: true, allowlist: ['tim.okafor@modpizza.example', 'charae.monroe@modpizza.example', 'flavio@modpizza.example'], migrationSource: 'Punchh', migrated: 186, pending: 12 },
      fraud: { maxReceiptClaimsPerDay: 3, maxAdjustPerDay: 2000, holdNewAccountsHours: 0 }
    };
    const segments = [
      { id: 'seg-lapsed60', name: 'Lapsed 60–90 days', match: 'all', rules: [{ field: 'recency', op: 'between', value: 60, value2: 90 }, { field: 'orders', op: 'gte', value: 2 }], updatedAt: now - 5 * DAY, by: 'Charae Monroe' },
      { id: 'seg-lapsed90', name: 'Lapsed 90+ days', match: 'all', rules: [{ field: 'recency', op: 'gte', value: 90 }], updatedAt: now - 5 * DAY, by: 'Charae Monroe' },
      { id: 'seg-vip', name: 'Gold & high frequency', match: 'all', rules: [{ field: 'tier', op: 'in', value: 'gold' }, { field: 'frequency', op: 'gte', value: 4 }], updatedAt: now - 12 * DAY, by: 'Sam Whitaker' },
      { id: 'seg-lunch', name: 'Weekday lunch regulars', match: 'all', rules: [{ field: 'daypart', op: 'in', value: 'lunch' }, { field: 'weekday', op: 'in', value: '1,2,3,4,5' }], updatedAt: now - 20 * DAY, by: 'Sam Whitaker' },
      { id: 'seg-new', name: 'New — no second order', match: 'all', rules: [{ field: 'joined', op: 'lte', value: 30 }, { field: 'orders', op: 'lte', value: 1 }], updatedAt: now - 2 * DAY, by: 'Charae Monroe' },
      { id: 'seg-denver', name: 'Denver home store', match: 'all', rules: [{ field: 'homeStore', op: 'in', value: 's3' }], updatedAt: now - 30 * DAY, by: 'Diego Alvarez' },
      { id: 'seg-salad', name: 'Salad lovers', match: 'all', rules: [{ field: 'favCat', op: 'in', value: 'salads' }], updatedAt: now - 15 * DAY, by: 'Sam Whitaker' },
      { id: 'seg-all', name: 'All active members', match: 'all', rules: [], updatedAt: now - 40 * DAY, by: 'System' }
    ];
    const campaigns = [
      { id: 'cmp-1', name: 'Holiday cycle 1 · Gift a pizza', cycle: 'Holiday 2026 · Cycle 1', objective: 'Revenue', status: 'live', channels: ['push', 'email', 'inapp'], segmentId: 'seg-all', offerId: 'o-two', start: now - 6 * DAY, end: now + 8 * DAY, budget: 1500000, stores: null, franchiseOptOut: true, ab: { on: true, split: 50, variantB: 'Any 2 pizzas for $23' }, message: { title: 'Two pizzas, one great night', body: 'Any 2 pizzas for $25 — this week only.' }, results: { sent: 18420, opened: 6210, redeemed: 1288, revenue: 3964000, incremental: 0.11 }, owner: 'Sam Whitaker', approvedBy: 'Marina Kowalski' },
      { id: 'cmp-2', name: 'Double Points Tuesday', cycle: 'Evergreen', objective: 'Frequency', status: 'live', channels: ['push', 'inapp'], segmentId: 'seg-all', offerId: null, bonusEventId: 'be-1', start: now - 60 * DAY, end: now + 120 * DAY, budget: null, stores: null, franchiseOptOut: true, ab: { on: false }, message: { title: 'It’s Double Points Tuesday', body: 'Earn 2× points on every order today.' }, results: { sent: 52000, opened: 14800, redeemed: 4120, revenue: 11240000, incremental: 0.07 }, owner: 'Charae Monroe', approvedBy: 'Marina Kowalski' },
      { id: 'cmp-3', name: 'Win-back · We miss you', cycle: 'Always on', objective: 'Reactivation', status: 'live', channels: ['email', 'sms'], segmentId: 'seg-lapsed60', offerId: 'o-welcome', start: now - 90 * DAY, end: now + 180 * DAY, budget: 800000, stores: null, franchiseOptOut: false, ab: { on: false }, message: { title: 'It’s been a while', body: '20% off your next order — come back for a slice.' }, results: { sent: 9310, opened: 3020, redeemed: 611, revenue: 1690000, incremental: 0.18 }, owner: 'Charae Monroe', approvedBy: 'Marina Kowalski' },
      { id: 'cmp-4', name: 'Holiday cycle 2 · Dessert drop', cycle: 'Holiday 2026 · Cycle 2', objective: 'Basket size', status: 'scheduled', channels: ['push', 'inapp'], segmentId: 'seg-all', offerId: 'o-sweet', start: now + 9 * DAY, end: now + 23 * DAY, budget: 600000, stores: null, franchiseOptOut: true, ab: { on: false }, message: { title: 'Dessert’s on us', body: 'Free dessert with any pizza.' }, results: null, owner: 'Sam Whitaker', approvedBy: 'Marina Kowalski' },
      { id: 'cmp-5', name: 'Mile High local', cycle: 'Local · Denver', objective: 'Traffic', status: 'live', channels: ['push'], segmentId: 'seg-denver', offerId: 'o-milehigh', start: now - 20 * DAY, end: now + 40 * DAY, budget: 150000, stores: ['s3'], franchiseOptOut: false, ab: { on: false }, message: { title: 'Denver, this one’s for you', body: '15% off at LoDo.' }, results: { sent: 2140, opened: 820, redeemed: 133, revenue: 412000, incremental: 0.09 }, owner: 'Diego Alvarez', approvedBy: 'Sam Whitaker' },
      { id: 'cmp-6', name: 'Holiday cycle 3 · Party packs', cycle: 'Holiday 2026 · Cycle 3', objective: 'Revenue', status: 'draft', channels: ['email'], segmentId: 'seg-vip', offerId: null, start: now + 24 * DAY, end: now + 36 * DAY, budget: 900000, stores: null, franchiseOptOut: true, ab: { on: false }, message: { title: 'Feed the party', body: '' }, results: null, owner: 'Sam Whitaker' },
      { id: 'cmp-7', name: 'Summer 15', cycle: 'Summer 2026', objective: 'Traffic', status: 'ended', channels: ['push', 'email'], segmentId: 'seg-all', offerId: 'o-summer', start: now - 160 * DAY, end: now - 75 * DAY, budget: 1200000, stores: null, franchiseOptOut: true, ab: { on: false }, message: { title: 'Summer special', body: '15% off.' }, results: { sent: 41000, opened: 12900, redeemed: 3010, revenue: 8420000, incremental: 0.06 }, owner: 'Sam Whitaker', approvedBy: 'Marina Kowalski' },
      { id: 'cmp-8', name: 'Lunch rush booster', cycle: 'Q4 2026', objective: 'Day part', status: 'pending', channels: ['push'], segmentId: 'seg-lunch', offerId: 'o-pickup', start: now + 3 * DAY, end: now + 33 * DAY, budget: 300000, stores: null, franchiseOptOut: true, ab: { on: false }, message: { title: 'Lunch, sorted', body: '$5 off pickup 11–2.' }, results: null, owner: 'Sam Whitaker' }
    ];
    const bonusEvents = [
      { id: 'be-1', name: 'Double Points Tuesday', kind: 'multiplier', mult: 2, points: 0, days: [2], from: 0, to: 1440, stores: null, tiers: null, segmentId: null, start: now - 60 * DAY, end: now + 120 * DAY, status: 'live', stack: false },
      { id: 'be-2', name: 'Lunch bonus +50', kind: 'fixed', mult: 1, points: 50, days: [1, 2, 3, 4, 5], from: 660, to: 840, stores: ['s1', 's2'], tiers: null, segmentId: null, start: now - 10 * DAY, end: now + 20 * DAY, status: 'live', stack: true },
      { id: 'be-3', name: 'Gold triple points weekend', kind: 'multiplier', mult: 3, points: 0, days: [0, 6], from: 0, to: 1440, stores: null, tiers: ['gold'], segmentId: null, start: now + 12 * DAY, end: now + 14 * DAY, status: 'scheduled', stack: false }
    ];
    const journeys = [
      { id: 'jr-welcome', name: 'Welcome series', trigger: 'signup', triggerValue: null, status: 'active', exitOn: 'firstOrder', steps: [{ delay: 0, channel: 'email', text: 'Welcome to MOD Rewards — 100 bonus points are waiting.', offerId: null, points: 100 }, { delay: 3, channel: 'push', text: 'Your first pizza is calling.', offerId: 'o-welcome', points: 0 }], stats: { entered: 1840, converted: 612 } },
      { id: 'jr-second', name: 'Second-order nudge', trigger: 'firstOrder', triggerValue: null, status: 'active', exitOn: 'order', steps: [{ delay: 7, channel: 'push', text: 'Round two? Here’s $5 off pickup.', offerId: 'o-pickup', points: 0 }], stats: { entered: 920, converted: 251 } },
      { id: 'jr-lapse60', name: 'Lapsed 60 days', trigger: 'lapsed', triggerValue: 60, status: 'active', exitOn: 'order', steps: [{ delay: 0, channel: 'email', text: 'We miss you — 20% off.', offerId: 'o-welcome', points: 0 }, { delay: 10, channel: 'sms', text: 'Last call: 20% off ends Sunday.', offerId: 'o-welcome', points: 0 }], stats: { entered: 2210, converted: 287 } },
      { id: 'jr-lapse90', name: 'Lapsed 90 days · bigger hook', trigger: 'lapsed', triggerValue: 90, status: 'active', exitOn: 'order', steps: [{ delay: 0, channel: 'email', text: 'A free dessert to say come back.', offerId: 'o-sweet', points: 250 }], stats: { entered: 1460, converted: 102 } },
      { id: 'jr-bday', name: 'Birthday treat', trigger: 'birthday', triggerValue: 7, status: 'active', exitOn: 'none', steps: [{ delay: 0, channel: 'push', text: 'Happy birthday! A free dessert is in your rewards.', offerId: null, points: 0 }], stats: { entered: 540, converted: 301 } },
      { id: 'jr-tier', name: 'Tier upgrade celebration', trigger: 'tierUp', triggerValue: null, status: 'paused', exitOn: 'none', steps: [{ delay: 0, channel: 'inapp', text: 'You just reached a new tier!', offerId: null, points: 0 }], stats: { entered: 88, converted: 0 } }
    ];

    /* ---------- store ops ---------- */
    const ROLES_STAFF = ['Shift lead', 'Pizza maker', 'Pizza maker', 'Cashier', 'Dish & prep', 'Driver'];
    const staff = [];
    D.STORES.forEach((s, si) => { for (let k = 0; k < 6; k++) staff.push({ id: `st-${s.id}-${k}`, storeId: s.id, name: pick(FIRST) + ' ' + pick(LAST), role: ROLES_STAFF[k], shift: pick(['Open 9–5', 'Mid 11–7', 'Close 4–12']), onShift: R() < 0.6, phone: `(555) 01${si}${k}-${int(10, 99)}` }); });
    const checklistTpl = ['Opening food-safety check', 'Prep line stocked and labeled', 'Oven temp logged (≥ 600°F)', 'Check delivery handoff shelf', 'Curbside signage out', 'Mid-shift sanitizer change', 'End-of-shift waste count', 'Cash drawer count'];
    const checklists = {}; D.STORES.forEach(s => { checklists[s.id] = checklistTpl.map((t, i) => ({ id: s.id + '-c' + i, text: t, done: i < 2, by: i < 2 ? storeMeta[s.id].manager : null, at: i < 2 ? now - (8 - i) * 36e5 : null })); });

    const approvals = [
      { id: 'ap-1', type: 'campaign.launch', title: 'Launch “Lunch rush booster”', detail: '$5 off pickup 11–2 · Weekday lunch regulars · budget $3,000', payload: { id: 'cmp-8' }, at: now - 5 * 36e5, by: 'Sam Whitaker', status: 'pending' },
      { id: 'ap-2', type: 'points.adjust', title: '+1,500 pts for Elena Garcia', detail: 'Migration correction from Punchh balance export', payload: { memberId: 'm-0021', points: 1500, reason: 'Migration correction from Punchh balance export' }, at: now - 26 * 36e5, by: 'Charae Monroe', status: 'pending' },
      { id: 'ap-3', type: 'refund', title: 'Refund $64.20 on MOD-300212', detail: 'Charged twice · Union Square', payload: { orderId: 'MOD-300212', amount: 6420 }, at: now - 3 * DAY, by: 'Tim Okafor', status: 'approved', decidedBy: 'Marina Kowalski', decidedAt: now - 3 * DAY + 36e5 }
    ];
    const auditSeed = [
      [6 * 36e5, 'Sam Whitaker', 'Marketing manager', 'campaign.update', 'campaign:cmp-1', 'Holiday cycle 1: A/B split set to 50/50'],
      [26 * 36e5, 'Charae Monroe', 'Loyalty manager', 'approval.request', 'points.adjust', '+1,500 pts for Elena Garcia'],
      [2 * DAY, 'Tim Okafor', 'Operations', 'store.live', 'store:s6', 'Union Square: paused online ordering (equipment repair)'],
      [3 * DAY, 'Marina Kowalski', 'Finance (approver)', 'approval.approve', 'refund', 'Refund $64.20 on MOD-300212'],
      [4 * DAY, 'Alex Rivera', 'Super admin', 'publish', 'catalog', 'Published v1 to customer web + mobile apps (baseline)'],
      [5 * DAY, 'Diego Alvarez', 'Franchise owner', 'franchise.optout', 'offer:o-sweet', 'LoDo opted out of SWEETDEAL']
    ].map(([ago, user, roleName, action, entity, detail], i) => ({ id: 'au-s' + i, at: now - ago, user, role: roleName, action, entity, detail, userId: null }));

    const integrations = [
      { id: 'pos', name: 'Point of sale', vendor: 'Toast POS', status: 'connected', lastSync: now - 4 * 6e4, note: 'Menu + order injection, 6/6 stores' },
      { id: 'pay', name: 'Payments', vendor: 'Stripe (test mode)', status: 'connected', lastSync: now - 6e4, note: 'Cards, Apple Pay, Google Pay' },
      { id: 'dsp', name: 'Delivery dispatch', vendor: 'DoorDash Drive · Uber Direct', status: 'degraded', lastSync: now - 18 * 6e4, note: 'Uber Direct quotes timing out in Chicago' },
      { id: 'crm', name: 'Messaging', vendor: 'Braze', status: 'connected', lastSync: now - 9 * 6e4, note: 'Push, email, SMS, in-app' },
      { id: 'loy', name: 'Legacy loyalty', vendor: 'Punchh (migration)', status: 'read-only', lastSync: now - 2 * DAY, note: 'Balances frozen · nightly reconciliation' },
      { id: 'olo', name: 'Ordering platform', vendor: 'Olo (reference)', status: 'not connected', lastSync: null, note: 'Evaluation only' },
      { id: 'erp', name: 'Finance / ERP', vendor: 'NetSuite', status: 'connected', lastSync: now - 36e5, note: 'Daily sales + liability journal' }
    ];
    const settings = { brandName: 'MOD Pizza', currency: 'USD', timezone: 'America/Los_Angeles', supportHours: '9am–10pm local', session: { timeoutMin: 30, requireMfa: true, ipAllowlist: '' }, dataRetentionDays: 730, piiMasking: true, orderAutoAcceptSec: 45, maxActivePerStore: 40 };

    const S = {
      schema: 3, createdAt: now, session: { userId: 'u1' }, catalog, storeMeta, users, members, orders, ledger, tickets, loyalty, segments, campaigns, bonusEvents, journeys,
      franchise: { optOuts: { 'o-sweet': ['s3'] }, variants: { 'o-two': { s6: 2700, s5: 2300 } }, requests: [] },
      staff, checklists, approvals, audit: auditSeed, notifications: [{ id: 'n0', at: now - 5 * 36e5, text: 'Approval requested: Launch “Lunch rush booster”', link: '#/hq/approvals', read: false }, { id: 'n1', at: now - 18 * 6e4, text: 'Uber Direct quotes timing out in Chicago', link: '#/hq/integrations', read: false }],
      integrations, settings, draft: { changes: [] }, publishHistory: [], savedViews: {}
    };
    S.publishHistory.push({ v: 1, at: now - 4 * DAY, by: 'Alex Rivera', note: 'Baseline from the current customer apps', changes: 0, summary: 'Baseline', snapshot: JSON.parse(JSON.stringify(catalog)) });
    return S;
  }
  window.ADM_SEED = { build };
})();
