---
id: TF-PRUEF-023
titel: Liegt die Ausnahmeliste schon auf der Basis, meldet die Wachstumsprüfung jeden zusätzlichen Eintrag, ein entfernter Eintrag geht durch.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
aenderung: task/P0.3c-fuenf-geraeteklassen (PR #32)
grenzfall_von: TF-PRUEF-020
---

## Worum es geht

Die Liste `tests/layout/geraeteklassen_ausnahmen.json` darf nur kleiner werden. Der Test dafür vergleicht sie mit der Fassung auf `origin/neuaufbau`. Dort liegt sie vor dem Merge von P0.3c noch nicht, und der Test endet ohne Vergleich. Dieser Fall nimmt deshalb den aktuellen Commit als Basis und zeigt so, dass der Vergleich nach dem Merge greift.

## Bestanden, wenn

Mit unveränderter Liste meldet Schritt 2 „neu 0“ und Exit 0. Mit einem zusätzlichen Eintrag meldet Schritt 4 „neu 1“, nennt den Eintrag und endet mit Exit 1. Fehlt ein Eintrag, meldet Schritt 6 „neu 0“ und Exit 0.

## Fehlgeschlagen, wenn

Schritt 4 meldet „neu 0“ oder endet mit Exit 0, oder Schritt 6 meldet einen neuen Eintrag.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Arbeitskopie auf dem zu prüfenden Commit, die Liste ist dort committet, `npm ci` gelaufen |

## Testdaten

Zusätzlicher Eintrag am Ende von `ausnahmen` (richtiger Titel eines vorhandenen Vertrags, aber Klasse `tablet-hochkant`):
`{"datei": "tests/layout/lobby.spec.ts", "vertrag": "O2: Lobby mit laufender Partie › kein Bedienelement liegt außerhalb des Bildes", "klasse": "tablet-hochkant", "befund": "Probe"}`

Prüfskript `wachstum-probe.mjs` im Repo-Ordner (danach löschen):

```js
import { readFileSync } from 'node:fs'
import { abgleich, basisAusnahmen } from './scripts/pruefung/ausnahmen.mjs'
const LISTE = 'tests/layout/geraeteklassen_ausnahmen.json'
const s = ({ datei, vertrag, klasse }) => `${klasse} | ${datei} | ${vertrag}`
const frueher = basisAusnahmen(process.cwd(), 'HEAD', LISTE).daten.ausnahmen.map(s)
const jetzt = JSON.parse(readFileSync(LISTE, 'utf8')).ausnahmen.map(s)
const { neu } = abgleich(jetzt, frueher)
console.log(`früher ${frueher.length}, jetzt ${jetzt.length}, neu ${neu.length}`, neu.map((i) => jetzt[i]))
process.exit(neu.length === 0 ? 0 : 1)
```

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Editor | Prüfskript aus „Testdaten“ als `wachstum-probe.mjs` im Repo-Ordner anlegen | | |
| 2 | Git Bash im Repo | Vergleich ohne Änderung | `node wachstum-probe.mjs; echo $?` | „neu 0“, Exit 0 |
| 3 | Editor | Eintrag aus „Testdaten“ in die Liste einfügen | Testdaten | gültiges JSON |
| 4 | Git Bash im Repo | Vergleich mit dem Zusatz | `node wachstum-probe.mjs; echo $?` | „neu 1“, der Eintrag mit `tablet-hochkant`, Exit 1 |
| 5 | Git Bash im Repo, dann Editor | Liste zurücksetzen und den ersten Eintrag löschen | `git checkout -- tests/layout/geraeteklassen_ausnahmen.json` | |
| 6 | Git Bash im Repo | Vergleich mit einem Eintrag weniger | `node wachstum-probe.mjs; echo $?` | „neu 0“, Exit 0 |
| 7 | Git Bash im Repo | aufräumen | `git checkout -- tests/layout/geraeteklassen_ausnahmen.json`, `rm wachstum-probe.mjs` | `git status` leer |
