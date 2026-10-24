export interface ServerStatusPlayer {
  name: string
  uuid: string
}

export interface ServerStatusResponse {
  server: string
  host: string
  port: number
  latency: number
  players: ServerStatusPlayer[]
  max: number
  description: string
}

const STATUS_ENDPOINT = "/api/server/status"

const requests = new Map<string, Promise<ServerStatusResponse>>()

export function fetchServerStatus(id: string): Promise<ServerStatusResponse> {
  const cached = requests.get(id)

  if (cached)
    return cached

  const request = fetch(`${STATUS_ENDPOINT}?id=${encodeURIComponent(id)}`, {
    headers: { accept: "application/json" },
  }).then(async (res) => {
    if (!res.ok)
      throw new Error(await res.text())
    return await res.json() as ServerStatusResponse
  })

  requests.set(id, request)
  return request
}
