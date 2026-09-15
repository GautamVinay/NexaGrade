import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * PUT /api/profile/update
 *
 * Scoped student profile update — ONLY updates name, email, branch, and
 * section for the given raNumber. All other student fields (password,
 * raNumber, platform links, scores, etc.) are structurally excluded from
 * this endpoint and cannot be modified here.
 */
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { raNumber, name, email, branch, section } = body;

    // ── Guard: raNumber is required to identify the row ──
    if (!raNumber || typeof raNumber !== "string" || raNumber.trim() === "") {
      return NextResponse.json(
        { error: "Missing or invalid raNumber." },
        { status: 400 }
      );
    }

    // ── Guard: At least one editable field must be present ──
    const hasAnyField =
      name !== undefined ||
      email !== undefined ||
      branch !== undefined ||
      section !== undefined;

    if (!hasAnyField) {
      return NextResponse.json(
        { error: "No editable fields provided." },
        { status: 400 }
      );
    }

    // ── Validate individual fields if provided ──
    if (name !== undefined && (typeof name !== "string" || name.trim() === "")) {
      return NextResponse.json({ error: "Name cannot be empty." }, { status: 400 });
    }
    if (email !== undefined && (typeof email !== "string" || !email.includes("@"))) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }
    if (branch !== undefined && (typeof branch !== "string" || branch.trim() === "")) {
      return NextResponse.json({ error: "Course cannot be empty." }, { status: 400 });
    }
    if (section !== undefined && (typeof section !== "string" || section.trim() === "")) {
      return NextResponse.json({ error: "Section cannot be empty." }, { status: 400 });
    }

    // ── Strict whitelist: ONLY these four fields reach the DB ──
    // This object is hand-built — no spread of `body`, no dynamic keys.
    const whitelistedData: {
      name?: string;
      email?: string;
      branch?: string;
      section?: string;
    } = {};

    if (name !== undefined)    whitelistedData.name    = name.trim();
    if (email !== undefined)   whitelistedData.email   = email.trim().toLowerCase();
    if (branch !== undefined)  whitelistedData.branch  = branch.trim();
    if (section !== undefined) whitelistedData.section = section.trim();

    // ── Prisma UPDATE — scoped to the exact student row by raNumber ──
    const updatedStudent = await prisma.student.update({
      where: { raNumber: raNumber.trim() },
      data: whitelistedData,
    });

    // ── Return safe user (strip password) ──
    const { password, ...safeUser } = updatedStudent as Record<string, unknown>;
    return NextResponse.json({ user: safeUser }, { status: 200 });
  } catch (error: unknown) {
    console.error("[PUT /api/profile/update] Error:", error);

    // Prisma: record not found
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2025"
    ) {
      return NextResponse.json({ error: "Student not found." }, { status: 404 });
    }

    // Prisma: unique constraint violation (e.g., duplicate email)
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "That email is already in use by another account." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update profile. Please try again." },
      { status: 500 }
    );
  }
}
