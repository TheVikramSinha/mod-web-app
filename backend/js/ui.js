/* MOD Back Office — UI kit: icons, badges, data tables, dialogs, drawers, toasts, form fields, charts, CSV. */
(function () {
  'use strict';
  const A = window.ADM; const esc = A.esc;
  const P = {
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>', bike: '<circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M6 17l4-8h5l3 8M10 9l-1-3H7"/>',
    store: '<path d="M4 9l1.5-5h13L20 9"/><path d="M4 9v11h16V9"/><path d="M4 9c0 1.7 1.3 3 3 3s3-1.3 3-3c0 1.7 1.3 3 3 3s3-1.3 3-3c0 1.7 1.3 3 3 3"/><path d="M10 20v-5h4v5"/>',
    pizza: '<path d="M12 3 3 8.5 12 21l9-12.5z"/><circle cx="10" cy="10" r="1"/><circle cx="14" cy="12" r="1"/><circle cx="12" cy="15" r="1"/>', tag: '<path d="M20 12l-8 8-9-9V3h8z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
    megaphone: '<path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z"/><path d="M15 9a3 3 0 0 1 0 6M18 6a7 7 0 0 1 0 12"/>', star: '<path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.2a5 5 0 0 1 6 4.8"/>', user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    chat: '<path d="M4 5h16v11H8l-4 4z"/>', chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>', settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>', check: '<path d="M5 12l5 5L20 7"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>', plus: '<path d="M12 5v14M5 12h14"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>', bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/>', chevR: '<path d="M9 6l6 6-6 6"/>', chevD: '<path d="M6 9l6 6 6-6"/>', chevL: '<path d="M15 6l-6 6 6 6"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>', trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>', copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4H4v12h4"/>', download: '<path d="M12 4v11M7 10l5 5 5-5M4 20h16"/>', upload: '<path d="M12 20V9M7 14l5-5 5 5M4 4h16"/>',
    flame: '<path d="M12 3c1 4 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-3-1-5 1-8.5z"/>', clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', pin: '<path d="M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>',
    gift: '<rect x="3" y="9" width="18" height="12" rx="1"/><path d="M3 13h18M12 9v12M12 9c-2 0-5-1-5-3.5S10 4 12 9c2-5 5-5 5-2.5S14 9 12 9z"/>', layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>', route: '<circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h7a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h7"/>',
    filter: '<path d="M4 5h16l-6 8v6l-4-2v-4z"/>', alert: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.5"/>', info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>', lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>', send: '<path d="M21 3L3 10.5l7 2.5 2.5 7z"/><path d="M10 13l11-10"/>', refresh: '<path d="M20 11a8 8 0 0 0-14.9-3.9M4 4v4h4M4 13a8 8 0 0 0 14.9 3.9M20 20v-4h-4"/>',
    plug: '<path d="M9 3v5M15 3v5M6 8h12v3a6 6 0 0 1-12 0zM12 17v4"/>', file: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/>', history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 8v4l3 2"/>', rocket: '<path d="M5 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2M9 15l-3-3c1-4 4.5-9 12-9 0 7.5-5 11-9 12z"/><circle cx="15" cy="9" r="1.5"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>', swap: '<path d="M7 4L3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/>', logout: '<path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h11"/>', image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 17l-5-5-9 8"/>',
    pause: '<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>', play: '<path d="M7 4l13 8-13 8z"/>', checklist: '<path d="M4 6l2 2 3-3M4 13l2 2 3-3M12 7h8M12 14h8M4 20h16"/>', bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>', wallet: '<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18M16 15h2"/>', dollar: '<path d="M12 3v18M17 7H9.5a3 3 0 0 0 0 6h5a3 3 0 0 1 0 6H6"/>'
  };
  const icon = (n, cls = '') => `<svg class="ico ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n] || P.info}</svg>`;
  const badge = (t, tone = 'muted') => `<span class="badge b-${tone}">${esc(t)}</span>`;
  const TONE = { live: 'ok', active: 'ok', connected: 'ok', approved: 'ok', resolved: 'ok', completed: 'ok', delivered: 'ok', open: 'warn', pending: 'warn', scheduled: 'info', draft: 'muted', paused: 'warn', ended: 'muted', archived: 'muted', rejected: 'err', canceled: 'err', refunded: 'err', blocked: 'err', degraded: 'warn', invited: 'info', 'read-only': 'info', 'not connected': 'muted', high: 'err', normal: 'muted', low: 'muted', received: 'brand', accepted: 'info', preparing: 'info', baking: 'warn', ready: 'ok', out: 'ok', inactive: 'muted' };
  const status = (s, label) => badge(label || (A.STAGE_LABEL[s] || (s ? s[0].toUpperCase() + s.slice(1) : '—')), TONE[s] || 'muted');
  const kpi = (label, value, sub = '', opts = {}) => `<div class="kpi ${opts.tone ? 'k-' + opts.tone : ''}" ${opts.href ? `data-href="${opts.href}" role="link" tabindex="0"` : ''}><span class="kpi-l">${esc(label)}</span><strong class="kpi-v">${value}</strong>${sub ? `<span class="kpi-s">${sub}</span>` : ''}${opts.trend != null ? `<span class="trend ${opts.trend >= 0 ? 'up' : 'down'}">${opts.trend >= 0 ? '▲' : '▼'} ${Math.abs(opts.trend * 100).toFixed(1)}%</span>` : ''}</div>`;
  const empty = (ic, title, text = '', action = '') => `<div class="empty">${icon(ic)}<h3>${esc(title)}</h3>${text ? `<p>${text}</p>` : ''}${action}</div>`;
  const note = (text, tone = 'info') => `<div class="note n-${tone}">${icon(tone === 'warn' ? 'alert' : tone === 'err' ? 'alert' : tone === 'ok' ? 'check' : 'info')}<div>${text}</div></div>`;
  const guard = (perm) => A.can(perm) ? '' : 'disabled title="Your role can’t do this"';
  const tabs = (items, active) => `<nav class="tabs" role="tablist">${items.map(([href, label, key, count]) => `<a role="tab" href="${href}" class="${key === active ? 'on' : ''}" ${key === active ? 'aria-selected="true"' : ''}>${esc(label)}${count != null ? `<span class="tcount">${count}</span>` : ''}</a>`).join('')}</nav>`;
  const pageHead = (eyebrow, title, sub = '', actions = '') => `<header class="phead"><div><span class="eyebrow">${esc(eyebrow)}</span><h1 tabindex="-1">${title}</h1>${sub ? `<p class="muted">${sub}</p>` : ''}</div>${actions ? `<div class="phead-act">${actions}</div>` : ''}</header>`;

  /* ---------------- data table ---------------- */
  const TS = {}; // table state by id
  function tstate(id, def = {}) { return TS[id] || (TS[id] = Object.assign({ sort: null, dir: -1, page: 1, q: '', size: 15, sel: [] }, def)); }
  function table(cfg) {
    const st = tstate(cfg.id, cfg.def);
    let rows = cfg.rows.slice();
    if (st.q && cfg.search) { const q = st.q.toLowerCase(); rows = rows.filter(r => cfg.search(r).toLowerCase().includes(q)); }
    if (st.sort) { const col = cfg.cols.find(c => c.k === st.sort); if (col) { const v = col.sortVal || ((r) => r[col.k]); rows.sort((a, b) => { const x = v(a), y = v(b); return (x > y ? 1 : x < y ? -1 : 0) * st.dir; }); } }
    const total = rows.length; const pages = Math.max(1, Math.ceil(total / st.size)); st.page = Math.min(st.page, pages);
    const view = cfg.noPage ? rows : rows.slice((st.page - 1) * st.size, st.page * st.size);
    const key = cfg.key || ((r) => r.id);
    st.sel = st.sel.filter(id => rows.some(r => String(key(r)) === id));
    const allSel = view.length && view.every(r => st.sel.includes(String(key(r))));
    const tools = `<div class="tbl-tools">${cfg.search ? `<label class="tsearch">${icon('search')}<input type="search" placeholder="${esc(cfg.placeholder || 'Search…')}" value="${esc(st.q)}" data-tbl-q="${cfg.id}" aria-label="Search table"></label>` : ''}${cfg.filters || ''}<span class="grow"></span>
      ${st.sel.length && cfg.bulk ? `<span class="bulk"><strong>${st.sel.length} selected</strong>${cfg.bulk.map(b => `<button class="btn sm ${b.tone || 'secondary'}" data-act="${b.act}" data-t="${cfg.id}" ${b.perm ? guard(b.perm) : ''}>${esc(b.label)}</button>`).join('')}<button class="btn sm ghost" data-act="tbl-clear" data-t="${cfg.id}">Clear</button></span>` : ''}
      ${cfg.csv ? `<button class="btn sm secondary" data-act="tbl-csv" data-t="${cfg.id}">${icon('download')}Export CSV</button>` : ''}${cfg.actions || ''}</div>`;
    const head = `<tr>${cfg.selectable ? `<th class="tsel"><input type="checkbox" aria-label="Select all on page" data-act="tbl-selall" data-t="${cfg.id}" ${allSel ? 'checked' : ''}></th>` : ''}${cfg.cols.map(c => `<th class="${c.align || ''}" style="${c.w ? 'width:' + c.w : ''}">${c.nosort ? esc(c.label) : `<button class="th-sort ${st.sort === c.k ? 'on' : ''}" data-act="tbl-sort" data-t="${cfg.id}" data-k="${c.k}">${esc(c.label)}<span aria-hidden="true">${st.sort === c.k ? (st.dir > 0 ? '▲' : '▼') : '↕'}</span></button>`}</th>`).join('')}</tr>`;
    const body = view.length ? view.map(r => { const k = String(key(r)); return `<tr ${cfg.rowAct ? `data-act="${cfg.rowAct}" data-id="${esc(k)}" tabindex="0"` : ''} class="${cfg.rowAct ? 'clickable' : ''} ${cfg.rowClass ? cfg.rowClass(r) : ''}">${cfg.selectable ? `<td class="tsel"><input type="checkbox" aria-label="Select row" data-act="tbl-sel" data-t="${cfg.id}" data-id="${esc(k)}" ${st.sel.includes(k) ? 'checked' : ''}></td>` : ''}${cfg.cols.map(c => `<td class="${c.align || ''}">${c.render ? c.render(r) : esc(r[c.k])}</td>`).join('')}</tr>`; }).join('')
      : `<tr><td colspan="${cfg.cols.length + (cfg.selectable ? 1 : 0)}">${empty('search', cfg.emptyTitle || 'Nothing here', cfg.emptyText || (st.q ? 'No rows match your search.' : ''))}</td></tr>`;
    const pager = cfg.noPage || total <= st.size ? `<div class="pager"><span class="muted">${A.num(total)} row${total === 1 ? '' : 's'}</span></div>` : `<div class="pager"><span class="muted">${(st.page - 1) * st.size + 1}–${Math.min(total, st.page * st.size)} of ${A.num(total)}</span><span class="grow"></span>
      <label class="muted small">Rows <select data-act="tbl-size" data-t="${cfg.id}">${[10, 15, 25, 50, 100].map(n => `<option ${n === st.size ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
      <button class="btn sm ghost" data-act="tbl-page" data-t="${cfg.id}" data-p="${st.page - 1}" ${st.page <= 1 ? 'disabled' : ''} aria-label="Previous page">${icon('chevL')}</button><span class="small">Page ${st.page} / ${pages}</span><button class="btn sm ghost" data-act="tbl-page" data-t="${cfg.id}" data-p="${st.page + 1}" ${st.page >= pages ? 'disabled' : ''} aria-label="Next page">${icon('chevR')}</button></div>`;
    TABLES[cfg.id] = { cfg, rows };
    return `<div class="tbl-wrap" id="tbl-${cfg.id}">${cfg.noTools ? '' : tools}<div class="tbl-scroll"><table class="tbl">${'<thead>' + head + '</thead>'}<tbody>${body}</tbody></table></div>${pager}</div>`;
  }
  const TABLES = {};
  function csvFor(id) {
    const t = TABLES[id]; if (!t) return;
    const cols = t.cfg.cols.filter(c => !c.nocsv);
    const val = (c, r) => { const v = c.csv ? c.csv(r) : c.sortVal ? c.sortVal(r) : r[c.k]; return v == null ? '' : String(v).replace(/<[^>]+>/g, ''); };
    const lines = [cols.map(c => c.label)].concat(t.rows.map(r => cols.map(c => val(c, r)))).map(a => a.map(v => /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v).join(','));
    download(id + '-' + A.isoDate(Date.now()) + '.csv', lines.join('\n'), 'text/csv');
    A.audit('export', 'table:' + id, `Exported ${t.rows.length} rows to CSV`);
  }
  function download(name, text, type = 'application/json') { const b = new Blob([text], { type }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); }

  /* ---------------- dialogs ---------------- */
  let lastFocus = null;
  function modal(title, body, opts = {}) {
    lastFocus = document.activeElement; const root = document.getElementById('overlay');
    root.innerHTML = `<div class="ov-bg" data-act="ov-close"></div><div class="${opts.drawer ? 'drawer' : 'modal'} ${opts.wide ? 'wide' : ''}" role="dialog" aria-modal="true" aria-labelledby="ov-title">
      <header class="ov-head"><div><h2 id="ov-title">${title}</h2>${opts.sub ? `<p class="muted small">${opts.sub}</p>` : ''}</div><button class="icon-btn" data-act="ov-close" aria-label="Close">${icon('x')}</button></header>
      <div class="ov-body">${body}</div>${opts.foot ? `<footer class="ov-foot">${opts.foot}</footer>` : ''}</div>`;
    root.hidden = false; document.body.classList.add('ov-open');
    setTimeout(() => { const f = root.querySelector('[autofocus], input:not([type=hidden]), select, textarea, button:not(.icon-btn)'); (f || root.querySelector('.icon-btn')).focus(); }, 30);
  }
  const drawer = (title, body, opts = {}) => modal(title, body, Object.assign({ drawer: true }, opts));
  function close() { const root = document.getElementById('overlay'); root.hidden = true; root.innerHTML = ''; document.body.classList.remove('ov-open'); if (lastFocus && lastFocus.focus) try { lastFocus.focus(); } catch (e) { /* ignore */ } }
  let confirmFn = null;
  function confirm(title, text, fn, opts = {}) {
    confirmFn = fn;
    modal(title, `<p>${text}</p>${opts.reason ? `<div class="field"><label for="cf-reason">Reason <span class="req">required</span></label><textarea id="cf-reason" rows="2" placeholder="Recorded in the audit log"></textarea></div>` : ''}`,
      { foot: `<button class="btn ghost" data-act="ov-close">Cancel</button><button class="btn ${opts.danger ? 'danger' : ''}" data-act="confirm-yes">${esc(opts.ok || 'Confirm')}</button>` });
  }
  function runConfirm() { const r = document.getElementById('cf-reason'); if (r && !r.value.trim()) { r.focus(); toast('Add a reason first', 'err'); return; } const f = confirmFn; confirmFn = null; close(); if (f) f(r ? r.value.trim() : ''); }
  function toast(msg, tone = 'ok') {
    const root = document.getElementById('toasts'); const t = document.createElement('div'); t.className = 'toast t-' + tone; t.setAttribute('role', tone === 'err' ? 'alert' : 'status');
    t.innerHTML = `${icon(tone === 'err' ? 'alert' : tone === 'info' ? 'info' : 'check')}<span>${esc(msg)}</span>`; root.appendChild(t);
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 300); }, 3200);
  }

  /* ---------------- form fields ---------------- */
  const attrs = (o = {}) => Object.entries(o).filter(([, v]) => v !== false && v != null).map(([k, v]) => v === true ? k : `${k}="${esc(v)}"`).join(' ');
  let fid = 0;
  function field(label, control, opts = {}) { return `<div class="field ${opts.cls || ''}"><label ${opts.for ? `for="${opts.for}"` : ''}>${esc(label)}${opts.req ? ' <span class="req">*</span>' : ''}${opts.opt ? ' <span class="opt">optional</span>' : ''}</label>${control}${opts.hint ? `<small class="hint">${opts.hint}</small>` : ''}</div>`; }
  function input(label, name, value, opts = {}) { const id = 'f' + (++fid); return field(label, `<input id="${id}" name="${name}" value="${esc(value == null ? '' : value)}" ${attrs(Object.assign({ type: 'text' }, opts.attrs))}>`, Object.assign({ for: id }, opts)); }
  function moneyIn(label, name, cents, opts = {}) { const id = 'f' + (++fid); return field(label, `<div class="affix"><span>$</span><input id="${id}" name="${name}" type="number" step="0.01" min="0" value="${cents == null ? '' : (cents / 100).toFixed(2)}" ${attrs(opts.attrs)}></div>`, Object.assign({ for: id }, opts)); }
  function area(label, name, value, opts = {}) { const id = 'f' + (++fid); return field(label, `<textarea id="${id}" name="${name}" rows="${opts.rows || 3}" ${attrs(opts.attrs)}>${esc(value || '')}</textarea>`, Object.assign({ for: id }, opts)); }
  function select(label, name, options, value, opts = {}) { const id = 'f' + (++fid); const o = options.map(x => Array.isArray(x) ? x : [x, x]); return field(label, `<select id="${id}" name="${name}" ${attrs(opts.attrs)}>${o.map(([v, l]) => `<option value="${esc(v)}" ${String(v) === String(value) ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>`, Object.assign({ for: id }, opts)); }
  function toggle(label, name, on, opts = {}) { return `<label class="switch ${opts.cls || ''}"><input type="checkbox" name="${name}" ${on ? 'checked' : ''} ${attrs(opts.attrs)}><span class="sw" aria-hidden="true"></span><span><strong>${esc(label)}</strong>${opts.hint ? `<small>${opts.hint}</small>` : ''}</span></label>`; }
  function checks(label, name, options, values = [], opts = {}) { const o = options.map(x => Array.isArray(x) ? x : [x, x]); return `<fieldset class="field checks ${opts.cls || ''}"><legend>${esc(label)}${opts.hint ? ` <small class="hint">${opts.hint}</small>` : ''}</legend><div class="chk-row">${o.map(([v, l]) => `<label class="chk"><input type="checkbox" name="${name}" value="${esc(v)}" ${(values || []).map(String).includes(String(v)) ? 'checked' : ''}><span>${esc(l)}</span></label>`).join('')}</div></fieldset>`; }
  function formData(form) {
    const o = {}; const fd = new FormData(form);
    for (const [k, v] of fd.entries()) { if (k in o) { o[k] = [].concat(o[k], v); } else o[k] = v; }
    form.querySelectorAll('input[type=checkbox]').forEach(c => { if (!c.value || c.value === 'on') o[c.name] = c.checked; else if (!(c.name in o)) o[c.name] = []; else if (!Array.isArray(o[c.name])) o[c.name] = [o[c.name]]; });
    return o;
  }
  const cents = (v) => v === '' || v == null ? null : Math.round(parseFloat(v) * 100);

  /* ---------------- charts (SVG) ---------------- */
  function bars(series, opts = {}) {
    const w = 640, h = opts.h || 200, pad = 26; const max = Math.max(1, ...series.map(s => s.v)); const bw = (w - pad) / series.length;
    const fmt = opts.fmt || ((v) => A.num(v));
    return `<svg class="chart" viewBox="0 0 ${w} ${h + 30}" role="img" aria-label="${esc(opts.label || 'Bar chart')}">
      ${[0.25, 0.5, 0.75, 1].map(f => `<line x1="${pad}" x2="${w}" y1="${h - h * f * 0.9}" y2="${h - h * f * 0.9}" class="grid"/><text x="0" y="${h - h * f * 0.9 + 4}" class="axis">${esc(opts.axis ? opts.axis(max * f) : '')}</text>`).join('')}
      ${series.map((s, i) => { const bh = Math.max(2, (s.v / max) * h * 0.9); const x = pad + i * bw + bw * 0.18; return `<g><rect x="${x}" y="${h - bh}" width="${bw * 0.64}" height="${bh}" rx="4" class="${s.cls || 'bar'}"><title>${esc(s.label)}: ${esc(fmt(s.v))}</title></rect>${series.length <= 31 && (series.length <= 14 || i % 3 === 0) ? `<text x="${x + bw * 0.32}" y="${h + 18}" text-anchor="middle" class="axis">${esc(s.label)}</text>` : ''}</g>`; }).join('')}</svg>`;
  }
  function hbars(items, opts = {}) {
    const max = Math.max(1, ...items.map(i => i.v)); const fmt = opts.fmt || ((v) => A.num(v));
    return `<ul class="hbars">${items.map(i => `<li><span class="hb-l">${esc(i.label)}</span><span class="hb-track"><span class="hb-fill ${i.cls || ''}" style="width:${(i.v / max * 100).toFixed(1)}%"></span></span><span class="hb-v">${esc(fmt(i.v))}${i.sub ? `<small>${esc(i.sub)}</small>` : ''}</span></li>`).join('')}</ul>`;
  }
  function donut(parts, opts = {}) {
    const total = Math.max(1, A.sum(parts, p => p.v)); let acc = 0; const r = 42, c = 2 * Math.PI * r; const cols = ['#a61932', '#e40032', '#d9a77a', '#87d3e1', '#c5d800', '#6b5b5e', '#2b3928'];
    return `<div class="donut"><svg viewBox="0 0 110 110" role="img" aria-label="${esc(opts.label || 'Breakdown')}"><circle cx="55" cy="55" r="${r}" class="d-bg"/>${parts.map((p, i) => { const len = p.v / total * c; const s = `<circle cx="55" cy="55" r="${r}" stroke="${p.color || cols[i % cols.length]}" stroke-dasharray="${len} ${c - len}" stroke-dashoffset="${-acc}" class="d-seg"><title>${esc(p.label)}: ${A.num(p.v)}</title></circle>`; acc += len; return s; }).join('')}<text x="55" y="52" text-anchor="middle" class="d-n">${esc(opts.center || A.num(total))}</text><text x="55" y="67" text-anchor="middle" class="d-l">${esc(opts.centerLabel || 'total')}</text></svg>
      <ul class="legend">${parts.map((p, i) => `<li><span class="sw-dot" style="background:${p.color || cols[i % cols.length]}"></span>${esc(p.label)}<strong>${opts.fmt ? opts.fmt(p.v) : A.num(p.v)}</strong><small>${(p.v / total * 100).toFixed(0)}%</small></li>`).join('')}</ul></div>`;
  }
  function spark(vals, opts = {}) { const w = 120, h = 32; const max = Math.max(1, ...vals), min = Math.min(...vals); const pts = vals.map((v, i) => `${(i / Math.max(1, vals.length - 1) * w).toFixed(1)},${(h - ((v - min) / Math.max(1, max - min)) * (h - 4) - 2).toFixed(1)}`).join(' '); return `<svg class="spark" viewBox="0 0 ${w} ${h}" aria-hidden="true"><polyline points="${pts}" fill="none" stroke="${opts.color || '#a61932'}" stroke-width="2"/></svg>`; }
  const meter = (v, max, cls = '') => `<span class="meter ${cls}"><span style="width:${Math.min(100, max ? v / max * 100 : 0).toFixed(1)}%"></span></span>`;

  window.UI = { icon, badge, status, kpi, empty, note, guard, tabs, pageHead, table, tstate, TS, TABLES, csvFor, download, modal, drawer, close, confirm, runConfirm, toast, field, input, moneyIn, area, select, toggle, checks, formData, cents, bars, hbars, donut, spark, meter, attrs };
})();
