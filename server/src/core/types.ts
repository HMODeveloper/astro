import type { IncomingHttpHeaders } from "node:http"

export interface Context {
  method: string
  pathname: string
  query: URLSearchParams
  headers: IncomingHttpHeaders
  ip: string
  signal: AbortSignal
}

export type Handler<T> = (ctx: Context) => T | Promise<T>

export interface Endpoint<T> {
  method: "GET" | "POST"
  path: string
  handler: Handler<T>
}
