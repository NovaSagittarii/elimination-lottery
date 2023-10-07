import { useContext } from 'react';
import { Button } from '@mui/material';

import EliminationAggregation from './EliminationAggregation';
import {
  AppStateContext,
  SocketIoClientContext,
  TimerContext,
} from '../App';

export default function ActiveRound() {
  const app = useContext(SocketIoClientContext);
  const state = useContext(AppStateContext);
  const currentTime = useContext(TimerContext);

  const { question } = state;
  return (
    <div className='flex flex-col gap-2'>
      <div className='text-lg font-semibold'>
        {`Round ${state.round}`}
        <div className='text-sm font-normal text-slate-500'>
          {`${state.candidates.length} candidates remaining`}
        </div>
      </div>
      <div className='text-right'>
        {state.questionResult
          ? 'ended'
          : `${Math.round(
              Math.max(0, state.questionEndTime - currentTime) / 1000,
            )}s`}
      </div>
      <div className='flex flex-col gap-2'>
        <span className='font-semibold text-lg text-slate-700 text-center'>
          {question!.title}
        </span>
        {question!.options.map((option, index) => (
          <Button
            className={
              state.selectedChoice === -1 || index === state.selectedChoice
                ? 'opacity-100'
                : 'opacity-50'
            }
            variant='outlined'
            key={index}
            disabled={!!state.questionResult || state.selectedChoice >= 0}
            onClick={() => {
              app?.emit('choice', index);
            }}
          >
            <div className='flex gap-2'>
              {[
                option,
                state.questionResult &&
                  `(${state.questionResult.candidateVotes[index]}${
                    state.questionResult.candidateVotes[index] ===
                    state.lowestNonzeroCandidateVote
                      ? ` + ${state.questionResult.tiebreakerVotes[index]}`
                      : ''
                  })`,
              ].map((label, index) => (
                <span key={index}>{label}</span>
              ))}
            </div>
          </Button>
        ))}
      </div>
      <div className='text-right'>{`waiting on ${state.undecidedRemaining} people`}</div>
      <div className='flex flex-col bg-slate-50 rounded p-2 '>
        <div className='text-center font-lg font-semibold'>Elimination Log</div>
        <div className='flex-col-reverse overflow-y-scroll h-48 gap-2'>
          {/* {state.eliminations.map(({time, username}, index) => {
                  return (
                    <div className='rounded m-2 p-2 bg-slate-100' key={index}>
                      {`${time} ${username}`}
                    </div>
                  ) // aggregate instead of showing individual ones because theres no name moderation atm
                })} */}
          <EliminationAggregation eliminations={state.eliminations} />
        </div>
      </div>
    </div>
  );
}
