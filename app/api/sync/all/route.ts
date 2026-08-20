import { NextResponse } from "next/server";
import  prisma  from "@/lib/prisma";
import { syncStudentPlatforms } from "@/lib/syncEngine";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { raNumber } = body;

    if (!raNumber) {
      return NextResponse.json(
        { error: "RA Number is required" },
        { status: 400 }
      );
    }

    // 1. Fetch the student to get their platform URLs
    const student = await prisma.student.findUnique({
      where: { raNumber },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    // 2. Pass student object to the sync engine (BYPASSES cooldown — manual override)
    console.log(`[Sync API] Starting MANUAL sync for student: ${raNumber}`);
    const newScores = await syncStudentPlatforms(student);
    console.log(`[Sync API] Received new scores from engine:`, newScores);

    // 3. Update the database with the fetched scores AND reset lastSyncedAt
    console.log(`[Sync API] Updating DB for ${raNumber}...`);
    const updatedStudent = await prisma.student.update({
      where: { raNumber },
      data: {
        ...newScores,
        lastSyncedAt: new Date(),
      },
    });
    console.log(`[Sync API] DB Update complete!`);

    // 4. Return the updated user (excluding password)
    const { password, ...safeUser } = updatedStudent as Record<string, unknown>;
    return NextResponse.json({ user: safeUser, message: "Sync complete" });

  } catch (error: unknown) {
    console.error("Sync API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error during sync." },
      { status: 500 }
    );
  }
}
