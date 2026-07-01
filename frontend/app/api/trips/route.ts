import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Initialize Prisma
const pgAdapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL as string
});
const prisma = new PrismaClient({ adapter: pgAdapter });

// ==========================================
// Helper: Geocode a location using Geoapify
// ==========================================
async function geocodeLocation(locationName: string): Promise<{ lat: number | null; lng: number | null }> {
  if (!locationName) {
    return { lat: null, lng: null };
  }

  try {
    const apiKey = process.env.GEOAPIFY_API_KEY || process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;
    
    if (!apiKey) {
      console.warn("⚠️ Geoapify API key not found");
      return { lat: null, lng: null };
    }

    const geoResponse = await fetch(
      `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
        locationName
      )}&limit=1&apiKey=${apiKey}`
    );

    if (!geoResponse.ok) {
      console.error("❌ Geoapify API error:", geoResponse.status);
      return { lat: null, lng: null };
    }

    const geoData = await geoResponse.json();

    if (geoData.features?.length > 0) {
      const feature = geoData.features[0];
      const lat = feature.properties?.lat || null;
      const lng = feature.properties?.lon || null;
      
      console.log(`✅ Geocoded "${locationName}" → (${lat}, ${lng})`);
      return { lat, lng };
    } else {
      console.warn(`⚠️ No features found for: ${locationName}`);
      return { lat: null, lng: null };
    }
  } catch (geoError) {
    console.error(`❌ Geocoding error for "${locationName}":`, geoError);
    return { lat: null, lng: null };
  }
}

// ==========================================
// GET: Fetch all saved trips
// ==========================================
export async function GET() {
  try {
    const allTrips = await prisma.trips.findMany({
      select: {
        id: true,
        destination_name: true,
        destination_lat: true,
        destination_lng: true,
        origin_name: true,
        origin_lat: true,
        origin_lng: true,
        start_date: true,
        end_date: true,
        trip_days: true,
        travel_mode: true,
        status: true,
        created_at: true,
        interests: true,
        trip_type: true,
        user_id: true,
      },
      orderBy: { created_at: 'desc' }
    });
    return NextResponse.json(allTrips);
  } catch (error) {
    console.error("❌ GET Database error:", error);
    return NextResponse.json(
      { error: "Failed to fetch trips" },
      { status: 500 }
    );
  }
}

// ==========================================
// POST: Save a new trip to the database
// ==========================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log("📥 Incoming POST data:", body);
    
    const { 
      destination_name,
      origin_name,
      trip_type,
      start_date,
      end_date,
      trip_days,
      travel_mode,
      interests,
      status,
      destination_lat,
      destination_lng,
      origin_lat,
      origin_lng
    } = body;

    // --- Geocode Destination (To Location) ---
    let destLat = destination_lat || null;
    let destLng = destination_lng || null;

    if (!destLat && destination_name) {
      const result = await geocodeLocation(destination_name);
      destLat = result.lat;
      destLng = result.lng;
    }

    // --- Geocode Origin (From Location) ---
    let orgLat = origin_lat || null;
    let orgLng = origin_lng || null;

    if (!orgLat && origin_name) {
      const result = await geocodeLocation(origin_name);
      orgLat = result.lat;
      orgLng = result.lng;
    }

    // Prepare data for database - only fields that exist in schema
    const tripData: any = {
      destination_name: destination_name || "Unknown Destination",
      trip_days: trip_days || 1,
      travel_mode: travel_mode || null,
      interests: interests || [],
      status: status || "planning",
      trip_type: trip_type || null,
      origin_name: origin_name || null,
    };

    // Add coordinates if they exist
    if (destLat !== null && destLat !== undefined) {
      tripData.destination_lat = destLat;
    }
    if (destLng !== null && destLng !== undefined) {
      tripData.destination_lng = destLng;
    }
    if (orgLat !== null && orgLat !== undefined) {
      tripData.origin_lat = orgLat;
    }
    if (orgLng !== null && orgLng !== undefined) {
      tripData.origin_lng = orgLng;
    }

    // Add dates if they exist
    if (start_date) {
      tripData.start_date = new Date(start_date);
    }
    if (end_date) {
      tripData.end_date = new Date(end_date);
    }

    console.log("💾 Saving to database:", tripData);

    // Save to database
    const newTrip = await prisma.trips.create({
      data: tripData,
    });

    console.log("✅ Trip saved successfully:", { 
      id: newTrip.id, 
      destination: newTrip.destination_name,
      origin: newTrip.origin_name
    });

    return NextResponse.json({ 
      success: true, 
      trip: newTrip 
    }, { status: 201 });

  } catch (error) {
    console.error("❌ POST Database error:", error);
    
    let errorMessage = "Failed to create trip";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
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
    console.error("❌ DELETE Database error:", error);
    return NextResponse.json(
      { error: "Failed to delete trip" },
      { status: 500 }
    );
  }
}