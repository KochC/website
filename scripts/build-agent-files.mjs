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
import { readFile, writeFile, readdir, mkdir, unlink } from 'node:fs/promises'
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

// ---------------------------------------------------------------------------
// Build version stamp
// ---------------------------------------------------------------------------
// version.js is generated, not tracked: CI overwrites it with the run number
// (which used to leave the working tree dirty after every build). Create a dev
// placeholder only when it is missing so local builds still work.
const versionFile = path.join(ROOT, 'src/components/version.js')
if (!existsSync(versionFile)) {
  await writeFile(versionFile, 'export var build_version = "dev";\n', 'utf8')
}

// ---------------------------------------------------------------------------
// CSP inline-script hashes
// ---------------------------------------------------------------------------
//
// The built page has exactly one executable inline script (the no-flash theme
// bootstrap). Hashing it lets the worker send a strict CSP without
// 'unsafe-inline'; if that script ever changes, this hash must be regenerated,
// which is why it is derived here rather than typed by hand.
const htmlEntry = await readFile(path.join(ROOT, 'index.html'), 'utf8')
const inlineScriptHashes = []
for (const match of htmlEntry.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
  const attrs = match[1]
  const body = match[2]
  if (!body.trim()) continue // src= scripts and empty tags
  if (/type\s*=\s*"application\/(ld\+json|json)"/i.test(attrs)) continue // data, not code
  const hash = createHash('sha256').update(body, 'utf8').digest('base64')
  inlineScriptHashes.push(`'sha256-${hash}'`)
}

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

// sha256 hashes of the executable inline scripts in index.html, for the
// worker's Content-Security-Policy script-src directive.
export const INLINE_SCRIPT_HASHES = ${JSON.stringify(inlineScriptHashes)}
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

They are not, for anything published here. There is no OAuth authorization
server on this domain, no client registration, and no scopes to request — so no
\`/.well-known/oauth-authorization-server\` or
\`/.well-known/oauth-protected-resource\` document is published. If you need
something beyond the public content, contact ${EMAIL}.

## Contact

Questions about access, licensing or reuse: ${EMAIL}.
`;
emit('auth.md', authMd)

// ---------------------------------------------------------------------------
// OAuth discovery
// ---------------------------------------------------------------------------
//
// Deliberately NOT published: /.well-known/oauth-authorization-server and
// /.well-known/oauth-protected-resource.
//
// An earlier revision advertised both, describing an authorization server at
// /oauth with authorize/token/jwks endpoints. No such server exists — those
// URLs 404. Publishing them made the site look more "agent-ready" on a
// checklist while telling agents something false, and OAuth metadata that
// points at dead endpoints is worse than no metadata: a client that trusts it
// will try to obtain a token from an endpoint that cannot issue one.
//
// /mcp is unauthenticated and read-only, so there is no protected resource to
// describe. If credentials are ever added, generate both documents from the
// real server configuration at that point — not before.

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
// Custom 404
// ---------------------------------------------------------------------------
// GitHub Pages serves this for unknown paths. Without it visitors get GitHub's
// default page; a small static file keeps the site's look and offers a way back.
const NOT_FOUND_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Not found — koch.codes</title>
<meta name="robots" content="noindex">
<link rel="stylesheet" href="/apps/apps.css">
</head>
<body>
<div class="wrap">
  <p class="back"><a href="/">&larr; koch.codes</a></p>
  <span class="pill">404</span>
  <h1>That page doesn't exist</h1>
  <p class="tagline">The link may be outdated, or the page may have moved.</p>
  <div class="card">
    <p style="margin:0">Try the <a href="/">home page</a>, or one of the apps:
    <a href="/apps/">all apps</a> ·
    <a href="/apps/freeslots/">FreeSlots</a> ·
    <a href="/apps/sundown/">Sundown</a> ·
    <a href="/apps/droproute/">DropRoute</a> ·
    <a href="/apps/cronlet/">Cronlet</a>.</p>
  </div>
  <p class="meta">If you followed a link from another site, email
  <a href="mailto:feedback@koch.codes">feedback@koch.codes</a> and it will be fixed.</p>
</div>
</body>
</html>
`

async function writeAgentPolicyFiles() {
  const robots = await readFile(path.join(PUBLIC, 'robots.txt'), 'utf8')

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

  const pages = [
    { loc: `${SITE}/`, file: 'index.html', priority: '1.0' },
    { loc: `${SITE}/apps/`, file: 'apps/index.html', priority: '0.9' },
    // Only apps with a real landing page: Redline publishes privacy and
    // support pages only, and is intentionally unlisted on the overview.
    ...APP_SLUGS.filter((slug) => appPages.get(slug)?.appStore).map((slug) => ({
      loc: `${SITE}/apps/${slug}/`,
      file: `apps/${slug}/index.html`,
      priority: '0.8',
    })),
  ]

  // lastmod tells crawlers what actually changed. Derive it from the file's own
  // history in git; when that is unavailable (fresh clone, tarball) fall back to
  // omitting the element rather than inventing a date.
  const urls = []
  for (const page of pages) {
    // Paths are relative to public/, which is where these files live.
    const lastmod = await gitLastModified(`public/${page.file}`)
    urls.push({ ...page, lastmod })
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>${url.lastmod ? `\n    <lastmod>${url.lastmod}</lastmod>` : ''}
    <changefreq>monthly</changefreq>
    <priority>${url.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`
  emitPublic('sitemap.xml', xml)
  emitPublic('404.html', NOT_FOUND_HTML)
}

/** ISO date of the last commit touching `relPath`, or null if unavailable. */
async function gitLastModified(relPath) {
  try {
    const { execFile } = await import('node:child_process')
    const { promisify } = await import('node:util')
    const run = promisify(execFile)
    const { stdout } = await run('git', ['log', '-1', '--format=%cs', '--', relPath], {
      cwd: ROOT,
    })
    const date = stdout.trim()
    return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null
  } catch {
    return null
  }
}

await writeAgentPolicyFiles()

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

/**
 * Outputs this generator owns. Removing an entry from the config above must
 * also remove the file from public/, otherwise a deleted document silently
 * keeps being published (this happened with the OAuth metadata). Only these
 * locations are ever pruned — hand-written pages are never touched.
 */
const GENERATED_DIRS = ['.well-known', 'schemas']
const GENERATED_ROOT_FILES = [
  'auth.md',
  'index.md',
  'apps/index.md',
  'llms-full.md',
  'llms-full.txt',
]

async function generatedFilesOnDisk() {
  const found = []
  async function walk(dir, prefix) {
    let entries
    try {
      entries = await readdir(dir, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      const rel = `${prefix}${entry.name}`
      if (entry.isDirectory()) await walk(path.join(dir, entry.name), `${rel}/`)
      else found.push(rel)
    }
  }
  for (const dir of GENERATED_DIRS) await walk(path.join(PUBLIC, dir), `${dir}/`)
  for (const file of GENERATED_ROOT_FILES) {
    if (existsSync(path.join(PUBLIC, file))) found.push(file)
  }
  return found
}

async function writeTree(entries, base) {
  let written = 0
  let removed = 0
  for (const [relPath, contents] of entries) {
    const target = path.join(base, relPath)
    await mkdir(path.dirname(target), { recursive: true })
    await writeFile(target, contents, 'utf8')
    written += 1
  }

  // Prune anything previously generated that is no longer produced.
  for (const relPath of await generatedFilesOnDisk()) {
    if (entries.has(relPath)) continue
    await unlink(path.join(base, relPath))
    removed += 1
  }
  return { written, removed }
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
  const { written, removed } = await writeTree(new Map([...files, ...publicFiles]), PUBLIC)
  console.log(`Wrote ${written} agent files into public/.`)
  if (removed) console.log(`Removed ${removed} stale generated file(s).`)
  console.log(`  • ${twins.length} Markdown twins`)
  console.log(`  • ${SKILLS.length} skills`)
  console.log(`  • ${MCP_TOOLS.length} MCP tools`)
}
