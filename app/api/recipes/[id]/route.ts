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
    const body = await request.json();

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
        image: body.image,
        prepTime: body.prepTime ? parseInt(body.prepTime) : undefined,
        cookTime: body.cookTime ? parseInt(body.cookTime) : undefined,
        difficulty: body.difficulty,
        servings: body.servings ? parseInt(body.servings) : undefined,
        ingredients: body.ingredients,
        instructions: body.instructions,
        nutrition: body.nutrition,
        status: body.status,
        source: body.source,
        tags: body.tags,
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
