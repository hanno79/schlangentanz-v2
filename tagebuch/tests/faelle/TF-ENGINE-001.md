---
id: TF-ENGINE-001
titel: Eine neue Partie hat das Material aus A1 und ist nach A4 aufgebaut, mit und ohne Erweiterung.
art: beides
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
skript: src/engine/__tests__/material.test.ts
aenderung: task/E1-struktur (PR #31)
---

## Worum es geht

Die Engine baut eine Partie aus Spielerzahl, Erweiterungs-Schalter und Zufallsquelle. Stimmen Stückzahlen oder Aufbau nicht, ist jede spätere Partie falsch, auch wenn alle Kartenregeln stimmen.

## Bestanden, wenn

Ohne Erweiterung liegen 108 Spielkarten im Spiel (15 Blau, 15 Rot, 15 Gelb, 12 Violett, 12 Braun, 9 Grün, je 4 Farbenschutz, Regenbogenschlange, Schlangenfrass, Farbendieb, Farbenfusion, Verdoppler, je 3 Schlangenblockade und Schlangengrube) und keine Aufgaben. Mit Erweiterung sind es 112 (dazu 3 Schlangenhäutungen, 1 Schlangenkorb), 15 Aufgaben (3 offen, je Spieler 1 geheim, der Rest im Aufgabenstapel) und vor jedem Spieler 1 Comeback- und 2 Risiko-Karten. Jeder Spieler hat 5 Handkarten und einen eigenen, leeren Ablagestapel; im Nachziehstapel liegen 108 oder 112 minus 5 je Spieler.

## Fehlgeschlagen, wenn

Eine Stückzahl abweicht, eine Comeback- oder Risiko-Karte im Kartenstapel liegt, ein Spieler nicht 5 Handkarten hat oder es einen gemeinsamen Ablagestapel gibt.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build (`npm run build:testhooks`, `npm run preview:testhooks`), Port 4174 |

## Testdaten

Szenarien `start-2`, `start-4`, `start-erweiterung`; Adressen `/dev?seed=2&spieler=4&erweiterung=1` und `/dev?seed=99&spieler=4&erweiterung=0`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | `/dev/szenarien` | Link `start-2` anklicken | | 2 Spieler, je „Hand (5)“, „Ablagestapel: 0 Karten“, „Nachziehstapel: 98 Karten“, „Offene Aufgaben (0)“ |
| 2 | `/dev?szenario=start-4` | Seite lesen | | 4 Spieler mit je 5 Handkarten, 88 Karten im Nachziehstapel |
| 3 | `/dev?szenario=start-erweiterung` | Seite lesen | | „Erweiterung mit“, 97 im Nachziehstapel, 3 offene Aufgaben, 9 im Aufgabenstapel, je Spieler geheime Aufgabe, Comeback und zwei Risiko-Karten |
| 4 | `/dev?seed=2&spieler=4&erweiterung=1` | Seite lesen | | 92 im Nachziehstapel, 3 offen, 8 im Aufgabenstapel, 4 geheime Aufgaben |

## Technische Prüfung

`npx vitest run src/engine/__tests__/material.test.ts` endet mit 0.

## Nicht abgedeckte Grenzfälle

Ob Aufgaben und Erweiterungskarten wirklich gemischt werden, steht im Grenzfall TF-ENGINE-002.
