---
id: TF-SPEC-008
titel: Wird der Konverter oder der QUIC-Schalter verfälscht, schlagen die Offline-Tests fehl, und eine neue Zeile der Website meldet der Abgleich als fehlend.
art: manuell
regression: nein
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
aenderung: task/P0.5c-website-abgleich (PR #38)
grenzfall_von: TF-SPEC-006
---

## Worum es geht

Die Tests sollen die Umwandlung und den Startschalter festhalten. Verfälscht man den Code oder ergänzt die Probe der Website um eine Zeile, muss das auffallen.

## Bestanden, wenn

Jede Verfälschung unten macht `npx vitest run tests/website_abgleich.test.ts` rot (Exit 1), und eine zusätzliche Zeile in der Probe erscheint in der Liste `fehlend` der Abdeckungsprüfung.

## Fehlgeschlagen, wenn

Eine Verfälschung bleibt grün, oder die zusätzliche Zeile wird nicht gemeldet.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Arbeitskopie auf dem zu prüfenden Commit, `git status --short` leer |

## Testdaten

Verfälschung 1: in `scripts/website_abgleich/konverter.cjs` `'01-bluesnake': 'Blau'` zu `'01-bluesnake': 'Rot'`. Verfälschung 2: in `scripts/website_abgleich/lade_website.cjs` `args: ['--disable-quic']` zu `args: []`. Zusätzliche Zeile: in einer Kopie der Probe nach `<li>Nur sichtbare Punkte zählen.</li>` ein `<li>Neue Regel nur auf der Website.</li>`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | `konverter.cjs` | Verfälschung 1 einbauen und den Test ausführen | `npx vitest run tests/website_abgleich.test.ts` | Exit 1, rot ist „liesSeite liefert Markdown der Seite …“ |
| 2 | Terminal | Datei zurücksetzen | `git checkout -- scripts/website_abgleich/konverter.cjs` | `git status --short` leer |
| 3 | `lade_website.cjs` | Verfälschung 2 einbauen und den Test ausführen | `npx vitest run tests/website_abgleich.test.ts` | Exit 1, rot sind die zwei Tests zu den Startoptionen mit „expected [] to include '--disable-quic'“ |
| 4 | Terminal | Datei zurücksetzen | `git checkout -- scripts/website_abgleich/lade_website.cjs` | `git status --short` leer |
| 5 | Kleines Node-Skript ausserhalb des Repos | Original-Probe und Probe mit zusätzlicher Zeile über `liesSeite` lesen (alle Anfragen abgebrochen), dann `pruefeAbdeckung(probeMitZeile, MarkdownDerOriginalprobe)` | | `fehlend` ist genau `["Neue Regel nur auf der Website."]`; gegen die Original-Probe ist `fehlend` leer |
