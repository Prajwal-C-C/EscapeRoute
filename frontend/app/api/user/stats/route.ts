import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const pgAdapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL as string
});
const prisma = new PrismaClient({ adapter: pgAdapter });

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    // @ts-ignore - session.user.id exists but type doesn't know it
    const userId = session?.user?.id || null;

    if (!userId) {
      return NextResponse.json({
        totalTrips: 0,
        countriesVisited: 0,
        totalDays: 0,
        totalAttractions: 0,
        favoriteDestinations: [],
        tripsCompleted: 0,
      });
    }

    // Get user's trips
    const trips = await prisma.trips.findMany({
      where: { user_id: userId },
      select: {
        destination_name: true,
        trip_days: true,
        status: true,
      }
    });

    // Calculate stats
    const totalTrips = trips.length;
    const totalDays = trips.reduce((acc, trip) => acc + (trip.trip_days || 0), 0);
    const tripsCompleted = trips.filter(t => t.status === 'completed').length;

    // Get unique countries
    const countries = new Set<string>();
    trips.forEach(trip => {
      if (trip.destination_name) {
        const parts = trip.destination_name.split(',');
        const country = parts.length > 1 ? parts[parts.length - 1].trim() : trip.destination_name;
        if (country) countries.add(country);
      }
    });

    // Get favorite destinations (most frequent)
    const destCount = new Map<string, number>();
    trips.forEach(trip => {
      if (trip.destination_name) {
        destCount.set(trip.destination_name, (destCount.get(trip.destination_name) || 0) + 1);
      }
    });
    const favoriteDestinations = Array.from(destCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([dest]) => dest);

    return NextResponse.json({
      totalTrips,
      countriesVisited: countries.size,
      totalDays,
      totalAttractions: totalTrips * 8, // Placeholder
      favoriteDestinations,
      tripsCompleted,
    });
  } catch (error) {
    console.error("❌ Error fetching user stats:", error);
    return NextResponse.json({
      totalTrips: 0,
      countriesVisited: 0,
      totalDays: 0,
      totalAttractions: 0,
      favoriteDestinations: [],
      tripsCompleted: 0,
    });
  }
}