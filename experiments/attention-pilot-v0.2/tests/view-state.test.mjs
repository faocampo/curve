import test from 'node:test';
import assert from 'node:assert/strict';
import { captureViewState, restoreViewState } from '../public/view-state.mjs';
function fixture({kind='action',value='refresh',id='',itemId,open=true,summary=false}={}){
  const details={open},state={focused:null,selection:null};
  const button={id,dataset:{[kind]:value,...(itemId?{id:itemId}:{})},disabled:false,selectionStart:id?3:undefined,matches:()=>summary,focus:()=>state.focused=button,setSelectionRange:(a,b)=>state.selection=[a,b]};
  const doc={activeElement:button,querySelector:selector=>selector==='.demo-controls'?details:selector==='.demo-controls summary'?button:null,querySelectorAll:()=>[button],getElementById:value=>button.id===value?button:null};
  return{doc,details,button,state};
}
test('refresh/scenario actions retain keyboard focus and open disclosure after render',()=>{for(const value of ['refresh','material-change','advance-day','partial-refresh','failed-refresh','reset']){const before=fixture({value}),saved=captureViewState(before.doc),after=fixture({value,open:false});restoreViewState(saved,after.doc);assert.equal(after.details.open,true);assert.equal(after.state.focused,after.button);}});
test('closed demo disclosure stays closed after another view update',()=>{const before=fixture({open:false}),after=fixture({open:true});restoreViewState(captureViewState(before.doc),after.doc);assert.equal(after.details.open,false);});
test('All-filter button retains exact focused identity after re-render',()=>{const before=fixture({kind:'filter',value:'all'}),after=fixture({kind:'filter',value:'all'});restoreViewState(captureViewState(before.doc),after.doc);assert.equal(after.state.focused,after.button);});
test('search preserves cursor without moving focus to the document',()=>{const before=fixture({id:'search'}),after=fixture({id:'search'});restoreViewState(captureViewState(before.doc),after.doc);assert.equal(after.state.focused,after.button);assert.deepEqual(after.state.selection,[3,3]);});
test('removed or different item action does not capture focus incorrectly',()=>{const before=fixture({value:'handled',itemId:'item-1'}),after=fixture({value:'handled',itemId:'item-2'});restoreViewState(captureViewState(before.doc),after.doc);assert.equal(after.state.focused,null);});
test('native disclosure summary can retain keyboard focus',()=>{const before=fixture({summary:true}),after=fixture({summary:true});restoreViewState(captureViewState(before.doc),after.doc);assert.equal(after.state.focused,after.button);});
