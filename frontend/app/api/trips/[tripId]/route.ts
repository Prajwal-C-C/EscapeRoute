import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';

// Initialize Prisma safely
let prisma: PrismaClient;
try {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL as string
  });
  prisma = new PrismaClient({ adapter });
} catch (error) {
  prisma = new PrismaClient();
}

// ==========================================
// GET: Fetch a single trip by ID (For View Details)
// ==========================================
// ==========================================
// GET: Fetch a single trip by ID (For View Details)
// ==========================================
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ tripId: string }> | { tripId: string } }
) {
  try {
    // 1. Await params (Required for newer Next.js versions)
    const resolvedParams = await context.params;
    const tripId = resolvedParams.tripId;

    const trip = await prisma.trips.findUnique({
      where: {
        id: tripId,
      },
    });

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    return NextResponse.json(trip);
  } catch (error) {
    console.error("❌ Error fetching specific trip:", error);
    return NextResponse.json(
      { error: "Failed to fetch trip details" },
      { status: 500 }
    );
  }
}
// ==========================================
// DELETE: Delete a single trip by ID
// ==========================================
// ==========================================
// DELETE: Delete a single trip by ID
// ==========================================
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ tripId: string }> | { tripId: string } } 
) {
  try {
    // 1. Await params (Required for newer Next.js versions)
    const resolvedParams = await context.params;
    const tripId = resolvedParams.tripId;

    // 2. Verify the trip exists
    const existingTrip = await prisma.trips.findUnique({
      where: { id: tripId },
    });

    if (!existingTrip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    // 3. FIX: Delete related child records FIRST
    // This prevents the PostgreSQL Foreign Key Constraint violation
    await prisma.itineraries.deleteMany({
      where: { trip_id: tripId },
    });
    
    await prisma.ai_recommendations.deleteMany({
      where: { trip_id: tripId },
    });

    // 4. Finally, safely delete the parent trip
    await prisma.trips.delete({
      where: { id: tripId },
    });

    console.log(`🗑️ Deleted trip ID: ${tripId}`);
    return NextResponse.json(
      { success: true, message: "Trip deleted successfully" }, 
      { status: 200 }
    );

  } catch (error) {
    console.error("❌ Error deleting trip:", error);
    return NextResponse.json(
      { error: "Failed to delete trip" },
      { status: 500 }
    );
  }
}