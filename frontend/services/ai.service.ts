import groq from "@/lib/groq";
import { isDatabaseConnectionError } from "@/lib/database-errors";

const DEFAULT_GROQ_MODEL = "openai/gpt-oss-120b";

export async function generateItinerary(prompt: string) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is missing. Add it to frontend/.env and restart the dev server.");
  }

  const model = process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL;
  const response = await groq.chat.completions.create({
    model,
    messages: [{ role: "user", content: prompt }],
  });

  const content = response.choices[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) {
    throw new Error(`Groq model "${model}" returned an empty itinerary.`);
  }
  return content;
}

export function getItineraryErrorMessage(error: unknown) {
  const providerError = error as {
    status?: number;
    code?: string;
    error?: { code?: string };
    message?: string;
  };
  const model = process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL;
  const code = providerError?.error?.code || providerError?.code;
  const message = providerError?.message || "Unknown Groq error";

  if (isDatabaseConnectionError(error)) {
    return "Database unavailable. Check the server's network access to PostgreSQL and confirm the Neon project is active.";
  }

  if (code === "model_not_found" || providerError?.status === 404 || message.includes("model_not_found")) {
    return `Groq rejected model "${model}". Set GROQ_MODEL to a model enabled for your account (default: ${DEFAULT_GROQ_MODEL}) and restart the server.`;
  }
  if (providerError?.status === 401 || providerError?.status === 403) {
    return "Groq rejected the API key. Check GROQ_API_KEY in frontend/.env and restart the server.";
  }
  return message;
}

export function getItineraryErrorStatus(error: unknown) {
  if (isDatabaseConnectionError(error)) return 503;
  const status = (error as { status?: unknown })?.status;
  return typeof status === "number" ? 502 : 500;
}
