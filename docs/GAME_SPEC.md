# Schlangentanz Game Spec

Status: **Draft template — not locked**

No real game implementation should begin until this document is filled and accepted.

## 1. Overview

TODO: Describe objective, player count, target platform, and expected session duration.

## 2. Entities

TODO: Define cards, tokens, board/positions if any, players, resources, effects, and persistent state.

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
