---
id: TF-ENGINE-041
titel: Die Regenbogenschlange kommt an jede Lücke jeder bestehenden Schlange, in der eigenen ohne Rückfrage, und in der Schlange eines Gegners kann dieser sie abwehren oder durchlassen.
art: beides
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
skript: src/engine/__tests__/regeln/A7.3_regenbogenschlange.test.ts
aenderung: task/E5-legen (PR #66)
---

## Worum es geht

Die Regenbogenschlange ist die Sonderkarte des Zuges und darf an jede Stelle jeder Schlange (A5, A7.3, D9), beginnt aber keine neue (D16). Legt ein Gegner sie in meine Schlange, werde ich gefragt und kann mit Farbenschutz abwehren (A7.2, D10, D33). Lasse ich sie durch, nützt sie mir.

## Bestanden, wenn

- Im Szenario `regenbogen` stehen 8 Knöpfe „RegenbogenschlangeLegen“: schlange-1 Stelle 0 bis 4 und schlange-2 Stelle 0 bis 2, keiner für KI-Gegner 2.
- Weg 1, schlange-1 Stelle 2: nur „KarteGespielt … → schlange-1 von Spieler 1 (spieler-1), Stelle 2“; schlange-1 ist Feuerkeim, Feuerkeim, Regenbogenschlange, Wurzelpfad, Wurzelpfad; Zwischenstand Spieler 1 Gruppen 4; danach nur FarbkarteLegen (20) und ZugBeenden.
- Weg 2, schlange-2 Stelle 2: „KarteAngesagt … trifft KI-Gegner 1 (spieler-2)“ und „AbwehrGefragt“, zwei Knöpfe „Reagieren“. Abwehren ergibt „Abgewehrt“ und „AnsageEntschieden … ohne Wirkung … → Ablagestapel von Spieler 1 (spieler-1), Stelle 0“, schlange-2 bleibt Sonnenblatt, Sonnenblatt. Durchlassen ergibt „AnsageEntschieden … wirkt, niemand hat abgewehrt → schlange-2 von KI-Gegner 1 (spieler-2), Stelle 2“ und Zwischenstand KI-Gegner 1 Gruppen 2.

## Fehlgeschlagen, wenn

Eine Lücke fehlt oder ein Knopf für KI-Gegner 2 erscheint, in der eigenen Schlange jemand gefragt wird, in der fremden niemand gefragt wird, nach der Abwehr die Karte in der Schlange liegt oder nach dem Legen noch eine Sonderkarte angeboten wird.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build, Stand ab `206ca15` |
| Ausgangslage prüfen | `/dev?szenario=regenbogen` zeigt „Schritt 0“ und „Aktionen der Engine (28)“ |

## Testdaten

Szenario `regenbogen` (Saat 52, drei Spieler). Karte regenbogenschlange-01, Farbenschutz farbenschutz-01 bei KI-Gegner 1.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | „Aktionen der Engine“ | Knöpfe unter „RegenbogenschlangeLegen“ lesen | | „(8)“, schlange-1 · Stelle 0 bis 4, schlange-2 · Stelle 0 bis 2 |
| 2 | „Aktionen der Engine“ | Knopf anklicken | „… → schlange-1 · Stelle 2“ | ein Ereignis KarteGespielt, Stelle 2 |
| 3 | „Spieler“ und „Wertung“ | schlange-1 und Zwischenstand lesen | | Feuerkeim, Feuerkeim, Regenbogenschlange, Wurzelpfad, Wurzelpfad; Gruppen 4 |
| 4 | Kopf des Szenarios | „Von vorn“ anklicken | | „Schritt 0“ |
| 5 | „Aktionen der Engine“ | Knopf anklicken | „… → schlange-2 · Stelle 2“ | KarteAngesagt und AbwehrGefragt; „KI-Gegner 1 entscheidet“ |
| 6 | „Aktionen der Engine“ | Knopf anklicken | „Reagieren: abwehren mit Farbenschutz (farbenschutz-01)“ | Abgewehrt, AnsageEntschieden ohne Wirkung → Ablagestapel von Spieler 1, Stelle 0; schlange-2 zwei Karten |
| 7 | Kopf des Szenarios | „Schritt zurück“ anklicken | | wieder die zwei Knöpfe „Reagieren“ |
| 8 | „Aktionen der Engine“ | Knopf anklicken | „Reagieren: durchlassen“ | AnsageEntschieden → schlange-2 Stelle 2; Zwischenstand KI-Gegner 1 Gruppen 2 |

## Technische Prüfung

`npx vitest run src/engine/__tests__/regeln/A7.3_regenbogenschlange.test.ts src/entwicklung/szenarienLegen.test.ts` endet mit Exit 0.

## Nicht abgedeckte Grenzfälle

Ohne Schlange am Tisch nur wirkungslos ablegen und drei Joker nebeneinander stehen als Tests in `A7.3_regenbogenschlange.test.ts`. Ungültige Stellen (-1, 0,5, Länge+1) und vier Spieler stehen in TF-ENGINE-043. Wie sie in der Wertung zählt, gehört zu E10.
