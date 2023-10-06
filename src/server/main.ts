import express from 'express';
import ViteExpress from 'vite-express';
// import { Server } from 'socket.io';
import { createServer } from 'http';
import GameServer from './GameServer';

const app = express();
const server = createServer(app);
const io = new GameServer(server);

io.enableAutostart();
const room = io.room;

app.get('/hello', (_, res) => {
  res.send('Hello Vite + React + TypeScript!');
});

server.listen(3000, () => {
  console.log('socket.io server listening on *:3000');
});

ViteExpress.bind(app, server, async () => {
  console.log('ViteExpress server is listening on *:3000');
});
