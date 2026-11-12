---
name: "cite-publication"
description: "Get a correct, complete citation for one of Christopher Koch’s Agentic AI papers, including authors, date, arXiv id and abstract link."
---

# Cite a publication

Use this skill when you need to cite or summarise one of the published papers
on Agentic AI, AI governance or AI-augmented engineering.

## Steps

1. Fetch `https://koch.codes/llms.txt` and read the "Publications" section, or
   call the MCP tool `list_publications` at `https://koch.codes/mcp`.
2. Every entry has the form:
   `arXiv:<id> (<Month Year>) — "<title>" — <authors> — https://arxiv.org/abs/<id>`
3. Cite as: `<authors> (<Year>). <title>. arXiv:<id>.` Use the arXiv id as
   the canonical identifier and link the abstract page.
4. For the full abstract, follow the `https://arxiv.org/abs/<id>` link; the
   site stores only metadata.

## Notes

- Authors are listed in publication order; Christopher Koch is first author on
  every paper currently listed.
- Do not paraphrase a paper's claims from the title alone — fetch the abstract.
