---
id: TF-BRETT-003
titel: Im Seitenquelltext des Spieltischs steht weder Name noch Id einer fremden Handkarte oder einer fremden geheimen Aufgabe.
art: beides
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: ja
skript: src/ui/tisch/Tisch.geheim.test.tsx
aenderung: task/O4-spieltisch (PR #34)
---

## Worum es geht

Die Handkarten der Gegner und ihre geheimen Aufgaben dürfen weder auf dem Schirm noch im Seitenquelltext stehen. Deshalb wird das ganze HTML nach ihren Ids und Namen abgesucht.

## Bestanden, wenn

In `page.content()` steht keine Id einer Karte aus einer fremden Hand und keine Id, kein Name („Aufgabe <Name>“) und keine Bedingung einer fremden geheimen Aufgabe. Geprüft in den fünf Szenarien, in 30 Zufallszuständen (Saat 1 bis 30) und in 20 Partien, die über die Lobby angelegt sind.

## Fehlgeschlagen, wenn

Mindestens eine solche Id oder ein solcher Name steht im HTML.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Produktionsbuild, Playwright |
| Ausgangslage | Spielstand im Local Storage (Szenario, Zufallszustand) oder leere Lobby |

## Testdaten

Szenario `geheimeHaende`: Gegner halten nur Verdoppler, Farbenschutz und Schlangengruben, die sonst nirgends offen liegen. Zufallszustände aus `src/engine/testing/zufallszustand.ts`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser | Spielstand legen, `/spiel` öffnen | | Tisch erscheint, Gegner zeigen „5 Handkarten“ |
| 2 | Playwright | `page.content()` lesen und in Wörter zerlegen | | |
| 3 | Playwright | fremde Hand-Ids und Aufgaben gegen die Wörter prüfen | | keine Treffer |

## Zurücksetzen

Browserkontext schliessen.

## Nicht abgedeckte Grenzfälle

Jeder Schritt einer laufenden Partie ist erst prüfbar, wenn die Engine Aktionen aufzählt (ab E2); bis dahin prüft der Komponententest nur den Startzustand dieser Partien.
