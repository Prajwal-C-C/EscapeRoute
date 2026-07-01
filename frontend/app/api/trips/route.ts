import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';

export const dynamic = 'force-dynamic';

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

async function geocodeLocation(locationName: string): Promise<{ lat: number | null; lng: number | null }> {
  if (!locationName) return { lat: null, lng: null };

  try {
    const apiKey = process.env.GEOAPIFY_API_KEY || process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;
    if (!apiKey) return { lat: null, lng: null };

    const geoResponse = await fetch(
      `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(locationName)}&limit=1&apiKey=${apiKey}`
    );

    if (!geoResponse.ok) return { lat: null, lng: null };

    const geoData = await geoResponse.json();

    if (geoData.features?.length > 0) {
      const feature = geoData.features[0];
      return { lat: feature.properties?.lat || null, lng: feature.properties?.lon || null };
    } else {
      return { lat: null, lng: null };
    }
  } catch (geoError) {
    return { lat: null, lng: null };
  }
}

// ==========================================
// GET: Fetch ONLY the logged-in user's trips
// ==========================================
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userTrips = await prisma.trips.findMany({
      where: { user_id: userId }, // Filter securely by user_id
      orderBy: { created_at: 'desc' }
    });
    
    return NextResponse.json(userTrips);
  } catch (error) {
    console.error("❌ GET Database error:", error);
    return NextResponse.json({ error: "Failed to fetch trips" }, { status: 500 });
  }
}

// ==========================================
// POST: Save a new trip attached to the user
// ==========================================
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { 
      destination_name, origin_name, trip_type, start_date, end_date, 
      trip_days, travel_mode, interests, status, destination_lat, 
      destination_lng, origin_lat, origin_lng 
    } = body;

    let destLat = destination_lat || null;
    let destLng = destination_lng || null;
    if (!destLat && destination_name) {
      const result = await geocodeLocation(destination_name);
      destLat = result.lat;
      destLng = result.lng;
    }

    let orgLat = origin_lat || null;
    let orgLng = origin_lng || null;
    if (!orgLat && origin_name) {
      const result = await geocodeLocation(origin_name);
      orgLat = result.lat;
      orgLng = result.lng;
    }

    const tripData: any = {
      user_id: userId, // Link the trip to the active user
      destination_name: destination_name || "Unknown Destination",
      trip_days: trip_days || 1,
      travel_mode: travel_mode || null,
      interests: interests || [],
      status: status || "planning",
      trip_type: trip_type || null,
      origin_name: origin_name || null,
    };

    if (destLat !== null && destLat !== undefined) tripData.destination_lat = destLat;
    if (destLng !== null && destLng !== undefined) tripData.destination_lng = destLng;
    if (orgLat !== null && orgLat !== undefined) tripData.origin_lat = orgLat;
    if (orgLng !== null && orgLng !== undefined) tripData.origin_lng = orgLng;
    if (start_date) tripData.start_date = new Date(start_date);
    if (end_date) tripData.end_date = new Date(end_date);

    const newTrip = await prisma.trips.create({ data: tripData });

    return NextResponse.json({ success: true, trip: newTrip }, { status: 201 });
  } catch (error) {
    console.error("❌ POST Database error:", error);
    let errorMessage = "Failed to create trip";
    if (error instanceof Error) errorMessage = error.message;
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}