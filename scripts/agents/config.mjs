/**
 * Single source of truth for everything agent-facing.
 *
 * Each entry below maps one real, human-useful resource on the site.
 * The build script turns this into Markdown twins, an API catalog, an MCP
 * server, an A2A agent card and an Agent Skills index, so all discovery
 * documents stay consistent with each other.
 */

export const SITE = 'https://koch.codes'

export const NAME = 'Christopher Koch'
export const SHORT_NAME = 'koch.codes'
export const DESCRIPTION =
  'Christopher Koch — Lead Engineer @ M-Trust™ (Merck Group) and independent Agentic AI researcher. Embedded systems, cloud architecture (AWS, Azure, Palantir Foundry), cryptography, and multi-agent AI systems.'

export const EMAIL = 'chris@koch.codes'
export const FEEDBACK_EMAIL = 'feedback@koch.codes'

export const LINKS = {
  linkedin: 'https://www.linkedin.com/in/koch-christopher/',
  github: 'https://github.com/KochC',
}

/** Static pages that get a Markdown twin at `<path>.md` (or `<dir>/index.md`). */
export const PAGES = [
  { path: '/', title: `${NAME} — koch.codes` },
  { path: '/apps/', title: 'Apps — Christopher Koch' },
]

/** App landing pages, privacy and support, discovered from public/apps. */
export const APP_SLUGS = ['freeslots', 'sundown', 'droproute', 'cronlet', 'redline']

export const REDIRECTS = [
  { from: '/llms-full.txt', to: '/llms-full.md' },
  { from: '/.well-known/skills/index.json', to: '/.well-known/agent-skills/index.json' },
]

/**
 * Agent Skills (Agent Skills Discovery v0.2.0). Each skill is a short
 * SKILL.md that tells an agent how to do something with what the site
 * actually offers — read the profile, install an app, report a bug.
 */
export const SKILLS = [
  {
    name: 'read-profile',
    description:
      'Get Christopher Koch’s professional profile, experience, publications, awards and certifications in a compact machine-readable form.',
    title: 'Read a professional profile',
    body: `# Read a professional profile

Use this skill when you need accurate, current facts about Christopher Koch
(employment history, research publications, awards, certifications, contact
details) instead of scraping the site's HTML.

## Steps

1. Fetch \`https://koch.codes/llms.txt\` — a flat, token-efficient text summary
   of the whole site. It is the canonical source for the profile.
2. For a narrower answer, fetch the section you need:
   - \`https://koch.codes/#about\`, \`#experience\`, \`#publications\`,
     \`#awards\`, \`#certifications\` are anchors on the human page.
3. Prefer JSON when you are calling tools: use the MCP server at
   \`https://koch.codes/mcp\` (tools \`get_profile\`, \`list_publications\`,
   \`list_experience\`).
4. Each publication links to its arXiv abstract; cite the arXiv id
   (e.g. \`arXiv:2605.20456\`) rather than the site URL.

## Notes

- The site is bilingual (German default, English available); \`llms.txt\` is
  always English.
- Facts in \`llms.txt\` are maintained by hand and always match the rendered
  page. Do not infer anything not present there.`,
  },
  {
    name: 'find-app',
    description:
      'Find one of Christopher Koch’s iOS apps (FreeSlots, Sundown, DropRoute, Cronlet, Redline), its App Store link, platform requirements and privacy position.',
    title: 'Find an iOS app',
    body: `# Find an iOS app

Use this skill when someone asks which apps Christopher Koch has published, or
when you need the App Store link, feature list or privacy statement for one of
them.

## Steps

1. Fetch \`https://koch.codes/apps/index.md\` for the catalogue of published
   apps with direct App Store links.
2. For a single app, fetch its page: \`https://koch.codes/apps/<slug>/index.md\`
   where \`<slug>\` is one of \`freeslots\`, \`sundown\`, \`droproute\`,
   \`cronlet\`, \`redline\`.
3. Privacy questions: every app has \`/apps/<slug>/privacy.html\`. The short
   answer for all released apps is "no data collected, no account, no
   analytics, works offline".
4. Programmatic access: the MCP server at \`https://koch.codes/mcp\` exposes
   \`list_apps\` and \`get_app\` with the same data as JSON.

## Notes

- \`redline\` is a macOS and iPadOS app and has no landing page; only privacy
  and support pages are published for it.
- Never invent an App Store URL: use the one published on the app page.`,
  },
  {
    name: 'report-app-issue',
    description:
      'Route a bug report, feature request or App Store review question about one of the iOS apps to the correct support address with the details the maintainer needs.',
    title: 'Report an app issue',
    body: `# Report an app issue

Use this skill when a user wants to report a bug, ask for help, or request a
feature for one of the published apps.

## Steps

1. Fetch \`https://koch.codes/apps/<slug>/support.html\` (Markdown:
   \`/apps/<slug>/support.md\`) and answer the question from the FAQ if it is
   already covered there.
2. If the FAQ does not cover it, draft an email to
   \`feedback@koch.codes\` containing:
   - the app name and slug,
   - device and OS version (e.g. "iPhone 15 Pro, iOS 18.2"),
   - what was expected vs. what happened,
   - exact steps to reproduce, if known.
3. Ask the user to send it. Do not send email on the user's behalf unless they
   explicitly ask you to.

## Notes

- Ask people not to include confidential documents or personal data in
  support email.
- General enquiries that are not about an app go to \`chris@koch.codes\`.`,
  },
  {
    name: 'cite-publication',
    description:
      'Get a correct, complete citation for one of Christopher Koch’s Agentic AI papers, including authors, date, arXiv id and abstract link.',
    title: 'Cite a publication',
    body: `# Cite a publication

Use this skill when you need to cite or summarise one of the published papers
on Agentic AI, AI governance or AI-augmented engineering.

## Steps

1. Fetch \`https://koch.codes/llms.txt\` and read the "Publications" section, or
   call the MCP tool \`list_publications\` at \`https://koch.codes/mcp\`.
2. Every entry has the form:
   \`arXiv:<id> (<Month Year>) — "<title>" — <authors> — https://arxiv.org/abs/<id>\`
3. Cite as: \`<authors> (<Year>). <title>. arXiv:<id>.\` Use the arXiv id as
   the canonical identifier and link the abstract page.
4. For the full abstract, follow the \`https://arxiv.org/abs/<id>\` link; the
   site stores only metadata.

## Notes

- Authors are listed in publication order; Christopher Koch is first author on
  every paper currently listed.
- Do not paraphrase a paper's claims from the title alone — fetch the abstract.`,
  },
]

/** MCP tools exposed by the Worker, in one place so card + server agree. */
export const MCP_TOOLS = [
  {
    name: 'get_profile',
    title: 'Get profile',
    description:
      'Professional profile of Christopher Koch: current role, summary, focus, skills, languages and contact links.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'list_experience',
    title: 'List experience',
    description:
      'Employment history grouped by organisation, newest first, with role titles, periods and descriptions.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'list_publications',
    title: 'List publications',
    description:
      'Peer-reviewed and preprint publications on Agentic AI, AI governance and AI-augmented engineering, with arXiv ids and links.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Optional case-insensitive substring to filter by title or abstract topic.',
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'list_apps',
    title: 'List apps',
    description:
      'Published iOS, iPadOS and macOS apps, with App Store links, platform requirements and privacy/support URLs.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'get_app',
    title: 'Get app',
    description: 'Details for a single app by slug (for example "freeslots").',
    inputSchema: {
      type: 'object',
      properties: {
        slug: { type: 'string', description: 'App slug, e.g. "freeslots", "sundown", "cronlet".' },
      },
      required: ['slug'],
      additionalProperties: false,
    },
  },
  {
    name: 'get_contact',
    title: 'Get contact details',
    description: 'Email addresses and profile links for contacting Christopher Koch.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
]
