import type { RootResponse } from "@/apis"
import type { EndpointContext } from "@/core/endpoint"

export async function root(_: EndpointContext<null, null, null>): Promise<RootResponse> {
  return { ok: true }
}
