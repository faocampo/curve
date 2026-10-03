"""Optional developer check. Requires Python jsonschema, never live sources."""
import json
import pathlib
import subprocess
from jsonschema import Draft202012Validator, FormatChecker
root = pathlib.Path(__file__).resolve().parents[1]
schema = json.loads((root / 'contracts/candidate.schema.json').read_text())
Draft202012Validator.check_schema(schema)
fixtures = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', """
import {makeService,CONTEXT,START,binding,batch} from './lib/demo.mjs';
const s=makeService();const project=s.bindProject(CONTEXT,binding());const run=s.refresh(CONTEXT,batch());
const item=s.listAttention(CONTEXT,START)[0];const evidence=s.readEvidence(CONTEXT,item.evidenceId,START);
const review=s.recordDisposition(CONTEXT,{itemId:item.id,action:'handled',snoozeUntil:null,requestId:'schema-review',expectedEvidenceId:item.evidenceId},START);
console.log(JSON.stringify({SourceEvidence:evidence,AttentionItem:item,ProjectBinding:project,ReviewDisposition:review,RefreshRun:run}));
"""],cwd=root))
for name, value in fixtures.items():
    definition = schema['$defs'][name]
    validator = Draft202012Validator(definition,format_checker=FormatChecker())
    validator.validate(value)
    invalid = {**value, 'runtimeApproved': True}
    assert not validator.is_valid(invalid), name
    print(f'{name}: output valid; extra authority field rejected')
print('Candidate schema: 5 positive and 5 negative fixtures passed.')

commands_schema = json.loads((root / 'contracts/local-command.schema.json').read_text())
Draft202012Validator.check_schema(commands_schema)
command_validator = Draft202012Validator(commands_schema)
for action in [{'type': 'handled', 'itemId': 'synthetic-item'}, {'type': 'reset'}]:
    command_validator.validate({'requestId': 'synthetic-request', 'expectedVersion': 0, 'action': action})
for invalid in [
    {'requestId': 'synthetic-request', 'expectedVersion': 0, 'action': {'type': 'handled'}},
    {'requestId': 'synthetic-request', 'expectedVersion': -1, 'action': {'type': 'reset'}},
    {'requestId': 'synthetic-request', 'expectedVersion': 0, 'action': {'type': 'approve'}},
    {'requestId': 'synthetic-request', 'expectedVersion': 0, 'action': {'type': 'reset'}, 'workspaceId': 'other'},
]:
    assert not command_validator.is_valid(invalid)
print('Local command schema: 2 positive and 4 negative fixtures passed.')
