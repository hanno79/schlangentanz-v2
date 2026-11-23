---
id: TF-DEV-046
titel: Im Szenario zusatzaktionen-test spielt Spieler 1 mit zwei Zusatzaktionen drei Farbkarten und eine Farbenfusion, danach bleibt nur „Zug beenden“, und der Verdoppler lässt sich nur ohne Wirkung ablegen.
art: manuell
regression: nein
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-23
veraendert_daten: nein
aenderung: task/X3-zusatzaktionen (PR #108)
---

## Worum es geht

Comeback-Karte und Schlangenkorb geben einem Zug zusätzliche Aktionen (A8.1, D46). Die Grenzen eines Zuges stehen seit X3 an einer Stelle. Das Szenario meldet zwei Test-Zusatzaktionen an, so wie es eine Comeback-Karte später tut, und zeigt, was dann erlaubt ist und was nicht.

## Bestanden, wenn

Zu Beginn bietet die Engine 14 Aktionen an: 9 FarbkarteLegen, 4 FusionLegen und für den Verdoppler nur „SonderkarteWirkungslosAblegen“. Nach Blau, Rot und Gelb ans Ende von schlange-1 und der Fusion auf Grün-Grün bietet sie nur noch „ZugBeenden“ an; die Lage zeigt „gespielt: 3 Farbkarte(n), 1 Sonderkarte(n)“ und „belegt: blau-06, rot-01, gelb-01, farbenfusion-02“. Spielt man die Fusion zuerst, steht die zweite Fusion nur unter „SonderkarteWirkungslosAblegen“. Nach „Zug beenden“ ist KI-Gegner 1 am Zug, und unter „Zusatzaktionen“ steht „keine“. Alle Invarianten sind erfüllt.

## Fehlgeschlagen, wenn

Nach drei Farbkarten bietet die Engine eine vierte an, eine zweite Fusion ist mit Wirkung spielbar, der Verdoppler hat ein Ziel, oder der nächste Spieler erbt die Zusatzaktionen.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build (`npm run build:testhooks`, `vite preview --outDir dist-testhooks`), Stand ab Commit 686159e |

## Testdaten

Szenario `zusatzaktionen-test`: Spieler 1 hält Blau, Rot, Gelb, zwei Farbenfusionen und einen Verdoppler; seine Schlange ist Grün, Grün, Braun, Braun.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Adresse | öffnen | `/dev?szenario=zusatzaktionen-test` | „Aktionen der Engine (14)“; Verdoppler nur unter „SonderkarteWirkungslosAblegen“; Lage „Zusatzaktionen: Comeback: Farbkarte/Sonderkarte; Comeback: Farbkarte/Sonderkarte; in dieser Runde: Comeback“ |
| 2 | Aktionen der Engine | nacheinander klicken | „FarbkarteLegen: Wasserwirbel (blau-06) → schlange-1 ende“, dann rot-01 und gelb-01 jeweils „→ schlange-1 ende“ | nach dem dritten Klick „gespielt: 3 Farbkarte(n)“, keine FarbkarteLegen mehr angeboten |
| 3 | Aktionen der Engine | klicken | „FusionLegen: Farbenfusion (farbenfusion-02) → schlange-1 · Waldspross (gruen-07), Waldspross (gruen-09)“ | nur noch „ZugBeenden (1)“; „belegt: blau-06, rot-01, gelb-01, farbenfusion-02“ |
| 4 | Kopf des Szenarios | „Von vorn“ klicken, dann die Fusion aus Schritt 3 zuerst | | unter „SonderkarteWirkungslosAblegen (2)“ stehen farbenfusion-03 und verdoppler-04 |
| 5 | Aktionen der Engine | „ZugBeenden“ klicken | | „Am Zug: KI-Gegner 1“, Zusatzaktionen „keine“, Invarianten alle erfüllt |

## Nicht abgedeckte Grenzfälle

Eine Zusatzaktion nur für bestimmte Karten (D43) und eine eigene Aktion ohne Karte (A8.1) prüfen die Regeltests `A5_zusatzaktionen.test.ts`; am Tisch gibt es dafür noch keine Karte (X4, X6).
