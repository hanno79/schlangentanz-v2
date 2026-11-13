---
eingerichtet: 2026-11-12
---

## Bereiche

| ID | Bereich | Pfade |
|---|---|---|
| ENGINE | Spiel-Engine: Regeln, Zugablauf, Wertung, Speicherformat | src/engine/** |
| KI | KI-Gegner | src/ki/** |
| BRETT | Spieltisch und Kartenaktionen | src/aktionsziel/**, src/reaktionen.ts, src/aktionsLabel.ts, src/spielLabelHelpers.ts, src/kartenTexte.ts, src/kartenfarben.ts, src/ui/spiel/**, src/ui/tisch/**, tests/layout/tisch.spec.ts |
| APP | App-Rahmen, Lobby, Fehlerdienst | src/App*, src/main.tsx, src/index.css, src/components/**, src/fehlerdienst.ts, src/spielstand*.ts, src/assets/**, public/**, index.html, vercel.json, src/ui/lobby/**, src/ui/regeln/**, tests/layout/lobby.spec.ts, tests/layout/navigation.spec.ts, tests/vercel_rewrites.test.ts |
| DEV | Entwicklertisch unter /dev (nur Testhook-Build) | src/entwicklung/**, tests/entwicklertisch_bundle.test.ts, tests/layout/entwicklertisch*.hooks.spec.ts |
| SPEC | Regelspiegel, Regelfragen an den Autor und Website-Abgleich | docs/GAME_SPEC.md, docs/REGELFRAGEN.md, scripts/website_abgleich/**, tests/spec_documentation.test.ts, tests/regelfragen*.ts |
| BUILD | Lokale Umgebung, Build und Gates | package.json, package-lock.json, vite.config.ts, playwright.config.ts, tsconfig*.json, eslint.config.js, .gitignore, .gitattributes, tests/lokale_umgebung.test.ts, AGENTS.md |
| DESIGN | Gestaltung: Kartenbilder, Kartenkomponente, Tokens, Schriften, Entwurfsseiten | src/ui/karten/**, src/ui/tokens.css, public/karten/**, public/schrift/**, public/favicon.ico, public/apple-touch-icon.png, src/entwicklung/entwurf/**, tests/layout/entwurf.hooks.spec.ts, scripts/kartenbilder_zuschneiden.py, DESIGN.md |
| PRUEF | Prüfwerkzeuge: Regelcheck, Architekturtest, Geräteklassen, Bildschirmfotos, Anleitungen für die Abnahme | scripts/check_regeln*, scripts/pruefung/**, tests/architektur*.ts, tests/check_regeln*.ts, tests/claude_ordner.test.ts, tests/probebaum.ts, tests/pruefwerkzeuge.test.ts, tests/layout/messung.ts, tests/layout/waechter.ts, tests/layout/oeffnen.ts, docs/abnahme/PRUEFER_ANLEITUNG.md, docs/abnahme/UMSETZER_ANLEITUNG.md, docs/abnahme/VORLAGE.md, docs/abnahme/probe/**, docs/WORKFLOW.md, tests/geraeteklassen_ausnahmen.test.ts, tests/layout/ausnahmen.ts, tests/layout/geraeteklassen_ausnahmen.json, tests/layout/geraeteklasse.spec.ts, tests/layout/waechter_labels.spec.ts, docs/UMSETZUNGSPLAN.md |
