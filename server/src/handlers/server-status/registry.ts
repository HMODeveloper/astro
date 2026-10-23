import { readFile } from "node:fs/promises"
import path from "node:path"
import { ENV } from "@/env"
import { log } from "@/logger"

interface DataJsonServer {
  id: string
  data?: {
    address?: string | string[] | null
  }
}

interface DataJson {
  servers?: DataJsonServer[]
}

let registry: Map<string, string[]> | undefined

export async function getServerAddresses(id: string): Promise<string[] | undefined> {
  const map = await loadRegistry()
  return map.get(id)
}

export function listServerIds(): string[] {
  return registry ? [...registry.keys()] : []
}

async function loadRegistry(): Promise<Map<string, string[]>> {
  if (registry)
    return registry

  const file = path.join(ENV.SITE_ROOT, "data.json")
  const raw = await readFile(file, "utf8")
  const data = JSON.parse(raw) as DataJson
  const map = new Map<string, string[]>()

  for (const server of data.servers ?? []) {
    const address = server.data?.address
    const list = address === null || address === undefined
      ? []
      : Array.isArray(address) ? address : [address]

    map.set(server.id, list.filter(item => typeof item === "string" && item.length > 0))
  }

  registry = map
  log.info(`[registry] loaded ${map.size} servers`)

  return map
}
