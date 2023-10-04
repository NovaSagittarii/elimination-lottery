import './App.css';

import { createContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

import reactLogo from './assets/react.svg';
import Counter from './components/Counter';

export type SocketIoClient = ReturnType<typeof io> | null;
export const SocketIoClientContext = createContext<SocketIoClient>(null);

function App() {
  const [app, setApp] = useState<SocketIoClient>(null);
  useEffect(() => {
    if (app === null) {
      console.log('connecting'); // i don't know why this runs twice, but it doesn't seem to break things
      setApp(io());
    }
  }, []);

  return (
    <SocketIoClientContext.Provider value={app}>
      <div className='App'>
        <div>
          <a href='https://vitejs.dev' target='_blank'>
            <img src='/vite.svg' className='logo' alt='Vite logo' />
          </a>
          <a href='https://reactjs.org' target='_blank'>
            <img src={reactLogo} className='logo react' alt='React logo' />
          </a>
        </div>
        <h1>Vite + React</h1>
        <div className='card'>
          <Counter />
          <p>
            Edit <code>src/App.tsx</code> and save to test HMR
          </p>
        </div>
        <p className='read-the-docs'>
          Click on the Vite and React logos to learn more
        </p>
      </div>
    </SocketIoClientContext.Provider>
  );
}

export default App;
