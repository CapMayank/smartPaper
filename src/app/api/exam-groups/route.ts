/** @format */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// GET /api/exam-groups - List exam groups (optionally filter by sessionId)
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    const examGroups = await prisma.examGroup.findMany({
      where: sessionId ? { sessionId } : undefined,
      include: {
        session: true,
        _count: {
          select: { papers: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(examGroups);
  } catch (error) {
    console.error("Error fetching exam groups:", error);
    return NextResponse.json(
      { error: "Failed to fetch exam groups" },
      { status: 500 }
    );
  }
}

// POST /api/exam-groups - Create a new exam group
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "EXAM_HEAD")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { name, sessionId } = body;

    if (!name || !sessionId) {
      return NextResponse.json(
        { error: "Name and sessionId are required" },
        { status: 400 }
      );
    }

    const examGroup = await prisma.examGroup.create({
      data: {
        name,
        sessionId,
      },
      include: {
        session: true,
      },
    });

    return NextResponse.json(examGroup, { status: 201 });
  } catch (error) {
    console.error("Error creating exam group:", error);
    return NextResponse.json(
      { error: "Failed to create exam group" },
      { status: 500 }
    );
  }
}
