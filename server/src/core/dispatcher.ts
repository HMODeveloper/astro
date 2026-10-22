import type { IncomingMessage, ServerResponse } from "node:http"
import type { Context } from "@/core/types"
import { Buffer } from "node:buffer"
import { log } from "@/logger"
import { routes } from "@/route"
import { serveStatic } from "@/static"

export function dispatch(req: IncomingMessage, res: ServerResponse): void {
  const controller = new AbortController()
  res.on("close", () => {
    if (!res.writableEnded)
      controller.abort()
  })

  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`)

  const ctx: Context = {
    method: req.method ?? "GET",
    pathname: url.pathname,
    query: url.searchParams,
    headers: req.headers,
    ip: ip(req),
    signal: controller.signal,
  }

  void handle(ctx, req.method ?? "GET", res)
}

async function handle(ctx: Context, method: string, res: ServerResponse): Promise<void> {
  const endpoint = routes.find(r => r.path === ctx.pathname && r.method === method)

  if (!endpoint) {
    if (ctx.pathname === "/api" || ctx.pathname.startsWith("/api/")) {
      send(res, 400, { error: "not found" })
      return
    }

    await serveStatic(res, ctx)
    return
  }

  const started = performance.now()

  try {
    send(res, 200, await endpoint.handler(ctx))
  }
  catch (err) {
    log.error(`[api] ${method} ${ctx.pathname} failed`, err)
    send(res, 400, { error: err instanceof Error ? err.message : "unknown error" })
  }
  finally {
    log.info(`[api] ${method} ${ctx.pathname} ${res.statusCode} ${Math.round(performance.now() - started)}ms`)
  }
}

function send(res: ServerResponse, status: 200 | 400, body: unknown): void {
  const data = JSON.stringify(body)

  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(data),
    "cache-control": "no-store",
  })

  res.end(data)
}

function ip(req: IncomingMessage): string {
  const header = req.headers["x-forwarded-for"]
  const value = Array.isArray(header) ? header[0] : header

  return value?.split(",")[0]?.trim() || req.socket.remoteAddress || ""
}
