import fs from "fs"
import path from "path"
import { scanRepo } from "../util/scanRepo"

export async function commandHandler(args: string[]) {
  let dir: string | undefined
  let output: string | undefined

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === "--output") {
      output = args[++i]
    } else if (!dir) {
      dir = arg
    }
  }

  const target = dir ? path.resolve(dir) : process.cwd()
  const result = scanRepo(target)
  const content = JSON.stringify(result, null, 2)

  if (output) {
    fs.writeFileSync(output, content)
  } else {
    console.log(content)
  }
}
