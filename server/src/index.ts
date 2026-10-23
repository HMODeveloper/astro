import { H3, serve } from "h3"
import { ENV } from "@/env"
import { log } from "@/logger"
import { router } from "@/route"
import { staticHandler } from "@/static"

const app = new H3()

app.use("/api/**", router.handler)
app.use("/**", staticHandler)
app.use("/**", () => new Response("method not allowed", { status: 405, headers: { allow: "GET, HEAD" } }))

const server = serve(app, {
  port: ENV.PORT,
  hostname: ENV.HOST,
  silent: true,
})

server.ready().then(
  () => log.info(`[server] listening on http://${ENV.HOST}:${ENV.PORT}`),
  err => log.error("[server] failed to start", err),
)
