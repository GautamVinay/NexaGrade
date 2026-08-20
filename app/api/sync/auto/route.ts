import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { syncStudentPlatforms } from "@/lib/syncEngine";

const SYNC_COOLDOWN_MS = 12 * 60 * 60 * 1000; // 12 hours

export async function POST(request: Request) {
  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch (e) {
      // Empty or malformed body — return OK silently
      return NextResponse.json({ synced: false, message: "No body provided" }, { status: 200 });
    }
    const { raNumber } = body;

    if (!raNumber) {
      return NextResponse.json(
        { error: "RA Number is required" },
        { status: 400 }
      );
    }

    // 1. Fetch the student record
    const student = await prisma.student.findUnique({
      where: { raNumber },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    // 2. Check cooldown — if data was synced less than 1 hour ago, skip
    const lastSynced = student.lastSyncedAt;
    if (lastSynced) {
      const elapsed = Date.now() - new Date(lastSynced).getTime();
      if (elapsed < SYNC_COOLDOWN_MS) {
        const minutesRemaining = Math.ceil((SYNC_COOLDOWN_MS - elapsed) / 60000);
        console.log(`[AutoSync] Data is fresh for ${raNumber}, cooldown: ${minutesRemaining}m remaining`);

        // Return current data without hitting external APIs
        const { password, ...safeUser } = student as Record<string, unknown>;
        return NextResponse.json({
          user: safeUser,
          synced: false,
          message: `Data is fresh. Next sync available in ~${minutesRemaining} minutes.`,
        });
      }
    }

    // 3. Data is stale (or never synced) — run full platform fetch
    console.log(`[AutoSync] Data is stale for ${raNumber}, running sync...`);
    const newScores = await syncStudentPlatforms(student);
    console.log(`[AutoSync] Fetched scores:`, newScores);

    // 4. Update DB with new scores + reset cooldown timestamp
    const updatedStudent = await prisma.student.update({
      where: { raNumber },
      data: {
        ...newScores,
        lastSyncedAt: new Date(),
      },
    });
    console.log(`[AutoSync] DB updated for ${raNumber}`);

    // 5. Return updated user (excluding password)
    const { password, ...safeUser } = updatedStudent as Record<string, unknown>;
    return NextResponse.json({
      user: safeUser,
      synced: true,
      message: "Auto-sync complete. Scores updated.",
    });

  } catch (error: unknown) {
    console.error("[AutoSync] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error during auto-sync." },
      { status: 500 }
    );
  }
}
