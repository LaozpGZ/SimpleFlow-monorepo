#!/usr/bin/env node
import fs from "fs"
import path from "path"

type CommandHandler = (args: string[]) => Promise<void>

async function main() {
  const args = process.argv.slice(2)
  const command = args.shift()

  const commandsDir = path.join(__dirname, "commands")
  const handlers: Record<string, CommandHandler> = {}
  for (const file of fs.readdirSync(commandsDir)) {
    if (!file.endsWith(".js") && !file.endsWith(".ts")) continue
    const name = file.match(/^(.*)\.(js|ts)$/)?.[1]
    if (!name) {
      continue
    }
    const mod = await import(`./commands/${name}`)
    if (typeof mod.commandHandler === "function") {
      handlers[name] = mod.commandHandler
    }
  }

  if (command && handlers[command]) {
    await handlers[command](args)
    return
  }

  console.log(
    `Usage:
 i18n-pcs scan [dir] [--output file]
 i18n-pcs translate [dir] [--dryrun]
 i18n-pcs translateFile [file] --lang targetLang [--requirement requirement] [--model gemini]
 i18n-pcs ambiguity [dir] [--output dir] [--dryrun]
 `
  )
  process.exit(1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
