import { useContext, useEffect, useState } from 'react';
import { Button } from '@mui/material';

import { SocketIoClientContext } from '../App';
import InputText from './InputText';

export default function Client() {
  const app = useContext(SocketIoClientContext);
  const [username, setUsername] = useState<string>('');
  const [inputName, setInputName] = useState<string>('');

  useEffect(() => {
    if (username) app?.emit('name', username);
  }, [username]);

  return (
    <div className='m-auto max-w-lg h-screen flex flex-col justify-center align-middle'>
      {!username && (
        <>
          <InputText value={inputName} setValue={setInputName} />
          <Button variant='outlined' onClick={() => setUsername(inputName)}>
            Join
          </Button>
        </>
      )}
      {username && <>you have a username</>}
    </div>
  );
}
