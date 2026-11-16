/* MOD Back Office — HQ daily operations: overview, orders, fulfillment board, support inbox, stores, compare, reports. */
(function () {
  'use strict';
  const A = window.ADM, U = window.UI, APP = window.APP; const { PAGES, ACT, FORM } = APP; const esc = A.esc, icon = U.icon, money = A.money;
  const F = { region: 'all', store: 'all', days: 7, mode: 'all', channel: 'all' };
  const S = () => A.S;
  const store = (id) => S().catalog.STORES.find(s => s.id === id) || { name: id || '—', city: '' };
  const regions = () => Array.from(new Set(Object.values(S().storeMeta).map(m => m.region)));
  APP.storeName = (id) => store(id).name;
  APP.F = F;

  function filterBar(opts = {}) {
    const sel = (k, label, options) => `<label class="fb"><span>${label}</span><select data-change="flt" data-k="${k}">${options.map(([v, l]) => `<option value="${v}" ${String(F[k]) === String(v) ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></label>`;
    return `<div class="filterbar card">${sel('region', 'Region', [['all', 'All regions']].concat(regions().map(r => [r, r])))}${sel('store', 'Store', [['all', 'All stores · network']].concat(S().catalog.STORES.filter(s => F.region === 'all' || A.regionOf(s.id) === F.region).map(s => [s.id, s.name])))}
      ${opts.days !== false ? sel('days', 'Period', [[1, 'Today'], [7, 'Last 7 days'], [14, 'Last 14 days'], [30, 'Last 30 days']]) : ''}${sel('mode', 'Fulfillment', [['all', 'All'], ['pickup', 'Pickup'], ['delivery', 'Delivery']])}${opts.channel !== false ? sel('channel', 'Channel', [['all', 'All'], ['app', 'Mobile app'], ['web', 'Web'], ['kiosk', 'Kiosk']]) : ''}</div>`;
  }
  APP.CHANGE.flt = (el) => { F[el.dataset.k] = el.dataset.k === 'days' ? Number(el.value) : el.value; if (el.dataset.k === 'region') F.store = 'all'; Object.values(U.TS).forEach(t => { t.page = 1; }); APP.render(); };
  APP.filterBar = filterBar;
  const scoped = () => A.scope(A.allOrders(), F);
  const prevScoped = () => { const all = A.allOrders(); const to = Date.now() - F.days * A.DAY, from = to - F.days * A.DAY; return A.scope(all, Object.assign({}, F, { days: 0 })).filter(o => o.createdAt >= from && o.createdAt < to); };
  const trend = (a, b) => b ? (a - b) / b : null;

  /* ================= Overview ================= */
  PAGES['hq/overview'] = (r) => {
    if (!A.can('reports.view')) return APP.locked('reports.view');
    const os = scoped(), m = A.metrics(os), pm = A.metrics(prevScoped());
    const stores = S().catalog.STORES; const open = stores.filter(s => s.accepting).length;
    const series = A.dailySeries(os, Math.max(7, F.days));
    const attn = [];
    stores.filter(s => !s.accepting).forEach(s => attn.push(['alert', `${s.name} is paused`, s.pausedReason || 'Online ordering paused', `#/hq/stores?edit=${s.id}`, 'warn']));
    const pa = S().approvals.filter(a => a.status === 'pending'); if (pa.length) attn.push(['shield', `${pa.length} approval${pa.length > 1 ? 's' : ''} waiting`, pa.map(a => a.title).slice(0, 2).join(' · '), '#/hq/approvals', 'info']);
    const hi = S().tickets.filter(t => t.status !== 'resolved' && (t.priority === 'high' || t.sla < Date.now())); if (hi.length) attn.push(['chat', `${hi.length} support ticket${hi.length > 1 ? 's' : ''} at risk`, 'High priority or past SLA', '#/hq/support', 'err']);
    S().integrations.filter(i => i.status === 'degraded').forEach(i => attn.push(['plug', `${i.name} degraded`, i.note, '#/hq/integrations', 'warn']));
    const d = A.diff().length; if (d) attn.push(['rocket', `${d} unpublished catalog change${d > 1 ? 's' : ''}`, 'Customers still see the last published version', '#/hq/publish', 'info']);
    S().catalog.OFFERS.filter(o => o.status === 'live' && o.end > Date.now() && o.end - Date.now() < 10 * A.DAY).forEach(o => attn.push(['tag', `${o.code} ends ${A.rel(o.end)}`, o.title, `#/hq/offers?edit=${o.id}`, 'info']));
    const out86 = A.sum(stores, s => s.outProducts.length + s.outIngredients.length); if (out86) attn.push(['pizza', `${out86} items or ingredients unavailable`, stores.filter(s => s.outProducts.length + s.outIngredients.length).map(s => s.name).join(', '), '#/hq/stores', 'muted']);
    const byStore = stores.map(s => { const so = os.filter(o => o.storeId === s.id); return Object.assign({ s }, A.metrics(so)); });
    const items = {}; os.filter(o => o.stage !== 'canceled').forEach(o => o.lines.forEach(l => { items[l.name] = (items[l.name] || 0) + l.qty; }));
    const top = Object.entries(items).sort((a, b) => b[1] - a[1]).slice(0, 7).map(([label, v]) => ({ label, v }));
    return `${U.pageHead('Network operations', 'Network overview', `${F.store === 'all' ? `All ${stores.length} locations` : esc(store(F.store).name)} · ${F.days === 1 ? 'today' : 'last ' + F.days + ' days'} · illustrative data${A.appOrders().length ? ` · includes ${A.appOrders().length} live app order${A.appOrders().length > 1 ? 's' : ''}` : ''}`, `${U.badge(`${open} / ${stores.length} accepting orders`, open === stores.length ? 'ok' : 'warn')}<button class="btn secondary sm" data-act="ov-export">${icon('download')}Export orders</button>`)}
      ${filterBar()}
      <div class="kpis">${U.kpi('Net sales', money(m.net, { whole: true }), 'Excl. tax, fees, tips, cancels', { trend: trend(m.net, pm.net), href: '#/hq/reports' })}${U.kpi('Orders', A.num(m.count), `${A.num(m.completed)} completed · ${m.canceled} canceled`, { trend: trend(m.count, pm.count), href: '#/hq/orders' })}${U.kpi('Average order', money(m.aov), 'Net / non-canceled order', { trend: trend(m.aov, pm.aov) })}${U.kpi('On-time', A.pct(m.onTime), `Avg prep ${m.prep || '—'} min`, { tone: m.onTime != null && m.onTime < 0.8 ? 'warn' : '' })}${U.kpi('Active now', A.num(m.active), 'In the kitchen or on the way', { href: '#/hq/fulfillment' })}${U.kpi('Guest rating', m.rating ? m.rating.toFixed(2) + ' ★' : '—', `${money(m.refunds)} refunded`)}</div>
      <div class="grid g-2-1">
        <section class="card"><div class="card-h"><h2>Sales, day by day</h2>${U.badge(series.length + ' days')}</div>${U.bars(series.map(x => ({ label: x.label.replace(/^[A-Za-z]+ /, (s) => s), v: x.net })), { fmt: (v) => money(v, { whole: true }), axis: (v) => '$' + Math.round(v / 100).toLocaleString(), label: 'Net sales by day' })}</section>
        <section class="card"><div class="card-h"><h2>Fulfillment & channel</h2></div>${U.donut([{ label: 'Delivery', v: m.delivery }, { label: 'Pickup', v: m.pickup }], { centerLabel: 'orders' })}
          ${U.hbars([['app', 'Mobile app'], ['web', 'Web'], ['kiosk', 'Kiosk']].map(([k, l]) => ({ label: l, v: os.filter(o => o.channel === k).length })))}<a class="link" href="#/hq/fulfillment">Open fulfillment board ${icon('chevR')}</a></section>
      </div>
      <div class="grid g-1-1">
        <section class="card"><div class="card-h"><h2>Needs attention</h2>${U.badge(attn.length, attn.length ? 'warn' : 'ok')}</div>${attn.length ? `<ul class="attn">${attn.map(([ic, t, s, h, tone]) => `<li class="a-${tone}"><a href="${h}">${icon(ic)}<span><strong>${esc(t)}</strong><small>${esc(s)}</small></span>${icon('chevR')}</a></li>`).join('')}</ul>` : U.empty('check', 'All clear', 'Nothing needs you right now.')}</section>
        <section class="card"><div class="card-h"><h2>Top items</h2><a class="link" href="#/hq/reports?tab=items">Item mix ${icon('chevR')}</a></div>${top.length ? U.hbars(top) : U.empty('pizza', 'No sales in this period')}</section>
      </div>
      <section class="card"><div class="card-h"><h2>Store performance</h2><a class="link" href="#/hq/compare">Compare stores ${icon('chevR')}</a></div>
        ${U.table({ id: 'ov-stores', noTools: true, noPage: true, rows: byStore, key: (x) => x.s.id, rowAct: 'ov-store',
          cols: [{ k: 'name', label: 'Store', render: (x) => `<strong>${esc(x.s.name)}</strong><small class="block muted">${esc(x.s.city)} · ${esc(A.regionOf(x.s.id))}</small>`, sortVal: x => x.s.name }, { k: 'net', label: 'Net sales', align: 'r', render: x => money(x.net, { whole: true }) }, { k: 'count', label: 'Orders', align: 'r', render: x => A.num(x.count) }, { k: 'aov', label: 'AOV', align: 'r', render: x => money(x.aov) }, { k: 'onTime', label: 'On-time', align: 'r', render: x => `<span class="${x.onTime != null && x.onTime < 0.8 ? 'warn-t' : ''}">${A.pct(x.onTime)}</span>`, sortVal: x => x.onTime || 0 }, { k: 'rating', label: 'Rating', align: 'r', render: x => x.rating ? x.rating.toFixed(1) + ' ★' : '—', sortVal: x => x.rating || 0 }, { k: 'st', label: 'Status', render: x => U.status(x.s.accepting ? 'live' : 'paused', x.s.accepting ? 'Accepting' : 'Paused'), nosort: true }] })}</section>`;
  };
  ACT['ov-store'] = (el) => { F.store = el.dataset.id; APP.render(); };
  ACT['ov-export'] = () => { ordersCsv(scoped()); };
  function ordersCsv(os) {
    const rows = [['Order', 'Created', 'Store', 'Mode', 'Channel', 'Stage', 'Customer', 'Subtotal', 'Discount', 'Tax', 'Tip', 'Delivery fee', 'Total', 'Code', 'Refunded']].concat(os.map(o => [o.id, new Date(o.createdAt).toISOString(), store(o.storeId).name, o.mode, o.channel, o.stage, o.customer, o.subtotal / 100, o.discount / 100, o.tax / 100, o.tip / 100, o.deliveryFee / 100, o.total / 100, o.code || '', (o.refunded || 0) / 100]));
    U.download('orders-' + A.isoDate(Date.now()) + '.csv', rows.map(r => r.map(v => /[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : v).join(',')).join('\n'), 'text/csv');
    A.audit('export', 'orders', `Exported ${os.length} orders`);
  }

  /* ================= Orders ================= */
  const OF = { stage: 'all' };
  PAGES['hq/orders'] = (r) => {
    if (!A.can('orders.manage') && !A.can('reports.view')) return APP.locked('orders.manage');
    let os = scoped(); if (OF.stage === 'active') os = os.filter(o => A.ACTIVE.includes(o.stage)); else if (OF.stage !== 'all') os = os.filter(o => o.stage === OF.stage || (OF.stage === 'done' && A.DONE.includes(o.stage)));
    if (r.q.id) setTimeout(() => orderDrawer(r.q.id), 0);
    const stageSel = `<label class="fb inline"><span>Status</span><select data-change="of-stage">${[['all', 'All'], ['active', 'Active'], ['done', 'Completed'], ['canceled', 'Canceled'], ['scheduled', 'Scheduled']].map(([v, l]) => `<option value="${v}" ${OF.stage === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>`;
    return `${U.pageHead('Daily operations', 'Order management', 'Every order across the network. Open an order to advance, refund, credit or cancel it. Orders placed in the customer apps on this browser appear live.')}
      ${filterBar()}
      <section class="card">${U.table({ id: 'orders', rows: os, rowAct: 'order-open', search: o => o.id + ' ' + o.customer + ' ' + (o.code || '') + ' ' + o.email, placeholder: 'Order #, customer, email, promo code', csv: true, filters: stageSel, selectable: A.can('orders.manage'),
        bulk: [{ act: 'orders-bulk-advance', label: 'Advance stage', perm: 'orders.manage' }],
        cols: [{ k: 'id', label: 'Order', render: o => `<strong>${esc(o.id)}</strong>${o.live ? ' ' + U.badge(o.src, 'brand') : ''}` }, { k: 'createdAt', label: 'Placed', render: o => `${A.fmtDT(o.createdAt)}<small class="block muted">${A.rel(o.createdAt)}</small>`, csv: o => new Date(o.createdAt).toISOString() }, { k: 'storeId', label: 'Store', render: o => esc(store(o.storeId).name), sortVal: o => store(o.storeId).name }, { k: 'customer', label: 'Customer', render: o => `${esc(o.customer)}${o.memberId ? ' ' + icon('star', 'mini') : ''}` }, { k: 'mode', label: 'Mode', render: o => `${o.mode === 'delivery' ? 'Delivery' : 'Pickup'}<small class="block muted">${esc(o.channel)}</small>` }, { k: 'total', label: 'Total', align: 'r', render: o => `${money(o.total)}${o.code ? `<small class="block muted">${esc(o.code)}</small>` : ''}`, csv: o => o.total / 100 }, { k: 'stage', label: 'Status', render: o => U.status(o.stage) + (o.refunded ? ' ' + U.badge('Refund ' + money(o.refunded), 'err') : '') }] })}</section>`;
  };
  APP.CHANGE['of-stage'] = (el) => { OF.stage = el.value; U.tstate('orders').page = 1; APP.render(); };
  ACT['order-open'] = (el) => orderDrawer(el.dataset.id);
  ACT['orders-bulk-advance'] = () => { const st = U.tstate('orders'); let n = 0; st.sel.forEach(id => { const o = S().orders.find(x => x.id === id); if (o && A.nextStage(o)) { o.stage = A.nextStage(o); n++; } }); A.audit('order.bulk', 'orders', `Advanced ${n} orders`); st.sel = []; U.toast(`${n} order${n === 1 ? '' : 's'} advanced`); APP.render(); };
  function orderDrawer(id) {
    const o = A.allOrders().find(x => x.id === id); if (!o) return U.toast('Order not found', 'err');
    const flow = o.mode === 'delivery' ? ['received', 'accepted', 'preparing', 'baking', 'out', 'delivered'] : ['received', 'accepted', 'preparing', 'baking', 'ready', 'completed'];
    const idx = flow.indexOf(o.stage); const can = A.can('orders.manage') && !o.live;
    const member = o.memberId ? S().members.find(m => m.id === o.memberId) : null;
    U.drawer(`Order ${esc(o.id)}`, `${o.live ? U.note(`Placed in the ${esc(o.src)} on this browser. Its status follows the app’s simulated timeline, so it’s read-only here.`, 'info') : ''}
      <div class="dl-grid"><div><span>Status</span>${U.status(o.stage)}</div><div><span>Store</span><strong>${esc(store(o.storeId).name)}</strong></div><div><span>Placed</span>${A.fmtDT(o.createdAt)}</div><div><span>Mode</span>${o.mode === 'delivery' ? 'Delivery' : 'Pickup'} · ${esc(o.channel)}</div><div><span>Customer</span>${esc(o.customer)}${member ? ` <a class="link" href="#/loyalty/members?id=${member.id}" data-act="ov-close">${U.badge(A.tierOf(member.lifetime).name + ' member', 'gold')}</a>` : ''}</div><div><span>Driver</span>${esc(o.driver || '—')}</div></div>
      ${o.stage !== 'canceled' ? `<ol class="steps">${flow.map((s, i) => `<li class="${i < idx ? 'done' : i === idx ? 'now' : ''}">${esc(A.STAGE_LABEL[s])}</li>`).join('')}</ol>` : ''}
      <h3 class="h3">Items</h3><ul class="lines">${o.lines.map(l => `<li><span>${l.qty}×</span><span>${esc(l.name)}</span><span>${money(l.total)}</span></li>`).join('')}</ul>
      <div class="totals"><div><span>Subtotal</span><span>${money(o.subtotal)}</span></div>${o.discount ? `<div><span>Discount${o.code ? ' · ' + esc(o.code) : ''}</span><span>−${money(o.discount)}</span></div>` : ''}<div><span>Tax</span><span>${money(o.tax)}</span></div>${o.deliveryFee ? `<div><span>Delivery</span><span>${money(o.deliveryFee)}</span></div>` : ''}<div><span>Tip</span><span>${money(o.tip)}</span></div><div class="tt"><span>Total</span><span>${money(o.total)}</span></div>${o.refunded ? `<div class="err-t"><span>Refunded</span><span>−${money(o.refunded)}</span></div>` : ''}</div>
      ${o.notes ? U.note('Kitchen note: ' + esc(o.notes), 'warn') : ''}${o.points ? `<p class="muted small">${icon('star', 'mini')} ${o.points} points ${A.DONE.includes(o.stage) ? 'earned' : 'pending'}</p>` : ''}
      ${can ? `<h3 class="h3">Actions</h3><div class="btn-row">${A.nextStage(o) ? `<button class="btn" data-act="order-advance" data-id="${o.id}">${icon('chevR')}Mark ${esc(A.STAGE_LABEL[A.nextStage(o)])}</button>` : ''}${A.ACTIVE.includes(o.stage) ? `<button class="btn ghost danger" data-act="order-cancel" data-id="${o.id}">Cancel order</button>` : ''}<button class="btn secondary" data-act="order-receipt" data-id="${o.id}">${icon('send')}Resend receipt</button></div>
        ${A.can('refund.issue') && o.stage !== 'canceled' ? `<form class="card subtle" data-form="order-refund" data-id="${o.id}"><h4>Refund or credit</h4><div class="fgrid">${U.select('Type', 'type', [['refund', 'Refund to original payment'], ['credit', 'Service credit (wallet)'], ['points', 'Goodwill points']], 'refund')}${U.input('Amount ($) or points', 'amount', '', { attrs: { type: 'number', min: 1, step: '0.01', required: true } })}</div>${U.input('Reason', 'reason', '', { attrs: { required: true, placeholder: 'Recorded in the audit log' } })}<p class="muted small">Refunds over ${money(S().loyalty.refundApprovalThreshold)} need finance approval.</p><button class="btn sm" type="submit">Apply</button></form>` : ''}` : ''}`, { sub: `${esc(o.customer)} · ${money(o.total)}`, wide: true });
  }
  APP.orderDrawer = orderDrawer;
  ACT['order-advance'] = (el) => { const o = S().orders.find(x => x.id === el.dataset.id); const n = A.nextStage(o); if (!n) return; o.stage = n; if (A.DONE.includes(n)) { o.prepMin = o.prepMin || Math.round((Date.now() - o.createdAt) / 6e4); o.onTime = o.prepMin <= (store(o.storeId).prepMin + 5); } A.audit('order.stage', 'order:' + o.id, `${o.id} → ${A.STAGE_LABEL[n]}`); U.toast(`${o.id}: ${A.STAGE_LABEL[n]}`); APP.render(); orderDrawer(o.id); };
  ACT['order-cancel'] = (el) => U.confirm('Cancel this order?', 'The customer is notified and the full amount is refunded to the original payment method (simulated).', (reason) => { const o = S().orders.find(x => x.id === el.dataset.id); o.stage = 'canceled'; o.refunded = o.total; A.audit('order.cancel', 'order:' + o.id, `${o.id} canceled — ${reason}`); U.toast('Order canceled and refunded'); APP.render(); }, { danger: true, ok: 'Cancel order', reason: true });
  ACT['order-receipt'] = (el) => { A.audit('order.receipt', 'order:' + el.dataset.id, 'Receipt re-sent'); U.toast('Receipt re-sent to the customer (simulated)'); };
  FORM['order-refund'] = (d, f) => {
    const o = S().orders.find(x => x.id === f.dataset.id); const amt = d.type === 'points' ? Math.round(Number(d.amount)) : U.cents(d.amount);
    if (!(amt > 0)) return U.toast('Enter an amount', 'err');
    if (d.type === 'refund' && amt > o.total - (o.refunded || 0)) return U.toast('Refund can’t exceed what was paid', 'err');
    if (d.type === 'refund' && amt > S().loyalty.refundApprovalThreshold && !A.can('approvals.decide')) { A.requestApproval('refund', `Refund ${money(amt)} on ${o.id}`, d.reason, { orderId: o.id, amount: amt }); U.close(); U.toast('Sent to finance for approval', 'info'); APP.render(); return; }
    applyRemedy(o, d.type, amt, d.reason); U.close(); APP.render();
  };
  function applyRemedy(o, type, amt, reason) {
    if (type === 'refund') { o.refunded = (o.refunded || 0) + amt; A.audit('order.refund', 'order:' + o.id, `Refunded ${money(amt)} — ${reason}`); U.toast(`Refunded ${money(amt)}`); }
    else if (type === 'credit') { const m = S().members.find(x => x.id === o.memberId); if (!m) return U.toast('Service credit needs a member account', 'err'); m.credit += amt; A.audit('member.credit', 'member:' + m.id, `+${money(amt)} service credit — ${reason}`); U.toast(`${money(amt)} credit issued`); }
    else { if (!o.memberId) return U.toast('Points need a member account', 'err'); A.adjustPoints(o.memberId, amt, reason, 'adjust', { orderId: o.id }); U.toast(`+${amt} points`); }
  }
  APP.applyRemedy = applyRemedy;
  A.APPROVAL_RUN.refund = (p) => { const o = S().orders.find(x => x.id === p.orderId); if (o) o.refunded = (o.refunded || 0) + p.amount; };

  /* ================= Fulfillment board ================= */
  PAGES['hq/fulfillment'] = () => {
    if (!A.can('orders.manage')) return APP.locked('orders.manage');
    return `${U.pageHead('Daily operations', 'Fulfillment board', 'Live kitchen and handoff status across stores. Cards turn amber after 10 minutes in a stage and red past the store’s prep target.')}${filterBar({ channel: false, days: false })}${board(A.scope(A.allOrders(), Object.assign({}, F, { days: 1 })))}`;
  };
  function board(os, compact) {
    const cols = [['New', ['received']], ['Accepted', ['accepted']], ['Preparing', ['preparing']], ['In the oven', ['baking']], ['Ready / on the way', ['ready', 'out']]];
    return `<div class="board">${cols.map(([t, st]) => { const cs = os.filter(o => st.includes(o.stage)).sort((a, b) => a.createdAt - b.createdAt); return `<section class="col"><h3>${t}<span class="tcount">${cs.length}</span></h3>${cs.length ? cs.map(o => { const age = Math.round((Date.now() - o.createdAt) / 6e4); const tgt = store(o.storeId).prepMin; return `<article class="tkt ${age > tgt ? 'late' : age > 10 ? 'warn' : ''}"><header><strong>${esc(o.id.slice(-4))}</strong>${compact ? '' : `<small>${esc(store(o.storeId).name)}</small>`}<span class="age">${icon('clock', 'mini')}${age}m</span></header><p>${esc(o.customer)} · ${o.mode === 'delivery' ? 'Delivery' : 'Pickup'}</p><ul>${o.lines.map(l => `<li>${l.qty}× ${esc(l.name)}</li>`).join('')}</ul>${o.notes ? `<p class="tkt-note">${icon('alert', 'mini')}${esc(o.notes)}</p>` : ''}<footer>${o.live ? U.badge('App · read-only', 'brand') : `<button class="btn sm" data-act="board-advance" data-id="${o.id}">${esc(A.STAGE_LABEL[A.nextStage(o)] || 'Done')} ${icon('chevR')}</button>`}<button class="btn sm ghost" data-act="order-open" data-id="${o.id}">Details</button></footer></article>`; }).join('') : `<p class="col-empty">Nothing here</p>`}</section>`; }).join('')}</div>`;
  }
  APP.board = board;
  ACT['board-advance'] = (el) => { const o = S().orders.find(x => x.id === el.dataset.id); const n = o && A.nextStage(o); if (!n) return; o.stage = n; if (A.DONE.includes(n)) { o.prepMin = Math.round((Date.now() - o.createdAt) / 6e4); o.onTime = o.prepMin <= store(o.storeId).prepMin + 5; } A.audit('order.stage', 'order:' + o.id, `${o.id} → ${A.STAGE_LABEL[n]}`); APP.render(); };

  /* ================= Support inbox ================= */
  const TF = { status: 'open' };
  PAGES['hq/support'] = (r) => {
    if (!A.can('support.manage')) return APP.locked('support.manage');
    if (r.q.id) setTimeout(() => ticketDrawer(r.q.id), 0);
    return supportPage(S().tickets, 'support');
  };
  function supportPage(all, id, storeId) {
    let ts = all.filter(t => TF.status === 'all' || t.status === TF.status);
    const cnt = (s) => all.filter(t => s === 'all' || t.status === s).length;
    const breached = all.filter(t => t.status !== 'resolved' && t.sla < Date.now()).length;
    return `${storeId ? '' : U.pageHead('Daily operations', 'Support inbox', 'Every guest conversation in one queue. Resolve with a refund, service credit or points — limits and approvals apply automatically.')}
      <div class="kpis k4">${U.kpi('Open', cnt('open'))}${U.kpi('Waiting on guest', cnt('pending'))}${U.kpi('Past SLA', breached, '', { tone: breached ? 'err' : '' })}${U.kpi('Resolved (all time)', cnt('resolved'))}</div>
      <section class="card"><div class="seg">${[['open', 'Open'], ['pending', 'Pending'], ['resolved', 'Resolved'], ['all', 'All']].map(([v, l]) => `<button class="${TF.status === v ? 'on' : ''}" data-act="tf" data-v="${v}">${l} <span class="tcount">${cnt(v)}</span></button>`).join('')}</div>
      ${U.table({ id: 'tk-' + id, rows: ts, rowAct: 'ticket-open', search: t => t.id + ' ' + t.customer + ' ' + t.issue + ' ' + t.orderId, csv: true, def: { sort: 'at', dir: -1 },
        cols: [{ k: 'id', label: 'Ticket', render: t => `<strong>${esc(t.id)}</strong><small class="block muted">${esc(t.channel)}</small>` }, { k: 'issue', label: 'Issue', render: t => `${esc(t.issue)}<small class="block muted">${esc(t.customer)} · ${esc(t.orderId)}</small>` }, { k: 'storeId', label: 'Store', render: t => esc(store(t.storeId).name) }, { k: 'priority', label: 'Priority', render: t => U.status(t.priority) }, { k: 'sla', label: 'SLA', render: t => t.status === 'resolved' ? '—' : `<span class="${t.sla < Date.now() ? 'err-t' : ''}">${t.sla < Date.now() ? 'Breached ' : 'Due '}${A.rel(t.sla)}</span>` }, { k: 'assignee', label: 'Owner', render: t => t.assignee ? esc(t.assignee) : '<span class="muted">Unassigned</span>' }, { k: 'status', label: 'Status', render: t => U.status(t.status) }, { k: 'at', label: 'Opened', render: t => A.rel(t.at), csv: t => new Date(t.at).toISOString() }] })}</section>`;
  }
  APP.supportPage = supportPage;
  ACT.tf = (el) => { TF.status = el.dataset.v; APP.render(); };
  ACT['ticket-open'] = (el) => ticketDrawer(el.dataset.id);
  const MACROS = [['Sorry — refund on its way', 'We’re so sorry about this. We’ve refunded the affected item to your original payment. It can take 3–5 business days to appear.'], ['Points added', 'Sorry for the trouble — we’ve added bonus points to your MOD Rewards account as a thank-you for your patience.'], ['Need more detail', 'Thanks for reaching out. Could you share a photo of the order and the time you received it?']];
  function ticketDrawer(id) {
    const t = S().tickets.find(x => x.id === id); if (!t) return;
    const lim = S().loyalty.storeRecoveryLimit; const hq = A.role().hq;
    U.drawer(`${esc(t.id)} · ${esc(t.issue)}`, `<div class="dl-grid"><div><span>Status</span>${U.status(t.status)}</div><div><span>Priority</span>${U.status(t.priority)}</div><div><span>Guest</span>${esc(t.customer)}${t.memberId ? ' ' + U.badge('Member', 'gold') : ''}</div><div><span>Order</span><a class="link" href="#" data-act="order-open" data-id="${t.orderId}">${esc(t.orderId)}</a></div><div><span>Store</span>${esc(store(t.storeId).name)}</div><div><span>SLA</span>${t.status === 'resolved' ? '—' : A.rel(t.sla)}</div></div>
      <ul class="thread">${t.messages.map(m => `<li class="${m.from}"><span>${esc(m.text)}</span><small>${m.from === 'agent' ? 'Agent' : m.from === 'note' ? 'Internal note' : 'Guest'} · ${A.fmtDT(m.at)}</small></li>`).join('')}</ul>
      ${t.resolution ? U.note(`Resolved with ${t.resolution.type === 'none' ? 'no compensation' : t.resolution.type === 'points' ? t.resolution.amount + ' points' : money(t.resolution.amount) + ' ' + t.resolution.type}.`, 'ok') : ''}
      <form data-form="ticket-reply" data-id="${t.id}" class="card subtle"><div class="fgrid">${U.select('Reply as', 'kind', [['agent', 'Message to guest'], ['note', 'Internal note']], 'agent')}${U.select('Macro', 'macro', [['', '—']].concat(MACROS.map((m, i) => [String(i), m[0]])), '', { attrs: { 'data-change': 'macro' } })}</div>${U.area('Message', 'text', '', { attrs: { required: true } })}
        <div class="fgrid">${U.select('Assign to', 'assignee', [['', 'Unassigned']].concat(['Tim Okafor', 'Morgan Ellis', 'Aisha Grant', 'Diego Alvarez', 'Support bot'].map(x => [x, x])), t.assignee || '')}${U.select('Priority', 'priority', ['low', 'normal', 'high'], t.priority)}${U.select('Set status', 'status', [['open', 'Open'], ['pending', 'Pending guest'], ['resolved', 'Resolved']], t.status === 'open' ? 'pending' : t.status)}</div>
        <fieldset class="field"><legend>Remedy (optional)</legend><div class="fgrid">${U.select('Type', 'rtype', [['none', 'None'], ['refund', 'Refund'], ['credit', 'Service credit'], ['points', 'Points']], 'none')}${U.input('Amount ($ or pts)', 'ramount', '', { attrs: { type: 'number', min: 0, step: '0.01' } })}</div>${hq ? '' : `<small class="hint">Store limit: ${money(lim.credit)} credit / ${lim.points} pts per ticket. Larger amounts go to HQ for approval.</small>`}</fieldset>
        <div class="btn-row"><button class="btn" type="submit">${icon('send')}Send & update</button></div></form>`, { wide: true, sub: `${esc(t.channel)} · opened ${A.rel(t.at)}` });
  }
  APP.ticketDrawer = ticketDrawer;
  APP.CHANGE.macro = (el) => { const m = MACROS[Number(el.value)]; if (m) { const ta = el.form.querySelector('[name=text]'); ta.value = m[1]; } };
  FORM['ticket-reply'] = (d, f) => {
    const t = S().tickets.find(x => x.id === f.dataset.id);
    t.messages.push({ from: d.kind, at: Date.now(), text: d.text }); t.assignee = d.assignee || null; t.priority = d.priority; t.status = d.status;
    if (d.rtype !== 'none' && Number(d.ramount) > 0) {
      const amt = d.rtype === 'points' ? Math.round(Number(d.ramount)) : U.cents(d.ramount); const lim = S().loyalty.storeRecoveryLimit;
      const over = !A.role().hq && ((d.rtype === 'points' && amt > lim.points) || (d.rtype !== 'points' && amt > lim.credit));
      const o = S().orders.find(x => x.id === t.orderId);
      if (over) { A.requestApproval('ticket.remedy', `${d.rtype} ${d.rtype === 'points' ? amt + ' pts' : money(amt)} · ${t.id}`, `Over store recovery limit · ${t.issue}`, { ticketId: t.id, type: d.rtype, amount: amt }); U.toast('Over your limit — sent to HQ for approval', 'info'); }
      else if (o) { applyRemedy(o, d.rtype, amt, `${t.id}: ${t.issue}`); t.resolution = { type: d.rtype, amount: amt }; }
    }
    if (d.status === 'resolved' && !t.resolution) t.resolution = { type: 'none' };
    A.audit('ticket.update', 'ticket:' + t.id, `${t.id} → ${t.status}${t.assignee ? ' · ' + t.assignee : ''}`); U.close(); U.toast('Ticket updated'); APP.render();
  };
  A.APPROVAL_RUN['ticket.remedy'] = (p) => { const t = S().tickets.find(x => x.id === p.ticketId); const o = t && S().orders.find(x => x.id === t.orderId); if (o) { applyRemedy(o, p.type, p.amount, t.id + ' (approved)'); t.resolution = { type: p.type, amount: p.amount }; } };

  /* ================= Stores ================= */
  PAGES['hq/stores'] = (r) => {
    const can = A.can('stores.edit');
    if (r.q.edit) setTimeout(() => storeEditor(r.q.edit), 0);
    const rows = S().catalog.STORES.map(s => Object.assign({ meta: S().storeMeta[s.id] || {} }, s));
    return `${U.pageHead('Network', 'Stores', 'Master data for every location: hours, fulfillment, fees, prep targets, pickup methods and ownership. Pausing and prep changes go live immediately; setup changes go out with the next publish.', can ? `<button class="btn" data-act="store-new">${icon('plus')}Add store</button>` : '')}
      <section class="card">${U.table({ id: 'stores', rows, rowAct: 'store-edit', search: s => s.name + ' ' + s.city + ' ' + s.meta.owner + ' ' + s.meta.manager, csv: true, noPage: true,
        cols: [{ k: 'name', label: 'Store', render: s => `<strong>${esc(s.name)}</strong><small class="block muted">${esc(s.address)}</small>` }, { k: 'region', label: 'Region', render: s => esc(s.meta.region), sortVal: s => s.meta.region }, { k: 'own', label: 'Ownership', render: s => `${U.badge(s.meta.ownership === 'franchise' ? 'Franchise' : 'Corporate', s.meta.ownership === 'franchise' ? 'info' : 'muted')}<small class="block muted">${esc(s.meta.owner)}</small>`, sortVal: s => s.meta.ownership }, { k: 'hours', label: 'Hours', render: s => `${A.minToHHMM(s.open)}–${A.minToHHMM(s.close)}`, nosort: true }, { k: 'modes', label: 'Fulfillment', render: s => s.modes.map(m => U.badge(m === 'pickup' ? 'Pickup' : 'Delivery ' + money(s.deliveryFee), 'muted')).join(' '), nosort: true }, { k: 'prepMin', label: 'Prep', align: 'r', render: s => s.prepMin + ' min' }, { k: 'priceFactor', label: 'Price index', align: 'r', render: s => '×' + s.priceFactor.toFixed(2) }, { k: 'out', label: '86’d', align: 'r', render: s => s.outProducts.length + s.outIngredients.length || '—', sortVal: s => s.outProducts.length + s.outIngredients.length }, { k: 'accepting', label: 'Status', render: s => U.status(s.accepting ? 'live' : 'paused', s.accepting ? 'Accepting' : 'Paused') }, { k: 'ws', label: '', nosort: true, nocsv: true, render: s => `<a class="btn sm ghost" href="#/store/${s.id}/today" title="Open store workspace">${icon('store')}</a>` }] })}</section>`;
  };
  ACT['store-edit'] = (el) => storeEditor(el.dataset.id);
  ACT['store-new'] = () => storeEditor(null);
  function storeEditor(id) {
    const s = id ? S().catalog.STORES.find(x => x.id === id) : { id: '', name: '', city: '', address: '', tz: 'America/Los_Angeles', open: 600, close: 1320, modes: ['pickup'], deliveryFee: 399, prepMin: 15, priceFactor: 1, accepting: true, outProducts: [], outIngredients: [], pickupMethods: ['instore'], popular: [], pickupNote: '', lat: 0, lng: 0 };
    const m = (id && S().storeMeta[id]) || { region: '', ownership: 'corporate', owner: 'MOD Pizza (corporate)', manager: '', phone: '', opened: A.isoDate(Date.now()), taxRate: 0.0875, posId: '' };
    const dis = A.can('stores.edit') ? {} : { disabled: true };
    U.drawer(id ? esc(s.name) : 'New store', `<form data-form="store-save" data-id="${esc(id || '')}">
      ${id ? `<div class="live-row card subtle"><div><strong>Online ordering</strong><small class="block muted">${s.accepting ? 'Accepting orders now' : esc(s.pausedReason || 'Paused')}</small></div><button type="button" class="btn sm ${s.accepting ? 'secondary' : ''}" data-act="store-pause" data-id="${s.id}" ${U.guard('stores.edit')}>${s.accepting ? icon('pause') + 'Pause now' : icon('play') + 'Resume now'}</button></div>` : ''}
      <h3 class="h3">Location</h3><div class="fgrid">${U.input('Store name', 'name', s.name, { req: true, attrs: Object.assign({ required: true }, dis) })}${U.input('City, state', 'city', s.city, { req: true, attrs: Object.assign({ required: true }, dis) })}</div>${U.input('Street address', 'address', s.address, { attrs: dis })}
      <div class="fgrid">${U.select('Time zone', 'tz', ['America/Los_Angeles', 'America/Denver', 'America/Chicago', 'America/New_York', 'America/Phoenix', 'Pacific/Honolulu'], s.tz, { attrs: dis })}${U.input('Latitude', 'lat', s.lat, { attrs: Object.assign({ type: 'number', step: 'any' }, dis) })}${U.input('Longitude', 'lng', s.lng, { attrs: Object.assign({ type: 'number', step: 'any' }, dis) })}</div>
      <h3 class="h3">Hours & fulfillment</h3><div class="fgrid">${U.input('Opens', 'open', A.minToInput(s.open), { attrs: Object.assign({ type: 'time' }, dis) })}${U.input('Closes', 'close', A.minToInput(s.close), { attrs: Object.assign({ type: 'time' }, dis), hint: '23:59 = midnight' })}${U.input('Prep target (min)', 'prepMin', s.prepMin, { attrs: Object.assign({ type: 'number', min: 5, max: 90 }, dis) })}</div>
      ${U.checks('Fulfillment modes', 'modes', [['pickup', 'Pickup'], ['delivery', 'Delivery']], s.modes)}${U.checks('Pickup methods', 'pickupMethods', Object.entries(S().catalog.CONFIG.pickupMethods), s.pickupMethods)}
      <div class="fgrid">${U.moneyIn('Delivery fee', 'deliveryFee', s.deliveryFee, { attrs: dis })}${U.input('Market price index', 'priceFactor', s.priceFactor, { attrs: Object.assign({ type: 'number', step: '0.01', min: 0.5, max: 2 }, dis), hint: 'Multiplies menu prices for this store (×1.00 = list price)' })}${U.input('Sales tax rate', 'taxRate', m.taxRate, { attrs: Object.assign({ type: 'number', step: '0.0001', min: 0, max: 0.2 }, dis) })}</div>
      ${U.area('Pickup instructions shown to guests', 'pickupNote', s.pickupNote, { rows: 2, attrs: dis })}
      ${U.checks('“Popular here” items (shown on the app home)', 'popular', S().catalog.PRODUCTS.filter(p => p.published !== false).map(p => [p.id, p.name]), s.popular, { cls: 'scroll-checks' })}
      <h3 class="h3">Ownership & contacts</h3><div class="fgrid">${U.select('Ownership', 'ownership', [['corporate', 'Corporate'], ['franchise', 'Franchise']], m.ownership, { attrs: dis })}${U.input('Owner / franchise group', 'owner', m.owner, { attrs: dis })}${U.input('Region', 'region', m.region, { attrs: Object.assign({ list: 'regions' }, dis) })}</div><datalist id="regions">${regions().map(x => `<option value="${esc(x)}">`).join('')}</datalist>
      <div class="fgrid">${U.input('General manager', 'manager', m.manager, { attrs: dis })}${U.input('Store phone', 'phone', m.phone, { attrs: dis })}${U.input('POS location ID', 'posId', m.posId, { attrs: dis })}</div>
      ${A.can('stores.edit') ? `<div class="sticky-foot"><button class="btn" type="submit">${icon('check')}${id ? 'Save to draft' : 'Create store'}</button><span class="muted small">Goes live with the next publish.</span></div>` : U.note('Read-only for your role.', 'info')}</form>`, { wide: true, sub: id ? `${esc(s.city)} · ${esc(m.owner)}` : 'Draft — publish to make it visible in the apps' });
  }
  APP.CHANGE['_noop'] = () => {};
  FORM['store-save'] = (d, f) => {
    const id = f.dataset.id; const list = S().catalog.STORES; let s = list.find(x => x.id === id);
    const modes = [].concat(d.modes || []); if (!modes.length) return U.toast('Pick at least one fulfillment mode', 'err');
    const patch = { name: d.name.trim(), city: d.city.trim(), address: d.address.trim(), tz: d.tz, lat: Number(d.lat) || 0, lng: Number(d.lng) || 0, open: A.hhmmToMin(d.open), close: d.close === '23:59' ? 1440 : A.hhmmToMin(d.close), prepMin: Number(d.prepMin), modes, pickupMethods: [].concat(d.pickupMethods || []), deliveryFee: modes.includes('delivery') ? U.cents(d.deliveryFee) : null, priceFactor: Number(d.priceFactor) || 1, pickupNote: d.pickupNote, popular: [].concat(d.popular || []) };
    if (!s) { const nid = 's' + (list.length + 1 + Math.floor(Math.random() * 90)); s = Object.assign({ id: nid, accepting: false, pausedReason: 'Opening soon', outProducts: [], outIngredients: [] }, patch); list.push(s); S().checklists[nid] = []; A.audit('store.create', 'store:' + nid, `Created ${s.name}`); }
    else { Object.assign(s, patch); A.audit('store.update', 'store:' + s.id, `Updated ${s.name} setup`); }
    S().storeMeta[s.id] = Object.assign(S().storeMeta[s.id] || {}, { region: d.region, ownership: d.ownership, owner: d.owner, manager: d.manager, phone: d.phone, posId: d.posId, taxRate: Number(d.taxRate) || 0 });
    A.markDraft('STORES', `${s.name}: setup`); U.close(); U.toast('Saved to draft — publish to go live'); APP.render();
  };
  ACT['store-pause'] = (el) => {
    const s = S().catalog.STORES.find(x => x.id === el.dataset.id);
    if (s.accepting) U.confirm(`Pause ${esc(s.name)}?`, 'Guests can’t place new orders here until you resume. Orders already placed are not affected.', (reason) => { A.liveStorePatch(s.id, { accepting: false, pausedReason: reason }, 'paused online ordering — ' + reason); U.toast(`${s.name} paused`); APP.render(); }, { reason: true, ok: 'Pause ordering', danger: true });
    else { A.liveStorePatch(s.id, { accepting: true, pausedReason: '' }, 'resumed online ordering'); U.toast(`${s.name} is accepting orders`); APP.render(); U.close(); }
  };

  /* ================= Compare stores ================= */
  let CMP = null;
  PAGES['hq/compare'] = () => {
    if (!A.can('reports.view')) return APP.locked('reports.view');
    const stores = S().catalog.STORES; if (!CMP) CMP = stores.slice(0, 3).map(s => s.id);
    const all = A.scope(A.allOrders(), { days: F.days });
    const rows = CMP.map(id => Object.assign({ s: store(id) }, A.metrics(all.filter(o => o.storeId === id))));
    const metric = (label, fn, fmt, best = 'max') => { const vals = rows.map(fn); const b = best === 'max' ? Math.max(...vals.filter(v => v != null)) : Math.min(...vals.filter(v => v != null)); return `<tr><th>${label}</th>${rows.map((x, i) => `<td class="r ${vals[i] === b ? 'best' : ''}">${fmt(vals[i])}</td>`).join('')}</tr>`; };
    return `${U.pageHead('Insights', 'Compare stores', 'Pick up to four stores. The best value in each row is highlighted.')}
      <div class="filterbar card"><fieldset class="chk-row">${stores.map(s => `<label class="chk"><input type="checkbox" data-act="cmp" value="${s.id}" ${CMP.includes(s.id) ? 'checked' : ''}><span>${esc(s.name)}</span></label>`).join('')}</fieldset><label class="fb"><span>Period</span><select data-change="flt" data-k="days">${[[7, 'Last 7 days'], [14, 'Last 14 days'], [30, 'Last 30 days']].map(([v, l]) => `<option value="${v}" ${F.days === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label></div>
      <section class="card"><div class="tbl-scroll"><table class="tbl cmp"><thead><tr><th></th>${rows.map(x => `<th class="r">${esc(x.s.name)}<small class="block muted">${esc(A.regionOf(x.s.id))}</small></th>`).join('')}</tr></thead><tbody>
        ${metric('Net sales', x => x.net, v => money(v, { whole: true }))}${metric('Orders', x => x.count, A.num)}${metric('Average order', x => x.aov, money)}${metric('On-time', x => x.onTime, A.pct)}${metric('Avg prep (min)', x => x.prep, v => v == null ? '—' : v, 'min')}${metric('Delivery share', x => x.count ? x.delivery / x.count : 0, A.pct)}${metric('Discounts given', x => x.discount, money, 'min')}${metric('Refunds', x => x.refunds, money, 'min')}${metric('Rating', x => x.rating, v => v ? v.toFixed(2) : '—')}
      </tbody></table></div></section>
      <section class="card"><h2>Net sales</h2>${U.hbars(rows.map(x => ({ label: x.s.name, v: x.net })), { fmt: v => money(v, { whole: true }) })}</section>`;
  };
  ACT.cmp = (el) => { if (el.checked) { if (CMP.length >= 4) { el.checked = false; return U.toast('Compare up to four stores', 'err'); } CMP.push(el.value); } else CMP = CMP.filter(x => x !== el.value); APP.render(); };

  /* ================= Reports ================= */
  PAGES['hq/reports'] = (r) => {
    if (!A.can('reports.view')) return APP.locked('reports.view');
    const tab = r.q.tab || 'sales'; const os = scoped().filter(o => o.stage !== 'canceled');
    const t = (k, l) => [`#/hq/reports?tab=${k}`, l, k];
    let body = '';
    if (tab === 'sales') {
      const dp = { 'Lunch (11–2)': [11, 14], 'Afternoon (2–5)': [14, 17], 'Dinner (5–9)': [17, 21], 'Late (9+)': [21, 24], 'Morning': [0, 11] };
      body = `<div class="grid g-1-1"><section class="card"><h2>Net sales by store</h2>${U.hbars(S().catalog.STORES.map(s => ({ label: s.name, v: A.sum(os.filter(o => o.storeId === s.id), o => o.subtotal - o.discount) })), { fmt: v => money(v, { whole: true }) })}</section>
        <section class="card"><h2>By day part</h2>${U.hbars(Object.entries(dp).map(([l, [a, b]]) => ({ label: l, v: os.filter(o => { const h = new Date(o.createdAt).getHours(); return h >= a && h < b; }).length })), { fmt: v => A.num(v) + ' orders' })}</section>
        <section class="card"><h2>By day of week</h2>${U.bars(A.DAYS.map((d, i) => ({ label: d, v: A.sum(os.filter(o => new Date(o.createdAt).getDay() === i), o => o.subtotal - o.discount) })), { fmt: v => money(v, { whole: true }), h: 160 })}</section>
        <section class="card"><h2>By channel</h2>${U.donut([['app', 'Mobile app'], ['web', 'Web'], ['kiosk', 'Kiosk']].map(([k, l]) => ({ label: l, v: os.filter(o => o.channel === k).length })), { centerLabel: 'orders' })}</section></div>`;
    } else if (tab === 'items') {
      const items = {}; os.forEach(o => o.lines.forEach(l => { const k = l.name; items[k] = items[k] || { name: k, qty: 0, rev: 0 }; items[k].qty += l.qty; items[k].rev += l.total; }));
      const rows = Object.values(items); const catOf = (n) => (S().catalog.PRODUCTS.find(p => p.name === n) || {}).cat || 'other';
      body = `<div class="grid g-2-1"><section class="card">${U.table({ id: 'rep-items', rows, key: x => x.name, csv: true, search: x => x.name, def: { sort: 'rev', dir: -1 }, cols: [{ k: 'name', label: 'Item' }, { k: 'cat', label: 'Category', render: x => esc(catOf(x.name)), sortVal: x => catOf(x.name) }, { k: 'qty', label: 'Units', align: 'r', render: x => A.num(x.qty) }, { k: 'rev', label: 'Revenue', align: 'r', render: x => money(x.rev), csv: x => x.rev / 100 }, { k: 'share', label: 'Share', align: 'r', render: x => A.pct(x.rev / Math.max(1, A.sum(rows, y => y.rev)), 1), sortVal: x => x.rev }] })}</section>
        <section class="card"><h2>Category mix</h2>${U.donut(S().catalog.CATEGORIES.map(c => ({ label: c.name, v: A.sum(rows.filter(x => catOf(x.name) === c.id), x => x.qty) })).filter(x => x.v), { centerLabel: 'units' })}</section></div>`;
    } else if (tab === 'promos') {
      const codes = {}; os.filter(o => o.code).forEach(o => { codes[o.code] = codes[o.code] || { code: o.code, n: 0, disc: 0, net: 0 }; codes[o.code].n++; codes[o.code].disc += o.discount; codes[o.code].net += o.subtotal - o.discount; });
      body = `<section class="card">${U.table({ id: 'rep-promo', rows: Object.values(codes), key: x => x.code, csv: true, def: { sort: 'n', dir: -1 }, cols: [{ k: 'code', label: 'Code', render: x => `<strong>${esc(x.code)}</strong>` }, { k: 'n', label: 'Redemptions', align: 'r' }, { k: 'disc', label: 'Discount cost', align: 'r', render: x => money(x.disc) }, { k: 'net', label: 'Net sales', align: 'r', render: x => money(x.net) }, { k: 'roi', label: 'Sales per $1 discount', align: 'r', render: x => x.disc ? '$' + (x.net / x.disc).toFixed(2) : '—', sortVal: x => x.disc ? x.net / x.disc : 0 }] })}</section>`;
    } else if (tab === 'ops') {
      const done = os.filter(o => A.DONE.includes(o.stage));
      body = `<div class="grid g-1-1"><section class="card"><h2>On-time by store</h2>${U.hbars(S().catalog.STORES.map(s => { const d = done.filter(o => o.storeId === s.id && o.onTime != null); return { label: s.name, v: d.length ? Math.round(d.filter(o => o.onTime).length / d.length * 100) : 0 }; }), { fmt: v => v + '%' })}</section>
        <section class="card"><h2>Average prep (min)</h2>${U.hbars(S().catalog.STORES.map(s => { const d = done.filter(o => o.storeId === s.id && o.prepMin); return { label: s.name, v: d.length ? Math.round(A.sum(d, o => o.prepMin) / d.length) : 0, sub: 'target ' + s.prepMin }; }), { fmt: v => v + ' min' })}</section>
        <section class="card"><h2>Support volume by category</h2>${U.hbars(Object.entries(A.groupBy(S().tickets, t => t.cat)).map(([k, v]) => ({ label: k, v: v.length })))}</section>
        <section class="card"><h2>Refunds & cancellations</h2>${U.kpi('Canceled orders', A.num(scoped().filter(o => o.stage === 'canceled').length))}${U.kpi('Refunded', money(A.sum(scoped(), o => o.refunded || 0)))}</section></div>`;
    }
    return `${U.pageHead('Insights', 'Reports', 'Sales, menu mix, promotion performance and operations. Use the filters to scope by region, store, period and channel; every table exports to CSV.', `<button class="btn secondary sm" data-act="ov-export">${icon('download')}Export orders</button>`)}${filterBar()}${U.tabs([t('sales', 'Sales'), t('items', 'Menu mix'), t('promos', 'Promotions'), t('ops', 'Operations')], tab)}${body}`;
  };
})();
