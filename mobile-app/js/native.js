/* MOD mobile app prototype — native-app layer: splash, onboarding, simulated permissions,
   push-style order alerts, haptics and platform styling. Loaded after app.js in app.html. */
(function () {
  'use strict';
  const M = window.MOD, U = window.UI, APP = window.APP;
  const { esc, icon } = U;
  const KEY = (k) => M.PREFIX + 'native.' + k;
  const get = (k) => { try { return JSON.parse(localStorage.getItem(KEY(k))); } catch (e) { return null; } };
  const set = (k, v) => { try { localStorage.setItem(KEY(k), JSON.stringify(v)); } catch (e) { /* ignore */ } };
  const params = new URLSearchParams(location.search);
  const platform = params.get('platform') || (/android/i.test(navigator.userAgent) ? 'android' : 'ios');
  document.documentElement.classList.add('app', 'p-' + platform);
  if (window.top !== window.self) document.documentElement.classList.add('framed');
  const participant = !!(APP.participantInfo && APP.participantInfo());

  /* ---------- Overlay helper ---------- */
  const root = document.getElementById('native-root');
  function overlay(cls, html) {
    const el = document.createElement('div'); el.className = 'n-overlay ' + cls; el.innerHTML = html;
    root.appendChild(el); requestAnimationFrame(() => el.classList.add('in'));
    return el;
  }
  function closeOverlay(el) { el.classList.remove('in'); el.classList.add('out'); setTimeout(() => el.remove(), U.reduceMotion() ? 0 : 320); }
  function trapFocus(el) {
    el.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const f = [...el.querySelectorAll('button, a[href], input')].filter(x => x.offsetParent !== null);
      if (!f.length) return; const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  /* ---------- Splash ---------- */
  function splash() {
    return new Promise((res) => {
      if (participant || params.get('nosplash')) return res();
      const el = overlay('n-splash', `<div class="sp-mark" aria-hidden="true">MOD</div><div class="sp-word">pizza</div><div class="sp-dots" aria-hidden="true"><span></span><span></span><span></span></div><p class="sr-only" role="status">Loading MOD Pizza</p>`);
      setTimeout(() => { closeOverlay(el); res(); }, U.reduceMotion() ? 300 : 1400);
    });
  }

  /* ---------- Onboarding ---------- */
  const SLIDES = [
    { t: 'Made your way', d: 'Pile on unlimited toppings, split it half and half, and save your favourite builds.', art: 'photo' },
    { t: 'Earn as you eat', d: 'Points on every order, a free pizza at 1,500 points, plus a digital wallet and member pass.', art: 'rewards' }
  ];
  function slideArt(a) {
    if (a === 'photo') return `<div class="ob-photo"><img src="assets/custom.jpg" alt="" width="800" height="800"><span class="made-badge sm"><span>Made</span><strong>Your</strong><span>Way</span></span></div>`;
    return `<div class="ob-card dark"><small>MOD Rewards · Silver</small><strong class="ob-pts">1,240 pts</strong><div class="ob-meter"><span style="width:82%"></span></div><small>260 pts to a free pizza</small></div>`;
  }
  function onboarding() {
    return new Promise((res) => {
      if (participant || get('onboarded')) return res();
      let i = 0;
      const el = overlay('n-onboard', '');
      el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', 'Welcome to MOD Pizza');
      trapFocus(el);
      const draw = () => {
        const s = SLIDES[i]; const last = i === SLIDES.length - 1;
        el.innerHTML = `<div class="ob-top"><span class="logo"><span class="logo-mark">MOD</span><span class="logo-text">pizza</span></span>${!last ? '<button class="ob-skip" data-ob="skip">Skip</button>' : ''}</div>
          <div class="ob-art">${slideArt(s.art)}</div>
          <div class="ob-copy"><h2 id="ob-h" tabindex="-1">${esc(s.t)}</h2><p>${esc(s.d)}</p></div>
          <div class="ob-dots" aria-label="Step ${i + 1} of ${SLIDES.length}">${SLIDES.map((_, k) => `<span class="${k === i ? 'on' : ''}"></span>`).join('')}</div>
          <div class="ob-actions">${last
            ? `<button class="btn btn-primary btn-lg btn-block" data-ob="member">${icon('star')}Sign in with a code</button><button class="btn btn-outline btn-lg btn-block" data-ob="guest">Continue as guest</button><p class="tiny muted center">Passwordless: we email or text you a one-time code.</p>`
            : `<button class="btn btn-primary btn-lg btn-block" data-ob="next">Next ${icon('chevR')}</button>`}</div>`;
        const h = el.querySelector('#ob-h'); if (h) h.focus();
      };
      draw();
      let x0 = null;
      el.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
      el.addEventListener('touchend', (e) => { if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; x0 = null; if (dx < -50 && i < SLIDES.length - 1) { i++; draw(); } else if (dx > 50 && i > 0) { i--; draw(); } });
      el.addEventListener('click', (e) => {
        const b = e.target.closest('[data-ob]'); if (!b) return;
        const a = b.dataset.ob;
        if (a === 'next') { i++; draw(); return; }
        if (a === 'skip') { i = SLIDES.length - 1; draw(); return; }
        M.switchJourney('guest');
        closeOverlay(el); set('onboarded', true); APP.render();
        permissions().then(() => { if (a === 'member') APP.go('#/login'); res(); });
      });
    });
  }

  /* ---------- Simulated permission prompts ---------- */
  function ask({ ic, title, text, allow, deny }) {
    return new Promise((res) => {
      const el = overlay('n-perm', `<div class="perm-card" role="alertdialog" aria-modal="true" aria-labelledby="perm-t" aria-describedby="perm-d">
        <div class="perm-ico">${icon(ic)}</div><h2 id="perm-t">${title}</h2><p id="perm-d">${text}</p><p class="tiny muted">Simulated system prompt — nothing is requested from your device.</p>
        <div class="perm-btns"><button class="btn btn-outline" data-p="0">${deny}</button><button class="btn btn-primary" data-p="1">${allow}</button></div></div>`);
      trapFocus(el); setTimeout(() => { const b = el.querySelector('[data-p="1"]'); if (b) b.focus(); }, 60);
      el.addEventListener('click', (e) => { const b = e.target.closest('[data-p]'); if (!b) return; closeOverlay(el); res(b.dataset.p === '1'); });
    });
  }
  async function permissions() {
    const loc = await ask({ ic: 'pin', title: 'Allow MOD to use your location?', text: 'We’ll pick the nearest store and show accurate pickup and delivery times.', allow: 'Allow while using', deny: 'Don’t allow' });
    set('location', loc);
    if (loc && !M.S.shared.groupCheckout) { const g = window.MOD_DATA.SIM_GPS; M.setSearchLoc({ lat: g.lat, lng: g.lng, label: g.label, src: 'gps' }); const n = M.storesNear(g)[0]; if (!M.S.shared.cart.lines.length) M.applyStore(n.store.id); U.toast(`Nearest store: ${n.store.name} · ${M.fmtMiles(n.miles)} (simulated location)`, 'info'); }
    const notif = await ask({ ic: 'mail', title: 'Turn on order updates?', text: 'Get a notification when your order is in the oven, ready, or on its way.', allow: 'Allow', deny: 'Not now' });
    set('notifications', notif);
    APP.render();
  }

  /* ---------- Push-style order alerts ---------- */
  const seen = {};
  function snapshot() { M.J().orders.forEach(o => { seen[o.id] = M.stageOf(o).id; }); }
  const PUSH = {
    accepted: ['Order accepted', 'The store has accepted your order.'],
    preparing: ['We’re on it', 'Your order is being prepared.'], baking: ['In the oven 🔥', 'Your pizza is baking now.'],
    out: ['On its way', 'Your courier has picked up your order.'], delivered: ['Delivered', 'Enjoy! Tap to rate your order.'],
    ready: ['Ready for pickup', 'Head to the pickup shelf — your order is waiting.'], completed: ['Picked up', 'Enjoy! Tap to rate your order.'],
    canceled: ['Order canceled', 'Your refund has been processed (simulated).']
  };
  function push(title, body, href) {
    const stack = document.getElementById('push-root'); if (!stack) return;
    const el = document.createElement('a'); el.className = 'push'; el.href = href || '#/orders';
    el.innerHTML = `<span class="push-ico" aria-hidden="true">MOD</span><span class="push-txt"><span class="push-head"><strong>MOD Pizza</strong><small>now</small></span><strong>${esc(title)}</strong><span>${esc(body)}</span></span>`;
    stack.appendChild(el); U.announce(`Notification: ${title}. ${body}`);
    if (navigator.vibrate && platform === 'android') try { navigator.vibrate([12, 40, 12]); } catch (e) { /* ignore */ }
    requestAnimationFrame(() => el.classList.add('in'));
    const kill = () => { el.classList.remove('in'); setTimeout(() => el.remove(), 350); };
    el.addEventListener('click', kill);
    setTimeout(kill, 5200);
  }
  function watchOrders() {
    if (participant) return;
    snapshot();
    setInterval(() => {
      if (!get('notifications')) { snapshot(); return; }
      M.J().orders.forEach(o => {
        const s = M.stageOf(o).id;
        if (seen[o.id] && seen[o.id] !== s && PUSH[s]) {
          const done = s === 'delivered' || s === 'completed';
          push(PUSH[s][0], `${PUSH[s][1]} · ${o.id}`, done ? `#/support/${o.id}#feedback` : `#/order/${o.id}`);
        }
        seen[o.id] = s;
      });
    }, 2000);
  }

  /* ---------- Haptics & press feedback ---------- */
  document.addEventListener('click', (e) => {
    if (platform !== 'android' || !navigator.vibrate) return;
    if (e.target.closest('.btn-primary, .tabbar a, .cart-bar')) try { navigator.vibrate(8); } catch (err) { /* ignore */ }
  });

  /* ---------- Hooks used by the device preview ---------- */
  window.addEventListener('message', (e) => {
    const d = e.data || {};
    if (d.type === 'mod:replay-onboarding') { set('onboarded', false); location.reload(); }
    if (d.type === 'mod:test-push') push('In the oven 🔥', 'Your pizza is baking now. (test notification)', '#/orders');
  });

  splash().then(onboarding).then(watchOrders);
})();
