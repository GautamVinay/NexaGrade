import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const students = await prisma.student.findMany();

    const studentCount = students.length;

    // Sum only LeetCode scores across every student
    const totalProblemsSolved = students.reduce((acc: number, s: any) => {
      return acc + (s.leetcodeScore || 0);
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
