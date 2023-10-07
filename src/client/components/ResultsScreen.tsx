import { useContext } from "react";
import { AppStateContext, SocketIoClientContext, TimerContext } from "../App";

import { EliminationRecord } from '../../lib/Room';

export default function ResultsScreen() {
  const app = useContext(SocketIoClientContext);
  const state = useContext(AppStateContext);
  const currentTime = useContext(TimerContext);

  const modifiedEliminations = [...state.eliminations, {
    username: state.candidates[0],
    time: -1,
  } as EliminationRecord];
  return (
    <div className='flex flex-col gap-4'>
      <div className='text-lg font-semibold'>
        {`Game has ended.`}
        <div className='text-base font-normal text-slate-500'>
          {`${state.candidates[0]} is the survivor.`}
        </div>
      </div>
      <div className='flex flex-col bg-slate-50 rounded p-2 '>
        <div className='text-center font-lg font-semibold'>Leaderboard</div>
        <div className='flex-col-reverse overflow-y-scroll h-48 gap-2'>
          {modifiedEliminations.slice(-10).reverse().map(({time, username}, index) => {
            return (
              <div className='rounded m-2 p-2 bg-slate-100 flex gap-4' key={index}>
                <span className='font-bold'>#{index+1}</span>
                {`${username} ${time >= 0 ? `(Round ${time})` : ''}`}
              </div>
            ) // show eliminations
          })}
        </div>
      </div>
    </div>
  );
}
