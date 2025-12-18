import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/jwt";

// GET /api/meal-logs/[id] - Get specific meal log
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let payload;
    try {
      payload = verifySession(token);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { id } = await context.params;

    const mealLog = await prisma.mealLog.findUnique({
      where: { id },
      include: {
        child: true,
      },
    });

    if (!mealLog) {
      return NextResponse.json(
        { error: "Meal log not found" },
        { status: 404 }
      );
    }

    // Check if user owns this child
    if (mealLog.child.userId !== payload.sub) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ mealLog });
  } catch (error) {
    console.error("Error fetching meal log:", error);
    return NextResponse.json(
      { error: "Failed to fetch meal log" },
      { status: 500 }
    );
  }
}

// PUT /api/meal-logs/[id] - Update meal log
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let payload;
    try {
      payload = verifySession(token);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { id } = await context.params;

    const mealLog = await prisma.mealLog.findUnique({
      where: { id },
      include: {
        child: true,
      },
    });

    if (!mealLog) {
      return NextResponse.json(
        { error: "Meal log not found" },
        { status: 404 }
      );
    }

    if (mealLog.child.userId !== payload.sub) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { photo, foodName, mealTime, childResponse, notes } = body;

    const updatedMealLog = await prisma.mealLog.update({
      where: { id },
      data: {
        ...(photo !== undefined && { photo }),
        ...(foodName && { foodName }),
        ...(mealTime && { mealTime }),
        ...(childResponse && { childResponse }),
        ...(notes !== undefined && { notes }),
      },
      include: {
        child: {
          select: {
            id: true,
            name: true,
            photo: true,
          },
        },
      },
    });

    return NextResponse.json({ mealLog: updatedMealLog });
  } catch (error) {
    console.error("Error updating meal log:", error);
    return NextResponse.json(
      { error: "Failed to update meal log" },
      { status: 500 }
    );
  }
}

// DELETE /api/meal-logs/[id] - Delete meal log
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let payload;
    try {
      payload = verifySession(token);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { id } = await context.params;

    const mealLog = await prisma.mealLog.findUnique({
      where: { id },
      include: {
        child: true,
      },
    });

    if (!mealLog) {
      return NextResponse.json(
        { error: "Meal log not found" },
        { status: 404 }
      );
    }

    if (mealLog.child.userId !== payload.sub) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.mealLog.delete({ where: { id } });

    return NextResponse.json({ message: "Meal log deleted successfully" });
  } catch (error) {
    console.error("Error deleting meal log:", error);
    return NextResponse.json(
      { error: "Failed to delete meal log" },
      { status: 500 }
    );
  }
}
