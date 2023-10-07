import { useContext, useEffect, useState } from 'react';
import { Button } from '@mui/material';

import {
  AppStateContext,
  ClientStatus,
  SocketIoClientContext,
  TimerContext,
} from '../App';
import InputText from './InputText';
import ActiveRound from './ActiveRound';
import ResultsScreen from './ResultsScreen';

const STATUS_STYLING = new Map<ClientStatus, string>([
  ['spectator', 'bg-slate-400'],
  ['eliminated', 'bg-orange-300'],
  ['candidate', 'bg-green-300'],
]);

export default function Client() {
  const app = useContext(SocketIoClientContext);
  const state = useContext(AppStateContext);
  const currentTime = useContext(TimerContext);
  const [username, setUsername] = useState<string>('');
  const [inputName, setInputName] = useState<string>('');

  const { question } = state;

  useEffect(() => {
    if (username) app?.emit('name', username);
  }, [username]);

  return (
    <div className='m-auto p-10 max-w-lg h-screen flex flex-col justify-center align-middle gap-4 '>
      {!username && (
        <>
          <InputText value={inputName} setValue={setInputName} />
          <Button variant='outlined' onClick={() => setUsername(inputName)}>
            Join
          </Button>
        </>
      )}
      {!state.gameEnded ? (
        username ? (
          question ? (
            <ActiveRound />
          ) : (
            <div> awaiting question </div>
          )
        ) : null
      ) : (
        <ResultsScreen />
      )}
      <div
        className={
          'fixed left-0 bottom-0 w-full h-6 flex justify-center items-center text-[#0008] text-sm font-extrabold overflow-hidden transition-colors duration-300 ' +
          STATUS_STYLING.get(state.status)
        }
      >
        {state.username && state.username + ', '}
        {state.status.toUpperCase()}
      </div>
    </div>
  );
}
