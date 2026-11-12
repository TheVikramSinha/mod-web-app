/* Local prototype enhancements. Recipe visuals and calories are illustrative. */
function pizzaPortions(opts){
 return '<div class="portion-picks">'+MENU_TOPPINGS.map(t=>'<label data-portion-row="'+esc(t)+'">'+esc(t)+'<select name="portion-'+esc(t)+'" aria-label="'+esc(t)+' portion">'+['Light','Regular','Extra'].map(v=>'<option '+((opts.portions?.[t]||'Regular')===v?'selected':'')+'>'+v+'</option>').join('')+'</select></label>').join('')+'</div>';
}
function builderOptions(form){
 const d=new FormData(form),toppings=d.getAll('topping');
 return readHalfOptions(form,{size:d.get('size'),crust:d.get('crust'),sauce:d.get('sauce'),saucePlacement:d.get('sauce-placement-'+d.get('sauce'))||'Whole',saucePortion:d.get('sauce-portion-'+d.get('sauce'))||'Regular',placements:Object.fromEntries(toppings.map(t=>[t,d.get('placement-'+t)||'Whole'])),toppings,portions:Object.fromEntries(toppings.map(t=>[t,d.get('portion-'+t)||'Regular']))});
}
function updatePizzaLab(){
 const f=document.getElementById('custom-form');if(!f)return;
 const o=builderOptions(f),colors=['#a52419','#3f773e','#e5c775','#8d5940','#ce5936'];
 f.querySelectorAll('[data-portion-row]').forEach(el=>el.hidden=!o.toppings.includes(el.dataset.portionRow));
 const dots=o.toppings.flatMap((t,i)=>Array.from({length:o.portions[t]==='Extra'?14:o.portions[t]==='Light'?4:8},(_,j)=>{
 const angle=(j*2.4+i)*2.1,r=22+(j*17+i*11)%64;
 return '<circle cx="'+(o.placements?.[t]==='Left'?100-Math.abs(Math.cos(angle)*r):o.placements?.[t]==='Right'?100+Math.abs(Math.cos(angle)*r):100+Math.cos(angle)*r)+'" cy="'+(100+Math.sin(angle)*r)+'" r="5" fill="'+(/mozzarella|cheddar|parmesan|asiago|feta|gorgonzola/i.test(t)?'#fff3bc':/basil|pepper|spinach|arugula/i.test(t)?'#3f773e':/mushroom|olive/i.test(t)?'#796448':colors[i%colors.length])+'"/>';
 })).join('');
 const preview=f.querySelector('#pizza-lab');
 if(preview)preview.innerHTML='<svg viewBox="0 0 200 200" role="img" aria-label="Illustrative pizza with '+o.toppings.length+' toppings"><circle cx="100" cy="100" r="97" fill="#d9a35b"/><circle cx="100" cy="100" r="85" fill="'+(o.sauce==='No sauce'?'#f4da9a':o.sauce==='White sauce'?'#fff3d5':'#bd402b')+'"/><circle cx="100" cy="100" r="77" fill="#f3d689"/>'+dots+'</svg><p>'+money(unit({id:f.dataset.id,options:o}))+'</p><small>Illustrative preview · see menu for standard-recipe nutrition</small>';
}
function tipControls(){
 const base=Math.max(0,totals().subtotal-totals().merchandiseDiscount);
 return '<p class="small muted">Percentages use food subtotal after discounts, before tax and delivery.</p><div class="option-grid">'+[0,15,18,20,25].map(n=>'<button type="button" class="btn secondary" data-tip-percent="'+n+'" aria-pressed="'+(checkout.tipPercent===n)+'">'+(n?n+'% · '+money(Math.round(base*n/100)):'No tip')+'</button>').join('')+'</div><label class="field">Custom tip (USD)<input id="custom-tip" type="number" min="0" max="999" step=".01" value="'+(checkout.tip/100).toFixed(2)+'"></label>';
}
function reviewCharts(orders){
 const live=orders.filter(o=>!o.canceled),buckets=Array.from({length:24},()=>0),mix={};
 for(const o of live){const hour=Number(new Intl.DateTimeFormat('en-US',{hour:'numeric',hourCycle:'h23',timeZone:storeById(o.storeId)?.timezone||'America/Los_Angeles'}).format(o.created));buckets[hour]+=orderSales(o);for(const x of o.items){const c=storeById(o.storeId)?.menu.find(p=>p.id===x.id)?.category||'Other';mix[c]=(mix[c]||0)+x.qty;}}
 const max=Math.max(1,...buckets);
 return '<section class="card review-analytics"><h2>When the ovens get busy</h2><p class="small muted">Net merchandise sales by store-local hour · current filters · canceled orders excluded</p><svg viewBox="0 0 600 170" role="img" aria-label="Hourly sales chart">'+buckets.map((n,i)=>'<rect x="'+(i*25+2)+'" y="'+(140-n/max*120)+'" width="19" height="'+(n/max*120)+'" rx="3" fill="#c4122f"><title>'+i+':00 · '+money(n)+'</title></rect>'+(i%4===0?'<text x="'+i*25+'" y="160" font-size="12">'+i+':00</text>':'')).join('')+'</svg><details><summary>Hourly values</summary><div class="analytics-values">'+buckets.map((n,i)=>'<span>'+i+':00 <b>'+money(n)+'</b></span>').join('')+'</div></details><h3>What people are ordering</h3><div class="analytics-values">'+Object.entries(mix).map(([c,n])=>'<span>'+esc(c)+' <b>'+n+' items</b></span>').join('')+'</div></section>';
}
let kitchenStation='All',kitchenAudio=false,kitchenAudioContext;
function kitchenTools(){return '<div class="card row wrap"><label>Station <select id="kitchen-station">'+['All','Pizza line','Salad station','Oven / expo'].map(v=>'<option '+(kitchenStation===v?'selected':'')+'>'+v+'</option>').join('')+'</select></label><button class="btn secondary" data-kitchen-sound aria-pressed="'+kitchenAudio+'">'+(kitchenAudio?'Mute order chime':'Enable order chime')+'</button><span class="small muted">Sample SLA: 8 min warning · 13 min overdue</span></div>';}
function stationMatch(o){return kitchenStation==='All'||kitchenStation==='Oven / expo'&&stage(o)>=2||kitchenStation==='Pizza line'&&o.items.some(x=>storeById(o.storeId)?.menu.find(p=>p.id===x.id)?.category==='Pizzas')||kitchenStation==='Salad station'&&o.items.some(x=>storeById(o.storeId)?.menu.find(p=>p.id===x.id)?.category==='Salads');}
function ticketAge(o){const minutes=Math.max(0,Math.floor((Date.now()-(o.started||o.created))/60000));return '<span class="pill '+(minutes>=13?'red':minutes>=8?'age-warning':'green')+'">'+((o.started||0)>Date.now()?'Scheduled':minutes+' min · '+(minutes>=13?'Overdue':minutes>=8?'Watch':'On track'))+'</span>';}
function chime(){if(!kitchenAudioContext)return;[660,880].forEach((frequency,i)=>{const osc=kitchenAudioContext.createOscillator(),gain=kitchenAudioContext.createGain(),at=kitchenAudioContext.currentTime+i*.18;osc.frequency.value=frequency;gain.gain.setValueAtTime(.08,at);gain.gain.exponentialRampToValueAtTime(.001,at+.16);osc.connect(gain);gain.connect(kitchenAudioContext.destination);osc.start(at);osc.stop(at+.18);});}
document.addEventListener('input',e=>{
 if(e.target.closest('#custom-form'))updatePizzaLab();
 if(e.target.id==='custom-tip'){checkout.tipPercent=null;if(e.target.validity.valid){checkout.tip=Math.round(Number(e.target.value)*100);refreshCheckout();}}
});
document.addEventListener('change',e=>{if(e.target.id==='kitchen-station'){kitchenStation=e.target.value;render();}});
document.addEventListener('click',async e=>{
 const tip=e.target.closest('[data-tip-percent]');if(tip){checkout.tipPercent=Number(tip.dataset.tipPercent);const t=totals();checkout.tip=Math.round(Math.max(0,t.subtotal-t.merchandiseDiscount)*checkout.tipPercent/100);document.getElementById('custom-tip').value=(checkout.tip/100).toFixed(2);document.querySelectorAll('[data-tip-percent]').forEach(b=>b.setAttribute('aria-pressed',b===tip));refreshCheckout();}
 if(e.target.closest('[data-kitchen-sound]')){kitchenAudio=!kitchenAudio;if(kitchenAudio){kitchenAudioContext ||= new (window.AudioContext||window.webkitAudioContext)();await kitchenAudioContext.resume();chime();}render();}
});
let knownKitchenOrders=new Set();
setInterval(()=>{if(!location.hash.includes('/kitchen'))return;const orders=scopedOrders().filter(o=>!o.canceled&&stage(o)<4);if(kitchenAudio&&orders.some(o=>!knownKitchenOrders.has(o.id)))chime();knownKitchenOrders=new Set(orders.map(o=>o.id));document.querySelectorAll('[data-ticket-age]').forEach(el=>{const o=orderById(el.dataset.ticketAge);if(o)el.innerHTML=ticketAge(o);});},5000);
document.addEventListener('pointerdown',e=>{if(innerWidth>600||!e.target.closest('.modal-head')||e.target.closest('button'))return;const y=e.clientY;const finish=ev=>{if(ev.clientY-y>100)closeModal();document.removeEventListener('pointerup',finish);};document.addEventListener('pointerup',finish);});
function patchDietMenu(){
 const products=state.menu.filter(p=>(category==='All'||category==='Favorites'&&state.favorites.includes(p.id)||p.category===category)&&dietMatches(p)&&`${p.name} ${p.desc}`.toLowerCase().includes(query.toLowerCase()));
 document.getElementById('products').innerHTML=catalogGroups(products);
 const filterCount=document.getElementById('diet-filter-count');if(filterCount)filterCount.textContent=dietFilter==='All'?'':'· 1 active';
 document.querySelectorAll('[data-diet]').forEach(b=>{b.classList.toggle('selected',b.dataset.diet===dietFilter);b.setAttribute('aria-pressed',b.dataset.diet===dietFilter);});
}
/* Same-browser participant windows publish group changes only, never wallet/profile state. */
const groupChannel=typeof BroadcastChannel!=='undefined'?new BroadcastChannel('mod-group-demo'):null;
const participantWindow=new URLSearchParams(location.search).get('participant');
let groupSyncBaseline=new Map(),groupSyncReceiving=false;
function rememberGroups(){groupSyncBaseline=new Map((state.groups||[]).map(g=>[g.id,JSON.stringify(g)]));}
function publishGroupChanges(){
 if(!groupChannel||groupSyncReceiving)return !!participantWindow;
 for(const g of state.groups||[]){
  const previous=groupSyncBaseline.get(g.id),current=JSON.stringify(g);
  if(previous&&previous!==current){
   const old=JSON.parse(previous);
   if(participantWindow){const person=g.people.find(p=>p.id===participantWindow),prior=old.people.find(p=>p.id===participantWindow);if(person&&JSON.stringify(person)!==JSON.stringify(prior))groupChannel.postMessage({type:'person',group:g.id,person});}
   else groupChannel.postMessage({type:'group',group:g});
  }
 }
 rememberGroups();return !!participantWindow;
}
if(groupChannel)groupChannel.onmessage=e=>{
 const data=e.data;if(!data||!['person','group'].includes(data.type))return;
 const g=state.groups.find(g=>g.id===(data.type==='person'?data.group:data.group.id));if(!g)return;
 if(data.type==='person'){
  if(participantWindow||g.status!=='Open'||Date.now()>g.deadline)return;
  const index=g.people.findIndex(p=>p.id===data.person.id);if(index<0||data.person.id==='host')return;
  g.people[index]=data.person;
  groupChannel.postMessage({type:'group',group:g});
 }else {if(!participantWindow)return;Object.assign(g,data.group);}
 groupSyncReceiving=true;rememberGroups();if(!participantWindow)save();groupSyncReceiving=false;
 if(route()==='group/'+g.id&&!modal.open)render();
};
document.addEventListener('DOMContentLoaded',()=>{rememberGroups();if(participantWindow){groupPerson=participantWindow;render();}});
document.addEventListener('click',e=>{
 const button=e.target.closest('[data-group-window]');if(!button)return;
 const g=currentGroup(),person=g?.people.find(p=>p.id!=='host');if(!person)return toast('Add another participant first.');
 const url=new URL(location.href);url.searchParams.set('participant',person.id);window.open(url.href,'mod-participant-'+g.id,'width=430,height=850');
});
function groupWindowButton(g){return participantWindow?'<p class="notice">Participant window · changes sync to the host in this browser. Keep the host window open. Same-participant edits use the latest received update.</p>':'<button class="btn secondary" data-group-window>Open participant window</button>';}
function refreshTipLabels(){const t=totals(),base=Math.max(0,t.subtotal-t.merchandiseDiscount);document.querySelectorAll('[data-tip-percent]').forEach(b=>{const n=Number(b.dataset.tipPercent);b.textContent=n?n+'% · '+money(Math.round(base*n/100)):'No tip';b.setAttribute('aria-pressed',checkout.tipPercent===n);});const input=document.getElementById('custom-tip');if(input&&document.activeElement!==input)input.value=(checkout.tip/100).toFixed(2);}
