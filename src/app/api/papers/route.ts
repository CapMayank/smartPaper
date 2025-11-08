/** @format */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// GET /api/papers - List papers with filters
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const examGroupId = searchParams.get("examGroupId");
    const classId = searchParams.get("classId");
    const subjectId = searchParams.get("subjectId");

    const where: any = {};
    if (examGroupId) where.examGroupId = examGroupId;
    if (classId) where.classId = classId;
    if (subjectId) where.subjectId = subjectId;

    const papers = await prisma.paper.findMany({
      where,
      include: {
        examGroup: {
          include: {
            session: true,
          },
        },
        class: true,
        subject: true,
        blueprint: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: { paperItems: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(papers);
  } catch (error) {
    console.error("Error fetching papers:", error);
    return NextResponse.json(
      { error: "Failed to fetch papers" },
      { status: 500 }
    );
  }
}

// POST /api/papers - Create a new paper
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      examGroupId,
      classId,
      subjectId,
      blueprintId,
      maxMarks,
      duration,
      instructions,
    } = body;

    if (!title || !examGroupId || !classId || !subjectId || !maxMarks || !duration) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const paper = await prisma.paper.create({
      data: {
        title,
        examGroupId,
        classId,
        subjectId,
        blueprintId,
        maxMarks,
        duration,
        instructions,
        createdById: session.user.id,
      },
      include: {
        examGroup: {
          include: {
            session: true,
          },
        },
        class: true,
        subject: true,
        blueprint: true,
      },
    });

    return NextResponse.json(paper, { status: 201 });
  } catch (error) {
    console.error("Error creating paper:", error);
    return NextResponse.json(
      { error: "Failed to create paper" },
      { status: 500 }
    );
  }
}
