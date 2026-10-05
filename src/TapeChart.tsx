
import { useEffect, useRef } from 'react';
import { createChart, CrosshairMode, type IChartApi, type IPriceLine, type Time } from 'lightweight-charts';
import { computeDEMA, computeEMA, computeVWAP } from './analytics';
import type { Bar, SessionLevels } from './types';

interface Props {
  bars:Bar[];
  showVwap:boolean;
  showEma:boolean;
  showDema:boolean;
  showLevels:boolean;
  showVol:boolean;
  blind:boolean;
  entryPrice:number|null;
  slPrice:number|null;
  tpPrice:number|null;
  sessionLevels?:SessionLevels;
  dataSourceLabel:string;
}

export default function TapeChart({bars,showVwap,showEma,showDema,showLevels,showVol,blind,entryPrice,slPrice,tpPrice,sessionLevels,dataSourceLabel}:Props){
  const ref=useRef<HTMLDivElement|null>(null);
  const chartRef=useRef<IChartApi|null>(null);
  const candleRef=useRef<ReturnType<IChartApi['addCandlestickSeries']>|null>(null);
  const volumeRef=useRef<ReturnType<IChartApi['addHistogramSeries']>|null>(null);
  const vwapRef=useRef<ReturnType<IChartApi['addLineSeries']>|null>(null);
  const emaRef=useRef<ReturnType<IChartApi['addLineSeries']>|null>(null);
  const demaRef=useRef<ReturnType<IChartApi['addLineSeries']>|null>(null);
  const priceLinesRef=useRef<IPriceLine[]>([]);

  useEffect(()=>{
    if(!ref.current)return;
    const el=ref.current;
    const chart=createChart(el,{
      width:el.clientWidth||800,
      height:Math.max(320,Math.round(el.clientWidth*.53)),
      layout:{background:{type:'solid',color:'#0f141d'},textColor:'#b5bfce'},
      grid:{vertLines:{color:'#202834'},horzLines:{color:'#202834'}},
      crosshair:{mode:CrosshairMode.Normal},
      rightPriceScale:{borderColor:'#2a3544',visible:!blind,scaleMargins:{top:.08,bottom:.22}},
      timeScale:{borderColor:'#2a3544',visible:!blind,timeVisible:true,secondsVisible:false,rightOffset:6},
      handleScroll:{mouseWheel:true,pressedMouseMove:true,horzTouchDrag:true,vertTouchDrag:true},
      handleScale:{axisPressedMouseMove:true,mouseWheel:true,pinch:true},
    });
    const candle=chart.addCandlestickSeries({upColor:'#26a69a',downColor:'#ef5350',borderUpColor:'#26a69a',borderDownColor:'#ef5350',wickUpColor:'#26a69a',wickDownColor:'#ef5350'});
    const volume=chart.addHistogramSeries({color:'#26a69a66',priceFormat:{type:'volume'},priceScaleId:'volume',priceLineVisible:false,lastValueVisible:false});
    chart.priceScale('volume').applyOptions({scaleMargins:{top:.82,bottom:0}});
    const vwap=chart.addLineSeries({color:'#d9a441',lineWidth:2,priceLineVisible:false,lastValueVisible:false});
    const ema=chart.addLineSeries({color:'#61a5ff',lineWidth:2,priceLineVisible:false,lastValueVisible:false});
    const dema=chart.addLineSeries({color:'#c084fc',lineWidth:2,priceLineVisible:false,lastValueVisible:false});
    chartRef.current=chart;candleRef.current=candle;volumeRef.current=volume;vwapRef.current=vwap;emaRef.current=ema;demaRef.current=dema;

    const ro=new ResizeObserver(()=>{chart.applyOptions({width:el.clientWidth||800,height:Math.max(320,Math.round(el.clientWidth*.53))});});
    ro.observe(el);
    return()=>{ro.disconnect();chart.remove();chartRef.current=null;candleRef.current=null;volumeRef.current=null;vwapRef.current=null;emaRef.current=null;demaRef.current=null;priceLinesRef.current=[];};
  },[blind]);

  useEffect(()=>{
    const chart=chartRef.current,candle=candleRef.current,volume=volumeRef.current,vwap=vwapRef.current,ema=emaRef.current,dema=demaRef.current;
    if(!chart||!candle||!volume||!vwap||!ema||!dema||!bars.length)return;
    const candleData=bars.map(b=>({time:b.time as Time,open:b.open,high:b.high,low:b.low,close:b.close}));
    const volumeData=bars.map(b=>({time:b.time as Time,value:b.volume||1,color:b.close>=b.open?'#26a69a66':'#ef535066'}));
    candle.setData(candleData);volume.setData(volumeData);
    const vwapData=computeVWAP(bars).map(x=>({time:x.time as Time,value:x.value}));
    const emaData=computeEMA(bars,20).map(x=>({time:x.time as Time,value:x.value}));
    const demaData=computeDEMA(bars,15).map(x=>({time:x.time as Time,value:x.value}));
    vwap.setData(vwapData);ema.setData(emaData);dema.setData(demaData);
    vwap.applyOptions({visible:!blind&&showVwap});ema.applyOptions({visible:!blind&&showEma});dema.applyOptions({visible:!blind&&showDema});volume.applyOptions({visible:!blind&&showVol});

    priceLinesRef.current.forEach(line=>candle.removePriceLine(line));priceLinesRef.current=[];
    if(!blind&&showLevels){
      const levels=sessionLevels??{rthHigh:null,rthLow:null,ethHigh:null,ethLow:null};
      const fallback=bars.slice(0,Math.max(1,Math.min(45,bars.length)));
      const pdh=Math.max(...fallback.map(b=>b.high)),pdl=Math.min(...fallback.map(b=>b.low));
      priceLinesRef.current.push(candle.createPriceLine({price:pdh,color:'#667085',lineWidth:1,lineStyle:2,axisLabelVisible:true,title:'PDH'}));
      priceLinesRef.current.push(candle.createPriceLine({price:pdl,color:'#667085',lineWidth:1,lineStyle:2,axisLabelVisible:true,title:'PDL'}));
      if(levels.rthHigh!==null)priceLinesRef.current.push(candle.createPriceLine({price:levels.rthHigh,color:'#8b97a8',lineWidth:1,lineStyle:1,axisLabelVisible:true,title:'RTH H'}));
      if(levels.rthLow!==null)priceLinesRef.current.push(candle.createPriceLine({price:levels.rthLow,color:'#8b97a8',lineWidth:1,lineStyle:1,axisLabelVisible:true,title:'RTH L'}));
      if(levels.ethHigh!==null)priceLinesRef.current.push(candle.createPriceLine({price:levels.ethHigh,color:'#596579',lineWidth:1,lineStyle:1,axisLabelVisible:true,title:'ETH H'}));
      if(levels.ethLow!==null)priceLinesRef.current.push(candle.createPriceLine({price:levels.ethLow,color:'#596579',lineWidth:1,lineStyle:1,axisLabelVisible:true,title:'ETH L'}));
    }
    if(!blind&&entryPrice!==null)priceLinesRef.current.push(candle.createPriceLine({price:entryPrice,color:'#6f8cff',lineWidth:1,lineStyle:2,axisLabelVisible:true,title:'Entry'}));
    if(!blind&&slPrice!==null)priceLinesRef.current.push(candle.createPriceLine({price:slPrice,color:'#ef5350',lineWidth:1,lineStyle:3,axisLabelVisible:true,title:'SL'}));
    if(!blind&&tpPrice!==null)priceLinesRef.current.push(candle.createPriceLine({price:tpPrice,color:'#26a69a',lineWidth:1,lineStyle:3,axisLabelVisible:true,title:'TP'}));
    chart.timeScale().fitContent();
  },[bars,blind,showVwap,showEma,showDema,showLevels,showVol,entryPrice,slPrice,tpPrice,sessionLevels]);

  return <div className="chart-wrap"><div ref={ref} className="tape-chart" />{!blind&&<div className="chart-legend"><span>VWAP</span><span>EMA 20</span><span>DEMA</span><span className="legend-note">Interactive chart · {dataSourceLabel'}</span></div>}</div>;
}
