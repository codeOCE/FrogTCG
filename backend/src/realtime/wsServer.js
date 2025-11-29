const WebSocket = require("ws");

let wss = null;

function startWs(server) {
  wss = new WebSocket.Server({
    server,
    path: "/ws",
  });

  wss.on("connection", (socket) => {
    console.log("🔌 WebSocket client connected");

    socket.on("close", () => {
      console.log("❌ WebSocket client disconnected");
    });
  });

  console.log("✅ WebSocket server running on /ws");
}

function broadcast(payload) {
  if (!wss) return;

  const message = typeof payload === "string" ? payload : JSON.stringify(payload);

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

module.exports = { startWs, broadcast };
