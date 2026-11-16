/* MOD Back Office — Store workspace (store managers & franchise owners): shift, kitchen, orders, availability,
   hours & settings, team & checklist, guest care, promotions participation, rewards & recovery, store report. */
(function () {
  'use strict';
  const A = window.ADM, U = window.UI, APP = window.APP; const { PAGES, ACT, FORM } = APP; const esc = A.esc, icon = U.icon, money = A.money;
  const S = () => A.S; const C = () => A.S.catalog;
  const st = (id) => C().STORES.find(s => s.id === id);
  const today0 = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); };
  const sOrders = (id, days) => A.allOrders().filter(o => o.storeId === id && (days ? o.createdAt >= Date.now() - days * A.DAY : o.createdAt >= today0()));

  function head(s, title, sub = '', actions = '') {
    const meta = S().storeMeta[s.id] || {};
    return `<header class="phead store-head"><div><span class="eyebrow">${esc(s.name)} · ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span><h1 tabindex="-1">${title}</h1><p class="muted">${sub || `${esc(meta.manager || '')} · ${esc(s.city)} · ${A.minToHHMM(s.open)}–${A.minToHHMM(s.close)}`} ${U.status(s.accepting ? 'live' : 'paused', s.accepting ? 'Accepting orders' : 'Orders paused')}</p></div>
      <div class="phead-act">${actions}<button class="btn ${s.accepting ? 'secondary' : ''}" data-act="ws-pause" data-id="${s.id}">${s.accepting ? icon('pause') + 'Pause orders' : icon('play') + 'Resume orders'}</button><div class="prep-ctl" role="group" aria-label="Prep time"><button class="btn secondary sm" data-act="ws-prep" data-id="${s.id}" data-d="-5" aria-label="Prep time minus 5 minutes">−5</button><span><strong>${s.prepMin}</strong> min prep</span><button class="btn secondary sm" data-act="ws-prep" data-id="${s.id}" data-d="5" aria-label="Prep time plus 5 minutes">+5</button></div></div></header>`;
  }
  ACT['ws-pause'] = (el) => {
    const s = st(el.dataset.id);
    if (s.accepting) U.confirm(`Pause ${esc(s.name)}?`, 'Guests can’t place new orders until you resume. HQ is notified.', (reason) => { A.liveStorePatch(s.id, { accepting: false, pausedReason: reason }, 'paused — ' + reason); A.notify(`${s.name} paused online ordering: ${reason}`, '#/hq/stores'); U.toast('Orders paused'); APP.render(); }, { reason: true, danger: true, ok: 'Pause orders' });
    else { A.liveStorePatch(s.id, { accepting: true, pausedReason: '' }, 'resumed online ordering'); U.toast('Accepting orders again'); APP.render(); }
  };
  ACT['ws-prep'] = (el) => { const s = st(el.dataset.id); const v = Math.max(5, Math.min(90, s.prepMin + Number(el.dataset.d))); A.liveStorePatch(s.id, { prepMin: v }, `prep time → ${v} min`); U.toast(`Quoted prep time now ${v} min`); APP.render(); };

  /* ---------- My shift ---------- */
  PAGES['store/today'] = (r) => {
    const s = st(r.storeId); const os = sOrders(s.id); const m = A.metrics(os);
    const active = os.filter(o => A.ACTIVE.includes(o.stage)).sort((a, b) => a.createdAt - b.createdAt);
    const cl = S().checklists[s.id] || []; const tk = S().tickets.filter(t => t.storeId === s.id && t.status !== 'resolved');
    const outs = s.outProducts.map(id => (C().PRODUCTS.find(p => p.id === id) || {}).name).concat(s.outIngredients.map(id => (C().INGREDIENTS.find(i => i.id === id) || {}).name)).filter(Boolean);
    const onShift = S().staff.filter(x => x.storeId === s.id && x.onShift);
    const live = C().OFFERS.filter(o => APP.offerStatus(o) === 'live' && (!o.stores || o.stores.includes(s.id)) && !(S().franchise.optOuts[o.id] || []).includes(s.id));
    return `${head(s, 'Today’s shift')}
      <div class="kpis">${U.kpi('Orders today', A.num(m.count), `${m.completed} completed`, { href: `#/store/${s.id}/orders` })}${U.kpi('In the kitchen', A.num(os.filter(o => ['received', 'accepted', 'preparing', 'baking'].includes(o.stage)).length), 'Need preparation', { href: `#/store/${s.id}/kitchen` })}${U.kpi('Ready / on the way', A.num(os.filter(o => ['ready', 'out'].includes(o.stage)).length), 'Keep the handoff moving')}${U.kpi('Net sales today', money(m.net), 'This store only')}${U.kpi('On-time today', A.pct(m.onTime), `target ${s.prepMin} min`)}${U.kpi('Team on shift', onShift.length, onShift.map(x => x.name.split(' ')[0]).slice(0, 3).join(', '), { href: `#/store/${s.id}/team` })}</div>
      <div class="grid g-2-1"><section class="card"><div class="card-h"><div><span class="eyebrow">Next up</span><h2>Make someone’s day.</h2></div><a class="link" href="#/store/${s.id}/kitchen">Kitchen board ${icon('chevR')}</a></div>
          ${active.length ? `<ul class="nextup">${active.slice(0, 8).map(o => `<li><span class="num">${esc(o.id.slice(-3))}</span><div><strong>${esc(o.customer)}</strong><small>${o.lines.map(l => `${l.qty} × ${esc(l.name)}`).join(' · ')}</small>${U.status(o.stage)} <span class="muted small">${o.mode === 'delivery' ? 'Delivery' : 'Pickup'} · ${Math.round((Date.now() - o.createdAt) / 6e4)} min</span></div>${o.live ? U.badge('App', 'brand') : `<button class="btn sm" data-act="board-advance" data-id="${o.id}">${esc(A.STAGE_LABEL[A.nextStage(o)] || '')}</button>`}</li>`).join('')}</ul>` : U.empty('check', 'Nothing in the queue', 'New orders appear here automatically.')}</section>
        <div><section class="card"><div class="card-h"><div><span class="eyebrow green">Your shift</span><h2>The little things matter.</h2></div></div><ul class="checks-list">${cl.map(c => `<li><label class="${c.done ? 'done' : ''}"><input type="checkbox" data-act="cl-toggle" data-s="${s.id}" data-id="${c.id}" ${c.done ? 'checked' : ''}><span>${esc(c.text)}${c.done ? `<small>${esc(c.by || '')} · ${A.fmtTime(c.at)}</small>` : ''}</span></label></li>`).join('')}</ul><a class="link" href="#/store/${s.id}/team">Team & checklist ${icon('chevR')}</a></section>
          <section class="card"><h2>Heads-up</h2><ul class="attn">${tk.length ? `<li class="a-warn"><a href="#/store/${s.id}/care">${icon('chat')}<span><strong>${tk.length} open guest issue${tk.length > 1 ? 's' : ''}</strong><small>${esc(tk[0].issue)}</small></span>${icon('chevR')}</a></li>` : ''}${outs.length ? `<li class="a-muted"><a href="#/store/${s.id}/availability">${icon('pizza')}<span><strong>${outs.length} unavailable</strong><small>${esc(outs.slice(0, 3).join(', '))}</small></span>${icon('chevR')}</a></li>` : ''}<li class="a-info"><a href="#/store/${s.id}/promos">${icon('tag')}<span><strong>${live.length} promotions running here</strong><small>${esc(live.map(o => o.code).join(', '))}</small></span>${icon('chevR')}</a></li>${S().bonusEvents.filter(b => b.status === 'live' && b.days.includes(new Date().getDay()) && (!b.stores || b.stores.includes(s.id))).map(b => `<li class="a-info"><a href="#/store/${s.id}/rewards">${icon('bolt')}<span><strong>${esc(b.name)} today</strong><small>Tell guests at the counter</small></span>${icon('chevR')}</a></li>`).join('')}</ul></section></div></div>`;
  };
  ACT['cl-toggle'] = () => {};
  APP.CHANGE['cl-toggle'] = (el) => { const c = (S().checklists[el.dataset.s] || []).find(x => x.id === el.dataset.id); c.done = el.checked; c.by = el.checked ? A.me().name : null; c.at = el.checked ? Date.now() : null; A.audit('store.checklist', 'store:' + el.dataset.s, `${c.done ? '✓' : '✗'} ${c.text}`); APP.render(); };

  /* ---------- Kitchen ---------- */
  PAGES['store/kitchen'] = (r) => { const s = st(r.storeId); return `${head(s, 'Kitchen board')}${APP.board(sOrders(s.id), true)}`; };

  /* ---------- Orders ---------- */
  PAGES['store/orders'] = (r) => {
    const s = st(r.storeId); const os = sOrders(s.id, 30);
    return `${head(s, 'Store orders', 'Last 30 days for this store. Open an order to update status, refund or credit within your limits.')}
      <section class="card">${U.table({ id: 'st-orders-' + s.id, rows: os, rowAct: 'order-open', search: o => o.id + ' ' + o.customer, csv: true, cols: [{ k: 'id', label: 'Order', render: o => `<strong>${esc(o.id)}</strong>` }, { k: 'createdAt', label: 'Placed', render: o => A.fmtDT(o.createdAt) }, { k: 'customer', label: 'Guest' }, { k: 'mode', label: 'Mode', render: o => o.mode === 'delivery' ? 'Delivery' : 'Pickup' }, { k: 'total', label: 'Total', align: 'r', render: o => money(o.total) }, { k: 'stage', label: 'Status', render: o => U.status(o.stage) }] })}</section>`;
  };

  /* ---------- Availability ---------- */
  PAGES['store/availability'] = (r) => {
    const s = st(r.storeId); const pub = C().PRODUCTS.filter(p => p.published !== false);
    const row = (x, kind) => { const out = s[kind].includes(x.id); return `<li class="${out ? 'out' : ''}"><span>${esc(x.name)}<small>${esc(kind === 'outProducts' ? x.cat : x.type)}</small></span><label class="switch sm"><input type="checkbox" data-act="ws-avail" data-s="${s.id}" data-p="${x.id}" data-kind="${kind}" ${out ? '' : 'checked'}><span class="sw" aria-hidden="true"></span><span>${out ? 'Unavailable' : 'Available'}</span></label></li>`; };
    return `${head(s, 'Availability', 'Keep the menu honest. Turning something off hides it in the apps for this store right away — guests never order what you can’t make.', s.outProducts.length + s.outIngredients.length ? `<button class="btn ghost" data-act="ws-restock" data-id="${s.id}">${icon('refresh')}Everything back in stock</button>` : '')}
      <div class="grid g-1-1"><section class="card"><h2>Menu items</h2><ul class="avail">${pub.map(p => row(p, 'outProducts')).join('')}</ul></section><section class="card"><h2>Ingredients</h2><ul class="avail">${C().INGREDIENTS.filter(i => !/^no-/.test(i.id)).map(i => row(i, 'outIngredients')).join('')}</ul></section></div>`;
  };
  ACT['ws-avail'] = () => {};
  APP.CHANGE['ws-avail'] = (el) => { const s = st(el.dataset.s); const k = el.dataset.kind; const out = !el.checked; const list = out ? Array.from(new Set(s[k].concat(el.dataset.p))) : s[k].filter(x => x !== el.dataset.p); const nm = (C().PRODUCTS.find(p => p.id === el.dataset.p) || C().INGREDIENTS.find(i => i.id === el.dataset.p)).name; A.liveStorePatch(s.id, { [k]: list }, `${nm} ${out ? '86’d' : 'back'}`); U.toast(`${nm} ${out ? 'unavailable' : 'available'}`); APP.render(); };
  ACT['ws-restock'] = (el) => { A.liveStorePatch(el.dataset.id, { outProducts: [], outIngredients: [] }, 'everything back in stock'); U.toast('Everything is available again'); APP.render(); };

  /* ---------- Hours & settings ---------- */
  PAGES['store/setup'] = (r) => {
    const s = st(r.storeId); const pend = S().approvals.filter(a => a.type === 'store.hours' && a.status === 'pending' && a.payload.storeId === s.id);
    return `${head(s, 'Hours & settings', 'Pickup details change immediately. Opening hours and delivery changes go to HQ for approval because they affect scheduling and fees.')}
      <div class="grid g-1-1"><section class="card"><h2>Pickup experience <span class="badge b-ok">live</span></h2><form data-form="ws-pickup" data-id="${s.id}">${U.checks('Pickup methods offered', 'methods', Object.entries(C().CONFIG.pickupMethods), s.pickupMethods)}${U.area('Where guests find their order', 'note', s.pickupNote, { rows: 3, attrs: { maxlength: 200 } })}<button class="btn sm" type="submit">Save</button></form></section>
        <section class="card"><h2>Opening hours & delivery <span class="badge b-info">HQ approval</span></h2>${pend.length ? U.note('A change is waiting for HQ approval.', 'warn') : ''}<form data-form="ws-hours" data-id="${s.id}"><div class="fgrid">${U.input('Opens', 'open', A.minToInput(s.open), { attrs: { type: 'time' } })}${U.input('Closes', 'close', s.close >= 1440 ? '23:59' : A.minToInput(s.close), { attrs: { type: 'time' } })}</div>${U.checks('Fulfillment', 'modes', [['pickup', 'Pickup'], ['delivery', 'Delivery']], s.modes)}${U.input('Special closure (date)', 'closure', '', { attrs: { type: 'date' }, opt: true, hint: 'e.g. holiday or maintenance' })}${U.input('Reason', 'reason', '', { attrs: { required: true } })}<button class="btn sm" type="submit">Request change</button></form></section></div>`;
  };
  FORM['ws-pickup'] = (d, f) => { const methods = [].concat(d.methods || []); if (!methods.length) return U.toast('Offer at least one pickup method', 'err'); A.liveStorePatch(f.dataset.id, { pickupMethods: methods, pickupNote: d.note }, 'pickup details updated'); U.toast('Pickup details updated'); APP.render(); };
  FORM['ws-hours'] = (d, f) => { const s = st(f.dataset.id); const p = { storeId: s.id, open: A.hhmmToMin(d.open), close: d.close === '23:59' ? 1440 : A.hhmmToMin(d.close), modes: [].concat(d.modes || []), closure: d.closure || null }; if (!p.modes.length) return U.toast('Pick at least one mode', 'err'); A.requestApproval('store.hours', `${s.name}: hours ${A.minToHHMM(p.open)}–${A.minToHHMM(p.close)}${p.closure ? ' · closed ' + p.closure : ''}`, d.reason, p); U.toast('Sent to HQ for approval', 'info'); APP.render(); };
  A.APPROVAL_RUN['store.hours'] = (p) => { const s = st(p.storeId); Object.assign(s, { open: p.open, close: p.close, modes: p.modes }); A.markDraft('STORES', `${s.name}: hours (approved)`); };

  /* ---------- Team & checklist ---------- */
  PAGES['store/team'] = (r) => {
    const s = st(r.storeId); const staff = S().staff.filter(x => x.storeId === s.id); const cl = S().checklists[s.id] || [];
    return `${head(s, 'Team & checklist')}
      <div class="grid g-2-1"><section class="card"><div class="card-h"><h2>Your people.</h2><button class="btn sm" data-act="staff-new" data-s="${s.id}">${icon('plus')}Add team member</button></div>
        ${U.table({ id: 'staff-' + s.id, rows: staff, noTools: true, noPage: true, rowAct: 'staff-edit', cols: [{ k: 'name', label: 'Name', render: x => `<strong>${esc(x.name)}</strong>` }, { k: 'role', label: 'Role' }, { k: 'shift', label: 'Shift' }, { k: 'phone', label: 'Phone' }, { k: 'onShift', label: 'Now', render: x => x.onShift ? U.badge('On shift', 'ok') : U.badge('Off', 'muted') }] })}</section>
        <section class="card"><div class="card-h"><h2>Shift checklist</h2><button class="btn sm ghost" data-act="cl-reset" data-s="${s.id}">${icon('refresh')}New shift</button></div><ul class="checks-list">${cl.map(c => `<li><label class="${c.done ? 'done' : ''}"><input type="checkbox" data-act="cl-toggle" data-s="${s.id}" data-id="${c.id}" ${c.done ? 'checked' : ''}><span>${esc(c.text)}${c.done ? `<small>${esc(c.by || '')} · ${A.fmtTime(c.at)}</small>` : ''}</span></label><button class="icon-btn" data-act="cl-del" data-s="${s.id}" data-id="${c.id}" aria-label="Remove task">${icon('x')}</button></li>`).join('')}</ul>
          <form data-form="cl-add" data-s="${s.id}" class="inline-form">${U.input('Add a task', 'text', '', { attrs: { required: true, maxlength: 80 } })}<button class="btn sm" type="submit">Add</button></form>
          <p class="muted small">${cl.filter(c => c.done).length} of ${cl.length} done</p></section></div>`;
  };
  ACT['staff-new'] = (el) => staffEditor(el.dataset.s, null); ACT['staff-edit'] = (el) => { const x = S().staff.find(y => y.id === el.dataset.id); staffEditor(x.storeId, x.id); };
  function staffEditor(sid, id) { const x = id ? S().staff.find(y => y.id === id) : { name: '', role: 'Pizza maker', shift: 'Mid 11–7', phone: '', onShift: false }; U.modal(id ? esc(x.name) : 'Add team member', `<form data-form="staff-save" data-s="${sid}" data-id="${id || ''}">${U.input('Name', 'name', x.name, { attrs: { required: true } })}<div class="fgrid">${U.select('Role', 'role', ['Shift lead', 'Pizza maker', 'Cashier', 'Dish & prep', 'Driver', 'Trainee'], x.role)}${U.select('Shift', 'shift', ['Open 9–5', 'Mid 11–7', 'Close 4–12'], x.shift)}</div>${U.input('Phone', 'phone', x.phone, { attrs: { type: 'tel' } })}${U.toggle('On shift now', 'onShift', x.onShift)}<div class="btn-row"><button class="btn" type="submit">Save</button>${id ? `<button type="button" class="btn ghost danger" data-act="staff-del" data-id="${id}">Remove</button>` : ''}</div></form>`); }
  FORM['staff-save'] = (d, f) => { let x = S().staff.find(y => y.id === f.dataset.id); if (!x) { x = { id: A.uid('st'), storeId: f.dataset.s }; S().staff.push(x); } Object.assign(x, { name: d.name, role: d.role, shift: d.shift, phone: d.phone, onShift: !!d.onShift }); A.audit('store.staff', 'store:' + x.storeId, `Saved ${x.name} (${x.role})`); U.close(); APP.render(); };
  ACT['staff-del'] = (el) => { const x = S().staff.find(y => y.id === el.dataset.id); S().staff = S().staff.filter(y => y !== x); A.audit('store.staff', 'store:' + x.storeId, `Removed ${x.name}`); U.close(); APP.render(); };
  FORM['cl-add'] = (d, f) => { (S().checklists[f.dataset.s] = S().checklists[f.dataset.s] || []).push({ id: A.uid('c'), text: d.text, done: false }); APP.render(); };
  ACT['cl-del'] = (el) => { S().checklists[el.dataset.s] = S().checklists[el.dataset.s].filter(c => c.id !== el.dataset.id); APP.render(); };
  ACT['cl-reset'] = (el) => { (S().checklists[el.dataset.s] || []).forEach(c => { c.done = false; c.by = null; c.at = null; }); A.audit('store.checklist', 'store:' + el.dataset.s, 'Started a new shift checklist'); APP.render(); };

  /* ---------- Guest care ---------- */
  PAGES['store/care'] = (r) => {
    const s = st(r.storeId); const fb = A.allOrders().filter(o => o.storeId === s.id && o.rating).slice(0, 12);
    const avg = fb.length ? A.sum(fb, o => o.rating) / fb.length : null;
    return `${head(s, 'Guest care', 'Make a difficult visit right. Resolve within your recovery limits; anything bigger goes to HQ automatically.')}
      ${APP.supportPage(S().tickets.filter(t => t.storeId === s.id), 'store-' + s.id, s.id)}
      <section class="card"><div class="card-h"><h2>What your guests are saying.</h2>${avg ? U.badge(avg.toFixed(1) + ' ★ average', avg >= 4.3 ? 'ok' : 'warn') : ''}</div>${fb.length ? `<ul class="feed">${fb.map(o => `<li><span><strong>${'★'.repeat(o.rating)}${'☆'.repeat(5 - o.rating)}</strong> ${esc(o.customer)}<small>${esc(o.id)} · ${A.rel(o.createdAt)} · ${o.lines.map(l => l.name).join(', ')}</small></span></li>`).join('')}</ul>` : U.empty('star', 'No ratings yet')}</section>`;
  };

  /* ---------- Promotions ---------- */
  PAGES['store/promos'] = (r) => {
    const s = st(r.storeId); const meta = S().storeMeta[s.id];
    const can = A.can('franchise.participation') || A.can('offers.edit');
    return `${head(s, 'Promotions', meta.ownership === 'franchise' ? `Franchise store · ${esc(meta.owner)}. You can run everything HQ suggests or opt out where HQ allows it.` : 'Corporate store · participates in all HQ promotions.')}
      ${can ? '' : U.note('Only the franchise owner or HQ marketing can change participation.', 'info')}
      ${APP.franchisePage([s.id])}
      <section class="card"><h2>Request a local promotion</h2><form data-form="local-promo" data-s="${s.id}"><div class="fgrid">${U.input('Idea', 'title', '', { attrs: { required: true, placeholder: 'e.g. $9 pizza for school spirit night' } })}${U.input('Dates', 'dates', '', { attrs: { placeholder: 'e.g. Dec 4–6' } })}</div>${U.area('Details for HQ', 'detail', '', { rows: 2 })}<button class="btn sm" type="submit" ${can ? '' : 'disabled'}>Send to HQ marketing</button></form>
        ${S().franchise.requests.filter(x => x.storeId === s.id).length ? `<ul class="feed small">${S().franchise.requests.filter(x => x.storeId === s.id).map(x => `<li><span>${esc(x.title)} ${U.status(x.status)}<small>${esc(x.dates || '')} · ${A.rel(x.at)}</small></span></li>`).join('')}</ul>` : ''}</section>`;
  };
  FORM['local-promo'] = (d, f) => { S().franchise.requests.unshift({ id: A.uid('lp'), storeId: f.dataset.s, title: d.title, dates: d.dates, detail: d.detail, status: 'pending', at: Date.now(), by: A.me().name }); A.notify(`Local promo request from ${APP.storeName(f.dataset.s)}: ${d.title}`, '#/hq/offers'); A.audit('franchise.request', 'store:' + f.dataset.s, d.title); U.toast('Sent to HQ marketing'); APP.render(); };

  /* ---------- Rewards & recovery ---------- */
  PAGES['store/rewards'] = (r) => {
    const s = st(r.storeId); const lim = S().loyalty.storeRecoveryLimit;
    const regulars = S().members.filter(m => m.homeStore === s.id && m.status === 'active').sort((a, b) => b.orders90 - a.orders90).slice(0, 10);
    const recent = S().ledger.filter(x => x.storeId === s.id && x.type === 'adjust').slice(0, 10);
    return `${head(s, 'Rewards & recovery', `Give guests a reason to return. You can add up to ${lim.points} points or ${money(lim.credit)} credit per guest without HQ approval.`)}
      <div class="grid g-1-1"><section class="card"><h2>Recover a visit</h2><form data-form="ws-recover" data-s="${s.id}">${U.input('Member (email or phone)', 'q', '', { attrs: { required: true, list: 'ws-mlist', placeholder: 'Search members' } })}<datalist id="ws-mlist">${S().members.filter(m => m.status === 'active').map(m => `<option value="${esc(m.email)}">${esc(m.name)}</option>`).join('')}</datalist>
          <div class="fgrid">${U.select('Give', 'type', [['points', 'Points'], ['credit', 'Service credit']], 'points')}${U.input('Amount (pts or $)', 'amt', '', { attrs: { type: 'number', min: 1, step: '0.01', required: true } })}</div>${U.input('What happened', 'reason', '', { attrs: { required: true } })}<button class="btn" type="submit">${icon('gift')}Apply</button></form></section>
        <section class="card"><h2>What guests come back for.</h2>${U.hbars(C().REWARDS.filter(x => !x.stores || x.stores.includes(s.id)).map(x => ({ label: x.name, v: x.cost, sub: (x.stores ? '' : 'all stores') })), { fmt: v => A.num(v) + ' pts' })}<p class="muted small">${S().bonusEvents.filter(b => b.status === 'live' && (!b.stores || b.stores.includes(s.id))).map(b => esc(b.name)).join(' · ')}</p></section></div>
      <div class="grid g-1-1"><section class="card"><h2>Your regulars</h2><ul class="feed">${regulars.map(m => `<li><span><strong>${esc(m.name)}</strong> ${U.badge(A.tierOf(m.lifetime).name, 'gold')}<small>${m.orders90} orders in 90 days · ${A.num(m.points)} pts · usually ${esc(m.daypart)} on ${A.DAYS[m.weekday]}</small></span></li>`).join('')}</ul></section>
        <section class="card"><h2>Recent recovery</h2>${recent.length ? `<ul class="ledger">${recent.map(x => `<li><span class="ok-t">+${x.points}</span><span>${esc((S().members.find(m => m.id === x.memberId) || {}).name)}<small>${esc(x.reason)} · ${A.rel(x.at)} · ${esc(x.by)}</small></span></li>`).join('')}</ul>` : U.empty('gift', 'No recovery actions yet')}</section></div>`;
  };
  FORM['ws-recover'] = (d, f) => {
    const m = S().members.find(x => x.email === d.q || x.phone === d.q || x.name === d.q); if (!m) return U.toast('No member with that email or phone', 'err');
    const lim = S().loyalty.storeRecoveryLimit; const amt = d.type === 'points' ? Math.round(+d.amt) : U.cents(d.amt);
    const over = d.type === 'points' ? amt > lim.points : amt > lim.credit;
    if (over && !A.role().hq) { A.requestApproval(d.type === 'points' ? 'points.adjust' : 'member.credit', `${APP.storeName(f.dataset.s)}: ${d.type === 'points' ? '+' + amt + ' pts' : money(amt) + ' credit'} for ${m.name}`, d.reason, d.type === 'points' ? { memberId: m.id, points: amt, reason: d.reason } : { memberId: m.id, amount: amt, reason: d.reason }); U.toast('Over your limit — sent to HQ', 'info'); APP.render(); return; }
    if (d.type === 'points') A.adjustPoints(m.id, amt, d.reason, 'adjust', { storeId: f.dataset.s }); else { m.credit += amt; A.audit('member.credit', 'member:' + m.id, `+${money(amt)} credit at ${APP.storeName(f.dataset.s)} — ${d.reason}`); }
    U.toast(`${d.type === 'points' ? '+' + amt + ' points' : money(amt) + ' credit'} for ${m.name}`); APP.render();
  };

  A.APPROVAL_RUN['member.credit'] = (p) => { const m = S().members.find(x => x.id === p.memberId); if (m) { m.credit += p.amount; A.audit('member.credit', 'member:' + m.id, `+${money(p.amount)} credit (approved) — ${p.reason}`); } };

  /* ---------- Store report ---------- */
  PAGES['store/report'] = (r) => {
    const s = st(r.storeId); const os = sOrders(s.id, 30); const m = A.metrics(os); const net = A.metrics(A.scope(A.allOrders(), { days: 30 }));
    const avgNet = net.net / C().STORES.length;
    const items = {}; os.filter(o => o.stage !== 'canceled').forEach(o => o.lines.forEach(l => { items[l.name] = (items[l.name] || 0) + l.qty; }));
    return `${head(s, 'Store report', 'Last 30 days, compared with the network average.')}
      <div class="kpis">${U.kpi('Net sales', money(m.net, { whole: true }), `${m.net >= avgNet ? '▲' : '▼'} vs network avg ${money(avgNet, { whole: true })}`)}${U.kpi('Orders', A.num(m.count))}${U.kpi('Average order', money(m.aov), 'network ' + money(net.aov))}${U.kpi('On-time', A.pct(m.onTime), 'network ' + A.pct(net.onTime))}${U.kpi('Rating', m.rating ? m.rating.toFixed(2) + ' ★' : '—')}${U.kpi('Refunds', money(m.refunds))}</div>
      <div class="grid g-2-1"><section class="card"><h2>Daily net sales</h2>${U.bars(A.dailySeries(os, 30).map(x => ({ label: x.label, v: x.net })), { fmt: v => money(v, { whole: true }), h: 180 })}</section><section class="card"><h2>Top items</h2>${U.hbars(Object.entries(items).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([label, v]) => ({ label, v })))}</section></div>`;
  };
})();
