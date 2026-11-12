# auth.md

This site is a public, read-only personal website and portfolio for Christopher Koch.

## Summary

- **Registration: not available.** There are no accounts, API keys, OAuth
  clients or agent identities to obtain on koch.codes.
- **Authentication: not required.** Every published resource — HTML pages,
  Markdown twins, `/llms.txt`, `/llms-full.md`, `/.well-known/*` discovery
  documents, and the read-only MCP endpoint at `/mcp` — is publicly readable
  without credentials.
- **Writes: not supported.** No endpoint accepts user or agent data. The MCP
  server exposes read-only tools only.

## What an agent can access

| Resource | Purpose |
| --- | --- |
| `https://koch.codes/llms.txt` | Canonical plain-text summary of the whole site |
| `https://koch.codes/llms-full.md` | Long-form Markdown (profile, work history, publication abstracts) |
| `https://koch.codes/.well-known/agent-data.json` | Same facts as structured JSON |
| `https://koch.codes/.well-known/api-catalog` | API catalogue (RFC 9727 linkset) |
| `https://koch.codes/.well-known/mcp/server-card.json` | MCP server card for `/mcp` |
| `https://koch.codes/.well-known/agent-skills/index.json` | Agent skills index |

## When credentials *are* relevant

They are not, for anything published here. There is no OAuth authorization
server on this domain, no client registration, and no scopes to request — so no
`/.well-known/oauth-authorization-server` or
`/.well-known/oauth-protected-resource` document is published. If you need
something beyond the public content, contact chris@koch.codes.

## Contact

Questions about access, licensing or reuse: chris@koch.codes.
