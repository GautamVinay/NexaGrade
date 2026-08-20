import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { syncStudentPlatforms } from "@/lib/syncEngine";

// PATCH /api/profile — Update a student's platform link
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { raNumber, platformId, url } = body;

    if (!raNumber || !platformId) {
      return NextResponse.json(
        { error: "Missing raNumber or platformId" },
        { status: 400 }
      );
    }

    // Validate that the platformId is a real column in our Student model
    const validPlatforms = [
      "leetcode", "codeforces", "codechef", "hackerrank",
      "geeksforgeeks", "atcoder", "hackerearth", "interviewbit",
      "codewars", "topcoder",
    ];

    if (!validPlatforms.includes(platformId)) {
      return NextResponse.json(
        { error: `Invalid platform: ${platformId}` },
        { status: 400 }
      );
    }

    // Build dynamic update payload
    const updateData: Record<string, any> = {};
    // If url is empty or null, we clear the field (unlink) and reset score to 0
    if (url && url.trim() !== "") {
      updateData[platformId] = url.trim();
    } else {
      updateData[platformId] = null;
      updateData[`${platformId}Score`] = 0;
    }

    let updatedStudent = await prisma.student.update({
      where: { raNumber },
      data: updateData,
    });

    // ── ACTIVE SYNC (Instant) ──
    // The exact millisecond a student adds/edits/deletes a link, fetch new scores immediately
    try {
      console.log(`[Active Sync] Force syncing ${raNumber} after profile update...`);
      const newScores = await syncStudentPlatforms(updatedStudent);
      updatedStudent = await prisma.student.update({
        where: { raNumber },
        data: {
          ...newScores,
          lastSyncedAt: new Date(),
        },
      });
    } catch (syncErr) {
      console.error("[Active Sync] Failed during profile update:", syncErr);
      // Swallow error so the user still gets their URL saved successfully
    }

    // Return the full updated user (excluding password)
    const { password, ...safeUser } = updatedStudent as Record<string, unknown>;
    return NextResponse.json({ user: safeUser });
  } catch (error: unknown) {
    console.error("Profile update error:", error);

    // Prisma error code for Record Not Found
    if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === "P2025") {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
