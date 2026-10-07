import { writeSync } from 'node:fs';
import { SqlitePilotStore } from '../../lib/store.mjs';
import { CONTEXT } from '../../lib/demo.mjs';
const mode=process.argv[2],filePath=process.argv[3];
const output=(value)=>writeSync(1,JSON.stringify(value)+'\n');
const fault=(stage)=>{if(mode==='hold-before-commit'&&stage==='before-commit'){output({uncommitted:true});Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,30000);}};
const store=new SqlitePilotStore({filePath,readOnly:mode==='read',fault});
if(mode==='read'){output(store.read());store.close();}
else{output({ready:true});let buffer='';process.stdin.on('data',(chunk)=>{buffer+=chunk;const end=buffer.indexOf('\n');if(end<0)return;const command=JSON.parse(buffer.slice(0,end));try{output({ok:true,result:store.apply(CONTEXT,command)});}catch(error){output({ok:false,error:error.code});}store.close();process.exit(0);});}
