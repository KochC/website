/**
 * koch.codes edge Worker — the parts of agent readiness that static hosting
 * cannot do:
 *
 *   1. Markdown content negotiation  (Accept: text/markdown -> /page.md)
 *   2. Link response headers         (RFC 8288 discovery pointers)
 *   3. A real read-only MCP endpoint (Streamable HTTP, tools/list + tools/call)
 *   4. A minimal A2A endpoint        (JSON-RPC message/send, read-only answers)
 *
 * Everything else (Markdown twins, /.well-known/* documents, llms.txt,
 * auth.md) is generated at build time into public/ and served by GitHub Pages.
 * This Worker fetches that origin and adds the dynamic layer on top, so there
 * is exactly one copy of every document.
 */

const SITE = 'https://koch.codes'

/**
 * Origin fetch.
 *
 * The site is served by GitHub Pages behind the proxied koch.codes DNS record.
 * Per Cloudflare's routing rules, a fetch() to a hostname in this Worker's own
 * zone does NOT re-enter the Worker — it goes to the origin (GitHub Pages) with
 * the original Host header, which is exactly what GitHub Pages needs to serve
 * the custom domain. Fetching kochc.github.io directly would be wrong: GitHub
 * 301-redirects every pages hostname to the custom domain.
 *
 * `x-koch-origin` guards against the runtime ever re-entering this Worker
 * (Cloudflare's documented pattern for avoiding origin loops): if we see it,
 * we go straight to the origin and skip all rewriting.
 */
const ORIGIN_HEADER = 'x-koch-origin'
const MCP_PROTOCOL_VERSIONS = ['2025-11-25', '2025-06-18', '2025-03-26']

/** RFC 8288 discovery pointers attached to HTML responses. */
const LINK_HEADER = [
  `</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"`,
  `</llms.txt>; rel="describedby"; type="text/plain"`,
  `</auth.md>; rel="authorization"; type="text/markdown"`,
  `</.well-known/mcp/server-card.json>; rel="service-desc"; type="application/json"`,
  `</.well-known/agent-card.json>; rel="agent-card"; type="application/json"`,
  `</llms-full.md>; rel="service-doc"; type="text/markdown"`,
].join(', ')

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const origin = env?.ORIGIN_URL || SITE

    // Never rewrite our own origin subrequest (see ORIGIN_HEADER above).
    if (request.headers.get(ORIGIN_HEADER) === '1') return directToOrigin(request, origin)

    if (url.pathname === '/mcp') return handleMcp(request)
    if (url.pathname === '/a2a') return handleA2A(request, origin)

    return handleContent(request, ctx, origin)
  },
}

// ---------------------------------------------------------------------------
// Content negotiation + Link headers
// ---------------------------------------------------------------------------

function acceptsMarkdown(request) {
  const accept = request.headers.get('Accept') || ''
  // Browsers send text/html first; only switch when markdown is explicitly
  // preferred over html, so normal navigation is never served markdown.
  const markdown = accept.indexOf('text/markdown')
  if (markdown === -1) return false
  const html = accept.indexOf('text/html')
  return html === -1 || markdown < html
}

/** Map a page URL to the Markdown twin generated at build time. */
function markdownPath(pathname) {
  if (pathname.endsWith('.md')) return pathname
  if (pathname.endsWith('.html')) return pathname.replace(/\.html$/, '.md')
  if (pathname.endsWith('/')) return `${pathname}index.md`
  return `${pathname}.md`
}

function originUrlFor(origin, pathname, search) {
  // GitHub Pages has no server-side routing for extensionless paths; directory
  // URLs must ask for index.html explicitly.
  const file = pathname.endsWith('/') ? `${pathname}index.html` : pathname
  return `${origin}${file}${search}`
}

/** A subrequest straight to the origin, never re-entering the Worker. */
function directToOrigin(request, origin) {
  const url = new URL(request.url)
  const headers = originHeaders(request)
  return fetch(originUrlFor(origin, url.pathname, url.search), {
    method: request.method,
    headers,
    redirect: 'manual',
  })
}

/**
 * Headers for an origin subrequest. Accept-Encoding is dropped so the origin
 * returns an identity body: the Worker has to read or re-label it, and the
 * runtime re-compresses for the client.
 */
function originHeaders(request) {
  const headers = new Headers(request.headers)
  headers.delete('Accept-Encoding')
  return headers
}

/** A subrequest to the origin that can never re-enter this Worker. */
function fetchToOrigin(request, origin) {
  const url = new URL(request.url)
  const headers = originHeaders(request)
  headers.set(ORIGIN_HEADER, '1')
  return fetch(
    new Request(originUrlFor(origin, url.pathname, url.search), {
      method: request.method,
      headers,
      redirect: 'manual',
    }),
  )
  return fetch(
    new Request(originUrlFor(origin, url.pathname, url.search), {
      method: request.method,
      headers,
      redirect: 'manual',
    }),
  )
}

async function handleContent(request, ctx, origin) {
  const url = new URL(request.url)
  const isContentPage =
    request.method === 'GET' &&
    (url.pathname === '/' ||
      (url.pathname.endsWith('/') && !url.pathname.startsWith('/.well-known/')) ||
      url.pathname.endsWith('.html'))

  if (!isContentPage) return finalize(await fetchToOrigin(request, origin), url.pathname)

  if (acceptsMarkdown(request)) {
    const mirror = await fetchToOrigin(
      new Request(`${origin}${markdownPath(url.pathname)}`, {
        method: 'GET',
        headers: { [ORIGIN_HEADER]: '1', Accept: 'text/markdown' },
      }),
      origin,
    )
    // A missing twin must never break the page: fall through to HTML.
    if (mirror.ok) {
      const body = await mirror.text()
      return new Response(body, {
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          Vary: 'Accept',
          'X-Markdown-Tokens': String(Math.ceil(body.length / 4)),
          'Cache-Control': 'public, max-age=300',
          'Access-Control-Allow-Origin': '*',
        },
      })
    }
  }

  const response = await fetchToOrigin(request, origin)
  const finalized = finalize(response, url.pathname)

  const contentType = finalized.headers.get('Content-Type') || ''
  if (contentType.includes('text/html')) {
    finalized.headers.set('Link', LINK_HEADER)
    // Merge rather than append: the origin may already send its own Vary.
    const vary = finalized.headers.get('Vary')
    finalized.headers.set('Vary', vary ? `${vary}, Accept` : 'Accept')
  }
  return finalized
}

/**
 * Normalise a proxied origin response.
 *
 * The Workers runtime transparently decodes the origin body, so forwards of
 * Content-Encoding / Content-Length describe bytes that are no longer there:
 * a copied Content-Length truncates the body and a copied Content-Encoding
 * makes the client read plain text as gzip. Both must go.
 *
 * Extensionless well-known documents have no extension for the static host to
 * infer a type from, so they arrive untyped. Each one has a registered type:
 * RFC 9727 requires application/linkset+json for the api-catalog, while the
 * OAuth metadata documents are application/json.
 */
function finalize(response, pathname = '') {
  const out = new Response(response.body, response)
  out.headers.delete('Content-Encoding')
  out.headers.delete('Content-Length')

  const contentType = (out.headers.get('Content-Type') || '').trim()
  if (!contentType) {
    out.headers.set('Content-Type', contentTypeForPath(pathname))
  }
  return out
}

function contentTypeForPath(pathname) {
  if (pathname.endsWith('/api-catalog')) return 'application/linkset+json'
  return 'application/json'
}

// ---------------------------------------------------------------------------
// MCP — read-only tools over the generated agent-data.json
// ---------------------------------------------------------------------------

let dataCache = null
let serverCardCache = null

async function loadAgentData() {
  // Bundled at build time: no origin fetch, no cold-start latency, and /mcp
  // cannot break if the static origin is temporarily unavailable.
  if (dataCache) return dataCache
  const { AGENT_DATA } = await import('./generated/agent-data.js')
  dataCache = AGENT_DATA
  return dataCache
}

async function loadServerCard() {
  if (serverCardCache) return serverCardCache
  const { MCP_TOOLS } = await import('./generated/agent-data.js')
  serverCardCache = { tools: MCP_TOOLS }
  return serverCardCache
}

function jsonRpcResult(id, result) {
  return Response.json({ jsonrpc: '2.0', id, result })
}

function jsonRpcError(id, code, message) {
  return Response.json({ jsonrpc: '2.0', id, error: { code, message } })
}

const TOOL_HANDLERS = {
  async get_profile() {
    const data = await loadAgentData()
    return { profile: data.profile, contact: data.contact, site: data.site }
  },
  async list_experience() {
    const data = await loadAgentData()
    return { experience: data.experience }
  },
  async list_publications(args = {}) {
    const data = await loadAgentData()
    const query = typeof args.query === 'string' ? args.query.toLowerCase() : ''
    const publications = query
      ? data.publications.filter((pub) => pub.title.toLowerCase().includes(query))
      : data.publications
    return { count: publications.length, publications }
  },
  async list_apps() {
    const data = await loadAgentData()
    return {
      count: data.apps.length,
      apps: data.apps.map((app) => ({
        slug: app.slug,
        name: app.name,
        summary: app.summary,
        appStore: app.appStore,
        platforms: app.platforms,
        url: app.url,
        privacy: app.privacy,
        support: app.support,
      })),
    }
  },
  async get_app(args = {}) {
    const data = await loadAgentData()
    const slug = typeof args.slug === 'string' ? args.slug.toLowerCase().trim() : ''
    const app = data.apps.find((candidate) => candidate.slug === slug)
    if (!app) {
      throw new Error(
        `Unknown app "${slug}". Known slugs: ${data.apps.map((a) => a.slug).join(', ')}`,
      )
    }
    return { app }
  },
  async get_contact() {
    const data = await loadAgentData()
    return { contact: data.contact, profile_links: data.profile.contact }
  },
}

async function handleMcp(request) {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept, MCP-Protocol-Version, Mcp-Session-Id',
    'Access-Control-Max-Age': '86400',
  }

  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })

  // GET is used by clients probing transport; tell them what is on offer.
  if (request.method === 'GET') {
    return Response.json(
      {
        name: 'koch-codes',
        protocolVersion: MCP_PROTOCOL_VERSIONS[0],
        transport: 'streamable-http',
        endpoint: '/mcp',
        serverCard: `${SITE}/.well-known/mcp/server-card.json`,
        tools: Object.keys(TOOL_HANDLERS),
      },
      { headers: cors },
    )
  }

  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: { ...cors, Allow: 'POST, GET, OPTIONS' } })
  }

  let payload
  try {
    payload = await request.json()
  } catch {
    return jsonRpcError(null, -32700, 'Parse error')
  }

  const messages = Array.isArray(payload) ? payload : [payload]
  const responses = []

  for (const message of messages) {
    const { id, method, params } = message ?? {}

    // Notifications carry no id and expect no response.
    if (id === undefined || id === null) continue

    try {
      switch (method) {
        case 'initialize': {
          const requested = params?.protocolVersion
          const protocolVersion = MCP_PROTOCOL_VERSIONS.includes(requested)
            ? requested
            : MCP_PROTOCOL_VERSIONS[0]
          responses.push({
            jsonrpc: '2.0',
            id,
            result: {
              protocolVersion,
              capabilities: { tools: { listChanged: false } },
              serverInfo: { name: 'koch-codes', version: '1.0.0' },
              instructions:
                'Read-only access to Christopher Koch’s public profile, publications and apps. Source: https://koch.codes/llms.txt',
            },
          })
          break
        }
        case 'ping':
          responses.push({ jsonrpc: '2.0', id, result: {} })
          break
        case 'tools/list': {
          // Read the tool definitions from the generated server card so the
          // Worker, the card and the API catalog can never disagree.
          const card = await loadServerCard()
          responses.push({ jsonrpc: '2.0', id, result: { tools: card.tools } })
          break
        }
        case 'tools/call': {
          const name = params?.name
          const handler = TOOL_HANDLERS[name]
          if (!handler) {
            responses.push({
              jsonrpc: '2.0',
              id,
              error: { code: -32602, message: `Unknown tool: ${name}` },
            })
            break
          }
          try {
            const result = await handler(params?.arguments ?? {})
            responses.push({
              jsonrpc: '2.0',
              id,
              result: {
                content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
                structuredContent: result,
                isError: false,
              },
            })
          } catch (error) {
            responses.push({
              jsonrpc: '2.0',
              id,
              result: {
                content: [{ type: 'text', text: String(error.message ?? error) }],
                isError: true,
              },
            })
          }
          break
        }
        case 'resources/list':
          responses.push({ jsonrpc: '2.0', id, result: { resources: [] } })
          break
        case 'prompts/list':
          responses.push({ jsonrpc: '2.0', id, result: { prompts: [] } })
          break
        default:
          responses.push({
            jsonrpc: '2.0',
            id,
            error: { code: -32601, message: `Method not found: ${method}` },
          })
      }
    } catch (error) {
      responses.push({
        jsonrpc: '2.0',
        id,
        error: { code: -32603, message: String(error.message ?? error) },
      })
    }
  }

  if (!responses.length) return new Response(null, { status: 202, headers: cors })
  const body = Array.isArray(payload) ? responses : responses[0]
  return Response.json(body, { headers: { ...cors, 'Cache-Control': 'no-store' } })
}

// ---------------------------------------------------------------------------
// A2A — read-only question answering over the same content
// ---------------------------------------------------------------------------

async function handleA2A(request, origin) {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept, A2A-Version, A2A-Extensions',
  }
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })

  if (request.method === 'GET') {
    // Convenience: the card is canonical at /.well-known/agent-card.json.
    return fetchToOrigin(new Request(`${origin}/.well-known/agent-card.json`), origin)
  }
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: { ...cors, Allow: 'POST, GET, OPTIONS' } })
  }

  let payload
  try {
    payload = await request.json()
  } catch {
    return Response.json({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } }, { headers: cors })
  }

  const { id, method, params } = payload ?? {}
  if (method !== 'message/send' && method !== 'SendMessage') {
    return Response.json(
      { jsonrpc: '2.0', id, error: { code: -32601, message: `Method not found: ${method}` } },
      { headers: cors },
    )
  }

  const text =
    params?.message?.parts
      ?.filter((part) => typeof part?.text === 'string')
      .map((part) => part.text)
      .join(' ') ?? ''

  const answer = await answerQuestion(text)

  return Response.json(
    {
      jsonrpc: '2.0',
      id,
      result: {
        role: 'agent',
        messageId: crypto.randomUUID(),
        contextId: params?.message?.contextId ?? crypto.randomUUID(),
        parts: [{ text: answer }],
      },
    },
    { headers: { ...cors, 'Cache-Control': 'no-store' } },
  )
}

/** Deterministic, content-backed answers — no model call, no hallucination. */
async function answerQuestion(question) {
  const data = await loadAgentData()
  const q = question.toLowerCase()

  if (/app|ios|ipad|macos|app store/.test(q)) {
    return data.apps
      .map((app) => `- **${app.name}** — ${app.summary}${app.appStore ? `\n  ${app.appStore}` : ''}`)
      .join('\n')
  }
  if (/publication|paper|research|arxiv|cite/.test(q)) {
    return data.publications
      .map((pub) => `- ${pub.id} (${pub.date}) — "${pub.title}" — ${pub.authors} — ${pub.url}`)
      .join('\n')
  }
  if (/award|prize|winner/.test(q)) {
    return data.awards.map((award) => `- ${award.name}${award.year ? ` (${award.year})` : ''}`).join('\n')
  }
  if (/certificat|qualification/.test(q)) {
    return data.certifications
      .map((cert) => `- ${cert.name}${cert.issuer ? ` — ${cert.issuer}` : ''}${cert.year ? ` (${cert.year})` : ''}`)
      .join('\n')
  }
  if (/contact|email|reach|hire/.test(q)) {
    return `Email: ${data.contact.email}\nSupport (apps): ${data.contact.support}\nLinkedIn: ${data.contact.linkedin}\nGitHub: ${data.contact.github}`
  }
  if (/experience|work|job|career|employ/.test(q)) {
    return data.experience
      .map(
        (org) =>
          `**${org.company}** (${org.location})\n${org.roles
            .map((role) => `- ${role.title} — ${role.period}`)
            .join('\n')}`,
      )
      .join('\n\n')
  }

  return [
    `${data.profile.name} — ${data.profile.title}`,
    '',
    data.profile.summary,
    '',
    `Full details: ${SITE}/llms.txt`,
  ].join('\n')
}
