/** Candidate-only local persistence. Source providers remain disabled. */
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, existsSync, lstatSync, openSync, closeSync } from 'node:fs';
import { dirname, isAbsolute, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createDemo, CONTEXT } from './demo.mjs';
import { canonical, exact, immutable, PilotError } from './core.mjs';
export const STORE_EDITION = 'attention-local-store-v0.2';
export const MAX_COMMANDS = 1000;
const root = fileURLToPath(new URL('..', import.meta.url));
export function defaultStorePath() {
  const directory = process.env.CURVE_PILOT_DATA_DIR ?? resolve(root, '.local-data');
  if (!isAbsolute(directory)) throw new PilotError('INVALID_DATA_DIRECTORY');
  return resolve(directory, 'synthetic-state.sqlite');
}
export function validateCommand(command) {
  exact(command,['requestId','expectedVersion','action']);
  if (typeof command.requestId !== 'string' || !/^[A-Za-z0-9_-]{1,100}$/.test(command.requestId) || !Number.isSafeInteger(command.expectedVersion) || command.expectedVersion < 0 || command.expectedVersion > MAX_COMMANDS) throw new PilotError('INVALID_COMMAND');
  exact(command.action,['type','itemId'],['type']);
  if (!['handled','snooze','reopen','refresh','material-change','advance-day','reset','partial-refresh','failed-refresh'].includes(command.action.type)) throw new PilotError('INVALID_COMMAND');
  if (['handled','snooze','reopen'].includes(command.action.type)) {
    if (typeof command.action.itemId !== 'string' || command.action.itemId.length > 2000 || !command.action.itemId) throw new PilotError('INVALID_COMMAND');
  } else if ('itemId' in command.action) throw new PilotError('INVALID_COMMAND');
  return immutable(command);
}
function storeError(error) {
  if (error instanceof PilotError) return error;
  if (/busy|locked/i.test(error?.message ?? '')) return new PilotError('STORE_BUSY');
  return new PilotError('STORE_WRITE_FAILED');
}
export class SqlitePilotStore {
  #db; #scope; #readOnly; #fault;
  constructor({filePath = defaultStorePath(), scope = CONTEXT, readOnly = false, busyTimeoutMs = 1500, fault = () => {}} = {}) {
    exact(scope,['workspaceId','subjectId']);
    if (scope.workspaceId !== CONTEXT.workspaceId || scope.subjectId !== CONTEXT.subjectId) throw new PilotError('NOT_FOUND');
    if (!isAbsolute(filePath) || !Number.isInteger(busyTimeoutMs) || busyTimeoutMs < 0 || busyTimeoutMs > 5000) throw new PilotError('INVALID_STORE_CONFIG');
    this.#scope = immutable(scope); this.#readOnly = readOnly; this.#fault = fault;
    const directory = dirname(filePath);
    if (!readOnly) mkdirSync(directory,{recursive:true,mode:0o700});
    if (!existsSync(directory) || lstatSync(directory).isSymbolicLink() || !lstatSync(directory).isDirectory()) throw new PilotError('STORE_NOT_READY');
    if (!existsSync(filePath)) {
      if (readOnly) throw new PilotError('STORE_NOT_READY');
      try {closeSync(openSync(filePath,'wx',0o600));} catch (error) {if(error.code !== 'EEXIST')throw new PilotError('STORE_WRITE_FAILED');}
    }
    if (lstatSync(filePath).isSymbolicLink() || !lstatSync(filePath).isFile()) throw new PilotError('UNSAFE_STORE_PATH');
    if (process.platform !== 'win32' && ((lstatSync(directory).mode & 0o077) || (lstatSync(filePath).mode & 0o077))) throw new PilotError('UNSAFE_STORE_PERMISSIONS');
    for (const suffix of ['-wal','-shm']) if(existsSync(filePath+suffix)&&lstatSync(filePath+suffix).isSymbolicLink())throw new PilotError('UNSAFE_STORE_PATH');
    try {
      this.#db = new DatabaseSync(filePath,{readOnly});
      this.#db.exec(`PRAGMA busy_timeout=${busyTimeoutMs}; PRAGMA trusted_schema=OFF; PRAGMA foreign_keys=ON;`);
      if (readOnly) this.#db.exec('PRAGMA query_only=ON;');
      else {
        this.#db.exec(`PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL;
          CREATE TABLE IF NOT EXISTS pilot_state (
            singleton INTEGER PRIMARY KEY CHECK (singleton=1),
            edition TEXT NOT NULL, workspace_id TEXT NOT NULL, subject_id TEXT NOT NULL,
            version INTEGER NOT NULL CHECK (version>=0), commands_json TEXT NOT NULL
          ) STRICT;`);
        this.#db.prepare('INSERT OR IGNORE INTO pilot_state VALUES (1, ?, ?, ?, 0, ?)').run(STORE_EDITION,scope.workspaceId,scope.subjectId,'[]');
      }
      this.#readDocument();
    } catch (error) { this.#db?.close(); throw error instanceof PilotError ? error : new PilotError('STORE_NOT_READY'); }
  }
  #authorize(ctx) {
    if (!ctx || ctx.workspaceId !== this.#scope.workspaceId || ctx.subjectId !== this.#scope.subjectId) throw new PilotError('NOT_FOUND');
  }
  #readDocument() {
    const row = this.#db.prepare('SELECT edition, workspace_id, subject_id, version, commands_json FROM pilot_state WHERE singleton=1').get();
    if (!row || row.edition !== STORE_EDITION || row.workspace_id !== this.#scope.workspaceId || row.subject_id !== this.#scope.subjectId) throw new PilotError('STORE_SCOPE_MISMATCH');
    let commands;
    try {commands=JSON.parse(row.commands_json);} catch {throw new PilotError('CORRUPT_STORE');}
    if (!Array.isArray(commands) || commands.length > MAX_COMMANDS || row.version !== commands.length) throw new PilotError('CORRUPT_STORE');
    const seen = new Set();
    for (const [index,command] of commands.entries()) {
      validateCommand(command);
      if (command.expectedVersion !== index || seen.has(command.requestId)) throw new PilotError('CORRUPT_STORE');
      seen.add(command.requestId);
    }
    return {version:row.version,commands};
  }
  #project(document) {
    const demo = createDemo(document.commands.map((c)=>c.action));
    return {demo,snapshot:immutable({edition:STORE_EDITION,...this.#scope,version:document.version,view:demo.view()})};
  }
  read(ctx = CONTEXT) {this.#authorize(ctx);return this.#project(this.#readDocument()).snapshot;}
  readEvidence(ctx, evidenceId) {
    this.#authorize(ctx);
    const document=this.#readDocument(), {demo}=this.#project(document);
    return immutable({version:document.version,evidence:demo.readEvidence(evidenceId)});
  }
  apply(ctx, input) {
    this.#authorize(ctx); if(this.#readOnly)throw new PilotError('READ_ONLY_STORE');
    const command=validateCommand(input); let began=false;
    try {
      this.#db.exec('BEGIN IMMEDIATE'); began=true;
      const document=this.#readDocument();
      const duplicate=document.commands.find((c)=>c.requestId===command.requestId);
      if (duplicate) {
        if (canonical(duplicate)!==canonical(command)) throw new PilotError('IDEMPOTENCY_CONFLICT');
        const snapshot=this.#project(document).snapshot;
        this.#db.exec('ROLLBACK');began=false;
        return immutable({duplicate:true,appliedVersion:duplicate.expectedVersion+1,snapshot});
      }
      if (command.expectedVersion!==document.version)throw new PilotError('VERSION_CONFLICT');
      if (document.commands.length>=MAX_COMMANDS)throw new PilotError('STORE_CAPACITY');
      const next={version:document.version+1,commands:[...document.commands,command]};
      const snapshot=this.#project(next).snapshot;
      this.#fault('before-write');
      this.#db.prepare('UPDATE pilot_state SET version=?, commands_json=? WHERE singleton=1 AND workspace_id=? AND subject_id=? AND version=?').run(next.version,JSON.stringify(next.commands),this.#scope.workspaceId,this.#scope.subjectId,document.version);
      this.#fault('before-commit');
      this.#db.exec('COMMIT');began=false;
      // A transport failure after this point is reconciled by replaying the same request ID.
      return immutable({duplicate:false,appliedVersion:next.version,snapshot});
    } catch(error) {
      if(began) {try{this.#db.exec('ROLLBACK');}catch{/* Leave reconciliation to an authoritative read on retry. */}}
      throw storeError(error);
    }
  }
  close(){this.#db.close();}
}
