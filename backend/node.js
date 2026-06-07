/* *******************************************************************************************
 * NODE.JS CHEATSHEET
 * Modern Node.js (ESM + CJS) — v20+ LTS features
 * ******************************************************************************************* */

/* ===========================================================================================
 * PACKAGE SETUP
 * =========================================================================================== */

// package.json — set "type": "module" for ESM by default
// {
//   "name": "my-app",
//   "type": "module",        // all .js files become ESM
//   "scripts": { ... },
//   "dependencies": { ... }
// }

// Or use .mjs (always ESM) / .cjs (always CommonJS) regardless of package.json

// npm / yarn / pnpm
// npm init -y
// npm install express
// npm install -D typescript @types/node
// npx tsc --init

/* ===========================================================================================
 * ES MODULES (Primary — Modern)
 * =========================================================================================== */

// Named exports
// -------- math.mjs --------
export const pi = 3.14159;
export function add(a, b) { return a + b; }
export class Calculator { }

// Default export
export default function greet(name) {
  return `Hello, ${name}!`;
}

// Re-export
export { pi, add } from './math.js';
export * from './utils.js';
export { default as math } from './math.js';

// Import
import { pi, add } from './math.js';
import greet from './math.js';
import * as math from './math.js';        // Namespace import
import { pi as PI } from './math.js';     // Aliased

// Import JSON (ESM)
import data from './data.json' with { type: 'json' };

// Dynamic import
const { format } = await import('date-fns');

// Top-level await (ESM only — works at module top level)
const config = await import('./config.json', { with: { type: 'json' } });
export const db = await createConnection(config.url);

/* ===========================================================================================
 * COMMONJS (Legacy — keep for compatibility)
 * =========================================================================================== */

const http = require('http');
const { readFile } = require('fs/promises');
const myModule = require('./module.cjs');

// Exports
module.exports = { myFunc };
module.exports = class MyClass { };
exports.myFunc = () => {};

// __dirname / __filename replacements in ESM:
// import { fileURLToPath } from 'url';
// import { dirname } from 'path';
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

/* ===========================================================================================
 * GLOBAL OBJECTS
 * =========================================================================================== */

// ESM globals (Node.js)
import.meta.url;         // File URL of current module
import.meta.resolve;     // Resolve specifier (similar to require.resolve)
import.meta.dirname;     // Directory name (Node.js 21.2+)

process.version;         // Node version string
process.arch;            // 'x64', 'arm64', etc.
process.platform;        // 'darwin', 'linux', 'win32'
process.pid;             // Process ID
process.cwd();           // Current working directory
process.env;             // Environment variables

// process.env modern patterns (load with dotenv)
// import 'dotenv/config';
const { NODE_ENV, PORT, DATABASE_URL } = process.env;
// Validate at startup:
const required = ['DATABASE_URL', 'SECRET'];
for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing env: ${key}`);
}

// process.argv — command line args
const args = process.argv.slice(2);

/* ===========================================================================================
 * CONSOLE
 * =========================================================================================== */

console.log('stdout');         // stdout with newline
console.error('stderr');       // stderr
console.warn('warning');       // same as console.error
console.info('info');
console.debug('debug');        // hidden unless NODE_DEBUG or --inspect

console.dir(obj, { depth: 3, colors: true });  // Inspect object
console.table([{ a: 1, b: 2 }]);                // Tabular output
console.time('label');
// ... code ...
console.timeEnd('label');

console.group('Section');
console.log('nested');
console.groupEnd();

console.assert(condition, 'message');  // Only logs if false
console.trace('stack trace');          // Print stack trace

// util.inspect.formatWithOptions — for programmatic use
import { inspect } from 'node:util';
console.log(inspect(obj, { showHidden: true, depth: null, colors: true }));

/* ===========================================================================================
 * TIMERS
 * =========================================================================================== */

setTimeout(() => {}, 1000);             // One-time after delay
setInterval(() => {}, 1000);            // Repeated
setImmediate(() => {});                 // After I/O events

clearTimeout(timer);
clearInterval(timer);
clearImmediate(timer);

// Promisified timers (Node 16+)
import { setTimeout as sleep } from 'node:timers/promises';
await sleep(1000);                       // awaitable delay

// Timers with .unref() — don't keep process alive
const timer = setTimeout(() => {}, 1000).unref();

/* ===========================================================================================
 * FILE SYSTEM (fs/promises — Modern API)
 * =========================================================================================== */

import { readFile, writeFile, appendFile, readdir, mkdir, stat, cp, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';  // only sync version exists

// Reading / Writing (async)
const content = await readFile('file.txt', 'utf8');
await writeFile('output.txt', 'Hello, World!');
await appendFile('log.txt', 'new line\n');

// Directories
const files = await readdir('./src');                    // file names
await mkdir('./dist', { recursive: true });               // mkdir -p

// File info & copy / remove
const stats = await stat('file.txt');
stats.isFile();
stats.isDirectory();
stats.size;
stats.mtime;

await cp('./src', './dist', { recursive: true });        // copy
await rm('./old', { recursive: true, force: true });     // rm -rf

// Watch files
import { watch } from 'node:fs';
watch('./file.txt', (event, filename) => {
  console.log(`${filename} changed: ${event}`);
});

// Streaming
import { createReadStream, createWriteStream } from 'node:fs';
const read = createReadStream('bigfile.txt', { encoding: 'utf8', highWaterMark: 64 * 1024 });
const write = createWriteStream('output.txt');
read.pipe(write);                                        // streaming copy

// Legacy callback-based
// import { readFile } from 'node:fs';
// readFile('file.txt', 'utf8', (err, data) => {});

/* ===========================================================================================
 * PATH
 * =========================================================================================== */

import { join, resolve, dirname, basename, extname, relative, normalize, sep } from 'node:path';

join('/dir', 'sub', 'file.txt');          // /dir/sub/file.txt
resolve('dist', 'out.js');                 // Absolute path from cwd
dirname('/a/b/c.js');                      // /a/b
basename('/a/b/c.js');                     // c.js
basename('/a/b/c.js', '.js');              // c
extname('file.txt');                       // .txt
relative('/from', '/to');                  // relative path
normalize('a//b/../c');                    // a/c

// __dirname equivalent in ESM
import { fileURLToPath } from 'node:url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/* ===========================================================================================
 * STREAMS (Modern)
 * =========================================================================================== */

import { Readable, Writable, Transform, Duplex, pipeline } from 'node:stream';
import { promises as streamPromises } from 'node:stream';

// pipeline — auto-cleanup & error handling (preferred over .pipe())
await streamPromises.pipeline(
  createReadStream('input.txt'),
  new Transform({
    transform(chunk, encoding, callback) {
      this.push(chunk.toString().toUpperCase());
      callback();
    }
  }),
  createWriteStream('output.txt')
);
console.log('Pipeline done');

// Readable.from — array/iterable to stream
const stream = Readable.from(['line1\n', 'line2\n']);
stream.pipe(process.stdout);

// Readable with custom read
const customStream = new Readable({
  objectMode: true,
  read() {
    this.push(Math.random());
    this.push(null);  // end
  }
});

// Writable
const customWritable = new Writable({
  objectMode: true,
  write(chunk, encoding, callback) {
    console.log('>', chunk);
    callback();
  }
});

/* ===========================================================================================
 * EVENTS
 * =========================================================================================== */

import { EventEmitter } from 'node:events';

class MyEmitter extends EventEmitter {}
const emitter = new MyEmitter();

emitter.on('event', (data) => {});               // Listen
emitter.once('event', (data) => {});             // One-shot
emitter.off('event', handler);                   // Unlisten
emitter.removeAllListeners('event');

emitter.emit('event', { payload: 'data' });

// Error handling — always listen for 'error'
emitter.on('error', (err) => console.error(err));

// Event names can be Symbols
const MY_EVENT = Symbol('my-event');
emitter.on(MY_EVENT, () => {});
emitter.emit(MY_EVENT);

/* ===========================================================================================
 * CHILD PROCESS
 * =========================================================================================== */

import { exec, spawn, execFile, fork } from 'node:child_process';
import { promisify } from 'node:util';

// exec — shell command (buffered)
const { stdout, stderr } = await promisify(exec)('ls -la');
console.log(stdout);

// spawn — streaming output
const child = spawn('node', ['script.js'], { stdio: 'inherit' });
child.on('exit', (code) => console.log(`Exited with ${code}`));

// spawn with captured output
const child2 = spawn('find', ['.', '-name', '*.js'], { cwd: '/src' });
let output = '';
child2.stdout.on('data', (chunk) => { output += chunk; });
child2.on('close', (code) => { console.log(output); });

// fork — Node.js child (with IPC channel)
const subprocess = fork('./worker.js');
subprocess.send({ hello: 'world' });
subprocess.on('message', (msg) => console.log(msg));

// promisify
const { exec: execP } = await import('node:child_process');
const { stdout: out } = await new Promise((resolve, reject) => {
  exec('node -v', (err, stdout, stderr) => err ? reject(err) : resolve({ stdout, stderr }));
});

/* ===========================================================================================
 * WORKER THREADS (Node 12+)
 * =========================================================================================== */

// --- main.js ---
import { Worker } from 'node:worker_threads';

const worker = new Worker('./worker.mjs', {
  workerData: { input: 42 }
});
worker.on('message', (result) => console.log('Result:', result));
worker.on('error', (err) => console.error(err));
worker.on('exit', (code) => console.log(`Worker exited: ${code}`));
worker.postMessage('more data');

// --- worker.mjs ---
import { parentPort, workerData, isMainThread, threadId } from 'node:worker_threads';

console.log(`Worker ${threadId} starting with data:`, workerData);
parentPort.postMessage(workerData.input * 2);

// Receive messages
parentPort.on('message', (msg) => {
  console.log('Received:', msg);
});

// Worker pool pattern:
// Use piscina (npm) for production thread pools
// import Piscina from 'piscina';
// const pool = new Piscina({ filename: './worker.js' });
// const result = await pool.run({ data: 1 });

/* ===========================================================================================
 * HTTP / HTTPS
 * =========================================================================================== */

// Modern: use Express/Fastify/Hono instead of raw http
// But here's the low-level API:

import http from 'node:http';
import https from 'node:https';

// Server
const server = http.createServer((req, res) => {
  const { method, url, headers } = req;

  if (method === 'GET' && url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Hello, World!' }));
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});
server.listen(3000, () => console.log('Listening on :3000'));

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down...');
  server.close(() => process.exit(0));
});

// Fetch API (Node 18+ — global, no import needed)
const response = await fetch('https://api.example.com/data');
const json = await response.json();
const text = await response.text();

// HTTP client (if you need more control)
const req = http.request('http://localhost:3000', { method: 'GET' }, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log(data));
});
req.end();

/* ===========================================================================================
 * QUERY STRING / URL
 * =========================================================================================== */

import { URL, URLSearchParams } from 'node:url';

const url = new URL('https://example.com/path?name=Alice&age=30');
url.hostname;         // 'example.com'
url.pathname;         // '/path'
url.searchParams;     // URLSearchParams
url.searchParams.get('name');
url.searchParams.set('age', '31');
url.searchParams.delete('name');

const params = new URLSearchParams('a=1&b=2');
params.toString();               // 'a=1&b=2'
params.append('c', '3');
params.sort();

/* ===========================================================================================
 * CRYPTO
 * =========================================================================================== */

import { randomBytes, createHash, createHmac, randomUUID } from 'node:crypto';

// Hashing
const hash = createHash('sha256').update('hello').digest('hex');

// HMAC
const hmac = createHmac('sha256', 'secret').update('message').digest('hex');

// Random
const buf = randomBytes(32);             // Buffer
const id = randomUUID();                 // UUID v4

// Password hashing (use bcrypt instead)
// import bcrypt from 'bcrypt';
// const hash = await bcrypt.hash(password, 12);
// const match = await bcrypt.compare(input, hash);

/* ===========================================================================================
 * UTIL
 * =========================================================================================== */

import { promisify, callbackify, types } from 'node:util';

// promisify — convert callback-based to promise
const readFileP = promisify(require('fs').readFile);
const data = await readFileP('file.txt', 'utf8');

// types
types.isPromise(Promise.resolve());   // true
types.isDate(new Date());             // true

// Debugging
import debug from 'debug';            // Popular npm module
const log = debug('app:server');
log('Server started on port %d', 3000);

/* ===========================================================================================
 * ASYNC / AWAIT PATTERNS
 * =========================================================================================== */

// Promise.all — parallel execution
const [users, posts] = await Promise.all([
  fetchUsers(),
  fetchPosts(),
]);

// Promise.allSettled — don't fail fast
const results = await Promise.allSettled([
  fetchUsers(),
  fetchFailing(),
]);
for (const r of results) {
  if (r.status === 'fulfilled') console.log(r.value);
  if (r.status === 'rejected') console.error(r.reason);
}

// Promise.race — first settled
const result = await Promise.race([
  fetchData(),
  sleep(5000).then(() => { throw new Error('timeout'); }),
]);

// Promise.withResolvers (ES2024 / Node 22+)
const { promise, resolve, reject } = Promise.withResolvers();
setTimeout(() => resolve('done'), 1000);
const val = await promise;

// AbortController — cancellable async
const ac = new AbortController();
setTimeout(() => ac.abort(), 5000);
try {
  const data = await fetch('https://...', { signal: ac.signal });
} catch (err) {
  if (err.name === 'AbortError') console.log('Cancelled');
}

// Async iterators
async function* paginate(url) {
  let page = 1;
  while (true) {
    const res = await fetch(`${url}?page=${page}`);
    const data = await res.json();
    if (!data.length) break;
    yield* data;
    page++;
  }
}
for await (const item of paginate('https://api.example.com/items')) {
  console.log(item);
}

/* ===========================================================================================
 * PROCESS & SYSTEM
 * =========================================================================================== */

process.on('exit', (code) => {});                    // Process exiting
process.on('uncaughtException', (err) => {           // Unhandled error
  console.error('Uncaught:', err);
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {       // Unhandled promise rejection
  console.error('Unhandled Rejection:', reason);
});

// Graceful shutdown
async function shutdown(signal) {
  console.log(`Received ${signal}, shutting down gracefully...`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10000);          // Force exit after 10s
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Environment
process.env.NODE_ENV;                // 'development', 'production', 'test'
process.env.PORT ?? 3000;

// Memory & perf
process.memoryUsage();               // { rss, heapTotal, heapUsed, external, arrayBuffers }
process.uptime();                    // Seconds since started
performance.now();                   // High-resolution time (ms)

/* ===========================================================================================
 * TESTING (Modern)
 * =========================================================================================== */

// Node built-in test runner (Node 18+)
// import { test, describe, it, mock } from 'node:test';
// import assert from 'node:assert';
//
// describe('My feature', () => {
//   it('should work', () => {
//     assert.strictEqual(add(1, 2), 3);
//   });
//
//   it('async test', async () => {
//     const data = await fetchData();
//     assert.ok(data.length > 0);
//   });
// });
//
// Run: node --test

/* ===========================================================================================
 * COMMON NPM PACKAGES (Modern Stack)
 * =========================================================================================== */

// express        — web framework
// fastify        — faster web framework
// hono           — lightweight, multi-runtime
// prisma         — ORM
// drizzle-orm    — TypeScript ORM
// zod            — schema validation
// dotenv         — env loading
// pino           — structured logging
// ioredis        — Redis client
// pg             — PostgreSQL client
// vitest         — testing (faster Jest alternative)
// dayjs          — dates (lightweight)
// date-fns       — date utilities
// eslint         — linting
// prettier       — formatting
// typescript     — type safety
// piscina        — worker thread pool
// bullmq         — job queues with Redis
