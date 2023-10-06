import express from 'express';
import ViteExpress from 'vite-express';
// import { Server } from 'socket.io';
import { createServer } from 'http';
import GameServer from './GameServer';

const app = express();
const server = createServer(app);
const io = new GameServer(server);

const room = io.room;

app.get('/hello', (_, res) => {
  res.send('Hello Vite + React + TypeScript!');
});

server.listen(3000, () => {
  console.log('socket.io server listening on *:3000');
});

ViteExpress.bind(app, server, async () => {
  console.log('ViteExpress server is listening on *:3000');

  console.log('waiting to start');
  // wait until at least 1 person and no changes for 5 seconds
  await new Promise((res) => {
    let ok = 0;
    let prev = -1;
    setInterval(() => {
      let curr = room.getActiveUserCount();
      if (curr > 0 && curr === prev) ++ok;
      else ok = 0;
      prev = curr;

      if (ok >= 5) res(undefined);
    }, 1000);
  });
  console.log('game started');
  room.startGame();

  room.startRound();
});
