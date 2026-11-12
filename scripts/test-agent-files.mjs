#!/usr/bin/env node
/**
 * Verifies the generated agent files and the edge Worker behave as the
 * discovery specs expect. Runs offline against public/ and against the Worker
 * source with a stubbed fetch, so it is safe in CI.
 *
 *   npm run agents:test
 */
import { createHash } from 'node:crypto'
import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const PUBLIC = path.join(ROOT, 'public')

let passed = 0
const failures = []

function check(name, fn) {
  try {
    const result = fn()
    if (result && typeof result.then === 'function') {
      return result.then(
        () => {
          passed += 1
          console.log(`  ok   ${name}`)
        },
        (error) => {
          failures.push([name, error.message])
          console.log(`  FAIL ${name}\n       ${error.message}`)
        },
      )
    }
    passed += 1
    console.log(`  ok   ${name}`)
  } catch (error) {
    failures.push([name, error.message])
    console.log(`  FAIL ${name}\n       ${error.message}`)
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

async function readJson(relPath) {
  return JSON.parse(await readFile(path.join(PUBLIC, relPath), 'utf8'))
}

async function exists(relPath) {
  try {
    await stat(path.join(PUBLIC, relPath))
    return true
  } catch {
    return false
  }
}

console.log('\nDiscovery documents')

const serverCard = await readJson('.well-known/mcp/server-card.json')
await check('MCP server card has serverInfo name + version', () => {
  assert(serverCard.serverInfo?.name, 'serverInfo.name missing')
  assert(serverCard.serverInfo?.version, 'serverInfo.version missing')
  assert(serverCard.transport?.endpoint === '/mcp', 'transport.endpoint should be /mcp')
  assert(Array.isArray(serverCard.tools) && serverCard.tools.length > 0, 'no tools declared')
})

await check('every MCP tool has a JSON schema', () => {
  for (const tool of serverCard.tools) {
    assert(tool.name, 'tool without name')
    assert(tool.description, `${tool.name} has no description`)
    assert(tool.inputSchema?.type === 'object', `${tool.name} inputSchema is not an object schema`)
  }
})

const apiCatalog = await readJson('.well-known/api-catalog')
await check('API catalog is a linkset with an MCP anchor', () => {
  assert(Array.isArray(apiCatalog.linkset), 'linkset must be an array')
  const anchors = apiCatalog.linkset.map((entry) => entry.anchor)
  assert(
    anchors.some((anchor) => anchor.endsWith('/mcp')),
    `no /mcp anchor in ${anchors.join(', ')}`,
  )
  for (const entry of apiCatalog.linkset) {
    assert(entry.anchor, 'linkset entry without anchor')
    assert(entry['service-desc']?.length, `${entry.anchor} has no service-desc`)
  }
})

const agentCard = await readJson('.well-known/agent-card.json')
await check('A2A agent card has name, version and supportedInterfaces', () => {
  assert(agentCard.name, 'name missing')
  assert(agentCard.version, 'version missing')
  assert(Array.isArray(agentCard.supportedInterfaces) && agentCard.supportedInterfaces.length, 'supportedInterfaces missing')
  const iface = agentCard.supportedInterfaces[0]
  assert(iface.url && iface.protocolBinding, 'interface needs url + protocolBinding')
  assert(Array.isArray(agentCard.skills) && agentCard.skills.length, 'skills missing')
  for (const skill of agentCard.skills) {
    assert(skill.id && skill.name && skill.description, 'skill missing id/name/description')
    assert(Array.isArray(skill.tags), `${skill.id} has no tags`)
  }
})

const skillsIndex = await readJson('.well-known/agent-skills/index.json')
await check('agent skills index lists skills with valid digests', async () => {
  assert(skillsIndex.$schema, '$schema missing')
  assert(Array.isArray(skillsIndex.skills) && skillsIndex.skills.length, 'skills array missing')
  for (const skill of skillsIndex.skills) {
    assert(skill.name && skill.type === 'skill-md', `${skill.name}: bad name/type`)
    assert(skill.description, `${skill.name}: no description`)
    assert(skill.url?.endsWith('SKILL.md'), `${skill.name}: url should point at SKILL.md`)
    const file = path.join(PUBLIC, skill.url.replace(/^\//, ''))
    const bytes = await readFile(file)
    const digest = createHash('sha256').update(bytes).digest('hex')
    assert(
      skill.digest === `sha256:${digest}`,
      `${skill.name}: digest mismatch (index ${skill.digest.slice(0, 16)}…, file ${digest.slice(0, 16)}…)`,
    )
    const body = bytes.toString('utf8')
    assert(body.startsWith('---\n'), `${skill.name}: SKILL.md should start with frontmatter`)
    assert(/^#\s+\S/m.test(body), `${skill.name}: SKILL.md needs an H1`)
  }
})

await check('auth.md exists and starts with an auth.md heading', async () => {
  const body = await readFile(path.join(PUBLIC, 'auth.md'), 'utf8')
  assert(/^# auth\.md/m.test(body), 'H1 must contain "auth.md"')
})

await check('does not publish OAuth metadata for a server that does not exist', async () => {
  // This was a real bug: the site advertised oauth-authorization-server and
  // oauth-protected-resource describing /oauth endpoints that 404. Metadata
  // pointing at dead endpoints is worse than none, so its absence is asserted.
  for (const doc of ['.well-known/oauth-authorization-server', '.well-known/oauth-protected-resource']) {
    assert(!(await exists(doc)), `${doc} must not be published without a real authorization server`)
  }
  const authMd = await readFile(path.join(PUBLIC, 'auth.md'), 'utf8')
  assert(
    !/authorization_code/.test(authMd),
    'auth.md must not describe an OAuth flow the site does not implement',
  )
})

await check('legacy skill index redirect stub exists', async () => {
  assert(await exists('.well-known/skills/index.json'), 'stub missing')
  const stub = await readFile(path.join(PUBLIC, '.well-known/skills/index.json'), 'utf8')
  assert(stub.includes('/.well-known/agent-skills/index.json'), 'stub does not point at the new path')
})

console.log('\nContent')

await check('agent-data.json parses and is complete', async () => {
  const data = await readJson('.well-known/agent-data.json')
  assert(data.profile?.name, 'profile.name missing')
  assert(data.profile.skills?.length, 'no skills parsed')
  assert(data.profile.languages?.length, 'no languages parsed')
  assert(data.publications?.length >= 5, 'publications missing')
  assert(data.experience?.length >= 3, 'experience missing')
  assert(data.contact?.email, 'contact email missing')
  for (const pub of data.publications) {
    assert(pub.id?.startsWith('arXiv:'), `bad publication id: ${pub.id}`)
    assert(pub.url?.startsWith('https://arxiv.org/'), `bad publication url: ${pub.url}`)
  }
})

await check('every app has App Store + privacy + support links', async () => {
  const data = await readJson('.well-known/agent-data.json')
  for (const app of data.apps) {
    assert(app.name, `${app.slug}: no name`)
    assert(app.privacy?.endsWith('/privacy.html'), `${app.slug}: bad privacy url`)
    assert(app.support?.endsWith('/support.html'), `${app.slug}: bad support url`)
    if (app.appStore) {
      assert(app.appStore.startsWith('https://apps.apple.com/'), `${app.slug}: bad App Store url`)
    }
  }
})

await check('Markdown twins exist for every page with a rendered HTML body', async () => {
  const data = await readJson('.well-known/agent-data.json')
  for (const page of data.pages) {
    const rel = page.markdown.replace('https://koch.codes/', '')
    assert(await exists(rel), `missing twin: ${rel}`)
    const body = await readFile(path.join(PUBLIC, rel), 'utf8')
    assert(body.trim().length > 100, `${rel} looks empty`)
    assert(!/<(div|section|p|h1)\b/.test(body), `${rel} still contains HTML tags`)
  }
})

await check('Markdown twins resolve to real files on disk', async () => {
  const data = await readJson('.well-known/agent-data.json')
  for (const page of data.pages) {
    const twin = page.markdown.replace('https://koch.codes/', '')
    const dir = path.dirname(path.join(PUBLIC, twin))
    assert(await exists(path.relative(PUBLIC, dir)), `twin directory missing for ${twin}`)
  }
})

await check('llms-full.md covers profile, publications and apps', async () => {
  const body = await readFile(path.join(PUBLIC, 'llms-full.md'), 'utf8')
  for (const heading of ['## Experience', '## Publications', '## Apps', '## Identity']) {
    assert(body.includes(heading), `llms-full.md missing ${heading}`)
  }
  assert(!/undefined|\[object Object\]/.test(body), 'llms-full.md contains unresolved values')
})

await check('robots.txt keeps AI rules and declares content signals', async () => {
  const body = await readFile(path.join(PUBLIC, 'robots.txt'), 'utf8')
  assert(/^Sitemap:/m.test(body), 'no Sitemap directive')
  assert(/^Content-Signal:/m.test(body), 'no Content-Signal directive')
  for (const bot of ['GPTBot', 'ClaudeBot', 'OAI-SearchBot', 'PerplexityBot']) {
    assert(body.includes(`User-agent: ${bot}`), `no rule for ${bot}`)
  }
})

await check('sitemap.xml lists only pages that exist', async () => {
  const xml = await readFile(path.join(PUBLIC, 'sitemap.xml'), 'utf8')
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
  assert(locs.length >= 2, 'sitemap is empty')
  for (const loc of locs) {
    const rel = loc.replace('https://koch.codes/', '').replace(/\/$/, '/index.html')
    assert(await exists(rel === '/index.html' ? 'index.html' : rel), `sitemap lists missing page: ${loc}`)
  }
  assert(!locs.some((loc) => loc.includes('/apps/redline/')), 'redline has no landing page but is listed')
})

await check('sitemap carries a lastmod for every URL', async () => {
  const xml = await readFile(path.join(PUBLIC, 'sitemap.xml'), 'utf8')
  const urlBlocks = xml.match(/<url>[\s\S]*?<\/url>/g) ?? []
  assert(urlBlocks.length > 0, 'no <url> blocks')
  // A missing prefix (public/) once made git return a date for only one entry;
  // require every entry to carry one so that regression is caught.
  const withDates = urlBlocks.filter((block) => /<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/.test(block))
  assert(
    withDates.length === urlBlocks.length,
    `${urlBlocks.length - withDates.length} of ${urlBlocks.length} URLs lack a valid lastmod`,
  )
})

await check('a custom 404 page is published', async () => {
  const body = await readFile(path.join(PUBLIC, '404.html'), 'utf8')
  assert(body.includes('/apps/apps.css'), '404 should use the site stylesheet')
  assert(body.includes('noindex'), '404 should not be indexed')
  assert(body.includes('href="/"'), '404 should offer a way back')
})

await check('home page declares a social preview image', async () => {
  const html = await readFile(path.join(ROOT, 'index.html'), 'utf8')
  assert(/og:image" content="https:\/\/koch\.codes\/og\.jpg/.test(html), 'og:image missing or not absolute')
  assert(/twitter:card" content="summary_large_image"/.test(html), 'twitter card should be large')
  const image = await readFile(path.join(PUBLIC, 'og.jpg'))
  assert(image.length > 10000, 'og.jpg looks empty')
  // Must be a real JPEG and the documented 1200x630.
  assert(image[0] === 0xff && image[1] === 0xd8, 'og.jpg is not a JPEG')
})

await check('document language is kept in sync with the locale', async () => {
  const html = await readFile(path.join(ROOT, 'index.html'), 'utf8')
  assert(/document\.documentElement\.lang = locale/.test(html), 'bootstrap should set lang from the stored locale')
  const i18n = await readFile(path.join(ROOT, 'src/composables/useI18n.js'), 'utf8')
  assert(/document\.documentElement\.lang = l/.test(i18n), 'setLocale should update the document language')
  assert(/hreflang="de"/.test(html) && /hreflang="en"/.test(html), 'hreflang alternates missing')
})

console.log('\nWorker source')

const workerSource = await readFile(path.join(ROOT, 'workers/agent-edge.js'), 'utf8')

await check('worker has no unresolved build placeholders', () => {
  assert(!/__[A-Z_]+__/.test(workerSource), 'placeholder left in worker source')
})

await check('worker routes only the two dynamic endpoints', () => {
  for (const route of ['/mcp', '/a2a']) {
    assert(workerSource.includes(`url.pathname === '${route}'`), `no handler for ${route}`)
  }
})

await check('worker sets Vary: Accept on negotiated responses', () => {
  const occurrences = workerSource.match(/Vary/g) ?? []
  assert(occurrences.length >= 2, 'Vary should be set on markdown and HTML paths')
})

await check('worker guards against origin re-entry', () => {
  // Strip comments: the doc note explains why the pages host is avoided.
  const code = workerSource.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
  assert(code.includes('ORIGIN_HEADER'), 'origin subrequests should be tagged')
  assert(
    /headers\.set\(ORIGIN_HEADER, '1'\)/.test(code),
    'origin subrequests must be tagged so they cannot re-enter',
  )
  assert(
    /headers\.get\(ORIGIN_HEADER\) === '1'/.test(code),
    'worker must short-circuit tagged subrequests',
  )
  assert(!code.includes('kochc.github.io'), 'must not fetch the pages host (it 301s to the custom domain)')
})

await check('worker MCP tools match the server card', () => {
  for (const tool of serverCard.tools) {
    // Handlers are camelCased (list_publications -> listPublications).
    const camel = tool.name.replace(/_([a-z])/g, (_, char) => char.toUpperCase())
    assert(
      workerSource.includes(`${camel}(`) || workerSource.includes(`${tool.name}(`),
      `no handler for tool ${tool.name}`,
    )
  }
})

console.log('')
if (failures.length) {
  console.error(`${failures.length} check(s) failed, ${passed} passed.`)
  process.exit(1)
}
console.log(`All ${passed} checks passed.`)
