/** Preserve browser focus and progressive disclosure across a data-only render. */
const attributes=['action','filter','item','project'];
export function captureViewState(doc=document) {
  const active=doc.activeElement;
  let focus=null;
  if(active?.id)focus={kind:'id',value:active.id,selectionStart:active.selectionStart};
  else if(active?.matches?.('.demo-controls summary'))focus={kind:'summary'};
  else for(const kind of attributes)if(active?.dataset?.[kind]){focus={kind,value:active.dataset[kind],itemId:active.dataset.id??null};break;}
  return {focus,disclosureOpen:Boolean(doc.querySelector('.demo-controls')?.open)};
}
export function restoreViewState(state,doc=document) {
  if(!state)return;
  const disclosure=doc.querySelector('.demo-controls');if(disclosure)disclosure.open=state.disclosureOpen;
  const focus=state.focus;if(!focus)return;
  let target;
  if(focus.kind==='id')target=doc.getElementById(focus.value);
  else if(focus.kind==='summary')target=doc.querySelector('.demo-controls summary');
  else if(attributes.includes(focus.kind))target=[...doc.querySelectorAll(`[data-${focus.kind}]`)].find(node=>node.dataset[focus.kind]===focus.value&&(focus.itemId===null||node.dataset.id===focus.itemId));
  if(!target||target.disabled)return;
  target.focus({preventScroll:true});
  if(typeof focus.selectionStart==='number')target.setSelectionRange?.(focus.selectionStart,focus.selectionStart);
}
