/* Seed an admin user for local development. */
/* eslint-disable @typescript-eslint/no-require-imports */
require("dotenv").config({ path: ".env.local" });
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is not set in environment variables");
  process.exit(1);
}
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

function getIsoWeekPeriod(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

async function main() {
  const email = "admin@example.com";
  const password = "admin123";
  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: "Admin",
      hashedPassword,
      role: "ADMIN",
      profilePicture: null,
    },
  });

  const userEmail = "user@example.com";
  const userPassword = "user12345";
  const userHashed = await bcrypt.hash(userPassword, 10);

  await prisma.user.upsert({
    where: { email: userEmail },
    update: {},
    create: {
      email: userEmail,
      name: "User",
      hashedPassword: userHashed,
      role: "USER",
      profilePicture: null,
    },
  });

  const admin = await prisma.user.findUnique({
    where: { email },
  });

  // Seed sample recipes
  const recipes = [
    {
      name: "Healthy Vegetable Soup",
      category: "Soup",
      description:
        "A healthy and nourishing vegetable soup served warm in a clear, flavorful broth. Crafted with a blend of fresh ingredients like crisp broccoli, sweet carrots, and garden peas, this dish is perfect for a light yet satisfying meal. Rich in vitamins and low in calories.",
      image: "/images/recipes/vegetable-soup.jpg",
      prepTime: 20,
      cookTime: 15,
      difficulty: "EASY",
      servings: 4,
      ingredients: [
        { name: "Broccoli", amount: "1", unit: "head" },
        { name: "Carrots", amount: "2", unit: "pieces" },
        { name: "Green peas", amount: "1/2", unit: "cup" },
        { name: "Celery", amount: "1/2", unit: "stalk" },
        { name: "Onion", amount: "1/4", unit: "piece" },
        { name: "Cabbage", amount: "4", unit: "leaves" },
        { name: "Vegetable broth", amount: "4", unit: "cups" },
        { name: "Olive oil", amount: "1", unit: "tablespoon" },
        { name: "Salt", amount: "1", unit: "teaspoon" },
        { name: "Garlic", amount: "2", unit: "cloves" },
        { name: "Bay leaves", amount: "2", unit: "pieces" },
      ],
      instructions: [
        {
          step: 1,
          description:
            "Pour 1 tablespoon of olive oil into a large pot. Warm it over medium heat until the oil is slightly hot. Make sure the pot is well-heated so the aromatics release their flavor without burning too quickly.",
        },
        {
          step: 2,
          description:
            "Add the chopped onion to the pot. Saute for 3-5 minutes until the onion turns slightly translucent. This creates a fragrant, flavorful base for the soup.",
        },
        {
          step: 3,
          description:
            "Add the carrots and celery (cut into small pieces). Cook gently and stir for 5-7 minutes. Sauteing the vegetables first helps bring out their natural sweetness, making the soup taste richer without added seasonings.",
        },
        {
          step: 4,
          description:
            "Pour in 4 cups of vegetable broth or water into the pot. Add chopped cabbage and season lightly with salt and pepper to taste. Increase the heat until the soup comes to a gentle boil, allowing all the flavors to blend together.",
        },
        {
          step: 5,
          description:
            "Once the soup begins to boil, reduce the heat to medium and let it simmer for 10 minutes so the vegetables soften and the flavors blend together. Keep the pot partially covered to maintain even heat.",
        },
        {
          step: 6,
          description:
            "Add the broccoli and green peas to the pot. Cook just until the broccoli is bright green and slightly tender (about 3-5 minutes). Avoid overcooking to preserve the nutrients and vivid color of the vegetables.",
        },
      ],
      nutrition: {
        calories: 200,
        fat: 0.5,
        protein: 4,
        carbs: 10,
        fiber: 6,
        sugar: 3,
        sodium: 150,
      },
      status: "PUBLISHED",
      source: null,
      tags: ["vegetarian", "low-cal", "healthy", "soup"],
      authorId: admin.id,
    },
    {
      name: "Quinoa Buddha Bowl",
      category: "Main Course",
      description:
        "A colorful and nutritious bowl packed with protein-rich quinoa, roasted vegetables, creamy avocado, and a tangy tahini dressing. Perfect for a healthy lunch or dinner.",
      image: "/images/recipes/buddha-bowl.jpg",
      prepTime: 15,
      cookTime: 25,
      difficulty: "EASY",
      servings: 2,
      ingredients: [
        { name: "Quinoa", amount: "1", unit: "cup" },
        { name: "Sweet potato", amount: "1", unit: "medium" },
        { name: "Chickpeas", amount: "1", unit: "can" },
        { name: "Kale", amount: "2", unit: "cups" },
        { name: "Avocado", amount: "1", unit: "piece" },
        { name: "Cherry tomatoes", amount: "1", unit: "cup" },
        { name: "Tahini", amount: "3", unit: "tablespoons" },
        { name: "Lemon juice", amount: "2", unit: "tablespoons" },
        { name: "Olive oil", amount: "2", unit: "tablespoons" },
        { name: "Garlic powder", amount: "1", unit: "teaspoon" },
      ],
      instructions: [
        {
          step: 1,
          description:
            "Rinse quinoa and cook according to package instructions. Usually 1 cup quinoa to 2 cups water, bring to boil then simmer for 15 minutes.",
        },
        {
          step: 2,
          description:
            "Cut sweet potato into cubes and toss with olive oil, salt, and pepper. Roast at 400°F (200°C) for 20-25 minutes until tender and golden.",
        },
        {
          step: 3,
          description:
            "Drain and rinse chickpeas. Toss with olive oil and garlic powder, then roast alongside sweet potatoes for 15-20 minutes until crispy.",
        },
        {
          step: 4,
          description:
            "Massage kale with a bit of olive oil and lemon juice to soften. This makes it easier to digest and enhances flavor.",
        },
        {
          step: 5,
          description:
            "Make tahini dressing by whisking together tahini, lemon juice, garlic powder, and water until smooth and pourable.",
        },
        {
          step: 6,
          description:
            "Assemble bowls with quinoa as base, then add roasted vegetables, kale, sliced avocado, and cherry tomatoes. Drizzle with tahini dressing.",
        },
      ],
      nutrition: {
        calories: 520,
        fat: 22,
        protein: 18,
        carbs: 65,
        fiber: 15,
        sugar: 8,
        sodium: 280,
      },
      status: "PUBLISHED",
      source: null,
      tags: ["vegetarian", "vegan", "healthy", "bowl", "protein"],
      authorId: admin.id,
    },
    {
      name: "Grilled Salmon with Asparagus",
      category: "Main Course",
      description:
        "Perfectly grilled salmon fillet served with tender asparagus spears. A simple yet elegant dish that's rich in omega-3 fatty acids and perfect for a healthy dinner.",
      image: "/images/recipes/grilled-salmon.jpg",
      prepTime: 10,
      cookTime: 12,
      difficulty: "MEDIUM",
      servings: 2,
      ingredients: [
        { name: "Salmon fillets", amount: "2", unit: "pieces" },
        { name: "Asparagus", amount: "1", unit: "bunch" },
        { name: "Lemon", amount: "1", unit: "piece" },
        { name: "Olive oil", amount: "2", unit: "tablespoons" },
        { name: "Garlic", amount: "2", unit: "cloves" },
        { name: "Salt", amount: "1", unit: "teaspoon" },
        { name: "Black pepper", amount: "1/2", unit: "teaspoon" },
        { name: "Fresh dill", amount: "2", unit: "tablespoons" },
      ],
      instructions: [
        {
          step: 1,
          description:
            "Preheat grill or grill pan to medium-high heat. Pat salmon fillets dry with paper towels.",
        },
        {
          step: 2,
          description:
            "Brush salmon with olive oil and season with salt, pepper, and minced garlic. Let sit for 5 minutes to absorb flavors.",
        },
        {
          step: 3,
          description:
            "Trim woody ends off asparagus. Toss with olive oil, salt, and pepper.",
        },
        {
          step: 4,
          description:
            "Place salmon skin-side down on grill. Cook for 4-5 minutes without moving to get nice grill marks.",
        },
        {
          step: 5,
          description:
            "Flip salmon carefully and cook for another 3-4 minutes until fish flakes easily with a fork. Add asparagus to grill during last 5 minutes.",
        },
        {
          step: 6,
          description:
            "Serve salmon and asparagus with lemon wedges and fresh dill. Squeeze lemon over top before eating.",
        },
      ],
      nutrition: {
        calories: 380,
        fat: 24,
        protein: 35,
        carbs: 8,
        fiber: 4,
        sugar: 3,
        sodium: 420,
      },
      status: "PUBLISHED",
      source: null,
      tags: ["seafood", "low-carb", "protein", "omega-3", "healthy"],
      authorId: admin.id,
    },
  ];

  // Delete existing recipes to avoid duplicates
  await prisma.recipe.deleteMany({});

  // Create recipes
  for (const recipeData of recipes) {
    await prisma.recipe.create({
      data: recipeData,
    });
  }

  // Seed sample articles
  await prisma.favoriteArticle.deleteMany({}).catch(() => null);
  await prisma.article.deleteMany({}).catch(() => null);

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  const articles = [
    {
      title: "Starting Solids: A Simple First Week Plan",
      category: "FEEDING",
      content: `
        <h2>Week 1 goals</h2>
        <p>Keep it simple: one ingredient at a time, small portions, and focus on a calm routine.</p>
        <ul>
          <li>Offer 1–2 teaspoons per meal.</li>
          <li>Try one new food every 1–2 days.</li>
          <li>Watch for texture readiness and gagging vs. choking signs.</li>
        </ul>
        <p>Consistency matters more than quantity at the start.</p>
      `.trim(),
      thumbnailImage: "/images/recipes/vegetable-soup.jpg",
      heroImage: "/images/landing/bg.png",
      status: "PUBLISHED",
      views: 128,
      authorId: admin.id,
    },
    {
      title: "Balanced Nutrition for Toddlers (Quick Checklist)",
      category: "NUTRITION",
      content: `
        <p>Use this quick checklist to build balanced meals:</p>
        <ol>
          <li><strong>Protein</strong>: eggs, fish, chicken, tofu, beans</li>
          <li><strong>Carbs</strong>: rice, potatoes, oats, whole grains</li>
          <li><strong>Veg + Fruit</strong>: varied colors across the week</li>
          <li><strong>Healthy fats</strong>: avocado, olive oil, nut butters (age-appropriate)</li>
        </ol>
        <p>Rotate foods to reduce pickiness and expand preferences.</p>
      `.trim(),
      thumbnailImage: "/images/recipes/buddha-bowl.jpg",
      heroImage: "/images/recipes/buddha-bowl.jpg",
      status: "PUBLISHED",
      views: 76,
      authorId: admin.id,
    },
    {
      title: "Hydration Basics: Water, Milk, and When to Worry",
      category: "HEALTH",
      content: `
        <p>Hydration needs vary by age, activity, and weather. Aim for frequent small sips.</p>
        <p><strong>Call your pediatrician</strong> if you notice very low urine output, lethargy, or persistent vomiting/diarrhea.</p>
      `.trim(),
      thumbnailImage: "/images/landing/bg.png",
      heroImage: "/images/landing/bg.png",
      status: "PUBLISHED",
      views: 34,
      authorId: admin.id,
    },
    {
      title: "Texture Progression: From Purees to Finger Foods",
      category: "DEVELOPMENT",
      content: `
        <p>Gradually increasing texture helps chewing skills develop.</p>
        <ul>
          <li>Smooth puree → mashed → soft lumps</li>
          <li>Soft finger foods (banana, steamed veg sticks)</li>
          <li>Mixed textures (rice + veg + protein)</li>
        </ul>
        <p>Move at your child's pace and keep meals supervised.</p>
      `.trim(),
      thumbnailImage: "/images/recipes/grilled-salmon.jpg",
      heroImage: "/images/recipes/grilled-salmon.jpg",
      status: "PUBLISHED",
      views: 59,
      authorId: admin.id,
    },
    {
      title: "Meal Prep Tips: Save Time Without Losing Variety",
      category: "TIPS",
      content: `
        <p>Batch-cook staples (rice, shredded chicken, roasted veggies) and mix-and-match through the week.</p>
        <p>Freeze in small portions for quick weekday meals.</p>
      `.trim(),
      thumbnailImage: "/images/recipes/vegetable-soup.jpg",
      heroImage: "/images/recipes/vegetable-soup.jpg",
      status: "PUBLISHED",
      views: 21,
      authorId: admin.id,
    },
  ];

  const createdArticles = [];
  for (const articleData of articles) {
    createdArticles.push(
      await prisma.article.create({
        data: articleData,
      }),
    );
  }

  // Seed a few favorites for the sample user
  if (user && createdArticles.length > 0) {
    await prisma.favoriteArticle.createMany({
      data: createdArticles.slice(0, 2).map((a) => ({
        userId: user.id,
        articleId: a.id,
      })),
      skipDuplicates: true,
    });
  }

  console.log("Seeded admin:", email, "password:", password);
  console.log("Seeded user:", userEmail, "password:", userPassword);
  console.log("Seeded", recipes.length, "sample recipes");
  console.log("Seeded", articles.length, "sample articles");

  // Seed forum posts + comments
  await prisma.forumPostLike.deleteMany({}).catch(() => null);
  await prisma.forumPostVote.deleteMany({}).catch(() => null);
  await prisma.forumComment.deleteMany({}).catch(() => null);
  await prisma.forumPost.deleteMany({}).catch(() => null);

  const forumPosts = [
    {
      content:
        "My baby gags a lot when trying slightly lumpy textures. Is this normal? Any tips for progressing safely?",
      authorId: user?.id || admin.id,
    },
    {
      content:
        "What are your go-to quick breakfast ideas for toddlers on busy weekdays?",
      authorId: user?.id || admin.id,
    },
    {
      content:
        "Anyone dealing with picky eating suddenly at 18–24 months? What helped you the most?",
      authorId: admin.id,
    },
  ];

  const createdPosts = [];
  for (const p of forumPosts) {
    createdPosts.push(await prisma.forumPost.create({ data: p }));
  }

  if (createdPosts[0]) {
    const postId = createdPosts[0].id;
    const now = new Date();

    const comments = [
      {
        postId,
        userId: admin.id,
        content:
          "Gagging can be part of learning textures. Try thicker purees first and increase texture gradually. Always supervise and keep portions small.",
        createdAt: now,
      },
      {
        postId,
        userId: user?.id || admin.id,
        content:
          "We found it helped to offer one 'safe' food alongside the new texture, and let them explore with hands first.",
        createdAt: now,
      },
      {
        postId,
        userId: admin.id,
        content:
          "If gagging is frequent with distress or you suspect swallowing issues, consider asking your pediatrician about feeding therapy assessment.",
        createdAt: now,
      },
    ];

    for (const c of comments) {
      await prisma.forumComment.create({ data: c });
    }
  }

  if (user && createdPosts[1]) {
    await prisma.forumPostLike.create({
      data: { userId: user.id, postId: createdPosts[1].id },
    });
    await prisma.forumPostVote.create({
      data: { userId: user.id, postId: createdPosts[1].id, value: 1 },
    });
  }

  console.log("Seeded", forumPosts.length, "sample forum posts");

  // Seed a child + meal logs + a report for the sample user
  if (user) {
    await prisma.child.deleteMany({ where: { userId: user.id } }).catch(() => null);

    const child = await prisma.child.create({
      data: {
        userId: user.id,
        photo: null,
        name: "Ava",
        gender: "FEMALE",
        age: 18, // months
        height: 80, // cm
        weight: 10.4, // kg
        favoriteFood: "Banana",
        hatedFood: "Broccoli",
        foodAllergies: ["dairy"],
        refusalBehaviors: ["turn_away"],
        mealDuration: "TEN_TO_TWENTY",
        texturePreference: "SOFT_MASHED",
        eatingPatternChange: "SLIGHTLY",
        weightEnergyLevel: "NORMAL_WEIGHT",
      },
    });

    const now = new Date();
    const logs = [
      {
        childId: child.id,
        photo: null,
        foodName: "Oatmeal + banana",
        mealTime: "BREAKFAST",
        childResponse: "FINISHED",
        notes: "Ate well and asked for more.",
        loggedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 1),
      },
      {
        childId: child.id,
        photo: null,
        foodName: "Rice + chicken + carrots",
        mealTime: "LUNCH",
        childResponse: "PARTIALLY",
        notes: "Ate chicken and rice, refused carrots.",
        loggedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 1),
      },
      {
        childId: child.id,
        photo: null,
        foodName: "Yogurt + berries",
        mealTime: "DINNER",
        childResponse: "REFUSED",
        notes: "Refused today (possible teething).",
        loggedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2),
      },
      {
        childId: child.id,
        photo: null,
        foodName: "Scrambled eggs + toast",
        mealTime: "BREAKFAST",
        childResponse: "FINISHED",
        notes: "Loved it.",
        loggedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3),
      },
      {
        childId: child.id,
        photo: null,
        foodName: "Soup (veggies blended)",
        mealTime: "DINNER",
        childResponse: "PARTIALLY",
        notes: "Did okay with thicker texture.",
        loggedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 4),
      },
    ];

    for (const log of logs) {
      await prisma.mealLog.create({ data: log });
    }

    const totalMeals = logs.length;
    const mealsFinished = logs.filter((l) => l.childResponse === "FINISHED").length;
    const mealsPartial = logs.filter((l) => l.childResponse === "PARTIALLY").length;
    const mealsRefused = logs.filter((l) => l.childResponse === "REFUSED").length;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    const period = getIsoWeekPeriod(endDate);

    await prisma.report.create({
      data: {
        childId: child.id,
        reportType: "WEEKLY",
        period,
        startDate,
        endDate,
        summary: {
          totalMeals,
          mealsFinished,
          mealsPartial,
          mealsRefused,
        },
        insights: {
          highlights: [
            "Good breakfast consistency",
            "Some refusal at dinner; may be related to teething or fatigue",
          ],
          patterns: [
            "Prefers softer textures",
            "More likely to refuse veggies when mixed as chunks",
          ],
        },
        recommendations: {
          nextSteps: [
            "Keep one safe food alongside new textures",
            "Offer veggies in mixed textures (mashed + soft chunks)",
            "Maintain calm mealtime routine and avoid pressure",
          ],
        },
        mealDetails: logs.map((l) => ({
          photo: l.photo,
          foodName: l.foodName,
          mealTime: l.mealTime,
          childResponse: l.childResponse,
          loggedAt: l.loggedAt,
        })),
        totalMeals,
        mealsFinished,
        mealsPartial,
        mealsRefused,
        status: "GENERATED",
      },
    });

    console.log("Seeded 1 child +", logs.length, "meal logs + 1 weekly report for user");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
