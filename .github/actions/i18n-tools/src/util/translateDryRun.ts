import { TranslationRequest } from "../i18n.types"

export async function translateDryRun({
  entries,
  chunkSize = 20,
}: TranslationRequest): Promise<number> {
  return Math.ceil(entries.length / chunkSize)
}
