import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/jwt";

// GET /api/children/[id] - Get specific child
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

    const child = await prisma.child.findUnique({
      where: { id },
      include: {
        mealLogs: {
          orderBy: {
            loggedAt: "desc",
          },
          take: 10,
        },
      },
    });

    if (!child) {
      return NextResponse.json({ error: "Child not found" }, { status: 404 });
    }

    // Check if user owns this child
    if (child.userId !== payload.sub) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ child });
  } catch (error) {
    console.error("Error fetching child:", error);
    return NextResponse.json(
      { error: "Failed to fetch child" },
      { status: 500 }
    );
  }
}

// PUT /api/children/[id] - Update child
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

    const child = await prisma.child.findUnique({
      where: { id },
    });

    if (!child) {
      return NextResponse.json({ error: "Child not found" }, { status: 404 });
    }

    if (child.userId !== payload.sub) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
      photo,
      name,
      gender,
      age,
      height,
      weight,
      favoriteFood,
      hatedFood,
      foodAllergies,
      refusalBehaviors,
      mealDuration,
      texturePreference,
      eatingPatternChange,
      weightEnergyLevel,
    } = body;

    const updatedChild = await prisma.child.update({
      where: { id },
      data: {
        ...(photo !== undefined && { photo }),
        ...(name && { name }),
        ...(gender && { gender }),
        ...(age !== undefined && { age: parseInt(age) }),
        ...(height !== undefined && { height: parseFloat(height) }),
        ...(weight !== undefined && { weight: parseFloat(weight) }),
        ...(favoriteFood !== undefined && { favoriteFood }),
        ...(hatedFood !== undefined && { hatedFood }),
        ...(foodAllergies !== undefined && { foodAllergies }),
        ...(refusalBehaviors !== undefined && { refusalBehaviors }),
        ...(mealDuration && { mealDuration }),
        ...(texturePreference && { texturePreference }),
        ...(eatingPatternChange && { eatingPatternChange }),
        ...(weightEnergyLevel && { weightEnergyLevel }),
      },
    });

    return NextResponse.json({ child: updatedChild });
  } catch (error) {
    console.error("Error updating child:", error);
    return NextResponse.json(
      { error: "Failed to update child" },
      { status: 500 }
    );
  }
}

// DELETE /api/children/[id] - Delete child
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

    const child = await prisma.child.findUnique({
      where: { id },
    });

    if (!child) {
      return NextResponse.json({ error: "Child not found" }, { status: 404 });
    }

    if (child.userId !== payload.sub) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.child.delete({ where: { id } });

    return NextResponse.json({ message: "Child deleted successfully" });
  } catch (error) {
    console.error("Error deleting child:", error);
    return NextResponse.json(
      { error: "Failed to delete child" },
      { status: 500 }
    );
  }
}
