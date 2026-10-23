import { H3, serve } from "h3"
import { ENV } from "@/env"
import { log } from "@/logger"
import { router } from "@/route"

const app = new H3()

app.use("/api/**", router.handler)

const server = serve(app, {
  port: ENV.PORT,
  hostname: ENV.HOST,
  silent: true,
})

server.ready().then(
  () => log.info(`[server] listening on http://${ENV.HOST}:${ENV.PORT}`),
  err => log.error("[server] failed to start", err),
)
