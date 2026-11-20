---
id: TF-DEV-021
titel: In der Zufallspartie aus Saat 7 mit drei Spielern spielen zwei Spieler je einen Verdoppler, und der Tisch zeigt jedes Mal einen zweiten Zug mit „Teilzug 2“ und danach den nächsten Spieler.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-20
veraendert_daten: nein
aenderung: task/E3-verdoppler (PR #51)
grenzfall_von: TF-DEV-019
---

## Worum es geht

Die Szenarien sind gebaute Lagen. In einer gemischten Partie zeigt sich, ob der Verdoppler auch dort richtig läuft, wo die Karten zufällig verteilt sind, und ob nach einem zweiten Zug die Reihenfolge der Spieler stimmt.

## Bestanden, wenn

Spieler 1 legt Grün, spielt danach den Verdoppler (Farbkarte vor dem Verdoppler) und beendet: KartenGezogen (zieht 2), ZugBegonnen Spieler 1 Teilzug 2, Stapel 91. Nach Rot und „ZugBeenden“: zieht 1, KI-Gegner 1 mit Teilzug 1, Stapel 90, Hände 5/5/5. KI-Gegner 2 spielt später den Verdoppler allein, zieht 1 und beginnt Teilzug 2 (Stapel 88); nach Blau und „ZugBeenden“ ist Spieler 1 mit Teilzug 1 dran, Stapel 87, Hände 5/5/5. Invarianten alle erfüllt, keine Konsolenfehler.

## Fehlgeschlagen, wenn

Ein zweiter Zug ausbleibt, an den falschen Spieler geht, die Hand nicht auf 5 kommt oder der Stapel nicht um die gezogenen Karten kleiner wird.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build, `npm run preview:testhooks` auf Port 4174 |

## Testdaten

`/dev?seed=7&spieler=3` (ohne Erweiterung). Spieler 1 hält zu Beginn Grün, Schlangenblockade, Gelb, Verdoppler (verdoppler-03), Rot; KI-Gegner 2 erhält verdoppler-02.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | `/dev?seed=7&spieler=3` | „FarbkarteLegen: Waldspross (gruen-01) → neue Schlange“, „VerdopplerSpielen“, „ZugBeenden“ | | ZugBegonnen: Spieler 1, Teilzug 2; Stapel 91 |
| 2 | Aktionen der Engine | „FarbkarteLegen: Feuerkeim (rot-08) → schlange-1 ende“, „ZugBeenden“ | | ZugBegonnen: KI-Gegner 1, Teilzug 1; Stapel 90 |
| 3 | Aktionen der Engine | KI-Gegner 1: „FarbkarteLegen: Wasserwirbel (blau-12) → neue Schlange“, „ZugBeenden“ | | ZugBegonnen: KI-Gegner 2, Teilzug 1; VerdopplerSpielen angeboten |
| 4 | Aktionen der Engine | KI-Gegner 2: „VerdopplerSpielen: Verdoppler (verdoppler-02)“, „ZugBeenden“ | | zieht 1; ZugBegonnen: KI-Gegner 2, Teilzug 2; Stapel 88 |
| 5 | Aktionen der Engine | KI-Gegner 2: „FarbkarteLegen: Wasserwirbel (blau-04) → neue Schlange“, „ZugBeenden“ | | ZugBegonnen: Spieler 1, Teilzug 1; Stapel 87; Hände 5/5/5 |

## Nicht abgedeckte Grenzfälle

Die Partie wurde nicht bis zum Ende gespielt; das Spielende mit Verdoppler prüfen TF-DEV-020 und TF-ENGINE-018.
