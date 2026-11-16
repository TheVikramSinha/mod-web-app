/* MOD Back Office — shell, router, navigation, global search, event delegation. Pages register in APP.PAGES. */
(function () {
  'use strict';
  const A = window.ADM, U = window.UI; const { esc, icon } = { esc: A.esc, icon: U.icon };
  const PAGES = {}, ACT = {}, FORM = {}, INPUT = {}, CHANGE_ACT = {};
  const APP = { PAGES, ACT, FORM, INPUT, go, render, route: () => parse() };
  window.APP = APP;

  /* ---------------- navigation model ---------------- */
  const HQ_NAV = [
    ['Daily operations', [['overview', 'grid', 'Overview', 'reports.view'], ['orders', 'receipt', 'Orders', 'orders.manage'], ['fulfillment', 'bike', 'Fulfillment board', 'orders.manage'], ['support', 'chat', 'Support inbox', 'support.manage'], ['stores', 'store', 'Stores', null]]],
    ['Menu & app', [['menu', 'pizza', 'Menu catalog', null], ['content', 'image', 'App content', 'content.edit'], ['publish', 'rocket', 'Publish & versions', null]]],
    ['Marketing', [['offers', 'tag', 'Offers & coupons', null], ['campaigns', 'megaphone', 'Campaigns', null], ['results', 'chart', 'Campaign results', 'reports.view']]],
    ['Customers & insight', [['customers', 'users', 'Customers', 'members.view'], ['reports', 'chart', 'Reports', 'reports.view'], ['compare', 'layers', 'Compare stores', 'reports.view']]],
    ['Governance', [['approvals', 'shield', 'Approvals', null], ['users', 'user', 'Users & roles', 'users.manage'], ['audit', 'history', 'Audit log', 'audit.view'], ['integrations', 'plug', 'Integrations', 'settings.edit'], ['settings', 'settings', 'Settings', 'settings.edit']]]
  ];
  const LOY_NAV = [
    ['Program', [['overview', 'grid', 'Program overview', null], ['rules', 'settings', 'Earn & program rules', null], ['tiers', 'layers', 'Tiers', null], ['rewards', 'gift', 'Rewards catalog', null], ['bonus', 'bolt', 'Bonus events', null]]],
    ['Engagement', [['segments', 'target', 'Segments', null], ['journeys', 'route', 'Lifecycle journeys', null], ['campaigns', 'megaphone', 'Loyalty campaigns', null]]],
    ['Members', [['members', 'users', 'Members', 'members.view'], ['ledger', 'receipt', 'Points ledger', 'members.view'], ['fraud', 'shield', 'Fraud & risk', 'members.view']]],
    ['Network & finance', [['franchise', 'store', 'Franchise participation', null], ['liability', 'dollar', 'Liability & finance', 'finance.view'], ['migration', 'swap', 'Migration & launch', 'loyalty.rules']]]
  ];
  const STORE_NAV = [['today', 'grid', 'My shift'], ['kitchen', 'flame', 'Kitchen board'], ['orders', 'receipt', 'Store orders'], ['availability', 'pizza', 'Availability'], ['setup', 'clock', 'Hours & settings'], ['team', 'checklist', 'Team & checklist'], ['care', 'chat', 'Guest care'], ['promos', 'tag', 'Promotions'], ['rewards', 'gift', 'Rewards & recovery'], ['report', 'chart', 'Store report']];

  function parse() {
    const h = location.hash.replace(/^#\/?/, ''); const [path, qs] = h.split('?'); const parts = path.split('/').filter(Boolean);
    const q = Object.fromEntries(new URLSearchParams(qs || ''));
    let ws = parts[0] || ''; let page, storeId, sub;
    if (ws === 'store') { storeId = parts[1]; page = parts[2] || 'today'; sub = parts[3]; } else { page = parts[1] || 'overview'; sub = parts[2]; }
    return { ws, page, storeId, sub, q, parts, key: ws === 'store' ? 'store/' + page : ws + '/' + page };
  }
  function defaultRoute() { const r = A.role(); if (!r.hq) return '#/store/' + (A.me().stores[0] || 's1') + '/today'; return '#/hq/overview'; }
  function go(h) { if (location.hash === h) render(); else location.hash = h; }

  /* ---------------- shell ---------------- */
  function brand() { return `<a class="brand" href="${defaultRoute()}" aria-label="MOD Pizza back office home"><svg viewBox="0 0 132 128" class="b-shield" aria-hidden="true"><mask id="bm"><rect width="132" height="128" fill="#fff"/><text x="62" y="66" text-anchor="middle" font-family="Oswald, Arial Narrow, sans-serif" font-weight="700" font-size="44" fill="#000">MOD</text><text x="62" y="92" text-anchor="middle" font-family="Oswald, Arial Narrow, sans-serif" font-weight="600" font-size="21" letter-spacing="2" fill="#000">PIZZA</text></mask><path mask="url(#bm)" fill="#a61932" d="M62 3 C80 3 98 7 116 13 L116 62 C116 92 94 112 62 124 C30 112 8 92 8 62 L8 13 C26 7 44 3 62 3 Z"/></svg><span><strong>Back Office</strong><small>HQ · Loyalty · Stores</small></span></a>`; }
  function sidebar(r) {
    const role = A.role();
    if (r.ws === 'store') {
      const s = A.S.catalog.STORES.find(x => x.id === r.storeId) || A.S.catalog.STORES[0]; const meta = A.S.storeMeta[s.id] || {};
      return `${brand()}<div class="side-store"><span class="eyebrow">Your store</span><strong>${esc(s.name)}</strong><small>${esc(s.city)} · ${meta.ownership === 'franchise' ? 'Franchise' : 'Corporate'}</small>${U.status(s.accepting ? 'live' : 'paused', s.accepting ? 'Accepting orders' : 'Paused')}</div>
        <nav aria-label="Store workspace">${STORE_NAV.map(([id, ic, t]) => `<a href="#/store/${s.id}/${id}" class="${r.page === id ? 'on' : ''}" ${r.page === id ? 'aria-current="page"' : ''}>${icon(ic)}<span>${t}</span>${id === 'kitchen' ? countBadge(A.allOrders().filter(o => o.storeId === s.id && ['received', 'accepted'].includes(o.stage)).length) : id === 'care' ? countBadge(A.S.tickets.filter(t => t.storeId === s.id && t.status === 'open').length) : ''}</a>`).join('')}</nav>`;
    }
    const groups = r.ws === 'loyalty' ? LOY_NAV : HQ_NAV;
    return `${brand()}<nav aria-label="${r.ws === 'loyalty' ? 'Loyalty' : 'HQ'} navigation">${groups.map(([g, items]) => `<div class="nav-g"><span class="nav-gl">${g}</span>${items.map(([id, ic, t, perm]) => {
      const locked = perm && !A.can(perm); const on = r.page === id;
      const cnt = id === 'approvals' ? countBadge(A.S.approvals.filter(a => a.status === 'pending').length) : id === 'support' ? countBadge(A.S.tickets.filter(t => t.status === 'open').length) : id === 'publish' ? countBadge(A.diff().length, 'warn') : id === 'fraud' ? countBadge(A.S.members.filter(m => m.flags && m.flags.length).length, 'warn') : '';
      return `<a href="#/${r.ws}/${id}" class="${on ? 'on' : ''} ${locked ? 'locked' : ''}" ${on ? 'aria-current="page"' : ''}>${icon(ic)}<span>${t}</span>${locked ? icon('lock', 'lk') : cnt}</a>`;
    }).join('')}</div>`).join('')}</nav>${role.hq ? '' : ''}`;
  }
  const countBadge = (n, tone = 'brand') => n ? `<span class="nbadge nb-${tone}">${n > 99 ? '99+' : n}</span>` : '';
  function topbar(r) {
    const role = A.role(); const me = A.me(); const pend = A.diff().length; const unread = A.S.notifications.filter(n => !n.read).length;
    const wsBtn = (ws, label, href) => `<a href="${href}" class="ws ${r.ws === ws ? 'on' : ''}">${label}</a>`;
    const myStores = role.hq ? A.S.catalog.STORES : A.S.catalog.STORES.filter(s => me.stores.includes(s.id));
    return `<button class="icon-btn nav-toggle" data-act="nav-toggle" aria-label="Open navigation">${icon('menu')}</button>
      <div class="ws-switch" role="navigation" aria-label="Workspace">${role.hq ? wsBtn('hq', 'HQ', '#/hq/overview') + wsBtn('loyalty', 'Loyalty', '#/loyalty/overview') : ''}
        <label class="ws-store ${r.ws === 'store' ? 'on' : ''}"><span class="sr-only">Store workspace</span>${icon('store')}<select data-change="ws-store" aria-label="Open store workspace"><option value="">${role.hq ? 'Store workspace…' : 'My stores'}</option>${myStores.map(s => `<option value="${s.id}" ${r.storeId === s.id ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select></label></div>
      <div class="gsearch"><label>${icon('search')}<input id="gsearch" type="search" placeholder="Search orders, members, menu, offers…  ( / )" autocomplete="off" data-input="gsearch" aria-label="Global search"></label><div id="gs-results" class="gs-results" hidden></div></div>
      <span class="grow"></span>
      ${role.hq ? `<a class="pub-chip ${pend ? 'dirty' : ''}" href="#/hq/publish" title="Customer app publishing">${icon(pend ? 'alert' : 'check')}<span>${pend ? `${pend} unpublished change${pend === 1 ? '' : 's'}` : `Live · v${A.S.publishHistory[0] ? A.S.publishHistory[0].v : 0}`}</span></a>` : ''}
      <button class="icon-btn bell" data-act="notif" aria-label="Notifications, ${unread} unread">${icon('bell')}${unread ? `<span class="dot">${unread}</span>` : ''}</button>
      <button class="me" data-act="me-menu" aria-label="Account and role"><span class="avatar">${esc(me.name.split(' ').map(x => x[0]).join(''))}</span><span class="me-t"><strong>${esc(me.name)}</strong><small>${esc(role.name)}</small></span>${icon('chevD')}</button>`;
  }

  /* ---------------- render ---------------- */
  let lastKey = null;
  function render() {
    const r = parse();
    if (!r.ws || !['hq', 'loyalty', 'store'].includes(r.ws)) { location.replace(defaultRoute()); return; }
    if (r.ws !== 'store' && !A.role().hq) { location.replace(defaultRoute()); return; }
    if (r.ws === 'store') {
      if (!A.S.catalog.STORES.some(s => s.id === r.storeId)) { location.replace('#/store/' + (A.me().stores[0] || 's1') + '/today'); return; }
      if (!A.canStore(r.storeId) && !A.role().hq) { location.replace(defaultRoute()); return; }
    }
    // remember focus
    const ae = document.activeElement; let fk = null, sel = null;
    if (ae && ae.closest && ae.closest('#main, #topbar')) { fk = ae.id ? '#' + ae.id : ae.dataset.tblQ ? `[data-tbl-q="${ae.dataset.tblQ}"]` : ae.name && ae.form && ae.form.dataset.form ? `form[data-form="${ae.form.dataset.form}"] [name="${ae.name}"]` : null; if (typeof ae.selectionStart === 'number') sel = [ae.selectionStart, ae.selectionEnd]; }
    document.getElementById('sidebar').innerHTML = sidebar(r);
    document.getElementById('topbar').innerHTML = topbar(r);
    const fn = PAGES[r.key] || PAGES[r.ws + '/*'];
    let html;
    try { html = fn ? fn(r) : notFound(); } catch (e) { console.error(e); html = U.pageHead('Error', 'Something went wrong', esc(e.message)); }
    const main = document.getElementById('main'); main.innerHTML = html;
    document.body.dataset.ws = r.ws;
    document.title = `${(main.querySelector('h1') || {}).textContent || 'Back office'} · MOD Back Office`;
    const changed = lastKey !== location.hash; lastKey = location.hash;
    if (changed && !document.getElementById('overlay').hidden) U.close();
    if (changed) { window.scrollTo(0, 0); document.body.classList.remove('nav-open'); const h = main.querySelector('h1'); if (h && fk == null) h.focus({ preventScroll: true }); }
    if (fk) { const el = document.querySelector(fk); if (el) { el.focus({ preventScroll: true }); if (sel && el.setSelectionRange) try { el.setSelectionRange(sel[0], sel[1]); } catch (e) { /* ignore */ } } }
    A.commit();
  }
  function notFound() { return U.pageHead('404', 'Page not found', 'This screen doesn’t exist.') + `<a class="btn" href="${defaultRoute()}">Go to start</a>`; }
  APP.locked = (perm) => `${U.pageHead('Restricted', 'You don’t have access to this screen', `Your role (${esc(A.role().name)}) is missing the “${esc(A.PERMS[perm] || perm)}” permission.`)}${U.note('Switch role from the account menu (top right) to preview other personas. Access is enforced per permission and every change is written to the audit log.', 'info')}`;

  /* ---------------- global search ---------------- */
  function searchResults(q) {
    q = q.trim().toLowerCase(); if (q.length < 2) return [];
    const out = []; const add = (type, label, sub, href) => out.length < 14 && out.push({ type, label, sub, href });
    A.allOrders().filter(o => o.id.toLowerCase().includes(q) || (o.customer || '').toLowerCase().includes(q)).slice(0, 4).forEach(o => add('Order', o.id, `${o.customer} · ${A.money(o.total)} · ${A.STAGE_LABEL[o.stage]}`, `#/hq/orders?id=${o.id}`));
    if (A.can('members.view')) A.S.members.filter(m => (m.name + ' ' + m.email + ' ' + m.phone).toLowerCase().includes(q)).slice(0, 4).forEach(m => add('Member', m.name, `${m.email} · ${A.num(m.points)} pts`, `#/loyalty/members?id=${m.id}`));
    A.S.catalog.PRODUCTS.concat(A.S.catalog.BUILDER_PRODUCTS).filter(p => p.name.toLowerCase().includes(q)).slice(0, 3).forEach(p => add('Menu item', p.name, `${p.cat} · ${A.money(p.price)}`, `#/hq/menu?edit=${p.id}`));
    A.S.catalog.OFFERS.filter(o => (o.code + ' ' + o.title).toLowerCase().includes(q)).slice(0, 3).forEach(o => add('Offer', o.code, o.title, `#/hq/offers?edit=${o.id}`));
    A.S.campaigns.filter(c => c.name.toLowerCase().includes(q)).slice(0, 3).forEach(c => add('Campaign', c.name, c.cycle, `#/hq/campaigns?edit=${c.id}`));
    A.S.catalog.STORES.filter(s => (s.name + ' ' + s.city).toLowerCase().includes(q)).forEach(s => add('Store', s.name, s.city, `#/hq/stores?edit=${s.id}`));
    A.S.tickets.filter(t => (t.id + ' ' + t.issue + ' ' + t.customer).toLowerCase().includes(q)).slice(0, 3).forEach(t => add('Ticket', t.id, `${t.issue} · ${t.customer}`, `#/hq/support?id=${t.id}`));
    return out;
  }
  INPUT.gsearch = (el) => {
    const box = document.getElementById('gs-results'); const res = searchResults(el.value);
    if (!el.value.trim()) { box.hidden = true; return; }
    box.hidden = false; box.innerHTML = res.length ? res.map((x, i) => `<a href="${x.href}" class="gs-item" data-act="gs-go" ${i === 0 ? 'data-first' : ''}><span class="gs-type">${esc(x.type)}</span><span><strong>${esc(x.label)}</strong><small>${esc(x.sub)}</small></span></a>`).join('') : `<p class="muted small" style="padding:12px">No matches for “${esc(el.value)}”.</p>`;
  };
  ACT['gs-go'] = () => { const i = document.getElementById('gsearch'); if (i) i.value = ''; document.getElementById('gs-results').hidden = true; };

  /* ---------------- shared actions ---------------- */
  ACT['ov-close'] = () => U.close();
  ACT['confirm-yes'] = () => U.runConfirm();
  ACT['nav-toggle'] = () => document.body.classList.toggle('nav-open');
  ACT['tbl-sort'] = (el) => { const s = U.tstate(el.dataset.t); if (s.sort === el.dataset.k) s.dir = -s.dir; else { s.sort = el.dataset.k; s.dir = -1; } render(); };
  ACT['tbl-page'] = (el) => { U.tstate(el.dataset.t).page = Number(el.dataset.p); render(); };
  ACT['tbl-sel'] = (el, e) => { e.stopPropagation(); const s = U.tstate(el.dataset.t); const id = el.dataset.id; s.sel = el.checked ? s.sel.concat(id) : s.sel.filter(x => x !== id); render(); };
  ACT['tbl-selall'] = (el) => { const s = U.tstate(el.dataset.t); const t = U.TABLES[el.dataset.t]; const st = s; const key = t.cfg.key || ((r) => r.id); const view = t.rows.slice((st.page - 1) * st.size, st.page * st.size).map(r => String(key(r))); s.sel = el.checked ? Array.from(new Set(s.sel.concat(view))) : s.sel.filter(x => !view.includes(x)); render(); };
  ACT['tbl-clear'] = (el) => { U.tstate(el.dataset.t).sel = []; render(); };
  ACT['tbl-csv'] = (el) => U.csvFor(el.dataset.t);
  CHANGE_ACT['tbl-size'] = (el) => { const s = U.tstate(el.dataset.t); s.size = Number(el.value); s.page = 1; render(); };
  APP.CHANGE = CHANGE_ACT;
  CHANGE_ACT['ws-store'] = (el) => { if (el.value) go('#/store/' + el.value + '/today'); };
  ACT['notif'] = () => {
    const ns = A.S.notifications; ns.forEach(n => { n.read = true; });
    U.drawer('Notifications', ns.length ? `<ul class="feed">${ns.map(n => `<li><a href="${n.link || '#'}" data-act="ov-close">${icon('bell')}<span>${esc(n.text)}<small>${A.rel(n.at)}</small></span></a></li>`).join('')}</ul>` : U.empty('bell', 'You’re all caught up'));
    A.commit(); setTimeout(() => { document.getElementById('topbar').innerHTML = topbar(parse()); }, 0);
  };
  ACT['me-menu'] = () => {
    const me = A.me();
    U.drawer('Account & role', `<div class="me-card"><span class="avatar lg">${esc(me.name.split(' ').map(x => x[0]).join(''))}</span><div><strong>${esc(me.name)}</strong><small>${esc(me.email)}</small>${U.badge(A.role().name, 'brand')} ${me.mfa ? U.badge('MFA on', 'ok') : U.badge('MFA off', 'warn')}</div></div>
      <h3 class="h3">Preview as another user</h3><p class="muted small">Demo only — switching persona applies that user’s role, store scope and permissions everywhere.</p>
      <div class="persona-list">${A.S.users.filter(u => u.status === 'active').map(u => `<button class="persona ${u.id === me.id ? 'on' : ''}" data-act="persona" data-id="${u.id}"><span class="avatar">${esc(u.name.split(' ').map(x => x[0]).join(''))}</span><span><strong>${esc(u.name)}</strong><small>${esc(A.ROLES[u.role].name)}${u.stores.length ? ' · ' + u.stores.map(id => (A.S.catalog.STORES.find(s => s.id === id) || {}).name).join(', ') : ''}</small></span>${u.id === me.id ? icon('check') : ''}</button>`).join('')}</div>
      <h3 class="h3">Demo data</h3><div class="btn-row"><button class="btn secondary sm" data-act="export-all">${icon('download')}Export JSON</button><button class="btn ghost sm danger" data-act="reset-all">${icon('refresh')}Reset demo data</button></div>
      <p class="muted small">Session timeout ${A.S.settings.session.timeoutMin} min · data stored in this browser only.</p>`);
  };
  ACT['persona'] = (el) => { A.S.session.userId = el.dataset.id; A.audit('session.switch', 'user:' + el.dataset.id, 'Switched preview persona'); U.close(); U.toast('Now viewing as ' + A.me().name + ' · ' + A.role().name, 'info'); go(defaultRoute()); };
  ACT['export-all'] = () => { U.download('mod-backoffice-' + A.isoDate(Date.now()) + '.json', JSON.stringify(A.S, null, 1)); A.audit('export', 'all', 'Exported full back-office dataset'); };
  ACT['reset-all'] = () => U.confirm('Reset demo data?', 'This restores every screen to the original sample data and clears what has been published to the customer apps on this browser.', () => { A.reset(); U.toast('Demo data reset'); go(defaultRoute()); }, { danger: true, ok: 'Reset everything' });

  /* ---------------- events ---------------- */
  document.addEventListener('click', (e) => {
    const gs = document.querySelector('.gsearch'); if (gs && !gs.contains(e.target)) { const b = document.getElementById('gs-results'); if (b) b.hidden = true; }
    const t = e.target.closest('[data-act]');
    if (t && !t.disabled && t.getAttribute('aria-disabled') !== 'true') {
      if (t.tagName === 'INPUT' && t.type === 'checkbox' && !t.dataset.t) { /* handled on change */ }
      else if (t.tagName === 'SELECT') { /* handled on change */ }
      else { const fn = ACT[t.dataset.act]; if (fn) { if (t.tagName === 'A' && t.getAttribute('href') === '#') e.preventDefault(); if (t.tagName === 'BUTTON' || t.tagName === 'TR') e.preventDefault(); fn(t, e); return; } }
    }
    const h = e.target.closest('[data-href]'); if (h) go(h.dataset.href);
  });
  document.addEventListener('change', (e) => {
    const t = e.target; const k = t.dataset.change || (t.tagName === 'SELECT' && t.dataset.act) || (t.type === 'checkbox' && !t.dataset.t && t.dataset.act);
    if (k && (CHANGE_ACT[k] || ACT[k])) (CHANGE_ACT[k] || ACT[k])(t, e);
  });
  let qT = null;
  document.addEventListener('input', (e) => {
    const t = e.target;
    if (t.dataset.tblQ) { clearTimeout(qT); qT = setTimeout(() => { const s = U.tstate(t.dataset.tblQ); s.q = t.value; s.page = 1; render(); }, 160); return; }
    if (t.dataset.input && INPUT[t.dataset.input]) INPUT[t.dataset.input](t, e);
  });
  document.addEventListener('submit', (e) => {
    const f = e.target.closest('form[data-form]'); if (!f) return; e.preventDefault();
    const fn = FORM[f.dataset.form]; if (!fn) return;
    if (!f.checkValidity()) { f.reportValidity(); return; }
    fn(U.formData(f), f, e);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !document.getElementById('overlay').hidden) { U.close(); return; }
    if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); const g = document.getElementById('gsearch'); if (g) g.focus(); }
    if (e.key === 'Enter' && document.activeElement.id === 'gsearch') { const f = document.querySelector('#gs-results [data-first]'); if (f) { e.preventDefault(); f.click(); location.hash = f.getAttribute('href'); } }
    if ((e.key === 'Enter' || e.key === ' ') && document.activeElement.matches('tr.clickable, .kpi[data-href]')) { e.preventDefault(); document.activeElement.click(); }
  });
  window.addEventListener('hashchange', render);
  window.addEventListener('storage', (e) => { if (e.key && /^(modproto|modapp)/.test(e.key)) render(); });
  setInterval(() => { const r = parse(); if (document.getElementById('overlay').hidden && ['store/kitchen', 'hq/fulfillment', 'store/today', 'hq/overview'].includes(r.key) && !document.activeElement.matches('input,select,textarea')) render(); }, 20000);

  document.addEventListener('DOMContentLoaded', () => { A.load(); if (!location.hash) location.replace(defaultRoute()); render(); });
})();
