import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import { generateItinerary, getItineraryErrorMessage, getItineraryErrorStatus } from '@/services/ai.service';
import { getDatabaseFailure } from '@/lib/database-errors';

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
  } catch {
    return { lat: null, lng: null };
  }
}

// ==========================================
// GET: Fetch ONLY the logged-in user's trips
// ==========================================
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string } | undefined)?.id;

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
    const failure = getDatabaseFailure(error, "Failed to fetch trips");
    return NextResponse.json({ error: failure.message }, { status: failure.status });
  }
}

// ==========================================
// POST: Save a new trip attached to the user
// ==========================================
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string } | undefined)?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { 
      destination_name, origin_name, trip_type, start_date, end_date, 
      trip_days, travel_mode, interests, destination_lat,
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

    const normalizedInterests = Array.isArray(interests) ? interests.filter((item: unknown): item is string => typeof item === 'string').slice(0, 12) : [];
    const duration = Number.isInteger(Number(trip_days)) ? Math.min(Math.max(Number(trip_days), 1), 30) : 1;
    const prompt = [
      `Create a practical ${duration}-day travel itinerary for ${destination_name || 'the selected destination'}.`,
      origin_name ? `Origin: ${origin_name}.` : '',
      `Trip type: ${trip_type || 'one-way'}. Transport: ${travel_mode || 'unspecified'}.`,
      `Dates: ${start_date || 'not specified'} to ${end_date || 'not specified'}.`,
      `Interests: ${normalizedInterests.length ? normalizedInterests.join(', ') : 'general highlights, local food, and culture'}.`,
      `CRITICAL FORMATTING GUIDELINES:
- DO NOT use markdown tables or pipe columns.
- Make it less sentence-heavy: write short, punchy summary bullet points highlighting WHERE TO VISIT.
- Structure strictly day-by-day using headings: "### Day 1: [Short Theme/Title]", "### Day 2: [Short Theme/Title]", etc.
- Under each Day, provide:
  * **Places to Visit**: Comma-separated list of 3-5 key attractions or spots for the day.
  * **Morning**: 2-3 short bullet points (spot name + 1 short summary note, breakfast/coffee spot).
  * **Afternoon**: 2-3 short bullet points (spot name + 1 short summary note, lunch spot).
  * **Evening**: 2-3 short bullet points (sunset/stroll spot, dinner spot).
- Keep each bullet point brief (under 15 words) so it reads like an easy-to-scan summary of places to visit.
- Optionally include 2-3 practical tips at the end under "### Quick Travel Tips".`
    ].filter(Boolean).join('\n');
    const generatedContent = await generateItinerary(prompt);
    if (!generatedContent?.trim()) {
      return NextResponse.json({ error: 'The itinerary service returned an empty response. Please try again.' }, { status: 502 });
    }

    const tripData: Prisma.tripsUncheckedCreateInput = {
      user_id: userId, // Link the trip to the active user
      destination_name: destination_name || "Unknown Destination",
      trip_days: duration,
      travel_mode: travel_mode || null,
      interests: normalizedInterests,
      status: "planned",
      trip_type: trip_type || null,
      origin_name: origin_name || null,
      destination_lat: destLat,
      destination_lng: destLng,
      origin_lat: orgLat,
      origin_lng: orgLng,
      start_date: start_date ? new Date(start_date) : null,
      end_date: end_date ? new Date(end_date) : null,
    };

    const newTrip = await prisma.trips.create({
      data: {
        ...tripData,
        ai_recommendations: {
          create: { recommendation_type: 'itinerary', content: { text: generatedContent } },
        },
      },
    });

    return NextResponse.json({ success: true, trip: newTrip }, { status: 201 });
  } catch (error) {
    console.error("❌ POST Database error:", error);
    const failure = getDatabaseFailure(error, getItineraryErrorMessage(error));
    const status = failure.status === 503 ? 503 : getItineraryErrorStatus(error);
    return NextResponse.json({ error: failure.message }, { status });
  }
}
