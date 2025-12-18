import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/jwt";

// GET /api/reports/[id] - Get specific report
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

    const report = await prisma.report.findUnique({
      where: {
        id,
      },
      include: {
        child: true,
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Check if user owns this child
    if (report.child.userId !== payload.sub) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update status to VIEWED if it was GENERATED
    if (report.status === "GENERATED") {
      await prisma.report.update({
        where: { id },
        data: { status: "VIEWED" },
      });
    }

    return NextResponse.json({ report });
  } catch (error) {
    console.error("Error fetching report:", error);
    return NextResponse.json(
      { error: "Failed to fetch report" },
      { status: 500 }
    );
  }
}

// DELETE /api/reports/[id] - Delete report
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

    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        child: true,
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    if (report.child.userId !== payload.sub) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.report.delete({ where: { id } });

    return NextResponse.json({ message: "Report deleted successfully" });
  } catch (error) {
    console.error("Error deleting report:", error);
    return NextResponse.json(
      { error: "Failed to delete report" },
      { status: 500 }
    );
  }
}
