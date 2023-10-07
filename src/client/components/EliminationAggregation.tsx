import { EliminationRecord } from '../../lib/Room';

export type EliminationAggregationProps = {
  eliminations: EliminationRecord[];
};

export function EliminationAggregation({
  eliminations,
}: EliminationAggregationProps) {
  // console.log(Math.max(...eliminations.map(x => x.time)));
  const aggregation: number[] = [
    ...new Array(Math.max(0, ...eliminations.map((x) => x.time)) || 0),
  ].map((x) => 0);
  for (const { time } of eliminations) ++aggregation[time - 1];

  return aggregation.map((amt, index) => {
    return (
      <div className='rounded m-2 p-2 bg-slate-100' key={index}>
        {`Round ${index + 1}: ${amt} eliminated`}
      </div>
    );
  });
}

export default EliminationAggregation;
