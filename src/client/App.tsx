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
      setApp(io());
    }
  }, []);

  return (
    <SocketIoClientContext.Provider value={app}>
      <Client />
    </SocketIoClientContext.Provider>
  );
}

export default App;
