# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WME Template is a TamperMonkey/GreaseMonkey userscript boilerplate for Waze Map Editor (WME). It provides a starting point for building new WME scripts with buttons, keyboard shortcuts, sidebar tabs, modal windows, and settings panels.

Source is written in TypeScript under `src/`, built with Rollup into a single IIFE at `WME-Template.user.js` (root directory). GreasyFork auto-syncs from the output file.

## Commands

- **Install:** `npm install`
- **Build:** `npm run build`
- **Watch:** `npm run watch` (rebuild on changes)
- No test or lint steps exist.

## Architecture

```
src/
├── meta.ts          # userscript header (comment block, not TS code)
├── style.css        # plain CSS, imported as string
├── globals.d.ts     # declares WME runtime globals (WMEBase, WMEUI, etc.)
├── translations.ts  # NAME constant, TRANSLATION (en, uk, ru), SETTINGS
├── buttons.ts       # getButtons() function (deferred, uses I18n.t)
├── template.ts      # Template class (extends WMEBase)
└── index.ts         # bootstrap: registers translations/CSS, instantiates Template
```

**Build output:** `WME-Template.user.js` — IIFE with userscript header prepended as banner. Version is read from `package.json` via `{{version}}` placeholder in `meta.ts`.

**Key external dependencies** (loaded via `@require` in userscript header, not bundled):
- WME-Bootstrap.js, WME-Base.js, WME-UI.js, CommonUtils.js (WME script ecosystem)

## Coding Conventions

- TypeScript with `strict: false` — minimal type annotations, `any` for WME SDK types
- GitHub Actions auto-builds output on push to main
