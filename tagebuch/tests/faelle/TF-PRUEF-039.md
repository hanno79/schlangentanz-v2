---
id: TF-PRUEF-039
titel: Eine nicht registrierte Strategie erreicht App-Code nur auf Wegen, die die Importgrenze meldet oder die U5 als Grenze nennt.
art: manuell
regression: nein
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
aenderung: task/P0.3d-ki-grenze (PR #55)
---

## Worum es geht

Die Importgrenze soll verhindern, dass eine Fabrik, die nicht in der Registry steht, bei der App oder einem Skript ankommt. TF-PRUEF-038 prüft die Umwege, die der Test selbst kennt. Hier werden Umwege versucht, die er nicht kennt: eine Brückendatei mit grosser Endung, ein Lader unter `public/` und ein Vite-Plugin.

## Bestanden, wenn

Für jede Probe gilt eines von beiden: `npx vitest run tests/architektur_ki_importgrenze.test.ts` endet mit Exit 1 und nennt eine Datei der Probe, oder U5 im Umsetzungsplan nennt genau diesen Weg unter den bekannten Grenzen.

## Fehlgeschlagen, wenn

Der Test endet mit Exit 0, „59 passed“, obwohl die Probe die Fabrik `vielleichtKi` lädt und aufruft (sichtbar als `Zufalls-KI` in der Ausgabe von Node oder im Browser), und U5 nennt den Weg nicht.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Repo-Stand ab `task/P0.3d-ki-grenze`, `npm ci` gelaufen |
| Ausgangslage prüfen | `git status` leer, Port 5197 frei |

## Testdaten

Fabrik in `src/ki/strategien/zz_geheim.ts`, nicht in der Registry: `export function vielleichtKi(zufall: () => number): Ki | undefined { return erstelleZufallsKi(zufall) }` mit den Importen `import type { Ki } from './strategie'` und `import { erstelleZufallsKi } from './zufallsKi'`.

Probe B01: `src/ui/zz_b01_bruecke.JS` mit `export { vielleichtKi } from '../ki/strategien/zz_geheim.ts'`, `src/zz_b01_module.d.ts` mit `declare module '*.JS' { export const vielleichtKi: (zufall: () => number) => import('./ki/strategien/strategie').Ki | undefined }` und `src/ui/zz_b01_nutzer.ts` mit `import { vielleichtKi } from './zz_b01_bruecke.JS'` und `console.log('zz-b01', vielleichtKi(() => 0.5)!.name)`.

Probe B02: `public/zz_b02_lader.js` mit `import { vielleichtKi } from '/src/ki/strategien/zz_geheim.ts'` und `console.log('zz-b02', vielleichtKi(() => 0.5).name)`, in `index.html` vor `</body>` die Zeile `<script type="module" src="/zz_b02_lader.js"></script>`.

Probe B07: in `vite.config.ts` ein Plugin `{ name: 'zz-b07', resolveId(id) { if (id === 'virtual:zz-ki') return join(process.cwd(), 'src', 'ki', 'strategien', 'zz_geheim.ts') } }` neben `react()`, `src/zz_b07.d.ts` mit `declare module 'virtual:zz-ki' { … }` und `src/ui/zz_b07.ts` mit `import { vielleichtKi } from 'virtual:zz-ki'`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Projektordner | Fabrik und Dateien der Probe B01 anlegen | Testdaten B01 | `git status` zeigt vier neue Dateien |
| 2 | Terminal | Importgrenze prüfen | `npx vitest run tests/architektur_ki_importgrenze.test.ts` | Exit 1 mit Meldung zu `zz_b01` erwartet |
| 3 | Terminal | Probe bündeln und ausführen | `npx vite build --ssr src/ui/zz_b01_nutzer.ts --outDir <temp>/b01` und `node <temp>/b01/zz_b01_nutzer.js` | Ausgabe `zz-b01 Zufalls-KI` zeigt, dass die Fabrik geladen wurde |
| 4 | Projektordner | Dateien von B01 löschen, Dateien von B02 anlegen | Testdaten B02 | `git status` zeigt `index.html` geändert |
| 5 | Terminal | Importgrenze prüfen | wie Schritt 2 | Exit 1 mit Meldung zu `index.html` oder `zz_b02` erwartet |
| 6 | Terminal und Browser | Entwicklungsserver starten, Startseite öffnen, Konsole lesen | `npx vite --port 5197`, dann `http://localhost:5197/` | Konsole zeigt `zz-b02 Zufalls-KI`, wenn die Fabrik geladen wurde |
| 7 | Projektordner | Server beenden, B02 zurücksetzen, Dateien von B07 anlegen | Testdaten B07 | `git status` zeigt `vite.config.ts` geändert |
| 8 | Terminal | Importgrenze prüfen und Probe bündeln | wie Schritte 2 und 3 mit `src/ui/zz_b07.ts` | Exit 1 erwartet; sonst gibt Node `Zufalls-KI` aus |
| 9 | `docs/UMSETZUNGSPLAN.md`, Zeile U5 | Grenze (3) lesen | – | Für jede Probe, die in Schritt 2, 5 oder 8 mit Exit 0 durchging, muss der Weg dort genannt sein |
| 10 | Projektordner | alles zurücksetzen | `git checkout -- index.html vite.config.ts`, Probedateien löschen | `git status` leer |

## Technische Prüfung

Ursache, falls B01 durchgeht: `laedt` in `tests/architektur_ki_importgrenze.ts` vergleicht die Endung mit `CODE_ENDUNGEN` nur in Kleinbuchstaben. Falls B02 durchgeht: `public/` liegt nicht in `BEREICHE`, und `/zz_b02_lader.js` wird nur gegen die Wurzel aufgelöst.

## Nicht abgedeckte Grenzfälle

Laden über `eval`, `new Function`, einen umbenannten Lader mit berechnetem Pfad und Vite-Aliasse ausserhalb der tsconfig sind nicht Teil dieses Testfalls, weil U5 sie als Grenze nennt. Skripte in Ordnern ausserhalb von `src/`, `scripts/` und dem Wurzelordner fehlen ebenfalls, weil U5 den gemessenen Bereich ausdrücklich nennt. `new URL('ki/strategien/…', import.meta.url)` ohne `./` meldet die Prüfung nicht, ohne eine Brücke lässt sich damit aber keine Fabrik aufrufen; das steht im Prüfprotokoll als Hinweis.
