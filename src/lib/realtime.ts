import type { Server } from "http";
import { WebSocketServer } from "ws";

let wss: WebSocketServer | null = null;

type Message = {
  type: string;
  data: unknown;
};

export const initRealtime = (server: Server) => {
  wss = new WebSocketServer({ server, path: "/ws" });
  wss.on("connection", (socket) => {
    socket.send(JSON.stringify({ type: "connection", data: "connected" }));
  });
  console.log("🔌 WebSocket server ready at /ws");
};

export const publish = (message: Message) => {
  if (!wss) return;
  const payload = JSON.stringify(message);
  for (const client of wss.clients) {
    if (client.readyState === client.OPEN) {
      client.send(payload);
    }
  }
};

