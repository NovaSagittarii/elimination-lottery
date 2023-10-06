import './App.css';

import { createContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

import reactLogo from './assets/react.svg';
import Counter from './components/Counter';
import Client from './components/Client';
import { EliminationRecord } from '../lib/Room';
import { Question } from '../lib';

export type ClientStatus = 'spectator' | 'candidate' | 'eliminated';
export type AppState = {
  username: string;
  candidates: string[];
  eliminations: EliminationRecord[];
  status: ClientStatus;
  question: Question | null;
};
export const InitialAppState: AppState = {
  username: '',
  candidates: [],
  eliminations: [],
  status: 'spectator',
  question: null,
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
        setState((prevState) => {
          return { ...prevState, question };
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
    }
  }, []);

  useEffect(() => {
    // debug info
    console.log('new state', state);
  }, [state]);

  useEffect(() => {
    // update client status based on information from what they're doing
    if (state.candidates.includes(state.username))
      setState({ ...state, status: 'candidate' });
    else if (
      state.eliminations.filter((x) => x.username === state.username).length
    )
      setState({ ...state, status: 'eliminated' });
    else setState({ ...state, status: 'spectator' });
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
