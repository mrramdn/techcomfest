import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/jwt";

type ReportType = "DAILY" | "WEEKLY" | "MONTHLY";
type ReportWhere = {
  childId: string;
  reportType?: ReportType;
};
const REPORT_TYPES: ReportType[] = ["DAILY", "WEEKLY", "MONTHLY"];

// GET /api/reports - Get reports with filters
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
    const reportType = searchParams.get("type");

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
    const where: ReportWhere = {
      childId,
    };

    if (reportType && REPORT_TYPES.includes(reportType as ReportType)) {
      where.reportType = reportType as ReportType;
    }

    const reports = await prisma.report.findMany({
      where,
      orderBy: {
        generatedAt: "desc",
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

    return NextResponse.json({ reports });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}
