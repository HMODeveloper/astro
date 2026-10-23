import type { RootResponse, ServerStatusQuery, ServerStatusResponse } from "@/apis"
import { H3 } from "h3"
import { endpoint } from "@/core/endpoint"
import { handler } from "@/handlers"
import { PING_CACHE } from "@/handlers/server-status/const"

export const router = new H3()

router.get("/api", endpoint<null, null, null, RootResponse>(handler.root))
router.get("/api/server/status", endpoint<null, ServerStatusQuery, null, ServerStatusResponse>(
  handler.serverStatus,
  { header: { "cache-control": PING_CACHE } },
))
router.all("/api/**", () => new Response("not found", { status: 404 }))
