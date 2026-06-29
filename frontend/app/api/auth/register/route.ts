import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const pgAdapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL as string
});
const prisma = new PrismaClient({ adapter: pgAdapter });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ 
      where: { email } 
    });
    
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return NextResponse.json({ message: "User created" });
  } catch (error: any) {
    console.error("REGISTER_API_CRASH:", error); 
    
    return NextResponse.json(
      { error: "Internal Server Error. Check terminal logs." }, 
      { status: 500 }
    );
  }
}