import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import { Prisma, Difficulty, RecipeStatus } from "@prisma/client";
import fs from "fs";
import path from "path";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key"
);

type RecipeCreatePayload = {
  name: string;
  category: string;
  description: string;
  image?: string | null;
  prepTime: number;
  cookTime: number;
  difficulty: string;
  servings: number;
  ingredients: unknown;
  instructions: unknown;
  nutrition: unknown;
  status?: string;
  source?: string | null;
  tags?: unknown;
};

function parseNumber(value: FormDataEntryValue | null): number | null {
  if (value === null) return null;
  const num = Number(String(value));
  return Number.isFinite(num) ? num : null;
}

function parseJson(value: FormDataEntryValue | null): unknown {
  if (value === null) return null;
  const str = String(value);
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v) => typeof v === "string") as string[];
}

function parseDifficulty(value: unknown): Difficulty | null {
  if (typeof value !== "string") return null;
  const upper = value.toUpperCase();
  return upper === "EASY" || upper === "MEDIUM" || upper === "HARD" ? (upper as Difficulty) : null;
}

function parseStatus(value: unknown): RecipeStatus | null {
  if (typeof value !== "string") return null;
  const upper = value.toUpperCase();
  return upper === "DRAFT" || upper === "PUBLISHED" ? (upper as RecipeStatus) : null;
}

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return (value === undefined ? null : value) as Prisma.InputJsonValue;
}

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

    const where: Prisma.RecipeWhereInput = {};

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

      const recipes = favoritedRecipes.map((fav) => ({
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
      favoritedRecipeIds = userFavorites.map((fav) => fav.recipeId);
    }

    const recipesWithFavorites = recipes.map((recipe) => ({
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

    let name: string | null = null;
    let category: string | null = null;
    let description: string | null = null;
    let image: string | null = null;
    let prepTime: number | null = null;
    let cookTime: number | null = null;
    let difficulty: string | null = null;
    let servings: number | null = null;
    let ingredients: unknown = null;
    let instructions: unknown = null;
    let nutrition: unknown = null;
    let status: string | null = null;
    let source: string | null = null;
    let tags: unknown = null;

    // Try reading form-data first (file upload flow)
    let photoUrl: string | null = null;
    try {
      const form = await request.formData();
      if (form.has("name")) {
        name = String(form.get("name") || "");
        category = String(form.get("category") || "");
        description = String(form.get("description") || "");
        image = String(form.get("image") || "") || null;
        prepTime = parseNumber(form.get("prepTime"));
        cookTime = parseNumber(form.get("cookTime"));
        difficulty = String(form.get("difficulty") || "");
        servings = parseNumber(form.get("servings"));
        status = String(form.get("status") || "DRAFT");
        source = form.get("source") ? String(form.get("source")) : null;
        tags = parseJson(form.get("tags"));
        ingredients = parseJson(form.get("ingredients"));
        instructions = parseJson(form.get("instructions"));
        nutrition = parseJson(form.get("nutrition"));

        const photo = form.get("photo") as File | null;
        if (photo && typeof photo.arrayBuffer === "function") {
          const buffer = Buffer.from(await photo.arrayBuffer());
          const uploadsDir = path.join(process.cwd(), "public", "uploads");
          if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

          const safeName = `${Date.now()}-${photo.name || "photo"}`.replace(/[^a-zA-Z0-9_.-]/g, "-");
          const filePath = path.join(uploadsDir, safeName);
          await fs.promises.writeFile(filePath, buffer);
          photoUrl = `/uploads/${safeName}`;
        }
      }
    } catch {
      // not form-data or no file — fallback to json
    }

    if (!name) {
      const body = (await request.json()) as RecipeCreatePayload;
      name = body.name;
      category = body.category;
      description = body.description;
      image = body.image ?? null;
      prepTime = Number(body.prepTime);
      cookTime = Number(body.cookTime);
      difficulty = body.difficulty;
      servings = Number(body.servings);
      ingredients = body.ingredients;
      instructions = body.instructions;
      nutrition = body.nutrition;
      status = body.status ?? null;
      source = body.source ?? null;
      tags = body.tags ?? [];
    }

    // Validation
    const parsedDifficulty = parseDifficulty(difficulty);
    const parsedStatus = parseStatus(status) || "DRAFT";

    if (
      !name ||
      !category ||
      !description ||
      prepTime === null ||
      cookTime === null ||
      !parsedDifficulty ||
      servings === null ||
      !ingredients ||
      !instructions ||
      nutrition === null
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
        image: photoUrl || image || null,
        prepTime: parseInt(String(prepTime), 10),
        cookTime: parseInt(String(cookTime), 10),
        difficulty: parsedDifficulty,
        servings: parseInt(String(servings), 10),
        ingredients: toJsonValue(ingredients),
        instructions: toJsonValue(instructions),
        nutrition: toJsonValue(nutrition),
        status: parsedStatus,
        source,
        tags: toStringArray(tags),
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
