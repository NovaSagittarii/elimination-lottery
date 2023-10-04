import { useContext, useEffect, useState } from 'react';
import { SocketIoClientContext } from '../App';

export default function Counter() {
  const [count, setCount] = useState(0);
  const app = useContext(SocketIoClientContext);

  useEffect(() => {
    app?.emit('count', count);
  }, [count]);

  return (
    <button
      className='rounded-lg border border-transparent px-6 py-3 text-base font-medium bg-slate-100 cursor-pointer transition-colors duration-200 hover:border-blue-600 focus:outline-4 focus-visible:outline-4'
      onClick={() => setCount((count) => count + 1)}
    >
      count is {count}
    </button>
  );
}
