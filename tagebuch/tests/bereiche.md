---
eingerichtet: 2026-11-12
---

## Bereiche

| ID | Bereich | Pfade |
|---|---|---|
| ENGINE | Spiel-Engine: Regeln, Zugablauf, Wertung, Speicherformat | src/engine/** |
| KI | KI-Gegner | src/ki/** |
| BRETT | Spieltisch und Kartenaktionen | src/aktionsziel/**, src/reaktionen.ts, src/aktionsLabel.ts, src/spielLabelHelpers.ts, src/kartenTexte.ts, src/kartenfarben.ts |
| APP | App-Rahmen, Lobby, Fehlerdienst | src/App*, src/main.tsx, src/index.css, src/components/**, src/fehlerdienst.ts, src/spielstand*.ts, src/assets/**, public/**, index.html, tests/layout/platzhalter.spec.ts |
| DEV | Entwicklertisch unter /dev (nur Testhook-Build) | src/entwicklung/**, tests/entwicklertisch_bundle.test.ts, tests/layout/entwicklertisch*.hooks.spec.ts |
| SPEC | Regelspiegel und Website-Abgleich | docs/GAME_SPEC.md, scripts/website_abgleich/**, tests/spec_documentation.test.ts |
| BUILD | Lokale Umgebung, Build und Gates | package.json, package-lock.json, vite.config.ts, playwright.config.ts, tsconfig*.json, eslint.config.js, .gitignore, tests/lokale_umgebung.test.ts |
| PRUEF | Prüfwerkzeuge: Regelcheck, Architekturtest, Geräteklassen, Bildschirmfotos, Anleitungen für die Abnahme | scripts/check_regeln*, scripts/pruefung/**, tests/architektur*.ts, tests/check_regeln*.ts, tests/claude_ordner.test.ts, tests/probebaum.ts, tests/pruefwerkzeuge.test.ts, docs/abnahme/PRUEFER_ANLEITUNG.md, docs/abnahme/UMSETZER_ANLEITUNG.md, docs/abnahme/VORLAGE.md, docs/abnahme/probe/** |
