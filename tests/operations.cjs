const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
 const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const base='http://127.0.0.1:4173/';
 const go=async route=>{await page.goto(base+'#'+route);await page.waitForTimeout(80)};
 await go('admin');
 assert.equal(await page.evaluate(()=>state.stores.length),6);
 assert.equal(await page.evaluate(()=>state.orders.length),901);
 assert.equal(await page.evaluate(()=>myOrders().length),6);
 const network=await page.evaluate(()=>metrics(scopedOrders()));
 assert(network.sales>0&&network.active>0&&network.canceled>0);
 assert.equal(await page.locator('.metric strong').first().textContent(),await page.evaluate(()=>money(metrics(scopedOrders()).sales)));
 await page.locator('#ops-store').selectOption('bel');
 const store=await page.evaluate(()=>metrics(scopedOrders()));assert(store.sales<network.sales);
 assert.equal(await page.evaluate(()=>scopedOrders().every(o=>o.storeId==='bel')),true);
 await page.locator('#ops-mode').selectOption('Pickup');
 assert.equal(await page.evaluate(()=>scopedOrders().every(o=>o.mode==='Pickup')),true);
 await page.locator('#ops-days').selectOption('1');
 assert.equal(await page.evaluate(()=>scopedOrders().every(o=>o.created>=opsCutoff())),true);
 await page.locator('#ops-store').selectOption('all');await page.locator('#ops-days').selectOption('30');await page.locator('#ops-mode').selectOption('All');
 await go('admin/compare');assert.equal(await page.locator('tbody tr').count(),6);
 await page.locator('[data-compare=sea]').uncheck();assert.equal(await page.locator('tbody tr').count(),5);
 await page.locator('#ops-sort').selectOption('orders');
 const download=page.waitForEvent('download');await page.locator('[data-action=ops-export]').click();const file=await download;const filePath=await file.path();assert(fs.readFileSync(filePath,'utf8').includes('Net merchandise USD'));
 await go('admin/orders');await page.locator('#ops-search').fill('Priya');assert((await page.locator('tbody').textContent()).includes('Priya'));assert.equal(await page.evaluate(()=>filteredOpsOrders().every(o=>o.name.includes('Priya'))),true);
 await page.locator('[data-action=ops-clear]').click();await page.locator('[data-action=ops-next]').click();assert((await page.locator('.pagination').textContent()).includes('Page 2'));
 await page.locator('#ops-status').selectOption('Delayed');assert.equal(await page.evaluate(()=>filteredOpsOrders().every(o=>!o.canceled&&stage(o)<4&&isLate(o))),true);
 await page.locator('[data-action=ops-clear]').click();
 await go('admin/menu');await page.locator('#ops-store').selectOption('bel');
 let f=page.locator('form[data-id=pepperoni]');await f.locator('[name=price]').fill('18.50');await f.locator('[name=available]').uncheck();await f.getByRole('button',{name:'Save item'}).click();
 assert.equal(await page.evaluate(()=>storeById('bel').menu.find(x=>x.id==='pepperoni').price),1850);
 assert.equal(await page.evaluate(()=>storeById('sea').menu.find(x=>x.id==='pepperoni').price),1249);
 assert.equal(await page.evaluate(()=>product('pepperoni').available),true);
 await go('menu');await page.getByRole('button',{name:'Change store',exact:true}).click();await page.locator('[data-action=customer-store][data-id=bel]').click();assert.equal(await page.locator('[data-action=customize][data-id=pepperoni]').isDisabled(),true);
 assert.equal(await page.evaluate(()=>state.customerStoreId),'bel');
 await go('admin/settings');await page.locator('#ops-store').selectOption('bel');
 await page.locator('[name=paused]').check();await page.locator('#setting-deliveryFee').fill('4.99');await page.getByRole('button',{name:'Save store settings'}).click();
 assert.equal(await page.evaluate(()=>customerStore().deliveryFee),499);assert.equal(await page.evaluate(()=>storeById('sea').paused),false);
 await go('menu');assert.equal(await page.locator('.add-btn[data-action=customize][data-id=custom]').isDisabled(),true);
 // Customer selector is independent from the administrator's store filter.
 await page.getByRole('button',{name:'Change store',exact:true}).click();await page.locator('[data-action=customer-store][data-id=sea]').click();
 await go('rewards');await page.locator('[data-action=rewards-tab][data-tab=wallet]').click();const original=await page.evaluate(()=>state.gift);await page.locator('[data-action=wallet-topup]').click();await page.locator('#modal').getByRole('button',{name:'Add demo funds',exact:true}).click();assert.equal(await page.evaluate(()=>state.gift),original+1000);
 await page.locator('[data-action=wallet-gift]').click();await page.locator('#gift-code').fill('wrong');await page.locator('#modal').getByRole('button',{name:'Redeem demo card',exact:true}).click();assert((await page.locator('#gift-error').textContent()).includes('MODGIFT25'));await page.locator('#gift-code').fill('MODGIFT25');await page.locator('#modal').getByRole('button',{name:'Redeem demo card',exact:true}).click();assert.equal(await page.evaluate(()=>state.gift),original+3500);
 await page.locator('[data-action=wallet-gift]').click();await page.locator('#gift-code').fill('MODGIFT25');await page.locator('#modal').getByRole('button',{name:'Redeem demo card',exact:true}).click();assert((await page.locator('#gift-error').textContent()).includes('already'));await page.getByRole('button',{name:'Close dialog'}).click();
 await go('admin/customers');await page.locator('#ops-store').selectOption('all');const originalCredit=await page.evaluate(()=>state.credit);await page.locator('[data-action=ops-customer][data-id=guest-1]').click();const otherCredit=await page.evaluate(()=>state.customers[0].credit);await page.locator('#ops-credit').fill('7.50');await page.locator('#ops-reason').fill('Test recovery for another customer');await page.getByRole('button',{name:'Issue demo credit'}).click();assert.equal(await page.evaluate(()=>state.customers[0].credit),otherCredit+750);assert.equal(await page.evaluate(()=>state.credit),originalCredit);
 await go('admin/fulfillment');const active=await page.evaluate(()=>scopedOrders().find(o=>o.fixedStage!==undefined&&!o.canceled&&stage(o)<4).id);const prior=await page.evaluate(id=>stage(orderById(id)),active);await page.locator(`[data-action=advance][data-id="${active}"]`).click();assert.equal(await page.evaluate(id=>stage(orderById(id)),active),prior+1);
 await go('admin/support');const open=await page.locator('[data-action=resolve-ticket]').count();await page.locator('[data-action=resolve-ticket]').first().click();assert.equal(await page.locator('[data-action=resolve-ticket]').count(),open-1);
 await go('admin/offers');await page.locator('[data-store-promo=sea]').uncheck();assert.equal(await page.evaluate(()=>state.promo),false);assert.equal(await page.evaluate(()=>storeById('bel').promo),true);
 // Cross-tab persistence and store-specific menu synchronization.
 const tab=await context.newPage();await tab.goto(base+'#menu');await page.locator('[data-store-promo=sea]').check();await tab.waitForFunction(()=>state.promo===true);assert.equal(await tab.evaluate(()=>state.customerStoreId),'sea');await tab.close();
 // Controls that previously behaved like dead ends: favorites, reward return path and delivery chat.
 await go('menu');await page.locator('[data-action=favorite][data-id=pepperoni]').click();await page.locator('[data-action=vegetarian]').click();await go('account');await page.getByText('Saved favorites',{exact:true}).click();await page.waitForSelector('#products');assert.equal(await page.locator('.product').count(),1);assert((await page.locator('.product').textContent()).includes('Pepperoni'));
 await page.locator('[data-action=category][data-category=All]').click();await page.locator('[data-action=customize][data-id=cake]').click();await go('checkout');await page.locator('#checkout-name').fill('Checkout Draft');await page.locator('#instructions').fill('Ring the bell twice');await go('rewards');await page.getByRole('link',{name:/Continue to checkout/}).click();assert.equal(await page.locator('#checkout-name').inputValue(),'Checkout Draft');assert.equal(await page.locator('#instructions').inputValue(),'Ring the bell twice');
 await go('orders');await page.locator('[data-action=new-demo]').click();await page.locator('[data-action=contact]').click();await page.locator('#chat-message').fill('Please ring the bell');await page.getByRole('button',{name:'Send demo message'}).click();assert((await page.locator('.chat-thread').textContent()).includes('Please ring the bell'));await page.getByRole('button',{name:'Close dialog'}).click();await page.locator('[data-action=map-zoom]').click();assert.equal(await page.locator('svg.map').getAttribute('viewBox'),'100 80 480 360');await page.locator('[data-action=map-center]').click();assert.equal(await page.locator('svg.map').getAttribute('viewBox'),'0 0 700 520');
 for(const r of ['admin','admin/stores','admin/compare','admin/orders','admin/fulfillment','admin/menu','admin/customers','admin/support','admin/offers','admin/settings','menu','orders','rewards','account']){
  await go(r);
  for(const width of [320,390,768,1024,1440]){await page.setViewportSize({width,height:900});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${r} overflows ${width}`);}
 }
 await go('admin/compare');await page.screenshot({path:'/private/tmp/mod-compare-v2.png'});
 await go('admin/fulfillment');await page.screenshot({path:'/private/tmp/mod-fulfillment-v2.png'});
 await page.setViewportSize({width:390,height:844});await go('menu');await page.screenshot({path:'/private/tmp/mod-customer-v2.png'});
 assert.deepEqual(errors,[]);
 console.log('PASS: six-store filters and comparisons, 901 initial orders, CSV export, search/pagination, store price/availability isolation, pause and fees, customer store switching, top-up/gift redemption, customer credit isolation, fulfillment advancement, support, store offers, cross-tab persistence and responsive layouts.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
