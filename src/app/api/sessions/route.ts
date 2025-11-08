/** @format */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// GET /api/sessions - List all academic sessions
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessions = await prisma.academicSession.findMany({
      orderBy: { startYear: "desc" },
      include: {
        _count: {
          select: { examGroups: true },
        },
      },
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}

// POST /api/sessions - Create a new academic session
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "EXAM_HEAD")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { name, startYear, endYear, isActive } = body;

    if (!name || !startYear || !endYear) {
      return NextResponse.json(
        { error: "Name, start year, and end year are required" },
        { status: 400 }
      );
    }

    const academicSession = await prisma.academicSession.create({
      data: {
        name,
        startYear,
        endYear,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(academicSession, { status: 201 });
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}
