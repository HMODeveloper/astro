export const log = {
  info(...args: unknown[]): void {
    // eslint-disable-next-line no-console
    console.log("[INFO]", ...args)
  },
  error(...args: unknown[]): void {
    console.error("[ERROR]", ...args)
  },
}
