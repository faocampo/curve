import http from 'node:http';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { SqlitePilotStore } from './lib/store.mjs';
import { CONTEXT } from './lib/demo.mjs';
const root = fileURLToPath(new URL('.', import.meta.url));
const routes={'/':['public/index.html','text/html'],'/index.html':['public/index.html','text/html'],'/app.mjs':['public/app.mjs','text/javascript'],'/view-state.mjs':['public/view-state.mjs','text/javascript'],'/style.css':['public/style.css','text/css'],'/assets/curve-logo.webp':['public/assets/curve-logo.webp','image/webp']};
const MAX_BODY=8192;
function constantEquals(left,right){const a=Buffer.from(left??''),b=Buffer.from(right);return a.length===b.length&&timingSafeEqual(a,b);}
async function body(req){let bytes=0;const chunks=[];for await(const chunk of req){bytes+=chunk.length;if(bytes>MAX_BODY){const error=new Error();error.code='BODY_TOO_LARGE';throw error;}chunks.push(chunk);}return JSON.parse(Buffer.concat(chunks).toString('utf8'));}
export function createServer({store = new SqlitePilotStore(), ownsStore = true} = {}) {
  const csrfToken=randomBytes(32).toString('base64url');
  const server=http.createServer(async(req,res)=>{
    const localPort=req.socket.localPort,host=req.headers.host,origin=`http://${host}`;
    const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Cross-Origin-Resource-Policy':'same-origin','Content-Security-Policy':"default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'"};
    function json(status,value){res.writeHead(status,{...headers,'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(value));}
    if(![`127.0.0.1:${localPort}`,`localhost:${localPort}`].includes(host)||(req.headers.origin&&req.headers.origin!==origin)||req.headers['sec-fetch-site']==='cross-site'){json(403,{error:'ORIGIN_REJECTED'});return;}
    if(req.url==='/api/state'&&req.method==='GET'){
      try{json(200,{csrfToken,snapshot:store.read(CONTEXT)});}catch{json(503,{error:'STORE_UNAVAILABLE'});}return;
    }
    if(req.url==='/api/actions'&&req.method==='POST'){
      if(req.headers.origin!==origin||!constantEquals(req.headers['x-curve-csrf'],csrfToken)){json(403,{error:'CSRF_REJECTED'});return;}
      if(req.headers['content-type']!=='application/json'){json(415,{error:'JSON_REQUIRED'});return;}
      if(Number(req.headers['content-length']??0)>MAX_BODY){json(413,{error:'BODY_TOO_LARGE'});return;}
      let command;
      try{command=await body(req);}catch(error){json(error.code==='BODY_TOO_LARGE'?413:400,{error:error.code==='BODY_TOO_LARGE'?'BODY_TOO_LARGE':'INVALID_JSON'});return;}
      try{json(200,store.apply(CONTEXT,command));}catch(error){const conflict=['VERSION_CONFLICT','IDEMPOTENCY_CONFLICT'].includes(error.code);const unavailable=['STORE_BUSY','STORE_WRITE_FAILED'].includes(error.code);json(conflict?409:unavailable?503:400,{error:error.code??'INVALID_COMMAND'});}return;
    }
    if(!['GET','HEAD'].includes(req.method)){json(405,{error:'METHOD_NOT_ALLOWED'});return;}
    const route=routes[req.url?.split('?')[0]];
    if(!route){json(404,{error:'NOT_FOUND'});return;}
    try{const bytes=await readFile(resolve(root,route[0]));res.writeHead(200,{...headers,'Content-Type':`${route[1]}; charset=utf-8`});res.end(req.method==='HEAD'?undefined:bytes);}catch{json(500,{error:'ASSET_UNAVAILABLE'});}
  });
  if(ownsStore)server.on('close',()=>store.close());
  server.requestTimeout=10000;server.headersTimeout=10000;
  return server;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const port=Number(process.env.PORT??4319);
  if(!Number.isInteger(port)||port<1024||port>65535)throw new Error('Invalid local port');
  createServer().listen(port,'127.0.0.1',()=>console.log(`Synthetic Curve pilot v0.2: http://127.0.0.1:${port}`));
}
