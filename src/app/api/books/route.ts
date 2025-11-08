/** @format */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// GET /api/books - List books (optionally filter by subjectId)
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get("subjectId");

    const books = await prisma.book.findMany({
      where: subjectId ? { subjectId } : undefined,
      include: {
        subject: {
          include: {
            class: true,
          },
        },
        _count: {
          select: { chapters: true, questions: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(books);
  } catch (error) {
    console.error("Error fetching books:", error);
    return NextResponse.json(
      { error: "Failed to fetch books" },
      { status: 500 }
    );
  }
}

// POST /api/books - Create a new book
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "EXAM_HEAD")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { name, subjectId } = body;

    if (!name || !subjectId) {
      return NextResponse.json(
        { error: "Name and subjectId are required" },
        { status: 400 }
      );
    }

    const book = await prisma.book.create({
      data: {
        name,
        subjectId,
      },
      include: {
        subject: {
          include: {
            class: true,
          },
        },
      },
    });

    return NextResponse.json(book, { status: 201 });
  } catch (error) {
    console.error("Error creating book:", error);
    return NextResponse.json(
      { error: "Failed to create book" },
      { status: 500 }
    );
  }
}
