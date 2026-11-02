# Classroom games
Preserve grade8 and grade9 as distinct historical variants. Open each index.html directly; there is no build dependency. Run npm test before proposing changes.
Keep Chinese, pinyin and Arabic aligned; preserve Arabic RTL and textbook scope. Changes to questions, scoring, relic difficulty or timers need focused behavior tests.
Never commit real students, grades, attendance, corrections or exported CSVs. Default rosters are explicitly fictional. Keep demo localStorage namespaces separate from classroom data. Do not add student identification from photos.
Shared policy source: https://github.com/KaelPhoenix/ai-workspace (reviewed branch chore/github-infrastructure). Cross-repository instructions do not load automatically: this file is authoritative locally until pinned shared files are imported. Do not claim shared synchronization is configured.
Use a development branch and PR. Do not deploy or change Pages settings as part of migration.
