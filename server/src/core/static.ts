import type { Stats } from "node:fs"
import type { OutgoingHttpHeaders, ServerResponse } from "node:http"
import type { Context } from "@/core/types"
import { createReadStream } from "node:fs"
import { stat } from "node:fs/promises"
import path from "node:path"
import { ASSET_MAX_AGE, DATA_MAX_AGE, HTML_MAX_AGE, IMMUTABLE_MAX_AGE, META_MAX_AGE, SITE_ROOT } from "@/core/const"
import { log } from "@/core/logger"

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".map": "application/json; charset=utf-8",
}

export async function serveStatic(res: ServerResponse, ctx: Context): Promise<void> {
  const located = await locate(ctx.pathname)

  if (!located) {
    await notFound(res)
    return
  }

  const { file, info } = located
  const etag = `W/"${info.size.toString(16)}-${info.mtimeMs.toString(16)}"`
  const cache = cacheControl(ctx.pathname, file)

  if (ctx.headers["if-none-match"] === etag) {
    res.writeHead(304, { etag, "cache-control": cache })
    res.end()
    return
  }

  const headers: OutgoingHttpHeaders = {
    "content-type": MIME[path.extname(file).toLowerCase()] ?? "application/octet-stream",
    "content-length": info.size,
    "cache-control": cache,
    etag,
    "last-modified": info.mtime.toUTCString(),
    "accept-ranges": "none",
  }

  res.writeHead(200, headers)

  if (ctx.method === "HEAD") {
    res.end()
    return
  }

  createReadStream(file)
    .on("error", (err) => {
      log.error(`[static] ${ctx.pathname} stream failed`, err)
      res.destroy()
    })
    .pipe(res)
}

async function notFound(res: ServerResponse): Promise<void> {
  const file = path.join(SITE_ROOT, "404.html")
  const info = await statFile(file)

  const cache = `public, max-age=${HTML_MAX_AGE}, must-revalidate`

  if (!info) {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8", "cache-control": cache })
    res.end("not found")
    return
  }

  res.writeHead(404, {
    "content-type": MIME[".html"],
    "content-length": info.size,
    "cache-control": cache,
  })

  createReadStream(file).on("error", () => res.destroy()).pipe(res)
}

async function locate(pathname: string): Promise<{ file: string, info: Stats } | undefined> {
  let decoded: string

  try {
    decoded = decodeURIComponent(pathname)
  }
  catch {
    return undefined
  }

  if (decoded.includes("\0"))
    return undefined

  const target = path.join(SITE_ROOT, path.posix.normalize(decoded))

  if (target !== SITE_ROOT && !target.startsWith(SITE_ROOT + path.sep))
    return undefined

  for (const candidate of [target, path.join(target, "index.html")]) {
    const info = await statFile(candidate)

    if (info)
      return { file: candidate, info }
  }

  return undefined
}

async function statFile(file: string): Promise<Stats | undefined> {
  try {
    const info = await stat(file)
    return info.isFile() ? info : undefined
  }
  catch {
    return undefined
  }
}

function cacheControl(pathname: string, file: string): string {
  if (pathname.startsWith("/_astro/"))
    return `public, max-age=${IMMUTABLE_MAX_AGE}, immutable`

  if (pathname.startsWith("/content/") || pathname.startsWith("/images/"))
    return `public, max-age=${ASSET_MAX_AGE}, must-revalidate`

  if (file.endsWith(".html"))
    return `public, max-age=${HTML_MAX_AGE}, must-revalidate`

  if (path.basename(file) === "data.json")
    return `public, max-age=${DATA_MAX_AGE}, must-revalidate`

  if (file.endsWith(".xml") || file.endsWith(".txt"))
    return `public, max-age=${META_MAX_AGE}`

  return `public, max-age=${HTML_MAX_AGE}, must-revalidate`
}
