import type { H3Event } from "h3"
import { serveStatic } from "h3"
import { cacheControl, getContents, getMeta, notFound } from "@/static/utils"

export async function staticHandler(event: H3Event, next: () => unknown): Promise<unknown> {
  if (event.req.method !== "GET" && event.req.method !== "HEAD")
    return next()

  event.res.headers.set("cache-control", cacheControl(event.url.pathname))

  const response = await serveStatic(event, {
    getMeta: id => getMeta(id),
    getContents: id => getContents(id),
    fallthrough: true,
  })

  if (response)
    return response

  return notFound()
}
