import { NextResponse } from "next/server";
import { generateItinerary } from "@/services/ai.service";


export async function GET() {
  try {
    const response = await generateItinerary(
      "Generate a 2-day itinerary for Bangalore with historical places and food recommendations."
    );

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}