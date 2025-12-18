import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/jwt";

// GET /api/children - Get all children for logged-in user
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifySession(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const children = await prisma.child.findMany({
      where: {
        userId: payload.sub,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ children });
  } catch (error) {
    console.error("Error fetching children:", error);
    return NextResponse.json(
      { error: "Failed to fetch children" },
      { status: 500 }
    );
  }
}

// POST /api/children - Create new child
export async function POST(request: NextRequest) {
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

    // Validation
    if (!name || !gender || !age || !height || !weight) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!["MALE", "FEMALE"].includes(gender)) {
      return NextResponse.json({ error: "Invalid gender" }, { status: 400 });
    }

    if (!["LESS_THAN_10", "TEN_TO_TWENTY", "TWENTY_TO_THIRTY", "MORE_THAN_30"].includes(mealDuration)) {
      return NextResponse.json(
        { error: "Invalid meal duration" },
        { status: 400 }
      );
    }

    if (!["PUREED", "SOFT_MASHED", "SEMI_CHUNKY", "SOLID_FINGER_FOOD"].includes(texturePreference)) {
      return NextResponse.json(
        { error: "Invalid texture preference" },
        { status: 400 }
      );
    }

    if (!["NO", "SLIGHTLY", "MODERATELY", "SIGNIFICANTLY"].includes(eatingPatternChange)) {
      return NextResponse.json(
        { error: "Invalid eating pattern change" },
        { status: 400 }
      );
    }

    if (!["NORMAL_WEIGHT", "WEIGHT_STAGNANT", "WEIGHT_DECREASING"].includes(weightEnergyLevel)) {
      return NextResponse.json(
        { error: "Invalid weight energy level" },
        { status: 400 }
      );
    }

    const child = await prisma.child.create({
      data: {
        userId: payload.sub,
        photo,
        name,
        gender,
        age: parseInt(age),
        height: parseFloat(height),
        weight: parseFloat(weight),
        favoriteFood,
        hatedFood,
        foodAllergies: foodAllergies || [],
        refusalBehaviors: refusalBehaviors || [],
        mealDuration,
        texturePreference,
        eatingPatternChange,
        weightEnergyLevel,
      },
    });

    return NextResponse.json({ child }, { status: 201 });
  } catch (error) {
    console.error("Error creating child:", error);
    return NextResponse.json(
      { error: "Failed to create child" },
      { status: 500 }
    );
  }
}
