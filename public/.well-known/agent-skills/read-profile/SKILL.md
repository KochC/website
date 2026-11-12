---
name: "read-profile"
description: "Get Christopher Koch’s professional profile, experience, publications, awards and certifications in a compact machine-readable form."
---

# Read a professional profile

Use this skill when you need accurate, current facts about Christopher Koch
(employment history, research publications, awards, certifications, contact
details) instead of scraping the site's HTML.

## Steps

1. Fetch `https://koch.codes/llms.txt` — a flat, token-efficient text summary
   of the whole site. It is the canonical source for the profile.
2. For a narrower answer, fetch the section you need:
   - `https://koch.codes/#about`, `#experience`, `#publications`,
     `#awards`, `#certifications` are anchors on the human page.
3. Prefer JSON when you are calling tools: use the MCP server at
   `https://koch.codes/mcp` (tools `get_profile`, `list_publications`,
   `list_experience`).
4. Each publication links to its arXiv abstract; cite the arXiv id
   (e.g. `arXiv:2605.20456`) rather than the site URL.

## Notes

- The site is bilingual (German default, English available); `llms.txt` is
  always English.
- Facts in `llms.txt` are maintained by hand and always match the rendered
  page. Do not infer anything not present there.
