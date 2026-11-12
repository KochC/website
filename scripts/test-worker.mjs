#!/usr/bin/env node
/**
 * Runs the edge Worker against a stubbed GitHub Pages origin and exercises the
 * real request/response paths (negotiation, Link headers, MCP, A2A).
 *
 *   npm run agents:test:worker
 *
 * No network access: fetch is replaced with a reader that serves public/ the
 * way GitHub Pages would, including its 301-to-custom-domain behaviour, so the
 * redirect-loop guard is tested too.
 */
import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const PUBLIC = path.join(ROOT, 'public')
const SITE = 'https://koch.codes'
const ORIGIN_HEADER = 'x-koch-origin'

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.json': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
  '.catalog': 'application/linkset+json',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.ico': 'image/x-icon',
}

let originHits = 0
let loopDetected = 0

/**
 * Emulates GitHub Pages: serves public/ and issues the same 301 that the real
 * pages origin sends when it is reached under the wrong hostname.
 */
async function serveOrigin(request) {
  originHits += 1
  const url = new URL(request.url)
  const clean = decodeURIComponent(url.pathname)

  // GitHub Pages only honours the custom domain; a request that arrives
  // without the canonical host is answered with a 301.
  if (url.host !== 'koch.codes') {
    return new Response(null, { status: 301, headers: { Location: `${SITE}${url.pathname}` } })
  }

  const candidate = clean.endsWith('/') ? `${clean}index.html` : clean
  const file = path.join(PUBLIC, candidate.replace(/^\//, ''))

  try {
    const info = await stat(file)
    if (info.isDirectory()) throw new Error('directory')
    const body = await readFile(file)
    const extension = path.extname(file)
    const type =
      CONTENT_TYPES[extension] ??
      (path.basename(file).includes('.well-known') ? 'application/json' : 'application/octet-stream')
    // Vite preview (like GitHub Pages) gives extensionless files no type at
    // all, which is what the Worker's fallback exists to fix.
    const contentType = extension ? type : ''
    // Real origins compress HTML; the runtime decodes it before the Worker sees
    // it, so advertise gzip the way GitHub Pages does and let the guard be
    // tested for the (wrong) copied Content-Encoding header.
    return new Response(body, {
      status: 200,
      headers: { 'Content-Type': contentType, 'Content-Encoding': 'gzip' },
    })
  } catch {
    return new Response('Not Found', { status: 404, headers: { 'Content-Type': 'text/html' } })
  }
}

/**
 * Cloudflare semantics for a fetch() to a hostname in the Worker's own zone:
 * the request goes to the origin, NOT back through the Worker. The Worker also
 * tags its subrequests, and if one ever did come back to the Worker we would
 * notice it here (loopDetected) rather than silently passing.
 */
globalThis.fetch = async (input) => {
  const request = input instanceof Request ? input : new Request(input)
  const url = new URL(request.url)

  // In production a same-zone fetch() resolves to the origin; the URL still
  // uses the site's own hostname.
  if (url.origin !== SITE) {
    throw new Error(`unexpected subrequest origin: ${url.origin}`)
  }
  if (request.headers.get(ORIGIN_HEADER) !== '1') {
    // A subrequest that is not explicitly tagged means the Worker forgot the
    // guard and would loop on the real edge.
    loopDetected += 1
    throw new Error('recursive origin fetch: subrequest missing x-koch-origin guard')
  }
  return serveOrigin(request)
}

const worker = (await import(pathToFileURL(path.join(ROOT, 'workers/agent-edge.js')).href)).default

let passed = 0
const failures = []

async function expect(name, condition, detail) {
  if (condition) {
    passed += 1
    console.log(`  ok   ${name}`)
  } else {
    failures.push(name)
    console.log(`  FAIL ${name}${detail ? `\n       ${detail}` : ''}`)
  }
}

function call(pathname, init = {}) {
  // ORIGIN_URL mirrors the deployed [vars] value.
  return worker.fetch(new Request(`${SITE}${pathname}`, init), { ORIGIN_URL: SITE }, {})
}

console.log('\nMarkdown negotiation')

{
  const response = await call('/', { headers: { Accept: 'text/markdown' } })
  const body = await response.text()
  await expect(
    'Accept: text/markdown on / returns text/markdown',
    response.headers.get('Content-Type')?.startsWith('text/markdown'),
    `got ${response.headers.get('Content-Type')}`,
  )
  await expect('markdown response sets Vary: Accept', /accept/i.test(response.headers.get('Vary') ?? ''))
  await expect('markdown response reports token estimate', Number(response.headers.get('X-Markdown-Tokens')) > 0)
  await expect('markdown body is the real content', body.includes('# Christopher Koch') || body.includes('Contact & Profiles'))
}

{
  const response = await call('/', { headers: { Accept: 'text/html,application/xhtml+xml' } })
  await expect(
    'browser Accept keeps HTML',
    response.headers.get('Content-Type')?.startsWith('text/html'),
    `got ${response.headers.get('Content-Type')}`,
  )
}

{
  const response = await call('/apps/freeslots/', { headers: { Accept: 'text/markdown' } })
  const body = await response.text()
  await expect('directory URL negotiates to its index.md twin', body.includes('# FreeSlots'))
  await expect('app twin keeps App Store link', body.includes('apps.apple.com'))
}

{
  const response = await call('/apps/cronlet/privacy.html', { headers: { Accept: 'text/markdown' } })
  const body = await response.text()
  await expect('.html URL negotiates to the .md twin', body.includes('# Privacy Policy') && body.includes('Cronlet'))
}

{
  // Redline publishes privacy/support only, but those do have twins.
  const response = await call('/apps/redline/privacy.html', { headers: { Accept: 'text/markdown' } })
  const body = await response.text()
  await expect('pages without a landing page still negotiate', body.includes('# Privacy Policy'))
}

{
  // A path with neither a twin nor an HTML page must degrade to the origin's
  // 404 rather than inventing an empty markdown document.
  const response = await call('/apps/redline/', { headers: { Accept: 'text/markdown' } })
  await expect(
    'missing twin falls through instead of serving empty markdown',
    response.status === 404,
    `status ${response.status}, type ${response.headers.get('Content-Type')}`,
  )
}

{
  const response = await call('/apps/freeslots/')
  const body = await response.text()
  await expect('HTML page is returned intact', body.includes('<!DOCTYPE html>'), body.slice(0, 60))
  await expect('proxied response drops Content-Encoding', !response.headers.get('Content-Encoding'))
  await expect(
    'Vary is a single merged header',
    (response.headers.get('Vary') ?? '').split(',').filter((part) => part.trim().toLowerCase() === 'accept').length === 1,
    response.headers.get('Vary'),
  )
}

console.log('\nLink headers')

{
  const response = await call('/')
  const link = response.headers.get('Link') ?? ''
  await expect('HTML response carries a Link header', link.length > 0)
  for (const rel of ['api-catalog', 'describedby', 'service-desc', 'agent-card']) {
    await expect(`Link header advertises rel="${rel}"`, link.includes(`rel="${rel}"`))
  }
}

{
  const response = await call('/llms-full.md', { headers: { 'Accept-Encoding': 'identity' } })
  // The runtime decodes the origin body, so a stale Content-Length/Encoding
  // pair truncates or garbles the document. Compare against the source file.
  await expect(
    'proxied markdown arrives complete and identical',
    (await response.text()) === (await readFile(path.join(PUBLIC, 'llms-full.md'), 'utf8')),
  )
  await expect('proxied markdown has no stale Content-Length', !response.headers.get('Content-Length'))
}

{
  const response = await call('/.well-known/api-catalog')
  await expect(
    'api-catalog is served as application/linkset+json',
    (response.headers.get('Content-Type') ?? '').startsWith('application/linkset+json'),
    response.headers.get('Content-Type'),
  )
}

{
  // These are application/json, not linkset — the untyped-file fallback must
  // not relabel every extensionless well-known document.
  for (const doc of ['/.well-known/oauth-protected-resource', '/.well-known/oauth-authorization-server']) {
    const response = await call(doc)
    await expect(
      `${doc} is served as application/json`,
      (response.headers.get('Content-Type') ?? '').startsWith('application/json'),
      response.headers.get('Content-Type'),
    )
  }
}

{
  const response = await call('/llms.txt')
  await expect('non-HTML responses are not given a Link header', !response.headers.get('Link'))
  await expect('llms.txt is proxied intact', (await response.text()).includes('Christopher Koch'))
}

console.log('\nMCP endpoint')

const initialize = {
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'test', version: '1' } },
}

{
  const response = await call('/mcp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' },
    body: JSON.stringify(initialize),
  })
  const payload = await response.json()
  await expect('initialize returns the negotiated protocol version', payload.result?.protocolVersion === '2025-06-18')
  await expect('initialize advertises tools capability', payload.result?.capabilities?.tools !== undefined)
  await expect('server identifies itself', payload.result?.serverInfo?.name === 'koch-codes')
}

{
  const response = await call('/mcp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list' }),
  })
  const payload = await response.json()
  const tools = payload.result?.tools ?? []
  await expect('tools/list returns the published tools', tools.length === 6, `got ${tools.length}`)
  await expect(
    'tools/list matches the server card exactly',
    JSON.stringify(tools.map((tool) => tool.name).sort()) ===
      JSON.stringify(
        JSON.parse(await readFile(path.join(PUBLIC, '.well-known/mcp/server-card.json'), 'utf8'))
          .tools.map((tool) => tool.name)
          .sort(),
      ),
  )
}

for (const [tool, args, assertText] of [
  ['get_profile', {}, (text) => text.includes('Christopher Koch')],
  ['list_experience', {}, (text) => text.includes('Merck Group')],
  ['list_publications', {}, (text) => text.includes('arXiv:')],
  ['list_publications', { query: 'governance' }, (text) => text.includes('Governance')],
  ['list_apps', {}, (text) => text.includes('FreeSlots')],
  ['get_app', { slug: 'sundown' }, (text) => text.includes('Sundown')],
  ['get_contact', {}, (text) => text.includes('chris@koch.codes')],
]) {
  const response = await call('/mcp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 10,
      method: 'tools/call',
      params: { name: tool, arguments: args },
    }),
  })
  const payload = await response.json()
  const text = payload.result?.content?.[0]?.text ?? ''
  await expect(
    `tools/call ${tool}${Object.keys(args).length ? ` ${JSON.stringify(args)}` : ''} returns content`,
    payload.result?.isError === false && assertText(text),
    text.slice(0, 120),
  )
}

{
  const response = await call('/mcp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 11,
      method: 'tools/call',
      params: { name: 'get_app', arguments: { slug: 'nope' } },
    }),
  })
  const payload = await response.json()
  await expect('unknown app is reported as a tool error, not a crash', payload.result?.isError === true)
}

{
  const response = await call('/mcp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 12, method: 'does/not/exist' }),
  })
  const payload = await response.json()
  await expect('unknown method returns JSON-RPC -32601', payload.error?.code === -32601)
}

{
  const response = await call('/mcp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: 'not json',
  })
  const payload = await response.json()
  await expect('malformed JSON returns -32700', payload.error?.code === -32700)
}

{
  // Notifications (no id) must not produce a response body.
  const response = await call('/mcp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }),
  })
  await expect('notification is acknowledged without a body', response.status === 202)
}

console.log('\nA2A endpoint')

{
  const response = await call('/a2a', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'message/send',
      params: { message: { role: 'user', parts: [{ text: 'Which iOS apps did he publish?' }] } },
    }),
  })
  const payload = await response.json()
  const text = payload.result?.parts?.[0]?.text ?? ''
  await expect('message/send answers app questions from site content', text.includes('FreeSlots') && text.includes('Cronlet'))
  await expect('A2A response includes a messageId', Boolean(payload.result?.messageId))
}

{
  const response = await call('/a2a', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 2,
      method: 'message/send',
      params: { message: { role: 'user', parts: [{ text: 'What are his publications?' }] } },
    }),
  })
  const payload = await response.json()
  await expect('publication questions return arXiv entries', payload.result.parts[0].text.includes('arXiv:'))
}

console.log('\nRedirect safety')
await expect('origin was reached for real subrequests', originHits > 0)
await expect('no subrequest re-entered the Worker', loopDetected === 0)

console.log('')
if (failures.length) {
  console.error(`${failures.length} check(s) failed, ${passed} passed.`)
  process.exit(1)
}
console.log(`All ${passed} worker checks passed.`)
