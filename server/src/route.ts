import type { RootResponse } from "@/apis"
import type { Endpoint } from "@/core/types"
import { handlers } from "@/handlers"

const api: Endpoint<RootResponse> = {
  method: "GET",
  path: "/api",
  handler: handlers.root,
}

export const routes: Endpoint<unknown>[] = [api]
