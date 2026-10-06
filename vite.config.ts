import fs from 'node:fs';
import path from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function privateHistoricalDataPlugin():Plugin{
  const root=path.resolve(process.cwd(),'private-data','firstrate');
  return{
    name:'private-historical-data',
    apply:'serve',
    configureServer(server){
      server.middlewares.use('/data/local-historical',(req,res,next)=>{
        const requestPath=decodeURIComponent((req.url??'/').split('?')[0]??'/').replace(/^\/+/, '');
        const target=path.resolve(root,requestPath);
        if(target!==root&&!target.startsWith(root+path.sep)){
          res.statusCode=403;
          res.end('Forbidden');
          return;
        }
        fs.stat(target,(error,stat)=>{
          if(error||!stat.isFile()){
            next();
            return;
          }
          res.setHeader('Cache-Control','no-store');
          res.setHeader('Content-Type',target.endsWith('.json')?'application/json; charset=utf-8':'application/octet-stream');
          fs.createReadStream(target).pipe(res);
        });
      });
    }
  };
}

export default defineConfig({
  plugins: [react(),privateHistoricalDataPlugin()],
  build: { target: 'es2022' },
});
