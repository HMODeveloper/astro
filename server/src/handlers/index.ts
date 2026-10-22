import type { RootResponse } from "@/apis"
import type { Handler } from "@/core/types"
import { root } from "@/handlers/root"

export const handlers = {
  root: root satisfies Handler<RootResponse>,
}
