import { Server as SioServer } from 'socket.io';
import { Server as HttpServer } from 'http';

import { Room } from '../lib';
import { QUESTIONSETS } from '../../data';

class GameServer extends SioServer {
  public room: Room;
  constructor(httpServer: HttpServer) {
    super(httpServer);
    const io = this;
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
}

export default GameServer;
