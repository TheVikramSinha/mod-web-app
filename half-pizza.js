/* Sample half-and-half rules: The MOD only, all sizes, shared crust, no split surcharge. */
const HALF_SAUCES=['Tomato','White sauce','Buffalo','No sauce'];
function halfDescription(options){
 return ['Half & half',options.size,options.crust,...['left','right'].map(side=>{
 const h=options.halves[side];return side[0].toUpperCase()+side.slice(1)+': '+h.sauce+'; '+(h.toppings.length?h.toppings.map(t=>t+' ('+(h.portions[t]||'Regular')+')').join(', '):'No cheese or toppings');
 })].join(' · ');
}
function recipeIngredients(options){
 if(!options)return [];
 return options.halves?[options.crust,...Object.values(options.halves).flatMap(h=>[h.sauce,...h.toppings])]:[options.crust,options.sauce,...(options.toppings||[])];
}
function halfFields(options,storeId,locked=false){
 const fallback={sauce:options.sauce||'Tomato',toppings:options.toppings||['Mozzarella'],portions:options.portions||{}};
 return '<section class="half-builder"><h3>One pizza. Two ways.</h3><p class="small muted">Shared size and crust. Separate sauce, cheese and toppings. No half-and-half surcharge.</p>'+
 (locked?'<input type="hidden" name="pizza-style" value="halves">':'<div class="custom-options"><label><input type="radio" name="pizza-style" value="whole" '+(!options.halves?'checked':'')+'>Whole pizza</label><label><input type="radio" name="pizza-style" value="halves" '+(options.halves?'checked':'')+'>Half & half</label></div>')+
 '<div class="half-jumps"><button type="button" class="btn secondary" data-half-jump="left">Edit left half</button><button type="button" class="btn secondary" data-half-jump="right">Edit right half</button></div><div class="half-panels" '+(!options.halves&&!locked?'hidden':'')+'>'+['left','right'].map(side=>{
 const h=options.halves?.[side]||fallback;
 return '<details class="half-panel" data-half-panel="'+side+'" open><summary>'+side[0].toUpperCase()+side.slice(1)+' half</summary><label class="field">'+side+' sauce<select name="'+side+'-sauce">'+HALF_SAUCES.map(v=>'<option '+(h.sauce===v?'selected':'')+'>'+v+'</option>').join('')+'</select></label><p class="small muted">Cheese is optional. Select any cheeses and toppings below.</p><div class="half-toppings">'+MENU_TOPPINGS.map(t=>'<div><label><input type="checkbox" name="'+side+'-topping" value="'+esc(t)+'" '+(h.toppings.includes(t)?'checked':'')+'>'+esc(t)+(storeById(storeId).ingredients[t]===false?' · Unavailable':'')+'</label><select name="'+side+'-portion-'+esc(t)+'" aria-label="'+side+' '+esc(t)+' portion">'+['Light','Regular','Extra'].map(v=>'<option '+((h.portions[t]||'Regular')===v?'selected':'')+'>'+v+'</option>').join('')+'</select></div>').join('')+'</div></details>';
 }).join('')+'</div><div class="half-preview" aria-live="polite"></div></section>';
}
function readHalfOptions(form,options){
 if(new FormData(form).get('pizza-style')!=='halves')return options;
 const d=new FormData(form),halves=Object.fromEntries(['left','right'].map(side=>{
 const toppings=d.getAll(side+'-topping');
 return [side,{sauce:d.get(side+'-sauce'),toppings,portions:Object.fromEntries(toppings.map(t=>[t,d.get(side+'-portion-'+t)||'Regular']))}];
 }));
 return {...options,halves,sauce:'Half & half',toppings:[...new Set(Object.values(halves).flatMap(h=>h.toppings))],portions:{}};
}
function setupHalfBuilder(form,options,storeId){
 if(!form)return;
 // Keep ordinary controls intact so switching styles is reversible before saving.
 for(const name of ['sauce','topping']){
  const control=form.querySelector('[name="'+name+'"]');
  const block=control?.closest('.custom-section')||control?.closest('details')||control?.closest('.field');
  if(block)block.dataset.wholeOnly='true';
 }
 const host=form.querySelector('.modal-body'),anchor=form.querySelector('[data-whole-only]');
 if(anchor?.classList.contains('custom-section'))anchor.insertAdjacentHTML('beforebegin',halfFields(options,storeId));
 else if(anchor?.closest('.fields-two'))anchor.closest('.fields-two').insertAdjacentHTML('afterend',halfFields(options,storeId));
 else host.insertAdjacentHTML('beforeend',halfFields(options,storeId));
 updateHalfBuilder(form);
}
function updateHalfBuilder(form){
 if(!form?.querySelector('.half-builder'))return;
 const split=new FormData(form).get('pizza-style')==='halves';
 form.querySelectorAll('[data-whole-only],.portion-picks').forEach(el=>{el.hidden=split;});
 form.querySelector('.half-panels').hidden=!split;form.querySelector('.half-jumps').hidden=!split;
 const lab=form.querySelector('#pizza-lab');if(lab)lab.hidden=split;
 const preview=form.querySelector('.half-preview');
 if(!split){preview.innerHTML='';return;}
 const o=readHalfOptions(form,{}),color=h=>h.sauce==='No sauce'?'#f3d8ac':h.sauce==='White sauce'?'#fff1ca':h.sauce==='Buffalo'?'#e28137':'#ba4027';
 const cheese=t=>/mozzarella|cheddar|parmesan|asiago|feta|gorgonzola/i.test(t);
 const dots=Object.entries(o.halves).map(([side,h])=>h.toppings.flatMap((t,i)=>Array.from({length:h.portions[t]==='Extra'?10:h.portions[t]==='Light'?3:6},(_,j)=>{
 const x=(side==='left'?30:110)+(i*17+j*13)%60,y=42+(i*23+j*19)%112;
 return '<circle cx="'+x+'" cy="'+y+'" r="4" fill="'+(cheese(t)?'#fff2ac':/pepperoni|bacon|sausage/i.test(t)?'#9b241b':/mushroom|olive/i.test(t)?'#73604e':'#478044')+'"/>';
 })).join('')).join('');
 preview.innerHTML='<svg viewBox="0 0 200 200" role="img" aria-label="Illustrative pizza: left and right halves"><defs><clipPath id="half-pie"><circle cx="100" cy="100" r="82"/></clipPath></defs><circle cx="100" cy="100" r="95" fill="#d9a35b"/><g clip-path="url(#half-pie)"><rect x="0" y="0" width="100" height="200" fill="'+color(o.halves.left)+'"/><rect x="100" y="0" width="100" height="200" fill="'+color(o.halves.right)+'"/>'+dots+'</g><path d="M100 18v164" stroke="#fff" stroke-width="3" stroke-dasharray="5 4"/></svg><p><b>Left:</b> '+esc(o.halves.left.sauce)+' · '+o.halves.left.toppings.length+' ingredients<br><b>Right:</b> '+esc(o.halves.right.sauce)+' · '+o.halves.right.toppings.length+' ingredients</p><small>Illustrative preview · no split surcharge</small>';
}
function halfAmendment(o,index,pizzas){
 const x=o.items[index];
 openModal('Update your two halves','<form id="half-amendment" data-order="'+o.id+'" data-index="'+index+'"><div class="modal-body"><p class="notice">Change either half before preparation. Size, crust and payment stay unchanged.</p><label class="field">Choose pizza<select id="half-amend-item">'+pizzas.map(p=>'<option value="'+p.i+'" '+(p.i===index?'selected':'')+'>'+esc(p.x.name)+(p.x.memberName?' · '+esc(p.x.memberName):'')+'</option>').join('')+'</select></label>'+halfFields(x.options,o.storeId,true)+'<p class="error" id="half-error" role="alert"></p></div><div class="modal-foot"><button class="btn full">Save both halves · $0</button></div></form>');
 updateHalfBuilder(document.getElementById('half-amendment'));
}
document.addEventListener('input',e=>{if(e.target.form?.querySelector('.half-builder'))updateHalfBuilder(e.target.form);});
document.addEventListener('change',e=>{if(e.target.id==='half-amend-item'){const f=e.target.form;toppingEditor(orderById(f.dataset.order),Number(e.target.value));}});
document.addEventListener('submit',e=>{
 const f=e.target;if(f.id!=='half-amendment')return;e.preventDefault();
 const o=orderById(f.dataset.order),x=o.items[Number(f.dataset.index)],error=f.querySelector('#half-error');
 if(o.canceled||stage(o)!==0){error.textContent='Preparation has started. Changes are locked.';return;}
 const next=readHalfOptions(f,{...x.options}),missing=recipeIngredients(next).filter(t=>storeById(o.storeId).ingredients[t]===false);
 if(missing.length){error.textContent='Unavailable: '+[...new Set(missing)].join(', ')+'. Remove or replace them.';return;}
 const before=itemDesc(x);x.options=next;x.portions={};
 o.lastAmendment={before,after:itemDesc(x),at:Date.now()};o.invoiceRevision=(o.invoiceRevision||1)+1;o.toppingsEdited=true;
 o.events.unshift({title:'Half-and-half recipe updated before preparation',date:Date.now()});log('Half-and-half updated on '+o.id,o.storeId);save();closeModal();render();toast('Both halves updated. Payment unchanged.');
});

document.addEventListener('click',e=>{const button=e.target.closest('[data-half-jump]');if(!button)return;const panel=button.form.querySelector('[data-half-panel='+button.dataset.halfJump+']');panel.open=true;panel.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});panel.querySelector('select').focus({preventScroll:true});});
