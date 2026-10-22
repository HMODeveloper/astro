import process from "node:process"
import { fileURLToPath } from "node:url"

export const PORT = Number(process.env.PORT ?? 3000)
export const HOST = process.env.HOST ?? "0.0.0.0"

export const SITE_ROOT = process.env.SITE_ROOT ?? fileURLToPath(new URL("../../dist", import.meta.url))

export const REQUEST_TIMEOUT = 15_000
export const HEADERS_TIMEOUT = 10_000
export const KEEP_ALIVE_TIMEOUT = 5_000

export const SHUTDOWN_TIMEOUT = 10_000

export const IMMUTABLE_MAX_AGE = 31_536_000
export const ASSET_MAX_AGE = 604_800
export const HTML_MAX_AGE = 0
export const DATA_MAX_AGE = 60
export const META_MAX_AGE = 3600
