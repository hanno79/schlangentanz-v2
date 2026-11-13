---
id: TF-DEV-003
titel: Im Produktionsbuild ist /dev nicht erreichbar, und kein Code des Entwicklertischs steht im Bundle.
art: beides
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
skript: tests/entwicklertisch_bundle.test.ts
aenderung: task/P0.4-entwicklertisch (PR #27)
---

## Worum es geht

Der Entwicklertisch zeigt alle Hände offen und ist eine Test-Hintertür. In der ausgelieferten App darf er weder erreichbar sein noch im ausgelieferten JavaScript stehen (Plan P0.4, Kriterium 3).

## Bestanden, wenn

`npm run build` erzeugt nur `index-*.js`, `index-*.css` und `prod-*.js`; eine Suche in `dist/` nach `ntwicklertisch`, `Festgefahren`, `kaputt-doppelte-karte`, `Phasenschritte`, `Invariante`, `szenario`, `/dev` und `0x6d2b79f5` findet nichts. `http://localhost:4173/dev?seed=1&spieler=2` zeigt nur den Platzhalter „Schlangentanz – Das Spiel wird gerade neu gebaut …“ und lädt nur `index-*.js` und `index-*.css`.

## Fehlgeschlagen, wenn

Eine Datei in `dist/` enthält einen der Suchbegriffe, ein Chunk `Entwicklertisch-*.js` entsteht, oder `/dev` auf Port 4173 zeigt den Tisch oder lädt einen weiteren Chunk.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | `npm run build`, dann `npm run preview -- --port 4173 --strictPort` |

## Testdaten

Suchbegriffe wie unter „Bestanden, wenn“.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Git Bash im Repo | bauen | `npm run build` | Exit 0, kein `Entwicklertisch-*` in der Liste |
| 2 | dieselbe Konsole | Bundle durchsuchen | `grep -l -e ntwicklertisch -e Festgefahren -e /dev dist/index.html dist/assets/*` | keine Ausgabe |
| 3 | Browser | Adresse öffnen | `http://localhost:4173/dev?seed=1&spieler=2` | nur Platzhalter, Netzwerk: `index-*.js`, `index-*.css` |
| 4 | Browser | Adresse öffnen | `http://localhost:4173/dev/szenarien` | nur Platzhalter |

## Nicht abgedeckte Grenzfälle

Der Dev-Server (`npm run dev`) zeigt den Tisch absichtlich; er wird nie ausgeliefert. Die Vercel-Vorschau mit `VITE_TEST_HOOKS=1` zeigt ihn ebenfalls absichtlich; nicht geprüft, weil kein Deployment Teil der Abnahme ist.
