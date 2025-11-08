/** @format */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// GET /api/chapters - List chapters (optionally filter by bookId)
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get("bookId");

    const chapters = await prisma.chapter.findMany({
      where: bookId ? { bookId } : undefined,
      include: {
        book: {
          include: {
            subject: {
              include: {
                class: true,
              },
            },
          },
        },
        _count: {
          select: { topics: true, questions: true },
        },
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(chapters);
  } catch (error) {
    console.error("Error fetching chapters:", error);
    return NextResponse.json(
      { error: "Failed to fetch chapters" },
      { status: 500 }
    );
  }
}

// POST /api/chapters - Create a new chapter
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, order, bookId } = body;

    if (!name || order === undefined || !bookId) {
      return NextResponse.json(
        { error: "Name, order, and bookId are required" },
        { status: 400 }
      );
    }

    const chapter = await prisma.chapter.create({
      data: {
        name,
        order,
        bookId,
      },
      include: {
        book: true,
      },
    });

    return NextResponse.json(chapter, { status: 201 });
  } catch (error) {
    console.error("Error creating chapter:", error);
    return NextResponse.json(
      { error: "Failed to create chapter" },
      { status: 500 }
    );
  }
}
