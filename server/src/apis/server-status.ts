export interface ServerStatusQuery {
  id: string
}

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
