import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Initialize Prisma
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL as string
});
const prisma = new PrismaClient({ adapter });

// ==========================================
// GET: Fetch all saved trips
// ==========================================
export async function GET() {
  try {
    const allTrips = await prisma.trips.findMany({
      orderBy: { created_at: 'desc' }
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
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Destructure all fields from the request body
    const { 
      destination_name,
      origin_name,
      trip_type,
      start_date,
      end_date,
      trip_days,
      travel_mode,
      budget,
      pace,
      wake_up,
      interests,
      status
    } = body;

    let lat = null;
    let lng = null;

    // Fetch Latitude and Longitude using Geoapify API
    if (destination_name) {
      try {
        const geoResponse = await fetch(
          `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
            destination_name
          )}&apiKey=${process.env.GEOAPIFY_API_KEY}`
        );

        const geoData = await geoResponse.json();

        if (geoData.features?.length > 0) {
          lat = geoData.features[0].properties.lat;
          lng = geoData.features[0].properties.lon;
        }
      } catch (geoError) {
        console.error("Geocoding error:", geoError);
        // Continue without lat/lng if geocoding fails
      }
    }

    // Prepare data for database
    const tripData: any = {
      destination_name: destination_name || "Unknown Destination",
      destination_lat: lat,
      destination_lng: lng,
      trip_days: trip_days || 1,
      travel_mode: travel_mode || null,
      budget: budget || null,
      pace: pace || null,
      wake_up: wake_up || null,
      interests: interests || [],
      status: status || "planning",
    };

    // Add optional fields if they exist
    if (origin_name) tripData.origin_name = origin_name;
    if (trip_type) tripData.trip_type = trip_type;
    if (start_date) tripData.start_date = new Date(start_date);
    if (end_date) tripData.end_date = new Date(end_date);

    // Save to database
    const newTrip = await prisma.trips.create({
      data: tripData,
    });

    return NextResponse.json({ 
      success: true, 
      trip: newTrip 
    }, { status: 201 });

  } catch (error) {
    console.error("POST Database error:", error);
    return NextResponse.json({ 
      error: "Failed to create trip",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

// ==========================================
// DELETE: Delete a trip
// ==========================================
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: "Trip ID is required" },
        { status: 400 }
      );
    }

    await prisma.trips.delete({
      where: { id },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Trip deleted successfully" 
    });

  } catch (error) {
    console.error("DELETE Database error:", error);
    return NextResponse.json(
      { error: "Failed to delete trip" },
      { status: 500 }
    );
  }
}