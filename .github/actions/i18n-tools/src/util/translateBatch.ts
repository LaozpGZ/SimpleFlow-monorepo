import {
  TranslationEntry,
  TranslationRequest,
  TranslationResult,
} from "../i18n.types"
import { geminiTranslationPrompt } from "../prompts/gemini.prompt"
import { runPromptForJSON } from "./runPromptForJSON"

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

async function translateBatch_({
  entries,
  lang,
  requirements = [],
  chunkSize = 20,
  model,
  parallel = 5,
}: TranslationRequest) {
  const { default: pLimit } = await import("p-limit")
  if (!model) throw new Error("model is required")

  const chunks: TranslationRequest["entries"][] = []
  for (let i = 0; i < entries.length; i += chunkSize) {
    chunks.push(entries.slice(i, i + chunkSize))
  }

  const entiresMap = entries.reduce((acc, v) => {
    acc[v.key] = v
    return acc
  }, {} as Record<string, TranslationEntry>)

  console.log(
    `Translating(${lang}) ${entries.length} entries in ${chunks.length} chunks...`
  )
  let counter = 0
  const limit = pLimit(parallel)
  const results = (await Promise.all(
    chunks.map((chunk) =>
      limit(async () => {
        console.log(
          `Translating${lang} chunk #${++counter} with ${
            chunk.length
          } entries...`
        )
        const prompt = geminiTranslationPrompt(chunk, lang, requirements)
        return await runPromptForJSON<Record<string, string>>({
          model,
          prompt,
        })
      })
    )
  )) as Record<string, string>[]
  const list: TranslationResult[] = []
  for (const map of results) {
    for (const [key, translation] of Object.entries(map)) {
      const entry = entiresMap[key]
      const translationResult: TranslationResult = {
        key,
        translation,
        lang,
        raw: entry.value,
      }
      list.push(translationResult)
    }
  }

  return list
}

export const translateBatch = withRetry(translateBatch_)
