import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { NextResponse } from 'next/server';

// 1. Give Prisma the specific PostgreSQL connection instructions
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL as string
});

// 2. Instantiate the Prisma Client WITH the adapter (The Chef now has a stove!)
const prisma = new PrismaClient({ adapter });

export async function GET() {
  try {
    // 3. Ask Prisma to get every single row from the 'trips' table
    const allTrips = await prisma.trips.findMany(); 
    
    // 4. Serve the data back to the frontend as JSON
    return NextResponse.json(allTrips);
    
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Failed to fetch trips" }, { status: 500 });
  }
}