# Changelogger

Local Manifest V3 Chrome / Brave extension that replaces the new tab with a changelog reader and a private todo list.

Everything stays in `chrome.storage.local`. No accounts, sync, or publish step — load the unpacked `dist` folder in developer mode.

## Stack

- pnpm + Vite + React + TypeScript
- Tailwind CSS + shadcn-style Radix primitives
- Lucide icons
- Geist (bundled via Fontsource)

## Develop

```bash
pnpm install
pnpm dev
```

`pnpm dev` is useful for UI work in a normal browser tab. Network fetches for arbitrary sites still need the extension service worker, so full changelog fetching is best verified from the unpacked build in Brave.

## Build

```bash
pnpm build
```

This writes an unpacked extension to `dist/`.

## Load in Brave

1. Open `brave://extensions`
2. Turn on **Developer mode**
3. Click **Load unpacked**
4. Choose the `dist` folder in this repo
5. Open a new tab — Changelogger should appear

If Brave still shows its own new tab, disable any other extension that also overrides the new tab page.

The toolbar icon opens the same UI as a compact popup. Below ~860px width (including the popup), use the **Changelog** / **Todos** tabs.

## Manual check

1. Click **Add** and choose **OpenAI API**
2. Confirm the latest changelog entry appears after the automatic fetch
3. Click the header refresh icon to refetch all sources
4. Add a custom changelog URL
5. Add, complete, and delete a todo
6. Narrow the window and switch between tabs
7. Open the toolbar popup and confirm the compact layout

## Notes

- The background service worker fetches pages because new-tab pages cannot freely cross-origin fetch.
- Parsing reads RSS/Atom when available, otherwise static HTML. Client-rendered-only changelogs may return “No changelog entries found”; you can still open the source URL from the UI.
