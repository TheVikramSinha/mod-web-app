// Optional browser QA. Run with Playwright available via NODE_PATH or local installation.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

(async () => {
  const browser = await chromium.launch({channel:'chrome',headless:true});
  const page = await browser.newPage({viewport:{width:1440,height:1000}});
  const errors=[];
  page.on('pageerror', e=>errors.push(e.message));
  const out=process.env.QA_OUTPUT || '/private/tmp/mod-prototype-qa';
  fs.mkdirSync(out,{recursive:true});
  await page.goto(process.env.PROTOTYPE_URL || 'http://127.0.0.1:4173/#menu');
  await page.waitForSelector('.product');
  await page.evaluate(()=>document.fonts.ready);
  await page.screenshot({path:path.join(out,'desktop-menu.png'),fullPage:true});
  assert.equal(await page.locator('.product').count(),46);
  assert.equal(await page.locator('.product img').evaluateAll(xs=>xs.every(x=>x.complete&&x.naturalWidth>0)),true);
  for(const width of [320,360,390,537,767,768,820,1024,1440,1920]){
    await page.setViewportSize({width,height:900});
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`Menu overflows at ${width}`);
  }
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:path.join(out,'mobile-menu.png')});
  await page.locator('.add-btn[data-action=customize][data-id=custom]').click();
  await page.getByLabel('Cauliflower (+$2)').check();
  await page.getByLabel('Mushrooms',{exact:true}).check();
  await page.locator('#custom-add').click();
  assert.equal(await page.locator('.mobile-cart b').textContent(),'1');
  await page.goto('http://127.0.0.1:4173/#rewards');
  await page.locator('[data-action=reward][data-id=five]').click();
  await page.goto('http://127.0.0.1:4173/#checkout');
  await page.locator('#use-credit').check();
  await page.locator('#use-gift').check();
  for(const width of [320,390,820,1440]){
    await page.setViewportSize({width,height:900});
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`Checkout overflows at ${width}`);
  }
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:path.join(out,'mobile-checkout.png')});
  const before=await page.evaluate(()=>JSON.parse(localStorage.getItem('mod-pizza-prototype-v1')));
  await page.locator('#place-order').click();
  await page.waitForSelector('.map-card');
  const after=await page.evaluate(()=>JSON.parse(localStorage.getItem('mod-pizza-prototype-v1')));
  const order=after.orders[0];
  assert.equal(after.cart.length,0);
  assert.equal(after.points,before.points-100);
  assert.equal(after.credit,before.credit-order.totals.credit);
  assert.equal(after.gift,before.gift-order.totals.gift);
  assert.equal(order.items[0].unit,1449);
  assert.equal(order.totals.due,0);
  await page.locator('[data-action=advance]').click();
  await page.locator('[data-action=advance]').click();
  await page.locator('[data-action=advance]').click();
  const pos=await page.locator('#courier-marker').getAttribute('transform');
  await page.waitForTimeout(1500);
  assert.notEqual(await page.locator('#courier-marker').getAttribute('transform'),pos,'Courier moves');
  await page.locator('[data-action=pause]').click();
  const frozen=await page.locator('#courier-marker').getAttribute('transform');
  await page.waitForTimeout(600);
  assert.equal(await page.locator('#courier-marker').getAttribute('transform'),frozen,'Pause freezes courier');
  await page.evaluate(()=>{document.activeElement.blur();scrollTo(0,0)});
  await page.screenshot({path:path.join(out,'mobile-tracking.png')});
  await page.locator('[data-action=support]').click();
  await page.locator('#support-message').fill('Test support request');
  await page.getByRole('button',{name:'Send demo request'}).click();
  await page.goto('http://127.0.0.1:4173/#admin/orders');
  await page.locator(`[data-action=ops-order][data-id="${order.id}"]`).click();
  await page.locator('[data-action=cancel-order]').click();
  await page.locator('[data-action=confirm-cancel-order]').click();
  const refunded=await page.evaluate(()=>JSON.parse(localStorage.getItem('mod-pizza-prototype-v1')));
  assert.equal(refunded.gift,before.gift);
  assert.equal(refunded.credit,before.credit);
  assert.equal(refunded.points,before.points);
  assert.equal(refunded.tickets[0].message,'Test support request');
  await page.goto('http://127.0.0.1:4173/#admin/menu');
  await page.locator('#ops-store').selectOption('sea');
  const item=page.locator('form[data-id=pepperoni]');
  await item.locator('input[name=price]').fill('15.99');
  await item.locator('input[name=available]').uncheck();
  await item.getByRole('button',{name:'Save item'}).click();
  await page.goto('http://127.0.0.1:4173/#menu');
  assert.equal(await page.locator('button[data-action=customize][data-id=pepperoni]').isDisabled(),true);
  await page.reload();
  assert.equal(await page.locator('button[data-action=customize][data-id=pepperoni]').isDisabled(),true,'Persisted availability');
  for(const r of ['rewards','orders','account','admin','admin/stores','admin/compare','admin/fulfillment','admin/support','admin/orders','admin/menu','admin/customers','admin/offers','admin/settings']){
    await page.goto(`http://127.0.0.1:4173/#${r}`);
    for(const width of [320,390,820,1440]){
      await page.setViewportSize({width,height:900});
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${r} overflows at ${width}`);
    }
  }
  await page.goto('http://127.0.0.1:4173/#admin');
  await page.screenshot({path:path.join(out,'admin-desktop.png')});
  await page.goto(`http://127.0.0.1:4173/#track/${order.id}`);
  await page.screenshot({path:path.join(out,'desktop-tracking.png'),fullPage:true});
  assert.deepEqual(errors,[]);
  console.log('PASS: responsive routes, menu assets, customization, reward + split-tender checkout, moving/paused courier, support, refund reconciliation, admin menu and persistence.');
  console.log(`Screenshots: ${out}`);
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
