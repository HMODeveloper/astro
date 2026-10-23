import type { RootResponse } from "@/apis"
import { H3 } from "h3"
import { endpoint } from "@/core/endpoint"
import { handler } from "@/handlers"

export const router = new H3()

router.get("/api", endpoint<null, null, null, RootResponse>(handler.root))
