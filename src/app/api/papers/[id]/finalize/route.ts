/** @format */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// POST /api/papers/[id]/finalize - Finalize a paper (lock it)
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

    const { id } = await params;

    const paper = await prisma.paper.findUnique({
      where: { id },
      include: {
        _count: {
          select: { paperItems: true },
        },
      },
    });

    if (!paper) {
      return NextResponse.json({ error: "Paper not found" }, { status: 404 });
    }

    if (paper.finalized) {
      return NextResponse.json(
        { error: "Paper is already finalized" },
        { status: 400 }
      );
    }

    if (paper._count.paperItems === 0) {
      return NextResponse.json(
        { error: "Cannot finalize a paper with no questions" },
        { status: 400 }
      );
    }

    const updatedPaper = await prisma.paper.update({
      where: { id },
      data: {
        finalized: true,
        finalizedAt: new Date(),
      },
      include: {
        examGroup: {
          include: {
            session: true,
          },
        },
        class: true,
        subject: true,
      },
    });

    return NextResponse.json(updatedPaper);
  } catch (error) {
    console.error("Error finalizing paper:", error);
    return NextResponse.json(
      { error: "Failed to finalize paper" },
      { status: 500 }
    );
  }
}
