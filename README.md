# 于制课堂游戏 · 星际轨道
Actual self-contained source versions:
- [Grade 8](grade8/index.html): Library star-orbit-grade8-v1.html, current text retrieved 2026-11-02.
- [Grade 9](grade9/index.html): Library star-orbit-grade9-v23.html, current Library version 11.
- Original 8.1.html and Git history remain preserved.

Open either HTML file directly in a browser. No dependency install or build is required. Use Node 22+ and npm test for source syntax and privacy boundary checks.

## Privacy
All embedded class rosters in the two imported versions were replaced with fictional DEMO names and synthetic IDs before any Git upload. Browser storage prefixes are isolated from the originals. No production data was edited. Learning questions, game rules, audio synthesis and layouts were retained.
The HTML was reconstructed from complete Library text reads; newline normalization may differ from original bytes. This is source recovery, not a claim of a byte-identical original export.

## Verification
The migration PR runs six checks for script parsing, self-contained documents, unique synthetic rosters and isolated storage. See its Actions result for execution evidence. Browser play, audio, difficulty behavior and mobile layouts remain unverified in this migration because the local execution environment disconnected. Do not merge on source checks alone if behavior changes are added.

## Codex
Select the migration branch until its PR is reviewed and merged. Read AGENTS.md, create a task branch, run npm test and submit a PR. This migration does not configure Codex account access or deploy GitHub Pages.
