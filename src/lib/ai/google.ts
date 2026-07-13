import { createGoogleGenerativeAI } from "@ai-sdk/google";

export const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/** Gemini 3.1 Pro — gleiches Modell wie im Reps-Projekt */
export const scriptModel = google("gemini-3.1-pro-preview");
