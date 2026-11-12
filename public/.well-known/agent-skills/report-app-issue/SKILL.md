---
name: "report-app-issue"
description: "Route a bug report, feature request or App Store review question about one of the iOS apps to the correct support address with the details the maintainer needs."
---

# Report an app issue

Use this skill when a user wants to report a bug, ask for help, or request a
feature for one of the published apps.

## Steps

1. Fetch `https://koch.codes/apps/<slug>/support.html` (Markdown:
   `/apps/<slug>/support.md`) and answer the question from the FAQ if it is
   already covered there.
2. If the FAQ does not cover it, draft an email to
   `feedback@koch.codes` containing:
   - the app name and slug,
   - device and OS version (e.g. "iPhone 15 Pro, iOS 18.2"),
   - what was expected vs. what happened,
   - exact steps to reproduce, if known.
3. Ask the user to send it. Do not send email on the user's behalf unless they
   explicitly ask you to.

## Notes

- Ask people not to include confidential documents or personal data in
  support email.
- General enquiries that are not about an app go to `chris@koch.codes`.
