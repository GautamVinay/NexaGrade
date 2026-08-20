import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { role, password } = body;

    if (!role || !password) {
      return NextResponse.json(
        { error: "Missing required authentication fields." },
        { status: 400 }
      );
    }

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    if (role === "student") {
      const { raNumber, name, email, branch, section } = body;

      if (!raNumber || !name || !email || !branch || !section) {
        return NextResponse.json(
          { error: "Please fill in all student registration fields." },
          { status: 400 }
        );
      }

      // Check if student already exists
      const existingStudent = await prisma.student.findFirst({
        where: {
          OR: [{ email }, { raNumber }],
        },
      });

      if (existingStudent) {
        if (existingStudent.raNumber === raNumber) {
          return NextResponse.json(
            { error: "A student with this RA Number already exists." },
            { status: 400 }
          );
        }
        return NextResponse.json(
          { error: "A student with this email address already exists." },
          { status: 400 }
        );
      }

      // Create new student with hashed password
      const newStudent = await prisma.student.create({
        data: {
          raNumber,
          name,
          email,
          password: hashedPassword,
          branch,
          section,
        },
      });

      // Exclude password from response
      const { password: _, ...userWithoutPassword } = newStudent;

      return NextResponse.json(
        {
          message: "Student registered successfully.",
          user: userWithoutPassword,
          role: "student",
        },
        { status: 201 }
      );
    } else if (role === "faculty") {
      const { facultyId, name, email, sectionInCharge } = body;

      if (!facultyId || !name || !email || !sectionInCharge) {
        return NextResponse.json(
          { error: "Please fill in all faculty registration fields." },
          { status: 400 }
        );
      }

      // Check if faculty already exists
      const existingFaculty = await prisma.faculty.findFirst({
        where: {
          OR: [{ email }, { facultyId }],
        },
      });

      if (existingFaculty) {
        if (existingFaculty.facultyId === facultyId) {
          return NextResponse.json(
            { error: "A faculty member with this Faculty ID already exists." },
            { status: 400 }
          );
        }
        return NextResponse.json(
          { error: "A faculty member with this email address already exists." },
          { status: 400 }
        );
      }

      // Create new faculty with hashed password
      const newFaculty = await prisma.faculty.create({
        data: {
          facultyId,
          name,
          email,
          password: hashedPassword,
          sectionInCharge,
        },
      });

      // Exclude password from response
      const { password: _, ...userWithoutPassword } = newFaculty;

      return NextResponse.json(
        {
          message: "Faculty registered successfully.",
          user: userWithoutPassword,
          role: "faculty",
        },
        { status: 201 }
      );
    } else {
      return NextResponse.json(
        { error: "Invalid role specified." },
        { status: 400 }
      );
    }
  } catch (error: unknown) {
    console.error("Registration API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error during registration." },
      { status: 500 }
    );
  }
}
