import type { MenuItem, Restaurant } from "@/lib/types";

// Boston-area seed catalog. Nutrition values are realistic, dish-level estimates
// (the kind Forkcast would compute from a menu via its nutrition engine).
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
      "Chef-built grain bowls and salads with every macro published. A Forkcast launch partner.",
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
