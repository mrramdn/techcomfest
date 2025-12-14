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

// POST /api/recipes/[id]/favorite - Toggle favorite
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromToken(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if recipe exists
    const recipe = await prisma.recipe.findUnique({
      where: { id },
    });

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    // Check if already favorited
    const existingFavorite = await prisma.favoriteRecipe.findUnique({
      where: {
        userId_recipeId: {
          userId: user.sub,
          recipeId: id,
        },
      },
    });

    if (existingFavorite) {
      // Unfavorite
      await prisma.favoriteRecipe.delete({
        where: {
          userId_recipeId: {
            userId: user.sub,
            recipeId: id,
          },
        },
      });

      return NextResponse.json({
        message: "Recipe unfavorited",
        isFavorited: false,
      });
    } else {
      // Favorite
      await prisma.favoriteRecipe.create({
        data: {
          userId: user.sub,
          recipeId: id,
        },
      });

      return NextResponse.json({
        message: "Recipe favorited",
        isFavorited: true,
      });
    }
  } catch (error) {
    console.error("Error toggling favorite:", error);
    return NextResponse.json(
      { error: "Failed to toggle favorite" },
      { status: 500 }
    );
  }
}
