import { Server as SioServer } from 'socket.io';
import { Server as HttpServer } from 'http';

import { Room } from '../lib';
import { QUESTIONSETS } from '../../data';

class GameServer extends SioServer {
  public room: Room;
  private io: SioServer;
  constructor(httpServer: HttpServer) {
    super(httpServer);
    const io = (this.io = this);
    const room = (this.room = new Room()); // single room cuz it's easier to code and don't expect multirooms
    room.setQuestionSet(QUESTIONSETS[0]);

    io.on('connection', (socket) => {
      console.log('  connect', socket.id);
      room.addUser(socket.id);

      socket.on('count', (data) => {
        console.log('count', socket.id, data);
      });

      socket.on('name', (data: string) => {
        data = data as string;
        room.setUserName(socket.id, data);
        console.log('omg', room.getActiveUserCount());
      });

      socket.on('disconnect', () => {
        console.log('disconnect', socket.id);
        room.removeUser(socket.id);
      });
    });
  }
  public async enableAutostart(requiredPlayers: number = 1) {
    const { io, room } = this;
    console.log(`waiting for ${requiredPlayers} players until starting`);
    // wait until at least 1 person and no changes for 5 seconds
    await new Promise((res) => {
      let ok = 0;
      let prev = -1;
      setInterval(() => {
        let curr = room.getActiveUserCount();
        if (curr >= requiredPlayers && curr === prev) ++ok;
        else ok = 0;
        prev = curr;

        if (ok >= 5) res(undefined);
      }, 1000);
    });
    console.log('game started');
    room.startGame();

    room.startRound();
    io.emit('new_question', room.getQuestion());
  }
}

export default GameServer;
