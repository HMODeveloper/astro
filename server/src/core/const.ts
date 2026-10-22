import process from "node:process"

export const PORT = Number(process.env.PORT ?? 3000)
export const HOST = process.env.HOST ?? "0.0.0.0"

export const REQUEST_TIMEOUT = 15_000
export const HEADERS_TIMEOUT = 10_000
export const KEEP_ALIVE_TIMEOUT = 5_000

export const SHUTDOWN_TIMEOUT = 10_000
