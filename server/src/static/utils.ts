import type { StaticAssetMeta } from "h3"
import { createReadStream } from "node:fs"
import { readFile, stat } from "node:fs/promises"
import path from "node:path"
import { Readable } from "node:stream"
import { ENV } from "@/env"
import { ASSET_MAX_AGE, DATA_MAX_AGE, HTML_MAX_AGE, IMMUTABLE_MAX_AGE, META_MAX_AGE, MIME, NOT_FOUND_FILE } from "@/static/const"

export async function getMeta(id: string): Promise<StaticAssetMeta | undefined> {
  const file = resolveFile(id)

  if (!file)
    return undefined

  try {
    const info = await stat(file)

    if (!info.isFile())
      return undefined

    return {
      type: MIME[path.extname(file).toLowerCase()],
      etag: `W/"${info.size.toString(16)}-${info.mtimeMs.toString(16)}"`,
      mtime: info.mtime,
      size: info.size,
    }
  }
  catch {
    return undefined
  }
}

export async function getContents(id: string): Promise<ReadableStream | undefined> {
  const file = resolveFile(id)

  if (!file)
    return undefined

  try {
    return Readable.toWeb(createReadStream(file)) as ReadableStream
  }
  catch {
    return undefined
  }
}

export async function notFound(): Promise<Response> {
  const file = path.join(ENV.SITE_ROOT, NOT_FOUND_FILE)

  try {
    const content = await readFile(file)
    return new Response(content, {
      status: 404,
      headers: {
        "content-type": MIME[".html"],
        "cache-control": `public, max-age=${HTML_MAX_AGE}, must-revalidate`,
      },
    })
  }
  catch {
    return new Response("not found", { status: 404 })
  }
}

export function cacheControl(pathname: string): string {
  if (pathname.startsWith("/_astro/"))
    return `public, max-age=${IMMUTABLE_MAX_AGE}, immutable`

  if (pathname.startsWith("/content/") || pathname.startsWith("/images/"))
    return `public, max-age=${ASSET_MAX_AGE}, must-revalidate`

  if (pathname.endsWith(".html"))
    return `public, max-age=${HTML_MAX_AGE}, must-revalidate`

  if (pathname.endsWith("data.json"))
    return `public, max-age=${DATA_MAX_AGE}, must-revalidate`

  if (pathname.endsWith(".xml") || pathname.endsWith(".txt"))
    return `public, max-age=${META_MAX_AGE}`

  return `public, max-age=${HTML_MAX_AGE}, must-revalidate`
}

function resolveFile(id: string): string | undefined {
  const target = path.join(ENV.SITE_ROOT, path.posix.normalize(id))

  if (target !== ENV.SITE_ROOT && !target.startsWith(ENV.SITE_ROOT + path.sep))
    return undefined

  return target
}
