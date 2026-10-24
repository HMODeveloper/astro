import { execFileSync } from "node:child_process"
import process from "node:process"

function git(...args) {
  return execFileSync("git", args, {
    encoding: "utf8",
    stdio: ["inherit", "pipe", "inherit"],
  }).trim()
}

function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}${month}${day}`
}

try {
  if (git("status", "--porcelain"))
    throw new Error("working tree is not clean")

  git("fetch", "--quiet", "--tags")

  const prefix = `v${formatDate(new Date())}-`
  const used = git("tag", "--list", `${prefix}*`)
    .split("\n")
    .map(tag => Number.parseInt(tag.slice(prefix.length), 10))
    .filter(index => Number.isInteger(index))

  const index = used.length > 0 ? Math.max(...used) + 1 : 1
  const tag = `${prefix}${index}`

  git("tag", tag)

  process.stdout.write(`${tag} created\n`)
  process.stdout.write(`push it: git push origin ${tag}\n`)
}
catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
  process.exit(1)
}
