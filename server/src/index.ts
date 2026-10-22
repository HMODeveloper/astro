import { createServer } from "node:http"
import process from "node:process"
import { HEADERS_TIMEOUT, HOST, KEEP_ALIVE_TIMEOUT, PORT, REQUEST_TIMEOUT, SHUTDOWN_TIMEOUT } from "@/core/const"
import { dispatch } from "@/core/dispatcher"
import { log } from "@/core/logger"

const server = createServer(dispatch)

server.requestTimeout = REQUEST_TIMEOUT
server.headersTimeout = HEADERS_TIMEOUT
server.keepAliveTimeout = KEEP_ALIVE_TIMEOUT

server.listen(PORT, HOST, () => {
  log.info(`[server] listening on http://${HOST}:${PORT}`)
})

function shutdown(): void {
  server.close(() => process.exit(0))
  setTimeout(() => process.exit(1), SHUTDOWN_TIMEOUT).unref()
}

process.on("SIGTERM", shutdown)
process.on("SIGINT", shutdown)
