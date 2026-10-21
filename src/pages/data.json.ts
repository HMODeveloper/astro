import type { APIRoute } from "astro"
import { getCollection } from "astro:content"

type Collection = "server" | "dynamic" | "cover"

async function formatContents(collection: Collection) {
  const entries = await getCollection(collection)
  return entries.map(entry => ({
    id: entry.id,
    path: entry.filePath,
    data: entry.data,
    content: entry.body,
  }))
}

async function formetCovers() {
  const entries = await getCollection("cover")
  const item = entries[0]
  if (!item)
    return []
  return item.data.list
}

async function getDataJson() {
  const servers = await formatContents("server")
  const dynamics = await formatContents("dynamic")
  const covers = await formetCovers()
  return {
    servers,
    dynamics,
    covers,
    updated: new Date().toISOString(),
  }
}

export const GET: APIRoute = async () => {
  const data = await getDataJson()
  return new Response(JSON.stringify(data, null, 2))
}
