import './App.css';

import { createContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

import reactLogo from './assets/react.svg';
import Counter from './components/Counter';
import Client from './components/Client';
import { EliminationRecord } from '../lib/Room';
import {
  EliminationEvent,
  Question,
  QuestionResult,
  SerializedEliminationEvent,
} from '../lib';
import { type GameServerConfiguration } from '../server/GameServer';
import { Sounds } from './Sounds';

export type ClientStatus =
  | 'spectator'
  | 'candidate'
  | 'eliminated'
  | 'champion';
export type AppState = {
  round: number;
  username: string;
  candidates: string[];
  eliminations: EliminationRecord[];
  status: ClientStatus;
  question: Question | null;
  questionResult: QuestionResult | null;
  selectedChoice: number;
  lowestNonzeroCandidateVote: number;
  totalParticipants: number;
  undecidedRemaining: number;
  questionEndTime: number;
  questionDuration: number;
  gameEnded: boolean;
};
export const InitialAppState: AppState = {
  round: 0,
  username: '',
  candidates: [],
  eliminations: [],
  status: 'spectator',
  question: null,
  questionResult: null,
  selectedChoice: -1,
  lowestNonzeroCandidateVote: -1,
  totalParticipants: -1,
  undecidedRemaining: -1,
  questionEndTime: -1,
  questionDuration: -1,
  gameEnded: false,
};
export const AppStateContext = createContext<AppState>(InitialAppState);

export type SocketIoClient = ReturnType<typeof io> | null;
export const SocketIoClientContext = createContext<SocketIoClient>(null);

export const TimerContext = createContext<number>(0);

let init = false;

function App() {
  const [app, setApp] = useState<SocketIoClient>(null);
  const [state, setState] = useState<AppState>(InitialAppState);
  const [currentTime, setTime] = useState<number>(0);

  useEffect(() => {
    if (app === null && !init) {
      init = true;

      setInterval(() => setTime(Date.now()), 1000);

      console.log('connecting');
      const socket = io();
      setApp(socket);

      socket.on('connect', () => console.log('connected!'));
      socket.on('disconnect', () => console.warn('disconnected!'));
      socket.on('config', ({ questionDuration }: GameServerConfiguration) => {
        setState((prevState) => {
          return {
            ...prevState,
            questionDuration,
          };
        });
      });
      socket.on('name_ack', (username: string) => {
        setState((prevState) => {
          return { ...prevState, username };
        });
      });
      socket.on('choice_ack', (selectedChoice: number) => {
        setState((prevState) => {
          return { ...prevState, selectedChoice };
        });
      });
      socket.on('new_question', (question: Question) => {
        // console.log('nq', question);
        Sounds.get('notify')?.play();

        setState((prevState) => {
          // need to also reset anything related to questions
          return {
            ...prevState,
            round: prevState.round + 1,
            question,
            questionResult: null,
            questionEndTime: Date.now() + prevState.questionDuration,
            selectedChoice: -1,
          };
        });
      });
      socket.on('question_result', (questionResult: QuestionResult) => {
        setState((prevState) => {
          // vote counts for each choice
          const candidateVotes = questionResult.candidateVotes.filter(
            (x) => x > 0,
          );
          const tiebreakerVotes = questionResult.tiebreakerVotes.filter(
            (x) => x > 0,
          );

          // smallest nonzero (candidate/tiebreaker) votes
          const candidateLowest = Math.min(...candidateVotes);
          const tiebreakerLowest = Math.min(...tiebreakerVotes);
          let elimination = -1;

          // there was at least an alternative
          if (candidateVotes.length >= 2) {
            // a tie for lowest
            if (
              candidateVotes.filter((x) => x === candidateLowest).length >= 2
            ) {
              // use tiebreaker (if only one)
              if (
                tiebreakerVotes.filter((x) => x === tiebreakerLowest).length ===
                1
              ) {
                elimination = tiebreakerLowest;
              }
            } else {
              // no tie, just take the lowest candidate amount
              elimination = candidateLowest;
            }
          }
          return {
            ...prevState,
            questionResult,
            lowestNonzeroCandidateVote: elimination,
          };
        });
      });

      // signals new round
      socket.on('candidates', (candidates: string[]) => {
        setState((prevState) => {
          // username and questionDuration need to persist
          const { username, questionDuration } = prevState;
          return {
            ...InitialAppState,
            username,
            questionDuration,
            candidates, // new list of candidates
          } as AppState;
        });
      });
      // socket.on('eliminated', (eliminations: EliminationRecord[]) => {
      //   setState((prevState) => {
      //     return { ...prevState, eliminations };
      //   });
      // });
      socket.on('elimination_event', (data: SerializedEliminationEvent) => {
        const eliminationEvent = new EliminationEvent();
        eliminationEvent.loadObject(data);
        const eliminatedUsernames = new Set<string>(); // o replace them all with arrays
        const newEliminations: EliminationRecord[] = eliminationEvent
          .getEliminated()
          .map((username) => {
            eliminatedUsernames.add(username);
            return {
              username,
              time: eliminationEvent.getTime(),
            } as EliminationRecord;
          });
        setState((prevState) => {
          return {
            ...prevState,
            candidates: prevState.candidates.filter(
              (x) => !eliminatedUsernames.has(x),
            ),
            eliminations: prevState.eliminations.concat(newEliminations),
            undecidedRemaining: 0, // force everyone to be done
          };
        });
      });
      socket.on('awaiting_for', (undecidedRemaining: number) => {
        setState((prevState) => {
          return { ...prevState, undecidedRemaining };
        });
      });
      socket.on('game_end', () => {
        console.log('game_end');
        setState((prevState) => {
          return { ...prevState, gameEnded: true };
        });
      });
    }
  }, []);

  useEffect(() => {
    // debug info
    console.log('new state', state);
  }, [state]);

  useEffect(() => {
    // update client status based on information from what they're doing
    let newStatus: ClientStatus = 'spectator';
    if (state.candidates.includes(state.username)) {
      newStatus = 'candidate';
      if (state.candidates.length === 1) newStatus = 'champion';
    } else if (
      state.eliminations.filter((x) => x.username === state.username).length
    )
      newStatus = 'eliminated';

    setState((prevState) => {
      return {
        ...state,
        status: newStatus,
        totalParticipants: state.candidates.length + state.eliminations.length,
      };
    });
  }, [state.candidates, state.eliminations]);

  return (
    <SocketIoClientContext.Provider value={app}>
      <AppStateContext.Provider value={state}>
        <TimerContext.Provider value={currentTime}>
          <Client />
        </TimerContext.Provider>
      </AppStateContext.Provider>
    </SocketIoClientContext.Provider>
  );
}

export default App;
