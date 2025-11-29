const express = require("express");
const cors = require("cors");      // <- fixed
const app = express();
const PORT = 5000;

let clients = [];

// Allow CORS for SSE. In production set origin to your frontend URL instead of "*"
app.use(cors({
  origin: "*",                   // or: "https://your-frontend.com"
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

// SSE Route
app.get("/events", (req, res) => {
  // Required SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Optional: recommended to flush headers immediately
  res.flushHeaders?.();

  // Send an initial comment or message so some proxies don't close idle connections
  res.write(": connected\n\n");

  // Keep track of client
  clients.push(res);

  // Remove client when connection closes
  req.on("close", () => {
    clients = clients.filter(c => c !== res);
  });
});

// Broadcast message every 5 seconds (example)
setInterval(() => {
  const message = { time: new Date().toLocaleTimeString() };
  clients.forEach(client => {
    client.write(`data: ${JSON.stringify(message)}\n\n`);
  });
}, 1000);

app.listen(PORT, () => console.log(`SSE Server running on ${PORT}`));
