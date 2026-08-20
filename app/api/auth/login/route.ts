import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { role, identifier, password } = body;

    if (!role || !identifier || !password) {
      return NextResponse.json(
        { error: "Please provide both ID/email and password." },
        { status: 400 }
      );
    }

    if (role === "student") {
      const student = await prisma.student.findFirst({
        where: {
          OR: [{ raNumber: identifier }, { email: identifier }],
        },
      });

      if (!student) {
        return NextResponse.json(
          { error: "Invalid RA Number/Email or Password." },
          { status: 401 }
        );
      }

      // Compare with bcrypt hash; fall back to plain-text for legacy accounts
      const isValidPassword = student.password.startsWith("$2")
        ? await bcrypt.compare(password, student.password)
        : password === student.password;

      if (!isValidPassword) {
        return NextResponse.json(
          { error: "Invalid RA Number/Email or Password." },
          { status: 401 }
        );
      }

      const { password: _, ...userWithoutPassword } = student;

      return NextResponse.json(
        {
          message: "Student login successful.",
          user: userWithoutPassword,
          role: "student",
        },
        { status: 200 }
      );
    } else if (role === "faculty") {
      const faculty = await prisma.faculty.findFirst({
        where: {
          OR: [{ facultyId: identifier }, { email: identifier }],
        },
      });

      if (!faculty) {
        return NextResponse.json(
          { error: "Invalid Faculty ID/Email or Password." },
          { status: 401 }
        );
      }

      // Compare with bcrypt hash; fall back to plain-text for legacy accounts
      const isValidPassword = faculty.password.startsWith("$2")
        ? await bcrypt.compare(password, faculty.password)
        : password === faculty.password;

      if (!isValidPassword) {
        return NextResponse.json(
          { error: "Invalid Faculty ID/Email or Password." },
          { status: 401 }
        );
      }

      const { password: _, ...userWithoutPassword } = faculty;

      return NextResponse.json(
        {
          message: "Faculty login successful.",
          user: userWithoutPassword,
          role: "faculty",
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: "Invalid role specified." },
        { status: 400 }
      );
    }
  } catch (error: unknown) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error during login." },
      { status: 500 }
    );
  }
}
