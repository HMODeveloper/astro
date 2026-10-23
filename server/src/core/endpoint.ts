import type { EventHandler, H3Event } from "h3"
import { randomUUID } from "node:crypto"
import { getQuery, getRequestIP, getRouterParams } from "h3"

export interface EndpointContext<Params, Query, Payload> {
  id: string
  params: Params
  query: Query
  payload: Payload
  method: string
  url: URL
  headers: Headers
  ip: string
  signal: AbortSignal
}

export type Handler<Params, Query, Payload, Response> = (context: EndpointContext<Params, Query, Payload>) => Promise<Response>

export interface EndpointOptions {
  header?: Record<string, string>
}

export function endpoint<Params, Query, Payload, Response>(
  handler: Handler<Params, Query, Payload, Response>,
  options: EndpointOptions = {},
): EventHandler {
  const headers: Record<string, string> = { "cache-control": "no-store", ...options.header }

  return async (event: H3Event) => {
    try {
      const context: EndpointContext<Params, Query, Payload> = {
        id: randomUUID(),
        params: getRouterParams(event, { decode: true }) as unknown as Params,
        query: getQuery(event) as unknown as Query,
        payload: await readPayload(event) as Payload,
        method: event.req.method,
        url: event.url,
        headers: event.req.headers,
        ip: getRequestIP(event) ?? "",
        signal: event.req.signal,
      }

      return json(await handler(context), headers)
    }
    catch (err) {
      return text(err instanceof Error ? err.message : "unknown error", headers)
    }
  }
}

async function readPayload(event: H3Event): Promise<unknown> {
  const raw = await event.req.text()

  if (!raw)
    return undefined

  try {
    return JSON.parse(raw)
  }
  catch {
    throw new Error("invalid json body")
  }
}

function json(data: unknown, headers: Record<string, string>): Response {
  const body = JSON.stringify(data)

  return new Response(body === undefined ? "" : body, {
    status: 200,
    headers: { "content-type": "application/json; charset=utf-8", ...headers },
  })
}

function text(message: string, headers: Record<string, string>): Response {
  return new Response(message, {
    status: 400,
    headers,
  })
}
