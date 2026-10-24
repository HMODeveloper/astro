import type { Socket } from "node:net"
import { Buffer } from "node:buffer"
import { Resolver } from "node:dns/promises"
import { connect } from "node:net"
import { PING_TIMEOUT } from "@/handlers/server-status/const"
import { log } from "@/logger"

const PROTOCOL_VERSION = 765
const DEFAULT_PORT = 25565
const PUBLIC_RESOLVERS = ["223.5.5.5", "8.8.8.8"]

export interface MinecraftPlayer {
  name: string
  uuid: string
}

export interface MinecraftStatus {
  online: boolean
  host: string
  port: number
  version: string
  motd: string
  max_players: number
  latency: number
  protocol_version: number
  players: MinecraftPlayer[]
}

export interface MinecraftAddress {
  host: string
  port: number
}

export interface PingOptions {
  timeout?: number
  signal?: AbortSignal
}

export async function resolveMinecraftAddress(address: string, timeout: number): Promise<MinecraftAddress> {
  const [rawHost = "", rawPort] = address.split(":")
  const host = rawHost.trim()
  const explicitPort = rawPort ? Number.parseInt(rawPort, 10) : Number.NaN

  if (Number.isInteger(explicitPort) && explicitPort > 0)
    return { host, port: explicitPort }

  const records = await resolveSrvRecords(host, timeout)

  if (records.length > 0) {
    const sorted = [...records].sort((a, b) => a.priority - b.priority || b.weight - a.weight)
    const [record] = sorted
    if (record)
      return { host: record.name.replace(/\.$/, ""), port: record.port }
  }

  return { host, port: DEFAULT_PORT }
}

export function pingMinecraftServer(host: string, port: number, options: PingOptions = {}): Promise<MinecraftStatus> {
  const { timeout = PING_TIMEOUT, signal } = options
  const startedAt = Date.now()
  const timer = AbortSignal.timeout(timeout)
  const merged = signal ? AbortSignal.any([signal, timer]) : timer

  return new Promise<MinecraftStatus>((resolve) => {
    if (merged.aborted) {
      resolve(offlineStatus(host, port))
      return
    }

    const socket: Socket = connect({ host, port })
    let settled = false
    let accumulated = Buffer.alloc(0)
    let expectedLength = -1
    let abortHandler: (() => void) | undefined

    const settle = (status: MinecraftStatus): void => {
      if (settled)
        return
      settled = true
      if (abortHandler)
        merged.removeEventListener("abort", abortHandler)
      socket.destroy()
      resolve(status)
    }

    abortHandler = () => settle(offlineStatus(host, port))

    merged.addEventListener("abort", abortHandler, { once: true })
    socket.setTimeout(timeout)

    socket.on("connect", () => {
      try {
        socket.write(buildHandshake(host, port))
        socket.write(buildStatusRequest())
      }
      catch (err) {
        log.error(`[ping] ${host}:${port} send failed`, err)
        settle(offlineStatus(host, port))
      }
    })

    socket.on("data", (chunk: Buffer) => {
      accumulated = Buffer.concat([accumulated, chunk])

      try {
        if (expectedLength === -1) {
          const { value: packetLength, length: lengthLength } = readVarInt(accumulated, 0)
          expectedLength = packetLength + lengthLength
        }

        if (accumulated.length < expectedLength)
          return

        settle(parseStatus(accumulated, host, port, Date.now() - startedAt))
      }
      catch (err) {
        if (err instanceof RangeError)
          return
        log.error(`[ping] ${host}:${port} parse failed`, err)
        settle(offlineStatus(host, port))
      }
    })

    socket.on("timeout", () => {
      log.error(`[ping] ${host}:${port} timeout after ${timeout}ms`)
      settle(offlineStatus(host, port))
    })

    socket.on("error", (err) => {
      log.error(`[ping] ${host}:${port} ${err.message}`)
      settle(offlineStatus(host, port))
    })
  })
}

async function resolveSrvRecords(host: string, timeout: number): Promise<{ name: string, port: number, priority: number, weight: number }[]> {
  const query = `_minecraft._tcp.${host}`
  const primary = Math.max(100, Math.floor(timeout * 2 / 3))
  const fallback = Math.max(100, Math.floor(timeout / 3))

  try {
    const resolver = new Resolver({ timeout: primary, tries: 1 })
    return await resolver.resolveSrv(query)
  }
  catch {
    try {
      const resolver = new Resolver({ timeout: fallback, tries: 1 })
      resolver.setServers(PUBLIC_RESOLVERS)
      return await resolver.resolveSrv(query)
    }
    catch (err) {
      log.info(`[ping] srv lookup failed for ${host}: ${err instanceof Error ? err.message : String(err)}`)
      return []
    }
  }
}

function parseStatus(data: Buffer, host: string, port: number, latency: number): MinecraftStatus {
  const { length: lengthLength } = readVarInt(data, 0)
  const { value: packetId, length: idLength } = readVarInt(data, lengthLength)

  if (packetId !== 0x00)
    throw new RangeError("unexpected packet id")

  const jsonOffset = lengthLength + idLength
  const { value: jsonLength, length: jsonLengthLength } = readVarInt(data, jsonOffset)
  const jsonStart = jsonOffset + jsonLengthLength
  const payload = JSON.parse(data.subarray(jsonStart, jsonStart + jsonLength).toString("utf8"))

  const sample = Array.isArray(payload?.players?.sample) ? payload.players.sample : []
  const description = payload?.description

  return {
    online: true,
    host,
    port,
    version: payload?.version?.name ?? "N/A",
    motd: typeof description === "string" ? description : description?.text ?? "",
    max_players: payload?.players?.max ?? 0,
    latency,
    protocol_version: payload?.version?.protocol ?? PROTOCOL_VERSION,
    players: sample.map((player: { name: string, id: string }) => ({
      name: player.name,
      uuid: player.id,
    })),
  }
}

function buildHandshake(host: string, port: number): Buffer {
  const hostBuffer = Buffer.from(host, "utf8")
  const handshakeData = Buffer.concat([
    packVarInt(PROTOCOL_VERSION),
    packVarInt(hostBuffer.length),
    hostBuffer,
    Buffer.from([port >> 8, port & 0xFF]),
    packVarInt(1),
  ])
  return createPacket(0x00, handshakeData)
}

function buildStatusRequest(): Buffer {
  return createPacket(0x00, Buffer.alloc(0))
}

function createPacket(packetId: number, data: Buffer): Buffer {
  const packetData = Buffer.concat([packVarInt(packetId), data])
  return Buffer.concat([packVarInt(packetData.length), packetData])
}

function packVarInt(value: number): Buffer {
  const parts: number[] = []

  while (true) {
    const temp = value & 0b01111111
    value >>>= 7
    if (value) {
      parts.push(temp | 0b10000000)
    }
    else {
      parts.push(temp)
      break
    }
  }

  return Buffer.from(parts)
}

function readVarInt(buffer: Buffer, offset: number): { value: number, length: number } {
  let num = 0
  let length = 0

  for (let i = 0; i < 5; i++) {
    if (offset + i >= buffer.length)
      throw new RangeError("varint incomplete")

    const byte = buffer.readUInt8(offset + i)
    num |= (byte & 0x7F) << (7 * i)
    length++

    if (!(byte & 0x80))
      break
  }

  return { value: num, length }
}

function offlineStatus(host: string, port: number): MinecraftStatus {
  return {
    online: false,
    host,
    port,
    version: "N/A",
    motd: "Server is offline or unreachable.",
    max_players: 0,
    latency: 0,
    protocol_version: PROTOCOL_VERSION,
    players: [],
  }
}
