import { createServer } from "node:http"
import process from "node:process"
import { HEADERS_TIMEOUT, KEEP_ALIVE_TIMEOUT, REQUEST_TIMEOUT, SHUTDOWN_TIMEOUT } from "@/core/const"
import { dispatch } from "@/core/dispatcher"
import { ENV } from "@/env"
import { log } from "@/logger"

const server = createServer(dispatch)

server.requestTimeout = REQUEST_TIMEOUT
server.headersTimeout = HEADERS_TIMEOUT
server.keepAliveTimeout = KEEP_ALIVE_TIMEOUT

server.listen(ENV.PORT, ENV.HOST, () => {
  log.info(`[server] listening on http://${ENV.HOST}:${ENV.PORT}`)
})

function shutdown(): void {
  server.close(() => process.exit(0))
  setTimeout(() => process.exit(1), SHUTDOWN_TIMEOUT).unref()
}

process.on("SIGTERM", shutdown)
process.on("SIGINT", shutdown)
