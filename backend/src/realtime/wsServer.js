const WebSocket = require('ws')

module.exports = function startWs(server) {
  const wss = new WebSocket.Server({ server, path: '/realtime' })

  wss.on('connection', ws => {
    console.log('WebSocket client connected')
    ws.send(JSON.stringify({ type: 'hello', message: 'WS connected' }))
  })
}
