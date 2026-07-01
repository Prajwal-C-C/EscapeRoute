import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";

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
// GET: Fetch a single trip securely
// ==========================================
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ tripId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    const userId = session?.user?.id;

    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const resolvedParams = await context.params;
    const tripId = resolvedParams.tripId;

    // Use findFirst because we are querying by multiple fields safely
    const trip = await prisma.trips.findFirst({
      where: {
        id: tripId,
        user_id: userId, // Ownership security check
      },
    });

    if (!trip) {
      return NextResponse.json({ error: "Trip not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json(trip);
  } catch (error) {
    console.error("❌ Error fetching specific trip:", error);
    return NextResponse.json({ error: "Failed to fetch trip details" }, { status: 500 });
  }
}

// ==========================================
// DELETE: Delete a single trip securely
// ==========================================
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ tripId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    const userId = session?.user?.id;

    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const resolvedParams = await context.params;
    const tripId = resolvedParams.tripId;

    // 1. Verify the trip exists and belongs to the user
    const existingTrip = await prisma.trips.findFirst({
      where: { 
        id: tripId,
        user_id: userId // Ownership security check
      },
    });

    if (!existingTrip) {
      return NextResponse.json({ error: "Trip not found or unauthorized" }, { status: 404 });
    }

    // 2. Delete related child records first to prevent foreign key errors
    await prisma.itineraries.deleteMany({
      where: { trip_id: tripId },
    });
    
    await prisma.ai_recommendations.deleteMany({
      where: { trip_id: tripId },
    });

    // 3. Finally, safely delete the parent trip
    await prisma.trips.delete({
      where: { id: tripId },
    });

    return NextResponse.json(
      { success: true, message: "Trip deleted successfully" }, 
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error deleting trip:", error);
    return NextResponse.json({ error: "Failed to delete trip" }, { status: 500 });
  }
}