import type { GeneratorDifficulty } from './data';
import type { JournalEntry } from './types';

export interface DifficultyProfile {
  key:GeneratorDifficulty;
  processAccuracy:number|null;
  sampleCount:number;
  volatilityMultiplier:number;
  setupStrengthMultiplier:number;
  noiseMultiplier:number;
}

export function getAdaptiveDifficulty(journal:JournalEntry[]):DifficultyProfile{
  const recent=journal.slice(-20);
  if(recent.length<5)return{key:'normal',processAccuracy:recent.length?recent.filter(x=>x.processMatch).length/recent.length:null,sampleCount:recent.length,volatilityMultiplier:1,setupStrengthMultiplier:1,noiseMultiplier:1};
  const processAccuracy=recent.filter(x=>x.processMatch).length/recent.length;
  const key:GeneratorDifficulty=processAccuracy<0.60?'easy':processAccuracy>0.75?'hard':'normal';
  const multipliers={
    easy:{volatilityMultiplier:0.75,setupStrengthMultiplier:1.25,noiseMultiplier:0.90},
    normal:{volatilityMultiplier:1,setupStrengthMultiplier:1,noiseMultiplier:1},
    hard:{volatilityMultiplier:1.30,setupStrengthMultiplier:0.70,noiseMultiplier:1.15},
  }[key];
  return{key,processAccuracy,sampleCount:recent.length,...multipliers};
}
