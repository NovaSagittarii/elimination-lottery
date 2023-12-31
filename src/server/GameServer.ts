import { Server as SioServer } from 'socket.io';
import { Server as HttpServer } from 'http';

import { EliminationEvent, Room } from '../lib';
import { QUESTIONSETS } from '../../data';
import { sleep } from './asyncUtils';

export const CHECK_INTERVAL = 2500;
export const CHECK_MAXIMUM = 8;
export const DURATION = CHECK_INTERVAL * CHECK_MAXIMUM;

export type GameServerConfiguration = {
  questionDuration: number;
};

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
      socket.emit('config', {
        questionDuration: DURATION,
      } as GameServerConfiguration);

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
          socket.emit('choice_ack', room.getUser(socket.id)?.getChoice());
          // made their choice
          if (prevChoice === -1) this.broadcastUndecided();
        }
      });

      socket.on('disconnect', () => {
        console.log('disconnect', socket.id);
        if (
          room.getUser(socket.id)?.getName() &&
          room.getUser(socket.id)?.getChoice() === -1
        ) {
          this.broadcastUndecided();
        }
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

    while (true) {
      console.log(`waiting for ${requiredPlayers} players until starting`);
      // wait until at least REQUIRED_PLAYERS person and does not go under for TICKS_UNTIL_START seconds
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

      await this.startRound();
      await sleep(10000);
    }
  }
  private async startRound() {
    const { io, room } = this;
    console.log('game started');
    room.startGame();
    io.emit('candidates', room.getCandidateNames());
    // for (const [k, v] of room.getCandidateEntries()) {
    //   io.to(k).emit('name', v.getName());
    // }
    
    // end game in like 5 rounds if nothing happens (unlikely for large sizes, prevents collusion from going too far and resulting in stalling)
    let abortCountdown = 5;
    let prevCandidates = 0;

    while (!room.hasWinner()) {
      let numCandidates = room.getCandidateNames().length;
      if (numCandidates === prevCandidates) {
        --abortCountdown;
        if (abortCountdown <= 0) break;
      } else abortCountdown = 5;
      prevCandidates = numCandidates;

      room.startRound();
      io.emit('new_question', room.getQuestion());
      this.broadcastUndecided();

      // something like callbacks would be appropriate, but doing await looks nice too
      await new Promise((res) => {
        let remainingChecks = CHECK_MAXIMUM;
        const interval = setInterval(() => {
          // console.log('waiting for', room.getPendingChoiceCount());
          if (--remainingChecks < 0 || room.getPendingChoiceCount() === 0) {
            res(undefined);
            clearInterval(interval);
          }
        }, CHECK_INTERVAL);
      });
      // console.log('round ended...?');
      room.endRound();
      io.emit('question_result', room.getQuestionResult());

      // build elimination event (all people who were just eliminated)
      const eliminationEvent = new EliminationEvent({
        time: room.getCurrentRound(),
      });
      room
        .getEliminationLog()
        .filter(
          (eliminationRecord) =>
            eliminationRecord.time === room.getCurrentRound(),
        )
        .forEach((eliminationRecord) =>
          eliminationEvent.addUser(eliminationRecord.username),
        );
      io.emit('elimination_event', eliminationEvent.exportAsObject());
      // console.log(room.getEliminationLog());
      await sleep(2000);
    }

    console.log('game ended!', room.getEliminationLog());
    io.emit('game_end');
  }
}

export default GameServer;
