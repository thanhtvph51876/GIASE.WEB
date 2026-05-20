import { readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"

const root = process.cwd()
const ignored = new Set([
  ".git",
  ".next",
  ".next-build",
  ".next-build-check",
  ".next-api-build",
  ".next-api-build-2",
  ".next-payment-build",
  ".next-prod",
  "node_modules",
])
const extensions = new Set([".ts", ".tsx", ".js", ".jsx"])
const violations = []

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (ignored.has(entry)) continue
    const path = join(dir, entry)
    const stat = statSync(path)
    if (stat.isDirectory()) {
      walk(path)
      continue
    }
    const ext = path.slice(path.lastIndexOf("."))
    if (!extensions.has(ext)) continue
    if (path.endsWith("scripts\\lint.mjs") || path.endsWith("scripts/lint.mjs")) continue
    const content = readFileSync(path, "utf8")
    const lines = content.split(/\r?\n/)
    lines.forEach((line, index) => {
      if (line.includes("console.log(")) {
        violations.push(`${path}:${index + 1} uses console.log`)
      }
      if (line.includes(": any") || line.includes("<any>")) {
        violations.push(`${path}:${index + 1} uses explicit any`)
      }
    })
  }
}

walk(root)

if (violations.length > 0) {
  console.error("Lightweight lint found issues:")
  for (const violation of violations) console.error(`- ${violation}`)
  process.exit(1)
}

console.log("Lightweight lint passed")
