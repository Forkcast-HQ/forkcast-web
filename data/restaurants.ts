import type { MenuItem, Restaurant } from "@/lib/types";

// Boston-area seed catalog. Nutrition values are realistic, dish-level estimates
// (the kind Palatify would compute from a menu via its nutrition engine).
// Sodium in mg, everything else in grams unless noted.

const mi = (
  id: string,
  name: string,
  description: string,
  price: number,
  macros: [number, number, number, number, number, number, number], // cal, P, C, F, fiber, sodium, sugar
  category: string,
  tags: string[],
): MenuItem => ({
  id,
  name,
  description,
  price,
  calories: macros[0],
  protein: macros[1],
  carbs: macros[2],
  fat: macros[3],
  fiber: macros[4],
  sodium: macros[5],
  sugar: macros[6],
  category,
  tags,
});

export const RESTAURANTS: Restaurant[] = [
  {
    slug: "verdant",
    name: "Verdant",
    cuisine: "Salads & Grain Bowls",
    neighborhood: "Back Bay",
    address: "152 Newbury St, Boston, MA",
    priceLevel: 2,
    rating: 4.7,
    reviews: 1284,
    deliveryMins: [18, 28],
    distanceMi: 0.6,
    lat: 42.3517,
    lng: -71.0793,
    partner: true,
    blurb:
      "Chef-built grain bowls and salads with every macro published. A Palatify launch partner.",
    category: "salad-bar",
    tags: ["healthy", "gluten-free options", "high-protein"],
    menu: [
      mi("v1", "Harvest Power Bowl", "Kale, quinoa, roasted chicken, sweet potato, almonds, lemon-tahini.", 14.5, [540, 38, 48, 20, 11, 620, 9], "grain-bowl", ["gluten-free"]),
      mi("v2", "Green Goddess Salad", "Romaine, avocado, cucumber, edamame, pumpkin seeds, herb dressing.", 12.75, [420, 18, 30, 26, 12, 540, 6], "salad", ["vegetarian", "gluten-free"]),
      mi("v3", "Steak & Farro Bowl", "Grilled steak, farro, roasted broccoli, feta, balsamic.", 16.5, [620, 40, 52, 26, 10, 720, 7], "grain-bowl", []),
      mi("v4", "Mediterranean Crunch", "Chickpeas, quinoa, cucumber, tomato, olives, feta, red-pepper hummus.", 13.25, [480, 19, 58, 20, 14, 680, 8], "grain-bowl", ["vegetarian"]),
      mi("v5", "Buffalo Chicken Salad", "Grilled buffalo chicken, romaine, carrot, blue-cheese yogurt.", 13.95, [510, 42, 22, 28, 6, 980, 5], "salad", []),
      mi("v6", "Citrus Salmon Bowl", "Brown rice, seared salmon, snap peas, mango, sesame.", 16.95, [580, 34, 56, 24, 8, 600, 12], "salmon-plate", []),
    ],
  },
  {
    slug: "lavash",
    name: "Lavash",
    cuisine: "Armenian & Mediterranean",
    neighborhood: "Central Sq, Cambridge",
    address: "1101 Massachusetts Ave, Cambridge, MA",
    priceLevel: 2,
    rating: 4.6,
    reviews: 932,
    deliveryMins: [22, 34],
    distanceMi: 1.4,
    lat: 42.3656,
    lng: -71.103,
    partner: true,
    blurb:
      "Charcoal-grilled kebabs, fresh-baked lavash and mezze. Lighter than it looks, fully macro-tagged.",
    category: "mediterranean-resto",
    tags: ["mediterranean", "halal options", "vegetarian-friendly"],
    menu: [
      mi("l1", "Chicken Shawarma Plate", "Marinated chicken, brown rice, salad, garlic sauce.", 15.0, [640, 45, 58, 24, 9, 880, 6], "mediterranean", []),
      mi("l2", "Falafel Mezze", "Falafel, hummus, tabbouleh, warm lavash.", 13.5, [560, 20, 64, 26, 15, 720, 8], "mediterranean", ["vegan"]),
      mi("l3", "Lamb Lulah Kebab", "Lean lamb kebab, bulgur pilaf, grilled vegetables.", 17.5, [700, 42, 48, 36, 10, 920, 7], "mediterranean", []),
      mi("l4", "Red Lentil Soup & Fattoush", "Red lentil soup with a crisp fattoush salad.", 11.0, [380, 18, 52, 10, 16, 760, 9], "soup", ["vegan"]),
      mi("l5", "Grilled Salmon Plate", "Salmon, freekeh, roasted vegetables, yogurt-dill.", 18.0, [590, 38, 44, 28, 11, 640, 6], "salmon-plate", []),
      mi("l6", "Halloumi Lavash Wrap", "Grilled halloumi, greens, muhammara, fresh lavash.", 12.5, [520, 22, 50, 26, 9, 820, 8], "wrap", ["vegetarian"]),
    ],
  },
  {
    slug: "blue-bowl-poke",
    name: "Blue Bowl Poke",
    cuisine: "Hawaiian Poke",
    neighborhood: "Fenway",
    address: "1330 Boylston St, Boston, MA",
    priceLevel: 2,
    rating: 4.5,
    reviews: 1567,
    deliveryMins: [15, 25],
    distanceMi: 0.9,
    lat: 42.3447,
    lng: -71.0995,
    partner: true,
    blurb:
      "Build-your-own poke with sushi-grade fish. Naturally high-protein, low-fat.",
    category: "poke-shop",
    tags: ["high-protein", "pescatarian", "gluten-free options"],
    menu: [
      mi("p1", "Classic Ahi Poke", "Ahi tuna, brown rice, edamame, seaweed, ponzu.", 15.5, [520, 36, 60, 12, 8, 780, 7], "poke", []),
      mi("p2", "Spicy Salmon Bowl", "Salmon, white rice, cucumber, avocado, spicy mayo.", 15.75, [640, 32, 62, 28, 7, 820, 9], "poke", []),
      mi("p3", "Tofu Greens Bowl", "Tofu, mixed greens, edamame, mango, sesame-ginger.", 13.0, [430, 22, 44, 18, 10, 560, 12], "poke", ["vegan"]),
      mi("p4", "Shrimp Crunch Bowl", "Shrimp, rice, wakame, crispy onion, yuzu.", 15.0, [500, 30, 58, 14, 6, 880, 8], "poke", []),
      mi("p5", "Double Protein Power", "Ahi + salmon, cauliflower rice, edamame.", 17.5, [540, 48, 28, 22, 9, 760, 6], "poke", []),
    ],
  },
  {
    slug: "sol-and-lima",
    name: "Sol & Lima",
    cuisine: "Modern Mexican",
    neighborhood: "South End",
    address: "560 Tremont St, Boston, MA",
    priceLevel: 2,
    rating: 4.6,
    reviews: 2043,
    deliveryMins: [20, 30],
    distanceMi: 1.1,
    lat: 42.3433,
    lng: -71.073,
    partner: false,
    blurb:
      "Bright, fresh Mexican — build a bowl or grab tacos. Beans and slow-cooked proteins.",
    category: "mexican-resto",
    tags: ["mexican", "high-fiber", "vegetarian options"],
    menu: [
      mi("s1", "Chicken Burrito Bowl", "Grilled chicken, brown rice, black beans, pico, guac.", 13.5, [620, 42, 64, 22, 14, 880, 6], "grain-bowl", []),
      mi("s2", "Carnitas Tacos (3)", "Pork carnitas, corn tortillas, onion, cilantro, salsa.", 13.0, [560, 34, 48, 26, 8, 940, 5], "taco", []),
      mi("s3", "Baja Fish Tacos (3)", "Grilled white fish, cabbage slaw, lime crema.", 13.75, [480, 30, 46, 18, 7, 760, 6], "taco", []),
      mi("s4", "Veggie Fajita Bowl", "Peppers, onion, black beans, cauliflower rice.", 11.5, [440, 16, 56, 16, 16, 700, 10], "taco", ["vegan"]),
      mi("s5", "Carne Asada Plate", "Grilled steak, esquites, salad, salsa verde.", 17.0, [660, 44, 40, 34, 9, 900, 7], "steak", []),
      mi("s6", "Chicken Tortilla Soup", "Chicken, hominy, tomato, avocado.", 9.5, [360, 26, 34, 14, 8, 820, 6], "soup", []),
    ],
  },
  {
    slug: "root-kitchen",
    name: "Root Kitchen",
    cuisine: "Plant-Forward Cafe",
    neighborhood: "Kendall Sq, Cambridge",
    address: "300 Third St, Cambridge, MA",
    priceLevel: 2,
    rating: 4.8,
    reviews: 876,
    deliveryMins: [17, 27],
    distanceMi: 1.7,
    lat: 42.364,
    lng: -71.084,
    partner: true,
    blurb:
      "Mostly-plants cafe near MIT. Big on fiber, smart about protein.",
    category: "cafe",
    tags: ["vegan-friendly", "high-fiber", "vegetarian"],
    menu: [
      mi("r1", "Buddha Bowl", "Roasted veg, quinoa, chickpeas, kale, tahini.", 13.0, [510, 20, 62, 22, 16, 600, 9], "grain-bowl", ["vegan"]),
      mi("r2", "Tempeh Banh Mi", "Marinated tempeh, pickled veg, sriracha aioli, baguette.", 12.5, [540, 26, 64, 20, 10, 880, 11], "sandwich", ["vegan"]),
      mi("r3", "Avocado Smash + Eggs", "Sourdough, avocado, two eggs, chili crunch.", 12.0, [460, 22, 38, 26, 11, 620, 4], "breakfast", ["vegetarian"]),
      mi("r4", "Sweet Potato Curry Bowl", "Chickpea & sweet potato curry, brown rice, spinach.", 13.5, [520, 17, 78, 16, 14, 680, 12], "curry", ["vegan"]),
      mi("r5", "Acai Power Bowl", "Acai, banana, granola, peanut butter, berries.", 11.5, [480, 14, 72, 16, 12, 120, 34], "smoothie", ["vegetarian"]),
      mi("r6", "Protein Greens Smoothie", "Pea protein, spinach, mango, almond milk.", 9.0, [320, 28, 38, 6, 7, 220, 22], "juice", ["vegan"]),
    ],
  },
  {
    slug: "saffron-and-rice",
    name: "Saffron & Rice",
    cuisine: "Indian & South Asian",
    neighborhood: "Allston",
    address: "214 Harvard Ave, Allston, MA",
    priceLevel: 2,
    rating: 4.5,
    reviews: 1190,
    deliveryMins: [24, 36],
    distanceMi: 2.3,
    lat: 42.353,
    lng: -71.131,
    partner: false,
    blurb:
      "Tandoor-grilled proteins and lentil-forward bowls. Spiced, not greasy.",
    category: "asian-resto",
    tags: ["indian", "high-fiber", "vegetarian options"],
    menu: [
      mi("a1", "Tandoori Chicken Plate", "Tandoori chicken, basmati, cucumber raita, salad.", 15.0, [580, 46, 54, 18, 7, 820, 8], "chicken-plate", []),
      mi("a2", "Chana Masala Bowl", "Chickpea curry, brown rice, spinach.", 12.0, [500, 18, 76, 14, 16, 720, 10], "curry", ["vegan"]),
      mi("a3", "Paneer Tikka Bowl", "Paneer, peppers, basmati, mint chutney.", 13.5, [620, 28, 60, 30, 9, 860, 9], "curry", ["vegetarian"]),
      mi("a4", "Dal & Greens", "Yellow dal, sauteed greens, brown rice.", 11.0, [430, 20, 64, 10, 15, 640, 6], "curry", ["vegan"]),
      mi("a5", "Fish Curry Bowl", "South Indian fish curry, basmati, kachumber.", 15.5, [560, 34, 58, 20, 8, 780, 7], "curry", []),
      mi("a6", "Chicken Tikka Wrap", "Chicken tikka, roti, slaw, raita.", 12.5, [540, 38, 50, 20, 7, 880, 6], "wrap", []),
    ],
  },
  {
    slug: "char-and-greens",
    name: "Char & Greens",
    cuisine: "Grill & Bowls",
    neighborhood: "Seaport",
    address: "85 Seaport Blvd, Boston, MA",
    priceLevel: 2,
    rating: 4.7,
    reviews: 1421,
    deliveryMins: [16, 26],
    distanceMi: 1.9,
    lat: 42.352,
    lng: -71.044,
    partner: true,
    blurb:
      "Open-flame chicken, steak and salmon over greens and grains. Built for high-protein days.",
    category: "grill",
    tags: ["high-protein", "low-carb options", "gluten-free options"],
    menu: [
      mi("c1", "Grilled Chicken & Greens", "Double chicken breast, mixed greens, sweet potato, chimichurri.", 14.5, [540, 52, 38, 18, 9, 640, 7], "chicken-plate", ["gluten-free"]),
      mi("c2", "Turkey Burger (lettuce-wrap)", "Turkey patty, avocado, tomato, side salad.", 13.5, [480, 40, 18, 28, 7, 720, 5], "burger", ["gluten-free"]),
      mi("c3", "Steak & Sweet Potato Frites", "Grilled sirloin, baked sweet potato fries, greens.", 18.0, [660, 46, 52, 28, 9, 760, 8], "steak", []),
      mi("c4", "Blackened Salmon Bowl", "Salmon, quinoa, asparagus, lemon.", 17.0, [580, 40, 42, 26, 8, 600, 5], "salmon-plate", ["gluten-free"]),
      mi("c5", "Buffalo Cauliflower Bowl", "Roasted cauliflower, farro, slaw, ranch yogurt.", 12.5, [460, 16, 58, 18, 12, 820, 8], "grain-bowl", ["vegetarian"]),
      mi("c6", "Chicken Caesar Wrap", "Grilled chicken, romaine, parmesan, light Caesar, wrap.", 12.75, [560, 42, 46, 22, 6, 980, 4], "wrap", []),
    ],
  },
  {
    slug: "pressed",
    name: "Pressed",
    cuisine: "Juice & Smoothie Bar",
    neighborhood: "Beacon Hill",
    address: "121 Charles St, Boston, MA",
    priceLevel: 1,
    rating: 4.4,
    reviews: 689,
    deliveryMins: [12, 20],
    distanceMi: 0.4,
    lat: 42.36,
    lng: -71.07,
    partner: false,
    blurb:
      "Cold-pressed juices, protein smoothies and grab-and-go boxes. Watch the sugar — we flag it.",
    category: "juice-bar",
    tags: ["smoothies", "grab-and-go", "vegan options"],
    menu: [
      mi("j1", "Lean Green Smoothie", "Kale, apple, cucumber, ginger, lemon.", 8.5, [220, 6, 48, 2, 8, 60, 32], "juice", ["vegan"]),
      mi("j2", "Protein Cold Brew", "Cold brew, whey, oat milk, banana.", 8.0, [280, 30, 28, 6, 3, 180, 18], "smoothie", []),
      mi("j3", "Acai Bowl Lite", "Acai, granola, strawberry, coconut.", 10.5, [380, 9, 64, 12, 11, 90, 30], "smoothie", ["vegan"]),
      mi("j4", "Avocado Toast Box", "Multigrain, avocado, hemp seeds, microgreens.", 9.0, [360, 12, 38, 20, 11, 420, 3], "breakfast", ["vegan"]),
      mi("j5", "Greek Yogurt Parfait", "Greek yogurt, berries, granola, honey.", 7.5, [320, 22, 42, 8, 6, 110, 26], "dessert", ["vegetarian"]),
      mi("j6", "Immunity Shot Set", "Ginger-turmeric & wheatgrass shots.", 6.0, [60, 1, 12, 0, 1, 20, 8], "juice", ["vegan"]),
    ],
  },

  // ================= REAL RESTAURANTS =================
  // The entries below are real restaurants. Nutrition provenance is labeled
  // per restaurant via dataSource/sourceNote. Prices, ratings, delivery
  // estimates, and coordinates are approximate placeholders — Palatify is
  // NOT affiliated with any of these businesses. Where a restaurant publishes
  // nutrition, we quote it and estimate only the missing fields (noted).

  {
    slug: "sweetgreen-back-bay",
    name: "Sweetgreen",
    cuisine: "Salads & Grain Bowls",
    neighborhood: "Back Bay",
    address: "659 Boylston St, Boston, MA",
    priceLevel: 2,
    rating: 4.4,
    reviews: 1730,
    deliveryMins: [15, 30],
    distanceMi: 0.5,
    lat: 42.3499,
    lng: -71.0785,
    partner: false,
    dataSource: "published",
    sourceNote:
      "Calories, protein, carbs, and fat as published at sweetgreen.com/menu (retrieved July 15, 2026, Summer menu). Fiber, sodium, and sugar are Palatify engine estimates. Not affiliated with Sweetgreen, Inc.",
    blurb:
      "The national fast-casual salad chain publishes per-dish macros and allergens — the transparency standard Palatify wants every independent restaurant to reach.",
    category: "salad-bar",
    tags: ["healthy", "published nutrition", "vegan options"],
    menu: [
      mi("sg1", "Harvest Bowl", "Roasted chicken, sweet potatoes, apples, goat cheese, almonds, wild rice, shredded kale, balsamic vinaigrette. Contains milk, tree nuts.", 13.95, [740, 32, 60, 41, 9, 810, 14], "grain-bowl", []),
      mi("sg2", "Chicken Pesto Parm", "Roasted chicken, spicy broccoli, tomatoes, parmesan, garlic breadcrumbs, golden quinoa, spinach, pesto vinaigrette. Contains wheat, milk.", 13.45, [525, 35, 38, 23, 6, 900, 5], "grain-bowl", []),
      mi("sg3", "Crispy Rice Bowl", "Blackened chicken, carrots, cabbage, cucumbers, roasted almonds, crispy rice, wild rice, arugula, spicy cashew. Contains tree nuts, sesame.", 13.75, [640, 28, 61, 30, 7, 850, 10], "grain-bowl", []),
      mi("sg4", "Shroomami", "Roasted tofu, warm portobello mix, cucumbers, basil, cabbage, almonds, wild rice, kale, miso sesame ginger. Contains soy, sesame, tree nuts.", 12.95, [635, 18, 50, 42, 8, 980, 9], "grain-bowl", ["vegan"]),
      mi("sg5", "Kale Caesar", "Roasted chicken, tomatoes, shaved parmesan, parmesan crisps, kale, romaine, lime, caesar. Contains milk, egg, fish.", 12.45, [490, 35, 14, 32, 4, 760, 3], "salad", []),
      mi("sg6", "Guacamole Greens", "Roasted chicken, avocado, tomatoes, pickled onions, tortilla chips, spring mix, lime cilantro jalapeño. Contains soy.", 12.95, [555, 23, 35, 33, 9, 690, 6], "salad", ["gluten-free"]),
      mi("sg7", "Super Green Goddess", "Chickpeas, sweet potatoes, carrots, spicy broccoli, almonds, spinach, kale, green goddess ranch. Contains milk, egg, tree nuts.", 11.95, [465, 12, 36, 31, 10, 620, 8], "salad", ["vegetarian"]),
      mi("sg8", "Hummus Crunch", "Hummus, feta, chickpeas, tomatoes, cucumbers, napa slaw, garlic breadcrumbs, pesto vinaigrette. Contains milk, wheat, sesame.", 11.75, [390, 12, 39, 18, 8, 780, 6], "salad", ["vegetarian"]),
      mi("sg9", "Miso Glazed Salmon Plate", "Miso glazed salmon, avocado, cucumbers, crispy onions, white rice, nori sesame, spicy cashew. Contains wheat, soy, fish, sesame, tree nuts.", 16.95, [930, 35, 88, 48, 6, 1150, 16], "salmon-plate", []),
      mi("sg10", "Hot Honey Chicken Plate", "Blackened chicken, roasted sweet potatoes, napa slaw, crispy onions, golden quinoa, hot honey mustard. Contains wheat.", 15.95, [875, 49, 68, 41, 7, 1050, 18], "chicken-plate", []),
    ],
  },

  {
    slug: "halal-guys-allston",
    name: "The Halal Guys",
    cuisine: "Halal Middle Eastern",
    neighborhood: "Allston",
    address: "1 Brighton Ave, Allston, MA",
    priceLevel: 1,
    rating: 4.3,
    reviews: 2210,
    deliveryMins: [20, 35],
    distanceMi: 2.8,
    lat: 42.3528,
    lng: -71.1323,
    partner: false,
    dataSource: "published",
    sourceNote:
      "Nutrition from thehalalguys.com/nutritional-guide (retrieved July 15, 2026; page dated April 2026). Platter values combine the published protein + rice servings; fields the guide leaves blank are Palatify estimates. Halal certification per their published program. Not affiliated with The Halal Guys.",
    blurb:
      "The halal street-cart institution publishes a full nutrition and allergen guide — platters, gyros, falafel and all. A model case for halal-conscious diners.",
    category: "mediterranean-resto",
    tags: ["halal", "published nutrition"],
    menu: [
      mi("hg1", "Chicken & Rice Platter", "Halal chicken over yellow rice (regular). Add white/hot sauce to taste. Contains soy.", 11.99, [466, 38, 52, 8, 3, 1083, 2], "chicken-plate", ["halal", "gluten-free"]),
      mi("hg2", "Beef Gyro & Rice Platter", "Sliced beef gyro over yellow rice (regular). Contains gluten, soy.", 12.99, [858, 27, 64, 54, 3, 1300, 3], "mediterranean", ["halal"]),
      mi("hg3", "Falafel Platter", "Crispy falafel over rice with lettuce, tomato, pita (regular; as published). Contains soy, mustard, sesame.", 10.99, [673, 20, 62, 38, 21, 1411, 3], "mediterranean", ["halal", "vegan"]),
      mi("hg4", "Chicken Gyro Sandwich", "Halal chicken in pita with lettuce and tomato. Contains gluten.", 8.99, [377, 30, 43, 7, 3, 899, 4], "wrap", ["halal"]),
      mi("hg5", "BBQ Chicken Platter", "BBQ-glazed halal chicken over yellow rice (regular). Contains soy.", 11.99, [425, 32, 52, 7, 2, 1026, 2], "chicken-plate", ["halal", "gluten-free"]),
      mi("hg6", "French Fries", "Crinkle-cut fries (10 oz, as published). Contains soy, sesame.", 4.99, [839, 9, 121, 35, 12, 1170, 0], "mediterranean", ["vegetarian"]),
      mi("hg7", "Baklava", "Layered phyllo with nuts and honey (as published). Contains nuts, gluten, dairy.", 3.99, [410, 6, 56, 18, 7, 159, 31], "dessert", ["vegetarian"]),
    ],
  },

  {
    slug: "clover-downtown",
    name: "Clover Food Lab",
    cuisine: "Vegetarian Fast Food",
    neighborhood: "Downtown",
    address: "27 School St, Boston, MA",
    priceLevel: 1,
    rating: 4.5,
    reviews: 980,
    deliveryMins: [15, 30],
    distanceMi: 1.1,
    lat: 42.3577,
    lng: -71.0603,
    partner: false,
    dataSource: "estimated",
    sourceNote:
      "Boston's homegrown vegetarian fast-food chain publishes ingredients but not full per-dish macros — all values are Palatify engine estimates from the public menu (July 2026). Not affiliated with Clover Food Lab.",
    blurb:
      "A Boston vegetarian institution built around seasonal sandwiches — exactly the beloved independent that publishes no nutrition numbers. Palatify estimates them, honestly labeled.",
    category: "cafe",
    tags: ["vegetarian", "vegan options", "local"],
    menu: [
      mi("cl1", "Chickpea Fritter Sandwich", "Crispy chickpea fritters, hummus, cucumber-tomato salad, pickled vegetables in pita.", 9.95, [560, 18, 74, 22, 12, 890, 8], "sandwich", ["vegan"]),
      mi("cl2", "Impossible Meatball Sandwich", "Impossible meatballs, marinara, cashew ricotta on a roll.", 11.95, [640, 28, 68, 28, 9, 1150, 10], "sandwich", ["vegan"]),
      mi("cl3", "Japanese Sweet Potato Sandwich", "Roasted sweet potato, whipped ricotta, apple, arugula in pita.", 10.45, [520, 14, 70, 20, 10, 720, 12], "sandwich", ["vegetarian"]),
      mi("cl4", "Mezze Platter", "Hummus, seasonal vegetables, tabbouleh, pickles, pita.", 12.45, [620, 16, 72, 28, 14, 940, 9], "mediterranean", ["vegan"]),
      mi("cl5", "Cream of Tomato Soup", "Slow-cooked tomato soup with herbs.", 5.95, [220, 6, 26, 10, 4, 780, 12], "soup", ["vegetarian"]),
    ],
  },

  {
    slug: "life-alive-back-bay",
    name: "Life Alive Organic Cafe",
    cuisine: "Plant-Based Cafe",
    neighborhood: "Back Bay",
    address: "431 Boylston St, Boston, MA",
    priceLevel: 2,
    rating: 4.6,
    reviews: 1120,
    deliveryMins: [20, 35],
    distanceMi: 0.7,
    lat: 42.3513,
    lng: -71.0745,
    partner: false,
    dataSource: "estimated",
    sourceNote:
      "This organic vegetarian cafe does not publish per-dish macros — all values are Palatify engine estimates from the public menu (July 2026). Not affiliated with Life Alive.",
    blurb:
      "Warm grain bowls, broths, and smoothies from a much-loved plant-based cafe — a vegan/vegetarian showcase for confidence-labeled estimation.",
    category: "cafe",
    tags: ["vegan options", "vegetarian", "organic"],
    menu: [
      mi("la1", "The Goddess Bowl", "Ginger-nama shoyu sauce, carrots, beets, broccoli, kale, quinoa, brown rice.", 13.95, [620, 21, 88, 21, 15, 640, 10], "grain-bowl", ["vegan", "gluten-free"]),
      mi("la2", "The Adventurer Bowl", "Sweet chili sauce, tofu, greens, carrots, corn, quinoa and rice.", 14.45, [690, 24, 96, 24, 16, 720, 12], "grain-bowl", ["vegan"]),
      mi("la3", "The Swami Wrap", "Hummus, avocado, greens, carrots, beets in a whole-wheat wrap.", 11.95, [540, 18, 70, 20, 12, 680, 8], "wrap", ["vegan"]),
      mi("la4", "The Emperor Bowl", "Miso-ginger broth, greens, tofu, shiitake, brown rice, sesame.", 13.45, [560, 22, 78, 18, 12, 890, 7], "grain-bowl", ["vegan"]),
      mi("la5", "Green Radiance Smoothie", "Kale, banana, mango, ginger, coconut water.", 8.95, [280, 6, 58, 4, 7, 95, 38], "smoothie", ["vegan", "gluten-free"]),
    ],
  },

  {
    slug: "annas-taqueria-brookline",
    name: "Anna's Taqueria",
    cuisine: "Mexican Taqueria",
    neighborhood: "Brookline",
    address: "1412 Beacon St, Brookline, MA",
    priceLevel: 1,
    rating: 4.4,
    reviews: 1890,
    deliveryMins: [20, 35],
    distanceMi: 3.1,
    lat: 42.3399,
    lng: -71.1298,
    partner: false,
    dataSource: "estimated",
    sourceNote:
      "A Boston-area burrito institution with no published nutrition — all values are Palatify engine estimates from the public menu (July 2026). Not affiliated with Anna's Taqueria.",
    blurb:
      "Beloved super burritos since 1995 and not a nutrition number in sight — the everyday independent Palatify exists to make legible.",
    category: "mexican-resto",
    tags: ["local", "vegetarian options"],
    menu: [
      mi("an1", "Grilled Chicken Super Burrito", "Grilled chicken, rice, beans, cheese, salsa, guacamole in a flour tortilla.", 9.25, [820, 42, 96, 28, 10, 1580, 5], "wrap", []),
      mi("an2", "Carnitas Super Burrito", "Slow-cooked pork, rice, beans, cheese, salsa in a flour tortilla.", 9.75, [890, 38, 95, 36, 9, 1650, 5], "wrap", []),
      mi("an3", "Veggie Super Burrito", "Rice, whole beans, cheese, guacamole, salsa, lettuce in a flour tortilla.", 8.25, [720, 20, 108, 22, 14, 1290, 6], "wrap", ["vegetarian"]),
      mi("an4", "Chicken Quesadilla", "Griddled flour tortilla, chicken, melted cheese, salsa.", 8.95, [780, 38, 62, 40, 5, 1420, 4], "taco", []),
      mi("an5", "Chicken Tacos (2)", "Soft corn tortillas, grilled chicken, onion, cilantro, salsa.", 6.5, [480, 30, 44, 20, 6, 840, 3], "taco", ["gluten-free"]),
    ],
  },
];

// ---- Lookups ------------------------------------------------------
export const getRestaurant = (slug: string): Restaurant | undefined =>
  RESTAURANTS.find((r) => r.slug === slug);

export interface MenuItemWithContext extends MenuItem {
  restaurantSlug: string;
  restaurantName: string;
  restaurantNeighborhood: string;
  distanceMi: number;
  partner: boolean;
}

export const allMenuItems = (): MenuItemWithContext[] =>
  RESTAURANTS.flatMap((r) =>
    r.menu.map((m) => ({
      ...m,
      restaurantSlug: r.slug,
      restaurantName: r.name,
      restaurantNeighborhood: r.neighborhood,
      distanceMi: r.distanceMi,
      partner: r.partner,
    })),
  );

export const CUISINES = Array.from(new Set(RESTAURANTS.map((r) => r.cuisine)));
