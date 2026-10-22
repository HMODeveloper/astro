import type { RootResponse } from "@/apis"

export async function root(): Promise<RootResponse> {
  return { ok: true }
}
