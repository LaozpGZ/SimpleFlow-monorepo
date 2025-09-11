import { GoogleGenAI } from "@google/genai";
import { extractJSONContent } from "./extractJSONContent";

export async function runPromptForJSON<T>({
  model,
  prompt,
}: {
  model: string;
  prompt: string;
}): Promise<T> {
  if (model.match(/^gemini/)) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Missing Gemini API key");
    const genAI = new GoogleGenAI({ apiKey });
    const response = await genAI.models.generateContent({
      model,
      contents: prompt,
    });
    const candidate = response.candidates?.[0];
    const part = candidate?.content?.parts?.[0];
    const text = typeof part?.text === "string" ? part.text : "";
    const data = extractJSONContent(text);
    if (!data) {
      throw new Error(`Failed to parse JSON: ${text}`);
    }
    return data as T;
  }
  throw new Error(`Unsupported model: ${model}`);
}
