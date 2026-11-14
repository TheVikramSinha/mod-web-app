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
    saladSizes: [
      { id: 'mini', name: 'MINI', sub: 'Side', adj: -300 },
      { id: 'mod', name: 'MOD', sub: 'Entrée', adj: 0 },
      { id: 'mega', name: 'MEGA', sub: 'Family size', adj: 600 }
    ],
    sizes: [
      { id: 'small', name: 'Mini', inch: '6"', adj: -300 },
      { id: 'regular', name: 'MOD', inch: '11"', adj: 0 },
      { id: 'mega', name: 'MEGA', inch: '11" thick crust', adj: 300 }
    ],
    crusts: [
      { id: 'original', name: 'Thin', adj: 0 },
      { id: 'cauli', name: 'Cauliflower', adj: 300 },
      { id: 'gf', name: 'Gluten-friendly', adj: 300 }
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
    allergens: ['Milk', 'Eggs', 'Wheat', 'Soy', 'Peanuts', 'Tree nuts', 'Sesame', 'Fish', 'Shellfish'],
    diets: [
      { id: 'vegetarian', name: 'Vegetarian', desc: 'No meat or fish' },
      { id: 'vegan', name: 'Vegan', desc: 'No animal products' },
      { id: 'dairy-free', name: 'Dairy-free', desc: 'No cheese or dairy sauces' },
      { id: 'no-pork', name: 'No pork', desc: 'No pepperoni, sausage, ham, bacon or salami' },
      { id: 'gluten-conscious', name: 'Gluten-conscious', desc: 'Prefer cauliflower crust' }
    ],
    pickupMethods: { instore: 'In-store pickup', curbside: 'Curbside pickup', drivethru: 'Drive-thru' },
    dropoffs: { door: 'Leave at door', hand: 'Hand it to me' },
    popularDefault: ['p-ogpep', 'p-one', 'p-carnivore', 'p-firebird', 'x-nonamecake', 's-italian', 'd-garlic', 'b-lemonade'],
    profileBonus: 100,
    challenge: { id: 'explore3', name: 'Pizza Explorer', need: 3, points: 250 }
  };

  const STORES = [
    { id: 's1', lat: 47.6151, lng: -122.3270, name: 'Capitol Hill', city: 'Seattle, WA', address: '1302 Pine St, Seattle, WA 98101', tz: 'America/Los_Angeles',
      open: 540, close: 1440, modes: ['pickup', 'delivery'], deliveryFee: 399, prepMin: 15, priceFactor: 1, accepting: true,
      outProducts: [], outIngredients: [], pickupMethods: ['instore', 'curbside', 'drivethru'], popular: ['p-ogpep', 'p-maddy', 'p-firebird', 'p-pesto', 'x-nonamecake', 'b-lemonade'], pickupNote: 'Pickup shelf is left of the ordering counter. Show your order name or number.' },
    { id: 's2', lat: 47.6157, lng: -122.2036, name: 'Bellevue Square', city: 'Bellevue, WA', address: '575 Bellevue Sq, Bellevue, WA 98004', tz: 'America/Los_Angeles',
      open: 600, close: 1320, modes: ['pickup', 'delivery'], deliveryFee: 299, prepMin: 20, priceFactor: 1, accepting: true,
      outProducts: ['p-pesto'], outIngredients: ['artichoke'], pickupMethods: ['instore', 'curbside'], popular: ['p-maddy', 'p-vegout', 'p-ogpep', 's-caesar', 'x-cinnamod', 'b-tea'], pickupNote: 'Mall level 2 food hall. Use the MOD pickup counter by the register.' },
    { id: 's3', lat: 39.7527, lng: -105.0002, name: 'LoDo', city: 'Denver, CO', address: '1600 Wynkoop St, Denver, CO 80202', tz: 'America/Denver',
      open: 630, close: 1410, modes: ['pickup', 'delivery'], deliveryFee: 349, prepMin: 15, priceFactor: 1.05, accepting: true,
      outProducts: [], outIngredients: [], pickupMethods: ['instore', 'drivethru'], popular: ['p-carnivore', 'p-smoke', 'p-modgherita', 'd-garlic', 'x-cinnamod', 'b-fountain'], pickupNote: 'Walk in and grab your order from the heated pickup rack.' },
    { id: 's4', lat: 41.8843, lng: -87.6551, name: 'West Loop', city: 'Chicago, IL', address: '1100 W Randolph St, Chicago, IL 60607', tz: 'America/Chicago',
      open: 660, close: 1380, modes: ['pickup', 'delivery'], deliveryFee: 449, prepMin: 18, priceFactor: 1.08, accepting: true,
      outProducts: ['s-med'], outIngredients: ['bacon'], pickupMethods: ['instore'], popular: ['p-legend', 'p-carnivore', 'p-ogpep', 'd-strips', 'x-nonamecake', 'b-lemonade'], pickupNote: 'Pickup counter is at the end of the make line.' },
    { id: 's5', lat: 30.2496, lng: -97.7497, name: 'South Congress', city: 'Austin, TX', address: '1500 S Congress Ave, Austin, TX 78704', tz: 'America/Chicago',
      open: 600, close: 1320, modes: ['pickup'], deliveryFee: null, prepMin: 15, priceFactor: 0.98, accepting: true,
      outProducts: [], outIngredients: [], pickupMethods: ['instore', 'curbside', 'drivethru'], popular: ['p-vegout', 'p-ogpep', 'p-aloha', 's-garden', 'x-nonamecake', 'b-tea'], pickupNote: 'Pickup only at this location. Shelf by the front window.' },
    { id: 's6', lat: 40.7356, lng: -73.9925, name: 'Union Square', city: 'New York, NY', address: '30 E 14th St, New York, NY 10003', tz: 'America/New_York',
      open: 660, close: 1380, modes: ['pickup', 'delivery'], deliveryFee: 499, prepMin: 20, priceFactor: 1.12, accepting: false,
      pausedReason: 'Online ordering is paused at this store right now.', outProducts: [], outIngredients: [], pickupMethods: ['instore'], popular: ['p-ogpep', 'p-firebird', 'p-maddy', 'd-garlic', 'x-nonamecake', 'b-water'], pickupNote: 'Pickup at the front counter.' }
  ];

  // type: sauce | cheese | meat | veggie | finish | salad | dressing | greens  (names follow MOD's published menu)
  const INGREDIENTS = [
    { id: 'tomato-sauce', name: 'Tomato', type: 'sauce', color: '#d63b2a', diet: 'vegan' },
    { id: 'spicy-tomato', name: 'Spicy tomato', type: 'sauce', color: '#b8291b', diet: 'vegan' },
    { id: 'white-sauce', name: 'Creamy alfredo', type: 'sauce', color: '#f3ead6', diet: 'veg' },
    { id: 'bbq-sauce', name: 'BBQ', type: 'sauce', color: '#7a2e14', diet: 'vegan' },
    { id: 'buffalo-sauce', name: 'Frank’s Buffalo', type: 'sauce', color: '#e66a1f', diet: 'veg' },
    { id: 'pesto-sauce', name: 'Pesto', type: 'sauce', color: '#5d8f2f', diet: 'veg' },
    { id: 'garlic-rub', name: 'Garlic rub', type: 'sauce', color: '#efdca6', diet: 'vegan' },
    { id: 'olive-oil', name: 'Olive oil', type: 'sauce', color: '#d8c35a', diet: 'vegan' },
    { id: 'no-sauce', name: 'No sauce', type: 'sauce', color: null, diet: 'vegan' },

    { id: 'mozzarella', name: 'Mozzarella', type: 'cheese', color: '#fff3c4', diet: 'veg' },
    { id: 'asiago', name: 'Asiago', type: 'cheese', color: '#f4e1a6', diet: 'veg' },
    { id: 'parmesan', name: 'Parmesan', type: 'cheese', color: '#f5e7b0', diet: 'veg' },
    { id: 'cheddar', name: 'Cheddar', type: 'cheese', color: '#f0b23c', diet: 'veg' },
    { id: 'feta', name: 'Feta', type: 'cheese', color: '#ffffff', diet: 'veg' },
    { id: 'gorgonzola', name: 'Gorgonzola', type: 'cheese', color: '#dfe7d7', diet: 'veg' },
    { id: 'ricotta', name: 'Ricotta', type: 'cheese', color: '#fffdf5', diet: 'veg' },
    { id: 'vegan-mozz', name: 'Plant-based cheese', type: 'cheese', color: '#fff8e0', diet: 'vegan' },

    { id: 'pepperoni', name: 'Pepperoni', type: 'meat', color: '#b3261e', shape: 'disc', diet: 'nonveg' },
    { id: 'sausage', name: 'Italian sausage', type: 'meat', color: '#7a4b32', shape: 'blob', diet: 'nonveg' },
    { id: 'ground-beef', name: 'Ground beef', type: 'meat', color: '#5e3a24', shape: 'blob', diet: 'nonveg' },
    { id: 'bacon', name: 'Bacon', type: 'meat', color: '#a23b2a', shape: 'strip', diet: 'nonveg' },
    { id: 'canadian-bacon', name: 'Canadian bacon', type: 'meat', color: '#e59a9a', shape: 'disc', diet: 'nonveg' },
    { id: 'chicken', name: 'Grilled chicken', type: 'meat', color: '#d9b48a', shape: 'square', diet: 'nonveg' },
    { id: 'spicy-chicken-sausage', name: 'Spicy chicken sausage', type: 'meat', color: '#a0522d', shape: 'blob', diet: 'nonveg' },
    { id: 'salami', name: 'Salami', type: 'meat', color: '#a8323e', shape: 'disc', diet: 'nonveg' },
    { id: 'anchovies', name: 'Anchovies', type: 'meat', color: '#7d6e60', shape: 'strip', diet: 'nonveg' },
    { id: 'plant-sausage', name: 'Plant-based sausage', type: 'meat', color: '#8a6345', shape: 'blob', diet: 'vegan' },

    { id: 'mushroom', name: 'Mushrooms', type: 'veggie', color: '#b49a7d', shape: 'half', diet: 'vegan' },
    { id: 'red-onion', name: 'Red onion', type: 'veggie', color: '#9c4a8b', shape: 'ring', diet: 'vegan' },
    { id: 'green-pepper', name: 'Green peppers', type: 'veggie', color: '#3f8f3a', shape: 'strip', diet: 'vegan' },
    { id: 'roasted-red-pepper', name: 'Roasted red peppers', type: 'veggie', color: '#d5432c', shape: 'strip', diet: 'vegan' },
    { id: 'jalapeno', name: 'Jalapeños', type: 'veggie', color: '#4c9a2a', shape: 'ring', diet: 'vegan' },
    { id: 'peppas', name: 'Mama Lil’s sweet hot peppas', type: 'veggie', color: '#e05a2a', shape: 'strip', diet: 'vegan' },
    { id: 'olive', name: 'Black olives', type: 'veggie', color: '#2b2b2b', shape: 'ring', diet: 'vegan' },
    { id: 'spinach', name: 'Spinach', type: 'veggie', color: '#2f7d32', shape: 'leaf', diet: 'vegan' },
    { id: 'tomato', name: 'Tomatoes', type: 'veggie', color: '#e2412f', shape: 'disc', diet: 'vegan' },
    { id: 'garlic', name: 'Roasted garlic', type: 'veggie', color: '#f1dfb0', shape: 'blob', diet: 'vegan' },
    { id: 'garlic-chopped', name: 'Chopped garlic', type: 'veggie', color: '#f7ecc8', shape: 'blob', diet: 'vegan' },
    { id: 'basil', name: 'Basil', type: 'veggie', color: '#2e8b3d', shape: 'leaf', diet: 'vegan' },
    { id: 'cilantro', name: 'Cilantro', type: 'veggie', color: '#3b9a3b', shape: 'leaf', diet: 'vegan' },
    { id: 'oregano', name: 'Oregano', type: 'veggie', color: '#6b8e3a', shape: 'leaf', diet: 'vegan' },
    { id: 'pineapple', name: 'Pineapple', type: 'veggie', color: '#f4c430', shape: 'square', diet: 'vegan' },
    { id: 'artichoke', name: 'Artichokes', type: 'veggie', color: '#8aa35b', shape: 'half', diet: 'vegan' },
    { id: 'arugula', name: 'Arugula', type: 'veggie', color: '#4f8f2f', shape: 'leaf', diet: 'vegan' },
    { id: 'broccoli', name: 'Roasted broccoli', type: 'veggie', color: '#3e7d2a', shape: 'blob', diet: 'vegan' },
    { id: 'corn', name: 'Roasted corn', type: 'veggie', color: '#f2c94c', shape: 'blob', diet: 'vegan' },
    { id: 'chili-flakes', name: 'Red pepper flakes', type: 'veggie', color: '#c62d1c', shape: 'blob', diet: 'vegan' },

    { id: 'fig-glaze', name: 'Balsamic fig glaze', type: 'finish', color: '#4a1f24', shape: 'drizzle', diet: 'vegan' },
    { id: 'hot-honey', name: 'Mike’s Hot Honey', type: 'finish', color: '#d9952b', shape: 'drizzle', diet: 'veg' },
    { id: 'buffalo-finish', name: 'Hot buffalo', type: 'finish', color: '#e66a1f', shape: 'drizzle', diet: 'veg' },
    { id: 'bbq-finish', name: 'BBQ', type: 'finish', color: '#7a2e14', shape: 'drizzle', diet: 'vegan' },
    { id: 'pesto-finish', name: 'Pesto', type: 'finish', color: '#5d8f2f', shape: 'drizzle', diet: 'veg' },
    { id: 'ranch-finish', name: 'Ranch', type: 'finish', color: '#f7f2e6', shape: 'drizzle', diet: 'veg' },
    { id: 'sriracha', name: 'Sriracha', type: 'finish', color: '#d6301e', shape: 'drizzle', diet: 'vegan' },
    { id: 'sriracha-ranch', name: 'Sriracha ranch', type: 'finish', color: '#f0a07a', shape: 'drizzle', diet: 'veg' },

    { id: 'romaine', name: 'Romaine', type: 'greens', diet: 'vegan' },
    { id: 'mixed', name: 'Mixed greens', type: 'greens', diet: 'vegan' },
    { id: 'arugula-g', name: 'Arugula', type: 'greens', diet: 'vegan' },

    { id: 'caesar', name: 'Caesar', type: 'dressing', diet: 'veg' },
    { id: 'balsamic', name: 'Balsamic vinaigrette', type: 'dressing', diet: 'vegan' },
    { id: 'champagne', name: 'Champagne vinaigrette', type: 'dressing', diet: 'vegan' },
    { id: 'oil-vinegar', name: 'Olive oil & red wine vinegar', type: 'dressing', diet: 'vegan' },
    { id: 'ranch', name: 'Ranch', type: 'dressing', diet: 'veg' },
    { id: 'no-dressing', name: 'No dressing', type: 'dressing', diet: 'vegan' },

    { id: 'cucumber', name: 'Cucumbers', type: 'salad', diet: 'vegan' },
    { id: 'chickpeas', name: 'Chickpeas', type: 'salad', diet: 'vegan' },
    { id: 'croutons', name: 'Croutons', type: 'salad', diet: 'vegan' },
    { id: 'pepperoncini', name: 'Pepperoncini', type: 'salad', diet: 'vegan' }
  ];

  const SALAD_TOPPINGS = ['tomato', 'cucumber', 'red-onion', 'olive', 'green-pepper', 'roasted-red-pepper', 'chickpeas', 'croutons', 'pepperoncini', 'oregano', 'mozzarella', 'asiago', 'feta', 'parmesan', 'salami', 'chicken', 'bacon'];
  const PIZZA_TOPPINGS = ['pepperoni', 'sausage', 'ground-beef', 'bacon', 'canadian-bacon', 'chicken', 'spicy-chicken-sausage', 'salami', 'anchovies', 'plant-sausage',
    'mushroom', 'red-onion', 'green-pepper', 'roasted-red-pepper', 'jalapeno', 'peppas', 'olive', 'spinach', 'tomato', 'garlic', 'garlic-chopped', 'basil', 'cilantro', 'oregano', 'pineapple', 'artichoke', 'arugula', 'broccoli', 'corn', 'chili-flakes'];
  const FINISHES = ['fig-glaze', 'hot-honey', 'buffalo-finish', 'bbq-finish', 'pesto-finish', 'ranch-finish', 'sriracha', 'sriracha-ranch'];
  const CHEESES = ['mozzarella', 'asiago', 'parmesan', 'cheddar', 'feta', 'gorgonzola', 'ricotta', 'vegan-mozz'];
  const SAUCES = ['tomato-sauce', 'spicy-tomato', 'white-sauce', 'bbq-sauce', 'buffalo-sauce', 'pesto-sauce', 'garlic-rub', 'olive-oil', 'no-sauce'];

  const CATEGORIES = [
    { id: 'pizzas', name: 'Pizzas', icon: 'pizza' },
    { id: 'salads', name: 'Salads', icon: 'salad' },
    { id: 'sides', name: 'Sides', icon: 'side' },
    { id: 'desserts', name: 'Desserts', icon: 'dessert' },
    { id: 'kids', name: 'Kids Meal', icon: 'kids' },
    { id: 'beverages', name: 'Beverages', icon: 'drink' },
    { id: 'extras', name: 'Extras', icon: 'extra' }
  ];

  // Product photos are loaded from modpizza.com (optimized CDN first, original upload as fallback, drawn art if both fail).
  const IMG_CDN = 'https://modpizza.com/nitropack_static/PcYrRCpGOqYGuuuJnjXRulqHDScUwpeM/assets/images/optimized/rev-a345840/modpizza.com/wp-content/uploads/';
  const IMG_ORIG = 'https://modpizza.com/wp-content/uploads/';
  const img = (path) => ({ img: IMG_CDN + path, imgFallback: IMG_ORIG + path });

  const n = (cal, fat, carbs, protein, sodium) => ({ cal, fat, carbs, protein, sodium });
  const pz = (sauce, items) => ({ sauce, items }); // items: ingredient ids at Regular / Whole

  // Build Your Pizza: the builder base behind “Build your own” links. Kept off the menu list (the menu only renders PRODUCTS).
  const BUILDER_PRODUCTS = [
    Object.assign({ id: 'p-cyo', cat: 'pizzas', name: 'Build Your Pizza', desc: 'Build your own with 40+ toppings and 8 finishing sauces — all for one price. Supports independent half-and-half recipes.',
      price: 1199, diet: 'veg', builder: 'pizza', custom: true, splitAllowed: true, recipe: pz('tomato-sauce', ['mozzarella']), nutrition: n(680, 24, 88, 29, 1420), calText: 'Custom', tag: 'Build your own' }, img('2021/12/260518_olo_image_square_01-23.jpg'))
  ];

  const PRODUCTS = [
    // Pizzas — signatures from modpizza.com/menu; prices are sample values
    Object.assign({ id: 'p-one', cat: 'pizzas', name: 'One Topping', desc: 'Everyday value: sauce, cheese and your one favourite topping. Cheese choices don’t count toward the limit.',
      price: 899, diet: 'nonveg', builder: 'pizza', toppingLimit: 1, recipe: pz('tomato-sauce', ['mozzarella', 'pepperoni']), nutrition: n(860, 36, 89, 37, 1980), tag: 'Value' }, img('2026/07/260518_olo_image_square_01_tan-08.jpg')),
    Object.assign({ id: 'p-maddy', cat: 'pizzas', name: 'Maddy’s Favorite', desc: 'Tomato sauce, mozzarella and asiago. Simple, cheesy, perfect.',
      price: 999, diet: 'veg', builder: 'pizza', signature: true, recipe: pz('tomato-sauce', ['mozzarella', 'asiago']), nutrition: n(682, 26, 86, 30, 1390) }, img('2026/08/260518_olo_image_square_01_tan-16.jpg')),
    Object.assign({ id: 'p-ogpep', cat: 'pizzas', name: 'OG Pepperoni', desc: 'Tomato sauce, mozzarella, asiago and pepperoni.',
      price: 1099, diet: 'nonveg', builder: 'pizza', signature: true, recipe: pz('tomato-sauce', ['mozzarella', 'asiago', 'pepperoni']), nutrition: n(906, 40, 87, 39, 2050), tag: 'Popular' }, img('2026/07/260518_olo_image_square_01_tan-08.jpg')),
    Object.assign({ id: 'p-carnivore', cat: 'pizzas', name: 'Carnivore', desc: 'Tomato sauce, mozzarella, parmesan, pepperoni, Italian sausage, ground beef and bacon.',
      price: 1399, diet: 'nonveg', builder: 'pizza', signature: true, recipe: pz('tomato-sauce', ['mozzarella', 'parmesan', 'pepperoni', 'sausage', 'ground-beef', 'bacon']), nutrition: n(1121, 56, 88, 55, 2690) }, img('2026/07/260518_olo_image_square_01_tan-10.jpg')),
    Object.assign({ id: 'p-aloha', cat: 'pizzas', name: 'Aloha', desc: 'Tomato sauce, mozzarella, Canadian bacon and pineapple.',
      price: 1199, diet: 'nonveg', builder: 'pizza', signature: true, recipe: pz('tomato-sauce', ['mozzarella', 'canadian-bacon', 'pineapple']), nutrition: n(660, 21, 92, 31, 1610) }, img('2026/07/260518_olo_image_square_01_tan-09.jpg')),
    Object.assign({ id: 'p-firebird', cat: 'pizzas', name: 'Firebird', desc: 'Olive oil, Frank’s Buffalo sauce, mozzarella, gorgonzola, cheddar, grilled chicken and a hot buffalo finish.',
      price: 1399, diet: 'nonveg', builder: 'pizza', signature: true, recipe: pz('buffalo-sauce', ['mozzarella', 'gorgonzola', 'cheddar', 'chicken', 'buffalo-finish']), nutrition: n(850, 34, 86, 52, 2410), tag: 'Spicy' }, img('2026/07/260518_olo_image_square_01_tan-12.jpg')),
    Object.assign({ id: 'p-legend', cat: 'pizzas', name: 'Loaded Legend', desc: 'Tomato sauce, mozzarella, pepperoni, Italian sausage, mushrooms, green peppers, red onion, black olives and oregano.',
      price: 1399, diet: 'nonveg', builder: 'pizza', signature: true, recipe: pz('tomato-sauce', ['mozzarella', 'pepperoni', 'sausage', 'mushroom', 'green-pepper', 'red-onion', 'olive', 'oregano']), nutrition: n(1011, 48, 92, 45, 2470) }, img('2026/07/260518_olo_image_square_01_tan-19.jpg')),
    Object.assign({ id: 'p-modgherita', cat: 'pizzas', name: 'MOD-gherita', desc: 'Garlic, olive oil, tomato sauce, mozzarella, parmesan, tomato slices, basil, salt and pepper.',
      price: 1199, diet: 'veg', builder: 'pizza', signature: true, recipe: pz('tomato-sauce', ['mozzarella', 'parmesan', 'garlic-chopped', 'tomato', 'basil']), nutrition: n(725, 28, 90, 31, 1560) }, img('2026/07/260518_olo_image_square_01_tan-18.jpg')),
    Object.assign({ id: 'p-pesto', cat: 'pizzas', name: 'Perfect Pesto', desc: 'Pesto, garlic rub, mozzarella, feta, artichokes, chili flakes, arugula, roasted garlic and balsamic fig glaze.',
      price: 1399, diet: 'veg', builder: 'pizza', signature: true, recipe: pz('pesto-sauce', ['mozzarella', 'feta', 'artichoke', 'chili-flakes', 'arugula', 'garlic', 'fig-glaze']), nutrition: n(888, 41, 95, 33, 1720), tag: 'New' }, img('2026/07/260518_olo_image_square_01_tan-03.jpg')),
    Object.assign({ id: 'p-smoke', cat: 'pizzas', name: 'Smoke Show', desc: 'Sweet BBQ sauce, mozzarella, cheddar, grilled chicken, bacon, red onion and cilantro.',
      price: 1399, diet: 'nonveg', builder: 'pizza', signature: true, recipe: pz('bbq-sauce', ['mozzarella', 'cheddar', 'chicken', 'bacon', 'red-onion', 'cilantro']), nutrition: n(954, 37, 104, 55, 2280) }, img('2026/07/260518_olo_image_square_01_tan-04.jpg')),
    Object.assign({ id: 'p-vegout', cat: 'pizzas', name: 'Veg Out', desc: 'Tomato sauce, mozzarella, parmesan, mushrooms, green peppers, red onion, black olives, diced tomatoes and oregano.',
      price: 1199, diet: 'veg', builder: 'pizza', signature: true, recipe: pz('tomato-sauce', ['mozzarella', 'parmesan', 'mushroom', 'green-pepper', 'red-onion', 'olive', 'tomato', 'oregano']), nutrition: n(670, 24, 92, 28, 1530), tag: 'New' }, img('2026/07/260518_olo_image_square_01_tan-05.jpg')),
    { id: 'p-mikes', cat: 'pizzas', name: 'Mike’s Favorite', desc: 'Tomato sauce, mozzarella, parmesan, ricotta, spicy chicken sausage, jalapeños and a Mike’s Hot Honey finish.', price: 1299, diet: 'nonveg', builder: 'pizza', signature: true, available: false,
      recipe: pz('tomato-sauce', ['mozzarella', 'parmesan', 'ricotta', 'spicy-chicken-sausage', 'jalapeno', 'hot-honey']), nutrition: n(940, 42, 96, 44, 2210), tag: 'Sold out' },
    { id: 'p-holiday', cat: 'pizzas', name: 'Holiday Pie (unpublished)', desc: 'Hidden test product.', price: 1599, diet: 'veg', builder: 'pizza', published: false,
      recipe: pz('tomato-sauce', ['mozzarella']), nutrition: n(800, 30, 90, 30, 1500) },

    // Salads — MINI / MOD / MEGA sizes
    Object.assign({ id: 's-cyo', cat: 'salads', name: 'The MOD Salad', desc: 'Build your own on romaine or mixed greens with 40+ toppings.', price: 899, diet: 'vegan', builder: 'salad', custom: true,
      recipe: { greens: 'romaine', dressing: 'balsamic', toppings: [] }, nutrition: n(60, 0, 10, 4, 40), calText: 'Custom' }, img('2021/12/260518_olo_image_square_01-24.jpg')),
    Object.assign({ id: 's-caesar', cat: 'salads', name: 'Caesar', desc: 'Romaine, Caesar dressing, asiago, parmesan and croutons.', price: 899, diet: 'veg', builder: 'salad',
      recipe: { greens: 'romaine', dressing: 'caesar', toppings: ['asiago', 'parmesan', 'croutons'] }, nutrition: n(428, 34, 18, 12, 760) }, img('2020/11/260518_olo_image_square_01_tan-14.jpg')),
    Object.assign({ id: 's-garden', cat: 'salads', name: 'Garden', desc: 'Romaine, mixed greens, cucumbers, diced tomatoes and champagne vinaigrette.', price: 799, diet: 'vegan', builder: 'salad',
      recipe: { greens: 'mixed', dressing: 'champagne', toppings: ['cucumber', 'tomato'] }, nutrition: n(125, 8, 11, 2, 210) }, img('2020/09/260518_olo_image_square_01_tan-21.jpg')),
    Object.assign({ id: 's-italian', cat: 'salads', name: 'Italian Chop', desc: 'Romaine, arugula, balsamic vinaigrette, mozzarella, parmesan, salami, black olives, green peppers, red onion and oregano. Contains meat.', price: 999, diet: 'nonveg', builder: 'salad',
      recipe: { greens: 'romaine', dressing: 'balsamic', toppings: ['mozzarella', 'parmesan', 'salami', 'olive', 'green-pepper', 'red-onion', 'oregano'] }, nutrition: n(375, 29, 12, 17, 1120) }, img('2021/12/260518_olo_italian_chop_square_tan_01-1.jpg')),
    Object.assign({ id: 's-med', cat: 'salads', name: 'Mediterranean', desc: 'Mixed greens, olive oil and red wine vinegar, feta, black olives, roasted red peppers, cucumbers, chickpeas and oregano.', price: 999, diet: 'veg', builder: 'salad',
      recipe: { greens: 'mixed', dressing: 'oil-vinegar', toppings: ['feta', 'olive', 'roasted-red-pepper', 'cucumber', 'chickpeas', 'oregano'] }, nutrition: n(163, 12, 10, 6, 480) }, img('2026/07/260518_olo_image_square_01_tan-17.jpg')),

    // Sides (sample — not listed on the public menu page)
    { id: 'd-garlic', cat: 'sides', name: 'Cheesy Garlic Bread', desc: 'Garlic rub, mozzarella and asiago on our thin crust, cut into strips with a side of tomato dip.', price: 729, diet: 'veg', nutrition: n(640, 28, 72, 26, 1180) },
    { id: 'd-strips', cat: 'sides', name: 'Garlic Strips', desc: 'Oven-baked dough strips brushed with garlic rub and parmesan.', price: 597, diet: 'veg', nutrition: n(560, 24, 70, 16, 980) },

    // Desserts
    Object.assign({ id: 'x-nonamecake', cat: 'desserts', name: 'No Name Cake', desc: 'Chocolate cake with a vanilla buttercream center and chocolate glaze.', price: 399, diet: 'veg', nutrition: n(290, 14, 38, 3, 210), tag: 'Fan favorite' }, img('2018/06/260615_olo_image_square_01-31.jpg')),
    Object.assign({ id: 'x-cinnamod', cat: 'desserts', name: 'cinnaMOD', desc: 'Our 11-inch thick crust with cinnamon sugar and butter, finished with salted caramel and icing drizzle.', price: 899, diet: 'veg', nutrition: n(1182, 38, 190, 18, 1040), tag: 'New' }, img('2026/07/cinnamod.jpg')),
    { id: 'x-cakepop', cat: 'desserts', name: 'Cake Pop Pair', desc: 'Two cake pops — pick each flavor.', price: 397, diet: 'veg', builder: 'cakepop', recipe: { f1: 'pink-vanilla', f2: 'pumpkin-spice' }, nutrition: n(340, 16, 46, 3, 210), tag: 'Seasonal' },

    // Kids
    Object.assign({ id: 'k-meal', cat: 'kids', name: 'Kids Meal', desc: 'A mini cheese or pepperoni pizza with organic juice or milk.', price: 699, diet: 'veg', builder: 'kids', recipe: { topping: 'cheese', drink: 'apple-juice' }, nutrition: n(365, 13, 48, 15, 640), calText: '365–480' }, img('2017/09/260611_olo_image_square_01-25.jpg')),

    // Beverages
    { id: 'b-fountain', cat: 'beverages', name: 'Fountain Drink', desc: 'Coca-Cola and Dr Pepper brand sodas.', price: 299, diet: 'vegan', nutrition: n(310, 0, 84, 0, 60), calText: '0–310' },
    { id: 'b-tea', cat: 'beverages', name: 'House-Made Iced Tea', desc: 'Brewed in store. Sweetened or unsweetened.', price: 299, diet: 'vegan', nutrition: n(0, 0, 0, 0, 10), calText: '0–310' },
    { id: 'b-lemonade', cat: 'beverages', name: 'House-Made Lemonade', desc: 'Fresh, lightly sweet lemonade.', price: 299, diet: 'vegan', nutrition: n(250, 0, 66, 0, 10) },
    { id: 'b-water', cat: 'beverages', name: 'Bottled Water', desc: 'Still water. 16.9 oz.', price: 199, diet: 'vegan', nutrition: n(0, 0, 0, 0, 0) },
    { id: 'b-beer', cat: 'beverages', name: 'Draft Beer', desc: 'Locally selected by region. Pickup only — ID required.', price: 699, diet: 'vegan', pickupOnly: true, nutrition: n(190, 0, 15, 2, 15), tag: 'Pickup only' },
    { id: 'b-wine', cat: 'beverages', name: 'Wine', desc: 'Locally selected by region. Pickup only — ID required.', price: 899, diet: 'vegan', pickupOnly: true, nutrition: n(150, 0, 4, 0, 5), tag: 'Pickup only' },

    // Extras
    { id: 'e-ranch', cat: 'extras', name: 'Ranch Dip', desc: '2 oz side of ranch.', price: 79, diet: 'veg', nutrition: n(220, 23, 2, 1, 310) },
    { id: 'e-hothoney', cat: 'extras', name: 'Mike’s Hot Honey', desc: 'A side cup for dipping your crust.', price: 99, diet: 'veg', nutrition: n(60, 0, 17, 0, 0) },
    { id: 'e-pepper', cat: 'extras', name: 'Red Pepper Flakes', desc: 'Free packets.', price: 0, diet: 'vegan', free: true, nutrition: n(0, 0, 0, 0, 0) },
    { id: 'e-cutlery', cat: 'extras', name: 'Napkins & Cutlery', desc: 'Free — only if you need them.', price: 0, diet: 'vegan', free: true, nutrition: n(0, 0, 0, 0, 0) }
  ];

  const KIDS_DRINKS = [
    { id: 'apple-juice', name: 'Organic apple juice', diet: 'vegan' }, { id: 'milk', name: 'Milk', diet: 'veg' },
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

  window.MOD_DATA = { CONFIG, STORES, INGREDIENTS, PRODUCTS, BUILDER_PRODUCTS, CATEGORIES, OFFERS, REWARDS, SALAD_TOPPINGS, PIZZA_TOPPINGS, FINISHES, CHEESES, SAUCES, KIDS_DRINKS, CAKEPOP_FLAVORS, SAMPLE_RECEIPTS, ZIPS, ZIP_PREFIX, ZIP_REGION, SIM_GPS };
})();
