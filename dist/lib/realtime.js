import { WebSocketServer } from "ws";
let wss = null;
export const initRealtime = (server) => {
    wss = new WebSocketServer({ server, path: "/ws" });
    wss.on("connection", (socket) => {
        socket.send(JSON.stringify({ type: "connection", data: "connected" }));
    });
    console.log("🔌 WebSocket server ready at /ws");
};
export const publish = (message) => {
    if (!wss)
        return;
    const payload = JSON.stringify(message);
    for (const client of wss.clients) {
        if (client.readyState === client.OPEN) {
            client.send(payload);
        }
    }
};
//# sourceMappingURL=realtime.js.map