import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';

export const dynamic = 'force-dynamic';

// Initialize Prisma
const pgAdapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL as string
});
const prisma = new PrismaClient({ adapter: pgAdapter });

export async function GET() {
  try {
    // Get all trips
    const allTrips = await prisma.trips.findMany();

    // Calculate stats
    const totalTrips = userTrips.length;
    
    // Get unique countries visited from destination_name
    const countries = new Set<string>();
    userTrips.forEach(trip => {
      if (trip.destination_name) {
        // Extract country from destination name
        const parts = trip.destination_name?.split(',') || [];
        const country = parts.length > 1 ? parts[parts.length - 1].trim() : trip.destination_name;
        if (country) countries.add(country);
      }
    });
    
    // Calculate total days traveled
    let totalDays = 0;
    userTrips.forEach(trip => {
      if (trip.trip_days) {
        totalDays += trip.trip_days;
      }
    });
    
    // Get total attractions (places) - this would need a separate query
    // For now, we'll use a placeholder or calculate from itineraries
    const totalAttractions = allTrips.reduce((acc, trip) => {
      // This would need to be calculated from itineraries
      // For now, we'll use a random number or calculate from saved trips
      return acc + 15; // Placeholder
    }, 0);

    return NextResponse.json({
      totalTrips,
      countriesVisited: countries.size,
      totalDays,
      totalAttractions,
    });
  } catch (error) {
    console.error("❌ Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}