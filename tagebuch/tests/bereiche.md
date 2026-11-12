---
eingerichtet: 2026-11-12
---

## Bereiche

| ID | Bereich | Pfade |
|---|---|---|
| ENGINE | Spiel-Engine: Regeln, Zugablauf, Wertung, Speicherformat | src/engine/** |
| KI | KI-Gegner | src/kiZug*.ts |
| BRETT | Spieltisch und Kartenaktionen | src/spielbrett/**, src/hooks/**, src/aktionsziel/**, src/reaktionen.ts, src/phasenAktionen.ts, src/aktionsGruppen.ts, src/aktionsLabel.ts, src/spielLabelHelpers.ts, src/zugphaseLabels.ts, src/kartenTexte.ts, src/kartenfarben.ts, src/testPhaseHook.ts |
| APP | App-Rahmen, Lobby, Fehlerdienst | src/App*, src/main.tsx, src/index.css, src/components/**, src/fehlerdienst.ts, src/spielstand*.ts, src/assets/**, public/**, index.html |
| SPEC | Regelspiegel und Website-Abgleich | docs/GAME_SPEC.md, scripts/website_abgleich/**, tests/spec_documentation.test.ts |
