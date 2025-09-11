import fs from "fs"
import path from "path"
import { loadConfig, scanRepo } from "../util/scanRepo"
import { ambiguityCheckBatch } from "../util/ambiguityCheckBatch"
import { TranslationEntry } from "../i18n.types"
import { ambiguityCheckDryRun } from "../util/ambiguityCheckDryRun"

function extractContexts(entry: TranslationEntry, root: string): string[] {
  const contexts: string[] = []
  if (!entry.files) return contexts
  for (const rel of entry.files) {
    const abs = path.join(root, rel)
    if (!fs.existsSync(abs)) continue
    const lines = fs.readFileSync(abs, "utf8").split(/\r?\n/)
    const idx = lines.findIndex((l) => l.includes(entry.key))
    if (idx === -1) continue
    const start = Math.max(0, idx - 2)
    const end = Math.min(lines.length, idx + 3)
    const snippet = lines.slice(start, end).join("\n")
    contexts.push(snippet)
  }
  return contexts
}

export async function commandHandler(args: string[]) {
  let dir: string | undefined
  let output: string | undefined
  let dryrun = false

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === "--output") {
      output = args[++i]
    } else if (!dir) {
      dir = arg
    }
  }

  for (const arg of args) {
    if (arg === "--dryrun") {
      dryrun = true
    } else if (!dir) dir = arg
  }

  const root = dir ? path.resolve(dir) : process.cwd()
  const config = loadConfig(root)
  const map = scanRepo(root)
  const entries = Object.values(map).filter(
    (e) => e.files && e.files.length > 1 && e.value.split(" ").length === 1
  )

  const toCheck = entries.map((e) => ({
    key: e.key,
    files: e.files!,
    contexts: extractContexts(e, root),
  }))
  console.log(`Found ${toCheck.length} keys that appear in multiple files.`)

  if (toCheck.length === 0) {
    console.log("No keys appear in multiple files.")
    return
  }

  if (dryrun) {
    const prompts = await ambiguityCheckDryRun({ entries: toCheck })
    console.log(
      `Ambiguity check requires ${prompts} prompt${prompts === 1 ? "" : "s"}`
    )
    return
  }

  const results = await ambiguityCheckBatch({
    entries: toCheck,
    model: config.model,
  })

  const ambiguous = results.filter((r) => r.ambiguous)
  const content = JSON.stringify(ambiguous, null, 2)
  if (output) {
    fs.mkdirSync(output, { recursive: true })
    const file = path.join(output, "ambiguity.json")
    fs.writeFileSync(file, content)
  } else {
    console.log(content)
  }
}
