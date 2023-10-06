import { useContext, useEffect, useState } from 'react';
import { Button } from '@mui/material';

import { AppStateContext, ClientStatus, SocketIoClientContext } from '../App';
import InputText from './InputText';

const STATUS_STYLING = new Map<ClientStatus, string>([
  ['spectator', 'bg-slate-400'],
  ['eliminated', 'bg-red-300'],
  ['candidate', 'bg-green-300'],
]);

export default function Client() {
  const app = useContext(SocketIoClientContext);
  const state = useContext(AppStateContext);
  const [username, setUsername] = useState<string>('');
  const [inputName, setInputName] = useState<string>('');

  useEffect(() => {
    if (username) app?.emit('name', username);
  }, [username]);

  return (
    <div className='m-auto max-w-lg h-screen flex flex-col justify-center align-middle '>
      {!username && (
        <>
          <InputText value={inputName} setValue={setInputName} />
          <Button variant='outlined' onClick={() => setUsername(inputName)}>
            Join
          </Button>
        </>
      )}
      {username && <>you have a username</>}
      <div
        className={
          'fixed left-0 bottom-0 w-full h-6 flex justify-center items-center text-[#0008] text-sm font-extrabold overflow-hidden transition-colors duration-300 ' +
          STATUS_STYLING.get(state.status)
        }
      >
        {state.status.toUpperCase()}
      </div>
    </div>
  );
}
