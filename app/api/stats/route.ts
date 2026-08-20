import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const students = await prisma.student.findMany();

    const studentCount = students.length;

    // Sum all platform scores across every student
    const totalProblemsSolved = students.reduce((acc: number, s: any) => {
      return acc
        + (s.leetcodeScore || 0)
        + (s.codeforcesScore || 0)
        + (s.codechefScore || 0)
        + (s.hackerrankScore || 0)
        + (s.geeksforgeeksScore || 0)
        + (s.atcoderScore || 0)
        + (s.hackerearthScore || 0)
        + (s.interviewbitScore || 0)
        + (s.codewarsScore || 0)
        + (s.topcoderScore || 0);
    }, 0);

    return NextResponse.json({
      studentCount,
      totalProblemsSolved,
      colleges: 1, // SRMIST
    });
  } catch (error: unknown) {
    console.error("Stats API error:", error);
    return NextResponse.json(
      { studentCount: 0, totalProblemsSolved: 0, colleges: 1 },
      { status: 200 }
    );
  }
}
