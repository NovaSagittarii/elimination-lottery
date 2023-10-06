import './App.css';

import { createContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

import reactLogo from './assets/react.svg';
import Counter from './components/Counter';
import Client from './components/Client';
import { EliminationRecord } from '../lib/Room';
import { Question, QuestionResult } from '../lib';

export type ClientStatus = 'spectator' | 'candidate' | 'eliminated';
export type AppState = {
  username: string;
  candidates: string[];
  eliminations: EliminationRecord[];
  status: ClientStatus;
  question: Question | null;
  questionResult: QuestionResult | null;
  totalParticipants: number;
  undecidedRemaining: number;
};
export const InitialAppState: AppState = {
  username: '',
  candidates: [],
  eliminations: [],
  status: 'spectator',
  question: null,
  questionResult: null,
  totalParticipants: -1,
  undecidedRemaining: -1,
};
export const AppStateContext = createContext<AppState>(InitialAppState);

export type SocketIoClient = ReturnType<typeof io> | null;
export const SocketIoClientContext = createContext<SocketIoClient>(null);

let init = false;

function App() {
  const [app, setApp] = useState<SocketIoClient>(null);
  const [state, setState] = useState<AppState>(InitialAppState);

  useEffect(() => {
    if (app === null && !init) {
      init = true;
      console.log('connecting');
      const socket = io();
      setApp(socket);

      socket.on('connect', () => console.log('connected!'));
      socket.on('disconnect', () => console.warn('disconnected!'));
      socket.on('name_ack', (username: string) => {
        setState((prevState) => {
          return { ...prevState, username };
        });
      });
      socket.on('new_question', (question: Question) => {
        // console.log('nq', question);
        setState((prevState) => {
          return { ...prevState, question };
        });
      });
      socket.on('question_result', (questionResult: QuestionResult) => {
        setState((prevState) => {
          return { ...prevState, questionResult };
        });
      });
      socket.on('candidates', (candidates: string[]) => {
        setState((prevState) => {
          return { ...prevState, candidates };
        });
      });
      socket.on('eliminated', (eliminations: EliminationRecord[]) => {
        setState((prevState) => {
          return { ...prevState, eliminations };
        });
      });
      socket.on('awaiting_for', (undecidedRemaining: number) => {
        setState((prevState) => {
          return { ...prevState, undecidedRemaining };
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
    if (state.candidates.includes(state.username)) newStatus = 'candidate';
    else if (
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
        <Client />
      </AppStateContext.Provider>
    </SocketIoClientContext.Provider>
  );
}

export default App;
