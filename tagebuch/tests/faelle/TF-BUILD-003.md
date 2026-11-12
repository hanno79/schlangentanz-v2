---
id: TF-BUILD-003
titel: Im Produktionsbuild wirkt /game?phase=spielende nicht, die App startet eine normale Partie.
art: manuell
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-12
veraendert_daten: nein
aenderung: task/P0.2-lokale-umgebung (PR #24)
grenzfall_von: TF-BUILD-002
---

## Worum es geht

Der Adress-Hook `?phase=` ist eine Test-Hintertür. In der ausgelieferten App darf er nichts bewirken. Geprüft wird, dass der normale Build ohne Testhook-Modus dieselbe Adresse ignoriert.

## Bestanden, wenn

Auf `http://localhost:4173/game?phase=spielende` steht oben „Phase Karten ausspielen“ und „Gespielt 0/2 Karten“, unten „Nachziehstapel 104 · Ablage 0 · offene Aufgaben 3“; die Hand zeigt fünf Karten. Im Bundle `dist/assets/index-*.js` steht die Schalterfunktion als `return!1`.

## Fehlgeschlagen, wenn

Die Siegerehrung mit „Finale Punktetafel“ erscheint, oder im Bundle steht die Schalterfunktion vor `function …(){if(typeof window` als `return!0`.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Repo-Arbeitskopie auf dem zu prüfenden Commit, Windows 11, nach `npm ci` |
| Ausgangslage prüfen | Port 4173 ist frei; in der Konsole ist keine Umgebungsvariable `VITE_TEST_HOOKS` gesetzt |

## Testdaten

Adresse `http://localhost:4173/game?phase=spielende`, Fenstergrösse 1280×900.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | PowerShell oder Git Bash im Repo | Befehl ausführen | `npm run build` | Exit-Code 0, Dateien unter `dist/` |
| 2 | zweite Konsole im Repo | Vorschau starten und laufen lassen | `npm run preview -- --port 4173 --strictPort` | Zeile „Local: http://localhost:4173/“ |
| 3 | Browser, Adresszeile | Adresse öffnen | `http://localhost:4173/game?phase=spielende` | „Phase Karten ausspielen“, „Nachziehstapel 104“, keine Siegerehrung |
| 4 | zweite Konsole | Vorschau beenden | Strg+C | Port 4173 ist wieder frei |

## Technische Prüfung

`grep -o 'function [A-Za-z]*(){return![01]}function [A-Za-z]*(){if(typeof window' dist/assets/index-*.js` liefert eine Zeile mit `return!1`; derselbe Befehl auf `dist-testhooks/assets/index-*.js` liefert `return!0`.
