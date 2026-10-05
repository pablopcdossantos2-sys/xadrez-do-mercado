import type { Instrument } from './types';

export interface AssetSpec{
  id:Instrument;
  label:string;
  b3Code:string;
  market:'US'|'BR';
  currency:'USD'|'BRL';
  basePrice:number;
  pointValue:number;
  tickSize:number;
  sessionStart:string;
  sessionEnd:string;
}

export const ASSETS:Record<Instrument,AssetSpec>={
  MES:{id:'MES',label:'MES',b3Code:'MES',market:'US',currency:'USD',basePrice:4200,pointValue:5,tickSize:0.25,sessionStart:'09:30',sessionEnd:'16:00'},
  MNQ:{id:'MNQ',label:'MNQ',b3Code:'MNQ',market:'US',currency:'USD',basePrice:15500,pointValue:2,tickSize:0.25,sessionStart:'09:30',sessionEnd:'16:00'},
  WINFUT:{id:'WINFUT',label:'WINFUT',b3Code:'WIN',market:'BR',currency:'BRL',basePrice:130000,pointValue:0.2,tickSize:5,sessionStart:'09:00',sessionEnd:'18:00'},
  WDOFUT:{id:'WDOFUT',label:'WDOFUT',b3Code:'WDO',market:'BR',currency:'BRL',basePrice:5000,pointValue:10,tickSize:0.5,sessionStart:'09:00',sessionEnd:'18:00'},
};

export const ACTIVE_ASSETS=Object.values(ASSETS);

export function assetSpec(asset:Instrument){return ASSETS[asset];}
