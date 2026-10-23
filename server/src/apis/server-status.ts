export interface ServerStatusQuery {
  id: string
}

export interface ServerStatusPlayer {
  name: string
  uuid: string
  avatar_url: string
}

export interface ServerStatusResponse {
  server: string
  host: string
  port: number
  latency: number
  players: {
    online: number
    max: number
    onlinePlayers: ServerStatusPlayer[]
  }
  description: {
    text: string
  }
}
