---
name: "find-app"
description: "Find one of Christopher Koch’s iOS apps (FreeSlots, Sundown, DropRoute, Cronlet, Redline), its App Store link, platform requirements and privacy position."
---

# Find an iOS app

Use this skill when someone asks which apps Christopher Koch has published, or
when you need the App Store link, feature list or privacy statement for one of
them.

## Steps

1. Fetch `https://koch.codes/apps/index.md` for the catalogue of published
   apps with direct App Store links.
2. For a single app, fetch its page: `https://koch.codes/apps/<slug>/index.md`
   where `<slug>` is one of `freeslots`, `sundown`, `droproute`,
   `cronlet`, `redline`.
3. Privacy questions: every app has `/apps/<slug>/privacy.html`. The short
   answer for all released apps is "no data collected, no account, no
   analytics, works offline".
4. Programmatic access: the MCP server at `https://koch.codes/mcp` exposes
   `list_apps` and `get_app` with the same data as JSON.

## Notes

- `redline` is a macOS and iPadOS app and has no landing page; only privacy
  and support pages are published for it.
- Never invent an App Store URL: use the one published on the app page.
