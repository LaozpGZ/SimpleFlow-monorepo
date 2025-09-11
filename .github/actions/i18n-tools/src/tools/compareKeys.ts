import fs from "fs"
import path from "path"

function getKeys(file: string): Set<string> {
  const content = fs.readFileSync(file, "utf-8")
  const json = JSON.parse(content) as Record<string, any>
  return new Set(Object.keys(json).map((x) => x.trim()))
}

function run() {
  const fileA = path.resolve(__dirname, "../../tmp/translation.json")
  const fileB = path.resolve(__dirname, "../../tmp/1.json")

  const keysA = getKeys(fileA)
  const keysB = getKeys(fileB)

  const onlyInA = [...keysA].filter((k) => !keysB.has(k))
  const onlyInB = [...keysB].filter((k) => !keysA.has(k))

  console.log(`Keys only in ${fileA}:`, onlyInA)
  console.log(`Keys only in ${fileB}:`, onlyInB)
}

run()
