/* MOD Customer Prototype — product builders, after-order topping editor and setup dialogs. */
(function () {
  'use strict';
  const M = window.MOD, U = window.UI, V = window.VIEWS;
  const { esc, attr, icon, dietBadge } = U;
  const { money } = M;
  const D = window.MOD_DATA;

  /* ================= Builder state ================= */
  let B = null; // { key, productId, config, qty, edit, target, savedId, side, note }
  const A = { orderId: null, lineUid: null, config: null, side: 'left', busy: false };

  function initBuilder(id, q) {
    const key = id + '|' + JSON.stringify(q);
    if (B && B.key === key) return B;
    const p = M.PROD[id];
    let config = M.defaultConfig(p), qty = 1, note = '';
    if (q.edit) { const l = M.S.shared.cart.lines.find(x => x.uid === q.edit); if (l && l.productId === id) { config = M.clone(l.config); qty = l.qty; } }
    if (q.group && q.gedit) { const g = M.getGroup(q.group); const pp = g && g.participants.find(x => x.id === q.p); const l = pp && pp.items.find(x => x.uid === q.gedit); if (l) { config = M.clone(l.config); qty = l.qty; note = l.note || ''; } }
    if (q.saved) { const sp = M.J().savedPizzas.find(x => x.id === q.saved); if (sp) config = M.clone(sp.config); }
    B = { key, productId: id, config, qty, edit: q.edit || null, target: q.group ? { g: q.group, p: q.p, gedit: q.gedit || null } : null, savedId: q.saved || null, side: 'left', note };
    return B;
  }
  const recipeOf = (cfg, side) => (cfg.split && cfg.halves ? cfg.halves[side] : cfg.whole);

  /* ---------- Shared ingredient controls ---------- */
  const AMTS = [['light', 'Light'], ['regular', 'Regular'], ['extra', 'Extra']];
  const PLACES = [['left', 'Left ½'], ['whole', 'Whole'], ['right', 'Right ½']];
  function segRadios(name, opts, cur, act, data, label) {
    return `<div class="mini-seg" role="radiogroup" aria-label="${attr(label)}">${opts.map(([v, l]) => `<button type="button" role="radio" aria-checked="${cur === v}" class="${cur === v ? 'on' : ''}" data-act="${act}" data-v="${v}" ${data}>${l}</button>`).join('')}</div>`;
  }
  function placeIcon(pl) { return `<span class="place-ico p-${pl}" aria-hidden="true"></span>`; }

  function sauceBlock(ns, rec, opts) {
    const store = opts.store;
    return `<div class="opt-grid sauces" role="radiogroup" aria-label="Sauce">${D.SAUCES.map(id => {
      const ing = M.ING[id]; const out = M.ingOut(id, store); const on = rec.sauce.id === id;
      return `<button type="button" role="radio" aria-checked="${on}" class="opt ${on ? 'on' : ''}" data-act="${ns}-sauce" data-id="${id}" ${out ? 'disabled aria-disabled="true"' : ''}>
        <span class="swatch" style="background:${ing.color || 'repeating-linear-gradient(45deg,#eee,#eee 4px,#fff 4px,#fff 8px)'}"></span><span>${esc(ing.name)}</span>${out ? '<small>Unavailable</small>' : ''}</button>`;
    }).join('')}</div>
    ${rec.sauce.id !== 'no-sauce' ? `<div class="sub-ctrls">${opts.placement ? segRadios('sp', PLACES, rec.sauce.place || 'whole', `${ns}-sauce-place`, '', 'Sauce placement') : ''}${segRadios('sa', AMTS, rec.sauce.amt, `${ns}-sauce-amt`, '', 'Sauce amount')}</div>` : ''}`;
  }
  function itemRows(ns, rec, ids, opts) {
    const store = opts.store;
    return `<ul class="ing-list">${ids.map(id => {
      const ing = M.ING[id]; const sel = rec.items.find(i => i.id === id); const out = M.ingOut(id, store);
      const limitHit = opts.limit != null && !sel && ing.type !== 'cheese' && M.countToppings(rec.items) >= opts.limit;
      const newOnly = opts.noNewPlacement;
      return `<li class="ing ${sel ? 'on' : ''} ${out ? 'out' : ''}">
        <button type="button" class="ing-toggle" data-act="${ns}-item" data-id="${id}" aria-pressed="${!!sel}" ${out ? 'disabled aria-disabled="true"' : ''} ${limitHit ? 'aria-disabled="true" data-limit="1"' : ''}>
          <span class="ing-dot" style="--c:${ing.color || '#ccc'}"></span><span class="ing-name">${esc(ing.name)}</span>
          ${out ? '<small class="err">Unavailable here</small>' : limitHit ? '<small>Limit reached</small>' : sel ? `<small>${sel.amt !== 'regular' ? esc(sel.amt[0].toUpperCase() + sel.amt.slice(1)) : ''}${sel.place && sel.place !== 'whole' ? ' ' + placeIcon(sel.place) : ''}</small>` : ''}
          <span class="ing-check">${sel ? icon('check') : icon('plus')}</span></button>
        ${sel ? `<div class="sub-ctrls">${opts.placement && !(newOnly) ? segRadios('p', PLACES, sel.place || 'whole', `${ns}-item-place`, `data-id="${id}"`, `${ing.name} placement`) : ''}${segRadios('a', AMTS, sel.amt, `${ns}-item-amt`, `data-id="${id}"`, `${ing.name} amount`)}</div>` : ''}
      </li>`;
    }).join('')}</ul>`;
  }
  function recipeEditor(ns, cfg, side, opts) {
    const rec = recipeOf(cfg, side);
    const placement = !cfg.split && opts.placement !== false;
    const meats = D.PIZZA_TOPPINGS.filter(id => M.ING[id].type === 'meat'), veg = D.PIZZA_TOPPINGS.filter(id => M.ING[id].type === 'veggie');
    const o = Object.assign({}, opts, { placement });
    return `${opts.hideSauce ? '' : `<section class="bsect"><h3>Sauce</h3>${sauceBlock(ns, rec, o)}</section>`}
      <section class="bsect"><h3>Cheese <small>${rec.items.filter(i => M.ING[i.id].type === 'cheese').length} selected</small></h3>${itemRows(ns, rec, D.CHEESES, o)}</section>
      <section class="bsect"><h3>Meats</h3>${itemRows(ns, rec, meats, o)}</section>
      <section class="bsect"><h3>Veggies & more</h3>${itemRows(ns, rec, veg, o)}</section>
      <section class="bsect"><h3>Finishing sauces <small>drizzled after baking</small></h3>${itemRows(ns, rec, D.FINISHES, o)}</section>`;
  }

  /* ---------- Pizza builder view ---------- */
  function pizzaBuilder(p, store) {
    const cfg = B.config; const side = B.side;
    const limit = p.toppingLimit;
    const rec = recipeOf(cfg, side);
    const sizeOpt = (s) => `<button type="button" role="radio" aria-checked="${cfg.size === s.id}" class="opt big ${cfg.size === s.id ? 'on' : ''}" data-act="b-size" data-v="${s.id}"><strong>${s.name}</strong><small>${s.inch}</small><small>${s.adj ? (s.adj > 0 ? '+' : '−') + money(Math.abs(s.adj)) : 'Base price'}</small></button>`;
    const crustOpt = (c) => `<button type="button" role="radio" aria-checked="${cfg.crust === c.id}" class="opt big ${cfg.crust === c.id ? 'on' : ''}" data-act="b-crust" data-v="${c.id}"><strong>${c.name}</strong><small>${c.adj ? '+' + money(c.adj) : 'Included'}</small></button>`;
    return `<section class="bsect"><h3>Size</h3><div class="opt-grid" role="radiogroup" aria-label="Size">${M.CONFIG.sizes.map(sizeOpt).join('')}</div></section>
      <section class="bsect"><h3>Crust</h3><div class="opt-grid two" role="radiogroup" aria-label="Crust">${M.CONFIG.crusts.map(crustOpt).join('')}</div></section>
      ${p.splitAllowed ? `<section class="bsect split-sect"><h3>Recipe style</h3>
        <div class="seg full" role="radiogroup" aria-label="Recipe style"><button type="button" role="radio" class="seg-btn ${!cfg.split ? 'on' : ''}" aria-checked="${!cfg.split}" data-act="b-mode" data-v="whole">Whole pizza</button><button type="button" role="radio" class="seg-btn ${cfg.split ? 'on' : ''}" aria-checked="${cfg.split}" data-act="b-mode" data-v="split">Half & half</button></div>
        <p class="tiny muted">${cfg.split ? 'Each half gets its own sauce, cheese and toppings. Size and crust are shared. No split surcharge.' : 'Use Left ½ / Right ½ on any topping, or switch to Half & half for two fully independent recipes.'}</p>
        ${cfg.split ? `<div class="half-tabs" role="tablist" aria-label="Edit half">${['left', 'right'].map(s => `<button type="button" role="tab" aria-selected="${side === s}" class="half-tab ${side === s ? 'on' : ''}" data-act="b-side" data-v="${s}">${placeIcon(s)}${s === 'left' ? 'Left ½' : 'Right ½'}</button>`).join('')}</div>
          <div class="btn-row tight"><button type="button" class="btn btn-sm btn-ghost" data-act="b-copy">${icon('copy')}Copy ${side === 'left' ? 'left → right' : 'right → left'}</button><button type="button" class="btn btn-sm btn-ghost" data-act="b-swap">${icon('swap')}Swap halves</button><button type="button" class="btn btn-sm btn-ghost" data-act="b-clear-half">${icon('x')}Clear this half</button></div>` : ''}
      </section>` : (p.signature ? '<p class="tiny muted bnote">Half-and-half is available on Create Your Own. Two signature pizzas can’t be combined into one split pizza.</p>' : '')}
      ${limit != null ? `<div class="limit-bar ${M.countToppings(rec.items) >= limit ? 'full' : ''}" role="status">${icon('info')}<span>${M.countToppings(rec.items)} of ${limit} non-cheese topping used. Cheese doesn’t count.</span></div>` : ''}
      <div id="b-recipe" ${cfg.split ? `role="tabpanel" aria-label="${side === 'left' ? 'Left' : 'Right'} half recipe"` : ''}>${recipeEditor('b', cfg, side, { store, limit })}</div>`;
  }
  function saladBuilder(p, store) {
    const c = B.config;
    const radio = (name, list, cur, act, label) => `<div class="opt-grid" role="radiogroup" aria-label="${label}">${list.map(id => { const out = M.ingOut(id, store); return `<button type="button" role="radio" aria-checked="${cur === id}" class="opt ${cur === id ? 'on' : ''}" data-act="${act}" data-v="${id}" ${out ? 'disabled' : ''}>${esc(M.ING[id].name)}${out ? '<small>Unavailable</small>' : ''}</button>`; }).join('')}</div>`;
    const sz = c.size || 'mod';
    return `<section class="bsect"><h3>Size</h3><div class="opt-grid" role="radiogroup" aria-label="Salad size">${M.CONFIG.saladSizes.map(s => `<button type="button" role="radio" aria-checked="${sz === s.id}" class="opt big ${sz === s.id ? 'on' : ''}" data-act="s-size" data-v="${s.id}"><strong>${s.name}</strong><small>${s.sub}</small><small>${s.adj ? (s.adj > 0 ? '+' : '−') + money(Math.abs(s.adj)) : 'Base price'}</small></button>`).join('')}</div></section>
      <section class="bsect"><h3>Greens</h3>${radio('g', ['romaine', 'mixed', 'arugula-g'], c.greens, 's-greens', 'Greens')}</section>
      <section class="bsect"><h3>Dressing</h3>${radio('d', ['caesar', 'balsamic', 'champagne', 'oil-vinegar', 'ranch', 'no-dressing'], c.dressing, 's-dressing', 'Dressing')}</section>
      <section class="bsect"><h3>Toppings</h3><div class="chip-row">${D.SALAD_TOPPINGS.map(id => { const on = c.toppings.includes(id); const out = M.ingOut(id, store);
        return `<button type="button" class="chip tog ${on ? 'on' : ''}" aria-pressed="${on}" data-act="s-top" data-id="${id}" ${out ? 'disabled' : ''}>${on ? icon('check') : icon('plus')}${esc(M.ING[id].name)}${out ? ' · unavailable' : ''}</button>`; }).join('')}</div></section>`;
  }
  function kidsBuilder(p, store) {
    const c = B.config;
    const tops = ['cheese', 'pepperoni'];
    return `<section class="bsect"><h3>Mini pizza <small>cheese or pepperoni</small></h3><div class="opt-grid" role="radiogroup" aria-label="Kids pizza topping">${tops.map(id => { const on = c.topping === id; const out = id !== 'cheese' && M.ingOut(id, store);
        return `<button type="button" role="radio" aria-checked="${on}" class="opt ${on ? 'on' : ''}" data-act="k-top" data-v="${id}" ${out ? 'disabled' : ''}>${id === 'cheese' ? 'Cheese only' : esc(M.ING[id].name)}${out ? '<small>Unavailable</small>' : ''}</button>`; }).join('')}</div></section>
      <section class="bsect"><h3>Drink</h3><div class="opt-grid" role="radiogroup" aria-label="Kids drink">${D.KIDS_DRINKS.map(d => `<button type="button" role="radio" aria-checked="${c.drink === d.id}" class="opt ${c.drink === d.id ? 'on' : ''}" data-act="k-drink" data-v="${d.id}">${esc(d.name)}</button>`).join('')}</div></section>`;
  }
  function cakepopBuilder() {
    const c = B.config;
    const grp = (key, label) => `<section class="bsect"><h3>${label}</h3><div class="opt-grid two" role="radiogroup" aria-label="${label}">${D.CAKEPOP_FLAVORS.map(f => `<button type="button" role="radio" aria-checked="${c[key] === f.id}" class="opt ${c[key] === f.id ? 'on' : ''}" data-act="c-flavor" data-k="${key}" data-v="${f.id}"><span class="swatch round" style="background:${f.color}"></span>${esc(f.name)}</button>`).join('')}</div></section>`;
    return grp('f1', 'First cake pop') + grp('f2', 'Second cake pop');
  }

  function nutritionLabel(p, custom) {
    const n = p.nutrition;
    return `<details class="nutri"><summary>${icon('info')}Nutrition — standard recipe</summary>
      <table><tbody><tr><th scope="row">Calories</th><td>${n.cal}</td></tr><tr><th scope="row">Total fat</th><td>${n.fat} g</td></tr><tr><th scope="row">Carbohydrates</th><td>${n.carbs} g</td></tr><tr><th scope="row">Protein</th><td>${n.protein} g</td></tr><tr><th scope="row">Sodium</th><td>${n.sodium} mg</td></tr></tbody></table>
      <p class="tiny muted">Sample values for the standard recipe${p.cat === 'pizzas' ? ', Regular size, Original crust' : ''}. ${custom ? 'We don’t calculate verified totals for customized recipes.' : ''}</p></details>`;
  }

  function itemView(id, q) {
    const p = M.PROD[id];
    if (!p || !M.isPublished(p)) return V.notFound();
    initBuilder(id, q);
    const store = M.curStore(), sh = M.S.shared;
    const target = B.target; const g = target && M.getGroup(target.g); const gp = g && g.participants.find(x => x.id === target.p);
    const mode = g ? g.mode : sh.mode; const st = g ? M.STORE[g.storeId] : store;
    const line = { productId: p.id, config: B.config, qty: B.qty };
    const issue = M.productIssue(p, st, mode);
    const cfgIssues = M.configIssues(p, B.config, st);
    const unit = M.unitPrice(line, st);
    const diet = M.dietOf(line);
    const custom = p.builder && !M.sameConfig(B.config, M.defaultConfig(p));
    const showPhoto = p.img && !custom;
    const art = showPhoto ? U.artFor(p) : p.builder === 'pizza' ? U.pizzaSVG(B.config, { label: `Illustration of your ${p.name} pizza — not a product photo` }) : U.artFor(p, B.config);
    const back = g ? `#/group/${g.id}` : B.edit ? '#/cart' : '#/menu?cat=' + p.cat;
    const verb = g ? (target.gedit ? 'Update' : `Add for ${gp ? gp.name : 'participant'}`) : B.edit ? 'Update cart' : 'Add to cart';
    const builderHtml = p.builder === 'pizza' ? pizzaBuilder(p, st) : p.builder === 'salad' ? saladBuilder(p, st) : p.builder === 'kids' ? kidsBuilder(p, st) : p.builder === 'cakepop' ? cakepopBuilder() : '';
    const descLines = M.describe(line);
    const saved = B.savedId ? M.J().savedPizzas.find(s => s.id === B.savedId) : null;
    return `${g ? V.groupBanner() : ''}
      <a class="back-link" href="${back}">${icon('back')}<span>${g ? 'Back to group' : B.edit ? 'Back to cart' : 'Back to menu'}</span></a>
      <div class="builder ${p.builder ? '' : 'simple'}">
        <div class="b-visual"><div class="b-sticky">
          <div class="b-art ${p.builder === 'pizza' && !showPhoto ? 'is-pizza' : ''} ${showPhoto ? 'has-photo' : ''}">${art}</div>
          ${p.builder === 'pizza' ? `<p class="tiny muted center">${showPhoto ? 'Standard recipe photo. Customize it and we’ll switch to a live illustration of your build.' : 'Illustrative preview — reflects your toppings, portions and placement. Not product photography.'}</p>` : ''}
          ${descLines.length ? `<ul class="b-summary" aria-label="Your changes">${descLines.map(d => `<li>${esc(d)}</li>`).join('')}</ul>` : ''}
        </div></div>
        <div class="b-config">
          <header class="b-head"><span class="eyebrow">${esc(D.CATEGORIES.find(c => c.id === p.cat).name)}</span><h1 tabindex="-1">${esc(p.name)}</h1><p>${esc(p.desc)}</p>
            <div class="pcard-meta">${dietBadge(diet)}${diet !== p.diet ? `<span class="small muted">Standard recipe: ${U.DIET[p.diet].label}</span>` : ''}<span class="cal">${p.nutrition.cal} cal standard</span>${p.pickupOnly ? V.fragments.pill('Pickup only', 'pill-warn') : ''}</div>
            ${saved ? `<div class="note note-info">${icon('heart')}<div>Using saved recipe <strong>${esc(saved.name)}</strong> — current ${esc(st.name)} price and availability shown.</div></div>` : ''}
            ${(() => { const w = M.profileWarnings(line); return w.length ? `<div class="note note-warn pnote">${icon('alert')}<div><strong>Check your preferences:</strong> ${esc(w.join(' · '))}. <a href="#/account">Edit profile</a></div></div>` : ''; })()}
            ${issue ? V.fragments.note(esc(issue) + (issue.includes('Pickup only') ? ' Switch to pickup to order it.' : ''), 'err') : ''}
          </header>
          ${builderHtml}
          ${nutritionLabel(p, custom)}
          ${p.builder ? '<p class="tiny muted">Customizing may change dietary suitability. All food is prepared in shared kitchen areas.</p>' : ''}
          ${g ? `<div class="field"><label for="b-note">Note for ${esc(gp ? gp.name : '')}’s item <span class="optl">optional</span></label><input id="b-note" value="${attr(B.note)}" data-input="b-note" maxlength="80" placeholder="e.g. cut into squares"></div>` : ''}
          <div class="b-foot">
            ${cfgIssues.length ? `<p class="err b-err" role="alert">${icon('alert')}${esc(cfgIssues.join('; '))}</p>` : ''}
            <div class="b-foot-row">
              <div class="stepper lg" role="group" aria-label="Quantity"><button type="button" data-act="b-qty" data-d="-1" aria-label="Decrease quantity" ${B.qty <= 1 ? 'disabled' : ''}>${icon('minus')}</button><span aria-live="polite" aria-atomic="true"><span class="sr-only">Quantity </span>${B.qty}</span><button type="button" data-act="b-qty" data-d="1" aria-label="Increase quantity" ${B.qty >= 20 ? 'disabled' : ''}>${icon('plus')}</button></div>
              <button type="button" class="btn btn-primary btn-lg grow" data-act="b-submit" ${issue || cfgIssues.length ? 'aria-disabled="true"' : ''}>${esc(verb)} · ${money(unit * B.qty)}</button>
            </div>
            ${p.builder === 'pizza' && !g ? `<div class="btn-row tight">${M.isMember() ? `<button type="button" class="btn btn-sm btn-ghost" data-act="b-save">${icon('heart')}Save recipe</button>` : '<span class="tiny muted">Members can name and save pizzas.</span>'}${custom ? `<button type="button" class="btn btn-sm btn-ghost" data-act="b-reset">${icon('refresh')}Reset to standard</button>` : ''}</div>` : ''}
          </div>
        </div>
      </div>`;
  }

  /* ---------- Builder actions ---------- */
  function mutateRecipe(cfg, side, ns, act, el, p, store, toastFn) {
    const rec = recipeOf(cfg, side);
    const isWhole = !cfg.split;
    switch (act) {
      case 'sauce': { const id = el.dataset.id; rec.sauce = Object.assign({ id, amt: 'regular' }, isWhole ? { place: 'whole' } : {}); break; }
      case 'sauce-amt': rec.sauce.amt = el.dataset.v; break;
      case 'sauce-place': rec.sauce.place = el.dataset.v; break;
      case 'item': {
        const id = el.dataset.id; const i = rec.items.findIndex(x => x.id === id);
        if (i > -1) rec.items.splice(i, 1);
        else {
          if (M.ingOut(id, store)) { toastFn(`${M.ING[id].name} is unavailable at ${store.name}`, 'err'); return false; }
          const lim = p && p.toppingLimit;
          if (lim != null && M.ING[id].type !== 'cheese' && M.countToppings(rec.items) >= lim) { toastFn(`${p.name} allows ${lim} non-cheese topping. Remove one first, or build a Create Your Own.`, 'err'); return false; }
          rec.items.push(Object.assign({ id, amt: 'regular' }, isWhole ? { place: 'whole' } : {}));
        }
        break;
      }
      case 'item-amt': { const it = rec.items.find(x => x.id === el.dataset.id); if (it) it.amt = el.dataset.v; break; }
      case 'item-place': { const it = rec.items.find(x => x.id === el.dataset.id); if (it) it.place = el.dataset.v; break; }
      default: return false;
    }
    return true;
  }

  function builderAction(act, el, app) {
    if (!B) return false;
    const p = M.PROD[B.productId]; const c = B.config;
    const g = B.target && M.getGroup(B.target.g);
    const store = g ? M.STORE[g.storeId] : M.curStore();
    switch (act) {
      case 'b-size': c.size = el.dataset.v; break;
      case 'b-crust': c.crust = el.dataset.v; break;
      case 'b-mode':
        if (el.dataset.v === 'split') { if (!c.halves) c.halves = M.halvesFromWhole(c.whole); c.split = true; B.side = 'left'; U.announce('Half and half mode. Editing left half.'); }
        else { c.split = false; U.announce('Whole pizza mode. Your whole-pizza choices are restored.'); }
        break;
      case 'b-side': B.side = el.dataset.v; U.announce(`Editing ${B.side} half`); break;
      case 'b-copy': { const from = B.side, to = from === 'left' ? 'right' : 'left'; c.halves[to] = M.clone(c.halves[from]); U.toast(`Copied ${from} half to ${to} half`, 'info'); break; }
      case 'b-swap': { const t = c.halves.left; c.halves.left = c.halves.right; c.halves.right = t; U.toast('Halves swapped', 'info'); break; }
      case 'b-clear-half': c.halves[B.side] = { sauce: { id: 'no-sauce', amt: 'regular' }, items: [] }; U.announce(`${B.side} half cleared`); break;
      case 'b-qty': B.qty = Math.max(1, Math.min(20, B.qty + Number(el.dataset.d))); break;
      case 'b-reset': B.config = M.defaultConfig(p); B.side = 'left'; U.announce('Reset to the standard recipe'); break;
      case 's-size': c.size = el.dataset.v; break;
      case 's-greens': c.greens = el.dataset.v; break;
      case 's-dressing': c.dressing = el.dataset.v; break;
      case 's-top': { const id = el.dataset.id; const i = c.toppings.indexOf(id); if (i > -1) c.toppings.splice(i, 1); else c.toppings.push(id); break; }
      case 'k-top': c.topping = el.dataset.v; break;
      case 'k-drink': c.drink = el.dataset.v; break;
      case 'c-flavor': c[el.dataset.k] = el.dataset.v; break;
      case 'b-save': openSaveRecipe(app); return true;
      case 'b-submit': return submitBuilder(app);
      default:
        if (act.startsWith('b-')) { const ok = mutateRecipe(c, B.side, 'b', act.slice(2), el, p, store, U.toast); if (!ok) return true; }
        else return false;
    }
    app.render();
    return true;
  }
  function submitBuilder(app) {
    const p = M.PROD[B.productId]; const target = B.target;
    const g = target && M.getGroup(target.g);
    const store = g ? M.STORE[g.storeId] : M.curStore(); const mode = g ? g.mode : M.S.shared.mode;
    const issue = M.productIssue(p, store, mode); const ci = M.configIssues(p, B.config, store);
    if (issue || ci.length) { U.toast(issue || ci[0], 'err'); return true; }
    if (g) {
      if (M.groupLocked(g)) { U.toast('Selections are closed for this group.', 'err'); return true; }
      const pp = g.participants.find(x => x.id === target.p); if (!pp) return true;
      if (target.gedit) { const l = pp.items.find(x => x.uid === target.gedit); if (l) { l.config = M.clone(B.config); l.qty = B.qty; l.note = B.note || ''; } }
      else pp.items.push({ uid: M.uid('l'), productId: p.id, config: M.clone(B.config), qty: B.qty, note: B.note || '' });
      pp.ready = false;
      M.commit('groups');
      U.toast(`${p.name} ${target.gedit ? 'updated' : 'added'} for ${pp.name}`);
      B = null; location.hash = `#/group/${g.id}`;
      return true;
    }
    if (B.edit) { M.updateLine(B.edit, { config: B.config, qty: B.qty }); U.toast(`${p.name} updated`); B = null; location.hash = '#/cart'; return true; }
    M.addToCart(p.id, B.config, B.qty);
    U.toast(`${B.qty > 1 ? B.qty + '× ' : ''}${p.name} added to cart`, 'ok', { action: { label: 'View cart', href: '#/cart' } });
    B = null; location.hash = '#/menu?cat=' + p.cat;
    return true;
  }
  function openSaveRecipe(app) {
    const p = M.PROD[B.productId];
    const entry = U.openDialog({ title: 'Save this pizza', size: 'sm',
      body: `<form data-form="save-recipe" id="save-recipe-form" novalidate><div class="field"><label for="sr-name">Name your pizza</label><input id="sr-name" name="name" maxlength="40" placeholder="e.g. Friday Night Spicy" autofocus><p class="err" id="sr-err" hidden></p></div>
        <div class="sr-prev">${U.pizzaSVG(B.config)}<p class="small muted">${esc(M.describe({ productId: p.id, config: B.config }).join(' · ') || 'Standard recipe')}</p></div>
        <button class="btn btn-primary btn-block" type="submit">Save pizza</button></form>` });
    entry.dlg.querySelector('form').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = e.target.name.value.trim(); const err = entry.dlg.querySelector('#sr-err');
      if (!name) { err.textContent = 'Enter a name.'; err.hidden = false; e.target.name.setAttribute('aria-invalid', 'true'); e.target.name.focus(); return; }
      M.J().savedPizzas.unshift({ id: M.uid('sp'), name, productId: p.id, config: M.clone(B.config), savedAt: Date.now() });
      M.commit('journey'); U.closeDialog(entry); U.toast(`Saved “${name}”`, 'ok', { action: { label: 'View', href: '#/favorites' } });
    });
  }

  /* ================= After-order topping editor ================= */
  function estimateCal(line) {
    // Illustrative only: base standard calories plus rough per-ingredient deltas.
    const p = M.PROD[line.productId]; let cal = p.nutrition.cal;
    const base = new Set(p.recipe.items);
    const delta = { meat: 70, cheese: 60, veggie: 10 }; const mult = { light: 0.5, regular: 1, extra: 1.6 };
    const recs = line.config.split ? [line.config.halves.left, line.config.halves.right] : [line.config.whole];
    const f = line.config.split ? 0.5 : 1;
    recs.forEach(r => r.items.forEach(i => { const t = M.ING[i.id].type; const d = (delta[t] || 0) * f * (i.place && i.place !== 'whole' ? 0.5 : 1); cal += base.has(i.id) ? d * (mult[i.amt] - 1) : d * mult[i.amt]; }));
    p.recipe.items.forEach(id => { if (!recs.some(r => r.items.some(i => i.id === id))) cal -= (delta[M.ING[id].type] || 0); });
    return Math.max(0, Math.round(cal / 10) * 10);
  }
  function amendBody() {
    const f = M.findOrder(A.orderId); const o = f.order; const store = M.STORE[o.storeId];
    const pizzas = o.lines.filter(l => l.cat === 'pizzas');
    const l = pizzas.find(x => x.uid === A.lineUid);
    const p = M.PROD[l.productId];
    const cfg = A.config;
    return `${pizzas.length > 1 ? `<fieldset class="radio-cards"><legend>Which pizza?</legend>${pizzas.map(x => `<label class="rcard"><input type="radio" name="am-line" value="${x.uid}" ${x.uid === A.lineUid ? 'checked' : ''} data-act="a-line" data-uid="${x.uid}"><span>${x.qty}× ${esc(x.name)}<small>${esc(x.desc.join(' · ') || 'Standard')}</small></span></label>`).join('')}</fieldset>` : ''}
      <div class="am-top"><div class="am-art">${U.pizzaSVG(cfg, { label: 'Illustration of the updated pizza' })}</div>
        <div><p class="small"><strong>${esc(l.name)}</strong> · ${esc(M.SIZE[cfg.size].name)} · ${esc(M.CRUST[cfg.crust].name)} (unchanged)</p>
          <p class="small">Price stays ${money(l.unit)} each — topping changes are included.</p>
          <p class="small muted">Illustrative estimate: ~${estimateCal({ productId: l.productId, config: cfg })} cal (not verified).</p>
          ${!cfg.split ? '<p class="tiny muted">Placement was set before purchase. New toppings here apply to the whole pizza.</p>' : ''}</div></div>
      ${cfg.split ? `<div class="half-tabs" role="tablist" aria-label="Edit half">${['left', 'right'].map(s => `<button type="button" role="tab" aria-selected="${A.side === s}" class="half-tab ${A.side === s ? 'on' : ''}" data-act="a-side" data-v="${s}">${placeIcon(s)}${s === 'left' ? 'Left ½' : 'Right ½'}</button>`).join('')}</div>` : ''}
      ${p.toppingLimit != null ? `<div class="limit-bar">${icon('info')}<span>Limit ${p.toppingLimit} non-cheese topping.</span></div>` : ''}
      ${recipeEditor('a', cfg, A.side, { store, limit: p.toppingLimit, placement: false, noNewPlacement: true })}`;
  }
  function openAmend(orderId, app) {
    const f = M.findOrder(orderId); if (!f) return;
    if (!M.canAmend(f.order)) { U.toast('The store has accepted this order — changes are no longer possible.', 'err'); return; }
    const first = f.order.lines.find(l => l.cat === 'pizzas');
    A.orderId = orderId; A.lineUid = first.uid; A.config = M.clone(first.config); A.side = 'left'; A.busy = false;
    const entry = U.openDialog({ title: 'Change toppings', size: 'lg', id: 'amend-dlg', body: `<div id="amend-body">${amendBody()}</div>`,
      footer: `<p class="small muted grow" id="amend-status" role="status"></p><button class="btn btn-ghost" data-dlg-close>Cancel</button><button class="btn btn-primary" data-act="a-save">Save changes</button>` });
    A.entry = entry;
  }
  function refreshAmend() {
    const body = document.getElementById('amend-body'); if (!body) return;
    const ae = document.activeElement; const key = ae && ae.dataset ? JSON.stringify([ae.dataset.act, ae.dataset.id, ae.dataset.v, ae.dataset.uid]) : null;
    body.innerHTML = amendBody();
    if (key) { const t = [...body.querySelectorAll('[data-act]')].find(x => JSON.stringify([x.dataset.act, x.dataset.id, x.dataset.v, x.dataset.uid]) === key); if (t) t.focus(); }
  }
  function amendAction(act, el, app) {
    if (!A.orderId) return false;
    const f = M.findOrder(A.orderId); const o = f.order;
    if (act === 'a-line') { const l = o.lines.find(x => x.uid === el.dataset.uid); A.lineUid = l.uid; A.config = M.clone(l.config); A.side = 'left'; refreshAmend(); return true; }
    if (act === 'a-side') { A.side = el.dataset.v; refreshAmend(); return true; }
    if (act === 'a-save') {
      if (A.busy) return true; A.busy = true;
      const status = document.getElementById('amend-status'); const btn = el; btn.setAttribute('aria-disabled', 'true'); btn.innerHTML = '<span class="spinner" aria-hidden="true"></span>Saving…';
      status.textContent = 'Checking preparation status and ingredient stock…';
      setTimeout(() => {
        const r = M.amendOrder(A.orderId, A.lineUid, { split: A.config.split, whole: A.config.whole, halves: A.config.halves });
        A.busy = false;
        if (r.ok) { U.closeDialog(A.entry); U.toast(`Changes saved · invoice revision ${M.findOrder(A.orderId).order.invoice.revision}`); A.orderId = null; app.render(); }
        else { status.textContent = r.reason; status.classList.add('err'); btn.removeAttribute('aria-disabled'); btn.textContent = 'Save changes'; U.announce(r.reason, true); }
      }, 900);
      return true;
    }
    if (act.startsWith('a-')) {
      const l = o.lines.find(x => x.uid === A.lineUid); const p = M.PROD[l.productId];
      // whole-pizza items added after purchase are whole-only
      const ok = mutateRecipe(A.config, A.side, 'a', act.slice(2), el, p, M.STORE[o.storeId], U.toast);
      if (ok) refreshAmend();
      return true;
    }
    return false;
  }

  /* ================= Order setup dialog ================= */
  let setupEntry = null; const setupState = { day: 0, addAddr: false, searchErr: '', zip: '' };
  function setupBody() {
    const sh = M.S.shared, store = M.curStore(), j = M.J();
    const status = M.storeStatus(store, sh.mode);
    const days = M.slotsFor(store, sh.mode);
    const day = days[setupState.day] || days[0];
    const locked = !!sh.groupCheckout;
    const loc = sh.searchLoc;
    const list = loc ? M.storesNear(loc).map((x, i) => Object.assign(x, { rank: i })) : D.STORES.map(s => ({ store: s, miles: null, rank: -1 }));
    const storeCard = (s, miles, rank) => {
      const ss = M.storeStatus(s, sh.mode); const lt = M.fmtTime(Date.now(), s.tz);
      return `<label class="store-opt ${s.id === store.id ? 'on' : ''} ${!s.accepting ? 'paused' : ''}"><input type="radio" name="store" value="${s.id}" ${s.id === store.id ? 'checked' : ''} data-act="setup-store" data-id="${s.id}" ${locked ? 'disabled' : ''}>
        <div><span class="so-name"><strong>${esc(s.name)}</strong> <span class="muted">· ${esc(s.city)}</span>${miles != null ? `<span class="dist ${rank === 0 ? 'near' : ''}">${rank === 0 ? 'Nearest · ' : ''}${esc(M.fmtMiles(miles))}</span>` : ''}</span><small>${esc(s.address)}</small>
          <small>${icon('clock')}${esc(M.hoursText(s))} store time · now ${esc(lt)}</small>
          <span class="store-tags">${s.modes.map(m => V.fragments.pill(m === 'pickup' ? 'Pickup' : `Delivery ${money(s.deliveryFee)}`, '')).join('')}${!s.modes.includes('delivery') ? V.fragments.pill('No delivery', 'pill-muted') : ''}${V.fragments.pill(`~${s.prepMin} min prep`, 'pill-muted')}
          ${!s.accepting ? V.fragments.pill('Not accepting orders', 'pill-warn') : !ss.ok ? V.fragments.pill(esc(ss.reason), 'pill-warn') : ss.asap ? V.fragments.pill('Open for ASAP', 'pill-ok') : V.fragments.pill('Scheduled only', 'pill-warn')}</span></div></label>`;
    };
    return `${locked ? V.fragments.note('Store, fulfillment and time are locked during group checkout.', 'warn') : ''}
      <div class="seg full" role="radiogroup" aria-label="Fulfillment">${['pickup', 'delivery'].map(m => `<button type="button" role="radio" aria-checked="${sh.mode === m}" class="seg-btn ${sh.mode === m ? 'on' : ''}" data-act="setup-mode" data-mode="${m}" ${!store.modes.includes(m) || locked ? 'disabled' : ''}>${icon(m === 'pickup' ? 'bag' : 'truck')}${m === 'pickup' ? 'Pickup' : 'Delivery'}${!store.modes.includes(m) ? ' · unavailable here' : ''}</button>`).join('')}</div>
      <section class="setup-sect" id="setup-store"><h3>Store</h3>
        <div class="store-search"><form data-form="store-search" class="inline-form" novalidate><label for="ss-zip" class="sr-only">ZIP code</label><input id="ss-zip" name="zip" inputmode="numeric" maxlength="5" placeholder="Search by ZIP code" value="${attr(setupState.zip)}" autocomplete="postal-code" ${setupState.searchErr ? 'aria-invalid="true" aria-describedby="ss-err"' : ''}><button class="btn btn-ink" type="submit">${icon('search')}Search</button></form>
          <button type="button" class="btn btn-outline btn-block gps-btn" data-act="setup-gps" ${locked ? 'disabled' : ''}>${icon('target')}Use my current location</button>
          ${setupState.searchErr ? `<p class="err" id="ss-err" role="alert">${esc(setupState.searchErr)}</p>` : ''}
          ${loc ? `<p class="near-label" role="status">${icon('pin')}<span>Nearest to <strong>${esc(loc.label)}</strong></span><button type="button" class="link-btn" data-act="setup-clear-loc">Clear</button></p>` : ''}</div>
        <div class="store-list">${list.map(x => storeCard(x.store, x.miles, x.rank)).join('')}</div>
        ${loc && list[0] && list[0].miles > 100 ? `<p class="small warn-text">${icon('info')}No MOD stores within 100 miles — showing the closest ones.</p>` : ''}</section>
      ${sh.mode === 'delivery' ? `<section class="setup-sect" id="setup-address"><h3>Delivery address</h3>
        ${j.addresses.length ? `<div class="addr-opts">${j.addresses.map(a => `<label class="rcard ${a.id === j.selectedAddressId ? 'on' : ''}"><input type="radio" name="addr" ${a.id === j.selectedAddressId ? 'checked' : ''} data-act="setup-addr" data-id="${a.id}"><span><strong>${esc(a.label)}</strong><small>${esc(a.line)}</small>${a.instructions ? `<small class="muted">${esc(a.instructions)}</small>` : ''}</span></label>`).join('')}</div>` : '<p class="small muted">No saved address yet.</p>'}
        ${setupState.addAddr ? `<form class="card subtle" data-form="setup-addr" novalidate><div class="fgrid two"><div class="field"><label for="sa-label">Name</label><input id="sa-label" name="label" placeholder="Home"></div><div class="field"><label for="sa-line">Address</label><input id="sa-line" name="line" autocomplete="street-address" required></div></div>
          <div class="field"><label for="sa-ins">Instructions <span class="optl">optional</span></label><input id="sa-ins" name="instructions"></div><p class="err" id="sa-err" hidden></p><div class="btn-row"><button class="btn btn-sm btn-primary" type="submit">Save address</button><button class="btn btn-sm btn-ghost" type="button" data-act="setup-addr-toggle">Cancel</button></div></form>`
          : `<div class="btn-row"><button class="btn btn-sm btn-outline" data-act="setup-addr-toggle">${icon('plus')}New address</button><a class="btn btn-sm btn-ghost" href="#/addresses" data-dlg-close>Manage addresses</a></div>`}
        <fieldset class="opt-fs"><legend>Drop-off</legend><div class="method-grid two">${Object.entries(M.CONFIG.dropoffs).map(([k, l]) => `<label class="method ${sh.dropoff === k ? 'on' : ''}"><input type="radio" name="sdrop" ${sh.dropoff === k ? 'checked' : ''} data-act="setup-dropoff" data-v="${k}">${icon(k === 'door' ? 'home' : 'user')}<span><strong>${l}</strong></span></label>`).join('')}</div></fieldset>
      </section>` : `<section class="setup-sect" id="setup-pickup">${V.pickupMethodPicker(store, sh.pickupMethod, locked).replace(/data-act="pickup-method"/g, 'data-act="setup-pickup"')}<div class="pickup-note">${icon('info')}<span>${esc(V.pickupNote(store, sh.pickupMethod))}</span></div></section>`}
      <section class="setup-sect" id="setup-time"><h3>When <small class="muted">· ${esc(store.tz.replace('_', ' '))} store time</small></h3>
        <div class="seg full" role="radiogroup" aria-label="Timing"><button type="button" role="radio" aria-checked="${sh.schedule.type === 'asap'}" class="seg-btn ${sh.schedule.type === 'asap' ? 'on' : ''}" data-act="setup-asap" ${!status.asap || locked ? 'disabled' : ''}>ASAP${status.asap ? ` · ~${M.leadMin(store, sh.mode)} min` : ' · unavailable now'}</button><button type="button" role="radio" aria-checked="${sh.schedule.type === 'later'}" class="seg-btn ${sh.schedule.type === 'later' ? 'on' : ''}" data-act="setup-later" ${locked ? 'disabled' : ''}>Schedule for later</button></div>
        ${!status.asap && status.ok && sh.schedule.type !== 'later' ? `<p class="small warn-text">${esc(status.reason)} Choose “Schedule for later” to pick a time.</p>` : ''}
        ${sh.schedule.type === 'later' ? (days.length ? `${nextBtn(days, store, sh, locked)}<div class="day-tabs" role="tablist" aria-label="Day">${days.map((d, i) => `<button type="button" role="tab" aria-selected="${i === setupState.day}" class="day-tab ${i === setupState.day ? 'on' : ''}" data-act="setup-day" data-i="${i}" ${locked || !d.slots.length ? 'disabled' : ''}>${esc(d.label)}<small>${d.slots.length ? d.slots.length + ' times' : 'Full / closed'}</small></button>`).join('')}</div>
          ${day && day.slots.length ? slotGroups(day, store, sh, locked) : '<p class="small muted">No times left this day — pick another day.</p>'}
          <p class="tiny muted">15-minute windows in store time. We hold your time until checkout and recheck it when you pay. Use arrow keys to move between times.</p>`
          : '<p class="small muted">This store isn’t taking orders.</p>') : ''}
      </section>`;
  }
  function nextBtn(days, store, sh, locked) {
    const d = days.find(x => x.slots.length); if (!d) return '';
    const t = d.slots[0]; const on = sh.schedule.slot === t;
    return `<button type="button" class="next-slot ${on ? 'on' : ''}" data-act="setup-slot" data-t="${t}" ${locked ? 'disabled' : ''}>${icon('clock')}<span><strong>Next available</strong><small>${esc(d.label)} · ${esc(M.fmtTime(t, store.tz, { tzName: false }))}</small></span>${on ? icon('check') : ''}</button>`;
  }
  function slotGroups(day, store, sh, locked) {
    const parts = [['Morning', 0, 12], ['Afternoon', 12, 17], ['Evening', 17, 24]];
    const hourOf = (t) => M.tzParts(t, store.tz).h;
    const sel = sh.schedule.slot;
    const focusT = day.slots.includes(sel) ? sel : day.slots[0];
    return `<div class="slot-wrap" role="radiogroup" aria-label="Time slots for ${attr(day.label)}">${parts.map(([name, a, b]) => {
      const ss = day.slots.filter(t => hourOf(t) >= a && hourOf(t) < b); if (!ss.length) return '';
      return `<div class="slot-part"><h4>${name}</h4><div class="slot-grid">${ss.map(t => { const end = t + M.CONFIG.slotStepMin * 60000;
        return `<button type="button" role="radio" aria-checked="${sel === t}" tabindex="${t === focusT ? 0 : -1}" class="slot ${sel === t ? 'on' : ''}" data-act="setup-slot" data-t="${t}" ${locked ? 'disabled' : ''} aria-label="${attr(M.fmtTime(t, store.tz, { tzName: false }))} to ${attr(M.fmtTime(end, store.tz, { tzName: false }))}">${esc(M.fmtTime(t, store.tz, { tzName: false }))}<small>–${esc(M.fmtTime(end, store.tz, { tzName: false }).replace(/\s?[AP]M/, ''))}</small></button>`; }).join('')}</div></div>`;
    }).join('')}</div>`;
  }
  // Arrow-key navigation across time slots (roving focus).
  document.addEventListener('keydown', (e) => {
    const el = e.target; if (!el.classList || !el.classList.contains('slot')) return;
    const all = [...document.querySelectorAll('#setup-body .slot')]; const i = all.indexOf(el); if (i < 0) return;
    const grid = el.parentElement; const cols = Math.max(1, Math.round(grid.clientWidth / el.offsetWidth));
    const map = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols, Home: -i, End: all.length - 1 - i };
    if (!(e.key in map)) return; e.preventDefault();
    const n = all[Math.max(0, Math.min(all.length - 1, i + map[e.key]))]; all.forEach(x => x.tabIndex = -1); n.tabIndex = 0; n.focus();
  });
  function openSetup(tab, app) {
    const sh = M.S.shared;
    if (sh.schedule.type === 'later' && sh.schedule.slot) {
      const days = M.slotsFor(M.curStore(), sh.mode); const i = days.findIndex(d => d.slots.includes(sh.schedule.slot)); setupState.day = Math.max(0, i);
    } else setupState.day = 0;
    setupState.addAddr = false;
    if (setupState.timer) clearInterval(setupState.timer);
    setupState.timer = setInterval(() => { if (!setupEntry) { clearInterval(setupState.timer); return; } const sh2 = M.S.shared; if (sh2.schedule.type === 'later' && !M.slotValid(M.curStore(), sh2.mode, sh2.schedule.slot)) { M.setSchedule('asap'); U.toast('Your selected time passed — choose a new one.', 'info'); } refreshSetup(); }, 30000);
    setupEntry = U.openDialog({ title: 'Order setup', size: 'lg', id: 'setup-dlg', body: `<div id="setup-body">${setupBody()}</div>`,
      footer: '<button class="btn btn-primary btn-block" data-dlg-close>Done</button>', onClose: () => { setupEntry = null; app.render(); } });
    if (tab) { const t = document.getElementById('setup-' + tab); if (t) setTimeout(() => t.scrollIntoView({ block: 'start', behavior: U.reduceMotion() ? 'auto' : 'smooth' }), 60); }
  }
  function refreshSetup() {
    const b = document.getElementById('setup-body'); if (!b) return;
    const ae = document.activeElement; const key = ae && ae.dataset ? JSON.stringify([ae.dataset.act, ae.dataset.id, ae.dataset.mode, ae.dataset.t, ae.dataset.i, ae.dataset.v]) : null;
    const sc = b.closest('.dlg-body').scrollTop;
    b.innerHTML = setupBody();
    b.closest('.dlg-body').scrollTop = sc;
    if (key) { const t = [...b.querySelectorAll('[data-act]')].find(x => JSON.stringify([x.dataset.act, x.dataset.id, x.dataset.mode, x.dataset.t, x.dataset.i, x.dataset.v]) === key); if (t && !t.disabled) t.focus(); }
  }
  function setupAction(act, el, app) {
    const sh = M.S.shared;
    switch (act) {
      case 'setup-mode': if (M.setMode(el.dataset.mode)) U.announce(`${el.dataset.mode} selected`); break;
      case 'setup-store': {
        const id = el.dataset.id; if (id === sh.storeId) return true;
        if (sh.cart.lines.length) { openStoreChange(id, app); return true; }
        M.applyStore(id); U.announce(`${M.STORE[id].name} selected`); setupState.day = 0; break;
      }
      case 'setup-addr': M.J().selectedAddressId = el.dataset.id; M.commit('journey'); break;
      case 'setup-pickup': if (!M.setPickupMethod(el.dataset.v)) U.toast('Not available at this store', 'err'); else U.announce(M.CONFIG.pickupMethods[el.dataset.v] + ' selected'); break;
      case 'setup-dropoff': M.setDropoff(el.dataset.v); break;
      case 'setup-addr-toggle': setupState.addAddr = !setupState.addAddr; break;
      case 'setup-gps': {
        el.setAttribute('aria-disabled', 'true'); el.innerHTML = '<span class="spinner" aria-hidden="true"></span>Finding your location…';
        setTimeout(() => { const g = D.SIM_GPS; setupState.searchErr = ''; setupState.zip = ''; M.setSearchLoc({ lat: g.lat, lng: g.lng, label: g.label, src: 'gps' }); U.announce('Showing stores nearest to your current location'); refreshSetup(); }, 700);
        return true;
      }
      case 'setup-clear-loc': M.setSearchLoc(null); setupState.zip = ''; setupState.searchErr = ''; break;
      case 'setup-asap': M.setSchedule('asap'); U.announce('ASAP selected'); break;
      case 'setup-later': { const days = M.slotsFor(M.curStore(), sh.mode); const first = days.find(d => d.slots.length); if (first) { setupState.day = days.indexOf(first); M.setSchedule('later', first.slots[0]); } break; }
      case 'setup-day': setupState.day = Number(el.dataset.i); break;
      case 'setup-slot': { const t = Number(el.dataset.t); if (!M.slotValid(M.curStore(), sh.mode, t)) { U.toast('That time just passed — pick another.', 'err'); break; } const ds = M.slotsFor(M.curStore(), sh.mode); const di = ds.findIndex(d => d.slots.includes(t)); if (di > -1) setupState.day = di; M.setSchedule('later', t); } U.announce('Scheduled for ' + M.scheduleText(M.S.shared.schedule, M.curStore())); break;
      default: return false;
    }
    refreshSetup();
    return true;
  }
  function storeSearch(form) {
    const z = form.zip.value.trim(); setupState.zip = z;
    const r = M.geocodeZip(z);
    if (!r.ok) { setupState.searchErr = r.reason; refreshSetup(); const i = document.getElementById('ss-zip'); if (i) i.focus(); return; }
    setupState.searchErr = ''; M.setSearchLoc({ lat: r.lat, lng: r.lng, label: r.label, src: 'zip' });
    const n = M.storesNear(r); U.announce(`Nearest store: ${n[0].store.name}, ${M.fmtMiles(n[0].miles)}`);
    refreshSetup();
  }
  function setupSubmitAddress(form) {
    const line = form.line.value.trim(); const err = form.querySelector('#sa-err');
    if (line.length < 6) { err.textContent = 'Enter a full delivery address.'; err.hidden = false; form.line.setAttribute('aria-invalid', 'true'); form.line.focus(); return; }
    const j = M.J(); const a = { id: M.uid('a'), label: form.label.value.trim() || `Address ${j.addresses.length + 1}`, line, instructions: form.instructions.value.trim() };
    j.addresses.push(a); j.selectedAddressId = a.id; M.commit('journey'); setupState.addAddr = false; refreshSetup(); U.toast('Address saved and selected');
  }

  /* ================= Store change confirmation ================= */
  function openStoreChange(id, app) {
    const pv = M.previewStoreChange(id);
    const anyIssue = pv.rows.some(r => r.issues.length);
    const body = `<p>Switching from <strong>${esc(pv.from.name)}</strong> to <strong>${esc(pv.to.name)}</strong>. Your recipes stay the same; here’s what changes:</p>
      <table class="diff"><thead><tr><th scope="col">Item</th><th scope="col" class="num">Now</th><th scope="col" class="num">At ${esc(pv.to.name)}</th></tr></thead><tbody>
      ${pv.rows.map(r => `<tr class="${r.issues.length ? 'bad' : ''}"><td>${esc(r.name)} ×${r.line.qty}${r.issues.length ? `<br><small class="err">${esc(r.issues[0])} — edit or remove before checkout</small>` : ''}</td><td class="num">${money(r.oldUnit * r.line.qty)}</td><td class="num ${r.newUnit > r.oldUnit ? 'up' : r.newUnit < r.oldUnit ? 'down' : ''}">${money(r.newUnit * r.line.qty)}</td></tr>`).join('')}
      ${pv.mode === 'delivery' || pv.newMode === 'delivery' ? `<tr><td>Delivery fee</td><td class="num">${money(pv.oldFee || 0)}</td><td class="num">${pv.newMode === 'delivery' ? money(pv.newFee || 0) : '—'}</td></tr>` : ''}</tbody></table>
      ${pv.newMode !== pv.mode ? V.fragments.note(`${pv.to.name} doesn’t offer ${pv.mode}. Your order will switch to <strong>${pv.newMode}</strong>.`, 'warn') : ''}
      ${!pv.status.ok ? V.fragments.note(esc(pv.status.reason), 'warn') : ''}
      ${anyIssue ? V.fragments.note('Some items aren’t available there. You’ll need to edit or remove them before checking out.', 'warn') : ''}
      <p class="tiny muted">Coupons and rewards are rechecked automatically for the new store.</p>`;
    const entry = U.openDialog({ title: 'Change store?', body, size: 'md', footer: `<button class="btn btn-ghost" data-dlg-close>Keep ${esc(pv.from.name)}</button><button class="btn btn-primary" id="confirm-store">Switch to ${esc(pv.to.name)}</button>` });
    entry.dlg.querySelector('#confirm-store').addEventListener('click', () => { M.applyStore(id); setupState.day = 0; U.closeDialog(entry); U.toast(`Now ordering from ${pv.to.name}`); refreshSetup(); app.render(); });
  }

  /* ================= Support chat ================= */
  function chatBody(o) {
    const msgs = o.chat.length ? o.chat : [];
    return `<div class="chat-log" id="chat-log" role="log" aria-live="polite">${'<div class="msg them"><span>Hi! This is MOD delivery support (simulated). How can we help with order ' + esc(o.id) + '?</span></div>'}${msgs.map(m => `<div class="msg ${m.from === 'me' ? 'me' : 'them'}"><span>${esc(m.text)}</span><small>${new Date(m.at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</small></div>`).join('')}</div>
      <div class="chip-row">${['Where is my order?', 'Driver can’t find me', 'Update instructions'].map(t => `<button class="chip" data-chat-quick="${attr(t)}">${esc(t)}</button>`).join('')}</div>`;
  }
  function openChat(orderId) {
    const f = M.findOrder(orderId); if (!f) return;
    const o = f.order;
    const entry = U.openDialog({ title: 'Delivery support chat', size: 'md', body: `<div id="chat-wrap">${chatBody(o)}</div>`,
      footer: `<form class="inline-form grow" id="chat-form"><label for="chat-in" class="sr-only">Message</label><input id="chat-in" placeholder="Type a message" autocomplete="off" autofocus><button class="btn btn-primary" type="submit">Send</button></form>` });
    const send = (text) => {
      if (!text.trim()) return;
      o.chat.push({ from: 'me', text: text.trim(), at: Date.now() }); M.commit('journey'); redraw();
      const t = text.toLowerCase(); const s = M.stageOf(o);
      const reply = t.includes('where') ? `Your order is “${s.label}”. Current ETA is ${M.fmtTime(M.etaOf(o), o.tz)}.` : t.includes('find') || t.includes('driver') ? 'I’ve shared your delivery instructions with the courier again. They’ll call if needed.' : t.includes('instruction') ? 'Tell me the new instructions and I’ll pass them on to the courier.' : 'Thanks — a support teammate has the details and will follow up here.';
      setTimeout(() => { o.chat.push({ from: 'them', text: reply, at: Date.now() }); M.commit('journey'); redraw(); }, 1100);
    };
    const redraw = () => { const w = entry.dlg.querySelector('#chat-wrap'); if (!w) return; w.innerHTML = chatBody(o); const log = w.querySelector('#chat-log'); log.scrollTop = log.scrollHeight; };
    redraw();
    entry.dlg.querySelector('#chat-form').addEventListener('submit', (e) => { e.preventDefault(); const i = entry.dlg.querySelector('#chat-in'); send(i.value); i.value = ''; i.focus(); });
    entry.dlg.addEventListener('click', (e) => { const q = e.target.closest('[data-chat-quick]'); if (q) send(q.dataset.chatQuick); });
  }

  window.BUILDER = { storeSearch, itemView, builderAction, amendAction, openAmend, openSetup, setupAction, setupSubmitAddress, openStoreChange, openChat, refreshSetup, isSetupOpen: () => !!setupEntry, resetBuilder: () => { B = null; }, getB: () => B };
})();
