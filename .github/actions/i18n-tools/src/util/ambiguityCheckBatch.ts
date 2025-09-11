import { AmbiguityCheckResult } from "../i18n.types"
import { geminiAmbiguityPrompt } from "../prompts/gemini.ambiguity.prompt"
import { runPromptForJSON } from "./runPromptForJSON"

interface AmbiguityCheckEntry {
  key: string
  files: string[]
  contexts: string[]
}

function withRetry<F extends (...args: any[]) => Promise<any>>(
  fn: F,
  maxRetry = 5,
  delayMs = 500
): (...args: Parameters<F>) => Promise<Awaited<ReturnType<F>>> {
  return async (...args: Parameters<F>): Promise<Awaited<ReturnType<F>>> => {
    let lastError: unknown
    for (let attempt = 1; attempt <= maxRetry; attempt++) {
      try {
        return await fn(...args)
      } catch (err) {
        lastError = err
        console.warn(`Attempt ${attempt} failed:`, err)
        if (attempt < maxRetry) {
          await new Promise((r) => setTimeout(r, delayMs * attempt))
        }
      }
    }
    throw lastError
  }
}

async function ambiguityCheckBatch_({
  entries,
  model,
  chunkSize = 5,
  parallel = 5,
}: {
  entries: AmbiguityCheckEntry[]
  model: string
  chunkSize?: number
  parallel?: number
}): Promise<AmbiguityCheckResult[]> {
  const { default: pLimit } = await import("p-limit")
  if (!model) throw new Error("model is required")

  const chunks: AmbiguityCheckEntry[][] = []
  for (let i = 0; i < entries.length; i += chunkSize) {
    chunks.push(entries.slice(i, i + chunkSize))
  }

  const entryMap = entries.reduce((acc, e) => {
    acc[e.key] = e
    return acc
  }, {} as Record<string, AmbiguityCheckEntry>)

  console.log(
    `Checking ambiguity for ${entries.length} entries in ${chunks.length} chunks...`
  )
  let counter = 0
  const limit = pLimit(parallel)
  const results = await Promise.all(
    chunks.map((chunk) =>
      limit(async () => {
        console.log(
          `Checking chunk #${++counter} with ${chunk.length} entries...`
        )
        const prompt = geminiAmbiguityPrompt(chunk)
        return await runPromptForJSON<Record<string, AmbiguityCheckResult>>({
          model,
          prompt,
        })
      })
    )
  )

  const list: AmbiguityCheckResult[] = []
  for (const map of results) {
    for (const [key, res] of Object.entries(map)) {
      const base = entryMap[key]
      list.push({
        key,
        ambiguous: res.ambiguous,
        reason: res.reason,
        suggestions: res.suggestions,
        files: base?.files || [],
        contexts: base?.contexts || [],
      })
    }
  }

  return list
}

export const ambiguityCheckBatch = withRetry(ambiguityCheckBatch_)
