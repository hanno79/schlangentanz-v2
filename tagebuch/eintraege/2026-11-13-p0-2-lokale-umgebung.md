---
datum: 2026-11-13
zeit: 08:55
titel: P0.2 abgenommen: Die lokale Umgebung baut, prüft und erreicht Codex, GitHub, Vercel und Dart
art: fortschritt
wer: Claude Code
betrifft: P0.2
kapitel: 3
---

Der Testhook-Build lief unter Windows nicht, weil `package.json` die Variable in POSIX-Schreibweise setzte. Er läuft jetzt über `vite build --mode testhooks`; den Schalter setzt `vite.config.ts`. Eine `.env.testhooks`, wie sie der Plan vorsah, lehnt der Regelcheck ab, deshalb fiel sie weg. Dazu kamen zwei Funde aus dem ersten Gate-Lauf: Node 25 verdeckt mit seinem eigenen `localStorage` das von jsdom, und Arbeitskopien, die vor der `.gitattributes` ausgecheckt wurden, liegen mit CRLF vor.

Ein unabhängiger Prüfer hat alle sechs Kriterien selbst nachvollzogen, im Browser den Testhook-Build gegen den Produktionsbuild geprüft und ohne Mängel abgenommen (`docs/abnahme/P0.2.md`). Kilo brach auf beiden Commits mit einem Dienstfehler ab, CodeRabbit prüft PRs gegen `neuaufbau` nicht. Für Task-Merges in `neuaufbau` blockiert das nach Entscheidung des Autors nicht.
