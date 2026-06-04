# Nutrapack Pricing Tool

An internal web tool for pricing plastic tubs and lids: landed cost, 50/40/30%
margins, full-container pricing, set pricing, a multi-line draft-quote builder
with PDF export, and a live ocean-freight market reference. It is a single static
page — no server, no build step — and runs from GitHub Pages.

## Repo structure

```
index.html                          The whole tool (UI + pricing logic + PDF export)
freight.json                        Market freight figures (overwritten daily by the Action)
README.md                           This file
.github/workflows/update-freight.yml   Scheduled job that refreshes freight.json
scripts/fetch-freight.mjs           Script the job runs to pull rates from Freightos
```

## Deploy (make it "launch like software")

1. Create a repo and add these files (keep the folder paths above).
2. Repo → **Settings → Pages** → set source to your main branch → **Save**.
3. After ~1 minute you get a URL like `https://YOURORG.github.io/REPO/`.
   Bookmark it for the team. They click, it opens — no downloads, no Excel.

> Internal pricing note: a public Pages site is visible to anyone with the URL.
> For internal-only access use a private repo with organization-restricted Pages
> (available on paid GitHub plans).

## How to update numbers

All costs live in `index.html` in the `DATA` and `FREIGHT_MATRIX` blocks near the
top of the `<script>`. Edit the value, commit, done — and the commit history is
your audit trail (who changed which rate, when, and the old value).

On-screen edits (shipping inputs, tariff cells) are **temporary what-ifs** only;
they do not save. Permanent changes go in the file + commit.

Two things to revisit before relying on it:
- **Freight matrix** — every lane rate is a placeholder except Mumbai → LA/Long Beach
  ($4,000). Replace each lane with your forwarder's real numbers.
- **Lid tariffs** — lids ship from China but are set to $0 tariff (matching the
  original sheet). Confirm whether duties now apply and update if so.

## Market-reference feed (optional, makes freight self-updating)

The tool shows a market freight figure beside your manual rate. It reads
`freight.json`, which the daily Action refreshes. Until you wire it up, the tool
shows a clearly-labelled **sample** number and works normally.

To make it live:
1. Get an API key at developer.freightos.com.
2. Repo → **Settings → Secrets and variables → Actions** → **New repository secret**
   named `FREIGHTOS_API_KEY`. (The key stays encrypted in GitHub and never reaches
   the published page — the Action uses it privately and only the resulting numbers
   are written to `freight.json`.)
3. In `scripts/fetch-freight.mjs`, fill the two spots marked `<-- CONFIRM`
   (the exact index endpoint URL and the response field name) from the Freightos docs.

The Action runs daily and also has a manual **Run workflow** button. Note the market
index covers China → US lanes; India/Mumbai has no headline index, so the reference
is a directional proxy at best for tubs.

## Notes

- The page needs an internet connection to load fonts, the PDF library, and the
  market feed. Pricing math itself works offline.
- The PDF library and brand fonts load from a CDN. If you ever need a fully
  offline/self-contained version, those can be bundled into the repo instead.
