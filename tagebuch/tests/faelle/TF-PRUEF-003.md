---
id: TF-PRUEF-003
titel: Der Architekturtest schlägt fehl, wenn eine Datei unter src/engine react importiert oder Math.random aufruft.
art: beides
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
skript: tests/architektur.test.ts
aenderung: task/P0.3-pruefwerkzeuge (PR #26)
---

## Worum es geht

Die Engine muss rein bleiben (U4): kein React, kein DOM, kein Zufall ausser als Parameter. Der Architekturtest in `npm test` hält das fest.

## Bestanden, wenn

Mit einer neuen Datei `src/engine/pruefer_u4.ts`, die `import { useState } from 'react'` und `Math.random()` enthält, endet `npx vitest run tests/architektur.test.ts` mit Exit 1, und die Meldung nennt `pruefer_u4.ts:1 importiert „react“` und `pruefer_u4.ts:5 nutzt Math.random`. Ohne die Datei: Exit 0, 22 Tests grün.

## Fehlgeschlagen, wenn

Der Lauf mit der Probedatei endet mit 0 oder nennt eine der beiden Zeilen nicht.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Arbeitskopie auf dem zu prüfenden Commit, nach `npm ci` |

## Testdaten

`src/engine/pruefer_u4.ts`: Zeile 1 `import { useState } from 'react'`, dazu `export function prueferWurf() { return Math.floor(Math.random() * 6) + 1 }` in Zeile 5.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Editor | Probedatei anlegen | Inhalt aus „Testdaten“ | |
| 2 | Git Bash im Repo | Test ausführen | `npx vitest run tests/architektur.test.ts; echo $?` | Exit 1, Test „U4: 18 Dateien unter src/engine …“ rot, beide Zeilen genannt |
| 3 | dieselbe Konsole | Datei löschen, erneut ausführen | `rm src/engine/pruefer_u4.ts` | Exit 0, „U4: 17 Dateien …“ grün |

## Nicht abgedeckte Grenzfälle

Umgehungen werden nicht erkannt: `const { random } = Math; random()`, `Math['random']()`, `globalThis.Math.random()` und `import('react' + '')` (geprüft im Protokoll P0.3, Grenzfall 4). Sie stehen nicht im Kriterium; ein Prüfer sieht sie am Code.
