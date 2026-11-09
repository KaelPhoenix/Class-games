# 于制课堂游戏 · 星际轨道
Actual self-contained source versions:
- [Grade 8](grade8/index.html): Library star-orbit-grade8-v1.html, current text retrieved 2026-11-02.
- [Grade 9](grade9/index.html): Library star-orbit-grade9-v23.html, current Library version 11.
- Original 8.1.html and Git history remain preserved.

Grade 8 now defaults to the latest four lessons present in this checkout: first-semester lessons 6–9 (57 words and 50 expressions). The original all-lesson, individual and cumulative lesson choices remain available. Real classroom roster replacement is pending confirmation of the current six-class roster source; repository defaults remain synthetic.

Open either HTML file directly in a browser. No dependency install or build is required. Use Node 22+ and npm test for source syntax and privacy boundary checks.

## Privacy
All embedded class rosters in the two imported versions were replaced with fictional DEMO names and synthetic IDs before any Git upload. Browser storage prefixes are isolated from the originals. No production data was edited. Learning questions, game rules, audio synthesis and layouts were retained.
The HTML was reconstructed from complete Library text reads; newline normalization may differ from original bytes. This is source recovery, not a claim of a byte-identical original export.

## Verification
The migration PR runs six checks for script parsing, self-contained documents, unique synthetic rosters and isolated storage. See its Actions result for execution evidence. Browser play, audio, difficulty behavior and mobile layouts remain unverified in this migration because the local execution environment disconnected. Do not merge on source checks alone if behavior changes are added.

## Codex
Select the migration branch until its PR is reviewed and merged. Read AGENTS.md, create a task branch, run npm test and submit a PR. This migration does not configure Codex account access or deploy GitHub Pages.

## Reproducible HTTP development

Use Node 24. Run `npm ci --ignore-scripts`, then `npm start` for grade 8 or `npm run start:grade9` for grade 9, at http://127.0.0.1:4173/ . PORT and HOST configure the local preview. Each command serves only that game's folder; repository files and legacy 8.1.html are not served. There are no third-party runtime dependencies and no build step.

`npm test` includes real HTTP startup and asset tests, read-only routing checks and both grade entries, alongside the original six syntax/privacy tests. These tests do not prove browser game play or difficulty behavior. Source class B: text recovery from historical HTML, with synthetic rosters. The latest PR and Actions status are authoritative; Codex account-level environment selection remains unverified. No Pages deployment is part of this work.

## Original historical vocabulary games

Source class A, read from existing Google Drive HTML files: [word matching](legacy/word-match/index.html) and [word mole](legacy/word-mole/index.html). Source size and provenance are recorded in [the manifest](docs/legacy-source-provenance.json); requested provider checksums were unavailable. These sources contain vocabulary only, with no student rosters or external assets.

Run `npm run start:match` or `npm run start:mole`. Added tests execute each original script in a minimal DOM test fixture, verify matching/scoring/timer behavior and make real HTTP requests to each application. This is logic and HTTP validation, not real-browser visual verification. The original word-mole pinyin for 长 is written as chǎng; correction to cháng remains a known teaching-content issue. These historical variants are archived without rewriting their content.

Additional original sources: [word flip](legacy/word-flip/index.html) via `npm run start:flip`, and [speed challenge](legacy/speed-challenge/index.html) via `npm run start:speed`. Both are vocabulary-only, self-contained historical HTML. Their matching/answer/timeout behavior is exercised from the original scripts. The duplicate matching file was compared as exactly equal decoded text and is listed as an alias, not duplicated in Git.
