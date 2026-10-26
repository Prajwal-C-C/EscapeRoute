import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import { getDatabaseFailure } from '@/lib/database-errors';

export const dynamic = 'force-dynamic';

// Initialize Prisma
let prisma: PrismaClient;

try {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL as string
  });
  prisma = new PrismaClient({ adapter });
} catch (error) {
  console.error("❌ Failed to initialize Prisma with adapter:", error);
  prisma = new PrismaClient();
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string } | undefined)?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userTrips = await prisma.trips.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });

    // Calculate stats
    const totalTrips = userTrips.length;
    
    // Get unique countries visited from destination_name
    const countries = new Set<string>();
    userTrips.forEach(trip => {
      if (trip.destination_name) {
        // Extract country from destination name (simple approach)
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
    
    const tripIds = userTrips.map((trip) => trip.id);
    const totalAttractions = tripIds.length
      ? await prisma.day_stops.count({
          where: {
            itinerary_days: {
              is: {
                itineraries: { is: { trip_id: { in: tripIds } } },
              },
            },
          },
        })
      : 0;

    return NextResponse.json({
      totalTrips,
      countriesVisited: countries.size,
      totalDays,
      totalAttractions,
    });
  } catch (error) {
    const failure = getDatabaseFailure(error, "Failed to fetch stats");
    console.error("❌ Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: failure.message },
      { status: failure.status }
    );
  }
}
