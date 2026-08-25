import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const students = await prisma.student.findMany({
      select: {
        id: true,
        raNumber: true,
        name: true,
        email: true,
        branch: true,
        section: true,
        leetcode: true,
        codeforces: true,
        codechef: true,
        hackerrank: true,
        geeksforgeeks: true,
        atcoder: true,
        hackerearth: true,
        interviewbit: true,
        codewars: true,
        topcoder: true,
        leetcodeScore: true,
        codeforcesScore: true,
        codechefScore: true,
        hackerrankScore: true,
        geeksforgeeksScore: true,
        atcoderScore: true,
        hackerearthScore: true,
        interviewbitScore: true,
        codewarsScore: true,
        topcoderScore: true,
        lastSyncedAt: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json(students);
  } catch (error: unknown) {
    console.error("Fetch Students API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}
