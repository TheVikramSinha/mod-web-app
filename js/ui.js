/* MOD Customer Prototype — UI helpers: escaping, icons, illustrations, dialogs, toasts, announcements. */
(function () {
  'use strict';
  const M = window.MOD;

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const attr = esc;
  const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- Icons (stroke, 24 grid) ---------------- */
  const P = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20h5v-6h4v6h5V9.5"/>',
    menu: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
    receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h3"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
    cart: '<path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6.2"/><circle cx="10" cy="20.5" r="1.3"/><circle cx="17.5" cy="20.5" r="1.3"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    heart: '<path d="M12 20s-7.5-4.6-9-9.3C2 7 4.5 4 7.7 4c1.9 0 3.3 1 4.3 2.5C13 5 14.4 4 16.3 4 19.5 4 22 7 21 10.7 19.5 15.4 12 20 12 20z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    pin: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    store: '<path d="M4 9.5 5.5 4h13L20 9.5"/><path d="M4 9.5c0 1.4 1.1 2.5 2.7 2.5s2.6-1.1 2.6-2.5c0 1.4 1.1 2.5 2.7 2.5s2.7-1.1 2.7-2.5c0 1.4 1 2.5 2.6 2.5S20 10.9 20 9.5"/><path d="M5.5 12v8h13v-8"/><path d="M10 20v-4.5h4V20"/>',
    truck: '<path d="M2 6h11v10H2z"/><path d="M13 9h4.5l3.5 3.5V16h-8"/><circle cx="6.5" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
    bag: '<path d="M5 8h14l-1 13H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
    chevR: '<path d="m9 5 7 7-7 7"/>', chevL: '<path d="m15 5-7 7 7 7"/>', chevD: '<path d="m5 9 7 7 7-7"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>', plus: '<path d="M12 5v14M5 12h14"/>', minus: '<path d="M5 12h14"/>', check: '<path d="m5 12.5 4.5 4.5L19 7"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c1-3.5 3.5-5.5 6.5-5.5s5.5 2 6.5 5.5"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.8c1.7.8 2.9 2.5 3.5 5.2"/>',
    wallet: '<path d="M3 7a2 2 0 0 1 2-2h13v4"/><path d="M3 7v11a2 2 0 0 0 2 2h15V9H5a2 2 0 0 1-2-2z"/><circle cx="16.5" cy="14.5" r="1.3"/>',
    tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.5"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.3a2.6 2.6 0 0 1 5 .9c0 1.8-2.5 2.2-2.5 3.8"/><circle cx="12" cy="17" r=".6" fill="currentColor"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/>', print: '<path d="M7 9V3h10v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v7H7z"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5M4 20h16"/>', mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><circle cx="12" cy="7.5" r=".6" fill="currentColor"/>',
    alert: '<path d="M12 3 2 20h20z"/><path d="M12 10v4"/><circle cx="12" cy="17" r=".6" fill="currentColor"/>',
    zoomIn: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5M8 11h6M11 8v6"/>', zoomOut: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5M8 11h6"/>',
    target: '<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
    back: '<path d="M19 12H5M11 5l-7 7 7 7"/>', sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>', link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v6H4V6h6"/>', gift: '<rect x="3" y="8" width="18" height="5" rx="1"/><path d="M5 13v8h14v-8M12 8v13M12 8c-1-3-5-4-5-1.5S10 8 12 8zM12 8c1-3 5-4 5-1.5S14 8 12 8z"/>',
    swap: '<path d="M7 4 3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/>', copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4H4v12h4"/>',
    leaf: '<path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15"/><path d="M5 19 13 11"/>', flame: '<path d="M12 3c1 4 6 6 6 11a6 6 0 0 1-12 0c0-3 2-4 2-7 2 1 3 3 3 5 1-1 1-6 1-9z"/>',
    more: '<circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/>', card: '<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19M6 15h4"/>',
    refresh: '<path d="M20 12a8 8 0 1 1-2.3-5.7L20 8.5"/><path d="M20 3v5.5h-5.5"/>', calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'
  };
  function icon(name, cls = '') {
    return `<svg class="ico ${cls}" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${P[name] || ''}</svg>`;
  }

  /* ---------------- Pizza illustration ---------------- */
  function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const hash = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const COUNT = { light: 5, regular: 9, extra: 15 };
  function shape(ing, x, y, rot, k) {
    const c = ing.color;
    switch (ing.shape) {
      case 'disc': return `<circle cx="${x}" cy="${y}" r="${7 * k}" fill="${c}"/><circle cx="${x}" cy="${y}" r="${7 * k}" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="1.2"/><circle cx="${x - 2}" cy="${y - 2}" r="${1.4 * k}" fill="rgba(255,255,255,.25)"/>`;
      case 'ring': return `<circle cx="${x}" cy="${y}" r="${4.6 * k}" fill="none" stroke="${c}" stroke-width="${2.4 * k}"/>`;
      case 'strip': return `<rect x="${x - 7 * k}" y="${y - 2 * k}" width="${14 * k}" height="${4 * k}" rx="${2 * k}" fill="${c}" transform="rotate(${rot} ${x} ${y})"/>`;
      case 'square': return `<rect x="${x - 4.5 * k}" y="${y - 4.5 * k}" width="${9 * k}" height="${9 * k}" rx="${1.6 * k}" fill="${c}" transform="rotate(${rot} ${x} ${y})" stroke="rgba(0,0,0,.12)"/>`;
      case 'leaf': return `<ellipse cx="${x}" cy="${y}" rx="${7 * k}" ry="${3.4 * k}" fill="${c}" transform="rotate(${rot} ${x} ${y})"/>`;
      case 'half': return `<path d="M${x - 6 * k} ${y} a${6 * k} ${6 * k} 0 0 1 ${12 * k} 0 z" fill="${c}" transform="rotate(${rot} ${x} ${y})" stroke="rgba(0,0,0,.15)"/>`;
      case 'drizzle': return `<path d="M${x - 14 * k} ${y} q ${3.5 * k} ${-5 * k} ${7 * k} 0 t ${7 * k} 0 t ${7 * k} 0 t ${7 * k} 0" fill="none" stroke="${c}" stroke-width="${2.2 * k}" stroke-linecap="round" transform="rotate(${rot} ${x} ${y})" opacity=".9"/>`;
      default: return `<circle cx="${x}" cy="${y}" r="${4.4 * k}" fill="${c}" stroke="rgba(0,0,0,.15)"/>`;
    }
  }
  function scatter(id, side, n, radius, salt) {
    const r = rng(hash(id + (salt || '')));
    const pts = [];
    for (let i = 0; i < n; i++) {
      let rad = Math.sqrt(r()) * radius, th = r() * Math.PI * 2;
      let x = Math.cos(th) * rad, y = Math.sin(th) * rad;
      if (side === 'left' && x > -3) x = -Math.abs(x) - 4;
      if (side === 'right' && x < 3) x = Math.abs(x) + 4;
      pts.push([100 + x, 100 + y, Math.floor(r() * 180)]);
    }
    return pts;
  }
  function layer(recipe, side, uidv) {
    // recipe: { sauce:{id,amt,place?}, items:[{id,amt,place?}] }
    let out = '';
    const sauce = M.ING[recipe.sauce.id];
    const sPlace = side || recipe.sauce.place || 'whole';
    if (sauce && sauce.color) {
      const op = { light: 0.55, regular: 0.85, extra: 1 }[recipe.sauce.amt || 'regular'];
      const clip = sPlace === 'whole' ? '' : ` clip-path="url(#${uidv}-${sPlace})"`;
      out += `<circle cx="100" cy="100" r="${recipe.sauce.amt === 'extra' ? 79 : 76}" fill="${sauce.color}" opacity="${op}"${clip}/>`;
    }
    const cheeses = recipe.items.filter(i => M.ING[i.id] && M.ING[i.id].type === 'cheese');
    const tops = recipe.items.filter(i => M.ING[i.id] && M.ING[i.id].type !== 'cheese');
    cheeses.forEach((c, ci) => {
      const ing = M.ING[c.id]; const pl = side || c.place || 'whole';
      const amt = c.amt || 'regular';
      if (ci === 0 && amt !== 'light') { const clip = pl === 'whole' ? '' : ` clip-path="url(#${uidv}-${pl})"`; out += `<circle cx="100" cy="100" r="72" fill="${ing.color}" opacity="${amt === 'extra' ? .7 : .45}"${clip}/>`; }
      const n = { light: 26, regular: 46, extra: 70 }[amt] * (pl === 'whole' ? 1 : 0.55);
      scatter(c.id, pl, Math.round(n), 70, 'ch' + ci).forEach(([x, y, rot]) => { out += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(5 + rot % 4).toFixed(1)}" ry="${(3.6 + rot % 3).toFixed(1)}" transform="rotate(${rot} ${x.toFixed(1)} ${y.toFixed(1)})" fill="${ing.color}" opacity=".95"/>`; });
    });
    tops.forEach((t) => {
      const ing = M.ING[t.id]; const pl = side || t.place || 'whole';
      const n = Math.round(COUNT[t.amt || 'regular'] * (pl === 'whole' ? 1 : 0.6) * (ing.type === 'finish' ? 0.45 : 1));
      scatter(t.id, pl, n, 66).forEach(([x, y, rot]) => { out += shape(ing, x.toFixed(1), y.toFixed(1), rot, 1); });
    });
    return out;
  }
  let pzCounter = 0;
  function pizzaSVG(cfg, opts = {}) {
    const id = 'pz' + (++pzCounter);
    const cauli = cfg && cfg.crust === 'cauli';
    const crust = cauli ? '#e7cf95' : '#d99a4e', dough = cauli ? '#f1e2b8' : '#f2c886';
    const scale = cfg ? ({ small: 0.86, regular: 1, mega: 1 }[cfg.size] || 1) : 1;
    let body = '';
    const defs = `<defs><clipPath id="${id}-left"><rect x="0" y="0" width="100" height="200"/></clipPath><clipPath id="${id}-right"><rect x="100" y="0" width="100" height="200"/></clipPath>
      <radialGradient id="${id}-g" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset="1" stop-color="#000" stop-opacity=".08"/></radialGradient></defs>`;
    if (cfg && cfg.split && cfg.halves) {
      body += `<g clip-path="url(#${id}-left)">${layer(cfg.halves.left, 'left', id)}</g><g clip-path="url(#${id}-right)">${layer(cfg.halves.right, 'right', id)}</g>`;
      body += `<line x1="100" y1="14" x2="100" y2="186" stroke="#fff" stroke-width="2" stroke-dasharray="5 5" opacity=".9"/>`;
    } else if (cfg) body += layer(cfg.whole, null, id);
    const speck = cauli ? Array.from({ length: 18 }, (_, i) => { const a = i / 18 * Math.PI * 2; return `<circle cx="${(100 + Math.cos(a) * 88).toFixed(1)}" cy="${(100 + Math.sin(a) * 88).toFixed(1)}" r="1.4" fill="#b99a5a"/>`; }).join('') : '';
    const label = opts.label ? `<title>${esc(opts.label)}</title>` : '';
    return `<svg class="pizza-svg ${opts.cls || ''}" viewBox="0 0 200 200" role="${opts.label ? 'img' : 'presentation'}" ${opts.label ? `aria-label="${attr(opts.label)}"` : 'aria-hidden="true"'}>${label}${defs}
      <g transform="translate(${100 - 100 * scale} ${100 - 100 * scale}) scale(${scale})">
      <circle cx="100" cy="103" r="94" fill="rgba(35,31,32,.12)"/>
      <circle cx="100" cy="100" r="94" fill="${crust}"/>${speck}
      <circle cx="100" cy="100" r="82" fill="${dough}"/>${body}
      <circle cx="100" cy="100" r="94" fill="url(#${id}-g)"/></g></svg>`;
  }

  /* ---------------- Other illustrations ---------------- */
  function bowlSVG(colors) {
    const dots = (colors || ['#3f8f3a', '#e2412f', '#f4c430', '#9c4a8b']).map((c, i) => { const r = rng(hash(c + i)); return Array.from({ length: 6 }, () => `<circle cx="${(60 + r() * 80).toFixed(0)}" cy="${(78 + r() * 26).toFixed(0)}" r="${(4 + r() * 4).toFixed(1)}" fill="${c}"/>`).join(''); }).join('');
    return `<svg viewBox="0 0 200 200" aria-hidden="true"><ellipse cx="100" cy="172" rx="70" ry="10" fill="rgba(35,31,32,.1)"/><path d="M30 95h140c0 45-30 72-70 72S30 140 30 95z" fill="#fff" stroke="#e8e1dc" stroke-width="3"/>
      <ellipse cx="100" cy="95" rx="70" ry="22" fill="#5aa54a"/><ellipse cx="100" cy="92" rx="60" ry="15" fill="#7dc163"/>${dots}<path d="M30 95h140" stroke="#e8e1dc" stroke-width="3"/></svg>`;
  }
  // Product art: MOD's photo for the standard recipe; a drawn illustration for customized items or if the photo can't load.
  function artFor(p, cfg) {
    if (p && p.img && (!cfg || M.sameConfig(cfg, M.defaultConfig(p)) || (p.builder === 'salad' && cfg && M.sameConfig(Object.assign({}, cfg, { size: 'mod' }), M.defaultConfig(p))))) {
      return `<img class="photo" src="${attr(p.img)}" data-fb="${attr(p.imgFallback || '')}" data-pid="${attr(p.id)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="UI.imgErr(this)">`;
    }
    return drawnArt(p, cfg);
  }
  function imgErr(el) {
    if (el.dataset.fb && !el.dataset.tried) { el.dataset.tried = '1'; el.src = el.dataset.fb; return; }
    const p = M.PROD[el.dataset.pid]; const wrap = document.createElement('span'); wrap.className = 'art-fb'; wrap.innerHTML = p ? drawnArt(p) : '';
    el.replaceWith(wrap);
  }
  // MOD shield (2026 brand): single colour, lettering shows the background, ™ in the shield colour at the
  // bottom-right of MOD. variant 'primary' = Brick Oven Burgundy (bright/neutral backgrounds); 'reversed' = white (dark backgrounds).
  // Prototype rendition — replace with the official files from the brand portal (Downloads → Primary Logos) for production.
  let shieldN = 0;
  function shieldSVG(variant = 'primary', cls = '') {
    const c = variant === 'reversed' ? '#ffffff' : '#a61932'; const id = 'mods' + (++shieldN);
    return `<svg viewBox="0 0 132 128" class="logo-svg ${variant === 'reversed' ? 'rev' : ''} ${cls}" role="img" aria-label="MOD Pizza">
      <mask id="${id}" maskUnits="userSpaceOnUse"><rect width="132" height="128" fill="#fff"/>
        <text x="62" y="66" text-anchor="middle" font-family="Oswald, 'Arial Narrow', 'DejaVu Sans Condensed', sans-serif" font-weight="700" font-size="44" letter-spacing="-.5" fill="#000">MOD</text>
        <text x="62" y="92" text-anchor="middle" font-family="Oswald, 'Arial Narrow', 'DejaVu Sans Condensed', sans-serif" font-weight="600" font-size="21" letter-spacing="2" fill="#000">PIZZA</text></mask>
      <path mask="url(#${id})" fill="${c}" d="M62 3 C80 3 98 7 116 13 L116 62 C116 92 94 112 62 124 C30 112 8 92 8 62 L8 13 C26 7 44 3 62 3 Z"/>
      <text x="112" y="122" font-family="Barlow, Arial, sans-serif" font-weight="700" font-size="11" fill="${c}">™</text></svg>`;
  }
  function logoImg(cls = '', variant = 'primary') { return shieldSVG(variant, 'logo-img ' + cls); }
  function drawnArt(p, cfg) {
    if (p.cat === 'pizzas') return pizzaSVG(cfg || M.defaultConfig(p));
    if (p.cat === 'salads') {
      const tops = (cfg || p.recipe).toppings.map(id => (M.ING[id] && M.ING[id].color) || '#f4c430').slice(0, 5);
      return bowlSVG(tops.length ? tops : null);
    }
    if (p.cat === 'kids') return `<svg viewBox="0 0 200 200" aria-hidden="true"><g transform="translate(14 30) scale(.62)">${pizzaSVG({ size: 'regular', crust: 'original', split: false, whole: { sauce: { id: 'tomato-sauce', amt: 'regular' }, items: [{ id: 'mozzarella', amt: 'regular' }].concat(cfg && cfg.topping && cfg.topping !== 'cheese' ? [{ id: cfg.topping, amt: 'regular' }] : []) } }).replace('<svg', '<svg width="200" height="200"')}</g>
      <rect x="138" y="70" width="40" height="80" rx="8" fill="#f6c94c"/><rect x="138" y="70" width="40" height="18" rx="6" fill="#a61932"/><rect x="152" y="50" width="4" height="26" fill="#231f20"/></svg>`;
    if (p.cat === 'beverages') {
      const col = { 'b-lemonade': '#f7e27a', 'b-tea': '#a8642a', 'b-fountain': '#3b1d14', 'b-water': '#cfe8f5', 'b-beer': '#e8b43a', 'b-wine': '#7a1730' }[p.id] || '#f7e27a';
      if (p.id === 'b-wine') return `<svg viewBox="0 0 200 200" aria-hidden="true"><ellipse cx="100" cy="178" rx="40" ry="7" fill="rgba(35,31,32,.1)"/><path d="M70 40h60c0 45-12 70-30 70S70 85 70 40z" fill="#f3eeee" stroke="#d8cfcf" stroke-width="3"/><path d="M73 62h54c-3 28-12 44-27 44S76 90 73 62z" fill="${col}"/><rect x="97" y="108" width="6" height="56" fill="#d8cfcf"/><ellipse cx="100" cy="168" rx="28" ry="6" fill="#d8cfcf"/></svg>`;
      return `<svg viewBox="0 0 200 200" aria-hidden="true"><ellipse cx="100" cy="178" rx="44" ry="8" fill="rgba(35,31,32,.1)"/><path d="M62 40h76l-8 134H70z" fill="#fff" stroke="#e8e1dc" stroke-width="3"/><path d="M66 70h68l-6 100H72z" fill="${col}"/>
        <circle cx="86" cy="98" r="4" fill="rgba(255,255,255,.5)"/><circle cx="110" cy="122" r="3" fill="rgba(255,255,255,.45)"/><rect x="62" y="34" width="76" height="10" rx="4" fill="#a61932"/><rect x="104" y="12" width="5" height="34" rx="2" fill="#231f20" transform="rotate(12 106 30)"/></svg>`;
    }
    if (p.cat === 'desserts') {
      if (p.id === 'x-cakepop') { const f = cfg || p.recipe; const c1 = (M.CAKEPOPS[f.f1] || {}).color || '#f6a5c0', c2 = (M.CAKEPOPS[f.f2] || {}).color || '#d9822b';
        return `<svg viewBox="0 0 200 200" aria-hidden="true"><ellipse cx="100" cy="178" rx="50" ry="7" fill="rgba(35,31,32,.1)"/><rect x="72" y="92" width="4" height="80" fill="#f1e6d6"/><rect x="124" y="92" width="4" height="80" fill="#f1e6d6"/><circle cx="74" cy="80" r="30" fill="${c1}"/><circle cx="126" cy="80" r="30" fill="${c2}"/><circle cx="64" cy="70" r="7" fill="rgba(255,255,255,.35)"/><circle cx="116" cy="70" r="7" fill="rgba(255,255,255,.3)"/></svg>`; }
      if (p.id === 'x-cookie') return `<svg viewBox="0 0 200 200" aria-hidden="true"><ellipse cx="100" cy="170" rx="62" ry="8" fill="rgba(35,31,32,.1)"/><circle cx="100" cy="100" r="64" fill="#b77a45"/>${[[80, 80], [120, 90], [96, 120], [130, 124], [72, 112], [104, 70]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="#3b2216"/>`).join('')}</svg>`;
      if (p.id === 'x-cinnamon') return `<svg viewBox="0 0 200 200" aria-hidden="true"><ellipse cx="100" cy="170" rx="70" ry="8" fill="rgba(35,31,32,.1)"/>${[0, 1, 2, 3].map(i => `<rect x="36" y="${66 + i * 22}" width="128" height="16" rx="8" fill="#d9a05b" transform="rotate(${-6 + i * 4} 100 100)"/>`).join('')}<path d="M44 80 Q100 120 156 86" stroke="#fff" stroke-width="4" fill="none" opacity=".9"/></svg>`;
      return `<svg viewBox="0 0 200 200" aria-hidden="true"><ellipse cx="100" cy="170" rx="66" ry="9" fill="rgba(35,31,32,.1)"/><path d="M40 130 100 60l60 70z" fill="#4a2a1c"/><path d="M40 130h120v26H40z" fill="#5b3424"/><path d="M40 138h120" stroke="#2c170f" stroke-width="5"/><path d="M40 130 100 60l60 70" fill="none" stroke="#2c170f" stroke-width="4"/></svg>`;
    }
    if (p.cat === 'sides') {
      if (p.id === 'd-bites') return `<svg viewBox="0 0 200 200" aria-hidden="true"><ellipse cx="100" cy="166" rx="72" ry="10" fill="rgba(35,31,32,.1)"/><ellipse cx="100" cy="128" rx="74" ry="30" fill="#fff" stroke="#e8e1dc" stroke-width="3"/>${[[70, 118], [100, 112], [130, 120], [86, 134], [116, 136]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="15" fill="#e66a1f"/><circle cx="${x - 4}" cy="${y - 5}" r="4" fill="rgba(255,255,255,.3)"/>`).join('')}</svg>`;
      return `<svg viewBox="0 0 200 200" aria-hidden="true"><ellipse cx="100" cy="170" rx="72" ry="9" fill="rgba(35,31,32,.1)"/><rect x="28" y="60" width="144" height="100" rx="12" fill="#d99a4e"/><rect x="34" y="66" width="132" height="88" rx="10" fill="${p.id === 'd-cheesy' ? '#f7dc7c' : '#f2c886'}"/>
        ${[0, 1, 2].map(i => `<line x1="${76 + i * 24}" y1="66" x2="${76 + i * 24}" y2="154" stroke="#c98a40" stroke-width="3"/>`).join('')}${Array.from({ length: 14 }, (_, i) => `<circle cx="${44 + (i * 37) % 120}" cy="${76 + (i * 23) % 70}" r="2.5" fill="#3f8f3a"/>`).join('')}</svg>`;
    }
    if (p.cat === 'extras') {
      if (p.id === 'e-cutlery') return `<svg viewBox="0 0 200 200" aria-hidden="true"><rect x="52" y="40" width="96" height="120" rx="8" fill="#fff" stroke="#e8e1dc" stroke-width="3"/><path d="M84 60v80M74 60v22a10 10 0 0 0 20 0V60M118 60c10 0 12 20 12 30s-6 10-6 10v40" stroke="#8a8380" stroke-width="5" fill="none" stroke-linecap="round"/></svg>`;
      if (p.id === 'e-pepper') return `<svg viewBox="0 0 200 200" aria-hidden="true"><rect x="60" y="50" width="80" height="100" rx="8" fill="#fff" stroke="#e8e1dc" stroke-width="3"/>${Array.from({ length: 24 }, (_, i) => `<circle cx="${72 + (i * 29) % 56}" cy="${66 + (i * 17) % 70}" r="2.6" fill="${i % 3 ? '#a61932' : '#f4c430'}"/>`).join('')}</svg>`;
      return `<svg viewBox="0 0 200 200" aria-hidden="true"><ellipse cx="100" cy="160" rx="50" ry="8" fill="rgba(35,31,32,.1)"/><path d="M58 90h84l-8 60H66z" fill="#fff" stroke="#e8e1dc" stroke-width="3"/><ellipse cx="100" cy="90" rx="42" ry="10" fill="#f7f3e6"/><circle cx="90" cy="88" r="2" fill="#3f8f3a"/><circle cx="108" cy="91" r="2" fill="#3f8f3a"/></svg>`;
    }
    return '';
  }
  function catArt(cat) {
    const p = M.PROD[{ pizzas: 'p-ogpep', salads: 's-italian', sides: 'd-garlic', desserts: 'x-nonamecake', kids: 'k-meal', beverages: 'b-fountain', extras: 'e-ranch' }[cat]];
    return p ? artFor(p) : '';
  }

  /* ---------------- Barcode (illustrative, not scannable) ---------------- */
  function barcodeSVG(text) {
    const r = rng(hash(text)); let x = 6, bars = '';
    while (x < 294) { const w = 1 + Math.floor(r() * 3.2); if (r() > 0.42) bars += `<rect x="${x}" y="6" width="${w}" height="58" fill="#231f20"/>`; x += w + 1; }
    return `<svg viewBox="0 0 300 70" class="barcode" role="img" aria-label="Sample barcode for ${attr(text)}"><rect width="300" height="70" fill="#fff"/>${bars}</svg>`;
  }

  /* ---------------- Live region, toasts ---------------- */
  function announce(msg, assertive) {
    const el = document.getElementById(assertive ? 'live-assertive' : 'live-polite'); if (!el) return;
    el.textContent = ''; setTimeout(() => { el.textContent = msg; }, 30);
  }
  function toast(msg, kind = 'ok', opts = {}) {
    const root = document.getElementById('toast-root'); if (!root) return;
    const t = document.createElement('div');
    t.className = `toast toast-${kind}`;
    t.innerHTML = `${icon(kind === 'err' ? 'alert' : kind === 'info' ? 'info' : 'check')}<span>${esc(msg)}</span>${opts.action ? `<a class="toast-act" href="${attr(opts.action.href)}">${esc(opts.action.label)}</a>` : ''}`;
    root.appendChild(t);
    announce(msg, kind === 'err');
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 300); }, opts.ms || 3200);
  }

  /* ---------------- Dialogs (focus-managed) ---------------- */
  const stack = [];
  function openDialog({ title, body, footer = '', size = '', onOpen, onClose, sheet = true, id }) {
    const root = document.getElementById('dialog-root');
    const ret = document.activeElement;
    const wrap = document.createElement('div');
    wrap.className = 'dlg-wrap' + (sheet ? ' sheet' : '');
    const did = id || ('dlg' + Date.now());
    wrap.innerHTML = `<div class="dlg-backdrop" data-dlg-close></div>
      <div class="dlg ${size}" role="dialog" aria-modal="true" aria-labelledby="${did}-t" id="${did}">
        <div class="dlg-head"><h2 id="${did}-t">${title}</h2><button class="icon-btn" data-dlg-close aria-label="Close dialog">${icon('x')}</button></div>
        <div class="dlg-body">${body}</div>${footer ? `<div class="dlg-foot">${footer}</div>` : ''}</div>`;
    root.appendChild(wrap);
    document.body.classList.add('dlg-open');
    const dlg = wrap.querySelector('.dlg');
    const entry = { wrap, ret, onClose, dlg };
    stack.push(entry);
    wrap.addEventListener('click', (e) => { if (e.target.closest('[data-dlg-close]')) closeDialog(entry); });
    requestAnimationFrame(() => {
      wrap.classList.add('in');
      const f = dlg.querySelector('[autofocus]') || dlg.querySelector('.dlg-body input, .dlg-body select, .dlg-body textarea, .dlg-body button, .dlg-body a[href]') || dlg.querySelector('button');
      if (f) f.focus();
    });
    if (onOpen) onOpen(dlg, entry);
    return entry;
  }
  function closeDialog(entry) {
    entry = entry || stack[stack.length - 1]; if (!entry) return;
    const i = stack.indexOf(entry); if (i > -1) stack.splice(i, 1);
    entry.wrap.classList.remove('in');
    setTimeout(() => entry.wrap.remove(), reduceMotion() ? 0 : 200);
    if (!stack.length) document.body.classList.remove('dlg-open');
    if (entry.onClose) entry.onClose();
    if (entry.ret && document.contains(entry.ret)) entry.ret.focus();
    else { const h = document.querySelector('#main h1'); if (h) h.focus(); }
  }
  document.addEventListener('keydown', (e) => {
    const top = stack[stack.length - 1]; if (!top) return;
    if (e.key === 'Escape') { e.preventDefault(); closeDialog(top); return; }
    if (e.key === 'Tab') {
      const f = [...top.dlg.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')].filter(x => x.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  const topDialog = () => stack[stack.length - 1];

  const DIET = { veg: { label: 'Veg', cls: 'veg' }, nonveg: { label: 'Non-veg', cls: 'nonveg' }, vegan: { label: 'Vegan', cls: 'vegan' } };
  const dietBadge = (d) => `<span class="diet diet-${DIET[d].cls}"><span class="diet-dot" aria-hidden="true"></span>${DIET[d].label}</span>`;

  M.CAKEPOPS = Object.fromEntries(window.MOD_DATA.CAKEPOP_FLAVORS.map(f => [f.id, f]));
  window.UI = { esc, attr, icon, pizzaSVG, artFor, drawnArt, imgErr, logoImg, shieldSVG, catArt, barcodeSVG, announce, toast, openDialog, closeDialog, topDialog, dietBadge, DIET, reduceMotion };
})();
