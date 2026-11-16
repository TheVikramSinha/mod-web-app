/* MOD Back Office — governance: approvals, users & roles, audit log, integrations, platform settings; HQ customers view. */
(function () {
  'use strict';
  const A = window.ADM, U = window.UI, APP = window.APP; const { PAGES, ACT, FORM } = APP; const esc = A.esc, icon = U.icon, money = A.money;
  const S = () => A.S;

  PAGES['hq/customers'] = (r) => { if (!A.can('members.view')) return APP.locked('members.view'); return APP.membersPage(r, 'hq'); };

  /* ================= Approvals ================= */
  const TYPE = { 'campaign.launch': ['megaphone', 'Campaign launch'], 'points.adjust': ['star', 'Points adjustment'], refund: ['dollar', 'Refund'], publish: ['rocket', 'Catalog publish'], 'ticket.remedy': ['chat', 'Service recovery'], 'loyalty.rules': ['settings', 'Program rule change'], 'member.credit': ['wallet', 'Service credit'], 'store.hours': ['clock', 'Store hours change'] };
  let AF = 'pending';
  PAGES['hq/approvals'] = () => {
    const all = S().approvals; const rows = all.filter(a => AF === 'all' || a.status === AF); const can = A.can('approvals.decide');
    return `${U.pageHead('Governance', 'Approvals', 'Maker-checker controls: high-impact changes are requested by one person and approved by another. Thresholds are set in Loyalty → Earn & program rules.')}
      ${can ? '' : U.note('You can see requests but your role can’t approve them. Finance or a super admin decides.', 'info')}
      <section class="card"><div class="seg">${[['pending', 'Pending'], ['approved', 'Approved'], ['rejected', 'Rejected'], ['all', 'All']].map(([v, l]) => `<button class="${AF === v ? 'on' : ''}" data-act="af" data-v="${v}">${l} <span class="tcount">${all.filter(a => v === 'all' || a.status === v).length}</span></button>`).join('')}</div>
      ${rows.length ? `<ul class="approvals">${rows.map(a => { const [ic, tl] = TYPE[a.type] || ['shield', a.type]; const self = a.byId && a.byId === A.me().id; return `<li class="ap-${a.status}"><span class="ap-ic">${icon(ic)}</span><div><strong>${esc(a.title)}</strong><small>${esc(tl)} · requested by ${esc(a.by)} · ${A.rel(a.at)}</small><p>${esc(a.detail || '')}</p>${a.decidedBy ? `<small>${a.status === 'approved' ? 'Approved' : 'Rejected'} by ${esc(a.decidedBy)} · ${A.rel(a.decidedAt)}${a.comment ? ' — “' + esc(a.comment) + '”' : ''}</small>` : ''}</div>
        <div class="ap-act">${a.status === 'pending' ? (can ? (self ? `<span class="muted small">You can’t approve your own request</span>` : `<button class="btn sm" data-act="ap-yes" data-id="${a.id}">${icon('check')}Approve</button><button class="btn sm ghost danger" data-act="ap-no" data-id="${a.id}">Reject</button>`) : U.status('pending')) : U.status(a.status)}</div></li>`; }).join('')}</ul>` : U.empty('shield', 'No requests here')}</section>`;
  };
  ACT.af = (el) => { AF = el.dataset.v; APP.render(); };
  ACT['ap-yes'] = (el) => { A.decide(el.dataset.id, true); U.toast('Approved and applied'); APP.render(); };
  ACT['ap-no'] = (el) => U.confirm('Reject this request?', 'The requester is notified with your reason.', (reason) => { const a = S().approvals.find(x => x.id === el.dataset.id); A.decide(el.dataset.id, false, reason); if (a.type === 'campaign.launch') { const c = S().campaigns.find(x => x.id === a.payload.id); if (c) c.status = 'draft'; } U.toast('Rejected'); APP.render(); }, { reason: true, danger: true, ok: 'Reject' });

  /* ================= Users & roles ================= */
  PAGES['hq/users'] = (r) => {
    if (!A.can('users.manage')) return APP.locked('users.manage');
    const tab = r.q.tab || 'users';
    const body = tab === 'users' ? `<section class="card">${U.table({ id: 'users', rows: S().users, rowAct: 'user-edit', search: u => u.name + ' ' + u.email + ' ' + u.role, csv: true, actions: `<button class="btn sm" data-act="user-new">${icon('plus')}Invite user</button>`,
        cols: [{ k: 'name', label: 'User', render: u => `<strong>${esc(u.name)}</strong><small class="block muted">${esc(u.email)}</small>` }, { k: 'role', label: 'Role', render: u => U.badge(A.ROLES[u.role].name, A.ROLES[u.role].hq ? 'brand' : 'info') }, { k: 'stores', label: 'Store scope', render: u => u.stores.length ? u.stores.map(APP.storeName).join(', ') : '<span class="muted">All (HQ)</span>', nosort: true }, { k: 'mfa', label: 'MFA', render: u => u.mfa ? U.badge('On', 'ok') : U.badge('Off', 'warn') }, { k: 'lastActive', label: 'Last active', render: u => A.rel(u.lastActive) }, { k: 'status', label: 'Status', render: u => U.status(u.status) }] })}</section>`
      : `<section class="card"><p class="muted small">Roles are fixed bundles of permissions. Store-scoped roles only see their assigned stores.</p><div class="tbl-scroll"><table class="tbl matrix"><thead><tr><th>Permission</th>${Object.values(A.ROLES).map(r => `<th class="c">${esc(r.name)}</th>`).join('')}</tr></thead><tbody>${Object.entries(A.PERMS).map(([k, l]) => `<tr><td>${esc(l)}<small class="block muted mono">${k}</small></td>${Object.values(A.ROLES).map(r => `<td class="c">${r.perms.includes(k) ? `<span class="ok-t">${icon('check')}</span>` : '<span class="muted">—</span>'}</td>`).join('')}</tr>`).join('')}</tbody></table></div></section>`;
    return `${U.pageHead('Governance', 'Users & roles', 'Who can do what. Every action is attributed to a named user in the audit log.')}${U.tabs([['#/hq/users', 'Users', 'users', S().users.length], ['#/hq/users?tab=roles', 'Roles & permissions', 'roles']], tab)}${body}`;
  };
  ACT['user-edit'] = (el) => userEditor(el.dataset.id); ACT['user-new'] = () => userEditor(null);
  function userEditor(id) {
    const u = id ? S().users.find(x => x.id === id) : { id: '', name: '', email: '', role: 'manager', stores: [], status: 'invited', mfa: false };
    U.drawer(id ? esc(u.name) : 'Invite user', `<form data-form="user-save" data-id="${esc(id || '')}"><div class="fgrid">${U.input('Full name', 'name', u.name, { attrs: { required: true } })}${U.input('Work email', 'email', u.email, { attrs: { type: 'email', required: true } })}</div>
      ${U.select('Role', 'role', Object.entries(A.ROLES).map(([k, r]) => [k, r.name + ' — ' + r.desc]), u.role)}${U.checks('Store scope (store-level roles)', 'stores', S().catalog.STORES.map(s => [s.id, s.name]), u.stores)}
      <div class="fgrid">${U.select('Status', 'status', [['active', 'Active'], ['invited', 'Invited'], ['inactive', 'Deactivated']], u.status)}${U.toggle('Require MFA', 'mfa', u.mfa)}</div>
      <div class="sticky-foot"><button class="btn" type="submit">${id ? 'Save user' : 'Send invite'}</button>${id && id !== A.me().id ? `<button type="button" class="btn ghost danger" data-act="user-off" data-id="${id}">Deactivate</button>` : ''}</div></form>`);
  }
  FORM['user-save'] = (d, f) => {
    let u = S().users.find(x => x.id === f.dataset.id); const isNew = !u;
    if (S().users.some(x => x.email.toLowerCase() === d.email.toLowerCase() && x !== u)) return U.toast('Email already in use', 'err');
    if (isNew) { u = { id: A.uid('u'), lastActive: null }; S().users.push(u); }
    const stores = [].concat(d.stores || []); if (!A.ROLES[d.role].hq && !stores.length) return U.toast('Store roles need at least one store', 'err');
    if (u.id === A.me().id && d.role !== u.role) return U.toast('You can’t change your own role', 'err');
    Object.assign(u, { name: d.name, email: d.email, role: d.role, stores: A.ROLES[d.role].hq ? [] : stores, status: d.status, mfa: !!d.mfa });
    A.audit(isNew ? 'user.invite' : 'user.update', 'user:' + u.id, `${u.name} · ${A.ROLES[u.role].name}`); U.close(); U.toast(isNew ? 'Invite sent (simulated)' : 'User saved'); APP.render();
  };
  ACT['user-off'] = (el) => U.confirm('Deactivate this user?', 'They lose access immediately. History stays in the audit log.', (reason) => { const u = S().users.find(x => x.id === el.dataset.id); u.status = 'inactive'; A.audit('user.deactivate', 'user:' + u.id, `${u.name} — ${reason}`); U.close(); APP.render(); }, { danger: true, reason: true, ok: 'Deactivate' });

  /* ================= Audit log ================= */
  PAGES['hq/audit'] = () => {
    if (!A.can('audit.view')) return APP.locked('audit.view');
    return `${U.pageHead('Governance', 'Audit log', 'Immutable record of every change: who, what, when and in which role. Retained for ' + S().settings.dataRetentionDays + ' days.')}
      <section class="card">${U.table({ id: 'audit', rows: S().audit, search: a => a.user + ' ' + a.action + ' ' + a.entity + ' ' + a.detail, csv: true, def: { size: 25 },
        cols: [{ k: 'at', label: 'When', render: a => `${A.fmtDT(a.at)}<small class="block muted">${A.rel(a.at)}</small>`, csv: a => new Date(a.at).toISOString() }, { k: 'user', label: 'User', render: a => `${esc(a.user)}<small class="block muted">${esc(a.role)}</small>` }, { k: 'action', label: 'Action', render: a => `<span class="mono">${esc(a.action)}</span>` }, { k: 'entity', label: 'Object', render: a => `<span class="mono small">${esc(a.entity)}</span>` }, { k: 'detail', label: 'Detail' }] })}</section>`;
  };

  /* ================= Integrations ================= */
  PAGES['hq/integrations'] = () => {
    if (!A.can('settings.edit')) return APP.locked('settings.edit');
    return `${U.pageHead('Governance', 'Integrations', 'Connections to POS, payments, delivery, messaging, legacy loyalty and finance. Simulated in this prototype.')}
      <div class="int-grid">${S().integrations.map(i => `<article class="card int"><header><span class="int-ic">${icon('plug')}</span><div><h2>${esc(i.name)}</h2><small class="muted">${esc(i.vendor)}</small></div>${U.status(i.status)}</header><p class="small">${esc(i.note)}</p><p class="muted small">Last sync ${A.rel(i.lastSync)}</p><div class="btn-row"><button class="btn sm secondary" data-act="int-sync" data-id="${i.id}" ${i.status === 'not connected' ? 'disabled' : ''}>${icon('refresh')}Sync now</button><button class="btn sm ghost" data-act="int-toggle" data-id="${i.id}">${i.status === 'not connected' ? 'Connect' : 'Disconnect'}</button></div></article>`).join('')}</div>`;
  };
  ACT['int-sync'] = (el) => { const i = S().integrations.find(x => x.id === el.dataset.id); i.lastSync = Date.now(); if (i.status === 'degraded') i.status = 'connected'; A.audit('integration.sync', 'integration:' + i.id, `${i.name} synced`); U.toast(`${i.name} synced`); APP.render(); };
  ACT['int-toggle'] = (el) => { const i = S().integrations.find(x => x.id === el.dataset.id); const on = i.status === 'not connected'; U.confirm(`${on ? 'Connect' : 'Disconnect'} ${esc(i.name)}?`, on ? 'Credentials are stored in the vault (simulated).' : 'Data stops flowing until reconnected.', () => { i.status = on ? 'connected' : 'not connected'; i.lastSync = on ? Date.now() : i.lastSync; A.audit('integration.' + (on ? 'connect' : 'disconnect'), 'integration:' + i.id, i.name); APP.render(); }, { danger: !on }); };

  /* ================= Settings ================= */
  PAGES['hq/settings'] = () => {
    if (!A.can('settings.edit')) return APP.locked('settings.edit');
    const st = S().settings;
    return `${U.pageHead('Governance', 'Platform settings', 'Security, privacy and operational defaults for the whole back office.')}
      <form data-form="settings" class="grid g-1-1"><section class="card"><h2>Organisation</h2>${U.input('Brand name', 'brandName', st.brandName)}<div class="fgrid">${U.select('Currency', 'currency', ['USD', 'CAD'], st.currency)}${U.select('HQ time zone', 'timezone', ['America/Los_Angeles', 'America/Denver', 'America/Chicago', 'America/New_York'], st.timezone)}</div>${U.input('Support hours', 'supportHours', st.supportHours)}</section>
        <section class="card"><h2>Security</h2><div class="fgrid">${U.input('Session timeout (min)', 'timeoutMin', st.session.timeoutMin, { attrs: { type: 'number', min: 5, max: 480 } })}${U.toggle('Require MFA for HQ roles', 'requireMfa', st.session.requireMfa)}</div>${U.input('IP allowlist (CIDR, comma-separated)', 'ipAllowlist', st.session.ipAllowlist, { opt: true })}</section>
        <section class="card"><h2>Privacy</h2>${U.toggle('Mask guest contact details for roles without PII access', 'piiMasking', st.piiMasking)}${U.input('Data retention (days)', 'dataRetentionDays', st.dataRetentionDays, { attrs: { type: 'number', min: 90 } })}<p class="muted small">Member export and delete requests are handled from each member’s profile and logged.</p></section>
        <section class="card"><h2>Operations</h2><div class="fgrid">${U.input('Auto-accept orders after (sec)', 'orderAutoAcceptSec', st.orderAutoAcceptSec, { attrs: { type: 'number', min: 0 } })}${U.input('Max active orders per store', 'maxActivePerStore', st.maxActivePerStore, { attrs: { type: 'number', min: 5 } })}</div><p class="muted small">Order stage timings, tips and scheduling live in Menu catalog → Sizes, crusts & ordering.</p></section>
        <div class="sticky-foot"><button class="btn" type="submit">Save settings</button></div></form>`;
  };
  FORM.settings = (d) => { const st = S().settings; Object.assign(st, { brandName: d.brandName, currency: d.currency, timezone: d.timezone, supportHours: d.supportHours, piiMasking: !!d.piiMasking, dataRetentionDays: +d.dataRetentionDays, orderAutoAcceptSec: +d.orderAutoAcceptSec, maxActivePerStore: +d.maxActivePerStore }); Object.assign(st.session, { timeoutMin: +d.timeoutMin, requireMfa: !!d.requireMfa, ipAllowlist: d.ipAllowlist }); A.audit('settings.update', 'settings', 'Updated platform settings'); U.toast('Settings saved'); APP.render(); };
})();
