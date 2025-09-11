interface AmbiguityPromptEntry {
  key: string
  files: string[]
  contexts: string[]
}

export function geminiAmbiguityPrompt(entries: AmbiguityPromptEntry[]) {
  const map: Record<string, { files: string[]; contexts: string[] }> = {}
  for (const e of entries) {
    map[e.key] = { files: e.files, contexts: e.contexts }
  }

  const prompt = `
You are an assistant that checks if translation keys are used ambiguously across multiple files.
For each key, review the provided file list and code context snippets and determine if the meaning is inconsistent or could cause confusion.
Respond ONLY with a JSON object mapping each key to its AmbiguityCheckResult.

interface AmbiguityCheckResult {
  key: string
  ambiguous: boolean 
  reason?: string // if ambiguous is true, provide a brief explanation
  suggestions?: string[] // if ambiguous is true, suggest up to 3 alternative keys to reduce ambiguity
}

Return JSON Record<string, AmbiguityCheckResult>

Analyze the following keys:
${JSON.stringify(map, null, 2)}
  `
  return prompt
}
