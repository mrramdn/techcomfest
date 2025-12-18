import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/jwt";

type MealTime = "BREAKFAST" | "LUNCH" | "DINNER";
type ChildResponse = "FINISHED" | "PARTIALLY" | "REFUSED";
type MealLogWhere = {
  childId: string;
  mealTime?: MealTime;
  childResponse?: ChildResponse;
  loggedAt?: {
    gte?: Date;
    lte?: Date;
  };
};

const MEAL_TIME_VALUES: MealTime[] = ["BREAKFAST", "LUNCH", "DINNER"];
const CHILD_RESPONSE_VALUES: ChildResponse[] = ["FINISHED", "PARTIALLY", "REFUSED"];

// GET /api/meal-logs - Get meal logs with filters
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

    const { searchParams } = new URL(request.url);
    const childId = searchParams.get("childId");
    const mealTime = searchParams.get("mealTime");
    const childResponse = searchParams.get("childResponse");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!childId) {
      return NextResponse.json(
        { error: "childId is required" },
        { status: 400 }
      );
    }

    // Verify user owns this child
    const child = await prisma.child.findUnique({
      where: { id: childId },
    });

    if (!child) {
      return NextResponse.json({ error: "Child not found" }, { status: 404 });
    }

    if (child.userId !== payload.sub) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Build filter
    const where: MealLogWhere = {
      childId,
    };

    if (mealTime) {
      const safeMealTime = parseMealTime(mealTime);
      if (!safeMealTime) {
        return NextResponse.json({ error: "Invalid meal time" }, { status: 400 });
      }
      where.mealTime = safeMealTime;
    }

    if (childResponse) {
      const safeResponse = parseChildResponse(childResponse);
      if (!safeResponse) {
        return NextResponse.json({ error: "Invalid child response" }, { status: 400 });
      }
      where.childResponse = safeResponse;
    }

    if (startDate || endDate) {
      where.loggedAt = {};
      if (startDate) {
        where.loggedAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.loggedAt.lte = new Date(endDate);
      }
    }

    const mealLogs = await prisma.mealLog.findMany({
      where,
      orderBy: {
        loggedAt: "desc",
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

    return NextResponse.json({ mealLogs });
  } catch (error) {
    console.error("Error fetching meal logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch meal logs" },
      { status: 500 }
    );
  }
}

function parseMealTime(value: string): MealTime | null {
  return MEAL_TIME_VALUES.includes(value as MealTime) ? (value as MealTime) : null;
}

function parseChildResponse(value: string): ChildResponse | null {
  return CHILD_RESPONSE_VALUES.includes(value as ChildResponse) ? (value as ChildResponse) : null;
}

// POST /api/meal-logs - Create new meal log
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifySession(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const { childId, photo, foodName, mealTime, childResponse, notes } = body;

    // Validation
    if (!childId || !foodName || !mealTime || !childResponse) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify user owns this child
    const child = await prisma.child.findUnique({
      where: { id: childId },
    });

    if (!child) {
      return NextResponse.json({ error: "Child not found" }, { status: 404 });
    }

    if (child.userId !== payload.sub) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!["BREAKFAST", "LUNCH", "DINNER"].includes(mealTime)) {
      return NextResponse.json(
        { error: "Invalid meal time" },
        { status: 400 }
      );
    }

    if (!["FINISHED", "PARTIALLY", "REFUSED"].includes(childResponse)) {
      return NextResponse.json(
        { error: "Invalid child response" },
        { status: 400 }
      );
    }

    const mealLog = await prisma.mealLog.create({
      data: {
        childId,
        photo,
        foodName,
        mealTime,
        childResponse,
        notes,
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

    return NextResponse.json({ mealLog }, { status: 201 });
  } catch (error) {
    console.error("Error creating meal log:", error);
    return NextResponse.json(
      { error: "Failed to create meal log" },
      { status: 500 }
    );
  }
}
