/** @format */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// GET /api/papers/[id] - Get paper details with all questions
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const paper = await prisma.paper.findUnique({
      where: { id },
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
        paperItems: {
          include: {
            question: true,
          },
          orderBy: [{ sectionName: "asc" }, { order: "asc" }],
        },
      },
    });

    if (!paper) {
      return NextResponse.json({ error: "Paper not found" }, { status: 404 });
    }

    return NextResponse.json(paper);
  } catch (error) {
    console.error("Error fetching paper:", error);
    return NextResponse.json(
      { error: "Failed to fetch paper" },
      { status: 500 }
    );
  }
}

// PATCH /api/papers/[id] - Update paper
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Check if paper exists and user has permission
    const existingPaper = await prisma.paper.findUnique({
      where: { id },
    });

    if (!existingPaper) {
      return NextResponse.json({ error: "Paper not found" }, { status: 404 });
    }

    if (
      existingPaper.createdById !== session.user.id &&
      session.user.role !== "ADMIN" &&
      session.user.role !== "EXAM_HEAD"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Don't allow editing finalized papers
    if (existingPaper.finalized) {
      return NextResponse.json(
        { error: "Cannot edit a finalized paper" },
        { status: 400 }
      );
    }

    const paper = await prisma.paper.update({
      where: { id },
      data: body,
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

    return NextResponse.json(paper);
  } catch (error) {
    console.error("Error updating paper:", error);
    return NextResponse.json(
      { error: "Failed to update paper" },
      { status: 500 }
    );
  }
}

// DELETE /api/papers/[id] - Delete paper
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existingPaper = await prisma.paper.findUnique({
      where: { id },
    });

    if (!existingPaper) {
      return NextResponse.json({ error: "Paper not found" }, { status: 404 });
    }

    if (
      existingPaper.createdById !== session.user.id &&
      session.user.role !== "ADMIN" &&
      session.user.role !== "EXAM_HEAD"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.paper.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting paper:", error);
    return NextResponse.json(
      { error: "Failed to delete paper" },
      { status: 500 }
    );
  }
}
