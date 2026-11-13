---
id: TF-SPEC-007
titel: npm run test:website-netz lädt die echte Spielanleitung, öffnet alle Karten-Dialoge und baut Teil A bis A11.
art: automatisch
regression: ja
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
skript: scripts/website_abgleich/netztest.cjs
aenderung: task/P0.5c-website-abgleich (PR #38)
---

## Worum es geht

Der echte Abruf der Website hat einen eigenen Befehl ausserhalb von `npm test`. Er zeigt, ob Laden und Umwandlung bei der heutigen Website noch greifen, gleich ob Teil A inhaltlich stimmt.

## Bestanden, wenn

`npm run test:website-netz` endet mit Exit 0 und meldet mindestens 20 Karten-Dialoge, mehr als 100 geprüfte Zeilen und ein Bundle `index-….js`.

## Fehlgeschlagen, wenn

Der Befehl endet mit Exit 1, etwa weil die Seite leer bleibt, Anfang oder Ende der Anleitung nicht erkannt wird oder Teil A sich nicht bis A11 bauen lässt.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Arbeitskopie, Netzzugang zu schlangentanz.ch, Playwright-Chromium installiert |

## Testdaten

Live-Seite `https://schlangentanz.ch/rules`.

## Technische Prüfung

Im Repo `npm run test:website-netz; echo $?`. Erwartet eine Zeile „Netztest bestanden: … Dialoge, … Zeilen, Bundle index-….js.“ und Exit 0.

## Nicht abgedeckte Grenzfälle

Website nicht erreichbar: TF-SPEC-010.
