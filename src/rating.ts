import type { GeneratorDifficulty } from './data';

export const ELO_K=24;
export const DIFFICULTY_RATING:Record<GeneratorDifficulty,number>={easy:1160,normal:1236,hard:1310};

export function expectedScore(rating:number,opponentRating:number){
  return 1/(1+10**((opponentRating-rating)/400));
}

export function eloDelta(rating:number,opponentRating:number,score:0|0.5|1,k=ELO_K){
  return Math.round(k*(score-expectedScore(rating,opponentRating)));
}
