# financial-tracker

Darren's personal financial dashboard — cash flow, spending, debt, and flagged
findings, built from NAB transaction history. It's a public GitHub Pages site
behind a PIN gate, backed by a live Google Sheets/Apps Script data source, modeled
on the PPB GM operations dashboard's Board Report tab pattern.

## Viewing it

Live at: `https://dazinc.github.io/Financial-Tracker/` (once Pages is enabled —
see "One-time setup" below).

Enter the PIN to view. **This is a basic access gate, not encryption** — the same
pattern as the GM dashboard's Board Report tab. It keeps the numbers from showing
up on screen to a casual visitor with the link; it does not protect the underlying
data, which is fetched live from the Apps Script endpoint on every page load. Treat
the repo, the Pages URL, and the PIN the same way you'd treat a shared-link Google
Doc: fine for family, not for anywhere the link could end up public.

## How it's built

- **Frontend**: `index.html` — a single self-contained static file (HTML/CSS/JS,
  no build step, no dependencies). On load it shows the PIN gate, then fetches the
  current dataset from the Apps Script backend and renders the charts, KPIs, and
  findings client-side.
- **Backend**: `apps-script/Code.gs`, deployed as a Google Apps Script web app
  bound to a Google Sheet. `doGet` returns the current dataset as JSON; `doPost`
  accepts a full dataset replacement, gated by a shared `WRITE_SECRET` so random
  requests to the URL can't overwrite the data. Claude pushes updates here
  whenever the source workbook changes — ask Claude to "update the financial
  tracker dashboard" after a review, and it'll rebuild the payload from
  `Financial Tracker - DH.xlsx` and POST it to the endpoint. No local file changes
  or redeploys are needed for a data-only refresh; `index.html` just fetches
  whatever's live in the Sheet.
- **Data**: the Sheet is the source of truth for what's currently displayed. The
  workbook (`07 Personal Documents\Financial Planning\Financial Tracker - DH.xlsx`)
  is the source of truth for what *should* be displayed — the two are kept in sync
  by Claude via the steps above, not automatically.

## One-time setup: making the repo public and enabling Pages

This repo currently needs to be flipped from private to public, and Pages needs to
be turned on — both are account-level GitHub settings Claude can't do on your
behalf.

1. On GitHub, go to **Settings → General**, scroll to "Danger Zone," and change
   visibility to **Public**.
2. Go to **Settings → Pages**, set **Source** to "Deploy from a branch," branch
   `main`, folder `/ (root)`, and save.
3. GitHub will publish the site at `https://dazinc.github.io/Financial-Tracker/`
   within a minute or two.

## Day-to-day updates

Pushing code changes (to `index.html` or `Code.gs`) works like any git repo:

```bash
git add -A
git commit -m "..."
git push
```

Pushing a **data-only** refresh (new month's numbers, updated findings) doesn't
touch git at all — it's a POST to the Apps Script endpoint with the `WRITE_SECRET`.
Ask Claude to do this after updating the workbook.

## Note on OneDrive

This folder sits inside your OneDrive-synced Desktop path. That's fine for a small,
infrequently-updated repo like this one, but OneDrive's own sync can occasionally
clash with git on large or rapidly-changing repos. If that ever becomes a problem,
the fix is just moving this folder somewhere outside OneDrive and re-adding the
`origin` remote — nothing about the repo itself needs to change.
