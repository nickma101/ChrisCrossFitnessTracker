// Small unique id helper for client-side row keys (e.g. exercise rows within
// a plan). Good enough for local, single-user data.
export function makeId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}
