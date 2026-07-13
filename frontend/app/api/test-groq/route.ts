import { NextRequest, NextResponse } from "next/server";
import { generateItinerary } from "@/services/ai.service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { destination, days, interests, travelMode } = body;

    // Build a detailed prompt for the AI
    const prompt = `
      Generate a detailed ${days}-day itinerary for ${destination} in JSON format.
      
      Travel Preferences:
      - Interests: ${interests?.join(', ') || 'General sightseeing'}
      - Travel Mode: ${travelMode || 'Mixed'}
      
      Return the response as a valid JSON object with the following structure:
      {
        "itinerary": [
          {
            "day": 1,
            "date": "Day 1",
            "summary": "Brief overview of the day",
            "places": [
              {
                "name": "Place name",
                "description": "Brief description",
                "category": "historical|food|nature|adventure|culture|shopping|beach",
                "time": "9:00 AM",
                "duration": "2-3 hours",
                "rating": 4.5
              }
            ]
          }
        ]
      }
      
      Make sure to include a mix of attractions, restaurants, and activities that match the listed interests.
      Each day should have 3-5 places with realistic timing.
      Provide specific place names, not generic descriptions.
      Include a variety of categories.
      Make the itinerary realistic and well-paced.
    `;

    const response = await generateItinerary(prompt);

    // Try to parse JSON from the response
    let parsedData;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        parsedData = JSON.parse(response);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      // If parsing fails, return the raw response
      return NextResponse.json({
        success: true,
        data: response,
        raw: true,
      });
    }

    return NextResponse.json({
      success: true,
      data: parsedData,
    });
  } catch (error) {
    console.error('Error generating itinerary:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Please use POST method with destination data" },
    { status: 405 }
  );
}