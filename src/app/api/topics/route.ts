/** @format */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// GET /api/topics - List topics (optionally filter by chapterId)
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const chapterId = searchParams.get("chapterId");

    const topics = await prisma.topic.findMany({
      where: chapterId ? { chapterId } : undefined,
      include: {
        chapter: {
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
          },
        },
        _count: {
          select: { questions: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(topics);
  } catch (error) {
    console.error("Error fetching topics:", error);
    return NextResponse.json(
      { error: "Failed to fetch topics" },
      { status: 500 }
    );
  }
}

// POST /api/topics - Create a new topic
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, chapterId } = body;

    if (!name || !chapterId) {
      return NextResponse.json(
        { error: "Name and chapterId are required" },
        { status: 400 }
      );
    }

    const topic = await prisma.topic.create({
      data: {
        name,
        chapterId,
      },
      include: {
        chapter: {
          include: {
            book: true,
          },
        },
      },
    });

    return NextResponse.json(topic, { status: 201 });
  } catch (error) {
    console.error("Error creating topic:", error);
    return NextResponse.json(
      { error: "Failed to create topic" },
      { status: 500 }
    );
  }
}
