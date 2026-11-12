# koch.codes

Personal website built with Vue 3 and Vite.

## Description

This is the source code for koch.codes, a personal website showcasing projects and information about Christian Koch's work in software development, embedded systems, and electronics.

## Tech Stack

- **Framework**: Vue 3
- **Build Tool**: Vite 6
- **Language**: JavaScript

## Installation

```bash
npm install
```

## Development

Run the development server with hot-reload:

```bash
npm run dev
```

The site will be available at `http://localhost:5173`

## Production Build

Build the site for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Project Structure

- `src/` - Source files
- `public/` - Static assets
- `index.html` - Entry HTML file
- `vite.config.js` - Vite configuration
- `scripts/` - Build/test tooling (agent-readiness generator lives in `scripts/agents/`)
- `workers/` - Cloudflare Worker for edge-only features (Markdown negotiation, Link headers, MCP, A2A)

## Agent readiness

The site publishes the emerging "agent-ready web" standards so AI agents can
read and use it cheaply and reliably:

| Concern | What is served |
| --- | --- |
| Discovery | `robots.txt` (AI rules + Content-Signal), `sitemap.xml`, `Link` response headers |
| Content | Markdown twin of every page, `llms.txt`, `llms-full.md` |
| Protocols | `/.well-known/api-catalog`, `/.well-known/mcp/server-card.json` + `/mcp`, `/.well-known/agent-card.json` + `/a2a` |
| Auth | `/auth.md`, `/.well-known/oauth-authorization-server`, `/.well-known/oauth-protected-resource` |
| Skills | `/.well-known/agent-skills/index.json` |

Everything static is **generated from the pages people actually read**, so it
cannot drift: `scripts/build-agent-files.mjs` parses `public/llms.txt` and the
app pages, then writes the Markdown twins, discovery documents and digests.

```bash
npm run agents:build    # regenerate public/ (also runs as part of `npm run build`)
npm run agents:check    # fail if public/ is out of sync
npm run agents:test     # validate specs + run the Worker against a stubbed origin
npm run agents:deploy   # deploy the Cloudflare Worker (needs CLOUDFLARE_API_TOKEN)
```

Two things cannot be done by static hosting and live in the Worker:

- **Markdown negotiation** — `Accept: text/markdown` returns the `.md` twin while
  browsers keep getting HTML (`Vary: Accept` on both paths).
- **`/mcp` and `/a2a`** — a read-only MCP server (6 tools over the generated
  `agent-data.json`) and a minimal A2A endpoint, both with no auth and no writes.

The Worker is designed so a missing or broken twin never breaks a page: it falls
through to the HTML response. It also strips `Content-Encoding`/`Content-Length`
from proxied responses (the runtime decodes the body) and sets
`application/linkset+json` for the extensionless API catalog.

Scan the result with `POST https://isitagentready.com/api/scan` (`{"url":"https://koch.codes"}`).


## License

Private project - All rights reserved

## Tags

`personal-website` `vue3` `vite` `portfolio` `web-development`
