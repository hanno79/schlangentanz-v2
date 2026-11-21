---
id: TF-PRUEF-038
titel: Ausserhalb von src/ki/strategien importiert kein Code eine Strategie an der Registry vorbei, und jede Umgehung der Importgrenze wird gemeldet.
art: automatisch
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
skript: tests/architektur_ki_importgrenze.test.ts
aenderung: task/P0.3d-ki-grenze (PR #55)
---

## Worum es geht

Der Isolationstest prüft nur die Fabriken, die in der Registry `src/ki/strategien/index.ts` stehen. Damit eine andere Fabrik gar nicht erst bei der App, dem Entwicklertisch oder einem Skript ankommt, darf Code ausserhalb der Strategien von dort nur die Registry und Typen aus `strategie.ts` holen. Geprüft wird, dass das im Repo gilt und dass die Prüfung jeden bekannten Umweg erkennt.

## Bestanden, wenn

`npx vitest run tests/architektur_ki_importgrenze.test.ts` endet mit Exit 0 und 59 grünen Tests: kein Verstoss im Repo, jede der 27 Gegenproben und der 26 Umwege aus dem Codex-Review mit mindestens einer Meldung, keine Meldung in den erlaubten Dateien und beim Glob mit Ausschlüssen, und bei einer `strategie.ts` mit Werten genau fünf gemeldete Dateien.

## Fehlgeschlagen, wenn

Der Test über das Repo meldet eine Datei, etwa `src/entwicklung/Tisch.tsx:8 importiert „../ki/strategien/zufallsKi“`, eine Gegenprobe bleibt ohne Meldung, oder eine erlaubte Datei wird gemeldet.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Repo-Stand ab `task/P0.3d-ki-grenze`, `npm ci` gelaufen |
| Ausgangslage | `git status` leer |

## Testdaten

Die Gegenproben stehen in der Testdatei selbst und werden in einem Probe-Baum im Temp-Ordner angelegt: statischer Import, `import()`, Weiterexport über eine Hilfsdatei, relative Umwege über `./` und `../`, Endung `.ts`, `/src/…`, andere Gross- und Kleinschreibung, `?raw`, `require`, `export *`, `import type`, `typeof import()`, zwei `import.meta.glob`, `import.meta.resolve`, `new URL(…, import.meta.url)`, berechnete Namen bei `import()` und `require`, ein Lader aus `createRequire`, eine Hilfsdatei unter `strategien/`, Ketten über eine Testdatei und über `tests/`, Importe aus dem Rahmen, aus `__tests__/`, aus `scripts/` und aus dem Wurzelordner. Dazu die Umwege aus drei Codex-Runden in einem eigenen Probe-Baum: Globs mit `base` (auch maskiert, doppelt, berechnet) und auf Testdateien, `index.tsx` und `strategie.tsx`, `#`-Importe und `exports` in `package.json`, ein Paket oder eine `.js`-Datei hinter einer `.d.ts`, `<script>` und `<link>` in HTML mit Zeichenreferenzen, `file://`, `/@fs/` mit und ohne Prozentkodierung und Dateien unter `__snapshots__` und `dist`.

## Technische Prüfung

`npx vitest run tests/architektur_ki_importgrenze.test.ts --reporter=verbose` meldet 59 bestandene Tests, Exit 0. Gegenprobe am echten Repo: In `src/entwicklung/Tisch.tsx` die Importzeile auf `import { erstelleZufallsKi } from '../ki/strategien/zufallsKi'` zurückstellen; dann wird der Repo-Test rot mit der Meldung zu `Tisch.tsx:8`.

## Nicht abgedeckte Grenzfälle

Laden über `eval`, `new Function` oder einen umbenannten Lader mit berechnetem Pfad und Vite-Aliasse ausserhalb der tsconfig erkennt die Prüfung nicht; das steht als Grenze (3) in U5, Gegenmittel ist das Review. Verknüpfungen im Dateisystem sind nicht als Gegenprobe angelegt, weil Windows dafür Rechte verlangt; die Prüfung löst Pfade über den echten Pfad auf. Eine leere Registry oder ein fehlender Ordner `src/ki/strategien` ergibt keine Meldung; dass die Zufalls-KI in der Registry steht, prüft der Isolationstest.
