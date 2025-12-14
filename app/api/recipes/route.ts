import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key"
);

async function getUserFromToken(request: NextRequest) {
  try {
    const token = request.cookies.get("session-token")?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { sub: string; email: string; role: string };
  } catch {
    return null;
  }
}

// GET /api/recipes - List recipes
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    const { searchParams } = new URL(request.url);
    
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const favorites = searchParams.get("favorites") === "true";

    let where: any = {};

    // User only sees PUBLISHED recipes, Admin sees all
    if (user?.role !== "ADMIN") {
      where.status = "PUBLISHED";
    }

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { has: search.toLowerCase() } },
      ];
    }

    // If favorites filter and user is logged in
    if (favorites && user) {
      const favoritedRecipes = await prisma.favoriteRecipe.findMany({
        where: { userId: user.sub },
        include: {
          recipe: {
            include: {
              author: {
                select: { id: true, name: true, email: true },
              },
              _count: {
                select: { favoritedBy: true },
              },
            },
          },
        },
      });

      const recipes = favoritedRecipes.map((fav: any) => ({
        ...fav.recipe,
        isFavorited: true,
        favoritesCount: fav.recipe._count.favoritedBy,
      }));

      return NextResponse.json({ recipes });
    }

    const recipes = await prisma.recipe.findMany({
      where,
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { favoritedBy: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Check if user favorited each recipe
    let favoritedRecipeIds: string[] = [];
    if (user) {
      const userFavorites = await prisma.favoriteRecipe.findMany({
        where: { userId: user.sub },
        select: { recipeId: true },
      });
      favoritedRecipeIds = userFavorites.map((fav: any) => fav.recipeId);
    }

    const recipesWithFavorites = recipes.map((recipe: any) => ({
      ...recipe,
      isFavorited: favoritedRecipeIds.includes(recipe.id),
      favoritesCount: recipe._count.favoritedBy,
    }));

    return NextResponse.json({ recipes: recipesWithFavorites });
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return NextResponse.json(
      { error: "Failed to fetch recipes" },
      { status: 500 }
    );
  }
}

// POST /api/recipes - Create recipe (Admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      category,
      description,
      image,
      prepTime,
      cookTime,
      difficulty,
      servings,
      ingredients,
      instructions,
      nutrition,
      status,
      source,
      tags,
    } = body;

    // Validation
    if (
      !name ||
      !category ||
      !description ||
      !prepTime ||
      !cookTime ||
      !difficulty ||
      !servings ||
      !ingredients ||
      !instructions ||
      !nutrition
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const recipe = await prisma.recipe.create({
      data: {
        name,
        category,
        description,
        image,
        prepTime: parseInt(prepTime),
        cookTime: parseInt(cookTime),
        difficulty,
        servings: parseInt(servings),
        ingredients,
        instructions,
        nutrition,
        status: status || "DRAFT",
        source,
        tags: tags || [],
        authorId: user.sub,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({ recipe }, { status: 201 });
  } catch (error) {
    console.error("Error creating recipe:", error);
    return NextResponse.json(
      { error: "Failed to create recipe" },
      { status: 500 }
    );
  }
}
