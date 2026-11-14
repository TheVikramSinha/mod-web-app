/* MOD Customer Prototype — router, rendering, actions, forms, timers and cross-window sync. */
(function () {
  'use strict';
  const M = window.MOD, U = window.UI, V = window.VIEWS, BLD = window.BUILDER;
  const { esc, attr, icon } = U;
  const { money } = M;
  const st = V.st;
  const main = document.getElementById('main');
  const hdr = document.getElementById('app-header');
  const tabbar = document.getElementById('tabbar');

  /* ---------------- Participant mode (per window) ---------------- */
  const PKEY = 'modParticipant';
  function participantInfo() { try { const v = sessionStorage.getItem(PKEY); return v ? JSON.parse(v) : null; } catch (e) { return window.__pinfo || null; } }
  function setParticipant(v) { try { sessionStorage.setItem(PKEY, JSON.stringify(v)); } catch (e) { window.__pinfo = v; } }
  const BEAT = M.PREFIX + 'hostbeat';
  window.__hostBeat = () => { try { return Number(localStorage.getItem(BEAT) || 0); } catch (e) { return Date.now(); } };

  /* ---------------- Routing ---------------- */
  function parseHash() {
    const full = (location.hash || '#/').slice(1);
    const [h, anchor] = full.split('#');
    const [path, qs] = h.split('?');
    const parts = path.split('/').filter(Boolean);
    const q = {}; new URLSearchParams(qs || '').forEach((v, k) => { q[k] = v; });
    return { path, parts, q, raw: h, anchor };
  }
  let lastRoute = null;

  function viewFor(r) {
    const [a, b] = r.parts;
    const pinfo = participantInfo();
    if (pinfo) {
      const allowed = (a === 'group' && b === pinfo.g) || ((a === 'menu' || a === 'item') && r.q.group === pinfo.g);
      if (!allowed) return V.fragments.pageHead('Participant window') + V.fragments.empty('users', 'This window is for a group order', 'Participant windows only show the shared group.', `<a class="btn btn-primary" href="#/group/${pinfo.g}?p=${pinfo.p}&view=participant">Back to the group</a>`);
    }
    st.groupTarget = (a === 'menu' || a === 'item') && r.q.group ? { g: r.q.group, p: r.q.p } : null;
    switch (a) {
      case undefined: case 'home': return V.home();
      case 'menu': return V.menu(r.q);
      case 'item': return BLD.itemView(b, r.q);
      case 'cart': return V.cart();
      case 'checkout': return V.checkout();
      case 'order': return V.order(b);
      case 'orders': return V.orders(r.q);
      case 'receipt': return V.receipt(b);
      case 'offers': return V.offers(r.q);
      case 'offer': return V.offer(b);
      case 'rewards': return V.rewards();
      case 'activity': return V.activity();
      case 'wallet': return V.wallet();
      case 'pass': return V.pass();
      case 'account': return V.account();
      case 'join': return V.join();
      case 'login': return V.login(r.q);
      case 'addresses': return V.addresses();
      case 'favorites': return V.favorites();
      case 'groups': return V.groups();
      case 'group': return V.group(b, r.q, !!pinfo);
      case 'support': return V.support(b);
      default: return V.notFound();
    }
  }
  const TITLES = { home: 'Home', login: 'Sign in', menu: 'Menu', item: 'Customize', cart: 'Cart', checkout: 'Checkout', order: 'Order tracking', orders: 'Orders', receipt: 'Receipt', offers: 'Offers', offer: 'Offer', rewards: 'Rewards', activity: 'Activity', wallet: 'Wallet', pass: 'Member pass', account: 'Account', join: 'Join', addresses: 'Addresses', favorites: 'Favorites', groups: 'Group orders', group: 'Group order', support: 'Help' };

  /* ---------------- Chrome ---------------- */
  const APPMODE = !!window.MOD_APP;
  const TAB_ROOTS = ['home', 'menu', 'rewards', 'orders', 'account'];
  function appHeader(r) {
    const a = r.parts[0] || 'home';
    const pinfo = participantInfo();
    const root = (TAB_ROOTS.includes(a) && !st.groupTarget) || (pinfo && a === 'group');
    const n = M.cartCount(); const { sh } = V.contextSummary();
    const title = a === 'home' ? '' : (a === 'account' ? 'Account' : TITLES[a] || '');
    if (a === 'login') return `<div class="abar abar-auth"><div class="abar-l"></div><div class="abar-c"><span class="logo" aria-label="MOD Pizza">${logo()}</span></div><div class="abar-r"></div></div>`;
    return `<div class="abar ${a === 'home' ? 'is-home' : ''}">
      <div class="abar-l">${root ? (a === 'home' || pinfo ? `<span class="logo" aria-label="MOD Pizza">${logo()}</span>` : '') : `<button class="abar-back" data-act="nav-back" aria-label="Back">${icon('chevL')}<span class="ios-only">Back</span></button>`}</div>
      <div class="abar-t" aria-hidden="true">${esc(title)}</div>
      <div class="abar-r">${pinfo ? '' : `${M.isMember() ? `<button class="abar-ico" data-act="journey-menu" aria-label="Account menu">${icon('star')}</button>` : `<a class="abar-ico" href="#/login" aria-label="Sign in">${icon('user')}</a>`}
        <a class="abar-ico cart" href="#/cart" aria-label="Cart, ${n} item${n === 1 ? '' : 's'}">${icon('cart')}${n ? `<span class="badge" aria-hidden="true">${n}</span>` : ''}</a>`}</div></div>`;
  }
  function cartBar(r) {
    const a = r.parts[0] || 'home'; const n = M.cartCount();
    if (!APPMODE || !n || participantInfo() || ['cart', 'checkout', 'item', 'order', 'login'].includes(a)) return '';
    const q = M.quote();
    return `<a class="cart-bar" href="#/cart"><span class="cb-n">${n}</span><span class="cb-t">View cart</span><span class="cb-p">${money(q.subtotal - q.discount)}</span></a>`;
  }
  function header(r) {
    if (APPMODE) return appHeader(r);
    const pinfo = participantInfo();
    if (pinfo) return `<div class="hdr-inner"><a class="logo" href="#/group/${pinfo.g}?p=${pinfo.p}&view=participant" aria-label="MOD group order">${logo()}</a><span class="pill pill-info">${icon('users')}Group participant window</span></div>`;
    const a = r.parts[0] || 'home';
    if (a === 'login') return `<div class="hdr-inner hdr-auth"><span class="logo" aria-label="MOD Pizza">${logo()}</span></div>`;
    const { sh, store, time } = V.contextSummary();
    const nav = (href, key, label) => `<a href="${href}" class="${a === key ? 'on' : ''}" ${a === key ? 'aria-current="page"' : ''}>${label}</a>`;
    const n = M.cartCount();
    return `<div class="hdr-inner">
      <a class="logo" href="#/" aria-label="MOD Pizza home">${logo()}</a>
      <nav class="hdr-nav" aria-label="Primary">${nav('#/menu', 'menu', 'Menu')}${nav('#/offers', 'offers', 'Offers')}${nav('#/rewards', 'rewards', 'Rewards')}${nav('#/orders', 'orders', 'Orders')}${nav('#/groups', 'groups', 'Group order')}</nav>
      <button class="ctx-chip" data-act="open-setup" aria-label="Order setup: ${attr(sh.mode)} at ${attr(store.name)}, ${attr(time)}">${icon(sh.mode === 'delivery' ? 'truck' : 'bag')}<span><span class="cc-l1"><strong>${sh.mode === 'delivery' ? 'Delivery' : 'Pickup'}</strong> · ${esc(store.name)}</span><small>${esc(time)}</small></span>${icon('chevD', 'chev')}</button>
      <div class="hdr-right">
        ${M.isMember() ? `<button class="journey-chip member" data-act="journey-menu" aria-label="Account menu, ${M.J().points} points">${icon('star')}<span>${M.J().points.toLocaleString()} pts</span></button>` : `<a class="journey-chip" href="#/login">${icon('user')}<span>Sign in</span></a>`}
        <a class="cart-btn" href="#/cart" aria-label="Cart, ${n} item${n === 1 ? '' : 's'}">${icon('cart')}<span class="badge ${n ? '' : 'zero'}" aria-hidden="true">${n}</span></a>
      </div></div>`;
  }
  const logo = () => U.logoImg();
  function tabs(r) {
    if (participantInfo()) return '';
    const a = r.parts[0] || 'home';
    if (a === 'login') return '';
    const t = (href, keys, ic, label) => { const on = keys.includes(a); return `<a href="${href}" class="${on ? 'on' : ''}" ${on ? 'aria-current="page"' : ''}>${icon(ic)}<span>${label}</span></a>`; };
    return t('#/', ['home'], 'home', 'Home') + t('#/menu', ['menu', 'item'], 'menu', 'Menu') + t('#/rewards', ['rewards', 'wallet', 'pass', 'activity', 'join'], 'star', 'Rewards') + t('#/orders', ['orders', 'order', 'receipt', 'support'], 'receipt', 'Orders') + t('#/account', ['account', 'addresses', 'favorites', 'groups', 'group', 'offers', 'offer'], 'user', APPMODE ? 'Account' : 'More');
  }

  /* ---------------- Render ---------------- */
  const KEY_ATTRS = ['act', 'id', 'uid', 'd', 'v', 'mode', 'diet', 'tip', 'm', 'j', 'kind', 'g', 'p', 'amt', 'k', 'tab'];
  const keyOf = (el) => el && el.dataset ? JSON.stringify(KEY_ATTRS.map(k => el.dataset[k] || '')) : null;
  let pendingRender = false;
  function render() {
    pendingRender = false;
    const r = parseHash();
    const changed = !lastRoute || lastRoute.path !== r.path || JSON.stringify(lastRoute.q) !== JSON.stringify(r.q);
    if (changed && lastRoute && lastRoute.path !== r.path) { st.fieldErrors = {}; st.blockers = []; st.promoMsg = null; st.addrEdit = null; if (r.parts[0] !== 'item') BLD.resetBuilder(); }
    const dlgOpen = !!U.topDialog();
    const ae = document.activeElement;
    const inMain = ae && main.contains(ae);
    const fid = inMain && ae.id; const fkey = inMain && !ae.id ? keyOf(ae) : null;
    const sel = inMain && ae && typeof ae.selectionStart === 'number' ? [ae.selectionStart, ae.selectionEnd] : null;
    hdr.innerHTML = header(r);
    let html; try { html = viewFor(r); } catch (e) { console.error(e); html = V.fragments.pageHead('Something went wrong') + V.fragments.note(esc(e.message), 'err'); }
    main.innerHTML = html;
    tabbar.innerHTML = tabs(r);
    const cb = document.getElementById('cartbar'); if (cb) cb.innerHTML = cartBar(r);
    if (APPMODE && changed && changedPath) { main.classList.remove('enter'); void main.offsetWidth; main.classList.add('enter'); }
    document.body.classList.toggle('participant-mode', !!participantInfo());
    document.body.dataset.route = r.parts[0] || 'home';
    document.title = `${TITLES[r.parts[0]] ? TITLES[r.parts[0]] + ' · ' : ''}MOD Pizza`;
    lastRoute = r;
    afterRender();
    if (dlgOpen) return;
    if (changed) {
      if (changedPath) window.scrollTo(0, 0);
      const h = main.querySelector('h1'); if (h && changedPath) h.focus({ preventScroll: true });
      const target = r.anchor && document.getElementById(r.anchor);
      if (target) { target.scrollIntoView(); const f = target.querySelector('input, textarea, button'); if (f) f.focus({ preventScroll: true }); }
    } else if (fid) {
      const el = document.getElementById(fid); if (el) { el.focus({ preventScroll: true }); if (sel && el.setSelectionRange) try { el.setSelectionRange(sel[0], sel[1]); } catch (e) { /* ignore */ } }
    } else if (fkey) {
      const el = [...main.querySelectorAll('[data-act]')].find(x => keyOf(x) === fkey); if (el) el.focus({ preventScroll: true });
    }
  }
  let changedPath = true;
  function go(hash) { if (location.hash === hash) render(); else location.hash = hash; }

  function afterRender() {
    // courier position along the illustrative route
    const svg = document.getElementById('map-svg');
    if (svg) {
      const path = svg.querySelector('#route'); const c = svg.querySelector('#courier');
      const frac = Number(svg.dataset.frac || 0);
      try { const len = path.getTotalLength(); const pt = path.getPointAtLength(len * frac); c.setAttribute('transform', `translate(${pt.x} ${pt.y})`); st.courier = [pt.x, pt.y]; } catch (e) { /* ignore */ }
    }
    updateCountdowns();
  }
  function updateCountdowns() {
    document.querySelectorAll('.resend[data-until]').forEach(el => {
      const left = Math.ceil((Number(el.dataset.until) - Date.now()) / 1000); const b = el.closest('button');
      if (left > 0) { el.textContent = `Resend code in ${left}s`; b.setAttribute('aria-disabled', 'true'); } else { el.textContent = 'Resend code'; b.removeAttribute('aria-disabled'); }
    });
    document.querySelectorAll('.countdown[data-deadline]').forEach(el => {
      const ms = Number(el.dataset.deadline) - Date.now();
      if (ms <= 0) { el.textContent = 'Selections closed'; return; }
      const m = Math.floor(ms / 60000), s = Math.floor(ms / 1000) % 60;
      el.textContent = `${m}m ${String(s).padStart(2, '0')}s left`;
    });
  }

  /* ---------------- Helpers ---------------- */
  function offerToCart(id) {
    const o = M.OFFER[id]; const q = M.quote();
    const r = M.evalOffer(o, { j: M.J(), store: q.store, mode: q.mode, priced: q.priced, subtotal: q.subtotal, journey: M.S.shared.journey });
    if (!r.ok) { st.promoMsg = { kind: 'err', text: `${o.code}: ${r.reason}` }; U.toast(`${o.code}: ${r.reason}`, 'err'); return false; }
    const hadReward = !!M.S.shared.cart.rewardId;
    M.S.shared.cart.couponId = id; M.S.shared.cart.rewardId = null; M.commit('shared');
    st.promoCode = ''; st.promoMsg = { kind: 'ok', text: `${o.code} applied — you save ${money(r.discount)}.` };
    U.toast(`${o.code} applied · −${money(r.discount)}${hadReward ? ' (replaced your points reward)' : ''}`);
    return true;
  }
  function addSimple(id) {
    const p = M.PROD[id];
    if (st.groupTarget) {
      const g = M.getGroup(st.groupTarget.g); const pp = g && g.participants.find(x => x.id === st.groupTarget.p);
      if (!g || !pp) return;
      if (M.groupLocked(g)) { U.toast('Selections are closed for this group.', 'err'); return; }
      const iss = M.productIssue(p, M.STORE[g.storeId], g.mode); if (iss) { U.toast(iss, 'err'); return; }
      const ex = pp.items.find(l => l.productId === id && !l.config && !l.note);
      if (ex) ex.qty = Math.min(20, ex.qty + 1); else pp.items.push({ uid: M.uid('l'), productId: id, config: null, qty: 1, note: '' });
      pp.ready = false; M.commit('groups'); U.toast(`${p.name} added for ${pp.name}`); return;
    }
    const iss = M.productIssue(p, M.curStore(), M.S.shared.mode); if (iss) { U.toast(iss, 'err'); return; }
    if (M.S.shared.groupCheckout) { U.toast('Finish or reopen the group checkout before adding personal items.', 'err'); return; }
    M.addToCart(id, null, 1);
    U.toast(`${p.name} added`, 'ok', { action: { label: 'View cart', href: '#/cart' } });
  }
  function groupItem(el) { const g = M.getGroup(el.dataset.g); const p = g && g.participants.find(x => x.id === el.dataset.p); const l = p && el.dataset.uid ? p.items.find(x => x.uid === el.dataset.uid) : null; return { g, p, l }; }
  function guardGroupEdit(g) {
    if (!g) return false;
    if (M.groupLocked(g)) { U.toast(g.status === 'open' ? 'Selections are closed — the host can extend the deadline.' : 'Selections are locked.', 'err'); return false; }
    if (participantInfo() && Date.now() - window.__hostBeat() > 8000) { U.toast('The host window is closed — changes are paused.', 'err'); return false; }
    return true;
  }
  function journeyDialog() {
    const j = M.J(); const p = j.profile;
    const entry = U.openDialog({ title: 'Account', size: 'sm', body: `<div class="acct-head"><div class="avatar lg" aria-hidden="true">${esc((p.name || 'M').slice(0, 1))}</div><div><strong>${esc(p.name)}</strong><small>${j.points.toLocaleString()} pts · ${esc(M.tierOf(j).name)}</small></div></div>
      <nav class="mini-links" aria-label="Account">${[['#/rewards', 'star', 'Rewards'], ['#/wallet', 'wallet', `Wallet · ${money(j.wallet.gift)}`], ['#/pass', 'card', 'Member pass'], ['#/orders', 'receipt', 'Orders'], ['#/account', 'user', 'Account settings']].map(([h, ic, t]) => `<a class="mini-link" href="${h}">${icon(ic)}<span><strong>${t}</strong></span>${icon('chevR')}</a>`).join('')}</nav>
      <button class="btn btn-outline btn-block" style="margin-top:14px" data-act="sign-out">Sign out</button>` });
    return entry;
  }
  function cancelDialog(id) {
    const f = M.findOrder(id); if (!f) return;
    if (!M.canAmend(f.order)) { U.toast('The store has accepted this order — it can’t be canceled. Contact support for help.', 'err'); return; }
    const reasons = ['Ordered by mistake', 'Need to change items', 'Wrong time or location', 'Taking too long', 'Other'];
    const entry = U.openDialog({ title: 'Cancel this order?', size: 'sm', body: `<p class="small">${esc(f.order.id)} · ${money(f.order.totals.total)}. You’ll get a full refund to your original payment${f.journey === 'member' ? ', and any points, wallet funds or service credit used will be restored' : ''}. This can’t be undone.</p>
      <fieldset class="radio-cards"><legend>Reason</legend>${reasons.map((r, i) => `<label class="rcard"><input type="radio" name="cr" value="${esc(r)}" ${i === 0 ? 'checked' : ''}><span>${esc(r)}</span></label>`).join('')}</fieldset>
      <div class="field" id="cr-other" hidden><label for="cr-note">Tell us more</label><textarea id="cr-note" rows="3" maxlength="300" placeholder="What made you cancel?" aria-describedby="cr-err"></textarea><p class="err" id="cr-err" hidden></p></div>`,
      footer: '<button class="btn btn-ghost" data-dlg-close>Keep order</button><button class="btn btn-primary" id="co-yes">Cancel order</button>' });
    const other = entry.dlg.querySelector('#cr-other'), note = entry.dlg.querySelector('#cr-note'), err = entry.dlg.querySelector('#cr-err');
    entry.dlg.addEventListener('change', (e) => { if (e.target.name !== 'cr') return; const isOther = e.target.value === 'Other'; other.hidden = !isOther; if (isOther) note.focus(); else { err.hidden = true; note.removeAttribute('aria-invalid'); } });
    entry.dlg.querySelector('#co-yes').addEventListener('click', () => {
      let reason = (entry.dlg.querySelector('input[name=cr]:checked') || {}).value;
      if (reason === 'Other') {
        const t = note.value.trim();
        if (t.length < 3) { err.textContent = 'Please add a short comment so we know what happened.'; err.hidden = false; note.setAttribute('aria-invalid', 'true'); note.focus(); U.announce(err.textContent, true); return; }
        reason = `Other: ${t}`;
      }
      const r = M.cancelOrder(id, reason); U.closeDialog(entry);
      if (r.ok) U.toast(`Order ${id} canceled · full refund (simulated)`); else U.toast(r.reason, 'err');
      render();
    });
  }
  function scanDialog() {
    if (!M.isMember()) { U.toast('Sign in to earn points from in-store receipts.', 'info'); go('#/login'); return; }
    const recs = window.MOD_DATA.SAMPLE_RECEIPTS;
    const body = `<div class="scanner" id="scanner" aria-hidden="true"><div class="scan-frame"><span></span><span></span><span></span><span></span><i class="scan-line"></i></div><p>Line up the barcode at the bottom of your receipt</p></div>
      <p id="scan-status" class="scan-status" role="status">Camera is simulated in this prototype. Choose a sample receipt to “scan”:</p>
      <div class="journey-opts" id="scan-opts">${recs.map(r => `<button class="journey-opt" data-scan="${r.id}">${icon('receipt')}<span><strong>${esc(r.id)}</strong><small>${esc(r.label)}</small></span></button>`).join('')}
        <label class="journey-opt upload">${icon('download')}<span><strong>Upload a receipt photo</strong><small>We’ll read the code from the image (simulated)</small></span><input type="file" accept="image/*" id="scan-file" class="sr-only"></label></div>`;
    const entry = U.openDialog({ title: 'Scan receipt', size: 'md', body });
    const status = entry.dlg.querySelector('#scan-status'); const scanner = entry.dlg.querySelector('#scanner');
    const run = (code) => {
      scanner.classList.add('busy'); status.className = 'scan-status'; status.textContent = 'Reading receipt…';
      entry.dlg.querySelectorAll('[data-scan], #scan-file').forEach(b => { b.disabled = true; });
      setTimeout(() => {
        scanner.classList.remove('busy');
        const r = M.claim('scan', code);
        entry.dlg.querySelectorAll('[data-scan], #scan-file').forEach(b => { b.disabled = false; });
        if (r.ok) { status.className = 'scan-status ok'; status.textContent = `+${r.points} points added for ${r.receipt.id}.`; U.toast(`+${r.points} pts from your in-store receipt`); render(); }
        else { status.className = 'scan-status err'; status.textContent = r.reason; }
      }, 1100);
    };
    entry.dlg.addEventListener('click', (e) => { const b = e.target.closest('[data-scan]'); if (b && !b.disabled) run(b.dataset.scan); });
    entry.dlg.querySelector('#scan-file').addEventListener('change', (e) => {
      if (!e.target.files.length) return;
      const claimed = M.J().claims.receipts || [];
      const pick = recs.find(r => !claimed.includes(r.id) && r.daysAgo <= M.CONFIG.receiptMaxAgeDays) || recs[0];
      run(pick.id); e.target.value = '';
    });
  }
  function pdf(o) {
    const lib = window.jspdf && window.jspdf.jsPDF;
    if (!lib) { U.toast('PDF library unavailable — use Print instead.', 'err'); return; }
    const doc = new lib({ unit: 'pt', format: 'letter' });
    const W = doc.internal.pageSize.getWidth(); let y = 56; const L = 48, R = W - 48;
    const line = (txt, opts = {}) => { doc.setFont('helvetica', opts.bold ? 'bold' : 'normal'); doc.setFontSize(opts.size || 10); doc.setTextColor(...(opts.color || [35, 31, 32])); const rows = doc.splitTextToSize(String(txt), opts.w || (R - L)); rows.forEach(t => { if (y > 740) { doc.addPage(); y = 56; } doc.text(t, opts.x || L, y, opts.align ? { align: opts.align } : undefined); y += (opts.size || 10) + 4; }); };
    doc.setFillColor(166, 25, 50); doc.rect(0, 0, W, 8, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(26); doc.setTextColor(166, 25, 50); doc.text('MOD', L, y + 10); doc.setFontSize(12); doc.setTextColor(35, 31, 32); doc.text('pizza', L + 68, y + 10);
    doc.setFontSize(18); doc.text('Invoice', R, y + 10, { align: 'right' }); y += 36;
    const s = M.stageOf(o);
    [['Invoice', o.invoice.id], ['Revision', String(o.invoice.revision)], ['Order', o.id], ['Date', `${M.fmtDate(o.createdAt, o.tz)} ${M.fmtTime(o.createdAt, o.tz)}`], ['Status', s.label]].forEach(([k, v]) => { doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(110); doc.text(k, R - 180, y); doc.setTextColor(35, 31, 32); doc.text(v, R, y, { align: 'right' }); y += 13; });
    y += 8;
    line('Billed to', { bold: true }); line(`${o.contact.name} · ${o.contact.email} · ${o.contact.phone}`); if (o.address) line(o.address);
    y += 4; line('Store', { bold: true }); line(`MOD ${o.storeName} · ${o.storeAddress} · ${o.mode === 'delivery' ? 'Delivery' : 'Pickup'}${o.schedule.type === 'later' ? ' · scheduled ' + M.fmtTime(o.schedule.slot, o.tz, { date: true }) : ''}`);
    y += 10; doc.setDrawColor(230); doc.line(L, y, R, y); y += 16;
    o.lines.forEach(l => {
      doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(35, 31, 32);
      doc.text(`${l.qty} × ${l.name}${l.participant ? ' · ' + l.participant : ''}`, L, y); doc.text(money(l.total), R, y, { align: 'right' }); y += 14;
      (l.recipe || l.desc).forEach(rr => line(rr, { size: 8.5, color: [100, 100, 100], x: L + 14, w: R - L - 100 }));
      if (l.note) line('Note: ' + l.note, { size: 8.5, color: [100, 100, 100], x: L + 14 });
      y += 4;
    });
    doc.line(L, y, R, y); y += 16;
    const t = o.totals; const row = (k, v, b) => { doc.setFont('helvetica', b ? 'bold' : 'normal'); doc.setFontSize(b ? 11 : 10); doc.text(k, R - 220, y); doc.text(v, R, y, { align: 'right' }); y += 15; };
    row('Subtotal', money(t.subtotal)); if (t.discount) row(`Savings ${t.discountLabel ? '(' + t.discountLabel + ')' : ''}`, '-' + money(t.discount));
    if (o.mode === 'delivery') row('Delivery fee', money(t.deliveryFee)); row('Estimated tax', money(t.tax)); row('Tip', money(t.tip)); row('Total', money(t.total), true);
    y += 4; row('Service credit', money(o.payment.credit)); row('Gift-wallet funds', money(o.payment.gift)); row({ card: 'Card (simulated)', apple: 'Apple Pay (simulated)', google: 'Google Pay (simulated)', wallet: 'MOD Wallet' }[o.payment.method] || 'Card', money(o.payment.method === 'wallet' ? 0 : o.payment.other));
    y += 10;
    if (o.couponId) line(`Coupon: ${M.OFFER[o.couponId].code} — ${M.OFFER[o.couponId].title}`, { size: 9 });
    if (o.reward) line(`Reward: ${o.reward.name} (${o.reward.cost} pts)`, { size: 9 });
    line(`Points: ${o.journey === 'member' ? (o.pointsAwarded ? o.pointsEarned + ' earned' : (o.pointsEstimate || 0) + ' pending') : 'Guest order — not eligible'}`, { size: 9 });
    o.amendments.forEach(a => line(`Amendment: ${a.line} — ${a.after} (${money(a.charge)})`, { size: 9 }));
    y += 10; line('Original purchase prices shown. Sample tax values. Prototype document — no real payment was taken.', { size: 8, color: [120, 120, 120] });
    doc.save(`${o.invoice.id}-rev${o.invoice.revision}.pdf`);
    U.toast('PDF downloaded');
  }

  /* ---------------- Actions ---------------- */
  const ACT = {
    'open-setup': (el) => BLD.openSetup(el.dataset.tab, app),
    'sign-out': () => {
      const r = M.signOut(); if (!r.ok) return U.toast(r.reason, 'err');
      const d = U.topDialog(); if (d) U.closeDialog(d);
      st.login = null; U.toast('Signed out — you’re browsing as a guest', 'info'); go('#/');
    },
    'cancel-order': (el) => cancelDialog(el.dataset.id),
    'im-here': (el) => { if (M.imHere(el.dataset.id)) U.toast('Thanks! The team knows you’re here.'); },
    'scan-receipt': () => scanDialog(),
    'login-channel': (el) => { st.login = Object.assign(st.login || {}, { channel: el.dataset.v, error: '', value: '' }); },
    'login-sample': () => { st.login = Object.assign(st.login || {}, { channel: 'email', value: M.S.journeys.member.profile.email, error: '' }); setTimeout(() => { const f = main.querySelector('form[data-form=otp-request]'); if (f) f.requestSubmit(); }, 0); },
    'otp-resend': () => { const o = M.S.shared.otp; if (!o) return; const r = M.requestOtp(o.channel, o.value); st.login.error = r.ok ? '' : r.reason; if (r.ok) U.toast('New code sent (simulated)', 'info'); },
    'otp-change': () => { M.S.shared.otp = null; M.commit('shared'); st.login.step = 'enter'; st.login.error = ''; },
    'pickup-method': (el) => { if (!M.setPickupMethod(el.dataset.v)) U.toast('Not available at this store', 'err'); },
    dropoff: (el) => M.setDropoff(el.dataset.v),
    'use-next-slot': () => { const d = M.slotsFor(M.curStore(), M.S.shared.mode).find(x => x.slots.length); if (!d) return U.toast('No times available at this store.', 'err'); M.setSchedule('later', d.slots[0]); st.blockers = []; U.toast('Scheduled for ' + M.scheduleText(M.S.shared.schedule, M.curStore())); },
    'nav-back': () => { const a = parseHash().parts[0]; if (st.groupTarget) go(`#/group/${st.groupTarget.g}`); else if (history.length > 1 && window.__navCount > 1) history.back(); else go(a === 'item' ? '#/menu' : '#/'); },
    'journey-menu': () => journeyDialog(),
    mode: (el) => { if (M.S.shared.groupCheckout) return U.toast('Fulfillment is locked during group checkout.', 'err'); if (!M.setMode(el.dataset.mode)) U.toast('Not offered at this store', 'err'); else U.announce(`${el.dataset.mode} selected`); },
    journey: (el) => {
      const r = M.switchJourney(el.dataset.j);
      if (!r.ok) return U.toast(r.reason, 'err');
      const d = U.topDialog(); if (d && d.dlg.querySelector('.journey-opts')) U.closeDialog(d);
      U.toast(el.dataset.j === 'member' ? 'Now in the sample member journey (demo, not real sign-in)' : 'Now browsing as a guest', 'info');
      if (el.dataset.go) go(el.dataset.go);
    },
    'add-simple': (el) => addSimple(el.dataset.id),
    fav: (el) => { const j = M.J(); const i = j.favorites.indexOf(el.dataset.id); if (i > -1) j.favorites.splice(i, 1); else j.favorites.push(el.dataset.id); M.commit('journey'); U.announce(i > -1 ? 'Removed from favorites' : 'Saved to favorites'); },
    diet: (el) => { st.menu.diet = el.dataset.diet; st.menu.touched = true; st.menu.auto = false; },
    'prof-edit': (el) => { st.profEdit = el.dataset.v || null; st.fieldErrors = {}; setTimeout(() => { const i = main.querySelector('.pform input'); if (i) i.focus(); else { const b = main.querySelector(`[data-act=prof-edit][data-v="${el.dataset.v ? '' : ''}"]`); } }, 0); },
    'pref-toggle': (el) => { const p = M.J().profile; p[el.dataset.k] = el.checked; M.commit('journey'); U.announce(el.checked ? 'On' : 'Off'); },
    'clear-search': () => { st.menu.q = ''; },
    'clear-filters': () => { st.menu.q = ''; st.menu.diet = 'all'; go('#/menu' + (st.groupTarget ? `?group=${st.groupTarget.g}&p=${st.groupTarget.p}` : '')); },
    qty: (el) => { const l = M.S.shared.cart.lines.find(x => x.uid === el.dataset.uid); if (l) { M.setQty(l.uid, l.qty + Number(el.dataset.d)); U.announce(l.qty + Number(el.dataset.d) <= 0 ? 'Item removed' : `Quantity ${Math.min(20, l.qty)}`); } },
    'remove-line': (el) => { const l = M.S.shared.cart.lines.find(x => x.uid === el.dataset.uid); M.removeLine(el.dataset.uid); if (l) U.toast(`${M.PROD[l.productId].name} removed`, 'info'); },
    'promo-toggle': () => { st.promoOpen = !st.promoOpen; },
    'coupon-apply': (el) => { offerToCart(el.dataset.id); },
    'coupon-remove': () => { M.S.shared.cart.couponId = null; M.commit('shared'); st.promoMsg = null; U.toast('Offer removed', 'info'); },
    'reward-select': (el) => {
      const r = M.REWARD[el.dataset.id]; const q = M.quote();
      const ev = M.evalReward(r, { j: M.J(), store: q.store, mode: q.mode, priced: q.priced, subtotal: q.subtotal, journey: M.S.shared.journey });
      if (!ev.ok) return U.toast(ev.reason, 'err');
      const had = !!M.S.shared.cart.couponId; M.S.shared.cart.rewardId = r.id; M.S.shared.cart.couponId = null; M.commit('shared');
      U.toast(`${r.name} selected${had ? ' (replaced your coupon)' : ''} · ${r.cost} pts at checkout`);
    },
    'reward-remove': () => { M.S.shared.cart.rewardId = null; M.commit('shared'); U.toast('Reward removed', 'info'); },
    reorder: (el) => {
      if (M.S.shared.groupCheckout) return U.toast('Finish or reopen the group checkout first.', 'err');
      const f = M.findOrder(el.dataset.id); if (!f) return;
      const r = M.reorder(f.order);
      if (r.added.length) U.toast(`Added ${r.added.length} item${r.added.length > 1 ? 's' : ''} at current prices${r.skipped.length ? ` · ${r.skipped.length} unavailable` : ''}`, 'ok', { action: { label: 'View cart', href: '#/cart' } });
      if (r.skipped.length) setTimeout(() => U.toast('Skipped — ' + r.skipped.join('; '), 'err', { ms: 6000 }), 400);
    },
    'set-goto': (el) => { M.J().goTo = el.dataset.id; M.commit('journey'); U.toast('Saved as your go-to order — it’s on Home now'); },
    tip: (el) => { const v = el.dataset.tip; M.S.shared.tip = v === 'custom' ? { kind: 'custom', value: 0, custom: M.S.shared.tip.custom || 300 } : { kind: 'pct', value: Number(v), custom: 0 }; M.commit('shared'); },
    'pay-method': (el) => { M.S.shared.pay.method = el.dataset.m; if (el.dataset.m === 'wallet') M.S.shared.pay.useGift = false; M.commit('shared'); },
    'loyalty-opt': (el) => { M.S.shared.draft[el.dataset.k] = el.checked; M.commit('shared'); },
    'toggle-credit': () => { M.S.shared.pay.useCredit = !M.S.shared.pay.useCredit; M.commit('shared'); },
    'toggle-gift': () => { M.S.shared.pay.useGift = !M.S.shared.pay.useGift; M.commit('shared'); },
    allergen: (el) => {
      const d = M.S.shared.draft; let a = d.allergens || [];
      if (el.value === 'None') a = el.checked ? ['None'] : [];
      else { a = a.filter(x => x !== 'None'); a = el.checked ? a.concat(el.value) : a.filter(x => x !== el.value); }
      d.allergens = a; M.commit('shared');
    },
    'amend-open': (el) => BLD.openAmend(el.dataset.id, app),
    'chat-open': (el) => BLD.openChat(el.dataset.id),
    'map-zoom': (el) => { st.mapZoom = Math.max(1, Math.min(3, st.mapZoom + Number(el.dataset.d) * 0.5)); U.announce(`Zoom ${st.mapZoom}×`); },
    'map-recenter': () => { const c = st.courier || [200, 130]; st.mapZoom = Math.max(st.mapZoom, 1.5); st.mapPan = [c[0] - 200, c[1] - 130]; U.announce('Map centered on courier'); },
    pdf: (el) => { const f = M.findOrder(el.dataset.id); if (f) pdf(f.order); },
    print: () => window.print(),
    'email-copy': (el) => {
      const f = M.findOrder(el.dataset.id); if (!f) return;
      const entry = U.openDialog({ title: 'Email a copy', size: 'sm', body: `<div id="em-body"><div class="field"><label for="em-to">Send to</label><input id="em-to" type="email" value="${attr(f.order.contact.email)}"></div><p class="small muted">Simulated — this prototype doesn’t send email.</p><button class="btn btn-primary btn-block" id="em-send">Send simulated copy</button></div>` });
      entry.dlg.querySelector('#em-send').addEventListener('click', () => {
        const to = entry.dlg.querySelector('#em-to').value.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(to)) { U.toast('Enter a valid email', 'err'); return; }
        entry.dlg.querySelector('#em-body').innerHTML = `<div class="empty compact"><div class="empty-ico">${icon('check')}</div><h2>Copy “sent”</h2><p>Simulated email of invoice ${esc(f.order.invoice.id)} (rev ${f.order.invoice.revision}) to ${esc(to)}. No email was actually sent.</p><button class="btn btn-primary" data-dlg-close>Done</button></div>`;
        U.announce('Simulated email confirmation shown'); entry.dlg.querySelector('[data-dlg-close].btn').focus();
      });
    },
    'offer-save': (el) => { const j = M.J(); const i = j.savedOffers.indexOf(el.dataset.id); if (i > -1) j.savedOffers.splice(i, 1); else j.savedOffers.push(el.dataset.id); M.commit('journey'); U.toast(i > -1 ? 'Offer unsaved' : 'Offer saved', 'info'); },
    'offer-bundle': (el) => {
      if (M.S.shared.groupCheckout) return U.toast('Finish or reopen the group checkout first.', 'err');
      const o = M.OFFER[el.dataset.id]; const lines = M.S.shared.cart.lines; const store = M.curStore(), mode = M.S.shared.mode;
      const count = (cat) => lines.filter(l => M.PROD[l.productId].cat === cat).reduce((s, l) => s + l.qty, 0);
      const added = [];
      const addP = (id) => { const p = M.PROD[id]; if (!M.productIssue(p, store, mode)) { M.addToCart(id, M.defaultConfig(p), 1); added.push(p.name); } };
      if (o.kind === 'twoPizza') for (let i = count('pizzas'); i < 2; i++) addP('p-one');
      if (o.kind === 'pizzaDessert') { if (!count('pizzas')) addP('p-one'); if (!count('desserts')) addP('x-nonamecake'); }
      if (added.length) U.toast(`Added ${added.join(' + ')}`, 'ok');
      offerToCart(o.id);
    },
    claim: (el) => { const r = M.claim(el.dataset.kind); U.toast(r.ok ? 'Bonus points added!' : r.reason, r.ok ? 'ok' : 'err'); },
    topup: (el) => {
      const amt = Number(el.dataset.amt);
      const entry = U.openDialog({ title: `Top up ${money(amt)}`, size: 'sm', body: `<p class="small muted">Choose a simulated payment method. No real charge is made.</p><div class="journey-opts">${[['card', 'Card · Visa •••• 4242 (sample)', 'card'], ['Apple Pay', 'Apple Pay', 'phone'], ['Google Pay', 'Google Pay', 'phone']].map(([m, l, ic]) => `<button class="journey-opt" data-topup-m="${m}">${icon(ic)}<span><strong>${l}</strong></span></button>`).join('')}</div>` });
      entry.dlg.addEventListener('click', (e) => { const b = e.target.closest('[data-topup-m]'); if (!b) return; M.topUp(amt, b.dataset.topupM); U.closeDialog(entry); U.toast(`${money(amt)} added to your wallet`); });
    },
    'reset-demo': () => {
      const entry = U.openDialog({ title: 'Reset demo data?', size: 'sm', body: '<p>This clears carts, orders, groups, addresses and rewards activity stored by this prototype in this browser, and restores the sample member.</p>', footer: '<button class="btn btn-ghost" data-dlg-close>Cancel</button><button class="btn btn-primary" id="do-reset">Reset</button>' });
      entry.dlg.querySelector('#do-reset').addEventListener('click', () => { M.resetDemo(); location.hash = '#/'; location.reload(); });
    },
    'enroll-cancel': () => { st.joinDraft = null; st.fieldErrors = {}; U.toast('Enrollment canceled — nothing was saved', 'info'); go('#/account'); },
    'addr-select': (el) => { M.J().selectedAddressId = el.dataset.id; M.commit('journey'); U.announce('Address selected'); },
    'addr-edit': (el) => { st.addrEdit = el.dataset.id; st.fieldErrors = {}; setTimeout(() => { const i = document.getElementById('a-label'); if (i) i.focus(); }, 0); },
    'addr-cancel': () => { st.addrEdit = null; },
    'addr-remove': (el) => { const j = M.J(); j.addresses = j.addresses.filter(a => a.id !== el.dataset.id); if (j.selectedAddressId === el.dataset.id) j.selectedAddressId = j.addresses[0] ? j.addresses[0].id : null; M.commit('journey'); U.toast('Address removed', 'info'); },
    'saved-remove': (el) => { const j = M.J(); const sp = j.savedPizzas.find(s => s.id === el.dataset.id); j.savedPizzas = j.savedPizzas.filter(s => s.id !== el.dataset.id); M.commit('journey'); if (sp) U.toast(`Removed “${sp.name}”`, 'info'); },
    // groups
    'g-qty': (el) => { const { g, p, l } = groupItem(el); if (!l || !guardGroupEdit(g)) return; l.qty = Math.max(0, Math.min(20, l.qty + Number(el.dataset.d))); if (!l.qty) p.items = p.items.filter(x => x !== l); p.ready = false; M.commit('groups'); },
    'g-remove-item': (el) => { const { g, p, l } = groupItem(el); if (!l || !guardGroupEdit(g)) return; p.items = p.items.filter(x => x !== l); p.ready = false; M.commit('groups'); U.toast('Item removed', 'info'); },
    'g-note': (el) => {
      const { g, l } = groupItem(el); if (!l || !guardGroupEdit(g)) return;
      const entry = U.openDialog({ title: 'Item note', size: 'sm', body: `<form id="gn-form"><div class="field"><label for="gn">Note for ${esc(M.PROD[l.productId].name)}</label><input id="gn" maxlength="80" value="${attr(l.note || '')}" autofocus></div><button class="btn btn-primary btn-block" type="submit">Save note</button></form>` });
      entry.dlg.querySelector('#gn-form').addEventListener('submit', (e) => { e.preventDefault(); l.note = entry.dlg.querySelector('#gn').value.trim(); M.commit('groups'); U.closeDialog(entry); U.toast('Note saved'); });
    },
    'g-ready': (el) => { const { g, p } = groupItem(el); if (!p || !guardGroupEdit(g)) return; if (!p.ready && !p.items.length) return U.toast('Add food before marking ready.', 'err'); if (!p.ready && g.budget && M.participantSubtotal(g, p) > g.budget) return U.toast('Over budget — remove something first.', 'err'); p.ready = !p.ready; M.commit('groups'); U.toast(p.ready ? `${p.name} is ready` : `${p.name}’s picks reopened`, 'info'); },
    'g-remove-p': (el) => { const { g, p } = groupItem(el); if (!p || g.status !== 'open') return; g.participants = g.participants.filter(x => x !== p); M.commit('groups'); U.toast(`${p.name} and their items were removed`, 'info'); },
    'g-window': (el) => { const url = `${location.pathname}${location.search}#/group/${el.dataset.g}?p=${el.dataset.p}&view=participant`; const w = window.open(url, '_blank', 'noopener=no,width=480,height=860'); if (!w) U.toast('Pop-up blocked — copy the link instead.', 'err'); },
    'g-copy': (el) => { const url = `${location.origin}${location.pathname}${location.search}#/group/${el.dataset.g}?p=${el.dataset.p}&view=participant`; (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(() => U.toast('Participant link copied (works in this browser only)')).catch(() => U.openDialog({ title: 'Participant link', size: 'sm', body: `<label for="pl" class="small">Copy this link</label><input id="pl" value="${attr(url)}" readonly>` })); },
    'g-checkout': (el) => { const r = M.startGroupCheckout(el.dataset.g); if (!r.ok) { U.toast(r.issues[0], 'err'); return; } U.toast('Group locked — your personal cart is parked', 'info'); go('#/checkout'); },
    'g-reopen': (el) => { if (M.reopenGroup(el.dataset.g)) U.toast('Group reopened — your personal cart is back', 'info'); },
    'g-extend': (el) => { const g = M.getGroup(el.dataset.g); g.deadline = Math.max(g.deadline, Date.now()) + 15 * 60000; M.commit('groups'); U.toast('Deadline extended by 15 minutes'); },
    'g-cancel': (el) => {
      const entry = U.openDialog({ title: 'Cancel this group?', size: 'sm', body: '<p>Everyone’s selections will be discarded. This can’t be undone.</p>', footer: '<button class="btn btn-ghost" data-dlg-close>Keep group</button><button class="btn btn-primary" id="gc-yes">Cancel group</button>' });
      entry.dlg.querySelector('#gc-yes').addEventListener('click', () => { M.cancelGroup(el.dataset.g); U.closeDialog(entry); U.toast('Group canceled', 'info'); render(); });
    }
  };
  const NO_RENDER = new Set(['pref-toggle', 'nav-back', 'sign-out', 'cancel-order', 'scan-receipt', 'login-sample', 'open-setup', 'journey-menu', 'amend-open', 'chat-open', 'pdf', 'print', 'email-copy', 'topup', 'reset-demo', 'g-note', 'g-window', 'g-copy', 'g-cancel']);

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]'); if (!el) return;
    if (el.tagName === 'SELECT') return;
    if (el.getAttribute('aria-disabled') === 'true' && !el.dataset.limit) { e.preventDefault(); if (el.dataset.act === 'b-submit' || el.dataset.act === 'g-checkout') { const reason = document.querySelector('.b-err, .issues li'); U.toast(reason ? reason.textContent.trim() : 'Not available', 'err'); } return; }
    const act = el.dataset.act;
    if (el.tagName === 'A' && el.getAttribute('href')) return; // links navigate
    if (act.startsWith('setup-')) { if (BLD.setupAction(act, el, app)) { render(); } return; }
    if (/^(b|s|k|c)-/.test(act) && BLD.builderAction(act, el, app)) return;
    if (act.startsWith('a-') && BLD.amendAction(act, el, app)) return;
    const fn = ACT[act]; if (!fn) return;
    if (el.tagName !== 'INPUT') e.preventDefault();
    fn(el, e);
    if (!NO_RENDER.has(act)) render();
  });
  document.addEventListener('change', (e) => {
    const el = e.target;
    if (el.matches('select[data-act="co-addr"]')) {
      const j = M.J(); const d = M.S.shared.draft;
      if (el.value) { const a = j.addresses.find(x => x.id === el.value); j.selectedAddressId = a.id; d.address = a.line; d.instructions = a.instructions; M.commit('journey'); }
      else { d.address = ''; d.instructions = ''; }
      M.commit('shared'); render(); const i = document.getElementById('co-address'); if (i && !el.value) i.focus();
    }
    if (el.matches('select[data-act="g-act-as"]')) { st.actingAs[el.dataset.g] = el.value; render(); }
  });
  let draftTimer = null;
  document.addEventListener('input', (e) => {
    const el = e.target;
    if (el.dataset.draft) { M.S.shared.draft[el.dataset.draft] = el.value; clearTimeout(draftTimer); draftTimer = setTimeout(() => M.persist('shared'), 250); return; }
    const k = el.dataset.input; if (!k) return;
    if (k === 'menu-search') { st.menu.q = el.value; render(); }
    if (k === 'tip-custom') { const v = Math.max(0, Math.round(parseFloat(el.value || '0') * 100)); M.S.shared.tip = { kind: 'custom', value: 0, custom: isNaN(v) ? 0 : v }; M.persist('shared'); clearTimeout(draftTimer); draftTimer = setTimeout(render, 500); }
    if (k === 'b-note') { const B = BLD.getB(); if (B) B.note = el.value; }
    if (k === 'otp') { const v = el.value.replace(/\D/g, '').slice(0, M.CONFIG.otp.length); if (v !== el.value) el.value = v; if (v.length === M.CONFIG.otp.length) { const f = el.closest('form'); if (f) f.requestSubmit(); } }
  });

  /* ---------------- Forms ---------------- */
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function focusFirstError() { setTimeout(() => { const el = main.querySelector('[aria-invalid="true"]') || document.getElementById('co-blockers'); if (el) el.focus(); }, 0); }
  const FORMS = {
    promo: (f) => {
      const code = f.code.value.trim().toUpperCase(); st.promoCode = '';
      if (!code) { st.promoMsg = { kind: 'err', text: 'Enter a promo code.' }; return; }
      const j = M.J(); const o = window.MOD_DATA.OFFERS.find(x => x.code === code);
      if (!o) { st.promoMsg = { kind: 'err', text: `“${code}” isn’t a valid code.` }; U.announce(st.promoMsg.text, true); return; }
      if (o.audience === 'member' && !(M.isMember() && j.assignedOffers.includes(o.id))) { st.promoMsg = { kind: 'err', text: `${code} is assigned to a member account.` }; U.announce(st.promoMsg.text, true); return; }
      if (!offerToCart(o.id)) st.promoCode = code;
    },
    checkout: (f) => {
      const d = M.S.shared.draft;
      const vals = { name: f.name.value, email: f.email.value, phone: f.phone.value, address: f.address ? f.address.value : '', instructions: f.instructions ? f.instructions.value : '', allergens: [...f.querySelectorAll('input[name=allergens]:checked')].map(x => x.value), kitchenNote: f.kitchenNote.value, vehicle: f.vehicle ? f.vehicle.value : '' };
      Object.assign(d, vals); if (vals.vehicle) M.J().profile.vehicle = vals.vehicle.trim(); M.persist();
      const res = M.validateCheckout(vals, { expectedTotal: st.expectedTotal });
      st.fieldErrors = res.fe; st.blockers = res.blockers;
      if (Object.keys(res.fe).length || res.blockers.length) {
        render(); focusFirstError();
        U.announce(`${Object.keys(res.fe).length + res.blockers.length} issue${Object.keys(res.fe).length + res.blockers.length > 1 ? 's' : ''} to fix before placing your order`, true);
        return;
      }
      const btn = document.getElementById('place-btn');
      btn.setAttribute('aria-disabled', 'true'); btn.innerHTML = `<span class="spinner" aria-hidden="true"></span>${M.S.shared.pay.method === 'apple' ? 'Confirming with Apple Pay…' : M.S.shared.pay.method === 'google' ? 'Confirming with Google Pay…' : 'Processing payment…'}`;
      U.announce('Processing simulated payment');
      setTimeout(() => {
        const again = M.validateCheckout(vals, { expectedTotal: st.expectedTotal });
        if (again.blockers.length || Object.keys(again.fe).length) { st.blockers = again.blockers; st.fieldErrors = again.fe; render(); focusFirstError(); return; }
        const o = M.placeOrder(vals);
        st.blockers = []; st.fieldErrors = {};
        U.toast(`Order ${o.id} placed!`, 'ok');
        go(`#/order/${o.id}`);
      }, 1200);
      return 'async';
    },
    'receipt-claim': (f) => { const r = M.claim('receipt', f.code.value); U.toast(r.ok ? `+${M.CONFIG.receiptClaim.points} points added` : r.reason, r.ok ? 'ok' : 'err'); },
    giftcard: (f) => { const r = M.claim('giftcard', f.code.value); U.toast(r.ok ? `${money(M.CONFIG.sampleGiftCard.amount)} added to your wallet` : r.reason, r.ok ? 'ok' : 'err'); },
    profile: (f) => {
      const fe = {}; const name = f.name.value.trim(), email = f.email.value.trim(), phone = f.phone.value.trim();
      if (M.isMember() && !name) fe['p-name'] = 'Enter your name.';
      if (email && !EMAIL.test(email)) fe['p-email'] = 'Enter a valid email address.';
      if (phone) { const n = phone.replace(/\D/g, '').length; if (n < 10 || n > 15) fe['p-phone'] = 'Phone must contain 10–15 digits.'; }
      st.fieldErrors = fe; if (Object.keys(fe).length) { focusFirstError(); return; }
      const p = M.J().profile; Object.assign(p, { name, email, phone }); if (f.birthday) p.birthday = f.birthday.value; if (f.marketing) p.marketing = f.marketing.checked;
      st.profEdit = null; M.commit('journey'); U.toast('Personal information saved');
    },
    enroll: (f) => {
      const fe = {}; const name = f.name.value.trim(), email = f.email.value.trim();
      st.joinDraft = { name, email, marketing: f.marketing.checked };
      if (name.length < 2) fe['e-name'] = 'Enter your full name.';
      if (!EMAIL.test(email)) fe['e-email'] = 'Enter a valid email address.';
      st.fieldErrors = fe; if (Object.keys(fe).length) { focusFirstError(); U.announce('Please fix the highlighted fields', true); return; }
      const j = M.J(); j.enrolled = true; j.enrolledAt = Date.now(); j.profile.name = name; j.profile.email = email; j.profile.marketing = f.marketing.checked;
      M.commit('journey'); st.joinDraft = null; U.toast('Welcome to MOD Rewards! Enrollment saved.'); go('#/pass');
    },
    address: (f) => {
      const fe = {}; const label = f.label.value.trim(), line = f.line.value.trim();
      if (!label) fe['a-label'] = 'Give this address a name.'; if (line.length < 6) fe['a-line'] = 'Enter a full address.';
      st.fieldErrors = fe; if (Object.keys(fe).length) { focusFirstError(); return; }
      const j = M.J();
      if (st.addrEdit) { const a = j.addresses.find(x => x.id === st.addrEdit); Object.assign(a, { label, line, instructions: f.instructions.value.trim() }); st.addrEdit = null; U.toast('Address updated'); }
      else { const a = { id: M.uid('a'), label, line, instructions: f.instructions.value.trim() }; j.addresses.push(a); if (!j.selectedAddressId) j.selectedAddressId = a.id; U.toast('Address added'); f.reset(); }
      M.commit('journey');
    },
    'group-create': (f) => {
      const name = f.name.value.trim(), host = f.host.value.trim();
      if (!name || !host) { U.toast('Enter a group name and your name.', 'err'); (name ? f.host : f.name).focus(); return; }
      if (M.S.shared.groupCheckout) { U.toast('Finish the current group checkout first.', 'err'); return; }
      const g = M.createGroup({ name, hostName: host, budget: Number(f.budget.value), deadlineMin: Number(f.deadline.value) });
      U.toast('Group created — add people and share links'); go(`#/group/${g.id}`);
    },
    'g-add-p': (f) => { const g = M.getGroup(f.dataset.g); const name = f.name.value.trim(); if (!name || !g || g.status !== 'open') return; g.participants.push({ id: M.uid('p'), name, ready: false, items: [] }); M.commit('groups'); U.toast(`${name} added`); },
    support: (f) => {
      const type = f.type.value, msg = f.message.value.trim();
      if (msg.length < 5) { U.toast('Add a few words so we can help.', 'err'); f.message.setAttribute('aria-invalid', 'true'); f.message.focus(); return; }
      const r = M.addSupport(f.dataset.id, type, msg);
      U.toast(type === 'refund' ? `Refund request ${r.id} sent for review` : `Request ${r.id} sent`);
    },
    feedback: (f) => { const r = f.querySelector('input[name=rating]:checked'); if (!r) { U.toast('Choose a star rating.', 'err'); return; } M.setFeedback(f.dataset.id, Number(r.value), f.comment.value.trim()); U.toast('Thanks for the feedback!'); },
    'setup-addr': (f) => { BLD.setupSubmitAddress(f); return 'async'; },
    'food-profile': (f) => {
      const p = M.J().profile;
      p.allergens = [...f.querySelectorAll('input[name=allergens]:checked')].map(x => x.value);
      let diets = [...f.querySelectorAll('input[name=diets]:checked')].map(x => x.value);
      if (diets.includes('vegan')) diets = diets.filter(x => x !== 'vegetarian' && x !== 'dairy-free').concat([]);
      p.diets = diets; p.allergyNote = f.allergyNote.value.trim(); p.foodReviewed = true;
      st.profEdit = null; st.menu.touched = false; st.menu.auto = false; if (st.menu.diet !== 'all' && !diets.length) st.menu.diet = 'all';
      M.commit('journey'); U.toast('Food preferences saved');
    },
    'store-search': (f) => { BLD.storeSearch(f); return 'async'; },
    'otp-request': (f) => {
      const L = st.login || (st.login = { channel: 'email' }); L.value = f.id.value.trim();
      const r = M.requestOtp(L.channel, L.value);
      if (!r.ok) { L.error = r.reason; render(); focusFirstError(); U.announce(r.reason, true); return 'async'; }
      L.step = 'code'; L.error = ''; U.announce(`Code sent to ${L.value}`); render(); setTimeout(() => { const i = document.getElementById('otp-in'); if (i) i.focus(); }, 0); return 'async';
    },
    'otp-verify': (f) => {
      const L = st.login; const btn = document.getElementById('otp-submit');
      if ((f.code.value || '').replace(/\D/g, '').length !== M.CONFIG.otp.length) { L.error = `Enter all ${M.CONFIG.otp.length} digits.`; render(); focusFirstError(); return 'async'; }
      btn.setAttribute('aria-disabled', 'true'); btn.innerHTML = '<span class="spinner" aria-hidden="true"></span>Verifying…';
      setTimeout(() => {
        const r = M.verifyOtp(f.code.value);
        if (!r.ok) { L.error = r.reason; if (r.expired || r.locked) { M.S.shared.otp = null; M.commit('shared'); L.step = 'enter'; } render(); focusFirstError(); U.announce(r.reason, true); return; }
        const join = parseHash().q.join; st.login = null;
        if (!r.known || join) {
          const m = M.J(); st.joinDraft = { name: m.enrolled ? m.profile.name : '', email: r.ident.channel === 'email' ? r.ident.value : '', marketing: false };
          U.toast('Code verified — finish your profile to join MOD Rewards'); go('#/join');
        } else { U.toast(`Welcome back, ${M.J().profile.name.split(' ')[0]}!`); go('#/'); }
      }, 700);
      return 'async';
    },
    'topup-custom': (f) => {
      const v = Math.round(parseFloat(f.amount.value) * 100); const C = M.CONFIG;
      if (!v || isNaN(v) || v < C.topUpMin || v > C.topUpMax) { f.amount.setAttribute('aria-invalid', 'true'); U.toast(`Enter an amount between ${money(C.topUpMin)} and ${money(C.topUpMax)}.`, 'err'); f.amount.focus(); return 'async'; }
      ACT.topup({ dataset: { amt: String(v) } }); f.reset(); return 'async';
    }
  };
  document.addEventListener('submit', (e) => {
    const f = e.target; const k = f.dataset.form; if (!k || !FORMS[k]) return;
    e.preventDefault();
    const r = FORMS[k](f);
    if (r !== 'async') render();
  });

  /* ---------------- Timers & sync ---------------- */
  function liveRoute() { const a = (parseHash().parts[0]) || 'home'; return ['order', 'orders', 'home', 'group', 'support', 'rewards'].includes(a); }
  function typing() { const ae = document.activeElement; return ae && main.contains(ae) && /INPUT|TEXTAREA|SELECT/.test(ae.tagName); }
  function safeRender() { if (typing() || U.topDialog()) { pendingRender = true; return; } render(); }
  setInterval(() => { const changed = M.tick(); if (changed || liveRoute()) safeRender(); }, 4000);
  setInterval(updateCountdowns, 1000);
  setInterval(() => { if (!participantInfo()) { try { localStorage.setItem(BEAT, String(Date.now())); } catch (e) { /* ignore */ } } }, 3000);
  if (!participantInfo()) { try { localStorage.setItem(BEAT, String(Date.now())); } catch (e) { /* ignore */ } }
  document.addEventListener('focusout', () => { setTimeout(() => { if (pendingRender && !typing() && !U.topDialog()) render(); }, 50); });
  window.addEventListener('storage', (e) => {
    if (!e.key || !e.key.startsWith(M.PREFIX)) return;
    const k = e.key.slice(M.PREFIX.length);
    if (k === 'hostbeat') return;
    M.reloadFromStorage(k);
    if (BLD.isSetupOpen()) BLD.refreshSetup();
    safeRender();
  });
  window.__navCount = 1;
  window.addEventListener('hashchange', () => {
    window.__navCount++;
    const r = parseHash();
    if (r.q.view === 'participant' && r.parts[0] === 'group') setParticipant({ g: r.parts[1], p: r.q.p });
    changedPath = !lastRoute || lastRoute.path !== r.path;
    const d = U.topDialog(); if (d) U.closeDialog(d);
    render();
  });
  window.addEventListener('beforeprint', () => document.body.classList.add('printing'));
  window.addEventListener('afterprint', () => document.body.classList.remove('printing'));

  const app = { render, go, parseHash, participantInfo };
  window.APP = app;
  M.S.listeners.add(() => { if (BLD.isSetupOpen()) BLD.refreshSetup(); });

  // boot
  (function boot() {
    const r = parseHash();
    if (r.q.view === 'participant' && r.parts[0] === 'group') setParticipant({ g: r.parts[1], p: r.q.p });
    M.tick();
    if (!M.storageOK()) setTimeout(() => U.toast('Browser storage is unavailable — changes will last only for this visit.', 'info', { ms: 6000 }), 600);
    render();
  })();
})();
