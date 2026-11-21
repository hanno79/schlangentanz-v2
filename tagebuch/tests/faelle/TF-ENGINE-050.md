---
id: TF-ENGINE-050
titel: Das Protokoll der Zweierpartie im Golden Master folgt Zug für Zug Teil A, und seine Endwertung 10 zu 23 lässt sich von Hand nachrechnen.
art: beides
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
skript: src/engine/__tests__/golden_master.test.ts
aenderung: task/E11-abnahme-basis (PR #72)
---

## Worum es geht

Der Golden Master friert drei Zufallspartien der Basis-Engine ein. Bevor er als Massstab gilt, liest ein Mensch das Protokoll der Partie zu zweit gegen Teil A: Aufbau, Nachziehen, jede Karte und ihre Wirkung, Abwehr, Verdoppler, Grube, Schlussrunde und Endwertung. Danach sichert der Test, dass jede spätere Änderung, die den Verlauf verschiebt, auffällt.

## Bestanden, wenn

Beim Lesen findet sich keine Stelle, an der der Verlauf von Teil A, B oder D abweicht. Die Endwertung ergibt von Hand Spieler 1 = 10 (Blau×3 = 3, Blau×5 mit Fusion und Regenbogenschlange = 7, Kette 3) und KI-Gegner 1 = 23 (Rot×4 mit Fusion = 7, Blau×5 mit zwei Regenbogenschlangen = 3, Braun×4 = 8, Kette 4 mit Bonus 5). `npx vitest run src/engine/__tests__/golden_master.test.ts` endet mit 0, und die Prüfung „eine Abwehr, ein zweiter Zug nach dem Verdoppler, Schlussrunde mit N−1 Zügen“ ist für alle drei Partien grün.

## Fehlgeschlagen, wenn

Eine Aktion im Protokoll widerspricht Teil A (etwa ein Nachziehen ausserhalb des eigenen Zuges, eine Sonderkarte ohne Ansage gegen einen Mitspieler, ein letzter Zug für den Auslöser), die Handrechnung ergibt andere Summen oder der Test endet nicht mit 0.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Repo auf dem geprüften Stand, `npm ci` gelaufen |

## Testdaten

`src/engine/__tests__/golden/partie-2-spieler-saat-5.txt` (923 Zeilen, 185 Schritte), Saat 5, 2 Spieler, ohne Erweiterung.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Datei `partie-2-spieler-saat-5.txt` | Aufbau lesen | – | je 5 Handkarten, 98 Karten im Nachziehstapel, Spieler 1 beginnt |
| 2 | dieselbe Datei | jeden Schritt gegen Teil A lesen | – | höchstens eine Farbkarte und eine Sonderkarte je Zug; wirkungslos abgelegt wird nur ohne mögliches Ziel oder ein Farbenschutz; nach Abwehr zieht der Abwehrende erst zu Beginn seines Zuges |
| 3 | dieselbe Datei, Schritte 10 bis 15, 47 bis 51, 77 bis 82, 155 bis 158 | Verdoppler lesen | – | danach „zweiter Zug nach dem Verdoppler“, vorher aufgefüllt |
| 4 | dieselbe Datei, Schritte 24 bis 26 und 150 bis 153 | Schlangengrube lesen | – | „setzt aus“; die Grube kommt auf den Ablagestapel dessen, der sie spielte |
| 5 | dieselbe Datei, Schritte 182 bis 185 | Schlussrunde lesen | – | KI-Gegner 1 zieht die letzte Karte; Spieler 1 hat einen letzten Zug ohne Nachziehen; danach „Die Partie ist beendet.“ |
| 6 | Abschnitt „Lage am Ende“ | Punkte von Hand rechnen | – | Spieler 1 = 10, KI-Gegner 1 = 23 wie unter „Endwertung (A11)“ |
| 7 | Konsole im Repo | Test ausführen | `npx vitest run src/engine/__tests__/golden_master.test.ts` | Exit 0, 7 Tests grün |

## Nicht abgedeckte Grenzfälle

Die Partien zu dritt und zu viert hat der Prüfer nur an Schlussrunde und Endwertung gelesen, nicht Zug für Zug; der Plan verlangt die Lektüre einer Partie zu zweit. Eine Partie mit Erweiterung friert erst X7 ein.
