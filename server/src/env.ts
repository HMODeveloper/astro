import process from "node:process"
import { fileURLToPath } from "node:url"

export const ENV = {
  PORT: Number(process.env.PORT ?? 3000),
  HOST: process.env.HOST ?? "0.0.0.0",
  SITE_ROOT: process.env.SITE_ROOT ?? fileURLToPath(new URL("../../dist", import.meta.url)),
}
