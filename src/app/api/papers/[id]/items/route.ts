/** @format */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// POST /api/papers/[id]/items - Add question to paper
export async function POST(
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

    const { id: paperId } = await params;
    const body = await request.json();
    const { questionId, sectionName, order, marks } = body;

    if (!questionId || !sectionName || order === undefined) {
      return NextResponse.json(
        { error: "questionId, sectionName, and order are required" },
        { status: 400 }
      );
    }

    // Check if paper exists and is not finalized
    const paper = await prisma.paper.findUnique({
      where: { id: paperId },
    });

    if (!paper) {
      return NextResponse.json({ error: "Paper not found" }, { status: 404 });
    }

    if (paper.finalized) {
      return NextResponse.json(
        { error: "Cannot add questions to a finalized paper" },
        { status: 400 }
      );
    }

    const paperItem = await prisma.paperItem.create({
      data: {
        paperId,
        questionId,
        sectionName,
        order,
        marks,
      },
      include: {
        question: true,
      },
    });

    return NextResponse.json(paperItem, { status: 201 });
  } catch (error) {
    console.error("Error adding question to paper:", error);
    return NextResponse.json(
      { error: "Failed to add question to paper" },
      { status: 500 }
    );
  }
}

// DELETE /api/papers/[id]/items?itemId=xxx - Remove question from paper
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

    const { id: paperId } = await params;
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json(
        { error: "itemId is required" },
        { status: 400 }
      );
    }

    // Check if paper is finalized
    const paperItem = await prisma.paperItem.findUnique({
      where: { id: itemId },
      include: {
        paper: true,
      },
    });

    if (!paperItem) {
      return NextResponse.json(
        { error: "Paper item not found" },
        { status: 404 }
      );
    }

    if (paperItem.paper.finalized) {
      return NextResponse.json(
        { error: "Cannot remove questions from a finalized paper" },
        { status: 400 }
      );
    }

    await prisma.paperItem.delete({
      where: { id: itemId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing question from paper:", error);
    return NextResponse.json(
      { error: "Failed to remove question from paper" },
      { status: 500 }
    );
  }
}
