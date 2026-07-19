# Forkcast — AI Photo Generation Brief

Generate the images below (e.g., ChatGPT / GPT-image / Codex). **92 images total: 13 restaurant heroes + 79 dishes.** If you want the fastest visible win, do Tier 1 first (46 images).

## For AI agents (Codex etc.) — read this first

- **Local repo:** `/Users/seymurhasanov/Desktop/DS:AI - Projects/Healthy_restaurant`
  (git remote: `https://github.com/Seymurhh/forkcast.git`)
- **Machine-readable job list:** [`docs/photo-manifest.json`](./photo-manifest.json) — one entry per image with the exact output `file` path (relative to repo root), `width`/`height`, `tier`, and the **complete, final prompt** (no assembly needed).
- **Workflow per image:** take `prompt` from the manifest → generate → save as JPEG at `width`×`height` (quality ~80, target < 250 KB) → write to the manifest's `file` path inside the repo.
- **Resumability — if you hit a usage/session limit:** completion state IS the filesystem. On any fresh session, run

  ```bash
  node scripts/photos-remaining.mjs          # human list: N done / N remaining
  node scripts/photos-remaining.mjs --json   # remaining entries with prompts
  node scripts/photos-remaining.mjs --next   # single next item to generate
  ```

  and continue from the first remaining item (tier 1 sorts first). Never regenerate a file that already exists.
- **Do not** modify any code, rename files, or invent filenames not in the manifest. When a batch is done: `git add public/img/food && git commit -m "photos: batch N"`.

**Tiers.** Tier 1 (36 images — everything a demo visitor actually sees): all 13 heroes + the dishes marked ★ (first 2 per demo restaurant, all Sweetgreen & Halal Guys dishes since those listings are the flagship real-data ones). Tier 2: the rest.

## How to use

1. For each row, take the **master style prompt** and replace `{SUBJECT}` with the row's subject text. Dishes use the dish master; heroes use the hero master.
2. Export/downscale to **JPEG, 800×600 for dishes, 1200×800 for heroes, under ~250 KB each** (the site stays fast).
3. Name the file **exactly** as shown and drop it into the folder shown. Nothing else — the app finds them automatically (local photo first, stock fallback if a file is missing). Redeploy to publish.

**Consistency tip:** generate all images in one chat session and tell the model to keep the same surface, lighting, and camera angle across every image — the menu then looks like one photographer shot it.

**Honesty rule:** these are illustrative images. Keep the "demonstration data" labeling in listings; never present a generated image as the restaurant's actual dish photo. No brand logos or trade dress in any image.

## Master style prompt — DISHES

```
Professional food photography of {SUBJECT}. Shot from a 40-degree angle on a matte light-warm-gray surface (#f3f2f2), soft diffused natural window light from the left, shallow depth of field, appetizing and realistic, restaurant-quality plating, colors true to the ingredients. No people, no hands, no text, no logos, no branded packaging, no watermarks. Photorealistic — indistinguishable from a real photograph; avoid AI over-perfection (slight natural imperfections in plating are good). Landscape 4:3.
```

## Master style prompt — RESTAURANT HEROES

```
Professional restaurant photography: {SUBJECT}. Warm inviting light, shallow depth of field, editorial style like a city dining guide. No people's faces (backs/hands blurred in background acceptable), no readable signage, text, or logos anywhere. Photorealistic. Landscape 3:2.
```

## Restaurant heroes (13) — save to `public/img/food/restaurants/`

| Filename | {SUBJECT} |
|---|---|
| `verdant.jpg` | a bright fast-casual salad and grain-bowl counter with fresh greens and colorful toppings on display |
| `lavash.jpg` | a Mediterranean restaurant table spread with mezze — hummus, falafel, warm flatbread, grilled kebabs |
| `blue-bowl-poke.jpg` | a modern poke shop counter with fresh fish bowls, edamame, and colorful toppings |
| `sol-and-lima.jpg` | a modern Mexican restaurant table with tacos, bowls, fresh salsa and lime |
| `root-kitchen.jpg` | a plant-forward cafe interior with wooden tables and colorful vegetable bowls being served |
| `saffron-and-rice.jpg` | an Indian restaurant table with curry bowls, basmati rice, naan and vibrant spices |
| `char-and-greens.jpg` | an open-flame grill kitchen with chicken and vegetables over fire, plated greens in the foreground |
| `pressed.jpg` | a bright juice and smoothie bar with fresh green juices, smoothie bowls, and fruit |
| `sweetgreen-back-bay.jpg` | a premium fast-casual salad restaurant line with abundant fresh greens, grain bowls, and seasonal produce |
| `halal-guys-allston.jpg` | a Middle Eastern halal street-food platter station: yellow rice, grilled chicken, gyro meat, white and red sauces |
| `clover-downtown.jpg` | a vegetarian fast-food cafe with pita sandwiches, seasonal vegetables and soups on a wooden counter |
| `life-alive-back-bay.jpg` | an organic plant-based cafe with vibrant vegetable bowls, smoothies, and warm grain dishes |
| `annas-taqueria-brookline.jpg` | a classic taqueria counter with burritos being rolled on flour tortillas, tacos, and fresh salsa |

## Dishes (79) — save to `public/img/food/dishes/`

### Verdant (Salads & Grain Bowls)

| Filename | {SUBJECT} |
|---|---|
| `verdant__v1.jpg` ★ | Harvest Power Bowl — Kale, quinoa, roasted chicken, sweet potato, almonds, lemon-tahini. Single serving, plated the way a salads & grain bowls restaurant would serve it |
| `verdant__v2.jpg` ★ | Green Goddess Salad — Romaine, avocado, cucumber, edamame, pumpkin seeds, herb dressing. Single serving, plated the way a salads & grain bowls restaurant would serve it |
| `verdant__v3.jpg` | Steak & Farro Bowl — Grilled steak, farro, roasted broccoli, feta, balsamic. Single serving, plated the way a salads & grain bowls restaurant would serve it |
| `verdant__v4.jpg` | Mediterranean Crunch — Chickpeas, quinoa, cucumber, tomato, olives, feta, red-pepper hummus. Single serving, plated the way a salads & grain bowls restaurant would serve it |
| `verdant__v5.jpg` | Buffalo Chicken Salad — Grilled buffalo chicken, romaine, carrot, blue-cheese yogurt. Single serving, plated the way a salads & grain bowls restaurant would serve it |
| `verdant__v6.jpg` | Citrus Salmon Bowl — Brown rice, seared salmon, snap peas, mango, sesame. Single serving, plated the way a salads & grain bowls restaurant would serve it |

### Lavash (Armenian & Mediterranean)

| Filename | {SUBJECT} |
|---|---|
| `lavash__l1.jpg` ★ | Chicken Shawarma Plate — Marinated chicken, brown rice, salad, garlic sauce. Single serving, plated the way a armenian & mediterranean restaurant would serve it |
| `lavash__l2.jpg` ★ | Falafel Mezze — Falafel, hummus, tabbouleh, warm lavash. Single serving, plated the way a armenian & mediterranean restaurant would serve it |
| `lavash__l3.jpg` | Lamb Lulah Kebab — Lean lamb kebab, bulgur pilaf, grilled vegetables. Single serving, plated the way a armenian & mediterranean restaurant would serve it |
| `lavash__l4.jpg` | Red Lentil Soup & Fattoush — Red lentil soup with a crisp fattoush salad. Single serving, plated the way a armenian & mediterranean restaurant would serve it |
| `lavash__l5.jpg` | Grilled Salmon Plate — Salmon, freekeh, roasted vegetables, yogurt-dill. Single serving, plated the way a armenian & mediterranean restaurant would serve it |
| `lavash__l6.jpg` | Halloumi Lavash Wrap — Grilled halloumi, greens, muhammara, fresh lavash. Single serving, plated the way a armenian & mediterranean restaurant would serve it |

### Blue Bowl Poke (Hawaiian Poke)

| Filename | {SUBJECT} |
|---|---|
| `blue-bowl-poke__p1.jpg` ★ | Classic Ahi Poke — Ahi tuna, brown rice, edamame, seaweed, ponzu. Single serving, plated the way a hawaiian poke restaurant would serve it |
| `blue-bowl-poke__p2.jpg` ★ | Spicy Salmon Bowl — Salmon, white rice, cucumber, avocado, spicy mayo. Single serving, plated the way a hawaiian poke restaurant would serve it |
| `blue-bowl-poke__p3.jpg` | Tofu Greens Bowl — Tofu, mixed greens, edamame, mango, sesame-ginger. Single serving, plated the way a hawaiian poke restaurant would serve it |
| `blue-bowl-poke__p4.jpg` | Shrimp Crunch Bowl — Shrimp, rice, wakame, crispy onion, yuzu. Single serving, plated the way a hawaiian poke restaurant would serve it |
| `blue-bowl-poke__p5.jpg` | Double Protein Power — Ahi + salmon, cauliflower rice, edamame. Single serving, plated the way a hawaiian poke restaurant would serve it |

### Sol & Lima (Modern Mexican)

| Filename | {SUBJECT} |
|---|---|
| `sol-and-lima__s1.jpg` ★ | Chicken Burrito Bowl — Grilled chicken, brown rice, black beans, pico, guac. Single serving, plated the way a modern mexican restaurant would serve it |
| `sol-and-lima__s2.jpg` ★ | Carnitas Tacos (3) — Pork carnitas, corn tortillas, onion, cilantro, salsa. Single serving, plated the way a modern mexican restaurant would serve it |
| `sol-and-lima__s3.jpg` | Baja Fish Tacos (3) — Grilled white fish, cabbage slaw, lime crema. Single serving, plated the way a modern mexican restaurant would serve it |
| `sol-and-lima__s4.jpg` | Veggie Fajita Bowl — Peppers, onion, black beans, cauliflower rice. Single serving, plated the way a modern mexican restaurant would serve it |
| `sol-and-lima__s5.jpg` | Carne Asada Plate — Grilled steak, esquites, salad, salsa verde. Single serving, plated the way a modern mexican restaurant would serve it |
| `sol-and-lima__s6.jpg` | Chicken Tortilla Soup — Chicken, hominy, tomato, avocado. Single serving, plated the way a modern mexican restaurant would serve it |

### Root Kitchen (Plant-Forward Cafe)

| Filename | {SUBJECT} |
|---|---|
| `root-kitchen__r1.jpg` ★ | Buddha Bowl — Roasted veg, quinoa, chickpeas, kale, tahini. Single serving, plated the way a plant-forward cafe restaurant would serve it |
| `root-kitchen__r2.jpg` ★ | Tempeh Banh Mi — Marinated tempeh, pickled veg, sriracha aioli, baguette. Single serving, plated the way a plant-forward cafe restaurant would serve it |
| `root-kitchen__r3.jpg` | Avocado Smash + Eggs — Sourdough, avocado, two eggs, chili crunch. Single serving, plated the way a plant-forward cafe restaurant would serve it |
| `root-kitchen__r4.jpg` | Sweet Potato Curry Bowl — Chickpea & sweet potato curry, brown rice, spinach. Single serving, plated the way a plant-forward cafe restaurant would serve it |
| `root-kitchen__r5.jpg` | Acai Power Bowl — Acai, banana, granola, peanut butter, berries. Single serving, plated the way a plant-forward cafe restaurant would serve it |
| `root-kitchen__r6.jpg` | Protein Greens Smoothie — Pea protein, spinach, mango, almond milk. Single serving, plated the way a plant-forward cafe restaurant would serve it |

### Saffron & Rice (Indian & South Asian)

| Filename | {SUBJECT} |
|---|---|
| `saffron-and-rice__a1.jpg` ★ | Tandoori Chicken Plate — Tandoori chicken, basmati, cucumber raita, salad. Single serving, plated the way a indian & south asian restaurant would serve it |
| `saffron-and-rice__a2.jpg` ★ | Chana Masala Bowl — Chickpea curry, brown rice, spinach. Single serving, plated the way a indian & south asian restaurant would serve it |
| `saffron-and-rice__a3.jpg` | Paneer Tikka Bowl — Paneer, peppers, basmati, mint chutney. Single serving, plated the way a indian & south asian restaurant would serve it |
| `saffron-and-rice__a4.jpg` | Dal & Greens — Yellow dal, sauteed greens, brown rice. Single serving, plated the way a indian & south asian restaurant would serve it |
| `saffron-and-rice__a5.jpg` | Fish Curry Bowl — South Indian fish curry, basmati, kachumber. Single serving, plated the way a indian & south asian restaurant would serve it |
| `saffron-and-rice__a6.jpg` | Chicken Tikka Wrap — Chicken tikka, roti, slaw, raita. Single serving, plated the way a indian & south asian restaurant would serve it |

### Char & Greens (Grill & Bowls)

| Filename | {SUBJECT} |
|---|---|
| `char-and-greens__c1.jpg` ★ | Grilled Chicken & Greens — Double chicken breast, mixed greens, sweet potato, chimichurri. Single serving, plated the way a grill & bowls restaurant would serve it |
| `char-and-greens__c2.jpg` ★ | Turkey Burger (lettuce-wrap) — Turkey patty, avocado, tomato, side salad. Single serving, plated the way a grill & bowls restaurant would serve it |
| `char-and-greens__c3.jpg` | Steak & Sweet Potato Frites — Grilled sirloin, baked sweet potato fries, greens. Single serving, plated the way a grill & bowls restaurant would serve it |
| `char-and-greens__c4.jpg` | Blackened Salmon Bowl — Salmon, quinoa, asparagus, lemon. Single serving, plated the way a grill & bowls restaurant would serve it |
| `char-and-greens__c5.jpg` | Buffalo Cauliflower Bowl — Roasted cauliflower, farro, slaw, ranch yogurt. Single serving, plated the way a grill & bowls restaurant would serve it |
| `char-and-greens__c6.jpg` | Chicken Caesar Wrap — Grilled chicken, romaine, parmesan, light Caesar, wrap. Single serving, plated the way a grill & bowls restaurant would serve it |

### Pressed (Juice & Smoothie Bar)

| Filename | {SUBJECT} |
|---|---|
| `pressed__j1.jpg` ★ | Lean Green Smoothie — Kale, apple, cucumber, ginger, lemon. Single serving, plated the way a juice & smoothie bar restaurant would serve it |
| `pressed__j2.jpg` ★ | Protein Cold Brew — Cold brew, whey, oat milk, banana. Single serving, plated the way a juice & smoothie bar restaurant would serve it |
| `pressed__j3.jpg` | Acai Bowl Lite — Acai, granola, strawberry, coconut. Single serving, plated the way a juice & smoothie bar restaurant would serve it |
| `pressed__j4.jpg` | Avocado Toast Box — Multigrain, avocado, hemp seeds, microgreens. Single serving, plated the way a juice & smoothie bar restaurant would serve it |
| `pressed__j5.jpg` | Greek Yogurt Parfait — Greek yogurt, berries, granola, honey. Single serving, plated the way a juice & smoothie bar restaurant would serve it |
| `pressed__j6.jpg` | Immunity Shot Set — Ginger-turmeric & wheatgrass shots. Single serving, plated the way a juice & smoothie bar restaurant would serve it |

### Sweetgreen (Salads & Grain Bowls)

| Filename | {SUBJECT} |
|---|---|
| `sweetgreen-back-bay__sg1.jpg` ★ | Harvest Bowl — Roasted chicken, sweet potatoes, apples, goat cheese, almonds, wild rice, shredded kale, balsamic vinaigrette. Contains milk, tree nuts. Single serving, plated the way a salads & grain bowls restaurant would serve it |
| `sweetgreen-back-bay__sg2.jpg` ★ | Chicken Pesto Parm — Roasted chicken, spicy broccoli, tomatoes, parmesan, garlic breadcrumbs, golden quinoa, spinach, pesto vinaigrette. Contains wheat, milk. Single serving, plated the way a salads & grain bowls restaurant would serve it |
| `sweetgreen-back-bay__sg3.jpg` ★ | Crispy Rice Bowl — Blackened chicken, carrots, cabbage, cucumbers, roasted almonds, crispy rice, wild rice, arugula, spicy cashew. Contains tree nuts, sesame. Single serving, plated the way a salads & grain bowls restaurant would serve it |
| `sweetgreen-back-bay__sg4.jpg` ★ | Shroomami — Roasted tofu, warm portobello mix, cucumbers, basil, cabbage, almonds, wild rice, kale, miso sesame ginger. Contains soy, sesame, tree nuts. Single serving, plated the way a salads & grain bowls restaurant would serve it |
| `sweetgreen-back-bay__sg5.jpg` ★ | Kale Caesar — Roasted chicken, tomatoes, shaved parmesan, parmesan crisps, kale, romaine, lime, caesar. Contains milk, egg, fish. Single serving, plated the way a salads & grain bowls restaurant would serve it |
| `sweetgreen-back-bay__sg6.jpg` ★ | Guacamole Greens — Roasted chicken, avocado, tomatoes, pickled onions, tortilla chips, spring mix, lime cilantro jalapeño. Contains soy. Single serving, plated the way a salads & grain bowls restaurant would serve it |
| `sweetgreen-back-bay__sg7.jpg` ★ | Super Green Goddess — Chickpeas, sweet potatoes, carrots, spicy broccoli, almonds, spinach, kale, green goddess ranch. Contains milk, egg, tree nuts. Single serving, plated the way a salads & grain bowls restaurant would serve it |
| `sweetgreen-back-bay__sg8.jpg` ★ | Hummus Crunch — Hummus, feta, chickpeas, tomatoes, cucumbers, napa slaw, garlic breadcrumbs, pesto vinaigrette. Contains milk, wheat, sesame. Single serving, plated the way a salads & grain bowls restaurant would serve it |
| `sweetgreen-back-bay__sg9.jpg` ★ | Miso Glazed Salmon Plate — Miso glazed salmon, avocado, cucumbers, crispy onions, white rice, nori sesame, spicy cashew. Contains wheat, soy, fish, sesame, tree nuts. Single serving, plated the way a salads & grain bowls restaurant would serve it |
| `sweetgreen-back-bay__sg10.jpg` ★ | Hot Honey Chicken Plate — Blackened chicken, roasted sweet potatoes, napa slaw, crispy onions, golden quinoa, hot honey mustard. Contains wheat. Single serving, plated the way a salads & grain bowls restaurant would serve it |

### The Halal Guys (Halal Middle Eastern)

| Filename | {SUBJECT} |
|---|---|
| `halal-guys-allston__hg1.jpg` ★ | Chicken & Rice Platter — Halal chicken over yellow rice (regular). Add white/hot sauce to taste. Contains soy. Single serving, plated the way a halal middle eastern restaurant would serve it |
| `halal-guys-allston__hg2.jpg` ★ | Beef Gyro & Rice Platter — Sliced beef gyro over yellow rice (regular). Contains gluten, soy. Single serving, plated the way a halal middle eastern restaurant would serve it |
| `halal-guys-allston__hg3.jpg` ★ | Falafel Platter — Crispy falafel over rice with lettuce, tomato, pita (regular; as published). Contains soy, mustard, sesame. Single serving, plated the way a halal middle eastern restaurant would serve it |
| `halal-guys-allston__hg4.jpg` ★ | Chicken Gyro Sandwich — Halal chicken in pita with lettuce and tomato. Contains gluten. Single serving, plated the way a halal middle eastern restaurant would serve it |
| `halal-guys-allston__hg5.jpg` ★ | BBQ Chicken Platter — BBQ-glazed halal chicken over yellow rice (regular). Contains soy. Single serving, plated the way a halal middle eastern restaurant would serve it |
| `halal-guys-allston__hg6.jpg` ★ | French Fries — Crinkle-cut fries (10 oz, as published). Contains soy, sesame. Single serving, plated the way a halal middle eastern restaurant would serve it |
| `halal-guys-allston__hg7.jpg` ★ | Baklava — Layered phyllo with nuts and honey (as published). Contains nuts, gluten, dairy. Single serving, plated the way a halal middle eastern restaurant would serve it |

### Clover Food Lab (Vegetarian Fast Food)

| Filename | {SUBJECT} |
|---|---|
| `clover-downtown__cl1.jpg` | Chickpea Fritter Sandwich — Crispy chickpea fritters, hummus, cucumber-tomato salad, pickled vegetables in pita. Single serving, plated the way a vegetarian fast food restaurant would serve it |
| `clover-downtown__cl2.jpg` | Impossible Meatball Sandwich — Impossible meatballs, marinara, cashew ricotta on a roll. Single serving, plated the way a vegetarian fast food restaurant would serve it |
| `clover-downtown__cl3.jpg` | Japanese Sweet Potato Sandwich — Roasted sweet potato, whipped ricotta, apple, arugula in pita. Single serving, plated the way a vegetarian fast food restaurant would serve it |
| `clover-downtown__cl4.jpg` | Mezze Platter — Hummus, seasonal vegetables, tabbouleh, pickles, pita. Single serving, plated the way a vegetarian fast food restaurant would serve it |
| `clover-downtown__cl5.jpg` | Cream of Tomato Soup — Slow-cooked tomato soup with herbs. Single serving, plated the way a vegetarian fast food restaurant would serve it |

### Life Alive Organic Cafe (Plant-Based Cafe)

| Filename | {SUBJECT} |
|---|---|
| `life-alive-back-bay__la1.jpg` | The Goddess Bowl — Ginger-nama shoyu sauce, carrots, beets, broccoli, kale, quinoa, brown rice. Single serving, plated the way a plant-based cafe restaurant would serve it |
| `life-alive-back-bay__la2.jpg` | The Adventurer Bowl — Sweet chili sauce, tofu, greens, carrots, corn, quinoa and rice. Single serving, plated the way a plant-based cafe restaurant would serve it |
| `life-alive-back-bay__la3.jpg` | The Swami Wrap — Hummus, avocado, greens, carrots, beets in a whole-wheat wrap. Single serving, plated the way a plant-based cafe restaurant would serve it |
| `life-alive-back-bay__la4.jpg` | The Emperor Bowl — Miso-ginger broth, greens, tofu, shiitake, brown rice, sesame. Single serving, plated the way a plant-based cafe restaurant would serve it |
| `life-alive-back-bay__la5.jpg` | Green Radiance Smoothie — Kale, banana, mango, ginger, coconut water. Single serving, plated the way a plant-based cafe restaurant would serve it |

### Anna's Taqueria (Mexican Taqueria)

| Filename | {SUBJECT} |
|---|---|
| `annas-taqueria-brookline__an1.jpg` | Grilled Chicken Super Burrito — Grilled chicken, rice, beans, cheese, salsa, guacamole in a flour tortilla. Single serving, plated the way a mexican taqueria restaurant would serve it |
| `annas-taqueria-brookline__an2.jpg` | Carnitas Super Burrito — Slow-cooked pork, rice, beans, cheese, salsa in a flour tortilla. Single serving, plated the way a mexican taqueria restaurant would serve it |
| `annas-taqueria-brookline__an3.jpg` | Veggie Super Burrito — Rice, whole beans, cheese, guacamole, salsa, lettuce in a flour tortilla. Single serving, plated the way a mexican taqueria restaurant would serve it |
| `annas-taqueria-brookline__an4.jpg` | Chicken Quesadilla — Griddled flour tortilla, chicken, melted cheese, salsa. Single serving, plated the way a mexican taqueria restaurant would serve it |
| `annas-taqueria-brookline__an5.jpg` | Chicken Tacos (2) — Soft corn tortillas, grilled chicken, onion, cilantro, salsa. Single serving, plated the way a mexican taqueria restaurant would serve it |

---
*After adding files: `git add public/img/food && git commit` and deploy as usual. Any file you don't provide silently falls back to stock — no breakage.*