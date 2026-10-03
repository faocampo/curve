/** Bounded MCP 2025-06-18 stdio prototype; synthetic data only; no listener. */
import { CONTEXT } from './lib/demo.mjs';
import { SqlitePilotStore } from './lib/store.mjs';
import { exact } from './lib/core.mjs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
export const SUPPORTED_PROTOCOL_VERSIONS = Object.freeze(['2025-06-18']);
export function negotiateProtocolVersion(requested) {
  if (typeof requested !== 'string' || !requested.trim() || requested.length > 40) throw new Error('Invalid protocol version');
  return SUPPORTED_PROTOCOL_VERSIONS.includes(requested) ? requested : SUPPORTED_PROTOCOL_VERSIONS[0];
}
const empty = {type:'object',properties:{},additionalProperties:false};
const tools = [
  {name:'list_attention',description:'Read synthetic personal attention items and their source evidence references.',inputSchema:empty},
  {name:'list_projects',description:'Read synthetic existing-project references, source tasks and historical coverage.',inputSchema:empty},
  {name:'read_project_outlook',description:'Read one exact project reference in the fixed synthetic session scope.',inputSchema:{type:'object',properties:{projectId:{type:'string'}},required:['projectId'],additionalProperties:false}},
  {name:'read_evidence',description:'Read one currently accessible synthetic source evidence observation.',inputSchema:{type:'object',properties:{evidenceId:{type:'string'}},required:['evidenceId'],additionalProperties:false}},
  {name:'read_refresh_health',description:'Read source coverage, last observation and disabled-connection status.',inputSchema:empty},
].map((tool) => ({...tool,annotations:{readOnlyHint:true,destructiveHint:false,idempotentHint:true,openWorldHint:false}}));
export function createMcpSession({store = null} = {}) {
  let activeStore = store; let phase = 'new';
  const getStore = () => activeStore ??= new SqlitePilotStore({readOnly:true});
  const error = (id,code,message) => ({jsonrpc:'2.0',id:id ?? null,error:{code,message}});
  function handle(request) {
    if (!request || typeof request !== 'object' || Array.isArray(request) || request.jsonrpc !== '2.0' || typeof request.method !== 'string' || (request.id !== undefined && typeof request.id !== 'string' && !Number.isInteger(request.id))) return error(null,-32600,'Invalid request');
    if (request.id === undefined) {
      if (request.method === 'notifications/initialized' && phase === 'initializing') phase = 'ready';
      return null;
    }
    const ok = (result) => ({jsonrpc:'2.0',id:request.id,result});
    if (request.method === 'initialize') {
      if (phase !== 'new') return error(request.id,-32600,'Already initialized');
      if (!request.params || typeof request.params.protocolVersion !== 'string' || !request.params.protocolVersion.trim() || request.params.protocolVersion.length > 40 || typeof request.params.clientInfo?.name !== 'string' || typeof request.params.clientInfo?.version !== 'string' || !request.params.capabilities || typeof request.params.capabilities !== 'object' || Array.isArray(request.params.capabilities)) return error(request.id,-32602,'Invalid initialization');
      const protocolVersion = negotiateProtocolVersion(request.params.protocolVersion);
      phase = 'initializing';
      return ok({protocolVersion,capabilities:{tools:{listChanged:false}},serverInfo:{name:'curve-synthetic-attention-pilot',version:'0.2.0'},instructions:'Synthetic candidate pilot only. Scope is fixed by this local process. Reads use the same durable synthetic store as the local UI server. All tools are read-only; no live provider, import, approval or source-write capability exists.'});
    }
    if (request.method === 'ping') return ok({});
    if (phase !== 'ready') return error(request.id,-32002,'Initialize the session first');
    if (request.method === 'tools/list') return ok({tools});
    if (request.method !== 'tools/call') return error(request.id,-32601,'Method not found');
    try {
      exact(request.params,['name','arguments'],['name']);
      const {name,arguments:args = {}} = request.params;
      const tool = tools.find((t) => t.name === name); if (!tool) return error(request.id,-32602,'Unknown read-only tool');
      exact(args,Object.keys(tool.inputSchema.properties),tool.inputSchema.required ?? []);
      const snapshot = getStore().read(CONTEXT), {view,version} = snapshot; let result;
      if (name === 'list_attention') result = {version,items:view.items,coverage:view.refresh.coverage,provenance:'synthetic'};
      else if (name === 'list_projects') result = {version,projects:view.projects,provenance:'synthetic'};
      else if (name === 'read_project_outlook') {
        if (typeof args.projectId !== 'string') throw new Error();
        const project = view.projects.find((p) => p.id === args.projectId); if (!project) throw new Error(); result = {version,project};
      } else if (name === 'read_evidence') {
        if (typeof args.evidenceId !== 'string') throw new Error();
        result = getStore().readEvidence(CONTEXT,args.evidenceId);
      } else result = {version,sources:view.sources,refresh:view.refresh,provenance:'synthetic'};
      return ok({content:[{type:'text',text:JSON.stringify(result)}],isError:false});
    } catch { return ok({content:[{type:'text',text:'Requested data is unavailable in this synthetic session scope, or the arguments are invalid.'}],isError:true}); }
  }
  handle.close = () => {if(!store)activeStore?.close();};
  return handle;
}
export function serveStdio(input = process.stdin, output = process.stdout) {
  const handle = createMcpSession(); let pending = Buffer.alloc(0), discarding = false;
  const send = (message) => {if(message) output.write(JSON.stringify(message)+'\n');};
  input.on('end',()=>handle.close());
  input.on('data',(chunk) => {
    pending = Buffer.concat([pending,Buffer.from(chunk)]);
    let newline;
    while ((newline = pending.indexOf(10)) !== -1) {
      const line = pending.subarray(0,newline); pending = pending.subarray(newline+1);
      if (discarding) {discarding=false;continue;}
      if (line.length > 65536) {send({jsonrpc:'2.0',id:null,error:{code:-32600,message:'Message exceeds local limit'}});continue;}
      if (line.length === 0) continue;
      try {send(handle(JSON.parse(line.toString('utf8'))));}
      catch {send({jsonrpc:'2.0',id:null,error:{code:-32700,message:'Parse error'}});}
    }
    if (pending.length > 65536) {pending=Buffer.alloc(0);discarding=true;send({jsonrpc:'2.0',id:null,error:{code:-32600,message:'Message exceeds local limit'}});}
  });
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) serveStdio();
