import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Forces Next.js to skip the cache so you always see new trips

// 1. Initialize Prisma 7 Adapter
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL as string
});
const prisma = new PrismaClient({ adapter });


// ==========================================
// GET: Fetch all saved trips for the UI
// ==========================================
export async function GET() {
  try {
    const allTrips = await prisma.trips.findMany({
      orderBy: { created_at: 'desc' } // Puts the newest trips at the top of the list!
    }); 
    return NextResponse.json(allTrips);
  } catch (error) {
    console.error("GET Database error:", error);
    return NextResponse.json({ error: "Failed to fetch trips" }, { status: 500 });
  }
}


// ==========================================
// POST: Save a new trip to the database
// ==========================================
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { destination, duration, budget, interests, transport, pace, wakeUp } = body;

    // Fetch Latitude and Longitude using Nominatim API
    const geoResponse = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(destination)}&format=json&limit=1`,
      { headers: { 'User-Agent': 'EscapeRoute_App' } }
    );
    const geoData = await geoResponse.json();

    let lat = null;
    let lng = null;

    if (geoData && geoData.length > 0) {
      lat = parseFloat(geoData[0].lat);
      lng = parseFloat(geoData[0].lon);
    }

    // Save everything to the PostgreSQL Database
    const newTrip = await prisma.trips.create({
      data: {
        destination_name: destination,
        destination_lat: lat,
        destination_lng: lng,
        trip_days: duration,
        travel_mode: transport,
        budget: budget,
        pace: pace,
        wake_up: wakeUp,
        interests: interests,
      },
    });

    return NextResponse.json({ success: true, trip: newTrip });

  } catch (error) {
    console.error("POST Database error:", error);
    return NextResponse.json({ error: "Failed to create trip" }, { status: 500 });
  }
}