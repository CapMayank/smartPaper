/** @format */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// GET /api/questions - List/search questions with filters
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
    const chapterId = searchParams.get("chapterId");
    const topicId = searchParams.get("topicId");
    const type = searchParams.get("type");
    const language = searchParams.get("language");
    const difficulty = searchParams.get("difficulty");
    const marks = searchParams.get("marks");
    const searchText = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = {};

    if (bookId) where.bookId = bookId;
    if (chapterId) where.chapterId = chapterId;
    if (topicId) where.topicId = topicId;
    if (type) where.type = type;
    if (language) where.language = language;
    if (difficulty) where.difficulty = difficulty;
    if (marks) where.marks = parseInt(marks);
    
    // Full-text search on question text
    if (searchText) {
      where.OR = [
        { text: { contains: searchText, mode: "insensitive" } },
        { tags: { has: searchText } },
      ];
    }

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
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
          chapter: true,
          topic: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.question.count({ where }),
    ]);

    return NextResponse.json({
      questions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}

// POST /api/questions - Create a new question
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
      text,
      type,
      language,
      difficulty,
      marks,
      tags,
      options,
      correctAnswer,
      imageUrl,
      passage,
      subQuestions,
      bookId,
      chapterId,
      topicId,
    } = body;

    if (!text || !type || !marks) {
      return NextResponse.json(
        { error: "Text, type, and marks are required" },
        { status: 400 }
      );
    }

    const question = await prisma.question.create({
      data: {
        text,
        type,
        language: language || "ENGLISH",
        difficulty: difficulty || "MEDIUM",
        marks,
        tags: tags || [],
        options: options || [],
        correctAnswer,
        imageUrl,
        passage,
        subQuestions: subQuestions || [],
        bookId,
        chapterId,
        topicId,
      },
      include: {
        book: true,
        chapter: true,
        topic: true,
      },
    });

    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json(
      { error: "Failed to create question" },
      { status: 500 }
    );
  }
}
