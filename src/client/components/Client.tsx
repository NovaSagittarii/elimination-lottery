import { useContext, useEffect, useState } from 'react';
import { Button, FormControl, FormLabel } from '@mui/material';

import {
  AppStateContext,
  ClientStatus,
  SocketIoClientContext,
  TimerContext,
} from '../App';
import InputText from './InputText';
import EliminationAggregation from './EliminationAggregation';

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
      {username ? (
        question ? (
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
                {question.title}
              </span>
              {question.options.map((option, index) => (
                <Button
                  className={
                    state.selectedChoice === -1 ||
                    index === state.selectedChoice
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
              <div className='text-center font-lg font-semibold'>
                Elimination Log
              </div>
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
        ) : (
          <div> awaiting question </div>
        )
      ) : null}
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
