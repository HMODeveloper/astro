export interface Context {
  method: string
  pathname: string
  query: URLSearchParams
  ip: string
  signal: AbortSignal
}

export type Handler<T> = (ctx: Context) => T | Promise<T>

export interface Endpoint<T> {
  method: "GET" | "POST"
  path: string
  handler: Handler<T>
}
