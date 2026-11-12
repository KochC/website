---
title: "Cronlet — Support"
canonical: "https://koch.codes/apps/cronlet/support.html"
---

# Support

We're happy to help.

Email [feedback@koch.codes](mailto:feedback@koch.codes) and we'll get back to you. Please include your iPhone model and iOS version if you're reporting a problem.

## How does Cronlet run my shortcuts?

iOS doesn't let apps start shortcuts directly. Cronlet sends a notification when a job is due, and **one Shortcuts automation** (not a new shortcut) reacts to it and runs the shortcut that is due. You set it up once; it works for all jobs.

## Setting up the automation (once)

- Shortcuts app → **Automation** tab (not "Shortcuts") → **+**.
- Trigger: app notifications → **Cronlet** → **Run Immediately** → New Blank Automation.
- Add Cronlet's **Get Due Shortcut** (leave the field empty).
- Add **Get My Shortcuts**.
- Add **Repeat with Each** over the result of Get My Shortcuts.
- Inside the loop: **If** Repeat Item → Name → is → result of Get Due Shortcut.
- Inside the If: **Run Shortcut** → Repeat Item.

Test it: create a job "Once" in 1 minute and lock your iPhone.

## "Shortcut not found"

The job's shortcut name must match the name in the Shortcuts app exactly, including spaces and capitalisation. Also make sure the automation uses the loop above — "Run Shortcut" can't take a name directly.

## Requirements

Notification-triggered automations need iOS 27 or later. Without the automation, tap a Cronlet notification to run the shortcut.

## Does it work offline?

Yes. Cronlet needs no internet connection and no account.

## Privacy

Cronlet collects no data. See the [Privacy Policy](https://koch.codes/apps/cronlet/privacy.html).

© Christopher Koch · [Cronlet](https://koch.codes/apps/cronlet/index.html) · [Privacy](https://koch.codes/apps/cronlet/privacy.html)
