import fs from "fs"
import path from "path"
import { I18nConfig, TranslationEntry } from "../i18n.types"
import { extractTranslationKeys } from "./extractTranslationKeys"
import ignore from "ignore"
import { parseConfig } from "./parseConfig"

export function loadConfig(root: string): I18nConfig {
  const configPath = path.join(root, ".i18n-config")
  if (!fs.existsSync(configPath)) {
    throw new Error(`Missing .i18n-config in ${root}`)
  }
  const raw = fs.readFileSync(configPath, "utf8")
  return parseConfig(raw)
}

function createIgnoreMatcher(
  root: string,
  patterns: string[] = []
): (rel: string) => boolean {
  const ig = ignore()
  const gitignore = path.join(root, ".gitignore")
  console.log(`Patterns to ignore: ${patterns.join(", ")}`)
  console.log(`Using .gitignore from ${gitignore}`)
  if (fs.existsSync(gitignore)) {
    ig.add(fs.readFileSync(gitignore, "utf8"))
  }
  if (patterns && patterns.length > 0) {
    ig.add(patterns)
  }
  return (rel: string) => ig.ignores(rel)
}

function getFiles(
  dir: string,
  root: string,
  ignores: (rel: string) => boolean
): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    const relPath = path.relative(root, fullPath).replace(/\\/g, "/")
    if (ignores(relPath)) {
      console.log(`Ignoring ${relPath}`)
      continue
    }
    if (entry.isDirectory()) {
      files.push(...getFiles(fullPath, root, ignores))
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      files.push(fullPath)
    }
  }

  return files
}

export function scanRepo(root: string): Record<string, TranslationEntry> {
  const config = loadConfig(root)
  const ignores = createIgnoreMatcher(root, config.exclude)
  const files: string[] = []

  for (const scanDir of config.scanDirs) {
    const abs = path.join(root, scanDir)
    if (fs.existsSync(abs)) {
      files.push(...getFiles(abs, root, ignores))
    }
  }

  const keyFiles: Record<string, Set<string>> = {}
  for (const file of files) {
    const content = fs.readFileSync(file, "utf8")
    const relPath = path.relative(root, file).replace(/\\/g, "/")
    extractTranslationKeys(content).forEach((k) => {
      if (!keyFiles[k]) keyFiles[k] = new Set<string>()
      keyFiles[k].add(relPath)
    })
  }

  const result: Record<string, TranslationEntry> = {}
  for (const [key, paths] of Object.entries(keyFiles)) {
    const filesList = Array.from(paths)
    result[key] = {
      key,
      value: key,
      files: filesList,
      hint: `found in ${filesList.length} of files, see ${filesList.join(",")}`,
    }
  }

  for (const rel of config.extendedTranslationFiles || []) {
    console.log(`Loading extended translations from ${rel}`)
    const abs = path.join(root, rel)
    if (!fs.existsSync(abs)) continue
    try {
      const raw = fs.readFileSync(abs, "utf8")
      const extend = JSON.parse(raw) as Record<
        string,
        Omit<TranslationEntry, "key">
      >
      for (const k of Object.keys(extend)) {
        // @ts-ignore
        extend[k].key = k.trim()
      }
      Object.assign(result, extend)
    } catch {
      console.error(`Failed to parse ${rel}`)
    }
  }
  console.log(
    `Scanned ${files.length} files, found ${
      Object.keys(result).length
    } translation keys.`
  )

  return result
}
