/* MOD Customer Prototype — configurable sample data.
   All money values are integer cents. Nutrition and tax values are illustrative samples. */
(function () {
  'use strict';

  const CONFIG = {
    taxRate: 0.0875,              // sample estimated tax rate
    pointsPerDollar: 10,          // base earning rate
    dailyPointCap: 2000,
    tiersEnabled: true,
    tiers: [
      { id: 'member', name: 'Member', min: 0, mult: 1 },
      { id: 'silver', name: 'Silver', min: 2500, mult: 1.25 },
      { id: 'gold', name: 'Gold', min: 6000, mult: 1.5 }
    ],
    pizzaRewardCost: 1500,
    sizes: [
      { id: 'small', name: 'Small', inch: '9"', adj: -200 },
      { id: 'regular', name: 'Regular', inch: '11"', adj: 0 },
      { id: 'mega', name: 'Mega', inch: '11" · double dough', adj: 400 }
    ],
    crusts: [
      { id: 'original', name: 'Original', adj: 0 },
      { id: 'cauli', name: 'Cauliflower', adj: 300 }
    ],
    deliveryLeadMin: 20,
    closingBufferMin: 30,
    slotDays: 7,
    slotStepMin: 15,
    // Simulated order timeline (seconds after start). Compressed for demonstration.
    stages: {
      delivery: [['received', 0], ['accepted', 45], ['preparing', 90], ['baking', 150], ['out', 210], ['delivered', 330]],
      pickup: [['received', 0], ['accepted', 45], ['preparing', 90], ['baking', 150], ['ready', 210], ['completed', 330]]
    },
    refundReviewSec: 20,
    tipOptions: [0, 15, 18, 20, 25],
    topUpPresets: [1000, 2500, 5000],
    sampleGiftCard: { code: 'MODGIFT25', amount: 2500 },
    receiptClaim: { code: 'DEMO40', points: 40 },
    receiptMaxAgeDays: 30,
    otp: { length: 6, ttlSec: 300, resendSec: 30, maxAttempts: 5 },
    topUpMin: 500, topUpMax: 50000,
    pickupMethods: { instore: 'In-store pickup', curbside: 'Curbside pickup', drivethru: 'Drive-thru' },
    dropoffs: { door: 'Leave at door', hand: 'Hand it to me' },
    popularDefault: ['p-maddog', 'p-cyo', 'p-garden', 'p-caspian', 'd-garlic', 'x-nonamecake', 's-italian', 'b-lemonade'],
    profileBonus: 100,
    challenge: { id: 'explore3', name: 'Pizza Explorer', need: 3, points: 250 }
  };

  const STORES = [
    { id: 's1', lat: 47.6151, lng: -122.3270, name: 'Capitol Hill', city: 'Seattle, WA', address: '1302 Pine St, Seattle, WA 98101', tz: 'America/Los_Angeles',
      open: 540, close: 1440, modes: ['pickup', 'delivery'], deliveryFee: 399, prepMin: 15, priceFactor: 1, accepting: true,
      outProducts: [], outIngredients: [], pickupMethods: ['instore', 'curbside', 'drivethru'], popular: ['p-maddog', 'p-cyo', 'p-caspian', 'd-garlic', 'x-nonamecake', 'b-lemonade'], pickupNote: 'Pickup shelf is left of the ordering counter. Show your order name or number.' },
    { id: 's2', lat: 47.6157, lng: -122.2036, name: 'Bellevue Square', city: 'Bellevue, WA', address: '575 Bellevue Sq, Bellevue, WA 98004', tz: 'America/Los_Angeles',
      open: 600, close: 1320, modes: ['pickup', 'delivery'], deliveryFee: 299, prepMin: 20, priceFactor: 1, accepting: true,
      outProducts: ['p-tristan'], outIngredients: ['artichoke'], pickupMethods: ['instore', 'curbside'], popular: ['p-maddy', 'p-garden', 'p-cyo', 's-caesar', 'x-cakepop', 'b-tea'], pickupNote: 'Mall level 2 food hall. Use the MOD pickup counter by the register.' },
    { id: 's3', lat: 39.7527, lng: -105.0002, name: 'LoDo', city: 'Denver, CO', address: '1600 Wynkoop St, Denver, CO 80202', tz: 'America/Denver',
      open: 630, close: 1410, modes: ['pickup', 'delivery'], deliveryFee: 349, prepMin: 15, priceFactor: 1.05, accepting: true,
      outProducts: [], outIngredients: [], pickupMethods: ['instore', 'drivethru'], popular: ['p-dominic', 'p-maddog', 'p-lucy', 'd-cheesy', 'x-cinnamon', 'b-rootbeer'], pickupNote: 'Walk in and grab your order from the heated pickup rack.' },
    { id: 's4', lat: 41.8843, lng: -87.6551, name: 'West Loop', city: 'Chicago, IL', address: '1100 W Randolph St, Chicago, IL 60607', tz: 'America/Chicago',
      open: 660, close: 1380, modes: ['pickup', 'delivery'], deliveryFee: 449, prepMin: 18, priceFactor: 1.08, accepting: true,
      outProducts: ['s-greek'], outIngredients: ['bacon'], pickupMethods: ['instore'], popular: ['p-maddog', 'p-caspian', 'p-one', 'd-bites', 'x-nonamecake', 'b-lemonade'], pickupNote: 'Pickup counter is at the end of the make line.' },
    { id: 's5', lat: 30.2496, lng: -97.7497, name: 'South Congress', city: 'Austin, TX', address: '1500 S Congress Ave, Austin, TX 78704', tz: 'America/Chicago',
      open: 600, close: 1320, modes: ['pickup'], deliveryFee: null, prepMin: 15, priceFactor: 0.98, accepting: true,
      outProducts: [], outIngredients: [], pickupMethods: ['instore', 'curbside', 'drivethru'], popular: ['p-garden', 'p-cyo', 'p-lucy', 's-garden', 'x-cookie', 'b-tea'], pickupNote: 'Pickup only at this location. Shelf by the front window.' },
    { id: 's6', lat: 40.7356, lng: -73.9925, name: 'Union Square', city: 'New York, NY', address: '30 E 14th St, New York, NY 10003', tz: 'America/New_York',
      open: 660, close: 1380, modes: ['pickup', 'delivery'], deliveryFee: 499, prepMin: 20, priceFactor: 1.12, accepting: false,
      pausedReason: 'Online ordering is paused at this store right now.', outProducts: [], outIngredients: [], pickupMethods: ['instore'], popular: ['p-maddog', 'p-cyo', 'p-maddy', 'd-garlic', 'x-nonamecake', 'b-water'], pickupNote: 'Pickup at the front counter.' }
  ];

  // type: sauce | cheese | meat | veggie | salad | dressing | greens
  const INGREDIENTS = [
    { id: 'tomato-sauce', name: 'Tomato', type: 'sauce', color: '#d63b2a', diet: 'vegan' },
    { id: 'white-sauce', name: 'White sauce', type: 'sauce', color: '#f3ead6', diet: 'veg' },
    { id: 'buffalo-sauce', name: 'Buffalo', type: 'sauce', color: '#e66a1f', diet: 'veg' },
    { id: 'no-sauce', name: 'No sauce', type: 'sauce', color: null, diet: 'vegan' },

    { id: 'mozzarella', name: 'Mozzarella', type: 'cheese', color: '#fff3c4', diet: 'veg' },
    { id: 'vegan-mozz', name: 'Vegan mozzarella', type: 'cheese', color: '#fff8e0', diet: 'vegan' },
    { id: 'parmesan', name: 'Parmesan', type: 'cheese', color: '#f5e7b0', diet: 'veg' },
    { id: 'feta', name: 'Feta', type: 'cheese', color: '#ffffff', diet: 'veg' },
    { id: 'gorgonzola', name: 'Gorgonzola', type: 'cheese', color: '#dfe7d7', diet: 'veg' },
    { id: 'ricotta', name: 'Ricotta', type: 'cheese', color: '#fffdf5', diet: 'veg' },

    { id: 'pepperoni', name: 'Pepperoni', type: 'meat', color: '#b3261e', shape: 'disc', diet: 'nonveg' },
    { id: 'sausage', name: 'Italian sausage', type: 'meat', color: '#7a4b32', shape: 'blob', diet: 'nonveg' },
    { id: 'ham', name: 'Ham', type: 'meat', color: '#e59a9a', shape: 'square', diet: 'nonveg' },
    { id: 'bacon', name: 'Bacon', type: 'meat', color: '#a23b2a', shape: 'strip', diet: 'nonveg' },
    { id: 'chicken', name: 'Roasted chicken', type: 'meat', color: '#d9b48a', shape: 'square', diet: 'nonveg' },
    { id: 'salami', name: 'Salami', type: 'meat', color: '#a8323e', shape: 'disc', diet: 'nonveg' },

    { id: 'mushroom', name: 'Mushrooms', type: 'veggie', color: '#b49a7d', shape: 'half', diet: 'vegan' },
    { id: 'red-onion', name: 'Red onion', type: 'veggie', color: '#9c4a8b', shape: 'ring', diet: 'vegan' },
    { id: 'green-pepper', name: 'Green peppers', type: 'veggie', color: '#3f8f3a', shape: 'strip', diet: 'vegan' },
    { id: 'roasted-red-pepper', name: 'Roasted red peppers', type: 'veggie', color: '#d5432c', shape: 'strip', diet: 'vegan' },
    { id: 'jalapeno', name: 'Jalapeños', type: 'veggie', color: '#4c9a2a', shape: 'ring', diet: 'vegan' },
    { id: 'olive', name: 'Black olives', type: 'veggie', color: '#2b2b2b', shape: 'ring', diet: 'vegan' },
    { id: 'spinach', name: 'Spinach', type: 'veggie', color: '#2f7d32', shape: 'leaf', diet: 'vegan' },
    { id: 'tomato', name: 'Tomatoes', type: 'veggie', color: '#e2412f', shape: 'disc', diet: 'vegan' },
    { id: 'garlic', name: 'Roasted garlic', type: 'veggie', color: '#f1dfb0', shape: 'blob', diet: 'vegan' },
    { id: 'basil', name: 'Basil', type: 'veggie', color: '#2e8b3d', shape: 'leaf', diet: 'vegan' },
    { id: 'pineapple', name: 'Pineapple', type: 'veggie', color: '#f4c430', shape: 'square', diet: 'vegan' },
    { id: 'artichoke', name: 'Artichokes', type: 'veggie', color: '#8aa35b', shape: 'half', diet: 'vegan' },
    { id: 'arugula', name: 'Arugula', type: 'veggie', color: '#4f8f2f', shape: 'leaf', diet: 'vegan' },

    { id: 'romaine', name: 'Romaine', type: 'greens', diet: 'vegan' },
    { id: 'arugula-g', name: 'Arugula', type: 'greens', diet: 'vegan' },
    { id: 'mixed', name: 'Mixed greens', type: 'greens', diet: 'vegan' },

    { id: 'caesar', name: 'Caesar', type: 'dressing', diet: 'veg' },
    { id: 'balsamic', name: 'Balsamic vinaigrette', type: 'dressing', diet: 'vegan' },
    { id: 'ranch', name: 'Ranch', type: 'dressing', diet: 'veg' },
    { id: 'no-dressing', name: 'No dressing', type: 'dressing', diet: 'vegan' },

    { id: 'cucumber', name: 'Cucumber', type: 'salad', diet: 'vegan' },
    { id: 'chickpeas', name: 'Chickpeas', type: 'salad', diet: 'vegan' },
    { id: 'croutons', name: 'Croutons', type: 'salad', diet: 'vegan' },
    { id: 'pepperoncini', name: 'Pepperoncini', type: 'salad', diet: 'vegan' }
  ];

  const SALAD_TOPPINGS = ['tomato', 'cucumber', 'red-onion', 'olive', 'chickpeas', 'croutons', 'pepperoncini', 'feta', 'parmesan', 'salami', 'chicken'];
  const PIZZA_TOPPINGS = ['pepperoni', 'sausage', 'ham', 'bacon', 'chicken', 'salami', 'mushroom', 'red-onion', 'green-pepper', 'roasted-red-pepper',
    'jalapeno', 'olive', 'spinach', 'tomato', 'garlic', 'basil', 'pineapple', 'artichoke', 'arugula'];
  const CHEESES = ['mozzarella', 'vegan-mozz', 'parmesan', 'feta', 'gorgonzola', 'ricotta'];
  const SAUCES = ['tomato-sauce', 'white-sauce', 'buffalo-sauce', 'no-sauce'];

  const CATEGORIES = [
    { id: 'pizzas', name: 'Pizzas', icon: 'pizza' },
    { id: 'salads', name: 'Salads', icon: 'salad' },
    { id: 'sides', name: 'Sides', icon: 'side' },
    { id: 'desserts', name: 'Desserts', icon: 'dessert' },
    { id: 'kids', name: 'Kids Meal', icon: 'kids' },
    { id: 'beverages', name: 'Beverages', icon: 'drink' },
    { id: 'extras', name: 'Extras', icon: 'extra' }
  ];

  const n = (cal, fat, carbs, protein, sodium) => ({ cal, fat, carbs, protein, sodium });
  const pz = (sauce, items) => ({ sauce, items }); // items: ingredient ids at Regular / Whole

  const PRODUCTS = [
    // Pizzas
    { id: 'p-cyo', cat: 'pizzas', name: 'Create Your Own', desc: 'Start with tomato and mozzarella, then pile on anything — toppings included. Supports independent half-and-half recipes.',
      price: 1197, diet: 'veg', builder: 'pizza', custom: true, splitAllowed: true, recipe: pz('tomato-sauce', ['mozzarella']), nutrition: n(720, 26, 92, 30, 1480), tag: 'Build it' },
    { id: 'p-one', cat: 'pizzas', name: 'One Topping', desc: 'Mozzarella plus your one favourite topping. Cheese choices don’t count toward the limit.',
      price: 997, diet: 'veg', builder: 'pizza', toppingLimit: 1, recipe: pz('tomato-sauce', ['mozzarella', 'mushroom']), nutrition: n(740, 27, 93, 31, 1520), tag: 'Value' },
    { id: 'p-maddog', cat: 'pizzas', name: 'Mad Dog', desc: 'Tomato, mozzarella, pepperoni, Italian sausage and ham. Built for meat lovers.',
      price: 1297, diet: 'nonveg', builder: 'pizza', signature: true, recipe: pz('tomato-sauce', ['mozzarella', 'pepperoni', 'sausage', 'ham']), nutrition: n(1010, 49, 92, 48, 2510), tag: 'Popular' },
    { id: 'p-tristan', cat: 'pizzas', name: 'Tristan', desc: 'White sauce, mozzarella, mushrooms, roasted red peppers, roasted garlic and artichokes.',
      price: 1297, diet: 'veg', builder: 'pizza', signature: true, recipe: pz('white-sauce', ['mozzarella', 'mushroom', 'roasted-red-pepper', 'garlic', 'artichoke']), nutrition: n(860, 36, 98, 33, 1720) },
    { id: 'p-maddy', cat: 'pizzas', name: 'Maddy', desc: 'White sauce, mozzarella, spinach, fresh tomatoes and roasted garlic.',
      price: 1297, diet: 'veg', builder: 'pizza', signature: true, recipe: pz('white-sauce', ['mozzarella', 'spinach', 'tomato', 'garlic']), nutrition: n(810, 33, 96, 32, 1610) },
    { id: 'p-dominic', cat: 'pizzas', name: 'Dominic', desc: 'Tomato, mozzarella, Italian sausage, red onion and dollops of ricotta.',
      price: 1297, diet: 'nonveg', builder: 'pizza', signature: true, recipe: pz('tomato-sauce', ['mozzarella', 'ricotta', 'sausage', 'red-onion']), nutrition: n(960, 45, 94, 44, 2200) },
    { id: 'p-caspian', cat: 'pizzas', name: 'Caspian', desc: 'Buffalo sauce, mozzarella, gorgonzola, roasted chicken and red onion.',
      price: 1397, diet: 'nonveg', builder: 'pizza', signature: true, recipe: pz('buffalo-sauce', ['mozzarella', 'gorgonzola', 'chicken', 'red-onion']), nutrition: n(930, 40, 91, 52, 2380), tag: 'Spicy' },
    { id: 'p-lucy', cat: 'pizzas', name: 'Lucy Sunshine', desc: 'Tomato, mozzarella, parmesan, roasted garlic and fresh basil.',
      price: 1197, diet: 'veg', builder: 'pizza', signature: true, recipe: pz('tomato-sauce', ['mozzarella', 'parmesan', 'garlic', 'basil']), nutrition: n(790, 31, 94, 34, 1590) },
    { id: 'p-garden', cat: 'pizzas', name: 'Vegan Garden', desc: 'Tomato, vegan mozzarella, spinach, mushrooms, green peppers, olives and red onion.',
      price: 1297, diet: 'vegan', builder: 'pizza', signature: true, recipe: pz('tomato-sauce', ['vegan-mozz', 'spinach', 'mushroom', 'green-pepper', 'olive', 'red-onion']), nutrition: n(690, 22, 101, 18, 1430), tag: 'Vegan' },
    { id: 'p-truffle', cat: 'pizzas', name: 'Truffle Shroom', desc: 'Seasonal: white sauce, mushrooms, arugula and parmesan.', price: 1497, diet: 'veg', builder: 'pizza', signature: true, available: false,
      recipe: pz('white-sauce', ['mozzarella', 'parmesan', 'mushroom', 'arugula']), nutrition: n(840, 35, 95, 33, 1650), tag: 'Sold out' },
    { id: 'p-holiday', cat: 'pizzas', name: 'Holiday Pie (unpublished)', desc: 'Hidden test product.', price: 1597, diet: 'veg', builder: 'pizza', published: false,
      recipe: pz('tomato-sauce', ['mozzarella']), nutrition: n(800, 30, 90, 30, 1500) },

    // Salads
    { id: 's-caesar', cat: 'salads', name: 'Caesar', desc: 'Romaine, parmesan and croutons with Caesar dressing.', price: 897, diet: 'veg', builder: 'salad',
      recipe: { greens: 'romaine', dressing: 'caesar', toppings: ['parmesan', 'croutons'] }, nutrition: n(420, 32, 22, 12, 780) },
    { id: 's-italian', cat: 'salads', name: 'Italian Chop', desc: 'Romaine, salami, tomatoes, red onion, olives, pepperoncini and feta with balsamic. Contains meat.', price: 997, diet: 'nonveg', builder: 'salad',
      recipe: { greens: 'romaine', dressing: 'balsamic', toppings: ['salami', 'tomato', 'red-onion', 'olive', 'pepperoncini', 'feta'] }, nutrition: n(510, 38, 18, 21, 1350) },
    { id: 's-garden', cat: 'salads', name: 'Garden', desc: 'Mixed greens, cucumber, tomatoes, chickpeas and red onion with balsamic.', price: 797, diet: 'vegan', builder: 'salad',
      recipe: { greens: 'mixed', dressing: 'balsamic', toppings: ['cucumber', 'tomato', 'chickpeas', 'red-onion'] }, nutrition: n(290, 16, 30, 9, 420) },
    { id: 's-greek', cat: 'salads', name: 'Greek', desc: 'Romaine, feta, cucumber, olives, tomatoes and red onion.', price: 897, diet: 'veg', builder: 'salad',
      recipe: { greens: 'romaine', dressing: 'balsamic', toppings: ['feta', 'cucumber', 'olive', 'tomato', 'red-onion'] }, nutrition: n(380, 28, 19, 11, 960) },

    // Sides
    { id: 'd-garlic', cat: 'sides', name: 'Garlic Strips', desc: 'Oven-baked dough strips brushed with garlic oil and parmesan.', price: 597, diet: 'veg', nutrition: n(560, 24, 70, 16, 980) },
    { id: 'd-cheesy', cat: 'sides', name: 'Cheesy Bread', desc: 'Mozzarella-loaded bread with a side of tomato dip.', price: 697, diet: 'veg', nutrition: n(690, 30, 74, 28, 1240) },
    { id: 'd-bites', cat: 'sides', name: 'Buffalo Chicken Bites', desc: 'Roasted chicken bites tossed in buffalo sauce with ranch.', price: 897, diet: 'nonveg', nutrition: n(480, 26, 14, 42, 1680) },

    // Desserts
    { id: 'x-cakepop', cat: 'desserts', name: 'Cake Pop Pair', desc: 'Two cake pops — pick each flavor.', price: 397, diet: 'veg', builder: 'cakepop', recipe: { f1: 'pink-vanilla', f2: 'pumpkin-spice' }, nutrition: n(340, 16, 46, 3, 210), tag: 'Seasonal' },
    { id: 'x-nonamecake', cat: 'desserts', name: 'No Name Cake', desc: 'Chocolate cake with a rich ganache layer.', price: 397, diet: 'veg', nutrition: n(410, 22, 50, 5, 260) },
    { id: 'x-cinnamon', cat: 'desserts', name: 'Cinnamon Strips', desc: 'Warm dough strips with cinnamon sugar and icing.', price: 497, diet: 'veg', nutrition: n(520, 18, 82, 9, 450) },
    { id: 'x-cookie', cat: 'desserts', name: 'Vegan Chocolate Cookie', desc: 'Soft-baked, dairy- and egg-free.', price: 297, diet: 'vegan', nutrition: n(300, 14, 41, 3, 190) },

    // Kids
    { id: 'k-meal', cat: 'kids', name: 'Kids Meal', desc: 'Small pizza with one topping or cheese only, plus a drink.', price: 697, diet: 'veg', builder: 'kids', recipe: { topping: 'cheese', drink: 'apple-juice' }, nutrition: n(520, 18, 66, 22, 980) },

    // Beverages
    { id: 'b-lemonade', cat: 'beverages', name: 'House Lemonade', desc: 'Fresh-squeezed, lightly sweet. 20 oz.', price: 299, diet: 'vegan', nutrition: n(180, 0, 46, 0, 10) },
    { id: 'b-tea', cat: 'beverages', name: 'Iced Tea', desc: 'Unsweetened black tea. 20 oz.', price: 279, diet: 'vegan', nutrition: n(0, 0, 0, 0, 10) },
    { id: 'b-rootbeer', cat: 'beverages', name: 'Craft Root Beer', desc: 'Small-batch root beer. 12 oz bottle.', price: 299, diet: 'vegan', nutrition: n(170, 0, 45, 0, 50) },
    { id: 'b-water', cat: 'beverages', name: 'Bottled Water', desc: 'Still water. 16.9 oz.', price: 199, diet: 'vegan', nutrition: n(0, 0, 0, 0, 0) },
    { id: 'b-beer', cat: 'beverages', name: 'Local Draft Beer', desc: 'Pickup only. ID required at the counter. 16 oz.', price: 699, diet: 'vegan', pickupOnly: true, nutrition: n(190, 0, 15, 2, 15), tag: 'Pickup only' },
    { id: 'b-wine', cat: 'beverages', name: 'House Red Wine', desc: 'Pickup only. ID required at the counter. 6 oz.', price: 899, diet: 'vegan', pickupOnly: true, nutrition: n(150, 0, 4, 0, 5), tag: 'Pickup only' },

    // Extras
    { id: 'e-ranch', cat: 'extras', name: 'Ranch Dip', desc: '2 oz side of ranch.', price: 79, diet: 'veg', nutrition: n(220, 23, 2, 1, 310) },
    { id: 'e-pepper', cat: 'extras', name: 'Red Pepper Flakes', desc: 'Free packets.', price: 0, diet: 'vegan', free: true, nutrition: n(0, 0, 0, 0, 0) },
    { id: 'e-cutlery', cat: 'extras', name: 'Napkins & Cutlery', desc: 'Free — only if you need them.', price: 0, diet: 'vegan', free: true, nutrition: n(0, 0, 0, 0, 0) }
  ];

  const KIDS_DRINKS = [
    { id: 'apple-juice', name: 'Apple juice', diet: 'vegan' }, { id: 'milk', name: 'Milk', diet: 'veg' },
    { id: 'choc-milk', name: 'Chocolate milk', diet: 'veg' }, { id: 'water', name: 'Water', diet: 'vegan' }
  ];
  const CAKEPOP_FLAVORS = [{ id: 'pink-vanilla', name: 'Pink vanilla', color: '#f6a5c0' }, { id: 'pumpkin-spice', name: 'Pumpkin spice', color: '#d9822b' }];

  const D = (s) => new Date(s).getTime();
  // kind: pct | fixed | twoPizza | pizzaDessert
  const OFFERS = [
    { id: 'o-sweet', code: 'SWEETDEAL', title: 'Free dessert with any pizza', kind: 'pizzaDessert', value: 500, minSpend: 0, modes: ['pickup', 'delivery'],
      audience: 'public', stores: null, start: D('2026-01-01'), end: D('2027-06-30'), limit: 5, featured: true,
      blurb: 'Buy any pizza and get one dessert on us (up to $5.00).', terms: 'Requires at least one pizza and one dessert in the cart. Discount equals the lowest-priced dessert, up to $5.00. One offer or points reward per order.' },
    { id: 'o-two', code: '2PIZZA25', title: 'Any 2 pizzas for $25', kind: 'twoPizza', value: 2500, minSpend: 0, modes: ['pickup', 'delivery'],
      audience: 'public', stores: null, start: D('2026-01-01'), end: D('2027-06-30'), limit: 10,
      blurb: 'Two of any pizza, any size, for $25 total.', terms: 'Applies to the two highest-priced pizzas in the cart. If they already cost $25 or less, no discount applies.' },
    { id: 'o-welcome', code: 'WELCOME20', title: '20% off your order', kind: 'pct', value: 20, maxDiscount: 1000, minSpend: 2500, modes: ['pickup', 'delivery'],
      audience: 'public', stores: null, start: D('2026-01-01'), end: D('2027-06-30'), limit: 1,
      blurb: '20% off food when you spend $25 or more (max $10 off).', terms: 'Minimum food spend $25.00 before tax and fees. Maximum discount $10.00. Once per customer.' },
    { id: 'o-pickup', code: 'PICKUP5', title: '$5 off pickup orders', kind: 'fixed', value: 500, minSpend: 2000, modes: ['pickup'],
      audience: 'public', stores: null, start: D('2026-01-01'), end: D('2027-06-30'), limit: 3,
      blurb: 'Grab it yourself and save $5 on $20+.', terms: 'Pickup orders only. Minimum food spend $20.00.' },
    { id: 'o-milehigh', code: 'MILEHIGH', title: '15% off in Denver', kind: 'pct', value: 15, maxDiscount: 1500, minSpend: 1500, modes: ['pickup', 'delivery'],
      audience: 'public', stores: ['s3'], start: D('2026-01-01'), end: D('2027-06-30'), limit: 5,
      blurb: 'Local deal at the LoDo store only.', terms: 'Valid at participating store: LoDo, Denver. Minimum food spend $15.00. Maximum $15.00 off.' },
    { id: 'o-member', code: 'MEMBER10', title: '$10 off — members only', kind: 'fixed', value: 1000, minSpend: 3000, modes: ['pickup', 'delivery'],
      audience: 'member', stores: null, start: D('2026-01-01'), end: D('2027-06-30'), limit: 1,
      blurb: 'A thank-you coupon assigned to your rewards account.', terms: 'Member-assigned coupon. Minimum food spend $30.00. One use.' },
    { id: 'o-summer', code: 'SUMMER15', title: '15% off summer special', kind: 'pct', value: 15, maxDiscount: 1000, minSpend: 1500, modes: ['pickup', 'delivery'],
      audience: 'public', stores: null, start: D('2026-06-01'), end: D('2026-09-01'), limit: 1,
      blurb: 'Ended September 1.', terms: 'Valid June 1 – September 1, 2026.' }
  ];

  // kind: orderOff | pizza | dessert | delivery
  const REWARDS = [
    { id: 'r-5off', name: '$5 off your order', kind: 'orderOff', value: 500, cost: 500, minSpend: 1500, tier: null, stores: null, limit: null,
      start: D('2026-01-01'), end: D('2027-12-31'), desc: 'Take $5.00 off food when you spend $15 or more.' },
    { id: 'r-delivery', name: 'Free delivery', kind: 'delivery', cost: 400, minSpend: 1000, tier: null, stores: null, limit: 3,
      start: D('2026-01-01'), end: D('2027-12-31'), desc: 'Delivery fee waived. Delivery orders only. Up to 3 uses.' },
    { id: 'r-dessert', name: 'Free dessert', kind: 'dessert', value: 500, cost: 600, minSpend: 0, tier: null, stores: null, limit: null,
      start: D('2026-01-01'), end: D('2027-12-31'), desc: 'One dessert in your cart is free (up to $5.00).' },
    { id: 'r-pizza', name: 'Free pizza', kind: 'pizza', value: 1600, cost: 1500, minSpend: 0, tier: null, stores: ['s1', 's2', 's3', 's4', 's5'], limit: null,
      start: D('2026-01-01'), end: D('2027-12-31'), desc: 'One pizza free, any recipe (up to $16.00). Not valid at Union Square.' },
    { id: 'r-gold15', name: '$15 off — Gold', kind: 'orderOff', value: 1500, cost: 1200, minSpend: 4000, tier: 'gold', stores: null, limit: 2,
      start: D('2026-01-01'), end: D('2027-12-31'), desc: 'Gold members: $15.00 off food on $40+.' }
  ];

  // Sample in-store receipts that can be "scanned" for loyalty credit (prototype only).
  const SAMPLE_RECEIPTS = [
    { id: 'RCPT-1302-88417', storeId: 's1', total: 2847, daysAgo: 1, label: 'Capitol Hill · yesterday · $28.47' },
    { id: 'RCPT-1600-55213', storeId: 's3', total: 1695, daysAgo: 4, label: 'LoDo · 4 days ago · $16.95' },
    { id: 'RCPT-0575-11904', storeId: 's2', total: 3120, daysAgo: 45, label: 'Bellevue Square · 45 days ago · $31.20 (too old)' }
  ];

  // Sample ZIP centroids for offline store search (prototype — no live geocoding).
  const ZIPS = {
    '98101': [47.6105, -122.3348, 'Seattle, WA'], '98122': [47.6110, -122.3050, 'Seattle, WA'], '98109': [47.6301, -122.3459, 'Seattle, WA'],
    '98004': [47.6180, -122.2050, 'Bellevue, WA'], '98033': [47.6769, -122.2060, 'Kirkland, WA'], '98052': [47.6787, -122.1240, 'Redmond, WA'],
    '80202': [39.7530, -104.9990, 'Denver, CO'], '80205': [39.7590, -104.9660, 'Denver, CO'], '80301': [40.0490, -105.2130, 'Boulder, CO'],
    '60607': [41.8742, -87.6525, 'Chicago, IL'], '60614': [41.9220, -87.6510, 'Chicago, IL'], '60601': [41.8858, -87.6181, 'Chicago, IL'],
    '78704': [30.2430, -97.7650, 'Austin, TX'], '78701': [30.2711, -97.7437, 'Austin, TX'], '78758': [30.3880, -97.7060, 'Austin, TX'],
    '10003': [40.7318, -73.9893, 'New York, NY'], '10001': [40.7506, -73.9972, 'New York, NY'], '11201': [40.6943, -73.9903, 'Brooklyn, NY'],
    '94103': [37.7726, -122.4099, 'San Francisco, CA'], '90012': [34.0614, -118.2385, 'Los Angeles, CA'], '97201': [45.5075, -122.6900, 'Portland, OR'], '02108': [42.3576, -71.0638, 'Boston, MA']
  };
  // Approximate region centroids by ZIP prefix, used when a ZIP isn't in the sample table.
  const ZIP_PREFIX = { '980': [47.6, -122.3, 'Seattle area'], '981': [47.6, -122.3, 'Seattle area'], '802': [39.74, -104.99, 'Denver area'], '803': [40.0, -105.2, 'Boulder area'],
    '606': [41.88, -87.63, 'Chicago area'], '787': [30.27, -97.74, 'Austin area'], '100': [40.75, -73.99, 'New York area'], '112': [40.65, -73.95, 'Brooklyn area'] };
  const ZIP_REGION = { '0': [42.36, -71.06, 'New England'], '1': [40.75, -73.99, 'New York region'], '2': [38.90, -77.04, 'Mid-Atlantic'], '3': [33.75, -84.39, 'Southeast'],
    '4': [39.77, -86.16, 'Great Lakes'], '5': [44.98, -93.27, 'Upper Midwest'], '6': [41.88, -87.63, 'Midwest'], '7': [32.78, -96.80, 'South Central'], '8': [39.74, -104.99, 'Mountain West'], '9': [47.61, -122.33, 'West Coast'] };
  const SIM_GPS = { lat: 47.6142, lng: -122.3196, label: 'Current location (simulated: Capitol Hill, Seattle)' };

  window.MOD_DATA = { CONFIG, STORES, INGREDIENTS, PRODUCTS, CATEGORIES, OFFERS, REWARDS, SALAD_TOPPINGS, PIZZA_TOPPINGS, CHEESES, SAUCES, KIDS_DRINKS, CAKEPOP_FLAVORS, SAMPLE_RECEIPTS, ZIPS, ZIP_PREFIX, ZIP_REGION, SIM_GPS };
})();
