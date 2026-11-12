/**
 * Shared helpers for the agent-readiness build:
 * a small HTML -> Markdown converter for our own simple static pages, and
 * parsers that turn the existing content sources into structured data.
 *
 * Nothing here contains site copy: text always comes from public/llms.txt or
 * from the static pages in public/apps/, so the generated agent files cannot
 * drift away from what humans see.
 */

const SITE = 'https://koch.codes'

const ENTITIES = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  middot: '·',
  larr: '←',
  rarr: '→',
  copy: '©',
  mdash: '—',
  ndash: '–',
  hellip: '…',
  rsquo: '’',
  lsquo: '‘',
  ldquo: '“',
  rdquo: '”',
  trade: '™',
}

export function decodeEntities(text) {
  return text
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&([a-z]+);/gi, (match, name) => ENTITIES[name.toLowerCase()] ?? match)
}

/**
 * Absolute-ise in-site links so markdown twins work when fetched directly.
 * `base` is the page's own URL, because some pages link relatively
 * (e.g. an app page links "privacy.html").
 */
function absolutiseHref(href, base = `${SITE}/`) {
  const value = href.trim()
  if (!value) return value
  if (/^(https?:|mailto:|tel:|#)/i.test(value)) return value
  return new URL(value, base).href
}

/**
 * Collapse the line breaks inside a single text node. Hand-written HTML wraps
 * prose across lines; joining with a space keeps sentences readable, but must
 * not be used where the whitespace is meaningful (code blocks).
 */
function unwrap(text) {
  return collapse(text.replace(/\s*\n\s*/g, ' '))
}

function readAttribute(attrs, name) {
  const match = attrs.match(new RegExp(`${name}\\s*=\\s*"([^"]*)"`, 'i'))
  return match ? decodeEntities(match[1]) : null
}

function collapse(text) {
  return text.replace(/[ \t\u00a0]+/g, ' ').trim()
}

/**
 * Convert one of our hand-written static pages to Markdown.
 * Deliberately narrow: these pages only use headings, paragraphs, lists,
 * links, emphasis and code, so a full HTML parser would be overkill.
 */
export function htmlToMarkdown(html, base = `${SITE}/`) {
  const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  let text = body ? body[1] : html

  // Purely decorative or non-content nodes.
  text = text.replace(/<svg[\s\S]*?<\/svg>/gi, '')
  text = text.replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, '')
  // Back links and the pill repeat the page title; they add noise, not meaning.
  text = text.replace(/<p class="back"[^>]*>[\s\S]*?<\/p>/gi, '')
  text = text.replace(/<span class="pill"[^>]*>[\s\S]*?<\/span>/gi, '')
  // The store badge is mostly an SVG; keep the link itself, it is the most
  // useful thing on an app page for an agent.
  text = text.replace(/<a class="store-badge\b([^>]*)>[\s\S]*?<\/a>/gi, (_, attrs) => {
    const href = readAttribute(attrs, 'href')
    return href ? `\n\n- App Store: ${absolutiseHref(href, base)}\n\n` : ''
  })

  // Screenshots: keep the descriptive alt text, drop the image itself.
  text = text.replace(/<figure[^>]*>([\s\S]*?)<\/figure>/gi, (_, inner) => {
    const alt = readAttribute(inner, 'alt')
    return alt ? `\n\n- ${collapse(alt)}` : ''
  })

  // Link cards hold a heading and a paragraph; flatten them into one item so
  // the heading does not leak into the document outline as a real section.
  text = text.replace(/<a class="card"\b([^>]*)>([\s\S]*?)<\/a>/gi, (_, attrs, inner) => {
    const href = readAttribute(attrs, 'href')
    const heading = collapse(decodeEntities(inner.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i)?.[1] ?? '')
      .replace(/<[^>]+>/g, ''))
    const body = collapse(decodeEntities(inner.match(/<p[^>]*>([\s\S]*?)<\/p>/i)?.[1] ?? '')
      .replace(/<[^>]+>/g, ''))
    if (!heading) return body
    const link = href ? `[${heading}](${absolutiseHref(href, base)})` : heading
    return `\n\n- **${link}**${body ? ` — ${body}` : ''}\n\n`
  })
  text = text.replace(/<img\b[^>]*>/gi, '')

  // Inline conversion must run before we strip tags.
  text = text.replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi, (_, attrs, inner) => {
    const href = readAttribute(attrs, 'href')
    const label = unwrap(decodeEntities(inner.replace(/<[^>]+>/g, '')))
    if (!href || !label) return label
    return `[${label}](${absolutiseHref(href, base)})`
  })
  text = text.replace(/<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>/gi, (_, __, inner) => `**${unwrap(inner)}**`)
  text = text.replace(/<(em|i)\b[^>]*>([\s\S]*?)<\/\1>/gi, (_, __, inner) => `*${unwrap(inner)}*`)
  text = text.replace(/<code\b[^>]*>([\s\S]*?)<\/code>/gi, (_, inner) => '`' + collapse(inner) + '`')

  // Block conversion.
  text = text.replace(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi, (_, level, inner) => {
    return `\n\n${'#'.repeat(Number(level))} ${unwrap(inner.replace(/<[^>]+>/g, ''))}\n\n`
  })
  text = text.replace(/<li\b[^>]*>([\s\S]*?)<\/li>/gi, (_, inner) => `\n- ${unwrap(inner.replace(/<[^>]+>/g, ''))}`)
  text = text.replace(/<\/(ul|ol)>/gi, '\n\n')
  text = text.replace(/<(ul|ol)\b[^>]*>/gi, '\n\n')
  text = text.replace(/<p\b[^>]*>([\s\S]*?)<\/p>/gi, (_, inner) => `\n\n${unwrap(inner.replace(/<[^>]+>/g, ''))}\n\n`)
  text = text.replace(/<br\s*\/?>/gi, '  \n')
  text = text.replace(/<hr\b[^>]*>/gi, '\n\n---\n\n')
  text = text.replace(/<\/?(div|section|article|header|footer|main|nav|span|td|tr|table|thead|tbody|figure|figcaption|button)\b[^>]*>/gi, '\n')

  text = text.replace(/<[^>]+>/g, '')
  text = decodeEntities(text)

  let markdown = text
    .replace(/\r/g, '')
    .split('\n')
    // Removed wrappers leave behind their indentation; markdown is indentation
    // sensitive, so normalise leading whitespace on every line.
    .map((line) => line.replace(/^[ \t]+/, '').replace(/[ \t]+$/, ''))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')

  // Blank lines between sibling list items would make every list "loose", and
  // items can arrive separated by several newlines, so repeat until stable.
  let previous
  do {
    previous = markdown
    markdown = markdown.replace(/(\n[ \t]*- [^\n]*)\n{2,}(?=[ \t]*- )/g, '$1\n')
  } while (markdown !== previous)

  return markdown.replace(/\n{3,}/g, '\n\n').trim()
}

/** Pull the machine-relevant facts out of an app landing page. */
export function parseAppPage(html, slug) {
  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1] ?? slug
  const name = html.match(/<h1 id="app-name">([^<]+)<\/h1>/i)?.[1] ?? title.split('—')[0].trim()
  const tagline = html.match(/<p class="tagline">([\s\S]*?)<\/p>/i)?.[1]
  const intro = html.match(/<p class="intro">([\s\S]*?)<\/p>/i)?.[1]
  const description = html.match(/<meta name="description" content="([^"]+)"/i)?.[1]
  const appStore = html.match(/href="(https:\/\/apps\.apple\.com\/[^"]+)"/i)?.[1]
  const chips = [...html.matchAll(/<li>([^<]+)<\/li>/g)]
    .map((m) => decodeEntities(m[1]).trim())
    .filter((chip) => chip && !chip.includes(':'))
  const features = [...html.matchAll(/<ul class="features">([\s\S]*?)<\/ul>/g)]
    .flatMap((block) => [...block[1].matchAll(/<li>([\s\S]*?)<\/li>/g)])
    .map((m) => collapse(decodeEntities(m[1].replace(/<[^>]+>/g, ''))))
    .filter(Boolean)

  return {
    slug,
    name: collapse(decodeEntities(name)),
    tagline: tagline ? collapse(decodeEntities(tagline)) : null,
    summary: collapse(decodeEntities(intro ?? description ?? '')),
    appStore: appStore ?? null,
    platforms: chips,
    features,
    url: `${SITE}/apps/${slug}/`,
    privacy: `${SITE}/apps/${slug}/privacy.html`,
    support: `${SITE}/apps/${slug}/support.html`,
    markdown: `${SITE}/apps/${slug}/index.md`,
  }
}

/** Parse public/llms.txt into sections keyed by their `##` heading. */
export function splitSections(llmsTxt) {
  const sections = {}
  const parts = llmsTxt.split(/^## /m)
  for (const part of parts.slice(1)) {
    const newline = part.indexOf('\n')
    const heading = collapse(part.slice(0, newline))
    sections[heading] = part.slice(newline + 1).trim()
  }
  return sections
}

function parsePublications(section) {
  return section
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /^-\s*arXiv:/.test(line))
    .map((line) => {
      const body = line.replace(/^-\s*/, '')
      const id = body.match(/^(arXiv:[\d.]+)/)?.[1] ?? ''
      // Keep the site's own wording ("Jun 2026") rather than inventing one.
      const date = body.match(/\(([A-Za-z]+ \d{4})\)/)?.[1] ?? ''
      const quoted = body.match(/—\s*"([^"]+)"/)?.[1] ?? ''
      const authors = body.match(/"\s*—\s*([^—]+?)\s*—\s*https?:\/\//)?.[1] ?? ''
      const url = body.match(/(https:\/\/\S+)$/)?.[1] ?? ''
      return {
        id,
        date,
        title: collapse(quoted),
        authors: collapse(authors),
        url,
        abstract: url ? url.replace('/abs/', '/pdf/') : null,
      }
    })
}

function parseDatedList(section) {
  return section
    .split(';')
    .map((entry) => collapse(entry.replace(/\.$/, '')))
    .filter(Boolean)
    .map((entry) => {
      const match = entry.match(/^(.*?)\s*\(([^()]*)\)$/)
      if (!match) return { name: entry, year: null, issuer: null }
      const [, name, paren] = match
      const parts = paren.split(',').map((part) => part.trim())
      const year = parts.find((part) => /^\d{4}$/.test(part)) ?? null
      const issuer = year ? parts.filter((part) => part !== year).join(', ') || null : paren
      return { name: collapse(name), year, issuer }
    })
}

function parseExperience(section) {
  const organisations = []
  const blocks = section.split(/^\*\*/m).slice(1)
  for (const block of blocks) {
    const header = block.match(/^([^*]+)\*\*\s*—\s*([^\n]+)/)
    if (!header) continue
    const roles = []
    for (const line of block.split('\n')) {
      const role = line.match(/^-\s*(.+?)\s*\(([^)]+)\):\s*(.*)$/)
      if (!role) continue
      roles.push({
        title: collapse(role[1]).replace(/\s*\|\s*/g, ' · '),
        period: collapse(role[2]),
        description: collapse(role[3]),
      })
    }
    organisations.push({
      company: collapse(header[1]),
      location: collapse(header[2]),
      roles,
    })
  }
  return organisations
}

/** Contact details live in llms.txt; keep parsing them from there only. */
function parseContact(section) {
  const contact = {}
  for (const line of section.split('\n')) {
    const match = line.match(/^-\s*([^:]+):\s*(\S+)/)
    if (!match) continue
    contact[collapse(match[1]).toLowerCase().replace(/\s+/g, '_')] = match[2].trim()
  }
  return contact
}

/** Split a comma-separated list, ignoring commas inside parentheses. */
function splitList(value) {
  const parts = []
  let current = ''
  let depth = 0
  for (const char of value) {
    if (char === '(') depth += 1
    if (char === ')') depth = Math.max(0, depth - 1)
    if (char === ',' && depth === 0) {
      parts.push(current)
      current = ''
      continue
    }
    current += char
  }
  parts.push(current)
  return parts.map((part) => part.trim()).filter(Boolean)
}

export function buildContent({ llmsTxt, apps }) {
  const sections = splitSections(llmsTxt)
  const about = sections['About'] ?? ''
  const paragraphs = about
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter((block) => block && !/^\*\*/.test(block))
  const skills = splitList(about.match(/^Skills: (.*)$/m)?.[1] ?? '')
  const languages = splitList(about.match(/^Languages: (.*)$/m)?.[1] ?? '')
    .map((entry) => {
      const match = entry.match(/^(.+?)\s*\((.+)\)\.?$/)
      return match ? { name: match[1].trim(), level: match[2].trim() } : { name: entry.replace(/\.$/, ''), level: null }
    })
  const awardsLine = sections['Awards'] ?? ''
  const certsLine = sections['Certifications'] ?? ''

  return {
    profile: {
      name: 'Christopher Koch',
      title: 'Lead Engineer @ M-Trust™ (Merck Group) · Independent Agentic AI Researcher',
      url: `${SITE}/`,
      summary: paragraphs.filter((p) => !p.startsWith('Focus:')).join('\n\n'),
      focus: paragraphs.find((p) => p.startsWith('Focus:')) ?? '',
      skills,
      languages,
      contact: parseContact(sections['Contact & Profiles'] ?? ''),
    },
    experience: parseExperience(sections['Experience'] ?? ''),
    publications: parsePublications(sections['Publications'] ?? ''),
    awards: parseDatedList(awardsLine),
    certifications: parseDatedList(certsLine),
    apps,
  }
}

export { SITE, collapse }
