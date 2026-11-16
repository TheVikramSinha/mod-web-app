const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
const p=await browser.newPage({viewport:{width:390,height:844}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
const go=async r=>{await p.goto('http://127.0.0.1:4173/#'+r);await p.waitForTimeout(100)};
await go('menu');await p.locator('#products [data-action=customize][data-id=custom]').click();assert(await p.locator('#pizza-lab svg').isVisible());
await p.locator('[name=topping][value=Mozzarella]').check();await p.locator('[name="portion-Mozzarella"]').selectOption('Extra');assert((await p.locator('#pizza-lab').textContent()).includes('sample kcal'));await p.locator('#custom-add').click();assert.equal(await p.evaluate(()=>state.cart[0].portions.Mozzarella),'Extra');
await go('cart');assert((await p.locator('.cart-line').textContent()).includes('Mozzarella Extra'));
await go('checkout');await p.locator('[data-tip-percent="20"]').click();assert(await p.evaluate(()=>totals().tip===Math.round((totals().subtotal-totals().merchandiseDiscount)*.2)));await p.locator('#custom-tip').fill('7.45');assert.equal(await p.evaluate(()=>totals().tip),745);await p.locator('[data-tip-percent="0"]').click();assert.equal(await p.evaluate(()=>totals().tip),0);
await go('admin');assert(await p.locator('.review-analytics svg').isVisible());assert((await p.locator('.analytics-values').first().textContent()).includes('23:00'));
await go('store/sea/kitchen');await p.locator('#kitchen-station').selectOption('Pizza line');assert(await p.locator('[data-ticket-age]').count()>0);await p.locator('[data-kitchen-sound]').click();assert.equal(await p.locator('[data-kitchen-sound]').getAttribute('aria-pressed'),'true');
await go('menu');await p.locator('[data-diet=Veg]').focus();await p.locator('[data-diet=Veg]').click();assert.equal(await p.evaluate(()=>document.activeElement.dataset.diet),'Veg');
assert(await p.evaluate(()=>routeMap({...state.orders[0],storeId:'aus'}).includes('Congress Avenue')));assert.deepEqual(errors,[]);
console.log('PASS: pizza preview/portions, cart handoff, percentage/custom/no tip, HQ analytics, kitchen filters/audio, diet focus and city map.');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
