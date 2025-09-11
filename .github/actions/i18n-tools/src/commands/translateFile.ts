import fs from "fs"
import path from "path"
import { TranslationEntry, TranslationResult } from "../i18n.types"
import { translateBatch } from "../util/translateBatch"

export async function commandHandler(args: string[]) {
  let file: string | undefined
  const requirements: string[] = []
  let lang: string | undefined
  let model = "gemini-2.5-flash"

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === "--requirement" || arg === "--requirements") {
      requirements.push(args[++i] || "")
    } else if (arg === "--lang") {
      lang = args[++i]
    } else if (arg === "--model") {
      model = args[++i] || "gemini"
    } else if (!file) {
      file = arg
    }
  }

  if (!file || !lang) {
    console.log(
      "Usage:\n\n i18n-pcs translateFile [file] --lang targetLang [--requirement requirement] [--model gemini]\n"
    )
    process.exit(1)
  }

  const absFile = path.resolve(file)
  const raw = fs.readFileSync(absFile, "utf8")
  const data = JSON.parse(raw)

  let entries: TranslationEntry[]
  if (Array.isArray(data)) {
    entries = data as TranslationEntry[]
  } else {
    entries = Object.entries<any>(data).map(([key, val]) => ({
      key,
      value: typeof val === "string" ? val : val?.value || "",
      hint: val?.hint || "",
    }))
  }

  const result: TranslationResult[] = await translateBatch({
    entries,
    lang,
    requirements,
    model,
  })

  console.log(JSON.stringify(result, null, 2))
}
