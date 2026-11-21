---
id: TF-DEV-040
titel: Am Entwicklertisch trägt nach Spielende keine Spielerkarte die Marke „am Zug“, solange die Partie läuft genau eine.
art: beides
regression: ja
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
skript: src/entwicklung/ZustandsAnsicht.test.tsx
aenderung: task/O8-spielende (PR #77)
---

## Worum es geht

Der Entwicklertisch zeigt bei jedem Spieler, ob er am Zug ist. Nach Spielende ist niemand mehr dran; die Lage sagt das schon, die Spielerkarten müssen dazu passen.

## Bestanden, wenn

Unter `/dev?szenario=schlussrunde-ohne-dich` trägt zu Beginn genau KI-Gegner 1 die Marke „am Zug“. Nach sechs Klicks auf „KI-Schritt“ steht in der Lage „Partiephase Beendet“ und „Am Zug: niemand, die Partie ist beendet (A10)“, „KI-Schritt“ ist gesperrt, und keine der vier Spielerkarten trägt die Marke. Unter `/dev?szenario=wertung-beispiele` trägt ebenfalls keine Karte die Marke.

## Fehlgeschlagen, wenn

Nach Spielende trägt eine Spielerkarte „am Zug“ oder ist hervorgehoben, oder in der laufenden Schlussrunde trägt keine oder mehr als eine die Marke.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build, eingebauter Browser 1280 × 900 mit Maus, Stand ab Commit 0b0d639 |

## Testdaten

Adressen `/dev?szenario=schlussrunde-ohne-dich` und `/dev?szenario=wertung-beispiele`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser | Adresse öffnen | `/dev?szenario=schlussrunde-ohne-dich` | Bei KI-Gegner 1 die Marke „am Zug“, bei den anderen nicht |
| 2 | Entwicklertisch | sechsmal „KI-Schritt“ anklicken | | Partiephase „Beendet“, „KI-Schritt“ gesperrt |
| 3 | Abschnitt „Spieler“ | Spielerkarten lesen | | Keine Karte mit „am Zug“ |
| 4 | Browser | Adresse öffnen | `/dev?szenario=wertung-beispiele` | Keine Karte mit „am Zug“, Lage „niemand“ |

## Nicht abgedeckte Grenzfälle

Keine: Der Entwicklertisch kennt nur laufend und beendet; beide Lagen stehen in den Schritten.
