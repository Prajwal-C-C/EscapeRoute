import groq from "@/lib/groq";

export async function generateItinerary(prompt: string) {
  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are an expert travel planner AI. Generate detailed, realistic, and well-structured travel itineraries.
          Always return valid JSON when asked. Provide specific place names, realistic timings, and helpful descriptions.
          Consider travel distances, opening hours, and logical grouping of attractions.
          Make sure the itinerary is practical and enjoyable for travelers.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    });

    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("AI Service Error:", error);
    throw error;
  }
}