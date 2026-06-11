# Nutrapack Pricing Tool

Internal web tool for pricing plastic tubs and lids: landed cost, 50/40/30%
margins, container/pallet/unit quoting, a draft-quote builder with branded PDF
export, a live ocean-freight market reference, and password-gated team editing
with signed version history. Static page, no server — runs on GitHub Pages.

## Repo structure

```
index.html                          The whole tool
versions.json                       PRICING SOURCE OF TRUTH (signed version history)
freight.json                        Market freight figures (Action overwrites daily)
config.json                         Created automatically by first-time setup (encrypted repo key)
README.md                           This file
.github/workflows/update-freight.yml   Scheduled market-rate job (optional)
scripts/fetch-freight.mjs           Script that job runs (optional)
```

## Deploy

1. Push these files to a repo (keep folder paths).
2. Settings → Pages → source = main branch → Save.
3. Bookmark the URL (e.g. `https://YOURORG.github.io/REPO/`).

> A public Pages site is visible to anyone with the URL. For internal-only
> access use a private repo with organization-restricted Pages (paid plans).

## How pricing updates work (team editing)

Pricing lives in `versions.json` as a list of dated, signed versions. The tool
always uses the latest; older ones stay selectable in the "Pricing Version"
dropdown for reference and re-quotes. The footer shows the active version and
who approved it.

To publish new pricing, any team member with the password:
1. Clicks **Edit for all members** at the bottom of the page.
2. Enters the **team password**.
3. Edits values on screen, OR clicks **Download current as Excel**, edits the
   numbers in Excel, and uploads the file back (review on screen after upload).
4. Types their name in **Signed / approved by** and clicks **Sign & publish**.

The tool commits a new version to `versions.json` through the GitHub API.
Everyone sees the new pricing within about a minute (GitHub Pages republish
delay). The git commit is a second, tamper-proof record of the change.

On-screen tweaks elsewhere in the tool (shipping inputs, tariff cells) remain
private what-ifs — only the editor flow publishes to the team.

## One-time setup (admin)

1. Create a **fine-grained personal access token**:
   GitHub → Settings → Developer settings → Personal access tokens →
   Fine-grained tokens → Generate new token.
   - Repository access: **Only select repositories** → this repo only.
   - Permissions: **Contents → Read and write**. Nothing else.
   - Set an expiration (e.g. 90 days) and note the renewal date.
2. Open the deployed tool, click **Edit for all members** — with no config yet
   it shows the setup form. Enter owner, repo name, the token, and choose a
   long team password (4+ random words). Save.
3. The tool encrypts the token with the password and commits `config.json`.
   Done — from now on the button asks only for the team password.

To rotate the token or change the password: delete `config.json` from the repo
and run setup again with a fresh token.

## Security model — read this honestly

- The GitHub token is stored in the repo **encrypted (AES-GCM, PBKDF2)** with
  the team password. Entering the password decrypts it in the browser's memory
  for that session only. Wrong password = decryption fails.
- This keeps out everyone who doesn't have the password. It does NOT protect
  against someone who HAS the password: they hold the repo key and the
  signature is honor-system (they type a name). Acceptable for an internal
  pricing tool; not for secrets bigger than that.
- Keep the password long, share it only with editors, rotate the token on a
  schedule, and prefer a private repo + restricted Pages if your plan allows.
- The token is scoped to this one repo with contents-only permissions, so even
  a worst-case leak exposes only this pricing repo, not your GitHub org.

## Market-reference feed (optional)

`freight.json` shows a market ocean-rate benchmark beside your manual freight.
To make it self-updating: get a key at developer.freightos.com, add it as an
Actions secret named `FREIGHTOS_API_KEY`, and fill the two spots marked
`<-- CONFIRM` in `scripts/fetch-freight.mjs`. Until then the tool shows a
clearly-labelled sample. India/Mumbai has no headline index — the benchmark
truly covers China → US lanes only.

## Notes

- Lane freight values are placeholders except Mumbai → LA/Long Beach ($4,000):
  replace with your forwarder's real rates (via the team editor).
- Lids ship from China at $0 tariff (shown as "included in pricing") — confirm
  whether duties now apply.
- Keep product IDs stable when editing (they link sets to lids).
- The page needs internet for fonts, the PDF/Excel libraries, and publishing.
