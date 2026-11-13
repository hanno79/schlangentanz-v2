---
id: TF-APP-001
titel: / zeigt bis O2 einen schlichten Platzhalter ohne Bedienelemente, im Produktions- und im Testhook-Build.
art: beides
regression: ja
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
skript: tests/layout/platzhalter.spec.ts
aenderung: task/P0.4-entwicklertisch (PR #27)
---

## Worum es geht

Mit P0.4 ist die alte Oberfläche weg. Bis O2 (App-Rahmen und Lobby) soll die Startseite nur sagen, dass das Spiel neu gebaut wird, und nichts zum Bedienen anbieten.

## Bestanden, wenn

`http://localhost:4173/` und `http://localhost:4174/` zeigen die Überschrift „Schlangentanz“ und den Satz „Das Spiel wird gerade neu gebaut. Hier gibt es bald wieder etwas zu spielen.“, zentriert, ohne Knopf, ohne Konsolenfehler, in allen drei Geräteklassen ohne waagrechtes Scrollen.

## Fehlgeschlagen, wenn

Ein anderer Inhalt erscheint (alte Lobby, Spielbrett, Entwicklertisch), ein Knopf ist da, Text ist abgeschnitten oder die Konsole meldet Fehler.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Produktionsbuild auf 4173 (`npm run build`, `npm run preview -- --port 4173 --strictPort`), Testhook-Build auf 4174 |

## Testdaten

keine

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser 1280×900 | Adresse öffnen | `http://localhost:4173/` | Überschrift und Satz, kein Knopf |
| 2 | Browser 390×844 Touch | Adresse öffnen | `http://localhost:4173/` | Satz bricht um, nichts abgeschnitten |
| 3 | Browser | Adresse öffnen | `http://localhost:4174/` | derselbe Platzhalter |

## Nicht abgedeckte Grenzfälle

`/dev` im Produktionsbuild zeigt ebenfalls den Platzhalter: TF-DEV-003.
