import { useContext, useEffect, useState } from 'react';
import { SocketIoClientContext } from '../App';

export default function Counter() {
  const [count, setCount] = useState(0);
  const app = useContext(SocketIoClientContext);

  useEffect(() => {
    app?.emit('count', count);
  }, [count]);

  return (
    <button onClick={() => setCount((count) => count + 1)}>
      count is {count}
    </button>
  );
}
