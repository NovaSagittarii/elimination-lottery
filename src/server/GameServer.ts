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
        try {
          room.setUserName(socket.id, data);
          socket.emit('name_ack', room.getUser(socket.id)?.getName());
          console.log('omg', room.getActiveUserCount());
        } catch (err) {
          console.warn('illegal name change (name taken)', socket.id);
        }
      });

      socket.on('choice', (data: number) => {
        if (data >= 0) {
          // todo: check user is participanting?
          const prevChoice = room.getUser(socket.id)?.getChoice();
          room.setUserChoice(socket.id, data);
          // made their choice
          if (prevChoice === -1) this.broadcastUndecided();
        }
      });

      socket.on('disconnect', () => {
        console.log('disconnect', socket.id);
        room.removeUser(socket.id);
      });
    });
  }
  private broadcastUndecided() {
    this.io.emit('awaiting_for', this.room.getPendingChoiceCount());
  }
  public async enableAutostart(
    requiredPlayers: number = 1,
    ticksUntilStart: number = 5,
  ) {
    const { io, room } = this;
    console.log(`waiting for ${requiredPlayers} players until starting`);
    // wait until at least 1 person and no changes for 5 seconds
    await new Promise((res) => {
      let ok = 0;
      let prev = -1;
      const interval = setInterval(() => {
        let curr = room.getActiveUserCount();
        if (curr >= requiredPlayers && curr === prev) ++ok;
        else ok = 0;
        prev = curr;

        if (curr >= requiredPlayers && ok >= ticksUntilStart) {
          res(undefined);
          clearInterval(interval);
        }
      }, 1000);
    });
    console.log('game started');
    room.startGame();
    io.emit('candidates', room.getCandidateNames());
    // for (const [k, v] of room.getCandidateEntries()) {
    //   io.to(k).emit('name', v.getName());
    // }

    room.startRound();
    io.emit('new_question', room.getQuestion());
    this.broadcastUndecided();

    // something like callbacks would be appropriate, but doing await looks nice too
    await new Promise((res) => {
      let remainingChecks = 8;
      const interval = setInterval(() => {
        // console.log('waiting for', room.getPendingChoiceCount());
        if (--remainingChecks < 0 || room.getPendingChoiceCount() === 0) {
          res(undefined);
          clearInterval(interval);
        }
      }, 2500);
    });
    // console.log('round ended...?');
    room.endRound();
    io.emit('question_result', room.getQuestionResult());
    // (THIS DOES NOT WORK, need to spread it out or don't do this, socketio WILL get overloaded)
    io.emit('candidates', room.getCandidateNames());
    io.emit('eliminated', room.getEliminationLog());
    // console.log(room.getEliminationLog());
  }
}

export default GameServer;
