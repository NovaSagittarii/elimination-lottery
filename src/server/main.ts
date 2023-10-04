import express from "express";
import ViteExpress from "vite-express";
import { Server } from "socket.io";
import { createServer } from "http";

const app = express();
const server = createServer(app);
const io = new Server(server);

app.get("/hello", (_, res) => {
  res.send("Hello Vite + React + TypeScript!");
});

io.on('connection', (socket) => {
  console.log('a user connected');
});

server.listen(3000, () => {
  console.log('socket.io server listening on *:3000');
});

ViteExpress.bind(app, server, () =>
  console.log("ViteExpress server is listening on *:3000")
);