# Schlangentanz Game Spec

Status: **Draft template — not locked**

No real game implementation should begin until this document is filled and accepted.

## 1. Overview

TODO: Describe objective, player count, target platform, and expected session duration.

## 2. Entities

TODO: Define cards, tokens, board/positions if any, players, resources, effects, and persistent state.

> **Draft — Signoff ausstehend.** Die folgenden Karten-Regeln wurden aus dem Dart-Backlog (R4) übernommen und benötigen noch User-Signoff, bevor Implementierung beginnen darf.

### R4.1 Farbkarten-Übersicht

- Insgesamt 78 Farbkarten in 6 Farben.
- Blau: 15 Karten, 1 Punkt pro Karte.
- Rot: 15 Karten, 1 Punkt pro Karte.
- Gelb: 15 Karten, 1 Punkt pro Karte.
- Violett: 12 Karten, 2 Punkte pro Karte.
- Braun: 12 Karten, 2 Punkte pro Karte.
- Grün: 9 Karten, 3 Punkte pro Karte.
- Häufige Farben: 45 Karten (3 x 15), je 1 Punkt.
- Mittlere Farben: 24 Karten (2 x 12), je 2 Punkte.
- Seltene Farben: 9 Karten (1 x 9), je 3 Punkte.
- Farben müssen eindeutig unterscheidbar und barrierefrei darstellbar sein.

### R4.2/R4.4 Wertung und Spielmechanik

- Punkte zählen nur in gültigen Farbgruppen ab 3 Karten.
- Einzelne Karten und 2er-Kombinationen zählen 0 Punkte.
- Jede Karte in einer gültigen Gruppe zählt ihren Punktwert.
- Nach jedem Anlegen muss geprüft werden, ob neue Farbgruppen entstanden sind.
- Sonderkarten unterbrechen Farbgruppen korrekt.

## 3. Setup

> **Draft — Signoff ausstehend.** Die folgenden Regeln wurden aus dem Dart-Backlog (R1.1/R1.2/R1.3/R1.4) übernommen und benötigen noch User-Signoff, bevor Implementierung beginnen darf.

### R1.1/R1.2 Kartenstapel vorbereiten

- Alle Karten werden vor Spielbeginn nach Kartentyp sortiert.
- Haupt-/Nachziehstapel: 78 Farbkarten + 33 Sonderkarten = **Nachziehstapel enthält exakt 111 Karten**.
- Aufgabenkarten: 15 Stück gesamt, unterteilt in 8 offene Aufgabenkarten und 7 geheime Aufgabenkarten. Diese liegen getrennt bereit.
- Comeback-Karten: je 1 pro Spieler.
- Risiko-Belohnungs-Karten: je 2 pro Spieler.
- Digital: Hauptstapel wird per Fisher-Yates oder gleichwertigem Zufallsalgorithmus gemischt.

### R1.3 Startkarten verteilen

- Jeder Spieler erhält 5 Startkarten vom Nachziehstapel.
- Verteilung erfolgt reihum (kein Durcheinander).
- Handkarten anderer Spieler dürfen nicht sichtbar sein.
- Handkartenlimit: 10 Karten.
- Mindesthandkarten nach Nachziehen: 5 Karten.

### R1.4 Aufgabenkarten auslegen

- Zu Spielbeginn werden 3 offene Aufgaben offen ausgelegt und sind für alle sichtbar.
- Die restlichen 5 offenen Aufgabenkarten bilden einen verdeckten Aufgaben-Nachziehstapel.
- Jeder Spieler erhält genau 1 geheime Aufgabe; übrige geheime Aufgaben werden aus dem Spiel entfernt.
- Offene Aufgaben können von jedem Spieler erfüllt werden; nach Erfüllung werden sie ersetzt und zählen in der Endspurt-Phase doppelt.
- Geheime Aufgaben sind nur dem jeweiligen Spieler sichtbar und bringen Bonuspunkte bei Erfüllung.

## 4. Turn Structure

TODO: Define ordered phases, mandatory/optional actions, and transition conditions.

## 5. Legal Actions

TODO: List every legal action per phase and its preconditions.

> **Draft — Signoff ausstehend.** Die folgenden Schlangenbau-Regeln wurden aus dem Dart-Backlog (R3) übernommen und benötigen noch User-Signoff, bevor Implementierung beginnen darf.

### R3.1 Neue Schlange starten

- Eine neue Schlange kann nur mit einer Farbkarte gestartet werden.
- Sonderkarten können keine neue Schlange starten.
- Der Spieler muss weniger als 2 Schlangen haben.
- Es muss die Ausspielphase des Spielers sein.
- Eine neue Schlange startet mit genau 1 Karte.
- Die erste Karte definiert keinen festen Kopf/Schwanz; beide Enden sind gleichwertig.

### R3.2 Schlange erweitern

- Farbkarten können an beide Enden einer Schlange angelegt werden.
- Es gibt keine Farb-Einschränkungen beim Anlegen.
- Jede Farbkarte kann an jede Position am linken oder rechten Ende angelegt werden.
- Die Reihenfolge der Farben ist frei wählbar.
- Die Schlange wächst nach links oder rechts.
- Es gibt keine maximale Schlangenlänge.

### R3.3 Farbgruppen bilden

- Eine Farbgruppe besteht aus mindestens 3 direkt nebeneinander liegenden Karten derselben Farbe.
- Keine anderen Karten dürfen dazwischen liegen.
- Sonderkarten unterbrechen Farbgruppen.
- Eine Schlange kann mehrere Farbgruppen enthalten.
- Jede Gruppe wird separat gewertet.
- Gruppen müssen nicht zusammenhängen.

### R3.5 Schlangenlimit und Verwaltung

- Jeder Spieler darf maximal 2 Schlangen pro Spieler gleichzeitig haben.
- Zu Spielbeginn sind 0 Schlangen erlaubt.
- Bei 2 Schlangen ist keine neue Schlange möglich.
- Schlangen können nicht zusammengeführt werden.
- Schlangen können nicht freiwillig aufgelöst werden.
- Schlangen-Zustände: aktiv, blockiert, geschützt.
- Eine blockierte Schlange kann nicht erweitert werden.
- Jede Schlange hat eine eindeutige ID.

## 6. Illegal Actions

TODO: List forbidden actions, expected UI behavior, and engine errors.

## 7. Effects & Special Rules

TODO: Define timing, resolution order, modifiers, edge cases, and conflicts.

## 8. Scoring & Win/Loss

TODO: Define scoring, game-end conditions, win/loss/draw logic.

## 9. UI Requirements

TODO: Define minimum playable UI: visible state, legal action affordances, feedback, accessibility, mobile expectations.

## 10. Non-Goals

TODO: Explicitly list what is out of scope for v2 initial release.

## 11. Acceptance Sign-Off

- [ ] User reviewed this spec
- [ ] Ambiguous rules resolved
- [ ] Acceptance tests derived from this spec
- [ ] Implementation may begin

Accepted by: TODO
Date: TODO
