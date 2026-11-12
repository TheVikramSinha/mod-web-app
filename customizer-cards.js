/* Card-based pizza options; preserves the existing recipe and pricing model. */
function decorateCustomizer(form,quantity=1,options={}){
 if(!form)return;
 modal.classList.add('ingredient-dialog');
 modal.querySelector('#dialog-title').textContent=product(form.dataset.id).name;
 form.querySelectorAll('details.custom-section').forEach(section=>section.open=true);
 form.querySelectorAll('.custom-options').forEach(list=>{
  if(list.closest('.half-builder'))return;
  list.classList.add('ingredient-list');const kind=list.querySelector('input')?.name;if(kind)list.dataset.optionKind=kind;
  list.querySelectorAll('label').forEach(label=>{
   const input=label.querySelector('input');if(!input)return;
   const title=input.value==='Tomato'?'Tomato Sauce':input.value==='No sauce'?'None':input.value;
   
   [...label.childNodes].filter(n=>n.nodeType===3).forEach(n=>n.remove());
   const content=document.createElement('span');content.className='ingredient-copy';
   const strong=document.createElement('strong');strong.textContent=title;content.append(strong);
   const detail=document.createElement('small');detail.textContent= input.name==='crust'?(input.value==='Cauliflower'?'Crust upgrade · +$2.00':'Included'):input.name==='size'?(input.value==='Small'?'−$2.00':input.value==='Mega'?'+$3.00':'Standard size'):input.name==='topping'?'Included':'Included';content.append(detail);label.append(content);if(input.name==='size'){detail.dataset.sizePrice=input.value;detail.textContent=money(unit({id:form.dataset.id,options:{size:input.value,crust:new FormData(form).get('crust')}}));}
   if(customerStore().ingredients[input.value]===false){input.disabled=true;detail.textContent='Currently unavailable';}
   if(input.name==='topping'||input.name==='sauce'&&input.value!=='No sauce'){
    let select=form.querySelector('[name="portion-'+CSS.escape(input.value)+'"]');if(input.name==='sauce'){select=document.createElement('select');select.name='sauce-portion-'+input.value;for(const value of ['Light','Regular','Extra']){const option=new Option(value,value);option.selected=value===(options.saucePortion||'Regular');select.append(option);}}
    if(select){const row=document.createElement('div');row.className='ingredient-portion';row.dataset.ingredient=input.value;row.dataset.kind=input.name;row.append(select);const placement=document.createElement('input');placement.type='hidden';placement.name=(input.name==='sauce'?'sauce-placement-':'placement-')+input.value;placement.value=input.name==='sauce'?(options.saucePlacement||'Whole'):(options.placements?.[input.value]||'Whole');row.append(placement);const placementTitle=document.createElement('span');placementTitle.className='ingredient-control-label';placementTitle.textContent='Placement';row.append(placementTitle);const placementControls=document.createElement('div');placementControls.className='portion-segments placement-segments';placementControls.setAttribute('role','group');placementControls.setAttribute('aria-label',input.value+' placement');for(const value of ['Left','Whole','Right']){const button=document.createElement('button');button.type='button';button.textContent=value==='Whole'?'Whole':value+' ½';button.dataset.ingredientPlacement=value;button.setAttribute('aria-pressed',String(placement.value===value));placementControls.append(button);}row.append(placementControls);const portionTitle=document.createElement('span');portionTitle.className='ingredient-control-label';portionTitle.textContent='Portion amount';row.append(portionTitle);label.after(row);const controls=document.createElement('div');controls.className='portion-segments';controls.setAttribute('role','group');controls.setAttribute('aria-label',input.value+' amount');
     for(const amount of ['Light','Regular','Extra']){const button=document.createElement('button');button.type='button';button.textContent=amount;button.dataset.ingredientPortion=amount;button.setAttribute('aria-pressed',String(select.value===amount));controls.append(button);}row.append(controls);select.classList.add('native-portion');select.hidden=true;
    }
   }
  });
 });
 form.querySelector('.portion-picks')?.remove();
 const body=form.querySelector('.modal-body');for(const selector of ['.pizza-preview','.save-build-option']){const optional=form.querySelector(selector);if(optional)body.append(optional);}
 const footer=form.querySelector('.modal-foot'),bar=document.createElement('div');bar.className='builder-quantity';
 bar.innerHTML='<span>Made your way</span><label for="pizza-quantity">Qty.</label><button type="button" data-pizza-quantity="-1" aria-label="Decrease pizza quantity">−</button><input id="pizza-quantity" name="quantity" type="number" min="1" max="20" value="'+quantity+'" aria-label="Pizza quantity"><button type="button" data-pizza-quantity="1" aria-label="Increase pizza quantity">+</button>';
 footer.prepend(bar);syncIngredientCards(form);
}
function syncIngredientCards(form){
 form.querySelectorAll('[data-size-price]').forEach(el=>{el.textContent=money(unit({id:form.dataset.id,options:{size:el.dataset.sizePrice,crust:new FormData(form).get('crust')}}));});
 form.querySelectorAll('.ingredient-portion').forEach(row=>{
  const input=[...form.querySelectorAll('[name="'+row.dataset.kind+'"]')].find(el=>el.value===row.dataset.ingredient);row.hidden=!input?.checked;
  const placement=row.querySelector('input[type=hidden]');row.querySelectorAll('[data-ingredient-placement]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.ingredientPlacement===placement.value)));
  const select=row.querySelector('select');const description=row.previousElementSibling?.querySelector('.ingredient-copy small');if(description)description.textContent=(placement.value==='Whole'?'Whole':placement.value+' ½')+' · '+select.value;row.querySelectorAll('[data-ingredient-portion]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.ingredientPortion===select.value)));
 });
 const quantity=form.querySelector('[name=quantity]');if(!quantity)return;
 const n=Math.max(1,Math.min(20,Number(quantity.value)||1));quantity.value=n;
 form.querySelector('[data-pizza-quantity="-1"]').disabled=n===1;form.querySelector('[data-pizza-quantity="1"]').disabled=n===20;
 form.querySelector('#custom-add').textContent=(form.dataset.edit?'Update cart':'Add to cart')+' · '+money(unit({id:form.dataset.id,options:builderOptions(form)})*n);
}
document.addEventListener('click',e=>{
 const placement=e.target.closest('[data-ingredient-placement]');if(placement){const input=placement.closest('.ingredient-portion').querySelector('input[type=hidden]');input.value=placement.dataset.ingredientPlacement;input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));}
 const amount=e.target.closest('[data-ingredient-portion]');if(amount){const select=amount.closest('.ingredient-portion').querySelector('select');select.value=amount.dataset.ingredientPortion;select.dispatchEvent(new Event('input',{bubbles:true}));select.dispatchEvent(new Event('change',{bubbles:true}));}
 const qty=e.target.closest('[data-pizza-quantity]');if(qty){const input=qty.form.querySelector('[name=quantity]');input.value=Number(input.value)+Number(qty.dataset.pizzaQuantity);syncIngredientCards(qty.form);}
});
document.addEventListener('change',e=>{if(e.target.closest('#custom-form'))queueMicrotask(()=>syncIngredientCards(e.target.closest('#custom-form')));});
document.addEventListener('input',e=>{if(e.target.name==='quantity')syncIngredientCards(e.target.form);});

function placementDescription(options){if(!options||options.halves)return '';return [...Object.entries(options.placements||{}).filter(([t,v])=>(options.toppings||[]).includes(t)&&v!=='Whole').map(([t,v])=>t+': '+v+' half'),...(options.sauce&&options.sauce!=='No sauce'&&(options.saucePlacement&&options.saucePlacement!=='Whole'||options.saucePortion&&options.saucePortion!=='Regular')?[options.sauce+': '+(options.saucePlacement||'Whole')+' · '+(options.saucePortion||'Regular')]:[])].join(', ');}
