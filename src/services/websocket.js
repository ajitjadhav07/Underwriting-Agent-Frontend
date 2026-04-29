export function connectJobSocket(jobId, onMessage) {
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
  const host     = window.location.host === 'localhost:3000'
    ? 'localhost:10000'
    : window.location.host

  const ws = new WebSocket(`${protocol}://${host}?jobId=${jobId}`)
  ws.onmessage = (e) => {
    try { onMessage(JSON.parse(e.data)) } catch {}
  }
  return ws
}
