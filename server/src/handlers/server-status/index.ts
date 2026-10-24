import type { ServerStatusQuery, ServerStatusResponse } from "@/apis"
import type { EndpointContext } from "@/core/endpoint"
import { PING_DEADLINE, PING_TIMEOUT, SRV_TIMEOUT } from "@/handlers/server-status/const"
import { pingMinecraftServer, resolveMinecraftAddress } from "@/handlers/server-status/pinger"
import { getServerAddresses } from "@/handlers/server-status/registry"

export async function serverStatus(context: EndpointContext<null, ServerStatusQuery, null>): Promise<ServerStatusResponse> {
  const id = typeof context.query.id === "string" ? context.query.id.trim() : ""

  if (!id)
    throw new Error("missing id parameter")

  let addresses: string[] | undefined

  try {
    addresses = await getServerAddresses(id)
  }
  catch {
    throw new Error("server registry unavailable")
  }

  if (!addresses)
    throw new Error(`unknown server: ${id}`)

  if (addresses.length === 0)
    throw new Error(`server ${id} has no address`)

  const deadline = Date.now() + PING_DEADLINE
  let lastError = "All servers are offline"

  for (const address of addresses) {
    const remaining = deadline - Date.now()

    if (remaining <= 0)
      break

    const budget = Math.max(500, Math.min(PING_TIMEOUT, Math.floor((remaining - 250) / addresses.length)))
    const hostDeadline = Date.now() + budget
    const srvBudget = Math.min(SRV_TIMEOUT, budget)

    try {
      const { host, port } = await resolveMinecraftAddress(address, srvBudget)
      const left = hostDeadline - Date.now()

      if (left <= 0) {
        lastError = `no time left for ${address}`
      }
      else {
        const status = await pingMinecraftServer(host, port, { timeout: left, signal: context.signal })

        if (status.online) {
          return {
            server: id,
            host: status.host,
            port: status.port,
            latency: status.latency,
            players: status.players,
            max: status.max_players,
            description: status.motd,
          }
        }

        lastError = status.motd || lastError
      }
    }
    catch (err) {
      lastError = err instanceof Error ? err.message : lastError
    }
  }

  throw new Error(lastError)
}
