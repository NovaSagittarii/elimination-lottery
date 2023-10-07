import { useContext } from 'react';
import { AppStateContext, SocketIoClientContext, TimerContext } from '../App';

import { EliminationRecord } from '../../lib/Room';

export default function ResultsScreen() {
  const app = useContext(SocketIoClientContext);
  const state = useContext(AppStateContext);
  const currentTime = useContext(TimerContext);

  const modifiedEliminations = [
    ...state.eliminations,
    {
      username: state.candidates[0],
      time: -1,
    } as EliminationRecord,
  ];
  return (
    <div className='flex flex-col gap-4'>
      <div className='text-lg font-semibold'>
        {'Results'}
        <div className='text-base font-normal text-slate-500 flex gap-1'>
          {'The winner is'}
          <span className='text-orange-700'>{state.candidates[0]}</span>
        </div>
      </div>
      <div className='flex flex-col bg-slate-50 rounded p-2 '>
        <div className='text-center font-lg font-semibold'>Leaderboard</div>
        <div className='flex-col-reverse overflow-y-scroll h-96 gap-2'>
          {modifiedEliminations
            .slice(-10)
            .reverse()
            .map(({ time, username }, index) => {
              return (
                <div
                  className='rounded m-2 px-4 py-2 bg-slate-100 flex gap-4'
                  key={index}
                >
                  <span className='font-bold'>#{index + 1}</span>
                  <div className='flex justify-between w-full'>
                    <div>{username}</div>
                    <div className='font-sm text-slate-400'>
                      {time >= 0 ? `Round ${time}` : ''}
                    </div>
                  </div>
                </div>
              ); // show eliminations
            })}
        </div>
      </div>
    </div>
  );
}
