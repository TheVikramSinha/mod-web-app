const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const context=await browser.newContext({viewport:{width:1440,height:1000}}),p=await context.newPage(),errors=[];
  p.on('pageerror',e=>errors.push(e.message));
  const base='http://127.0.0.1:4173/';
  await p.goto(base+'#menu');await p.locator('.add-btn[data-action=customize][data-id=custom]').click();await p.locator('#custom-add').click();await p.goto(base+'#checkout');await p.locator('#checkout-name').fill('Review Test');await p.locator('#instructions').fill('Keep my instructions');
  const before=await p.evaluate(()=>state.orders.length);
  const admin=await context.newPage();admin.on('pageerror',e=>errors.push(e.message));await admin.goto(base+'#admin/menu');await admin.locator('#ops-store').selectOption('sea');
  assert.equal(await admin.locator('#ops-days').count(),0,'No irrelevant reporting date filter on configuration');
  const item=admin.locator('form[data-id=custom]');await item.locator('[name=price]').fill('14.49');await item.getByRole('button',{name:'Save item'}).click();
  await p.waitForSelector('.price-review');assert.equal(await p.locator('#checkout-name').inputValue(),'Review Test');assert.equal(await p.locator('#instructions').inputValue(),'Keep my instructions');
  await p.locator('#place-order').click();assert.equal(await p.evaluate(()=>state.orders.length),before,'Changed price cannot be submitted without review');
  await p.locator('[data-action=accept-price-review]').click();await p.locator('#place-order').click();await p.waitForSelector('.map-card');const id=await p.evaluate(()=>state.orders[0].id);assert.equal(await p.evaluate(()=>state.orders[0].items[0].unit),1449);
  await admin.goto(base+'#admin/orders');await admin.locator('#ops-search').fill(id);await admin.locator(`[data-action=ops-order][data-id="${id}"]`).click();await admin.locator('[data-action=cancel-order]').click();assert.equal(await admin.evaluate(id=>orderById(id).canceled,id),false);await admin.getByRole('button',{name:'Keep order',exact:true}).click();assert.equal(await admin.evaluate(id=>orderById(id).canceled,id),false);
  await admin.locator(`[data-action=ops-order][data-id="${id}"]`).click();await admin.locator('[data-action=cancel-order]').click();await admin.locator('[data-action=confirm-cancel-order]').click();assert.equal(await admin.evaluate(id=>orderById(id).canceled,id),true);
  await p.goto(base+'#menu');await p.locator('.add-btn[data-action=customize][data-id=custom]').click();await p.locator('#custom-add').click();await p.getByRole('button',{name:'Change store',exact:true}).click();await p.locator('[data-action=customer-store][data-id=bel]').click();await p.getByRole('heading',{name:'Review your store change'}).waitFor();assert.equal(await p.evaluate(()=>state.customerStoreId),'sea');await p.getByRole('button',{name:'Keep current store'}).click();assert.equal(await p.evaluate(()=>state.customerStoreId),'sea');
  await p.getByRole('button',{name:'Change store',exact:true}).click();await p.locator('[data-action=customer-store][data-id=bel]').click();await p.getByRole('button',{name:'Use this store'}).click();assert.equal(await p.evaluate(()=>state.customerStoreId),'bel');assert.equal(await p.evaluate(()=>state.cart.length),1);
  await admin.goto(base+'#admin');assert.equal(await admin.locator('.nav-group[open]').count(),0);await admin.getByText('Network insights',{exact:true}).click();await admin.getByLabel('Administration').getByRole('link',{name:'Compare stores',exact:true}).click();await admin.getByRole('heading',{name:'Store comparison'}).waitFor();assert.equal(await admin.locator('.nav-group[open]').count(),1);
  for(const route of ['menu','checkout','rewards','admin','admin/stores','admin/compare','admin/menu','admin/settings']){
   await p.goto(base+'#'+route);
   for(const width of [320,390,768,1440]){await p.setViewportSize({width,height:900});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${route} overflows at ${width}`);}
  }
  await p.setViewportSize({width:390,height:844});await p.goto(base+'#menu');await p.screenshot({path:'/private/tmp/mod-review-mobile.png'});
  await admin.setViewportSize({width:1440,height:1000});await admin.goto(base+'#admin');await admin.screenshot({path:'/private/tmp/mod-review-admin.png'});
  assert.deepEqual(errors,[]);console.log('PASS: cross-tab price changes require review and retain checkout fields; store-change preview preserves bag; refunds require confirmation; contextual filters and grouped navigation work; responsive layouts verified.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
