# financial-tracker

A personal financial dashboard for Darren — cash flow, spending, debt, and flagged
findings, built from NAB transaction history. This repo is a private, version-controlled
copy of the dashboard; it is **not** published anywhere on the public web.

## Viewing it

Double-click `index.html` (or open it in a browser via File → Open). No server, no
build step — it's a single self-contained file. It needs an internet connection the
first time it loads to fetch its two Google Fonts; everything else works offline.

## What it's built from

The numbers here are a snapshot from `Financial Tracker - DH.xlsx` (the master
workbook in `07 Personal Documents\Financial Planning`), as of the date in the
dashboard's header. It does not update itself — it's regenerated and recommitted
each time the workbook has a material update worth reflecting here (ask Claude to
"update the financial-tracker dashboard" after a review, and it'll rebuild
`index.html` from the current workbook and hand you the updated file to drop back
into this folder).

## Why this lives outside GitHub Pages

GitHub Pages sites are public URLs — anyone with the link can open them, paid-plan
restrictions aside. Since this dashboard has real balances, spending, and debt
figures, it's kept as a private repo with no Pages site: version history and backup,
without a public web address.

## One-time setup: pushing this to GitHub

You'll need to do the actual GitHub authentication yourself — that's not something
that can be done on your behalf. From this folder:

```bash
# 1. Install the GitHub CLI if you don't already have it:
#    https://cli.github.com

# 2. Log in (opens a browser, you approve it there):
gh auth login

# 3. Create the private repo and push this commit:
gh repo create financial-tracker --private --source=. --remote=origin --push
```

That's it — from then on, whenever this folder's contents are updated, push again with:

```bash
git add -A
git commit -m "Update dashboard"
git push
```

## Note on OneDrive

This folder sits inside your OneDrive-synced Desktop path. That's fine for a small,
infrequently-updated repo like this one, but OneDrive's own sync can occasionally
clash with git on large or rapidly-changing repos. If that ever becomes a problem,
the fix is just moving this folder somewhere outside OneDrive and re-adding the
`origin` remote — nothing about the repo itself needs to change.
