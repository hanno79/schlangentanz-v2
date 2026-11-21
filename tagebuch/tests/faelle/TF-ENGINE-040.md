---
id: TF-ENGINE-040
titel: Wehrt der Gegner eine Schlangenblockade ab, liegt sie wirkungslos auf dem Ablagestapel des Angreifers, lässt sich nicht auf ein anderes Ziel richten, und der Gegner füllt erst zu Beginn seines Zuges auf.
art: beides
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
skript: src/engine/__tests__/legen_schlangenblockade.test.ts
aenderung: task/E5-legen (PR #66)
---

## Worum es geht

A6 Beispiel 1 am Entwicklertisch: Spieler A sagt eine Blockade auf die Schlange von B an, B wehrt mit Farbenschutz ab. Danach darf A die Blockade nicht gegen einen anderen Spieler richten, auch nicht mit einer zweiten (A6, B2, D12). Die Blockade darf an jede Stelle jeder Schlange, auch an die Enden und in die eigene (A7.5).

## Bestanden, wenn

- Im Szenario `blockade-abwehr` stehen 18 Knöpfe „BlockadeLegen“: beide Blockaden an schlange-1 Stelle 0 bis 2, schlange-2 Stelle 0 bis 3 und schlange-3 Stelle 0 bis 1.
- Nach „BlockadeLegen: Schlangenblockade (schlangenblockade-01) → schlange-2 · Stelle 1“ stehen KarteAngesagt („trifft KI-Gegner 1 (spieler-2)“) und AbwehrGefragt.
- Nach „Reagieren: abwehren mit Farbenschutz (farbenschutz-04)“ stehen Abgewehrt und „AnsageEntschieden: schlangenblockade-01 … ohne Wirkung … → Ablagestapel von Spieler 1 (spieler-1), Stelle 0“; schlange-2 bleibt dreimal Feuerkeim, KI-Gegner 1 hält 4 Karten, auf seinem Ablagestapel liegt farbenschutz-04. Spieler 1 hat nur noch FarbkarteLegen und ZugBeenden, obwohl schlangenblockade-03 auf seiner Hand liegt.
- Nach „ZugBeenden“: „KartenGezogen: Spieler 1 (spieler-1) zieht 1“, „ZugBegonnen: KI-Gegner 1 (spieler-2), Teilzug 1“, „KartenGezogen: KI-Gegner 1 (spieler-2) zieht 1“.

## Fehlgeschlagen, wenn

Nach der Abwehr ein Knopf BlockadeLegen erscheint, die Blockade in einer Schlange liegt, KI-Gegner 1 sofort nachzieht oder die Reihenfolge der Ereignisse beim Zugende anders ist.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build, Stand ab `206ca15` |
| Ausgangslage prüfen | `/dev?szenario=blockade-abwehr` zeigt „Schritt 0“ und „Aktionen der Engine (39)“ |

## Testdaten

Szenario `blockade-abwehr` (Saat 53, drei Spieler). Karten schlangenblockade-01 und schlangenblockade-03 bei Spieler 1, farbenschutz-04 bei KI-Gegner 1.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | „Aktionen der Engine“ | Knöpfe unter „BlockadeLegen“ zählen | | „BlockadeLegen (18)“ |
| 2 | „Aktionen der Engine“ | Knopf anklicken | „BlockadeLegen: Schlangenblockade (schlangenblockade-01) → schlange-2 · Stelle 1“ | KarteAngesagt, AbwehrGefragt; „KI-Gegner 1 entscheidet“ |
| 3 | „Aktionen der Engine“ | Knopf anklicken | „Reagieren: abwehren mit Farbenschutz (farbenschutz-04)“ | Abgewehrt, AnsageEntschieden ohne Wirkung → Ablagestapel von Spieler 1, Stelle 0 |
| 4 | „Aktionen der Engine“ und „Spieler“ | Knöpfe und KI-Gegner 1 lesen | | nur FarbkarteLegen (21) und ZugBeenden; KI-Gegner 1 Hand (4), schlange-2 dreimal Feuerkeim |
| 5 | „Aktionen der Engine“ | Knopf anklicken | „ZugBeenden“ | drei Ereignisse wie unter „Bestanden, wenn“ |

## Technische Prüfung

`npx vitest run src/engine/__tests__/legen_schlangenblockade.test.ts src/entwicklung/szenarienLegen.test.ts` endet mit Exit 0.

## Nicht abgedeckte Grenzfälle

Durchlassen (Feuerkeim, Blockade, Feuerkeim, Feuerkeim mit 0 Punkten), Blockade in der eigenen Schlange ohne Rückfrage und Blockade ohne Schlange am Tisch stehen als Tests in `legen_schlangenblockade.test.ts`. Ungültige Stellen, vier Spieler und Aktionen des Angreifers während der offenen Frage stehen in TF-ENGINE-041. Entfernen durch Schlangenfrass gehört zu E6.
