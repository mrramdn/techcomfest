import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Difficulty, Prisma, RecipeStatus } from "@prisma/client";
import { jwtVerify } from "jose";
import fs from "fs";
import path from "path";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key"
);

type RecipeUpdatePayload = Partial<{
  name: string;
  category: string;
  description: string;
  image: string | null;
  prepTime: number;
  cookTime: number;
  difficulty: string;
  servings: number;
  ingredients: unknown;
  instructions: unknown;
  nutrition: unknown;
  status: string;
  source: string | null;
  tags: unknown;
}>;

function parseNumber(value: FormDataEntryValue | null): number | undefined {
  if (value === null) return undefined;
  const num = Number(String(value));
  return Number.isFinite(num) ? num : undefined;
}

function parseJson(value: FormDataEntryValue | null): unknown {
  if (value === null) return undefined;
  const str = String(value);
  try {
    return JSON.parse(str);
  } catch {
    return undefined;
  }
}

function toStringArray(value: unknown): string[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) return [];
  return value.filter((v) => typeof v === "string") as string[];
}

function toJsonValue(value: unknown): Prisma.InputJsonValue | undefined {
  if (value === undefined) return undefined;
  return value as Prisma.InputJsonValue;
}

function parseDifficulty(value: unknown): Difficulty | undefined {
  if (typeof value !== "string") return undefined;
  const upper = value.toUpperCase();
  return upper === "EASY" || upper === "MEDIUM" || upper === "HARD" ? (upper as Difficulty) : undefined;
}

function parseStatus(value: unknown): RecipeStatus | undefined {
  if (typeof value !== "string") return undefined;
  const upper = value.toUpperCase();
  return upper === "DRAFT" || upper === "PUBLISHED" ? (upper as RecipeStatus) : undefined;
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

// GET /api/recipes/[id] - Get recipe detail
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromToken(request);
    const { id } = await params;

    const recipe = await prisma.recipe.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { favoritedBy: true },
        },
      },
    });

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    // Check if user can view this recipe
    if (recipe.status !== "PUBLISHED" && user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    // Increment views
    await prisma.recipe.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    // Check if user favorited this recipe
    let isFavorited = false;
    if (user) {
      const favorite = await prisma.favoriteRecipe.findUnique({
        where: {
          userId_recipeId: {
            userId: user.sub,
            recipeId: id,
          },
        },
      });
      isFavorited = !!favorite;
    }

    return NextResponse.json({
      recipe: {
        ...recipe,
        views: recipe.views + 1, // Return incremented value
        isFavorited,
        favoritesCount: recipe._count.favoritedBy,
      },
    });
  } catch (error) {
    console.error("Error fetching recipe:", error);
    return NextResponse.json(
      { error: "Failed to fetch recipe" },
      { status: 500 }
    );
  }
}

// PUT /api/recipes/[id] - Update recipe (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromToken(request);

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    // Try formData first (file upload)
    let body: RecipeUpdatePayload | null = null;
    let photoUrl: string | null = null;
    try {
      const form = await request.formData();
      if (form.has("name")) {
        body = {
          name: String(form.get("name") || ""),
          category: String(form.get("category") || ""),
          description: String(form.get("description") || ""),
          image: form.get("image") ? String(form.get("image")) : null,
          prepTime: parseNumber(form.get("prepTime")),
          cookTime: parseNumber(form.get("cookTime")),
          difficulty: String(form.get("difficulty") || ""),
          servings: parseNumber(form.get("servings")),
          ingredients: parseJson(form.get("ingredients")) ?? [],
          instructions: parseJson(form.get("instructions")) ?? [],
          nutrition: parseJson(form.get("nutrition")) ?? null,
          status: String(form.get("status") || ""),
          source: form.get("source") ? String(form.get("source")) : null,
          tags: parseJson(form.get("tags")) ?? [],
        };

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
      // ignore
    }

    if (!body) body = (await request.json()) as RecipeUpdatePayload;

    const recipe = await prisma.recipe.findUnique({
      where: { id },
    });

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    const updatedRecipe = await prisma.recipe.update({
      where: { id },
      data: {
        name: body.name,
        category: body.category,
        description: body.description,
        image: photoUrl || body.image || null,
        prepTime: body.prepTime !== undefined ? parseInt(String(body.prepTime), 10) : undefined,
        cookTime: body.cookTime !== undefined ? parseInt(String(body.cookTime), 10) : undefined,
        difficulty: parseDifficulty(body.difficulty),
        servings: body.servings !== undefined ? parseInt(String(body.servings), 10) : undefined,
        ingredients: toJsonValue(body.ingredients),
        instructions: toJsonValue(body.instructions),
        nutrition: toJsonValue(body.nutrition),
        status: parseStatus(body.status),
        source: body.source,
        tags: toStringArray(body.tags),
      },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({ recipe: updatedRecipe });
  } catch (error) {
    console.error("Error updating recipe:", error);
    return NextResponse.json(
      { error: "Failed to update recipe" },
      { status: 500 }
    );
  }
}

// DELETE /api/recipes/[id] - Delete recipe (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromToken(request);

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    const recipe = await prisma.recipe.findUnique({
      where: { id },
    });

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    await prisma.recipe.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Recipe deleted successfully" });
  } catch (error) {
    console.error("Error deleting recipe:", error);
    return NextResponse.json(
      { error: "Failed to delete recipe" },
      { status: 500 }
    );
  }
}
