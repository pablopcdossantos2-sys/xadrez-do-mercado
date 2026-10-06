/*
 * Xadrez do Mercado
 *
 * Aplicação web de treinamento interativo desenvolvida de forma independente por
 * Pablo Phillipe Cândido dos Santos para o exercício de tomada de decisão em
 * mercados futuros por meio de puzzles de price action e replay.
 *
 * Independently developed interactive web training application for futures-market
 * decision practice through price-action puzzles and replay.
 *
 * Ferramentas de inteligência artificial generativa foram utilizadas como recurso
 * auxiliar; a concepção, implementação, integração e verificação permanecem sob
 * responsabilidade do autor.
 *
 * Generative AI tools were used as an auxiliary development resource; conception,
 * implementation, integration, and verification remain the author's responsibility.
 *
 * Currículo Lattes: http://lattes.cnpq.br/9500873674712528
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

if('serviceWorker' in navigator){window.addEventListener('load',()=>{void navigator.serviceWorker.register('/sw.js').catch(()=>undefined);});}
