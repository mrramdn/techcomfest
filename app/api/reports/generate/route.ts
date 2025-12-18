import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/jwt";

type MealTime = "BREAKFAST" | "LUNCH" | "DINNER";
type ChildResponse = "FINISHED" | "PARTIALLY" | "REFUSED";
type ReportType = "DAILY" | "WEEKLY" | "MONTHLY";

type ChildRecord = {
  id: string;
  userId: string;
  name: string;
  photo: string | null;
  texturePreference: "PUREED" | "SOFT_MASHED" | "SEMI_CHUNKY" | "SOLID_FINGER_FOOD";
  age: number;
};

type MealLogRecord = {
  photo: string | null;
  foodName: string;
  mealTime: MealTime;
  childResponse: ChildResponse;
  loggedAt: Date;
};

type ReportWithChild = {
  id: string;
  childId: string;
  reportType: ReportType;
  period: string;
  startDate: Date;
  endDate: Date;
  summary: unknown;
  insights: unknown;
  recommendations: unknown;
  mealDetails: unknown;
  totalMeals: number;
  mealsFinished: number;
  mealsPartial: number;
  mealsRefused: number;
  status: "GENERATED" | "VIEWED" | "ARCHIVED";
  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  child: {
    id: string;
    name: string;
    photo: string | null;
  };
};

const REPORT_TYPES: ReportType[] = ["DAILY", "WEEKLY", "MONTHLY"];

// POST /api/reports/generate - Generate a new report
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
    const { childId, reportType, startDate, endDate } = body;

    // Validation
    if (!childId || !reportType || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!REPORT_TYPES.includes(reportType)) {
      return NextResponse.json(
        { error: "Invalid report type" },
        { status: 400 }
      );
    }

    // Verify user owns this child
    const db = prisma as unknown as {
      child: {
        findUnique: (args: unknown) => Promise<ChildRecord | null>;
      };
      mealLog: {
        findMany: (args: unknown) => Promise<MealLogRecord[]>;
      };
      report: {
        findUnique: (args: unknown) => Promise<ReportWithChild | null>;
        update: (args: unknown) => Promise<ReportWithChild>;
        create: (args: unknown) => Promise<ReportWithChild>;
      };
    };

    const child = await db.child.findUnique({
      where: { id: childId },
    });

    if (!child) {
      return NextResponse.json({ error: "Child not found" }, { status: 404 });
    }

    if (child.userId !== payload.sub) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Generate period string
    const start = new Date(startDate);
    const end = new Date(endDate);
    let period = "";

    if (reportType === "DAILY") {
      period = start.toISOString().split("T")[0]; // YYYY-MM-DD
    } else if (reportType === "WEEKLY") {
      const weekNumber = getWeekNumber(start);
      period = `${start.getFullYear()}-W${weekNumber}`;
    } else if (reportType === "MONTHLY") {
      period = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}`;
    }

    // Fetch meal logs for the period
    const mealLogs = await db.mealLog.findMany({
      where: {
        childId,
        loggedAt: {
          gte: start,
          lte: end,
        },
      },
      orderBy: {
        loggedAt: "asc",
      },
    });

    // Calculate metrics
    const totalMeals = mealLogs.length;
    const mealsFinished = mealLogs.filter((log) => log.childResponse === "FINISHED").length;
    const mealsPartial = mealLogs.filter((log) => log.childResponse === "PARTIALLY").length;
    const mealsRefused = mealLogs.filter((log) => log.childResponse === "REFUSED").length;

    // Prepare meal details for report
    const mealDetails: MealDetail[] = mealLogs.map((log) => ({
      photo: log.photo,
      foodName: log.foodName,
      mealTime: log.mealTime,
      childResponse: log.childResponse,
      loggedAt: log.loggedAt.toISOString(),
    }));

    // Generate summary statistics
    const summary: Summary = {
      totalMeals,
      mealsFinished,
      mealsPartial,
      mealsRefused,
      finishedRate: totalMeals > 0 ? ((mealsFinished / totalMeals) * 100).toFixed(1) : "0",
      refusedRate: totalMeals > 0 ? ((mealsRefused / totalMeals) * 100).toFixed(1) : "0",
      mostCommonMealTime: getMostCommon(mealLogs.map((log) => log.mealTime)),
      mostCommonResponse: getMostCommon(mealLogs.map((log) => log.childResponse)),
    };

    // Generate basic insights (will be replaced with AI later)
    const insights = generateBasicInsights(summary, child);

    // Generate basic recommendations (will be replaced with AI later)
    const recommendations = generateBasicRecommendations(summary, child);

    // Check if report already exists for this period
    const existingReport = await db.report.findUnique({
      where: {
        childId_reportType_period: {
          childId,
          reportType,
          period,
        },
      },
    });

    let report: ReportWithChild;
    if (existingReport) {
      // Update existing report
      report = await db.report.update({
        where: {
          id: existingReport.id,
        },
        data: {
          startDate: start,
          endDate: end,
          summary,
          insights,
          recommendations,
          mealDetails,
          totalMeals,
          mealsFinished,
          mealsPartial,
          mealsRefused,
          status: "GENERATED",
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
    } else {
      // Create new report
      report = await db.report.create({
        data: {
          childId,
          reportType,
          period,
          startDate: start,
          endDate: end,
          summary,
          insights,
          recommendations,
          mealDetails,
          totalMeals,
          mealsFinished,
          mealsPartial,
          mealsRefused,
          status: "GENERATED",
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
    }

    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}

// Helper function to get week number
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

type Summary = {
  totalMeals: number;
  mealsFinished: number;
  mealsPartial: number;
  mealsRefused: number;
  finishedRate: string;
  refusedRate: string;
  mostCommonMealTime: MealTime | "N/A";
  mostCommonResponse: ChildResponse | "N/A";
};

type Insight = {
  type: "positive" | "concern";
  message: string;
};

type Recommendation = {
  category: string;
  suggestion: string;
};

type MealDetail = {
  photo: string | null;
  foodName: string;
  mealTime: MealTime;
  childResponse: ChildResponse;
  loggedAt: string;
};

// Helper function to get most common value
function getMostCommon<T extends string>(arr: T[]): T | "N/A" {
  if (arr.length === 0) return "N/A";
  const counts = arr.reduce<Record<T, number>>((acc, val) => {
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {} as Record<T, number>);
  return Object.keys(counts).reduce((a, b) => (counts[a as T] > counts[b as T] ? a : b)) as T;
}

// Generate basic insights
function generateBasicInsights(summary: Summary, child: ChildRecord): Insight[] {
  const insights: Insight[] = [];

  if (parseFloat(summary.finishedRate) >= 70) {
    insights.push({
      type: "positive",
      message: `${child.name} is doing great! They finished ${summary.finishedRate}% of their meals.`,
    });
  } else if (parseFloat(summary.finishedRate) < 50) {
    insights.push({
      type: "concern",
      message: `${child.name} finished only ${summary.finishedRate}% of meals. Consider consulting with a pediatrician.`,
    });
  }

  if (parseFloat(summary.refusedRate) > 30) {
    insights.push({
      type: "concern",
      message: `High meal refusal rate (${summary.refusedRate}%). This may indicate food preferences or feeding difficulties.`,
    });
  }

  if (summary.mostCommonResponse === "REFUSED") {
    insights.push({
      type: "concern",
      message: "Most common response is refusal. Try offering preferred foods or changing meal presentation.",
    });
  }

  return insights;
}

// Generate basic recommendations
function generateBasicRecommendations(summary: Summary, child: ChildRecord): Recommendation[] {
  const recommendations: Recommendation[] = [];

  if (parseFloat(summary.refusedRate) > 20) {
    recommendations.push({
      category: "Feeding Strategy",
      suggestion: "Try offering small portions and allowing the child to ask for more.",
    });
    recommendations.push({
      category: "Environment",
      suggestion: "Minimize distractions during mealtime (TV, toys, etc).",
    });
  }

  if (child.texturePreference === "PUREED" && child.age > 12) {
    recommendations.push({
      category: "Texture Progression",
      suggestion: "Gradually introduce more textured foods to support oral motor development.",
    });
  }

  recommendations.push({
    category: "Variety",
    suggestion: "Offer a variety of colors and food groups to ensure balanced nutrition.",
  });

  recommendations.push({
    category: "Routine",
    suggestion: "Maintain consistent meal times to establish a healthy eating routine.",
  });

  return recommendations;
}
