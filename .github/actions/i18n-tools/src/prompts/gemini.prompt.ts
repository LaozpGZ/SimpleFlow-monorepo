import { TranslationEntry } from "../i18n.types"

export function geminiTranslationPrompt(
  entries: TranslationEntry[],
  targetLang: string,
  requirements: string[] = []
) {
  // Build a map with hint included
  const map: Record<
    string,
    { translation: string; key: string; source: string; hint?: string }
  > = {}

  for (const e of entries) {
    map[e.key] = {
      key: e.key,
      source: e.value,
      translation: "",
      ...(e.hint ? { hint: e.hint } : {}),
    }
  }

  const prompt = `
    Requirements:
    ${requirements.map((r) => `- ${r}`).join("\n")}

    Respond ONLY with a JSON object mapping each key to its translated value.
    1. All keys and values must be enclosed in double quotes.
    2. If the translation requires quotes inside the value, escape them with \\".
    3. Do NOT include comments, markdown, or extra text.

    Translate the following entries to ${targetLang}.
    ${JSON.stringify(map, null, 2)}

    The Result should be a valid JSON object follow this typescript format:
      Record<string, string>
  `

  return prompt
}
