/** Optional isolated interoperability harness; SDK is not a runtime dependency. */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SqlitePilotStore } from '../lib/store.mjs';
import { createServer } from '../server.mjs';
const sdkDirectory=resolve(process.argv[2]??'../attention-sdk-check');
const require=createRequire(join(sdkDirectory,'package.json'));
const {Client}=require('@modelcontextprotocol/sdk/client/index.js');
const {StdioClientTransport}=require('@modelcontextprotocol/sdk/client/stdio.js');
const sdkVersion=JSON.parse(readFileSync(join(sdkDirectory,'node_modules/@modelcontextprotocol/sdk/package.json'),'utf8')).version;
assert.equal(sdkVersion,'1.32.0','Requalify intentionally before changing the SDK test pin.');
const root=fileURLToPath(new URL('..',import.meta.url));
const directory=mkdtempSync(join(tmpdir(),'curve-official-sdk-'));
let store=new SqlitePilotStore({filePath:join(directory,'synthetic-state.sqlite')});
let server=createServer({store,ownsStore:false}),client;
const start=()=>new Promise(r=>server.listen(0,'127.0.0.1',r));
const stop=()=>new Promise(r=>server.close(r));
async function connect(){const next=new Client({name:'curve-local-interop-check',version:'0.2.0'},{capabilities:{}});const transport=new StdioClientTransport({command:process.execPath,args:[join(root,'mcp.mjs')],cwd:root,env:{CURVE_PILOT_DATA_DIR:directory},stderr:'pipe'});await next.connect(transport);return next;}
async function call(name,args={}){const result=await client.callTool({name,arguments:args});assert.equal(result.isError,false);return JSON.parse(result.content.find(c=>c.type==='text').text);}
try{
  await start();client=await connect();
  assert.equal(client.getServerVersion().version,'0.2.0');
  const discovered=await client.listTools();assert.equal(discovered.tools.length,5);assert.ok(discovered.tools.every(t=>t.annotations.readOnlyHint));
  const initial=await call('list_attention');assert.equal(initial.version,0);assert.equal(initial.items[0].status,'open');
  const sourceBefore=await call('list_projects');
  const origin=`http://127.0.0.1:${server.address().port}`;
  const state=await(await fetch(origin+'/api/state')).json();
  const response=await fetch(origin+'/api/actions',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json','X-Curve-CSRF':state.csrfToken},body:JSON.stringify({requestId:'official-sdk-http-review',expectedVersion:state.snapshot.version,action:{type:'handled',itemId:initial.items[0].id}})});
  assert.equal(response.status,200);
  const shared=await call('list_attention');assert.equal(shared.version,1);assert.equal(shared.items[0].status,'handled');
  const evidence=await call('read_evidence',{evidenceId:shared.items[0].evidenceId});assert.equal(evidence.version,1);assert.equal(evidence.evidence.provenance,'synthetic');
  const projects=await call('list_projects');assert.deepEqual(projects.projects,sourceBefore.projects);
  const project=await call('read_project_outlook',{projectId:projects.projects[0].id});assert.equal(project.project.governance,'reference-only');
  assert.equal((await call('read_refresh_health')).version,1);
  await client.close();client=undefined;await stop();store.close();
  store=new SqlitePilotStore({filePath:join(directory,'synthetic-state.sqlite')});server=createServer({store,ownsStore:false});await start();client=await connect();
  const restarted=await call('list_attention');assert.equal(restarted.version,1);assert.equal(restarted.items[0].status,'handled');
  const uiAfterRestart=await(await fetch(`http://127.0.0.1:${server.address().port}/api/state`)).json();assert.equal(uiAfterRestart.snapshot.view.items[0].status,'handled');
  console.log(JSON.stringify({sdk:'@modelcontextprotocol/sdk',sdkVersion,node:process.version,serverVersion:client.getServerVersion().version,passed:['initialize','listTools','all five read-only callTool methods','HTTP disposition visible to MCP','source tasks unchanged','UI/server and MCP restart persistence']},null,2));
}finally{await client?.close();if(server.listening)await stop();store.close();rmSync(directory,{recursive:true,force:true});}
