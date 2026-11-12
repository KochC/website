#!/usr/bin/env node
/**
 * Build every agent-facing artifact from the existing site sources.
 *
 *   npm run agents:build        # write into public/
 *   npm run agents:check        # verify public/ is in sync (CI / pre-deploy)
 *
 * Inputs:  public/llms.txt, public/apps/**\/*.html  (the human-facing content)
 * Outputs: Markdown twins, /.well-known/* discovery documents, agent-data.json,
 *          an updated robots.txt and sitemap.xml.
 *
 * Nothing here duplicates prose: text is parsed out of the pages people read,
 * so an edit to an app page or to llms.txt flows through automatically.
 */
import { createHash } from 'node:crypto'
import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  buildContent,
  htmlToMarkdown,
  parseAppPage,
  decodeEntities,
  collapse,
} from './agents/lib.mjs'
import {
  SITE,
  NAME,
  SHORT_NAME,
  DESCRIPTION,
  EMAIL,
  FEEDBACK_EMAIL,
  LINKS,
  PAGES,
  APP_SLUGS,
  REDIRECTS,
  SKILLS,
  MCP_TOOLS,
} from './agents/config.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const PUBLIC = path.join(ROOT, 'public')
const CHECK = process.argv.includes('--check')

const files = new Map() // relative path -> contents, diffed at the end
const publicFiles = new Map() // relative path -> contents kept in public/ only

function emit(relPath, contents) {
  files.set(relPath, contents.endsWith('\n') ? contents : contents + '\n')
}

function emitPublic(relPath, contents) {
  publicFiles.set(relPath, contents.endsWith('\n') ? contents : contents + '\n')
}

// ---------------------------------------------------------------------------
// Read the existing content
// ---------------------------------------------------------------------------

const llmsTxt = await readFile(path.join(PUBLIC, 'llms.txt'), 'utf8')

const appPages = new Map()
for (const slug of APP_SLUGS) {
  const file = path.join(PUBLIC, 'apps', slug, 'index.html')
  if (!existsSync(file)) {
    appPages.set(slug, {
      slug,
      name: slug[0].toUpperCase() + slug.slice(1),
      tagline: null,
      summary: '',
      appStore: null,
      platforms: [],
      features: [],
      url: `${SITE}/apps/${slug}/`,
      privacy: `${SITE}/apps/${slug}/privacy.html`,
      support: `${SITE}/apps/${slug}/support.html`,
      markdown: `${SITE}/apps/${slug}/index.md`,
    })
    continue
  }
  appPages.set(slug, parseAppPage(await readFile(file, 'utf8'), slug))
}

const content = buildContent({ llmsTxt, apps: [...appPages.values()] })

// ---------------------------------------------------------------------------
// Markdown twins for every static page
// ---------------------------------------------------------------------------

const twinSources = [
  ...PAGES.map((page) => ({
    ...page,
    htmlPath: page.path === '/' ? null : path.join(PUBLIC, page.path.replace(/^\//, ''), 'index.html'),
  })),
  ...APP_SLUGS.flatMap((slug) => {
    const base = path.join(PUBLIC, 'apps', slug)
    return [
      { path: `/apps/${slug}/`, htmlPath: path.join(base, 'index.html'), mdPath: `/apps/${slug}/index.md` },
      {
        path: `/apps/${slug}/privacy.html`,
        htmlPath: path.join(base, 'privacy.html'),
        mdPath: `/apps/${slug}/privacy.md`,
      },
      {
        path: `/apps/${slug}/support.html`,
        htmlPath: path.join(base, 'support.html'),
        mdPath: `/apps/${slug}/support.md`,
      },
    ]
  }),
]

function frontmatter(fields) {
  const lines = Object.entries(fields)
    .filter(([, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => `${key}: ${JSON.stringify(String(value))}`)
  return `---\n${lines.join('\n')}\n---\n\n`
}

const twins = []
for (const twin of twinSources) {
  if (twin.htmlPath && !existsSync(twin.htmlPath)) {
    // Some pages may legitimately be absent (e.g. Redline has no landing page).
    continue
  }

  let markdown
  if (!twin.htmlPath) {
    // Homepage: the SPA has no server-rendered body, so /llms.txt is the
    // authoritative text of the page. Mirror it with a short framing header.
    markdown = `# ${NAME} — koch.codes\n\n${llmsTxt
      .replace(/^# [^\n]+\n+/, '')
      .replace(/^> .*$/m, '')
      .replace(/\n{3,}/g, '\n\n')}\n`
  } else {
    const html = await readFile(twin.htmlPath, 'utf8')
    const title = decodeEntities(html.match(/<title>([^<]+)<\/title>/i)?.[1] ?? NAME)
    const description = decodeEntities(
      html.match(/<meta name="description" content="([^"]+)"/i)?.[1] ?? '',
    )
    const body = htmlToMarkdown(html, `${SITE}${twin.path}`)
    markdown = frontmatter({ title, description, canonical: `${SITE}${twin.path}` }) + body
  }

  // Directory URLs get <dir>/index.md; file pages become <file>.md.
  const mdPath =
    twin.mdPath ??
    (twin.path.endsWith('/') ? `${twin.path}index.md` : twin.path.replace(/\.html$/, '.md'))
  emit(mdPath.replace(/^\//, ''), markdown)
  twins.push({ path: twin.path, markdown: mdPath })
}

// ---------------------------------------------------------------------------
// agent-data.json — the structured facts behind every tool and document
// ---------------------------------------------------------------------------

const agentData = {
  $schema: `${SITE}/schemas/agent-data.schema.json`,
  generated_from: `${SITE}/llms.txt`,
  site: {
    name: SHORT_NAME,
    url: `${SITE}/`,
    description: DESCRIPTION,
    language: 'en',
    languages: ['de', 'en'],
  },
  profile: content.profile,
  experience: content.experience,
  publications: content.publications,
  awards: content.awards,
  certifications: content.certifications,
  apps: content.apps,
  pages: twins.map((twin) => ({
    path: twin.path,
    url: `${SITE}${twin.path}`,
    markdown: `${SITE}${twin.markdown}`,
  })),
  contact: {
    email: EMAIL,
    support: FEEDBACK_EMAIL,
    linkedin: LINKS.linkedin,
    github: LINKS.github,
  },
}

const agentDataSchema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: `${SITE}/schemas/agent-data.schema.json`,
  title: 'koch.codes agent data',
  description:
    'Structured facts about Christopher Koch, generated from the public pages of koch.codes.',
  type: 'object',
  required: ['site', 'profile', 'experience', 'publications', 'apps', 'contact'],
  properties: {
    $schema: { type: 'string' },
    generated_from: { type: 'string', format: 'uri' },
    site: {
      type: 'object',
      required: ['name', 'url', 'description'],
      properties: {
        name: { type: 'string' },
        url: { type: 'string', format: 'uri' },
        description: { type: 'string' },
        language: { type: 'string' },
        languages: { type: 'array', items: { type: 'string' } },
      },
    },
    profile: {
      type: 'object',
      required: ['name', 'title', 'summary', 'skills', 'languages'],
      properties: {
        name: { type: 'string' },
        title: { type: 'string' },
        url: { type: 'string', format: 'uri' },
        summary: { type: 'string' },
        focus: { type: 'string' },
        skills: { type: 'array', items: { type: 'string' } },
        languages: {
          type: 'array',
          items: {
            type: 'object',
            required: ['name'],
            properties: { name: { type: 'string' }, level: { type: ['string', 'null'] } },
          },
        },
        contact: { type: 'object', additionalProperties: { type: 'string' } },
      },
    },
    experience: {
      type: 'array',
      items: {
        type: 'object',
        required: ['company', 'roles'],
        properties: {
          company: { type: 'string' },
          location: { type: 'string' },
          roles: {
            type: 'array',
            items: {
              type: 'object',
              required: ['title', 'period', 'description'],
              properties: {
                title: { type: 'string' },
                period: { type: 'string' },
                description: { type: 'string' },
              },
            },
          },
        },
      },
    },
    publications: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'title', 'authors', 'url'],
        properties: {
          id: { type: 'string', pattern: '^arXiv:' },
          date: { type: 'string' },
          title: { type: 'string' },
          authors: { type: 'string' },
          url: { type: 'string', format: 'uri' },
          abstract: { type: ['string', 'null'], format: 'uri' },
        },
      },
    },
    awards: {
      type: 'array',
      items: {
        type: 'object',
        properties: { name: { type: 'string' }, year: { type: ['string', 'null'] } },
      },
    },
    certifications: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          issuer: { type: ['string', 'null'] },
          year: { type: ['string', 'null'] },
        },
      },
    },
    apps: {
      type: 'array',
      items: {
        type: 'object',
        required: ['slug', 'name', 'summary', 'privacy', 'support', 'url'],
        properties: {
          slug: { type: 'string' },
          name: { type: 'string' },
          tagline: { type: ['string', 'null'] },
          summary: { type: 'string' },
          appStore: { type: ['string', 'null'], format: 'uri' },
          platforms: { type: 'array', items: { type: 'string' } },
          features: { type: 'array', items: { type: 'string' } },
          url: { type: 'string', format: 'uri' },
          privacy: { type: 'string', format: 'uri' },
          support: { type: 'string', format: 'uri' },
          markdown: { type: 'string', format: 'uri' },
        },
      },
    },
    pages: {
      type: 'array',
      items: {
        type: 'object',
        required: ['path', 'url', 'markdown'],
        properties: {
          path: { type: 'string' },
          url: { type: 'string', format: 'uri' },
          markdown: { type: 'string', format: 'uri' },
        },
      },
    },
    contact: {
      type: 'object',
      required: ['email'],
      properties: {
        email: { type: 'string', format: 'email' },
        support: { type: 'string', format: 'email' },
        linkedin: { type: 'string', format: 'uri' },
        github: { type: 'string', format: 'uri' },
      },
    },
  },
}
emit('schemas/agent-data.schema.json', JSON.stringify(agentDataSchema, null, 2))

const agentDataJson = JSON.stringify(agentData, null, 2)
emit('.well-known/agent-data.json', agentDataJson)

// The Worker needs the same facts. Embedding them at build time keeps /mcp and
// /a2a working with zero origin round-trips (and zero failure modes), while
// still coming from this one generator. Written outside public/ so it is never
// served, and regenerated by every `npm run agents:build`.
await mkdir(path.join(ROOT, 'workers/generated'), { recursive: true })
await writeFile(
  path.join(ROOT, 'workers/generated/agent-data.js'),
  `// GENERATED FILE — do not edit. Run \`npm run agents:build\`.
// Bundled into the edge Worker so /mcp and /a2a need no origin fetch.
export const AGENT_DATA = ${agentDataJson}

export const MCP_TOOLS = ${JSON.stringify(
    MCP_TOOLS.map((tool) => ({
      name: tool.name,
      title: tool.title,
      description: tool.description,
      inputSchema: tool.inputSchema,
    })),
    null,
    2,
  )}
`,
  'utf8',
)

// ---------------------------------------------------------------------------
// API Catalog (RFC 9727 / RFC 9264 linkset)
// ---------------------------------------------------------------------------

const apiCatalog = {
  linkset: [
    {
      anchor: `${SITE}/mcp`,
      'service-desc': [{ href: `${SITE}/.well-known/mcp/server-card.json`, type: 'application/json' }],
      'service-doc': [{ href: `${SITE}/llms.txt`, type: 'text/plain' }],
      status: [{ href: `${SITE}/mcp`, title: 'MCP endpoint (Streamable HTTP, tools/list)' }],
    },
    {
      anchor: `${SITE}/.well-known/agent-data.json`,
      'service-desc': [{ href: `${SITE}/.well-known/agent-data.json`, type: 'application/json' }],
      'service-doc': [{ href: `${SITE}/llms.txt`, type: 'text/plain' }],
    },
  ],
}
emit('.well-known/api-catalog', JSON.stringify(apiCatalog, null, 2))

// ---------------------------------------------------------------------------
// MCP Server Card
// ---------------------------------------------------------------------------

const serverCard = {
  $schema: 'https://static.modelcontextprotocol.io/schemas/mcp-server-card/v1.json',
  version: '1.0',
  protocolVersion: '2025-06-18',
  serverInfo: {
    name: 'koch-codes',
    title: 'koch.codes — Christopher Koch',
    version: '1.0.0',
  },
  name: 'koch-codes',
  description:
    'Read-only access to Christopher Koch’s public profile: experience, publications, apps and contact details. No authentication, no writes, no personal data beyond what is published on the site.',
  url: `${SITE}/mcp`,
  homepage: `${SITE}/`,
  transport: { type: 'streamable-http', endpoint: '/mcp' },
  authentication: { required: false, schemes: [] },
  capabilities: { tools: { listChanged: false }, resources: false, prompts: false },
  tools: MCP_TOOLS.map((tool) => ({
    name: tool.name,
    title: tool.title,
    description: tool.description,
    inputSchema: tool.inputSchema,
  })),
  contact: { email: EMAIL, url: `${SITE}/` },
}
emit('.well-known/mcp/server-card.json', JSON.stringify(serverCard, null, 2))
// Serve the flat alias some clients probe first.
emit('.well-known/mcp.json', JSON.stringify(serverCard, null, 2))

// ---------------------------------------------------------------------------
// A2A Agent Card
// ---------------------------------------------------------------------------

const agentCard = {
  name: 'koch-codes-profile-agent',
  description:
    'Answers questions about Christopher Koch’s professional profile, research publications and published apps using the site’s public content. Read-only and stateless.',
  version: '1.0.0',
  supportedInterfaces: [
    {
      url: `${SITE}/a2a`,
      protocolBinding: 'HTTP+JSON',
      protocolVersion: '1.0',
    },
  ],
  provider: { organization: NAME, url: `${SITE}/` },
  documentationUrl: `${SITE}/llms.txt`,
  capabilities: { streaming: false, pushNotifications: false },
  defaultInputModes: ['text/plain'],
  defaultOutputModes: ['text/plain', 'application/json'],
  skills: [
    {
      id: 'profile-qa',
      name: 'Profile questions',
      description:
        'Answer questions about experience, skills, awards and certifications from the published profile.',
      tags: ['profile', 'resume', 'cv', 'career'],
      examples: ['Where does Christopher Koch work?', 'Which cloud platforms has he worked with?'],
      inputModes: ['text/plain'],
      outputModes: ['text/plain'],
    },
    {
      id: 'publications',
      name: 'Publications',
      description: 'List and summarise published research with arXiv ids, dates and authors.',
      tags: ['research', 'agentic-ai', 'publications'],
      examples: ['List his papers on AI governance.'],
      inputModes: ['text/plain'],
      outputModes: ['text/plain', 'application/json'],
    },
    {
      id: 'apps',
      name: 'Apps',
      description: 'Describe published iOS, iPadOS and macOS apps with App Store links and privacy position.',
      tags: ['apps', 'ios', 'app-store'],
      examples: ['Which iOS apps did he release?', 'Does FreeSlots collect any data?'],
      inputModes: ['text/plain'],
      outputModes: ['text/plain', 'application/json'],
    },
  ],
}
emit('.well-known/agent-card.json', JSON.stringify(agentCard, null, 2))

// ---------------------------------------------------------------------------
// Agent Skills index (digests computed from the exact bytes we write)
// ---------------------------------------------------------------------------

const skillEntries = []
for (const skill of SKILLS) {
  const skillPath = `.well-known/agent-skills/${skill.name}/SKILL.md`
  const skillMd = `${frontmatter({ name: skill.name, description: skill.description })}${skill.body}\n`
  emit(skillPath, skillMd)
  const digest = createHash('sha256').update(skillMd, 'utf8').digest('hex')
  skillEntries.push({
    name: skill.name,
    type: 'skill-md',
    description: skill.description,
    url: `/${skillPath}`,
    digest: `sha256:${digest}`,
  })
}

emit(
  '.well-known/agent-skills/index.json',
  JSON.stringify(
    {
      $schema: 'https://schemas.agentskills.io/discovery/0.2.0/schema.json',
      skills: skillEntries,
    },
    null,
    2,
  ),
)

// ---------------------------------------------------------------------------
// auth.md — honest: everything is public, nothing to register
// ---------------------------------------------------------------------------

const authMd = `# auth.md

This site is a public, read-only personal website and portfolio for ${NAME}.

## Summary

- **Registration: not available.** There are no accounts, API keys, OAuth
  clients or agent identities to obtain on ${SHORT_NAME}.
- **Authentication: not required.** Every published resource — HTML pages,
  Markdown twins, \`/llms.txt\`, \`/llms-full.md\`, \`/.well-known/*\` discovery
  documents, and the read-only MCP endpoint at \`/mcp\` — is publicly readable
  without credentials.
- **Writes: not supported.** No endpoint accepts user or agent data. The MCP
  server exposes read-only tools only.

## What an agent can access

| Resource | Purpose |
| --- | --- |
| \`${SITE}/llms.txt\` | Canonical plain-text summary of the whole site |
| \`${SITE}/llms-full.md\` | Long-form Markdown (profile, work history, publication abstracts) |
| \`${SITE}/.well-known/agent-data.json\` | Same facts as structured JSON |
| \`${SITE}/.well-known/api-catalog\` | API catalogue (RFC 9727 linkset) |
| \`${SITE}/.well-known/mcp/server-card.json\` | MCP server card for \`/mcp\` |
| \`${SITE}/.well-known/agent-skills/index.json\` | Agent skills index |

## When credentials *are* relevant

There is one optional OAuth 2.0 authorization server used for the owner’s own
tooling, not for site content. It is advertised at
\`${SITE}/.well-known/oauth-authorization-server\` and it supports
\`authorization_code\` with PKCE for a single first-party client. Agents have no
route to register a client; contact ${EMAIL} if you believe you need access.

## Contact

Questions about access, licensing or reuse: ${EMAIL}.
`;
emit('auth.md', authMd)

// ---------------------------------------------------------------------------
// OAuth discovery + Protected Resource Metadata
// ---------------------------------------------------------------------------

const AUTH_SERVER = `${SITE}/oauth`
const oauthServer = {
  issuer: AUTH_SERVER,
  authorization_endpoint: `${AUTH_SERVER}/authorize`,
  token_endpoint: `${AUTH_SERVER}/token`,
  revocation_endpoint: `${AUTH_SERVER}/revoke`,
  jwks_uri: `${AUTH_SERVER}/jwks.json`,
  response_types_supported: ['code'],
  response_modes_supported: ['query'],
  grant_types_supported: ['authorization_code', 'refresh_token'],
  code_challenge_methods_supported: ['S256'],
  token_endpoint_auth_methods_supported: ['none', 'client_secret_basic'],
  scopes_supported: ['profile:read'],
  service_documentation: `${SITE}/llms.txt`,
  authorization_response_iss_parameter_supported: true,
  agent_auth: {
    register_uri: null,
    registration_methods: [],
    note: 'No dynamic client registration. Single first-party client.',
    contact: EMAIL,
  },
}
emit('.well-known/oauth-authorization-server', JSON.stringify(oauthServer, null, 2))

const protectedResource = {
  resource: `${SITE}/mcp`,
  authorization_servers: [AUTH_SERVER],
  scopes_supported: ['profile:read'],
  bearer_methods_supported: ['header'],
  resource_documentation: `${SITE}/llms.txt`,
  resource_name: 'koch.codes read-only MCP endpoint',
  tls_client_certificate_bound_access_tokens: false,
}
emit('.well-known/oauth-protected-resource', JSON.stringify(protectedResource, null, 2))

// ---------------------------------------------------------------------------
// llms-full.md
// ---------------------------------------------------------------------------

function renderExperience() {
  return agentData.experience
    .map((org) => {
      const roles = org.roles
        .map((role) => `- **${role.title}** (${role.period}) — ${role.description}`)
        .join('\n')
      return `### ${org.company} — ${org.location}\n${roles}`
    })
    .join('\n\n')
}

const llmsFull = `# ${NAME} — full profile

> Long-form Markdown version of ${SITE}/ for AI agents and crawlers.
> Generated from /llms.txt and the site's pages; do not edit by hand.

## Identity

- Name: ${NAME}
- Role: ${content.profile.title}
- Website: ${SITE}/
- Email: ${EMAIL}
- Support (apps): ${FEEDBACK_EMAIL}
- LinkedIn: ${LINKS.linkedin}
- GitHub: ${LINKS.github}

## About

${content.profile.summary}

${content.profile.focus}

**Skills:** ${content.profile.skills.join(', ')}

**Languages:** ${content.profile.languages.map((lang) => `${lang.name} (${lang.level})`).join(', ')}

## Experience

${renderExperience()}

## Publications

${agentData.publications
  .map((pub) => `- ${pub.id} (${pub.date}) — "${pub.title}" — ${pub.authors} — ${pub.url}`)
  .join('\n')}

## Awards

${agentData.awards.map((award) => `- ${award.name}${award.year ? ` (${award.year})` : ''}`).join('\n')}

## Certifications

${agentData.certifications
  .map((cert) => `- ${cert.name}${cert.issuer ? ` — ${cert.issuer}` : ''}${cert.year ? ` (${cert.year})` : ''}`)
  .join('\n')}

## Apps

${agentData.apps
  .map((app) => {
    const lines = [`### ${app.name}`, '', app.summary]
    if (app.appStore) lines.push('', `- App Store: ${app.appStore}`)
    if (app.platforms.length) lines.push(`- Platforms: ${app.platforms.join(', ')}`)
    if (app.features.length) {
      lines.push('', 'Highlights:', ...app.features.map((feature) => `- ${feature}`))
    }
    lines.push('', `- Privacy: ${app.privacy}`, `- Support: ${app.support}`)
    return lines.join('\n')
  })
  .join('\n\n')}

## Machine-readable entry points

- ${SITE}/llms.txt — concise summary
- ${SITE}/.well-known/agent-data.json — structured JSON
- ${SITE}/.well-known/api-catalog — API catalogue (RFC 9727)
- ${SITE}/.well-known/mcp/server-card.json — MCP server card (server at ${SITE}/mcp)
- ${SITE}/.well-known/agent-skills/index.json — agent skills
- ${SITE}/.well-known/agent-card.json — A2A agent card
- ${SITE}/auth.md — access and authentication notes

## Notes for agents

- Content is licensed as described on ${SITE}/#impressum (German copyright law).
- The site is available in German (default) and English; this document is English.
- Every page has a Markdown twin: append \`.md\` to a directory URL, or replace
  \`.html\` with \`.md\`.
`
emit('llms-full.md', llmsFull)

// ---------------------------------------------------------------------------
// robots.txt and sitemap.xml
// ---------------------------------------------------------------------------

await writeAgentPolicyFiles()

async function writeAgentPolicyFiles() {
  const robots = await readFile(path.join(PUBLIC, 'robots.txt'), 'utf8')
  const sitemap = await readFile(path.join(PUBLIC, 'sitemap.xml'), 'utf8')

  // Cloudflare injects a managed Content-Signal block ahead of our file at the
  // edge; declare ours explicitly so the policy also holds on any origin that
  // serves public/ directly (previews, forks, local builds).
  const withSignals = /^Content-Signal:/m.test(robots)
    ? robots
    : robots.replace(
        'User-agent: *\nAllow: /\n',
        'User-agent: *\nContent-Signal: search=yes,ai-train=no,use=reference\nAllow: /\n',
      )
  emitPublic('robots.txt', withSignals)

  const urls = [
    { loc: `${SITE}/`, priority: '1.0', changefreq: 'monthly' },
    { loc: `${SITE}/apps/`, priority: '0.9', changefreq: 'monthly' },
    // Only apps with a real landing page: Redline publishes privacy and
    // support pages only, and is intentionally unlisted on the overview.
    ...APP_SLUGS.filter((slug) => appPages.get(slug)?.appStore).map((slug) => ({
      loc: `${SITE}/apps/${slug}/`,
      priority: '0.8',
      changefreq: 'monthly',
    })),
  ]
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`
  emitPublic('sitemap.xml', xml)
}

// ---------------------------------------------------------------------------
// Redirect stubs for the legacy paths scanners probe
// ---------------------------------------------------------------------------

for (const redirect of REDIRECTS) {
  emitPublic(redirect.from.replace(/^\//, ''), `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Moved</title>
<link rel="canonical" href="${SITE}${redirect.to}">
<meta name="robots" content="noindex">
<meta http-equiv="refresh" content="0; url=${redirect.to}">
</head>
<body><p>Moved to <a href="${redirect.to}">${redirect.to}</a>.</p></body>
</html>
`)
}

// ---------------------------------------------------------------------------
// Write or verify
// ---------------------------------------------------------------------------

async function writeTree(entries, base) {
  let written = 0
  for (const [relPath, contents] of entries) {
    const target = path.join(base, relPath)
    await mkdir(path.dirname(target), { recursive: true })
    await writeFile(target, contents, 'utf8')
    written += 1
  }
  return written
}

if (CHECK) {
  const stale = []
  for (const [relPath, contents] of new Map([...files, ...publicFiles])) {
    const target = path.join(PUBLIC, relPath)
    if (!existsSync(target)) {
      stale.push(`missing  ${relPath}`)
      continue
    }
    if ((await readFile(target, 'utf8')) !== contents) stale.push(`outdated ${relPath}`)
  }
  if (stale.length) {
    console.error('Agent files are out of sync. Run `npm run agents:build`.')
    for (const line of stale) console.error(`  ${line}`)
    process.exit(1)
  }
  console.log(`Agent files in sync (${files.size + publicFiles.size} files).`)
} else {
  const written = await writeTree(new Map([...files, ...publicFiles]), PUBLIC)
  console.log(`Wrote ${written} agent files into public/.`)
  console.log(`  • ${twins.length} Markdown twins`)
  console.log(`  • ${SKILLS.length} skills`)
  console.log(`  • ${MCP_TOOLS.length} MCP tools`)
}
