---
id: TF-PRUEF-028
titel: Der Architekturtest meldet jeden Weg, auf dem KI-Code ausserhalb von sicht.ts den vollen Zustand liest, globale Objekte verändert oder Zufall und Zeit holt.
art: manuell
regression: nein
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
aenderung: task/P0.3d-ki-grenze (PR #55)
---

## Worum es geht

Seit P0.3d gilt KI-Code ausserhalb von `src/ki/sicht.ts` als nicht vertrauenswürdig. Der Architekturtest soll deshalb jeden Versuch melden, den vollen Zustand anders als unverändert weiterzureichen, ein globales Objekt wie `structuredClone` zu ersetzen oder Zufall und Zeit selbst zu holen. Der Test spielt einen Angreifer, der neue Umgehungen in eigene Dateien unter `src/ki` schreibt.

## Bestanden, wenn

Jede Angriffsdatei, die ohne Typfehler übersetzt und tatsächlich Verborgenes liest, ein globales Objekt verändert oder eine Zufalls- oder Zeitquelle nutzt, bekommt mindestens eine Meldung U4 oder U5. Die vier echten KI-Dateien bleiben bei 0 Meldungen.

## Fehlgeschlagen, wenn

Eine solche Angriffsdatei bleibt ohne Meldung, etwa `const w = self; w.structuredClone = f`, oder eine echte KI-Datei bekommt eine Meldung.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Repo-Stand ab `task/P0.3d-ki-grenze`, `npm ci` gelaufen |
| Ausgangslage | `git status` leer |

## Testdaten

Je Umgehung eine Datei `src/ki/zz-angriff-<name>.ts`, die eine Funktion `a` exportiert, dazu für den Seitenkanal ein Helfer unter `src/ki/__tests__/`. Mindestens zehn Wege zum Zustand (Getter, `Object.getOwnPropertyDescriptor`, `Array.from`, Zerlegen mit Rest, Unionstyp, `Promise.resolve`, Closure, `String`, `new Proxy`, Default-Parameter, Überladung), fünf zu globalen Objekten (`self`, `top`, `frames.self`, `setTimeout` mit Text, Helfer in einem Testordner) und drei zu Zufall und Zeit (`Intl.DateTimeFormat().format()`, `Event.timeStamp`, `URL.createObjectURL`).

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Konsole im Repo | Angriffsdateien anlegen | Skript des Prüfers, etwa `node <scratchpad>/angriffe.mjs` | Dateien liegen unter `src/ki/` |
| 2 | Konsole im Repo | Typprüfung | `npx tsc -p tsconfig.app.json --noEmit` | ausser unbenutzten Importen keine Typfehler in den Angriffsdateien |
| 3 | Konsole im Repo | Architekturtest laufen lassen | `npx vitest run tests/architektur.test.ts` | der Test „U5: … Dateien unter src/ki“ nennt jede Angriffsdatei mit mindestens einer Zeile |
| 4 | Konsole im Repo | prüfen, dass ein grün gebliebener Angriff wirklich wirkt | im Browser auf dem Entwicklertisch: `const w = self; w === globalThis` | `true`: der Angriff ersetzt das echte globale Objekt |

## Zurücksetzen

Angriffsdateien und Helfer löschen (`node <scratchpad>/angriffe.mjs --weg`), danach `git status` leer.

## Nicht abgedeckte Grenzfälle

Angriffe, die nur erlaubte Weitergaben nutzen (`sichtFuer(zustand, gegner)`, Simulation mit `anwendeAktion` und `ermittleAktionen`), kann eine Prüfung am Quelltext nicht erkennen; dafür ist Test K2.7 da. Dateien ausserhalb von `src/ki`, die KI-Code importiert, prüft dieser Testfall nur über den Seitenkanal mit.
