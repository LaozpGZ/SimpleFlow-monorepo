import { translateRepo } from "./util/translateRepo"

const command = process.env["INPUT_COMMAND"]

if (!command) {
  console.error("No command provided")
  process.exit(1)
}

async function run() {
  switch (command) {
    case "translate": {
      await translateRepo(process.cwd())
      break
    }
    default: {
      throw new Error(`Unknown command: ${command}`)
    }
  }
}

run()
