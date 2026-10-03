import { captureViewState, restoreViewState } from '/view-state.mjs';
const $ = (id) => document.getElementById(id);
const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon = (name) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${({attention:'<path d="M4 5h16v14H4zM8 9h8M8 13h5"/>',projects:'<path d="M3 7V5h6l2 2h10v13H3z"/>',sources:'<circle cx="6" cy="12" r="3"/><circle cx="18" cy="6" r="3"/><circle cx="18" cy="18" r="3"/><path d="m9 11 6-4m-6 6 6 4"/>',refresh:'<path d="M20 8a8 8 0 1 0 1 6M20 3v5h-5"/>',external:'<path d="M14 3h7v7M21 3 10 14M10 5H4v15h15v-6"/>'})[name]}</svg>`;
const fmt = (value) => value ? new Intl.DateTimeFormat('en', {month:'short',day:'numeric',hour:'numeric',minute:'2-digit',timeZone:'UTC'}).format(new Date(value)) + ' UTC' : 'Not checked';
const date = (value) => new Intl.DateTimeFormat('en',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(value));
let currentView = null, stateVersion = null, csrfToken = null, pendingCommand = null, busy = false, interactionSerial = 0, storageIssue = null, selectedItem = null, selectedProject = null, filter = 'open', search = '', noticeTimer, undoItem = null;
const demo = {view:()=>currentView};
const PENDING_KEY = 'curve.synthetic-attention.v02.pending-command';
try { pendingCommand = JSON.parse(sessionStorage.getItem(PENDING_KEY) ?? 'null'); } catch { pendingCommand = null; }
function page() { return ['attention','projects','sources'].includes(location.hash.slice(1)) ? location.hash.slice(1) : 'attention'; }
function link(url, label) { return `<a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${escape(label)}</a>`; }
function demoControls() {
  return `<details class="demo-controls"><summary>Try the demo scenarios</summary><div class="controls-body"><p>Simulate a changed source, missing coverage or time passing. No real source is contacted. Reviews persist in the shared local store across app and MCP restarts. Reset resets the synthetic view; command receipts remain in the local journal.</p><div class="demo-buttons"><button class="button" data-action="material-change">Change release details</button><button class="button" data-action="advance-day">Advance one day</button><button class="button" data-action="partial-refresh">Check one item only</button><button class="button" data-action="failed-refresh">Simulate source failure</button><button class="button" data-action="reset">Reset demo</button></div></div></details>`;
}
function attention(view) {
  const active = view.items.filter((i) => i.status === 'open').length;
  const shown = view.items.filter((i) => (filter === 'all' || i.status === filter) && `${i.title} ${i.projectTitle} ${i.summary}`.toLowerCase().includes(search.toLowerCase()));
  if (!shown.some((i) => i.id === selectedItem)) selectedItem = shown[0]?.id ?? null;
  const item = shown.find((i) => i.id === selectedItem);
  const counts = (value) => value === 'all' ? view.items.length : view.items.filter((i) => i.status === value).length;
  const emptyText = search ? 'No items match this search. Try a different word or clear the search.' : filter === 'open' ? 'You have reviewed every current item. New material changes will appear here.' : filter === 'snoozed' ? 'Snooze an item to set it aside for one day. A material change can bring it back sooner.' : 'Items you handle for now will appear here. Their source tasks remain unchanged.';
  return `<header class="page-header"><div><h1>Attention</h1><p>${active ? `${active} ${active === 1 ? 'item needs' : 'items need'} a look. Start with the decisions holding work up.` : 'Nothing needs your attention in the current observations.'}</p></div><button class="button" data-action="refresh" title="Refresh synthetic observations">${icon('refresh')}Refresh demo</button></header>
  <div class="coverage-line"><span><span class="dot"></span>${view.refresh.coverage === 'failed' ? 'Last refresh failed' : 'Partial source coverage'}</span><span>Last observation ${escape(fmt(view.sources[0].lastSuccessfulAt))}</span><a href="#sources">View sources</a></div>
  <section class="review-surface" aria-label="Attention review"><div class="toolbar"><div class="filters" aria-label="Filter attention">${[['open','To review'],['snoozed','Snoozed'],['handled','Handled'],['all','All']].map(([key,label]) => `<button class="filter" data-filter="${key}" aria-pressed="${filter === key}">${label} ${counts(key)}</button>`).join('')}</div><label><span class="sr-only">Search attention</span><input id="search" class="search" type="search" placeholder="Search attention" value="${escape(search)}" autocomplete="off"></label></div><div class="review-grid"><div class="item-list" aria-label="Attention items">${shown.length ? shown.map((i) => `<button class="item-row" data-item="${escape(i.id)}" aria-pressed="${i.id === selectedItem}"><span class="item-top"><span class="item-title">${escape(i.title)}</span><span class="priority ${i.priority}">${{high:'High',medium:'Medium',low:'Low'}[i.priority]}</span></span><span class="item-sub"><span>${escape(i.projectTitle)}</span>${i.resurfaced ? '<span>Changed since review</span>' : `<span>${i.status === 'open' ? 'Needs review' : i.status === 'handled' ? 'Handled for now' : 'Snoozed'}</span>`}${i.stale ? '<span>Stale observation</span>' : ''}</span></button>`).join('') : `<div class="empty"><h2>${search ? 'No matching items' : 'All clear here'}</h2><p>${emptyText}</p>${search ? '<button class="button" data-clear-search>Clear search</button>' : ''}</div>`}</div>
  ${item ? `<article class="detail" aria-label="Selected attention item"><span class="tag">${escape(item.projectTitle)}</span>${item.resurfaced ? ' <span class="tag warn">Changed since review</span>' : ''}<h2>${escape(item.title)}</h2><p class="detail-copy">${escape(item.summary)}</p><section class="detail-section"><h3>Why it needs attention</h3><ul class="reason-list">${item.reasons.map((r) => `<li>${escape(r)}</li>`).join('')}</ul></section><section class="detail-section"><h3>Source evidence</h3><p class="small">${link(item.sourceUrl,'Open synthetic source')} <span class="muted">· ${escape(item.sourceLabel)}</span></p><div class="source-meta"><span>Observed ${escape(fmt(item.observedAt))}</span><span>${item.dueAt ? `Source due date: ${escape(fmt(item.dueAt))}` : 'No source due date available'}</span><span>Synthetic recommendation · ${Math.round(item.confidence*100)}% fixture confidence</span>${item.stale ? '<span class="priority medium">This observation is stale. Refresh before relying on it.</span>' : ''}</div></section><div class="actions">${item.status === 'open' ? `<button class="button primary" data-action="handled" data-id="${escape(item.id)}">Handled for now</button><button class="button" data-action="snooze" data-id="${escape(item.id)}">Snooze one day</button>` : `<button class="button primary" data-action="reopen" data-id="${escape(item.id)}">Return to review</button>`}</div><p class="action-note">Your review only. The source task and its history stay unchanged.</p></article>` : '<div class="detail empty"><h2>Choose an item to review</h2><p>Its reason, source and personal review actions will appear here.</p></div>'}</div></section>${demoControls()}`;
}
function projects(view) {
  if (!view.projects.some((p) => p.id === selectedProject)) selectedProject = view.projects[0]?.id ?? null;
  const project = view.projects.find((p) => p.id === selectedProject);
  return `<header class="page-header"><div><h1>Projects</h1><p>Existing work, with its original tasks and history.</p></div></header><div class="coverage-line"><span>Read-only project references</span><span>Source ownership is preserved</span></div><section class="project-layout"><div class="project-nav" aria-label="Select a project">${view.projects.map((p) => `<button class="project-tab" data-project="${escape(p.id)}" aria-pressed="${p.id === selectedProject}"><strong>${escape(p.title)}</strong><span>${p.tasks.length} observed tasks</span></button>`).join('')}</div>${project ? `<article class="project-detail"><header class="project-heading"><div><h2>${escape(project.title)}</h2><p>${link(project.sourceUrl,'Open synthetic project')} · ${escape(project.sourceLabel)}</p></div><span class="tag">Reference only</span></header><section class="project-section"><h3>Existing tasks</h3>${project.tasks.length ? project.tasks.map((t) => `<div class="task-row">${link(t.sourceUrl,t.title)}<span>${escape(t.state)}${t.stale ? ' · Stale' : ''}</span></div>`).join('') : '<p class="muted small">No readable tasks are present in this observation.</p>'}</section><section class="project-section"><h3>Source history <span class="tag warn">${project.historyCoverage === 'unknown' ? 'Coverage unknown' : project.historyCoverage === 'partial' ? 'Partial coverage' : 'Complete fixture'}</span></h3>${project.history.length ? `<ul class="history-list">${project.history.map((h) => `<li>${link(h.sourceUrl,h.title)}<time datetime="${h.occurredAt}">${escape(date(h.occurredAt))}</time></li>`).join('')}</ul>` : '<p class="small muted">Older history has not been checked. Missing evidence is not an empty history.</p>'}<p class="info-note">These events belong to the original project. Binding a project does not create past Curve approvals, import it into a governed Initiative, or change its lifecycle.</p></section></article>` : '<div class="empty"><h2>No readable projects</h2><p>Project access needs a current readable observation.</p></div>'}</section>`;
}
function sources(view) {
  return `<header class="page-header"><div><h1>Sources</h1><p>Know what was checked before trusting the queue.</p></div><button class="button" data-action="refresh" title="Refresh synthetic observations">${icon('refresh')}Refresh demo</button></header><section class="source-panel" aria-label="Source health">${view.sources.map((s) => `<article class="source-row"><div><h2>${escape(s.label)}</h2><p>${s.status === 'disabled' ? 'Not connected' : 'Synthetic local fixture'}</p></div><div class="source-description"><p>${escape(s.detail)}</p><p>Last successful observation: ${escape(fmt(s.lastSuccessfulAt))}</p></div><span class="tag ${s.coverage === 'partial' || s.coverage === 'failed' ? 'warn' : ''}">${s.status === 'disabled' ? 'Disabled' : s.coverage === 'failed' ? 'Refresh failed' : `${s.coverage[0].toUpperCase()}${s.coverage.slice(1)} coverage`}</span></article>`).join('')}</section><p class="info-note">Real mail and chat stay in a separately authorized local runtime. This pilot has no credentials, provider requests, account connection flow or source write actions. Incomplete coverage never means there is nothing left to do.</p><section class="project-section"><h2>AI access, deliberately read-only</h2><p class="info-note">The companion local MCP process reads the same saved attention, project outlook, evidence and refresh health as this interface. It cannot send messages, change tasks or approve work. The MCP process opens no network listener. Interoperability is checked with the official MCP SDK; no real source account is connected.</p></section>${demoControls()}`;
}
function notify(text, itemId = null) {
  clearTimeout(noticeTimer); undoItem = itemId;
  $('notice').innerHTML = `<span>${escape(text)}</span>${itemId ? '<button data-undo>Undo</button>' : '<button data-close-notice aria-label="Dismiss notice">Dismiss</button>'}`;
  $('notice').hidden = false;
  noticeTimer = setTimeout(() => { $('notice').hidden = true; undoItem = null; }, 10000);
}
function render(savedState=captureViewState()) {
  const view = demo.view(), current = page();
  document.querySelector('.prototype-banner span').textContent = storageIssue ?? 'Personal reviews shared with local MCP. Synthetic data only.';
  $('navigation').innerHTML = [['attention','Attention'],['projects','Projects'],['sources','Sources']].map(([key,label]) => `<a class="nav-link" href="#${key}" ${current === key ? 'aria-current="page"' : ''}>${icon(key)}<span>${label}</span>${key === 'attention' ? `<span class="nav-count">${view.items.filter((i) => i.status === 'open').length}</span>` : ''}</a>`).join('');
  $('main').innerHTML = ({attention,projects,sources})[current](view);
  restoreViewState(savedState);
  document.title = `Curve · ${current[0].toUpperCase()+current.slice(1)} pilot`;
}
function keepPending(value) {
  pendingCommand=value;
  try { if(value)sessionStorage.setItem(PENDING_KEY,JSON.stringify(value));else sessionStorage.removeItem(PENDING_KEY); } catch { /* Durable server state remains authoritative. */ }
}
async function loadState(savedState=captureViewState()) {
  const response=await fetch('/api/state',{credentials:'same-origin',cache:'no-store'});
  if(!response.ok)throw new Error('STATE_UNAVAILABLE');
  const data=await response.json();csrfToken=data.csrfToken;stateVersion=data.snapshot.version;currentView=data.snapshot.view;storageIssue=null;render(typeof savedState==='function'?savedState():savedState);
}
function retryNotice() {
  notify('Save outcome is unconfirmed. Retry the same action to reconcile it safely.');
  $('notice').insertAdjacentHTML('beforeend','<button data-retry>Retry save</button>');
}
async function execute(type, itemId, retry=false) {
  if(busy)return;
  if(pendingCommand&&!retry){retryNotice();return;}
  if(!currentView||!csrfToken){notify('The local store is unavailable. Reload after the server is running.');return;}
  const command=retry?pendingCommand:{requestId:crypto.randomUUID(),expectedVersion:stateVersion,action:{type,...(itemId?{itemId}:{})}};
  if(!command)return;
  const savedState=captureViewState(), startedAtSerial=interactionSerial, startedOnPage=page();
  const currentRenderState=()=>interactionSerial===startedAtSerial&&page()===startedOnPage?savedState:captureViewState();
  busy=true;keepPending(command);document.querySelectorAll('button').forEach((button)=>button.disabled=true);
  try {
    const response=await fetch('/api/actions',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json','X-Curve-CSRF':csrfToken},body:JSON.stringify(command)});
    const data=await response.json();
    if(!response.ok){
      if(response.status===409){keepPending(null);await loadState(currentRenderState);notify('The shared state changed. Your stale action was not applied; review the latest item.');return;}
      if(response.status===403){await loadState(currentRenderState);retryNotice();return;}
      if(response.status>=500){retryNotice();return;}
      keepPending(null);notify('That command was rejected. Reload the latest state before trying again.');return;
    }
    keepPending(null);stateVersion=data.snapshot.version;currentView=data.snapshot.view;storageIssue=null;render(currentRenderState());
    const messages={handled:'Handled for now. Source task unchanged.',snooze:'Snoozed for one day. Material changes can bring it back sooner.',reopen:'Returned to your review queue.',refresh:'Synthetic observations refreshed. Existing reviews preserved.','material-change':'Release details changed. A previous review may need another look.','advance-day':'Demo clock advanced one day. Snoozes and staleness were recalculated.','partial-refresh':'Only one item checked. Other timestamps are unchanged.','failed-refresh':'Refresh failed. Previous observations were preserved.',reset:'Synthetic view reset. The local command journal is retained.'};
    notify(data.duplicate?'The earlier save is confirmed. Shared state is up to date.':messages[command.action.type],['handled','snooze'].includes(command.action.type)?command.action.itemId:null);
    if(interactionSerial===startedAtSerial&&page()===startedOnPage&&['handled','snooze','reopen'].includes(command.action.type))document.querySelector('.item-row')?.focus();
  }catch{retryNotice();}finally{busy=false;document.querySelectorAll('button').forEach((button)=>button.disabled=false);}
}
document.addEventListener('click',(event) => {
  interactionSerial++;
  const target = event.target.closest('button'); if (!target) return;
  if (target.hasAttribute('data-retry')) execute(null,null,true);
  else if (target.dataset.action) execute(target.dataset.action,target.dataset.id);
  else if (target.dataset.filter) { filter = target.dataset.filter; render(); document.querySelector(`[data-filter="${filter}"]`)?.focus(); }
  else if (target.dataset.item) { selectedItem = target.dataset.item; render(); [...document.querySelectorAll('[data-item]')].find((n) => n.dataset.item === selectedItem)?.focus(); }
  else if (target.dataset.project) { selectedProject = target.dataset.project; render(); [...document.querySelectorAll('[data-project]')].find((n) => n.dataset.project === selectedProject)?.focus(); }
  else if (target.hasAttribute('data-clear-search')) { search = ''; render(); $('search')?.focus(); }
  else if (target.hasAttribute('data-undo') && undoItem) execute('reopen',undoItem);
  else if (target.hasAttribute('data-close-notice')) $('notice').hidden = true;
});
document.addEventListener('input',(event) => { interactionSerial++; if (event.target.id === 'search') {search = event.target.value; render();} });
window.addEventListener('hashchange',() => { interactionSerial++; if(currentView){render();$('main').focus();} });
$('main').innerHTML='<header class="page-header"><div><h1>Attention</h1><p role="status">Loading the shared synthetic workspace…</p></div></header>';
loadState().then(()=>{if(pendingCommand)retryNotice();}).catch(()=>{ $('main').innerHTML='<header class="page-header"><div><h1>Local store unavailable</h1><p>Start the local pilot server, then reload this page. No saved review has been changed.</p></div></header>'; });
