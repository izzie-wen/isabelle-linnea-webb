import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.join(path.dirname(fileURLToPath(import.meta.url)),'dist');
const port=process.env.PORT || 8080;
const mime={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.json':'application/json','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.xml':'application/xml','.txt':'text/plain'};
http.createServer((req,res)=>{
  const clean=decodeURIComponent(req.url.split('?')[0]);
  let p=path.join(root,clean==='/'?'index.html':clean.replace(/^\//,''));
  if(!p.startsWith(root)){res.writeHead(403);res.end('Forbidden');return;}
  fs.stat(p,(err,st)=>{
    if(err||!st.isFile()){p=path.join(root,'404.html');res.statusCode=404;}
    const ext=path.extname(p).toLowerCase();res.setHeader('Content-Type',mime[ext]||'application/octet-stream');fs.createReadStream(p).pipe(res);
  });
}).listen(port,()=>console.log(`Preview: http://localhost:${port}`));
