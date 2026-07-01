import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Initialize Prisma
const pgAdapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL as string
});
const prisma = new PrismaClient({ adapter: pgAdapter });

export async function GET() {
  try {
    // Get all trips - select only fields that exist in your schema
    const allTrips = await prisma.trips.findMany({
      select: {
        id: true,
        destination_name: true,
        trip_days: true,
        start_date: true,
        end_date: true,
        status: true,
        created_at: true,
        interests: true,
        travel_mode: true,
        // Only select fields that exist in your schema
      }
    });

    // Calculate stats
    const totalTrips = allTrips.length;
    
    // Get unique countries visited from destination_name
    const countries = new Set<string>();
    allTrips.forEach(trip => {
      if (trip.destination_name) {
        // Extract country from destination name
        const parts = trip.destination_name?.split(',') || [];
        const country = parts.length > 1 ? parts[parts.length - 1].trim() : trip.destination_name;
        if (country) countries.add(country);
      }
    });
    
    // Calculate total days traveled
    let totalDays = 0;
    allTrips.forEach(trip => {
      if (trip.trip_days) {
        totalDays += trip.trip_days;
      }
    });
    
    // Get total attractions (places) - placeholder for now
    // You can calculate this from itineraries if you have that data
    const totalAttractions = allTrips.reduce((acc, trip) => {
      // Placeholder - replace with actual calculation
      return acc + 15;
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