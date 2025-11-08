/** @format */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// GET /api/blueprints - List blueprints
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const blueprints = await prisma.blueprint.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: { papers: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(blueprints);
  } catch (error) {
    console.error("Error fetching blueprints:", error);
    return NextResponse.json(
      { error: "Failed to fetch blueprints" },
      { status: 500 }
    );
  }
}

// POST /api/blueprints - Create a new blueprint
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, sections } = body;

    if (!name || !sections) {
      return NextResponse.json(
        { error: "Name and sections are required" },
        { status: 400 }
      );
    }

    // Validate sections structure
    if (!Array.isArray(sections)) {
      return NextResponse.json(
        { error: "Sections must be an array" },
        { status: 400 }
      );
    }

    const blueprint = await prisma.blueprint.create({
      data: {
        name,
        description,
        sections,
        createdById: session.user.id,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(blueprint, { status: 201 });
  } catch (error) {
    console.error("Error creating blueprint:", error);
    return NextResponse.json(
      { error: "Failed to create blueprint" },
      { status: 500 }
    );
  }
}
