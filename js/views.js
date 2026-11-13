/* MOD Customer Prototype — screens. Each view returns an HTML string; app.js binds behaviour. */
(function () {
  'use strict';
  const M = window.MOD, U = window.UI;
  const { esc, attr, icon, dietBadge } = U;
  const { money } = M;
  const V = {};
  const st = { menu: { diet: 'all', q: '' }, promoOpen: false, promoMsg: null, ordersTab: 'progress', offersTab: 'all', mapZoom: 1, mapPan: [0, 0], fieldErrors: {}, blockers: [], actingAs: {} };
  V.st = st;

  /* ---------------- Fragments ---------------- */
  const h1 = (t) => `<h1 tabindex="-1">${t}</h1>`;
  function pageHead(title, sub, back) {
    return `<header class="page-head">${back ? `<a class="back-link" href="${attr(back)}">${icon('back')}<span>Back</span></a>` : ''}${h1(title)}${sub ? `<p class="lede">${sub}</p>` : ''}</header>`;
  }
  function empty(ic, title, text, cta = '') {
    return `<div class="empty"><div class="empty-ico">${icon(ic)}</div><h2>${title}</h2><p>${text}</p>${cta}</div>`;
  }
  function note(text, kind = 'info') { return `<div class="note note-${kind}" role="${kind === 'err' ? 'alert' : 'note'}">${icon(kind === 'err' || kind === 'warn' ? 'alert' : 'info')}<div>${text}</div></div>`; }
  const pill = (t, cls = '') => `<span class="pill ${cls}">${t}</span>`;
  V.fragments = { pageHead, empty, note, pill };

  function contextSummary() {
    const sh = M.S.shared, store = M.curStore(), status = M.storeStatus(store, sh.mode);
    const j = M.J(); const addr = j.addresses.find(a => a.id === j.selectedAddressId);
    const time = sh.schedule.type === 'later' ? M.scheduleText(sh.schedule, store) : (status.asap ? `ASAP · ~${M.leadMin(store, sh.mode)} min` : 'ASAP unavailable');
    return { sh, store, status, addr, time };
  }
  V.contextSummary = contextSummary;

  function orderContextCard(compact) {
    const { sh, store, status, addr, time } = contextSummary();
    const modeBtn = (m, label, ic) => {
      const supported = store.modes.includes(m);
      return `<button class="seg-btn ${sh.mode === m ? 'on' : ''}" data-act="mode" data-mode="${m}" aria-pressed="${sh.mode === m}" ${supported ? '' : 'disabled aria-disabled="true"'} title="${supported ? '' : 'Not offered at this store'}">${icon(ic)}${label}</button>`;
    };
    return `<section class="ctx-card ${compact ? 'compact' : ''}" aria-label="Your order setup">
      <div class="seg seg-mode" role="group" aria-label="Fulfillment">${modeBtn('pickup', 'Pickup', 'bag')}${modeBtn('delivery', 'Delivery', 'truck')}</div>
      <button class="ctx-cell" data-act="open-setup" data-tab="store">${icon('store')}<span><small>${sh.mode === 'delivery' ? 'Delivering from' : 'Pickup at'}</small><strong>${esc(store.name)}, ${esc(store.city.split(',')[0])}</strong>${!status.ok ? `<em class="warn">${esc(status.reason)}</em>` : ''}</span>${icon('chevR', 'chev')}</button>
      ${sh.mode === 'delivery' ? `<button class="ctx-cell" data-act="open-setup" data-tab="address">${icon('pin')}<span><small>Deliver to</small><strong>${addr ? esc(addr.label + ' · ' + addr.line) : 'Add a delivery address'}</strong></span>${icon('chevR', 'chev')}</button>` : ''}
      <button class="ctx-cell" data-act="open-setup" data-tab="time">${icon('clock')}<span><small>${sh.schedule.type === 'later' ? 'Scheduled for' : 'When'}</small><strong>${esc(time)}</strong>${!status.asap && sh.schedule.type !== 'later' && status.ok ? '<em class="warn">Schedule for later</em>' : ''}</span>${icon('chevR', 'chev')}</button>
    </section>`;
  }
  V.orderContextCard = orderContextCard;

  function groupBanner() {
    const t = st.groupTarget; if (!t) return '';
    const g = M.getGroup(t.g); if (!g) return '';
    const p = g.participants.find(x => x.id === t.p); if (!p) return '';
    return `<div class="group-banner" role="status">${icon('users')}<span>Adding food for <strong>${esc(p.name)}</strong> in <strong>${esc(g.name)}</strong></span><a class="btn btn-sm btn-light" href="#/group/${g.id}">Back to group</a></div>`;
  }
  V.groupBanner = groupBanner;
  const groupQ = () => st.groupTarget ? `?group=${st.groupTarget.g}&p=${st.groupTarget.p}` : '';

  function productCard(p) {
    const sh = M.S.shared, store = M.curStore();
    const issue = M.productIssue(p, store, sh.mode);
    const fav = M.J().favorites.includes(p.id);
    const price = M.basePrice(p, store);
    const href = `#/item/${p.id}${groupQ()}`;
    const action = issue ? `<span class="btn btn-sm btn-disabled" aria-disabled="true">${esc(issue)}</span>`
      : p.builder ? `<a class="btn btn-sm btn-primary" href="${href}">Customize</a>`
        : `<button class="btn btn-sm btn-primary" data-act="add-simple" data-id="${p.id}" aria-label="Add ${attr(p.name)} to ${st.groupTarget ? 'group order' : 'cart'}">${icon('plus')}Add</button>`;
    return `<article class="pcard ${issue ? 'is-unavail' : ''}">
      <a class="pcard-art" href="${href}" tabindex="-1" aria-hidden="true">${U.artFor(p)}${p.tag ? `<span class="pcard-tag">${esc(p.tag)}</span>` : ''}</a>
      <button class="fav-btn ${fav ? 'on' : ''}" data-act="fav" data-id="${p.id}" aria-pressed="${fav}" aria-label="${fav ? 'Remove' : 'Save'} ${attr(p.name)} ${fav ? 'from' : 'to'} favorites">${icon('heart')}</button>
      <div class="pcard-body">
        <h3><a href="${href}">${esc(p.name)}</a></h3>
        <p class="pcard-desc">${esc(p.desc)}</p>
        <div class="pcard-meta">${dietBadge(p.diet)}<span class="cal">${p.nutrition.cal} cal</span>${p.pickupOnly ? pill('Pickup only', 'pill-warn') : ''}</div>
        <div class="pcard-foot"><span class="price">${price === 0 ? 'Free' : money(price)}</span>${action}</div>
      </div></article>`;
  }

  function stageBadge(o) {
    const s = M.stageOf(o);
    const cls = s.id === 'canceled' ? 'pill-muted' : s.done ? 'pill-ok' : s.id === 'scheduled' ? 'pill-info' : 'pill-live';
    return pill(esc(s.label), cls);
  }
  V.stageBadge = stageBadge;

  function orderCard(o, opts = {}) {
    const s = M.stageOf(o); const j = M.J();
    const items = o.lines.map(l => `${l.qty}× ${l.name}`).join(', ');
    return `<article class="ocard">
      <div class="ocard-top"><div><h3>${esc(o.id)}${o.group ? ` <span class="pill pill-info">${icon('users')}Group</span>` : ''}</h3>
        <p class="muted">${M.fmtDate(o.createdAt, o.tz)} · ${esc(o.storeName)} · ${o.mode === 'delivery' ? 'Delivery' : 'Pickup'}${o.schedule.type === 'later' ? ` · Scheduled ${esc(M.fmtTime(o.schedule.slot, o.tz, { date: true }))}` : ''}</p></div>${stageBadge(o)}</div>
      <p class="ocard-items">${esc(items)}</p>
      <div class="ocard-foot"><strong>${money(o.totals.total)}</strong>
        <div class="btn-row">
          ${!s.done || opts.full ? `<a class="btn btn-sm ${s.done ? 'btn-outline' : 'btn-primary'}" href="#/order/${o.id}">${s.done ? 'Details' : 'Track'}</a>` : `<a class="btn btn-sm btn-outline" href="#/order/${o.id}">Details</a>`}
          <a class="btn btn-sm btn-ghost" href="#/receipt/${o.id}">${icon('receipt')}Receipt</a>
          <a class="btn btn-sm btn-ghost" href="#/support/${o.id}">${icon('help')}Help</a>
          <button class="btn btn-sm btn-outline" data-act="reorder" data-id="${o.id}">${icon('refresh')}Reorder</button>
          ${j.goTo === o.id ? `<span class="pill pill-ok">${icon('star')}Go-to order</span>` : (!o.canceled ? `<button class="btn btn-sm btn-ghost" data-act="set-goto" data-id="${o.id}">${icon('star')}Make go-to</button>` : '')}
        </div></div></article>`;
  }

  function totalsRows(t, opts = {}) {
    const row = (l, v, cls = '') => `<div class="trow ${cls}"><span>${l}</span><span>${v}</span></div>`;
    let h = row('Subtotal', money(t.subtotal));
    if (t.discount) h += row(`Savings${t.discountLabel ? ` · ${esc(t.discountLabel)}` : ''}`, '−' + money(t.discount), 'save');
    if (opts.mode === 'delivery' || t.deliveryFee || t.baseDelivery) h += row('Delivery fee', t.baseDelivery && !t.deliveryFee ? `<s>${money(t.baseDelivery)}</s> Free` : money(t.deliveryFee));
    h += row('Estimated tax', money(t.tax));
    if (opts.tip !== false) h += row('Tip', money(t.tip != null ? t.tip : t.tipAmt));
    h += row('<strong>Total</strong>', `<strong>${money(t.total)}</strong>`, 'total');
    return h;
  }
  V.totalsRows = totalsRows;

  /* ---------------- HOME ---------------- */
  V.home = function () {
    const j = M.J(), member = M.isMember(), sh = M.S.shared;
    const active = j.orders.filter(o => !M.stageOf(o).done);
    const goTo = j.orders.find(o => o.id === j.goTo && !o.canceled);
    const recent = j.orders.filter(o => !o.canceled && o.id !== j.goTo).slice(0, 2);
    const feat = M.OFFER['o-sweet'];
    const tier = M.tierOf(j), next = M.nextTier(j);
    const toPizza = Math.min(100, Math.round(j.points / M.CONFIG.pizzaRewardCost * 100));
    const heroPizza = U.pizzaSVG(M.defaultPizzaConfig(M.PROD['p-maddog']), { cls: 'hero-pizza' });

    const goCard = (o, label) => `<article class="go-card"><div class="go-art">${U.artFor(M.PROD[o.lines[0].productId] || M.PROD['p-cyo'], o.lines[0].config)}</div>
      <div><span class="eyebrow">${label}</span><h3>${esc(o.lines.map(l => l.name).slice(0, 3).join(' + '))}${o.lines.length > 3 ? '…' : ''}</h3>
      <p class="muted">${o.lines.reduce((s, l) => s + l.qty, 0)} items · ${money(o.totals.subtotal)} at the time · ${M.fmtDate(o.createdAt, o.tz)}</p>
      <div class="btn-row"><button class="btn btn-sm btn-primary" data-act="reorder" data-id="${o.id}">${icon('refresh')}Reorder</button><a class="btn btn-sm btn-ghost" href="#/order/${o.id}">Details</a></div></div></article>`;

    return `<section class="hero">
        <div class="hero-copy">
          <span class="eyebrow light">${icon('flame')}Fired in minutes · toppings included</span>
          ${h1('Your pizza.<br><span>Your way.</span>')}
          <p>Pile on what you love, split it down the middle, or grab a go-to in two taps. Every pizza is made on demand.</p>
          <div class="btn-row"><a class="btn btn-lg btn-white" href="#/menu">Start your order ${icon('chevR')}</a><a class="btn btn-lg btn-glass" href="#/item/p-cyo">Build your own</a></div>
        </div>
        <div class="hero-art" aria-hidden="true">${heroPizza}<div class="hero-badge">${icon('sparkle')}<span>Half & half,<br>no surcharge</span></div></div>
      </section>
      ${orderContextCard()}
      ${active.length ? `<section class="active-strip" aria-label="Active orders">${active.slice(0, 2).map(o => { const s = M.stageOf(o); return `<a class="active-card" href="#/order/${o.id}"><span class="pulse" aria-hidden="true"></span><div><strong>${esc(s.label)}</strong><span>${esc(o.id)} · ${o.mode === 'delivery' ? 'Delivery' : 'Pickup'} · ETA ${esc(M.fmtTime(M.etaOf(o), o.tz))}</span></div><span class="active-cta">Track ${icon('chevR')}</span></a>`; }).join('')}</section>` : ''}
      <section class="sect"><div class="sect-head"><h2>What are you craving?</h2><a href="#/menu" class="link">Full menu ${icon('chevR')}</a></div>
        <div class="cat-row">${window.MOD_DATA.CATEGORIES.map(c => `<a class="cat-tile" href="#/menu?cat=${c.id}"><span class="cat-art">${U.catArt(c.id)}</span><span>${esc(c.name)}</span></a>`).join('')}</div></section>
      <div class="home-grid">
        <section class="sect"><div class="sect-head"><h2>Your go-to orders</h2><a href="#/orders" class="link">All orders ${icon('chevR')}</a></div>
          ${goTo || recent.length ? `<div class="go-list">${goTo ? goCard(goTo, 'Go-to order') : ''}${recent.map(o => goCard(o, 'Recent')).join('')}</div>`
            : empty('refresh', 'No orders yet', 'Your recent and go-to orders will appear here for one-tap reordering.', '<a class="btn btn-primary" href="#/menu">Browse the menu</a>')}
        </section>
        <aside class="home-side">
          ${member ? `<section class="rewards-card" aria-label="Rewards summary">
              <div class="rc-top"><div><span class="eyebrow light">MOD Rewards · ${esc(tier.name)}</span><div class="rc-points"><strong>${j.points.toLocaleString()}</strong> pts</div>
              <span class="rc-sub">${M.pendingPoints(j) ? `+${M.pendingPoints(j)} pending · ` : ''}${j.enrolled ? 'Enrolled member' : 'Sample rewards profile'}</span></div><a class="icon-btn light" href="#/pass" aria-label="Open member pass">${icon('card')}</a></div>
              <div class="meter" role="progressbar" aria-label="Progress to a free pizza" aria-valuemin="0" aria-valuemax="${M.CONFIG.pizzaRewardCost}" aria-valuenow="${Math.min(j.points, M.CONFIG.pizzaRewardCost)}"><span style="width:${toPizza}%"></span></div>
              <p class="rc-goal">${j.points >= M.CONFIG.pizzaRewardCost ? 'You’ve unlocked a free pizza!' : `${(M.CONFIG.pizzaRewardCost - j.points).toLocaleString()} pts to a free pizza`}</p>
              ${next ? `<p class="rc-tier">${(next.min - j.lifetime).toLocaleString()} lifetime pts to ${esc(next.name)} (${next.mult}× earning)</p>` : '<p class="rc-tier">Top tier — 1.5× earning</p>'}
              <div class="btn-row"><a class="btn btn-sm btn-white" href="#/rewards">Redeem</a>${!j.enrolled ? '<a class="btn btn-sm btn-glass" href="#/join">Complete enrollment</a>' : '<a class="btn btn-sm btn-glass" href="#/wallet">Wallet</a>'}</div>
            </section>`
            : `<section class="rewards-card guest"><span class="eyebrow light">MOD Rewards</span><h2>Earn on every pizza</h2><p>${M.CONFIG.pointsPerDollar} points per $1, free pizza at ${M.CONFIG.pizzaRewardCost.toLocaleString()} points, member-only coupons and a digital wallet.</p>
              <div class="btn-row"><button class="btn btn-sm btn-white" data-act="journey" data-j="member" data-go="#/join">Join (sample)</button><button class="btn btn-sm btn-glass" data-act="journey" data-j="member">Try member view</button></div><p class="tiny light">Demo journey switch — not real sign-in.</p></section>`}
          <a class="offer-feature" href="#/offer/${feat.id}"><span class="eyebrow">${icon('tag')}Featured offer</span><strong>${esc(feat.title)}</strong><span>${esc(feat.blurb)}</span><code>${esc(feat.code)}</code></a>
          <div class="mini-links">
            <a href="#/favorites" class="mini-link">${icon('heart')}<span><strong>Saved pizzas & favorites</strong><small>${j.savedPizzas.length} saved · ${j.favorites.length} favorites</small></span>${icon('chevR')}</a>
            <a href="#/groups" class="mini-link">${icon('users')}<span><strong>Group order</strong><small>One host pays, everyone picks</small></span>${icon('chevR')}</a>
            <a href="#/offers" class="mini-link">${icon('tag')}<span><strong>All offers</strong><small>${window.MOD_DATA.OFFERS.filter(o => o.audience === 'public' || (member && j.assignedOffers.includes(o.id))).length} available</small></span>${icon('chevR')}</a>
          </div>
        </aside>
      </div>`;
  };

  /* ---------------- MENU ---------------- */
  V.menu = function (q) {
    const cats = window.MOD_DATA.CATEGORIES;
    const cat = q.cat && cats.some(c => c.id === q.cat) ? q.cat : 'all';
    const diet = st.menu.diet, term = st.menu.q.trim().toLowerCase();
    const match = (p) => {
      if (!M.isPublished(p)) return false;
      if (cat !== 'all' && p.cat !== cat) return false;
      if (diet === 'veg' && !(p.diet === 'veg' || p.diet === 'vegan')) return false;
      if (diet === 'nonveg' && p.diet !== 'nonveg') return false;
      if (diet === 'vegan' && p.diet !== 'vegan') return false;
      if (term) {
        const ings = p.recipe ? (p.recipe.items || p.recipe.toppings || []).map(id => M.ING[id] ? M.ING[id].name : '').join(' ') : '';
        if (!(p.name + ' ' + p.desc + ' ' + ings).toLowerCase().includes(term)) return false;
      }
      return true;
    };
    const list = window.MOD_DATA.PRODUCTS.filter(match);
    const tab = (id, name) => `<a class="tab ${cat === id ? 'on' : ''}" href="#/menu?cat=${id}${groupQ().replace('?', '&')}" ${cat === id ? 'aria-current="page"' : ''}>${esc(name)}</a>`;
    const dietBtn = (id, label) => `<button class="seg-btn ${diet === id ? 'on' : ''}" role="radio" aria-checked="${diet === id}" data-act="diet" data-diet="${id}">${id !== 'all' ? `<span class="diet-dot d-${id}" aria-hidden="true"></span>` : ''}${label}</button>`;
    const sections = (cat === 'all' ? cats : cats.filter(c => c.id === cat)).map(c => {
      const ps = list.filter(p => p.cat === c.id); if (!ps.length) return '';
      return `<section class="menu-sect" aria-labelledby="mc-${c.id}"><h2 id="mc-${c.id}">${esc(c.name)} <span class="count">${ps.length}</span></h2><div class="pgrid">${ps.map(productCard).join('')}</div></section>`;
    }).join('');
    return `${groupBanner()}
      <div class="menu-top">
        <div class="menu-title">${h1('Menu')}<p class="muted">${esc(M.curStore().name)} · prices for this store</p></div>
        <div class="search"><label for="menu-search" class="sr-only">Search the menu</label>${icon('search')}<input id="menu-search" type="search" placeholder="Search pizzas, toppings, drinks…" value="${attr(st.menu.q)}" data-input="menu-search" autocomplete="off">${st.menu.q ? `<button class="icon-btn sm" data-act="clear-search" aria-label="Clear search">${icon('x')}</button>` : ''}</div>
      </div>
      <div class="menu-bar">
        <nav class="tabs" aria-label="Menu categories">${tab('all', 'All')}${cats.map(c => tab(c.id, c.name)).join('')}</nav>
        <div class="seg seg-diet" role="radiogroup" aria-label="Dietary filter">${dietBtn('all', 'All')}${dietBtn('veg', 'Veg')}${dietBtn('nonveg', 'Non-veg')}${dietBtn('vegan', 'Vegan')}</div>
      </div>
      <p class="sr-only" role="status">${list.length} item${list.length === 1 ? '' : 's'} shown</p>
      ${sections || empty('search', 'Nothing matches those filters', `No items found${term ? ` for “${esc(st.menu.q)}”` : ''}${diet !== 'all' ? ` with the ${diet === 'nonveg' ? 'Non-veg' : diet === 'veg' ? 'Veg' : 'Vegan'} filter` : ''}${cat !== 'all' ? ` in ${esc(cats.find(c => c.id === cat).name)}` : ''}.`, '<button class="btn btn-primary" data-act="clear-filters">Clear filters</button>')}
      <p class="fine">${icon('info')} Dietary labels describe the standard recipe. Customizing can change suitability. All items are prepared in shared kitchen areas, so we can’t guarantee any item is free from allergens or animal products. Nutrition values are illustrative samples.</p>`;
  };

  /* ---------------- CART ---------------- */
  V.cart = function () {
    const sh = M.S.shared, j = M.J();
    const q = M.quote();
    const locked = !!sh.groupCheckout;
    if (!sh.cart.lines.length) return pageHead('Your cart') + empty('cart', 'Your cart is empty', 'Add a pizza, salad or something sweet to get started.', `<a class="btn btn-primary" href="#/menu">Browse the menu</a>${j.orders.length ? ' <a class="btn btn-outline" href="#/orders?tab=past">Reorder a past order</a>' : ''}`);
    const g = locked ? M.getGroup(sh.groupCheckout) : null;
    const sugg = !locked && M.suggestion();
    const offers = window.MOD_DATA.OFFERS.filter(o => o.audience === 'public' || (M.isMember() && j.assignedOffers.includes(o.id)));
    const ctx = { j, store: q.store, mode: q.mode, priced: q.priced, subtotal: q.subtotal, journey: sh.journey };
    const eligible = offers.map(o => ({ o, r: M.evalOffer(o, ctx) })).filter(x => x.r.ok && x.o.id !== sh.cart.couponId);
    const lineHtml = (x) => {
      const l = x.line, p = M.PROD[l.productId];
      const editable = p && p.builder && !l.locked;
      return `<li class="cline ${x.issues.length ? 'has-issue' : ''}">
        <div class="cline-art">${p ? U.artFor(p, l.config) : ''}</div>
        <div class="cline-main">
          <div class="cline-head"><h3>${esc(p ? p.name : 'Item')}</h3><strong>${money(x.total)}</strong></div>
          ${l.participant ? `<span class="pill pill-info">${icon('users')}${esc(l.participant)}</span>` : ''}
          ${M.describe(l).length ? `<ul class="cline-desc">${M.describe(l).map(d => `<li>${esc(d)}</li>`).join('')}</ul>` : ''}
          ${l.note ? `<p class="cline-note">Note: ${esc(l.note)}</p>` : ''}
          ${x.issues.map(i => `<p class="cline-issue" role="alert">${icon('alert')}${esc(i)} — edit or remove to continue.</p>`).join('')}
          <div class="cline-ctrl">
            ${l.locked ? `<span class="muted small">${icon('lock')}Qty ${l.qty} · locked for group checkout</span>`
              : `<div class="stepper" role="group" aria-label="Quantity for ${attr(p.name)}"><button data-act="qty" data-uid="${l.uid}" data-d="-1" aria-label="Decrease quantity">${icon('minus')}</button><span aria-live="polite">${l.qty}</span><button data-act="qty" data-uid="${l.uid}" data-d="1" aria-label="Increase quantity" ${l.qty >= 20 ? 'disabled' : ''}>${icon('plus')}</button></div>
              <span class="muted small">${money(x.unit)} each</span>
              ${editable ? `<a class="btn btn-sm btn-ghost" href="#/item/${p.id}?edit=${l.uid}">${icon('edit')}Edit</a>` : ''}
              <button class="btn btn-sm btn-ghost danger" data-act="remove-line" data-uid="${l.uid}">${icon('trash')}Remove</button>`}
          </div></div></li>`;
    };
    return `${pageHead('Your cart', `${M.cartCount()} item${M.cartCount() === 1 ? '' : 's'} · ${esc(q.store.name)}`)}
      ${locked ? note(`This cart holds the locked group order <strong>${esc(g ? g.name : '')}</strong>. Selections can’t be changed here. <a href="#/group/${sh.groupCheckout}">Reopen the group</a> to make changes. Your personal cart is parked and will come back after checkout.`, 'warn') : ''}
      <div class="two-col">
        <div>
          <ul class="clines">${q.priced.map(lineHtml).join('')}</ul>
          ${!locked ? `<div class="btn-row"><a class="btn btn-outline" href="#/menu">${icon('plus')}Add more</a><button class="btn btn-ghost" data-act="open-setup" data-tab="store">${icon('store')}Change store or fulfillment</button></div>` : ''}
          ${sugg ? `<aside class="upsell"><div class="upsell-art">${U.artFor(sugg)}</div><div><span class="eyebrow">Goes great with your order</span><h3>${esc(sugg.name)}</h3><p class="muted small">${esc(sugg.desc)}</p></div><button class="btn btn-sm btn-primary" data-act="add-simple" data-id="${sugg.id}">${icon('plus')}Add ${money(M.basePrice(sugg, q.store))}</button></aside>` : ''}
        </div>
        <aside class="summary card">
          <h2 class="h3">Summary</h2>
          <div class="sum-ctx">${icon(q.mode === 'delivery' ? 'truck' : 'bag')}<span>${q.mode === 'delivery' ? 'Delivery' : 'Pickup'} · ${esc(q.store.name)}<br><small>${esc(contextSummary().time)}</small></span>${!locked ? '<button class="link-btn" data-act="open-setup" data-tab="store">Change</button>' : ''}</div>
          ${discountBlock(q, eligible)}
          <div class="totals">${totalsRows({ subtotal: q.subtotal, discount: q.discount, discountLabel: q.discountLabel, deliveryFee: q.deliveryFee, baseDelivery: q.freeDelivery ? q.baseDelivery : 0, tax: q.tax }, { mode: q.mode, tip: false }).replace(/<div class="trow total">[\s\S]*$/, '')}
            <div class="trow total"><span><strong>Estimated total</strong><small>before tip</small></span><span><strong>${money(q.foodAfter + q.deliveryFee + q.tax)}</strong></span></div></div>
          ${q.points.points ? `<p class="earn">${icon('star')}You’ll earn about <strong>${q.points.points} pts</strong></p>` : ''}
          <a class="btn btn-primary btn-block btn-lg" href="#/checkout">Checkout ${icon('chevR')}</a>
        </aside>
      </div>`;
  };

  function discountBlock(q, eligible) {
    const sh = M.S.shared; const locked = false;
    let h = '<div class="disc">';
    if (sh.cart.couponId) {
      const o = M.OFFER[sh.cart.couponId]; const ok = q.couponEval && q.couponEval.ok;
      h += `<div class="applied ${ok ? '' : 'bad'}">${icon('tag')}<div><strong>${esc(o.code)}</strong><small>${ok ? `${esc(o.title)} · −${money(q.discount)}` : esc(q.couponEval.reason)}</small></div><button class="link-btn" data-act="coupon-remove">Remove</button></div>`;
    } else if (sh.cart.rewardId) {
      const r = M.REWARD[sh.cart.rewardId]; const ok = q.rewardEval && q.rewardEval.ok;
      h += `<div class="applied reward ${ok ? '' : 'bad'}">${icon('star')}<div><strong>${esc(r.name)}</strong><small>${ok ? `${r.cost} pts · ${q.freeDelivery ? 'delivery fee waived' : '−' + money(q.discount)} · points deducted at checkout` : esc(q.rewardEval.reason)}</small></div><button class="link-btn" data-act="reward-remove">Remove</button></div>`;
    }
    h += `<button class="disc-toggle" data-act="promo-toggle" aria-expanded="${st.promoOpen}" aria-controls="promo-panel">${icon('tag')}<span>${sh.cart.couponId || sh.cart.rewardId ? 'Change offer or reward' : 'Add promo code or reward'}</span>${icon('chevD', 'chev')}</button>
      <div id="promo-panel" class="disc-panel" ${st.promoOpen ? '' : 'hidden'}>
        <form data-form="promo" class="promo-form" novalidate><label for="promo" class="sr-only">Promo code</label><input id="promo" name="code" placeholder="Enter code" autocomplete="off" aria-describedby="promo-msg" value="${attr(st.promoCode || '')}"><button class="btn btn-sm btn-ink" type="submit">Apply</button></form>
        <p id="promo-msg" class="promo-msg ${st.promoMsg ? st.promoMsg.kind : ''}" role="status">${st.promoMsg ? esc(st.promoMsg.text) : ''}</p>
        ${eligible.length ? `<p class="small muted">Eligible right now:</p><div class="chip-row">${eligible.map(x => `<button class="chip" data-act="coupon-apply" data-id="${x.o.id}">${esc(x.o.code)} <small>−${money(x.r.discount)}</small></button>`).join('')}</div>` : ''}
        ${M.isMember() ? `<a class="link small" href="#/rewards">${icon('star')}Use points instead (${M.J().points.toLocaleString()} pts)</a>` : ''}
        <p class="tiny muted">One deal, coupon <em>or</em> points reward per order. <a href="#/offers">See all offers</a></p>
      </div></div>`;
    return h;
  }

  /* ---------------- CHECKOUT ---------------- */
  V.checkout = function () {
    const sh = M.S.shared, j = M.J(), member = M.isMember();
    const q = M.quote();
    if (!sh.cart.lines.length) return pageHead('Checkout', '', '#/cart') + empty('cart', 'Nothing to check out', 'Your cart is empty.', '<a class="btn btn-primary" href="#/menu">Browse the menu</a>');
    const d = sh.draft || {};
    const addr = j.addresses.find(a => a.id === j.selectedAddressId);
    const g = sh.groupCheckout ? M.getGroup(sh.groupCheckout) : null;
    const v = {
      name: d.name != null ? d.name : j.profile.name, email: d.email != null ? d.email : j.profile.email, phone: d.phone != null ? d.phone : j.profile.phone,
      address: d.address != null ? d.address : (g && g.address ? g.address.line : addr ? addr.line : ''),
      instructions: d.instructions != null ? d.instructions : (g && g.address ? g.address.instructions : addr ? addr.instructions : ''),
      allergens: d.allergens || [], kitchenNote: d.kitchenNote || ''
    };
    st.expectedTotal = q.total;
    const fe = st.fieldErrors || {};
    const field = (id, label, type, val, extra = '') => `<div class="field ${fe[id] ? 'has-err' : ''}"><label for="co-${id}">${label}</label>
      <input id="co-${id}" name="${id}" type="${type}" value="${attr(val)}" data-draft="${id}" ${fe[id] ? `aria-invalid="true" aria-describedby="co-${id}-err"` : ''} ${extra}>
      ${fe[id] ? `<p class="err" id="co-${id}-err">${esc(fe[id])}</p>` : ''}</div>`;
    const ALG = ['None', 'Milk', 'Eggs', 'Wheat', 'Soy', 'Peanuts', 'Tree nuts', 'Sesame', 'Fish', 'Shellfish'];
    const tipBtn = (val, label) => `<button type="button" class="seg-btn ${sh.tip.kind === 'pct' && sh.tip.value === val ? 'on' : ''}" role="radio" aria-checked="${sh.tip.kind === 'pct' && sh.tip.value === val}" data-act="tip" data-tip="${val}">${label}</button>`;
    const payOpt = (id, label, ic, sub = '') => `<label class="pay-opt ${sh.pay.method === id ? 'on' : ''}"><input type="radio" name="paym" value="${id}" ${sh.pay.method === id ? 'checked' : ''} data-act="pay-method" data-m="${id}">${icon(ic)}<span><strong>${label}</strong>${sub ? `<small>${sub}</small>` : ''}</span></label>`;
    const blockers = st.blockers || [];
    const status = M.storeStatus(q.store, q.mode);

    return `${pageHead(g ? `Group checkout · ${esc(g.name)}` : 'Checkout', '', '#/cart')}
      ${blockers.length ? `<div class="note note-err" role="alert" id="co-blockers" tabindex="-1">${icon('alert')}<div><strong>We can’t place this order yet</strong><ul>${blockers.map(b => `<li>${esc(b)}</li>`).join('')}</ul></div></div>` : ''}
      <form class="two-col checkout" data-form="checkout" novalidate>
        <div class="co-main">
          <section class="card co-sect" aria-labelledby="co-h-contact"><h2 id="co-h-contact" class="h3">${icon('user')}Contact</h2>
            ${!member ? '<p class="small muted">Ordering as a guest. We’ll remember these details on this browser for next time.</p>' : ''}
            <div class="fgrid">${field('name', 'Full name', 'text', v.name, 'autocomplete="name" required')}${field('email', 'Email', 'email', v.email, 'autocomplete="email" required')}${field('phone', 'Phone (10–15 digits)', 'tel', v.phone, 'autocomplete="tel" inputmode="tel" required')}</div>
          </section>

          <section class="card co-sect" aria-labelledby="co-h-ful"><h2 id="co-h-ful" class="h3">${icon(q.mode === 'delivery' ? 'truck' : 'bag')}${q.mode === 'delivery' ? 'Delivery' : 'Pickup'}</h2>
            <div class="ful-summary"><div><strong>${esc(q.store.name)}</strong> · ${esc(q.store.address)}<br><span class="muted">${esc(contextSummary().time)} · times shown in store time</span>
              ${!status.ok ? `<p class="err">${esc(status.reason)}</p>` : ''}</div>${!g ? '<button type="button" class="btn btn-sm btn-outline" data-act="open-setup" data-tab="store">Change</button>' : ''}</div>
            ${q.mode === 'delivery' ? `
              ${j.addresses.length && !g ? `<div class="field"><label for="co-saved">Saved address</label><select id="co-saved" data-act="co-addr">${j.addresses.map(a => `<option value="${a.id}" ${a.id === j.selectedAddressId ? 'selected' : ''}>${esc(a.label)} — ${esc(a.line)}</option>`).join('')}<option value="">Enter a different address…</option></select></div>` : ''}
              ${field('address', 'Delivery address', 'text', v.address, 'autocomplete="street-address" required')}
              <div class="field"><label for="co-instructions">Delivery instructions <span class="opt">optional</span></label><textarea id="co-instructions" name="instructions" rows="2" data-draft="instructions" placeholder="Gate code, floor, where to leave it…">${esc(v.instructions)}</textarea></div>
              <p class="tiny muted">Address entry is local text only — no live verification in this prototype.</p>`
              : `<div class="pickup-note">${icon('info')}<span>${esc(q.store.pickupNote)}</span></div>`}
          </section>

          <section class="card co-sect" aria-labelledby="co-h-kit"><h2 id="co-h-kit" class="h3">${icon('alert')}Allergies & kitchen note</h2>
            <fieldset class="chips-fs"><legend>Allergens to flag <span class="opt">optional</span></legend><div class="chip-row">${ALG.map(a => `<label class="chip-check"><input type="checkbox" name="allergens" value="${a}" ${v.allergens.includes(a) ? 'checked' : ''} data-act="allergen"><span>${a}</span></label>`).join('')}</div></fieldset>
            <div class="field"><label for="co-kitchenNote">Kitchen note <span class="opt">optional</span></label><textarea id="co-kitchenNote" name="kitchenNote" rows="2" maxlength="200" data-draft="kitchenNote" placeholder="e.g. Please change gloves for my order">${esc(v.kitchenNote)}</textarea></div>
            <p class="small warn-text">${icon('info')}Allergy notes help our team take care, but our kitchens share equipment and ingredients. We can’t guarantee an allergen-free meal.</p>
          </section>

          <section class="card co-sect" aria-labelledby="co-h-tip"><h2 id="co-h-tip" class="h3">${icon('sparkle')}Tip ${q.mode === 'delivery' ? 'your driver & team' : 'the team'}</h2>
            <div class="seg seg-wrap" role="radiogroup" aria-label="Tip amount">${M.CONFIG.tipOptions.map(t => tipBtn(t, t === 0 ? 'No tip' : t + '%')).join('')}<button type="button" class="seg-btn ${sh.tip.kind === 'custom' ? 'on' : ''}" role="radio" aria-checked="${sh.tip.kind === 'custom'}" data-act="tip" data-tip="custom">Custom</button></div>
            ${sh.tip.kind === 'custom' ? `<div class="field inline"><label for="co-tip">Custom tip ($)</label><input id="co-tip" type="number" min="0" step="0.5" inputmode="decimal" value="${(sh.tip.custom / 100).toFixed(2)}" data-input="tip-custom"></div>` : ''}
            <p class="tiny muted">Percentage tips are calculated on food after discounts, before tax and delivery: ${money(q.foodAfter)}.</p>
          </section>

          <section class="card co-sect" aria-labelledby="co-h-pay"><h2 id="co-h-pay" class="h3">${icon('card')}Payment <span class="pill pill-muted">Simulated</span></h2>
            ${member ? `<div class="wallet-tenders">
              <label class="switch-row"><input type="checkbox" ${sh.pay.useCredit ? 'checked' : ''} data-act="toggle-credit" ${j.wallet.credit ? '' : 'disabled'}><span class="switch" aria-hidden="true"></span><span><strong>Use service credit</strong><small>${money(j.wallet.credit)} available · applied first</small></span></label>
              ${sh.pay.method !== 'wallet' ? `<label class="switch-row"><input type="checkbox" ${sh.pay.useGift ? 'checked' : ''} data-act="toggle-gift" ${j.wallet.gift ? '' : 'disabled'}><span class="switch" aria-hidden="true"></span><span><strong>Use gift-wallet funds</strong><small>${money(j.wallet.gift)} available · pay the rest another way</small></span></label>` : ''}
            </div>` : '<p class="small muted">Guests can pay by card, Apple Pay or Google Pay. Points, wallet funds and service credit are for members.</p>'}
            <fieldset class="pay-opts"><legend class="sr-only">Payment method</legend>
              ${payOpt('card', 'Card', 'card', 'Visa •••• 4242 (sample)')}${payOpt('apple', 'Apple Pay', 'phone', 'Simulated sheet')}${payOpt('google', 'Google Pay', 'phone', 'Simulated sheet')}
              ${member ? payOpt('wallet', 'MOD Wallet', 'wallet', `Pay in full · ${money(j.wallet.gift)} funds`) : ''}
            </fieldset>
            ${member && sh.pay.method === 'wallet' && q.shortfall > 0 ? `<div class="note note-warn">${icon('alert')}<div>Wallet funds are <strong>${money(q.shortfall)}</strong> short.<div class="btn-row"><a class="btn btn-sm btn-primary" href="#/wallet">Top up wallet</a><button type="button" class="btn btn-sm btn-outline" data-act="pay-method" data-m="card">Pay by card instead</button></div></div></div>` : ''}
            <p class="tiny muted">No real charge is made. This prototype never collects card numbers.</p>
          </section>
        </div>

        <aside class="summary card co-side">
          <h2 class="h3">Order summary</h2>
          <ul class="mini-lines">${q.priced.map(x => `<li><span class="q">${x.line.qty}×</span><span>${esc(M.PROD[x.line.productId].name)}${x.line.participant ? ` <small>· ${esc(x.line.participant)}</small>` : ''}${M.describe(x.line).length ? `<small>${esc(M.describe(x.line).join(' · '))}</small>` : ''}${x.issues.length ? `<small class="err">${esc(x.issues[0])}</small>` : ''}</span><span>${money(x.total)}</span></li>`).join('')}</ul>
          ${discountBlock(q, [])}
          <div class="totals">${totalsRows({ subtotal: q.subtotal, discount: q.discount, discountLabel: q.discountLabel, deliveryFee: q.deliveryFee, baseDelivery: q.freeDelivery ? q.baseDelivery : 0, tax: q.tax, tip: q.tipAmt, total: q.total }, { mode: q.mode })}
            ${member && (q.credit || q.gift) ? `<div class="trow alloc"><span>Service credit</span><span>−${money(q.credit)}</span></div><div class="trow alloc"><span>Gift-wallet funds</span><span>−${money(q.gift)}</span></div>` : ''}
            <div class="trow due"><span><strong>Remaining due</strong><small>${sh.pay.method === 'wallet' ? 'MOD Wallet' : ({ card: 'Card', apple: 'Apple Pay', google: 'Google Pay' }[sh.pay.method] || 'Card')}</small></span><span><strong>${money(member ? (sh.pay.method === 'wallet' ? q.shortfall : q.other) : q.total)}</strong></span></div>
          </div>
          ${member ? `<p class="earn">${icon('star')}Estimated <strong>${q.points.points} pts</strong> (${q.points.rule.rate}/$1 × ${q.points.rule.mult} ${esc(q.points.rule.tier)})${q.points.capped ? ` · daily cap ${M.CONFIG.dailyPointCap.toLocaleString()} reached` : ''}</p>` : '<p class="earn muted">Guest orders don’t earn points.</p>'}
          <button class="btn btn-primary btn-block btn-lg" type="submit" id="place-btn">Place order · ${money(q.total)}</button>
          <p class="tiny muted center">By placing this order you confirm the details above. Payment is simulated.</p>
        </aside>
      </form>`;
  };

  /* ---------------- TRACKING ---------------- */
  V.order = function (id) {
    const f = M.findOrder(id);
    if (!f) return pageHead('Order not found', '', '#/orders') + empty('receipt', 'We couldn’t find that order', 'It may belong to the other demo journey or was cleared.', '<a class="btn btn-primary" href="#/orders">Your orders</a>');
    const o = f.order; const s = M.stageOf(o); const other = f.journey !== M.S.shared.journey;
    const eta = M.etaOf(o);
    const steps = s.steps.map(([sid], i) => {
      const state = s.id === 'canceled' ? 'off' : i < s.idx ? 'done' : i === s.idx ? (s.done ? 'done' : 'now') : 'todo';
      return `<li class="ts ${state}"><span class="ts-dot">${state === 'done' ? icon('check') : ''}</span><span>${esc(M.STAGE_LABEL[sid])}</span></li>`;
    }).join('');
    const amend = M.canAmend(o) && o.lines.some(l => l.cat === 'pizzas') && !other;
    const refund = o.refund;
    return `${pageHead(s.id === 'canceled' ? 'Order canceled' : s.done ? (o.mode === 'delivery' ? 'Delivered — enjoy!' : 'Picked up — enjoy!') : s.id === 'scheduled' ? 'Order scheduled' : 'Thanks! Your order is in.', `Order <strong>${esc(o.id)}</strong> · ${esc(o.storeName)} · ${o.mode === 'delivery' ? 'Delivery' : 'Pickup'}`, '#/orders')}
      ${other ? note('This order belongs to the other demo journey. Switch journeys to manage it.', 'warn') : ''}
      ${refund ? note(refund.status === 'review' ? 'Refund request received — our team is reviewing it (simulated, about 20 seconds). This isn’t an instant cancellation.' : refund.status === 'approved' ? `Full refund approved (simulated) — ${money(refund.amount || 0)} to the original payment method. Points, wallet funds and service credit were reconciled.` : esc(refund.reason || 'Refund needs manual review.'), refund.status === 'blocked' ? 'warn' : 'info') : ''}
      <div class="two-col track">
        <div>
          <section class="card track-hero" aria-live="polite">
            <div class="track-top"><div><span class="eyebrow">${s.id === 'canceled' ? 'Status' : s.done ? 'Completed' : o.schedule.type === 'later' ? 'Scheduled for' : 'Estimated ' + (o.mode === 'delivery' ? 'arrival' : 'ready time')}</span>
              <div class="eta">${s.id === 'canceled' ? 'Canceled' : esc(M.fmtTime(s.done && o.completedAt ? o.completedAt : eta, o.tz, { date: o.schedule.type === 'later' }))}</div></div>${stageBadge(o)}</div>
            <ol class="tsteps" aria-label="Order progress">${steps}</ol>
            ${!s.done && s.id !== 'scheduled' ? '<p class="tiny muted">Demo timeline runs in about 6 minutes. Tracking is simulated — no live GPS or courier connection.</p>' : ''}
            ${s.id === 'scheduled' ? `<p class="small">We’ll start preparing ${esc(M.fmtTime(s.start, o.tz, { date: true }))}. You can still change toppings until then.</p>` : ''}
          </section>
          ${o.mode === 'delivery' ? mapCard(o, s) : `<section class="card pickup-card"><h2 class="h3">${icon('store')}Pickup at ${esc(o.storeName)}</h2><p>${esc(o.storeAddress)}</p><div class="pickup-note">${icon('info')}<span>${esc(o.pickupNote)}</span></div></section>`}
          ${amend ? `<section class="card amend-card"><div><h2 class="h3">${icon('edit')}Change toppings</h2><p class="small muted">You can tweak toppings and portions until we start preparing. Size, crust and price stay the same.</p></div><button class="btn btn-primary" data-act="amend-open" data-id="${o.id}">Edit toppings</button></section>` : ''}
          ${o.amendments.length ? `<section class="card"><h2 class="h3">Changes made</h2><ul class="amend-list">${o.amendments.map(a => `<li><strong>${esc(a.line)}</strong> · ${esc(M.fmtTime(a.at, o.tz))}<br><span class="muted">Before:</span> ${esc(a.before)}<br><span class="muted">After:</span> ${esc(a.after)} · ${money(a.charge)}</li>`).join('')}</ul></section>` : ''}
        </div>
        <aside class="co-side">
          <section class="card"><h2 class="h3">Your order</h2>
            <ul class="mini-lines">${o.lines.map(l => `<li><span class="q">${l.qty}×</span><span>${esc(l.name)}${l.participant ? ` <small>· ${esc(l.participant)}</small>` : ''}${l.desc.length ? `<small>${esc(l.desc.join(' · '))}</small>` : ''}${l.note ? `<small>Note: ${esc(l.note)}</small>` : ''}</span><span>${money(l.total)}</span></li>`).join('')}</ul>
            <div class="totals">${totalsRows(o.totals, { mode: o.mode })}</div>
            <div class="btn-row"><a class="btn btn-sm btn-outline" href="#/receipt/${o.id}">${icon('receipt')}Receipt</a><a class="btn btn-sm btn-ghost" href="#/support/${o.id}">${icon('help')}Get help</a>${s.done && !o.canceled ? `<a class="btn btn-sm btn-ghost" href="#/support/${o.id}#feedback">${icon('star')}${o.feedback ? 'Edit rating' : 'Rate order'}</a>` : ''}</div>
          </section>
          <section class="card"><h2 class="h3">Contact & notes</h2>
            <dl class="dl"><dt>Name</dt><dd>${esc(o.contact.name)}</dd><dt>Phone</dt><dd>${esc(o.contact.phone)}</dd><dt>Email</dt><dd>${esc(o.contact.email)}</dd>
            ${o.address ? `<dt>Deliver to</dt><dd>${esc(o.address)}${o.instructions ? `<br><small>${esc(o.instructions)}</small>` : ''}</dd>` : ''}
            <dt>Allergens</dt><dd>${o.allergens.length ? esc(o.allergens.join(', ')) : 'None noted'}</dd>${o.kitchenNote ? `<dt>Kitchen note</dt><dd>${esc(o.kitchenNote)}</dd>` : ''}</dl>
          </section>
          ${o.group ? `<section class="card"><h2 class="h3">${icon('users')}Group · ${esc(o.group.name)}</h2><p class="small muted">${esc(o.group.participants.join(', '))}</p></section>` : ''}
        </aside>
      </div>`;
  };
  function mapCard(o, s) {
    const outIdx = s.steps.findIndex(x => x[0] === 'out');
    let frac = 0;
    if (s.id === 'canceled') frac = 0;
    else if (s.done) frac = 1;
    else if (s.idx >= outIdx && s.start) { const t0 = s.start + s.steps[outIdx][1] * 1000, t1 = s.start + s.steps[s.steps.length - 1][1] * 1000; frac = Math.max(0, Math.min(1, (Date.now() - t0) / (t1 - t0))); }
    const z = st.mapZoom, [px, py] = st.mapPan;
    const w = 400 / z, hgt = 260 / z; const cx = 200 + px - w / 2, cy = 130 + py - hgt / 2;
    const roads = [[-400, 66, 800, 66], [-400, 190, 800, 170], [96, -300, 88, 560], [237, -300, 237, 560], [340, -300, 370, 560], [-400, 128, 800, 128], [-400, 250, 800, 240]].map(r => `<line x1="${r[0]}" y1="${r[1]}" x2="${r[2]}" y2="${r[3]}" class="road"/>`).join('');
    const blocks = Array.from({ length: 30 }, (_, i) => `<rect x="${(i * 61) % 700 - 150}" y="${(i * 47) % 300 - 20}" width="${26 + (i % 3) * 8}" height="${18 + (i % 4) * 6}" rx="3" class="blk"/>`).join('');
    return `<section class="card map-card"><div class="map-head"><h2 class="h3">${icon('truck')}Delivery route <span class="pill pill-muted">Illustrative</span></h2>
        <div class="map-ctrl" role="group" aria-label="Map controls"><button class="icon-btn sm" data-act="map-zoom" data-d="1" aria-label="Zoom in">${icon('zoomIn')}</button><button class="icon-btn sm" data-act="map-zoom" data-d="-1" aria-label="Zoom out">${icon('zoomOut')}</button><button class="icon-btn sm" data-act="map-recenter" aria-label="Recenter on courier">${icon('target')}</button></div></div>
      <div class="map" role="img" aria-label="Illustrative map: courier is ${Math.round(frac * 100)}% of the way from ${attr(o.storeName)} to your address">
        <svg viewBox="${cx.toFixed(1)} ${cy.toFixed(1)} ${w.toFixed(1)} ${hgt.toFixed(1)}" preserveAspectRatio="xMidYMid meet" id="map-svg" data-frac="${frac}">
          <rect x="-400" y="-400" width="1200" height="1060" class="land"/><path d="M-50 230 C 80 210, 160 250, 300 215 S 420 200, 460 210 L460 300 L-50 300z" class="water"/>${blocks}${roads}
          <path id="route" d="M60 66 L 95 66 L 92 128 L 238 128 L 236 70 L 344 66" class="route"/>
          <path d="M60 66 L 95 66 L 92 128 L 238 128 L 236 70 L 344 66" class="route-done" pathLength="1" stroke-dasharray="${frac} 1"/>
          <g transform="translate(60 66)"><circle r="11" class="pin-store"/><text y="4" text-anchor="middle" class="pin-t">M</text></g>
          <g transform="translate(344 66)"><circle r="11" class="pin-home"/><path d="M-5 1 0-4 5 1v5h-10z" fill="#fff"/></g>
          <g id="courier" class="courier"><circle r="13" class="cour-halo"/><circle r="8" class="cour-dot"/></g>
        </svg></div>
      <div class="map-foot"><div>${icon('pin')}<span><strong>${esc(o.address)}</strong>${o.instructions ? `<br><small>${esc(o.instructions)}</small>` : ''}</span></div>
        <div class="btn-row"><a class="btn btn-sm btn-outline" href="tel:+12065550100">${icon('phone')}Delivery support</a><button class="btn btn-sm btn-ghost" data-act="chat-open" data-id="${o.id}">${icon('chat')}Chat</button></div></div>
    </section>`;
  }

  /* ---------------- ORDERS ---------------- */
  V.orders = function (q) {
    const j = M.J(); const tab = q.tab || st.ordersTab || 'progress'; st.ordersTab = tab;
    const lists = { progress: j.orders.filter(o => !M.stageOf(o).done), past: j.orders.filter(o => M.stageOf(o).done), all: j.orders };
    const list = lists[tab] || lists.all;
    const t = (id, label) => `<a class="tab ${tab === id ? 'on' : ''}" href="#/orders?tab=${id}" ${tab === id ? 'aria-current="page"' : ''}>${label} <span class="count">${lists[id].length}</span></a>`;
    return `${pageHead('Orders', `${M.isMember() ? 'Member' : 'Guest'} order history on this browser`)}
      <nav class="tabs" aria-label="Order filters">${t('progress', 'In progress')}${t('past', 'Past')}${t('all', 'All')}</nav>
      ${list.length ? `<div class="olist">${list.map(o => orderCard(o, { full: true })).join('')}</div>`
        : empty('receipt', tab === 'progress' ? 'Nothing cooking right now' : 'No orders yet', tab === 'progress' ? 'Active and scheduled orders show up here.' : 'Orders you place will appear here with receipts and reorder.', '<a class="btn btn-primary" href="#/menu">Start an order</a>')}`;
  };

  /* ---------------- RECEIPT / INVOICE ---------------- */
  V.receipt = function (id) {
    const f = M.findOrder(id);
    if (!f) return pageHead('Receipt not found', '', '#/orders') + empty('receipt', 'Receipt not found', 'This order isn’t on this browser.', '');
    const o = f.order; const s = M.stageOf(o);
    const pm = { card: 'Card (Visa •••• 4242, simulated)', apple: 'Apple Pay (simulated)', google: 'Google Pay (simulated)', wallet: 'MOD Wallet' }[o.payment.method] || 'Card';
    const coupon = o.couponId ? M.OFFER[o.couponId] : null;
    return `${pageHead('Receipt', '', `#/order/${o.id}`)}
      <div class="btn-row no-print receipt-actions"><button class="btn btn-primary" data-act="pdf" data-id="${o.id}">${icon('download')}Download PDF</button><button class="btn btn-outline" data-act="print">${icon('print')}Print</button><button class="btn btn-outline" data-act="email-copy" data-id="${o.id}">${icon('mail')}Email a copy</button></div>
      <article class="invoice card" id="invoice">
        <header class="inv-head"><div class="logo-word">MOD<span>pizza</span></div><div class="inv-meta"><h2>Invoice</h2>
          <dl><dt>Invoice</dt><dd>${esc(o.invoice.id)}</dd><dt>Revision</dt><dd>${o.invoice.revision}</dd><dt>Order</dt><dd>${esc(o.id)}</dd><dt>Date</dt><dd>${esc(M.fmtDate(o.createdAt, o.tz))} ${esc(M.fmtTime(o.createdAt, o.tz))}</dd><dt>Status</dt><dd>${esc(s.label)}</dd></dl></div></header>
        <div class="inv-parties"><div><h3>Billed to</h3><p>${esc(o.contact.name)}<br>${esc(o.contact.email)}<br>${esc(o.contact.phone)}${o.address ? `<br>${esc(o.address)}` : ''}</p></div>
          <div><h3>Store</h3><p>MOD ${esc(o.storeName)}<br>${esc(o.storeAddress)}<br>${o.mode === 'delivery' ? 'Delivery' : 'Pickup'}${o.schedule.type === 'later' ? ` · scheduled ${esc(M.fmtTime(o.schedule.slot, o.tz, { date: true }))}` : ''}</p></div></div>
        <table class="inv-table"><thead><tr><th scope="col">Item</th><th scope="col" class="num">Qty</th><th scope="col" class="num">Price</th><th scope="col" class="num">Total</th></tr></thead>
          <tbody>${o.lines.map(l => `<tr><td><strong>${esc(l.name)}</strong>${l.participant ? ` · ${esc(l.participant)}` : ''}${(l.recipe || l.desc).map(r => `<div class="inv-sub">${esc(r)}</div>`).join('')}${l.note ? `<div class="inv-sub">Note: ${esc(l.note)}</div>` : ''}</td><td class="num">${l.qty}</td><td class="num">${money(l.unit)}</td><td class="num">${money(l.total)}</td></tr>`).join('')}</tbody></table>
        <div class="inv-bottom"><div class="inv-notes">
            ${coupon ? `<p><strong>Coupon:</strong> ${esc(coupon.code)} — ${esc(coupon.title)}</p>` : ''}
            ${o.reward ? `<p><strong>Reward:</strong> ${esc(o.reward.name)} (${o.reward.cost} pts redeemed)</p>` : ''}
            <p><strong>Points:</strong> ${o.journey === 'member' ? `${o.pointsAwarded ? o.pointsEarned + ' earned' : (o.pointsEstimate || 0) + ' pending'} · ${o.earnRule ? `${o.earnRule.rate}/$1 × ${o.earnRule.mult} (${esc(o.earnRule.tier)})` : ''}` : 'Guest order — not eligible'}</p>
            ${o.amendments.length ? `<p><strong>Amendments:</strong> ${o.amendments.map(a => `${esc(a.line)}: ${esc(a.after)} (${money(a.charge)})`).join('; ')}</p>` : ''}
            ${o.canceled ? `<p><strong>Canceled</strong>${o.refund && o.refund.status === 'approved' ? ' · full refund issued (simulated)' : ''}</p>` : ''}
          </div>
          <div class="inv-totals">${totalsRows(o.totals, { mode: o.mode })}
            <div class="trow alloc"><span>Service credit</span><span>${money(o.payment.credit)}</span></div>
            <div class="trow alloc"><span>Gift-wallet funds</span><span>${money(o.payment.gift)}</span></div>
            <div class="trow alloc"><span>${esc(pm)}</span><span>${money(o.payment.method === 'wallet' ? 0 : o.payment.other)}</span></div></div></div>
        <footer class="inv-foot">Original purchase prices shown. Sample tax and nutrition values. Prototype document — no real payment was taken.</footer>
      </article>`;
  };

  /* ---------------- OFFERS ---------------- */
  function offerCard(o) {
    const j = M.J(); const q = M.quote();
    const r = M.evalOffer(o, { j, store: q.store, mode: q.mode, priced: q.priced, subtotal: q.subtotal, journey: M.S.shared.journey });
    const saved = j.savedOffers.includes(o.id); const applied = M.S.shared.cart.couponId === o.id;
    return `<article class="offer ${r.ok ? '' : 'ineligible'}">
      <div class="offer-stub"><span>${o.kind === 'pct' ? o.value + '%' : o.kind === 'fixed' ? money(o.value).replace('.00', '') : o.kind === 'twoPizza' ? '2 for $25' : 'FREE'}</span><small>${o.kind === 'pizzaDessert' ? 'dessert' : o.kind === 'twoPizza' ? 'pizzas' : 'off'}</small></div>
      <div class="offer-body"><div class="offer-top"><h3><a href="#/offer/${o.id}">${esc(o.title)}</a></h3>
        <button class="fav-btn sm ${saved ? 'on' : ''}" data-act="offer-save" data-id="${o.id}" aria-pressed="${saved}" aria-label="${saved ? 'Unsave' : 'Save'} offer ${attr(o.code)}">${icon('heart')}</button></div>
        <p class="small">${esc(o.blurb)}</p>
        <div class="offer-meta"><code>${esc(o.code)}</code>${o.audience === 'member' ? pill('Member', 'pill-red') : ''}${o.modes.length === 1 ? pill(o.modes[0] === 'pickup' ? 'Pickup only' : 'Delivery only', 'pill-warn') : ''}${o.minSpend ? `<span class="muted small">Min ${money(o.minSpend)}</span>` : ''}</div>
        <p class="elig ${r.ok ? 'ok' : ''}">${icon(r.ok ? 'check' : 'info')}${r.ok ? (q.subtotal ? `Eligible now · saves ${money(r.discount)}` : 'Eligible') : esc(r.reason)}</p>
        <div class="btn-row">${applied ? `<button class="btn btn-sm btn-outline" data-act="coupon-remove">Remove from order</button>` : `<button class="btn btn-sm btn-primary" data-act="coupon-apply" data-id="${o.id}">Apply</button>`}<a class="btn btn-sm btn-ghost" href="#/offer/${o.id}">Details & terms</a></div>
      </div></article>`;
  }
  V.offers = function (q) {
    const j = M.J(); const tab = q.tab || 'all';
    const visible = window.MOD_DATA.OFFERS.filter(o => o.audience === 'public' || (M.isMember() && j.assignedOffers.includes(o.id)));
    const lists = { all: visible, pickup: visible.filter(o => o.modes.length === 1 && o.modes[0] === 'pickup'), saved: visible.filter(o => j.savedOffers.includes(o.id)) };
    const t = (id, label) => `<a class="tab ${tab === id ? 'on' : ''}" href="#/offers?tab=${id}" ${tab === id ? 'aria-current="page"' : ''}>${label} <span class="count">${lists[id].length}</span></a>`;
    return `${pageHead('Offers', 'Eligibility updates live with your cart, store and fulfillment.')}
      <nav class="tabs" aria-label="Offer filters">${t('all', 'All offers')}${t('pickup', 'Pickup')}${t('saved', 'Saved')}</nav>
      ${lists[tab].length ? `<div class="offer-grid">${lists[tab].map(offerCard).join('')}</div>` : empty('tag', tab === 'saved' ? 'No saved offers' : 'No offers here', tab === 'saved' ? 'Tap the heart on any offer to keep it handy.' : 'Check back soon.', '<a class="btn btn-primary" href="#/offers?tab=all">See all offers</a>')}
      ${!M.isMember() ? `<p class="fine">${icon('info')}Members also get assigned coupons. <button class="link-btn" data-act="journey" data-j="member">Try the member journey</button></p>` : ''}`;
  };
  V.offer = function (id) {
    const o = M.OFFER[id]; const j = M.J();
    if (!o || (o.audience === 'member' && !(M.isMember() && j.assignedOffers.includes(o.id)))) return pageHead('Offer', '', '#/offers') + empty('tag', 'Offer unavailable', 'This offer isn’t available for your journey.', '<a class="btn btn-primary" href="#/offers">All offers</a>');
    const q = M.quote();
    const r = M.evalOffer(o, { j, store: q.store, mode: q.mode, priced: q.priced, subtotal: q.subtotal, journey: M.S.shared.journey });
    const needBundle = o.kind === 'twoPizza' || o.kind === 'pizzaDessert';
    const fmtD = (t) => new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${pageHead(esc(o.title), esc(o.blurb), '#/offers')}
      <div class="two-col"><section class="card">
        <dl class="dl wide"><dt>Code</dt><dd><code class="big-code">${esc(o.code)}</code></dd><dt>Minimum food spend</dt><dd>${o.minSpend ? money(o.minSpend) : 'None'}</dd>
          <dt>Fulfillment</dt><dd>${o.modes.map(m => m === 'pickup' ? 'Pickup' : 'Delivery').join(' & ')}</dd><dt>Stores</dt><dd>${o.stores ? o.stores.map(s => esc(M.STORE[s].name)).join(', ') : 'All participating stores'}</dd>
          <dt>Audience</dt><dd>${o.audience === 'member' ? 'Assigned to your member account' : 'Everyone'}</dd><dt>Valid</dt><dd>${fmtD(o.start)} – ${fmtD(o.end)}</dd><dt>Usage</dt><dd>${M.couponUses(j, o.id)} of ${o.limit} used (canceled orders don’t count)</dd></dl>
        <h2 class="h3">Terms</h2><p>${esc(o.terms)}</p><p class="small muted">One deal, coupon or points reward per order.</p>
      </section>
      <aside class="card summary"><h2 class="h3">For your current order</h2>
        <p class="elig big ${r.ok ? 'ok' : ''}">${icon(r.ok ? 'check' : 'info')}${r.ok ? `Eligible — saves ${money(r.discount)}` : esc(r.reason)}</p>
        <div class="btn-row col">${M.S.shared.cart.couponId === o.id ? '<button class="btn btn-outline btn-block" data-act="coupon-remove">Remove from order</button>' : `<button class="btn btn-primary btn-block" data-act="coupon-apply" data-id="${o.id}">Apply to order</button>`}
          ${needBundle ? `<button class="btn btn-outline btn-block" data-act="offer-bundle" data-id="${o.id}">${icon('plus')}Add qualifying items</button>` : ''}
          <button class="btn btn-ghost btn-block" data-act="offer-save" data-id="${o.id}">${icon('heart')}${j.savedOffers.includes(o.id) ? 'Saved' : 'Save offer'}</button></div>
      </aside></div>`;
  };

  /* ---------------- REWARDS ---------------- */
  function memberGate(title) {
    return pageHead(title) + `<div class="gate card"><div class="gate-art">${U.pizzaSVG(M.defaultPizzaConfig(M.PROD['p-lucy']))}</div><div><span class="eyebrow">MOD Rewards</span><h2>Join to earn and redeem</h2>
      <p>Guests can order, track and get support without joining. Points, wallet funds, service credit, member coupons and the member pass are for members.</p>
      <div class="btn-row"><button class="btn btn-primary" data-act="journey" data-j="member">Switch to sample member</button><button class="btn btn-outline" data-act="journey" data-j="member" data-go="#/join">Join (sample enrollment)</button></div>
      <p class="tiny muted">This is a demo journey switch, not real authentication.</p></div></div>`;
  }
  V.memberGate = memberGate;
  V.rewards = function () {
    if (!M.isMember()) return memberGate('Rewards');
    const j = M.J(); const q = M.quote(); const tier = M.tierOf(j), next = M.nextTier(j); const C = M.CONFIG;
    const ctx = { j, store: q.store, mode: q.mode, priced: q.priced, subtotal: q.subtotal, journey: 'member' };
    const ch = M.challengeProgress(j);
    const p = j.profile; const profileDone = p.name && p.email && p.phone && p.birthday;
    const rewardCard = (r) => {
      const ev = M.evalReward(r, ctx); const sel = M.S.shared.cart.rewardId === r.id;
      const need = Math.max(0, r.cost - j.points);
      return `<article class="reward ${sel ? 'sel' : ''} ${ev.ok ? '' : 'ineligible'}"><div class="reward-cost"><strong>${r.cost.toLocaleString()}</strong><small>pts</small></div>
        <div class="reward-body"><h3>${esc(r.name)}${r.tier ? ' ' + pill(M.CONFIG.tiers.find(t => t.id === r.tier).name, 'pill-gold') : ''}</h3><p class="small muted">${esc(r.desc)}</p>
          ${need ? `<div class="meter sm" role="progressbar" aria-label="Points toward ${attr(r.name)}" aria-valuemin="0" aria-valuemax="${r.cost}" aria-valuenow="${j.points}"><span style="width:${Math.min(100, j.points / r.cost * 100)}%"></span></div><p class="small">${need.toLocaleString()} more points needed</p>` : ''}
          <p class="elig ${ev.ok ? 'ok' : ''}">${icon(ev.ok ? 'check' : 'info')}${ev.ok ? (sel ? 'Selected for this order' : 'Eligible for your current cart') : esc(ev.reason)}</p></div>
        <div>${sel ? '<button class="btn btn-sm btn-outline" data-act="reward-remove">Remove</button>' : `<button class="btn btn-sm btn-primary" data-act="reward-select" data-id="${r.id}" ${ev.ok ? '' : 'aria-disabled="true"'}>${M.S.shared.cart.rewardId || M.S.shared.cart.couponId ? 'Replace' : 'Select'}</button>`}</div></article>`;
    };
    return `${pageHead('Rewards', j.enrolled ? `Member since enrollment · ID ${esc(j.memberId)}` : 'Sample rewards profile — complete enrollment to make it yours')}
      <section class="points-hero"><div><span class="eyebrow light">${esc(tier.name)} · ${tier.mult}× earning</span><div class="ph-num">${j.points.toLocaleString()}<small>available pts</small></div>
          <p>${M.pendingPoints(j) ? `${M.pendingPoints(j)} points pending until your order completes · ` : ''}${j.lifetime.toLocaleString()} lifetime</p></div>
        <div class="ph-goal"><span>${j.points >= C.pizzaRewardCost ? 'Free pizza unlocked' : `${(C.pizzaRewardCost - j.points).toLocaleString()} to a free pizza`}</span><div class="meter light" role="progressbar" aria-label="Progress to a free pizza" aria-valuemin="0" aria-valuemax="${C.pizzaRewardCost}" aria-valuenow="${Math.min(j.points, C.pizzaRewardCost)}"><span style="width:${Math.min(100, j.points / C.pizzaRewardCost * 100)}%"></span></div>
          ${next ? `<small>${(next.min - j.lifetime).toLocaleString()} lifetime pts to ${esc(next.name)}</small>` : ''}
          <div class="btn-row"><a class="btn btn-sm btn-white" href="#/pass">${icon('card')}Member pass</a><a class="btn btn-sm btn-glass" href="#/wallet">${icon('wallet')}Wallet ${money(j.wallet.gift)}</a><a class="btn btn-sm btn-glass" href="#/activity">Activity</a></div></div></section>
      ${!j.enrolled ? note('You’re viewing the sample rewards profile. <a href="#/join">Complete enrollment</a> to make it yours — enrollment itself doesn’t award points.', 'info') : ''}
      <div class="two-col wide-left">
        <section><div class="sect-head"><h2>Redeem points</h2><span class="muted small">One reward or coupon per order · points deducted only when checkout succeeds</span></div>
          <div class="reward-list">${window.MOD_DATA.REWARDS.map(rewardCard).join('')}</div></section>
        <aside>
          <section class="card"><h2 class="h3">How you earn</h2><dl class="dl"><dt>Rate</dt><dd>${C.pointsPerDollar} pts per $1 on food after discounts</dd><dt>Your multiplier</dt><dd>${tier.mult}× (${esc(tier.name)})</dd><dt>Daily cap</dt><dd>${C.dailyPointCap.toLocaleString()} pts</dd><dt>When</dt><dd>Awarded once your order is completed</dd></dl>
            <div class="tiers">${C.tiers.map(t => `<div class="tier ${t.id === tier.id ? 'on' : ''}"><strong>${esc(t.name)}</strong><small>${t.min.toLocaleString()}+ lifetime · ${t.mult}×</small></div>`).join('')}</div></section>
          <section class="card"><h2 class="h3">Bonus points</h2>
            <div class="bonus"><div><strong>Complete your profile</strong><small>+${C.profileBonus} pts once · needs name, email, phone and birthday</small></div>${j.claims.profile ? pill('Claimed', 'pill-ok') : profileDone ? `<button class="btn btn-sm btn-primary" data-act="claim" data-kind="profile">Claim</button>` : '<a class="btn btn-sm btn-outline" href="#/account">Finish profile</a>'}</div>
            <div class="bonus"><div><strong>${esc(C.challenge.name)}</strong><small>Try ${C.challenge.need} different signature pizzas · +${C.challenge.points} pts</small>
              <div class="dots" aria-label="${ch.count} of ${C.challenge.need} complete">${Array.from({ length: C.challenge.need }, (_, i) => `<span class="${i < ch.count ? 'on' : ''}"></span>`).join('')}</div></div>
              ${j.claims.challenge ? pill('Claimed', 'pill-ok') : ch.count >= C.challenge.need ? `<button class="btn btn-sm btn-primary" data-act="claim" data-kind="challenge">Claim</button>` : `<span class="small muted">${ch.count}/${C.challenge.need}</span>`}</div>
            <form class="bonus" data-form="receipt-claim"><div><label for="rc-code"><strong>Claim a missing receipt</strong></label><small>Sample code: ${C.receiptClaim.code} · once only</small>
              <input id="rc-code" name="code" placeholder="Receipt code" ${j.claims.receipt ? 'disabled' : ''}></div>${j.claims.receipt ? pill('Claimed', 'pill-ok') : '<button class="btn btn-sm btn-outline" type="submit">Claim</button>'}</form>
          </section>
        </aside></div>`;
  };

  V.activity = function () {
    if (!M.isMember()) return memberGate('Activity');
    const j = M.J();
    const label = { earn: 'Earned', redeem: 'Redeemed', bonus: 'Bonus', refund: 'Refund', reverse: 'Reversed', wallet: 'Wallet', credit: 'Service credit' };
    return `${pageHead('Rewards & wallet activity', '', '#/rewards')}
      ${j.activity.length ? `<ul class="act-list">${j.activity.map(a => `<li><span class="act-ico t-${a.type}">${icon(a.type === 'wallet' ? 'wallet' : a.type === 'credit' ? 'gift' : 'star')}</span><div><strong>${esc(a.text)}</strong><small>${label[a.type] || ''} · ${new Date(a.at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</small></div>
        <span class="act-amt ${((a.points || a.amount || 0) < 0) ? 'neg' : 'pos'}">${a.points != null ? `${a.points > 0 ? '+' : ''}${a.points} pts` : `${a.amount > 0 ? '+' : ''}${money(a.amount)}`}</span></li>`).join('')}</ul>` : empty('star', 'No activity yet', 'Earning, redemptions, bonuses and wallet movements appear here.')}`;
  };

  V.wallet = function () {
    if (!M.isMember()) return memberGate('Wallet');
    const j = M.J(); const C = M.CONFIG;
    const acts = j.activity.filter(a => a.type === 'wallet' || a.type === 'credit').slice(0, 8);
    return `${pageHead('MOD Wallet', 'Gift funds and service credit are kept separate. All payments are simulated.', '#/rewards')}
      <div class="wallet-cards"><section class="wcard gift"><span class="eyebrow light">${icon('wallet')}Gift-wallet funds</span><strong>${money(j.wallet.gift)}</strong><small>Use in full or alongside another payment method</small></section>
        <section class="wcard credit"><span class="eyebrow">${icon('gift')}Service credit</span><strong>${money(j.wallet.credit)}</strong><small>Applied before gift funds when selected at checkout</small></section></div>
      <div class="two-col">
        <section class="card"><h2 class="h3">Top up</h2><p class="small muted">Choose an amount. A simulated card payment adds funds instantly.</p>
          <div class="chip-row big">${C.topUpPresets.map(a => `<button class="chip lg" data-act="topup" data-amt="${a}">${icon('plus')}${money(a)}</button>`).join('')}</div>
          <h2 class="h3 mt">Redeem a gift card</h2>
          <form class="inline-form" data-form="giftcard"><label for="gc" class="sr-only">Gift card code</label><input id="gc" name="code" placeholder="Gift card code" ${j.claims.giftcard ? 'disabled' : ''}><button class="btn btn-ink" ${j.claims.giftcard ? 'disabled' : ''}>Redeem</button></form>
          <p class="tiny muted">${j.claims.giftcard ? 'Sample gift card already redeemed.' : `One-time sample code: ${C.sampleGiftCard.code} (${money(C.sampleGiftCard.amount)}). No real gift-card validation.`}</p></section>
        <section class="card"><div class="sect-head"><h2 class="h3">Recent wallet activity</h2><a class="link small" href="#/activity">All activity</a></div>
          ${acts.length ? `<ul class="act-list compact">${acts.map(a => `<li><div><strong>${esc(a.text)}</strong><small>${new Date(a.at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</small></div><span class="act-amt ${a.amount < 0 ? 'neg' : 'pos'}">${a.amount > 0 ? '+' : ''}${money(a.amount)}</span></li>`).join('')}</ul>` : '<p class="muted">No wallet activity yet.</p>'}</section></div>`;
  };

  V.pass = function () {
    if (!M.isMember()) return memberGate('Member pass');
    const j = M.J(); const tier = M.tierOf(j);
    return `${pageHead('Member pass', 'Show this at the counter to earn on in-store orders.', '#/rewards')}
      <div class="pass-wrap"><article class="pass"><div class="pass-top"><div class="logo-word light">MOD<span>rewards</span></div>${pill(esc(tier.name), 'pill-gold')}</div>
        <div class="pass-name">${esc(j.profile.name || 'Member')}</div><div class="pass-pts"><strong>${j.points.toLocaleString()}</strong> pts available</div>
        <div class="pass-code">${U.barcodeSVG(j.memberId)}<span>${esc(j.memberId)}</span></div>
        <p class="pass-foot">${j.enrolled ? 'Enrolled member' : 'Sample rewards profile'} · Sample barcode for demonstration — not scannable.</p></article></div>`;
  };

  /* ---------------- ACCOUNT ---------------- */
  V.account = function () {
    const j = M.J(), member = M.isMember(), sh = M.S.shared; const p = j.profile;
    const fe = st.fieldErrors || {};
    const f = (id, label, type, val, extra = '') => `<div class="field ${fe['p-' + id] ? 'has-err' : ''}"><label for="p-${id}">${label}</label><input id="p-${id}" name="${id}" type="${type}" value="${attr(val || '')}" ${extra} ${fe['p-' + id] ? `aria-invalid="true" aria-describedby="p-${id}-e"` : ''}>${fe['p-' + id] ? `<p class="err" id="p-${id}-e">${esc(fe['p-' + id])}</p>` : ''}</div>`;
    const link = (href, ic, t, s) => `<a class="mini-link" href="${href}">${icon(ic)}<span><strong>${t}</strong><small>${s}</small></span>${icon('chevR')}</a>`;
    return `${pageHead('Account', member ? `${esc(p.name)} · ${j.enrolled ? 'Enrolled member' : 'Sample rewards profile'}` : 'Guest on this browser')}
      <section class="journey-card card" aria-labelledby="jh"><div><h2 id="jh" class="h3">${icon('users')}Demo journey</h2><p class="small muted">Switch between a guest and the sample member to explore both experiences. This is not real sign-in. Your cart and scheduled time carry over; coupons, rewards and payment selections reset.</p></div>
        <div class="seg" role="radiogroup" aria-label="Demo journey"><button class="seg-btn ${!member ? 'on' : ''}" role="radio" aria-checked="${!member}" data-act="journey" data-j="guest">${icon('user')}Guest</button><button class="seg-btn ${member ? 'on' : ''}" role="radio" aria-checked="${member}" data-act="journey" data-j="member">${icon('star')}Sample member</button></div>
        ${sh.groupCheckout ? '<p class="small warn-text">Switching is blocked while a group checkout is locked.</p>' : ''}</section>
      <div class="two-col">
        <section class="card"><h2 class="h3">${member ? 'Profile' : 'Guest contact details'}</h2>
          <form data-form="profile" novalidate>
            <div class="fgrid">${f('name', 'Full name', 'text', p.name, 'autocomplete="name"')}${f('email', 'Email', 'email', p.email, 'autocomplete="email"')}${f('phone', 'Phone', 'tel', p.phone, 'autocomplete="tel"')}${member ? f('birthday', 'Birthday <span class="opt">optional</span>', 'date', p.birthday) : ''}</div>
            ${member ? `<label class="check-row"><input type="checkbox" name="marketing" ${p.marketing ? 'checked' : ''}><span>Email me offers and news from MOD <small class="muted">(optional — you can change this anytime)</small></span></label>` : ''}
            <button class="btn btn-primary" type="submit">Save ${member ? 'profile' : 'details'}</button></form></section>
        <aside>
          ${member ? (!j.enrolled ? `<section class="card enroll-cta"><h2 class="h3">${icon('sparkle')}Finish enrollment</h2><p class="small">You’re using the sample rewards profile. Enroll to make it yours.</p><a class="btn btn-primary btn-sm" href="#/join">Enroll now</a></section>`
            : `<section class="card"><h2 class="h3">${icon('check')}Enrolled</h2><p class="small muted">Member ID ${esc(j.memberId)}</p></section>`) : ''}
          <nav class="mini-links" aria-label="Account shortcuts">
            ${link('#/addresses', 'pin', 'Saved addresses', `${j.addresses.length} saved`)}${link('#/favorites', 'heart', 'Favorites & saved pizzas', `${j.favorites.length} favorites${member ? ` · ${j.savedPizzas.length} pizzas` : ''}`)}
            ${link('#/orders?tab=all', 'receipt', 'Orders & receipts', `${j.orders.length} orders`)}${link('#/offers?tab=saved', 'tag', 'Saved offers', `${j.savedOffers.length} saved`)}${link('#/groups', 'users', 'Group orders', 'Host-paid group orders')}
            ${member ? link('#/rewards', 'star', 'Rewards', `${j.points.toLocaleString()} pts`) + link('#/wallet', 'wallet', 'Wallet', money(j.wallet.gift)) + link('#/pass', 'card', 'Member pass', 'Barcode & ID') + link('#/activity', 'clock', 'Activity', 'Points & wallet history') : ''}
          </nav>
          <section class="card subtle"><h2 class="h3">Demo data</h2><p class="small muted">Everything is stored in this browser${M.storageOK() ? '' : ' (storage unavailable — using memory only)'}.</p><button class="btn btn-sm btn-outline danger" data-act="reset-demo">Reset all demo data</button></section>
        </aside></div>`;
  };

  V.join = function () {
    if (!M.isMember()) return memberGate('Join MOD Rewards');
    const j = M.J(); const fe = st.fieldErrors || {};
    if (j.enrolled) return pageHead('You’re enrolled', '', '#/account') + empty('check', 'Enrollment complete', `Member ID ${esc(j.memberId)}. Your pass is ready.`, '<a class="btn btn-primary" href="#/pass">Open member pass</a>');
    const d = st.joinDraft || { name: j.profile.name, email: j.profile.email, marketing: false };
    return `${pageHead('Join MOD Rewards', 'Sample enrollment — no account is created and nothing is sent.', '#/account')}
      <div class="two-col"><form class="card" data-form="enroll" novalidate>
        <div class="field ${fe['e-name'] ? 'has-err' : ''}"><label for="e-name">Full name</label><input id="e-name" name="name" value="${attr(d.name)}" autocomplete="name" ${fe['e-name'] ? 'aria-invalid="true" aria-describedby="e-name-e"' : ''}>${fe['e-name'] ? `<p class="err" id="e-name-e">${esc(fe['e-name'])}</p>` : ''}</div>
        <div class="field ${fe['e-email'] ? 'has-err' : ''}"><label for="e-email">Email</label><input id="e-email" name="email" type="email" value="${attr(d.email)}" autocomplete="email" ${fe['e-email'] ? 'aria-invalid="true" aria-describedby="e-email-e"' : ''}>${fe['e-email'] ? `<p class="err" id="e-email-e">${esc(fe['e-email'])}</p>` : ''}</div>
        <label class="check-row"><input type="checkbox" name="marketing" ${d.marketing ? 'checked' : ''}><span>Yes, send me offers and news by email <small class="muted">(optional)</small></span></label>
        <div class="btn-row"><button class="btn btn-primary" type="submit">Complete enrollment</button><button class="btn btn-ghost" type="button" data-act="enroll-cancel">Cancel</button></div></form>
        <aside class="card"><h2 class="h3">What you get</h2><ul class="ticks"><li>${M.CONFIG.pointsPerDollar} points per $1 on food</li><li>Free pizza at ${M.CONFIG.pizzaRewardCost.toLocaleString()} points</li><li>Silver and Gold earning multipliers</li><li>Member coupons, wallet and digital pass</li></ul><p class="tiny muted">Enrollment doesn’t award points or funds by itself.</p></aside></div>`;
  };

  V.addresses = function () {
    const j = M.J(); const editing = st.addrEdit ? j.addresses.find(a => a.id === st.addrEdit) : null; const fe = st.fieldErrors || {};
    return `${pageHead('Saved addresses', M.isMember() ? 'Member addresses' : 'Guest addresses on this browser', '#/account')}
      <div class="two-col"><section>${j.addresses.length ? `<ul class="addr-list">${j.addresses.map(a => `<li class="addr ${a.id === j.selectedAddressId ? 'sel' : ''}">
          <button class="addr-pick" data-act="addr-select" data-id="${a.id}" aria-pressed="${a.id === j.selectedAddressId}">${icon(a.id === j.selectedAddressId ? 'check' : 'pin')}</button>
          <div><strong>${esc(a.label)}</strong>${a.id === j.selectedAddressId ? ' ' + pill('Selected', 'pill-ok') : ''}<p>${esc(a.line)}</p>${a.instructions ? `<small class="muted">${esc(a.instructions)}</small>` : ''}</div>
          <div class="btn-row"><button class="btn btn-sm btn-ghost" data-act="addr-edit" data-id="${a.id}">${icon('edit')}Edit</button><button class="btn btn-sm btn-ghost danger" data-act="addr-remove" data-id="${a.id}">${icon('trash')}Remove</button></div></li>`).join('')}</ul>`
        : empty('pin', 'No saved addresses', 'Add one for faster delivery checkout.')}</section>
        <form class="card" data-form="address" novalidate><h2 class="h3">${editing ? 'Edit address' : 'Add an address'}</h2>
          <div class="field ${fe['a-label'] ? 'has-err' : ''}"><label for="a-label">Name</label><input id="a-label" name="label" placeholder="Home, Work…" value="${attr(editing ? editing.label : '')}">${fe['a-label'] ? `<p class="err">${esc(fe['a-label'])}</p>` : ''}</div>
          <div class="field ${fe['a-line'] ? 'has-err' : ''}"><label for="a-line">Address</label><input id="a-line" name="line" autocomplete="street-address" value="${attr(editing ? editing.line : '')}">${fe['a-line'] ? `<p class="err">${esc(fe['a-line'])}</p>` : ''}</div>
          <div class="field"><label for="a-ins">Delivery instructions <span class="opt">optional</span></label><textarea id="a-ins" name="instructions" rows="2">${esc(editing ? editing.instructions : '')}</textarea></div>
          <div class="btn-row"><button class="btn btn-primary" type="submit">${editing ? 'Save changes' : 'Add address'}</button>${editing ? '<button type="button" class="btn btn-ghost" data-act="addr-cancel">Cancel</button>' : ''}</div>
          <p class="tiny muted">Local text entry only — no live address verification.</p></form></div>`;
  };

  V.favorites = function () {
    const j = M.J(); const favs = j.favorites.map(id => M.PROD[id]).filter(p => p && M.isPublished(p));
    const store = M.curStore();
    return `${pageHead('Favorites & saved pizzas', '', '#/account')}
      <section class="sect"><div class="sect-head"><h2>Saved pizzas</h2>${M.isMember() ? '<a class="link" href="#/item/p-cyo">Build a new one</a>' : ''}</div>
        ${!M.isMember() ? note('Saving named pizzas is a member feature. <button class="link-btn" data-act="journey" data-j="member">Switch to the sample member</button>.') :
          j.savedPizzas.length ? `<div class="saved-grid">${j.savedPizzas.map(sp => { const line = { productId: sp.productId, config: sp.config, qty: 1 }; const iss = M.lineIssues(line, store, M.S.shared.mode);
            return `<article class="saved"><div class="saved-art">${U.pizzaSVG(sp.config)}</div><div><h3>${esc(sp.name)}</h3><p class="small muted">${esc(M.describe(line).join(' · ') || 'Standard recipe')}</p>
              <p class="small"><strong>${money(M.unitPrice(line, store))}</strong> at ${esc(store.name)}</p>${iss.length ? `<p class="small err">${esc(iss[0])}</p>` : ''}
              <div class="btn-row"><a class="btn btn-sm btn-primary" href="#/item/${sp.productId}?saved=${sp.id}">Use</a><button class="btn btn-sm btn-ghost danger" data-act="saved-remove" data-id="${sp.id}">${icon('trash')}Remove</button></div></div></article>`; }).join('')}</div>`
            : empty('heart', 'No saved pizzas yet', 'Build a pizza and tap “Save recipe” to keep it here.', '<a class="btn btn-primary" href="#/item/p-cyo">Build a pizza</a>')}</section>
      <section class="sect"><div class="sect-head"><h2>Favorite menu items</h2></div>
        ${favs.length ? `<div class="pgrid">${favs.map(productCard).join('')}</div>` : empty('heart', 'No favorites yet', 'Tap the heart on any menu item.', '<a class="btn btn-primary" href="#/menu">Browse menu</a>')}</section>`;
  };

  /* ---------------- GROUPS ---------------- */
  V.groups = function () {
    const j = M.J(); const mine = M.S.groups.filter(g => g.owner === M.S.shared.journey);
    const { store, sh } = contextSummary();
    return `${pageHead('Group orders', 'One host pays. Everyone picks their own food. Tax, delivery and tip are applied once.')}
      <div class="two-col wide-left"><section>${mine.length ? `<div class="olist">${mine.map(g => {
          const n = g.participants.reduce((s, p) => s + p.items.reduce((a, l) => a + l.qty, 0), 0);
          return `<article class="ocard"><div class="ocard-top"><div><h3><a href="#/group/${g.id}">${esc(g.name)}</a></h3><p class="muted">${esc(M.STORE[g.storeId].name)} · ${g.mode === 'delivery' ? 'Delivery' : 'Pickup'} · ${g.participants.length} people · ${n} items</p></div>${groupStatusPill(g)}</div>
            <div class="ocard-foot"><span class="small muted">${g.status === 'open' ? `Selections close ${esc(M.fmtTime(g.deadline, M.STORE[g.storeId].tz))}` : ''}</span><a class="btn btn-sm btn-primary" href="#/group/${g.id}">Open</a></div></article>`; }).join('')}</div>`
        : empty('users', 'No group orders yet', 'Create one, share the link, and let everyone add their own food.')}</section>
        <form class="card" data-form="group-create" novalidate><h2 class="h3">${icon('plus')}New group order</h2>
          <div class="field"><label for="g-name">Group name</label><input id="g-name" name="name" placeholder="Friday team lunch" required></div>
          <div class="field"><label for="g-host">Your name (host)</label><input id="g-host" name="host" value="${attr(j.profile.name || '')}" required></div>
          <div class="fgrid two"><div class="field"><label for="g-budget">Food budget per person</label><select id="g-budget" name="budget"><option value="0">No limit</option><option value="1500">$15</option><option value="2000" selected>$20</option><option value="3000">$30</option></select></div>
          <div class="field"><label for="g-deadline">Selections close in</label><select id="g-deadline" name="deadline"><option value="15">15 minutes</option><option value="30" selected>30 minutes</option><option value="60">1 hour</option><option value="120">2 hours</option></select></div></div>
          <div class="inherit">${icon('info')}<span>Uses your current setup: <strong>${sh.mode === 'delivery' ? 'Delivery' : 'Pickup'}</strong> from <strong>${esc(store.name)}</strong>, ${esc(contextSummary().time)}.</span></div>
          <button class="btn btn-primary btn-block" type="submit">Create group</button>
          <p class="tiny muted">Invitations, cross-device sync and individual payments aren’t implemented. Participants join via same-browser windows.</p></form></div>`;
  };
  function groupStatusPill(g) {
    if (g.status === 'placed') return pill('Placed', 'pill-ok');
    if (g.status === 'canceled') return pill('Canceled', 'pill-muted');
    if (g.status === 'locked') return pill('Locked for checkout', 'pill-warn');
    if (Date.now() > g.deadline) return pill('Selections closed', 'pill-warn');
    return pill('Open', 'pill-live');
  }
  V.group = function (id, q, participantMode) {
    const g = M.getGroup(id);
    if (!g) return pageHead('Group not found', '', '#/groups') + empty('users', 'Group not found', 'This group link isn’t available in this browser.', participantMode ? '' : '<a class="btn btn-primary" href="#/groups">Your groups</a>');
    const store = M.STORE[g.storeId];
    const isHostWin = !participantMode && g.owner === M.S.shared.journey;
    const meId = participantMode ? q.p : (st.actingAs[g.id] || 'host');
    const closed = M.groupLocked(g);
    const hostBeat = Number(window.__hostBeat ? window.__hostBeat() : 0);
    const hostOnline = !participantMode || (Date.now() - hostBeat < 8000);
    const canEdit = (p) => !closed && hostOnline && (isHostWin || p.id === meId);
    const issues = isHostWin ? M.groupCheckIssues(g) : [];
    const total = g.participants.reduce((s, p) => s + M.participantSubtotal(g, p), 0);
    const pcard = (p) => {
      const sub = M.participantSubtotal(g, p); const over = g.budget && sub > g.budget; const me = p.id === meId;
      const editable = canEdit(p);
      return `<article class="pcp ${me ? 'me' : ''} ${p.ready ? 'ready' : ''}"><div class="pcp-head"><div class="avatar" aria-hidden="true">${esc(p.name.slice(0, 1).toUpperCase())}</div><div><h3>${esc(p.name)}${p.host ? ' ' + pill('Host', 'pill-red') : ''}${me && !p.host ? ' ' + pill('You', 'pill-info') : ''}</h3>
          <p class="small ${over ? 'err' : 'muted'}">${money(sub)}${g.budget ? ` of ${money(g.budget)} budget` : ''}${over ? ' · over budget' : ''}</p></div>
          <span class="ready-badge">${p.ready ? icon('check') + 'Ready' : 'Choosing…'}</span></div>
        ${g.budget ? `<div class="meter sm ${over ? 'over' : ''}" role="progressbar" aria-label="${attr(p.name)} budget used" aria-valuemin="0" aria-valuemax="${g.budget}" aria-valuenow="${sub}"><span style="width:${Math.min(100, sub / g.budget * 100)}%"></span></div>` : ''}
        ${p.items.length ? `<ul class="pcp-items">${p.items.map(l => { const pr = M.PROD[l.productId]; const iss = M.lineIssues(l, store, g.mode);
          return `<li><div><strong>${l.qty}× ${esc(pr.name)}</strong>${M.describe(l).length ? `<small>${esc(M.describe(l).join(' · '))}</small>` : ''}${l.note ? `<small>Note: ${esc(l.note)}</small>` : ''}${iss.length ? `<small class="err">${esc(iss[0])}</small>` : ''}</div>
            <span>${money(M.unitPrice(l, store) * l.qty)}</span>${editable ? `<div class="btn-row"><div class="stepper sm" role="group" aria-label="Quantity"><button data-act="g-qty" data-g="${g.id}" data-p="${p.id}" data-uid="${l.uid}" data-d="-1" aria-label="Decrease">${icon('minus')}</button><span>${l.qty}</span><button data-act="g-qty" data-g="${g.id}" data-p="${p.id}" data-uid="${l.uid}" data-d="1" aria-label="Increase">${icon('plus')}</button></div>
              ${pr.builder ? `<a class="btn btn-sm btn-ghost" href="#/item/${pr.id}?group=${g.id}&p=${p.id}&gedit=${l.uid}">${icon('edit')}Edit</a>` : ''}<button class="btn btn-sm btn-ghost" data-act="g-note" data-g="${g.id}" data-p="${p.id}" data-uid="${l.uid}">Note</button><button class="btn btn-sm btn-ghost danger" data-act="g-remove-item" data-g="${g.id}" data-p="${p.id}" data-uid="${l.uid}" aria-label="Remove ${attr(pr.name)}">${icon('trash')}</button></div>` : ''}</li>`; }).join('')}</ul>`
          : '<p class="small muted">No food added yet.</p>'}
        <div class="btn-row">${editable ? `<a class="btn btn-sm btn-primary" href="#/menu?group=${g.id}&p=${p.id}">${icon('plus')}Add food</a><button class="btn btn-sm ${p.ready ? 'btn-outline' : 'btn-ink'}" data-act="g-ready" data-g="${g.id}" data-p="${p.id}">${p.ready ? 'Reopen my picks' : 'Mark ready'}</button>` : ''}
          ${isHostWin && !p.host && g.status === 'open' ? `<button class="btn btn-sm btn-ghost" data-act="g-window" data-g="${g.id}" data-p="${p.id}">${icon('external')}Open as ${esc(p.name)}</button><button class="btn btn-sm btn-ghost" data-act="g-copy" data-g="${g.id}" data-p="${p.id}">${icon('link')}Copy link</button><button class="btn btn-sm btn-ghost danger" data-act="g-remove-p" data-g="${g.id}" data-p="${p.id}">Remove</button>` : ''}</div></article>`;
    };
    return `${participantMode ? `<div class="participant-bar">${icon('users')}<span>Participant view for <strong>${esc((g.participants.find(p => p.id === meId) || {}).name || 'guest')}</strong> · syncs with the host’s window on this browser</span><span class="host-dot ${hostOnline ? 'on' : ''}">${hostOnline ? 'Host connected' : 'Host window closed — changes paused'}</span></div>` : ''}
      ${pageHead(esc(g.name), `${groupStatusPill(g)} · ${esc(store.name)} · ${g.mode === 'delivery' ? 'Delivery' : 'Pickup'} · ${esc(M.scheduleText(g.schedule, store))}`, participantMode ? null : '#/groups')}
      ${g.status === 'placed' ? note(`This group order was placed as <a href="#/order/${g.orderId}">${esc(g.orderId)}</a>.`, 'info') : ''}
      ${g.status === 'canceled' ? note('This group order was canceled.', 'warn') : ''}
      ${g.status === 'locked' ? note(isHostWin ? 'Selections are locked while you check out. <a href="#/checkout">Continue to checkout</a> or reopen to allow changes.' : 'The host is checking out. Selections are locked.', 'warn') : ''}
      ${g.status === 'open' && closed ? note(`Selections closed at ${esc(M.fmtTime(g.deadline, store.tz))}.${isHostWin ? ' Extend the deadline to allow more changes.' : ''}`, 'warn') : ''}
      <div class="two-col wide-left"><section><div class="pcp-list">${g.participants.map(pcard).join('')}</div>
          ${isHostWin && g.status === 'open' ? `<form class="inline-form card" data-form="g-add-p" data-g="${g.id}"><label for="gp-name" class="sr-only">Participant name</label><input id="gp-name" name="name" placeholder="Add a participant by name" required><button class="btn btn-ink" type="submit">${icon('plus')}Add</button></form>` : ''}</section>
        <aside class="co-side"><section class="card"><h2 class="h3">Group summary</h2>
          <dl class="dl"><dt>Deadline</dt><dd>${esc(M.fmtTime(g.deadline, store.tz, { date: true }))}${g.status === 'open' ? `<br><small class="countdown" data-deadline="${g.deadline}"></small>` : ''}</dd><dt>Budget</dt><dd>${g.budget ? money(g.budget) + ' per person' : 'No limit'}</dd>
            ${g.address && g.mode === 'delivery' ? `<dt>Deliver to</dt><dd>${esc(g.address.line)}</dd>` : ''}<dt>Food subtotal</dt><dd><strong>${money(total)}</strong></dd><dt>Ready</dt><dd>${g.participants.filter(p => p.ready).length} of ${g.participants.length}</dd></dl>
          ${isHostWin ? `${!participantMode && g.status === 'open' ? `<div class="field"><label for="act-as">Act as (local demo)</label><select id="act-as" data-act="g-act-as" data-g="${g.id}">${g.participants.map(p => `<option value="${p.id}" ${p.id === meId ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select></div>` : ''}
            ${g.status === 'open' ? `${issues.length ? `<ul class="issues">${issues.map(i => `<li>${icon('alert')}${esc(i)}</li>`).join('')}</ul>` : '<p class="elig ok">' + icon('check') + 'Ready for host checkout</p>'}
              <button class="btn btn-primary btn-block" data-act="g-checkout" data-g="${g.id}" ${issues.length ? 'aria-disabled="true"' : ''}>Check out group · ${money(total)}+</button>` : ''}
            ${g.status === 'locked' ? `<a class="btn btn-primary btn-block" href="#/checkout">Continue checkout</a><button class="btn btn-outline btn-block" data-act="g-reopen" data-g="${g.id}">Reopen selections</button>` : ''}
            ${g.status === 'open' || g.status === 'locked' ? `<div class="btn-row"><button class="btn btn-sm btn-ghost" data-act="g-extend" data-g="${g.id}">${icon('clock')}+15 min</button><button class="btn btn-sm btn-ghost danger" data-act="g-cancel" data-g="${g.id}">Cancel group</button></div>` : ''}
            <p class="tiny muted">Tax, delivery and tip are applied once at host checkout. One offer or reward for the whole order. Points go to the paying member host.</p>` : ''}
        </section></aside></div>`;
  };

  /* ---------------- SUPPORT ---------------- */
  V.support = function (id) {
    const f = M.findOrder(id);
    if (!f) return pageHead('Help', '', '#/orders') + empty('help', 'Order not found', 'Choose an order from your history to get help.', '<a class="btn btn-primary" href="#/orders?tab=all">Your orders</a>');
    const o = f.order; const s = M.stageOf(o);
    const canRate = s.done && !o.canceled;
    const types = [['late', 'Late delivery'], ['missing', 'Missing or incorrect items'], ['question', 'Question about my order'], ['refund', 'Request a refund']];
    const fb = o.feedback || {};
    return `${pageHead('Order help', `${esc(o.id)} · ${esc(o.storeName)} · ${esc(s.label)}`, `#/order/${o.id}`)}
      <div class="two-col"><div>
        <form class="card" data-form="support" data-id="${o.id}" novalidate><h2 class="h3">${icon('help')}What went wrong?</h2>
          <fieldset class="radio-cards"><legend class="sr-only">Issue type</legend>${types.map(([v, l], i) => `<label class="rcard"><input type="radio" name="type" value="${v}" ${i === 0 ? 'checked' : ''} ${v === 'refund' && (o.canceled || o.refund) ? 'disabled' : ''}><span>${l}</span></label>`).join('')}</fieldset>
          <div class="field"><label for="sp-msg">Tell us more</label><textarea id="sp-msg" name="message" rows="4" required placeholder="Share any details that help us make it right."></textarea></div>
          <button class="btn btn-primary" type="submit">Send to support</button>
          <p class="tiny muted">Saved on this browser. A refund request goes to review — it isn’t an instant cancellation. Partial refunds aren’t supported in this prototype.</p></form>
        <section class="card" id="feedback"><h2 class="h3">${icon('star')}${o.feedback ? 'Your rating' : 'Rate this order'}</h2>
          ${canRate ? `<form data-form="feedback" data-id="${o.id}"><fieldset class="stars"><legend class="sr-only">Rating</legend>${[1, 2, 3, 4, 5].map(n => `<input type="radio" id="star${n}" name="rating" value="${n}" ${fb.rating === n ? 'checked' : ''}><label for="star${n}" title="${n} star${n > 1 ? 's' : ''}"><span class="sr-only">${n} star${n > 1 ? 's' : ''}</span>${icon('star')}</label>`).join('')}</fieldset>
            <div class="field"><label for="fb-c">Comments <span class="opt">optional</span></label><textarea id="fb-c" name="comment" rows="3">${esc(fb.comment || '')}</textarea></div>
            <button class="btn btn-primary" type="submit">${o.feedback ? 'Update feedback' : 'Submit feedback'}</button>${o.feedback ? `<span class="tiny muted"> Last saved ${new Date(o.feedback.at).toLocaleString()}</span>` : ''}</form>`
            : `<p class="muted small">${o.canceled ? 'Canceled orders can’t be rated.' : 'You can rate this order once it’s completed.'}</p>`}
        </section></div>
        <aside class="co-side"><section class="card"><h2 class="h3">Requests</h2>${o.support.length ? `<ul class="req-list">${o.support.map(r => `<li><strong>${esc(r.id)}</strong> · ${esc({ late: 'Late delivery', missing: 'Missing/incorrect items', question: 'Question', refund: 'Refund request' }[r.type] || r.type)}<br><small class="muted">${new Date(r.at).toLocaleString()}</small><p>${esc(r.message)}</p>${pill(esc(r.status), 'pill-info')}</li>`).join('')}</ul>` : '<p class="muted small">No requests yet.</p>'}</section>
          <section class="card"><h2 class="h3">${icon('chat')}Live help</h2><p class="small muted">Chat with simulated delivery support.</p><button class="btn btn-outline btn-block" data-act="chat-open" data-id="${o.id}">Open chat</button><a class="btn btn-ghost btn-block" href="tel:+12065550100">${icon('phone')}Call support (sample)</a></section></aside></div>`;
  };

  V.notFound = () => pageHead('Page not found') + empty('search', 'We couldn’t find that page', 'The link may be outdated.', '<a class="btn btn-primary" href="#/">Go home</a>');

  window.VIEWS = V;
})();
