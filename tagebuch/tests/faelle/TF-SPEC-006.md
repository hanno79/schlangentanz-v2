---
id: TF-SPEC-006
titel: Umwandlung und Abdeckungsprüfung des Website-Abgleichs laufen ohne Netz in npm test und sind grün.
art: automatisch
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
skript: tests/website_abgleich.test.ts
aenderung: task/P0.5c-website-abgleich (PR #38)
---

## Worum es geht

Der Website-Abgleich wandelt die Spielanleitung in Markdown um und prüft, ob jede Zeile in Teil A steht. Diese Verarbeitung soll ohne Internet prüfbar sein, damit `npm test` weder vom Netz noch von der Website abhängt.

## Bestanden, wenn

`npx vitest run tests/website_abgleich.test.ts` endet mit Exit 0 und meldet 9 bestandene Tests, auch wenn `HTTPS_PROXY` auf einen toten Proxy (`http://127.0.0.1:9`) zeigt.

## Fehlgeschlagen, wenn

Ein Test schlägt fehl, oder der Lauf braucht eine Verbindung ins Internet.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Arbeitskopie auf dem zu prüfenden Commit, `npm ci` gelaufen, Playwright-Chromium installiert |

## Testdaten

Probe der Spielanleitung `tests/website_abgleich/probe_regeln.html`.

## Technische Prüfung

Im Repo `npx vitest run tests/website_abgleich.test.ts; echo $?`, danach in Git Bash `HTTPS_PROXY=http://127.0.0.1:9 npx vitest run tests/website_abgleich.test.ts; echo $?`. Beide Male `Tests 9 passed (9)` und Exit 0.

## Nicht abgedeckte Grenzfälle

Gegenproben am Code: TF-SPEC-008. Echter Abruf: TF-SPEC-007.
