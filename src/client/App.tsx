import './App.css';

import { createContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

import reactLogo from './assets/react.svg';
import Counter from './components/Counter';
import Client from './components/Client';

export type SocketIoClient = ReturnType<typeof io> | null;
export const SocketIoClientContext = createContext<SocketIoClient>(null);

let init = false;

function App() {
  const [app, setApp] = useState<SocketIoClient>(null);
  useEffect(() => {
    if (app === null && !init) {
      init = true;
      console.log('connecting');
      const socket = io();
      setApp(socket);
      
      socket.on('connect', () => console.log('connected!'));
      socket.on('disconnect', () => console.warn('disconnected!'));
      socket.on('new_question', (data) => {
        console.log(data);
      });
    }
  }, []);

  return (
    <SocketIoClientContext.Provider value={app}>
      <Client />
    </SocketIoClientContext.Provider>
  );
}

export default App;
