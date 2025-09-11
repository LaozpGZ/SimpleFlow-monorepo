import fs from "fs"
import path from "path"
import { I18nConfig, TranslationEntry } from "../i18n.types"
import { loadConfig, scanRepo } from "./scanRepo"
import { translateBatch } from "./translateBatch"
import { translateDryRun } from "./translateDryRun"

export async function translateRepo(root: string, dryrun = false) {
  const config = loadConfig(root)
  const map = scanRepo(root)
  const entries: TranslationEntry[] = Object.values(map)

  for (const lang of config.languages) {
    await translateRepoWithLang(root, lang, entries, config, dryrun)
  }
}

export async function translateRepoWithLang(
  root: string,
  lang: string,
  entries: TranslationEntry[],
  config: I18nConfig,
  dryrun = false
) {
  const dir = path.join(root, config.translationDir)
  const langFile = path.join(dir, `${lang}.json`)
  let existing: Record<string, string> = {}

  if (fs.existsSync(langFile)) {
    try {
      existing = JSON.parse(fs.readFileSync(langFile, "utf8"))
    } catch {
      existing = {}
    }
  }
  const existingKeys = Object.keys(existing)
  const existingSet = new Set(existingKeys)
  const entryMap = new Map(entries.map((e) => [e.key, e]))

  function isTranslated(key: string, value: string) {
    return true
    // if (config.ignores?.includes(key)) {
    //   return true
    // }
    // const entry = entryMap.get(key)!
    // if (!value.match(/^[A-z\s]+$/)) {
    //   return true
    // }
    // if (value.match(/^[A-Z\s]+$/)) {
    //   return true
    // }
    // return entry.value !== value // This means at least something changed for translation
  }

  for (const key of existingKeys) {
    if (!entries.find((e) => e.key === key)) delete existing[key]
  }

  const missing = entries.filter(
    (e) => !existingSet.has(e.key) || !isTranslated(e.key, existing[e.key])
  )

  if (dryrun) {
    const prompts = await translateDryRun({
      entries: missing,
      lang,
      model: config.model,
    })
    console.log(
      `Language ${lang} requires ${prompts} prompt${prompts === 1 ? "" : "s"}`
    )
    return
  }

  if (missing.length > 0) {
    const translated = await translateBatch({
      entries: missing,
      lang,
      model: config.model,
      requirements: config.requirements,
    })
    for (const res of translated) {
      existing[res.key] = res.translation
    }
  }

  fs.writeFileSync(langFile, JSON.stringify(existing, null, 2))
}
