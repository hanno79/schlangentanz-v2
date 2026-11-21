---
id: TF-ENGINE-040
titel: Eine Farbkarte geht an beide Enden jeder Schlange am Tisch, auch einer gegnerischen, ohne dass jemand gefragt wird, und eine dritte eigene Schlange wird nicht angeboten.
art: beides
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
skript: src/engine/__tests__/legen_farbkarte.test.ts
aenderung: task/E5-legen (PR #66)
---

## Worum es geht

Seit E5 darf eine Farbkarte in jede Schlange, auch in die eines Mitspielers (D9), aber nur an ein Ende (A5). Eine neue Schlange beginnt jeder nur für sich, höchstens zwei (A5, D19). Gegen eine Farbkarte gibt es keine Abwehr (D10), also darf auch ein Gegner mit Farbenschutz nicht gefragt werden.

## Bestanden, wenn

- Im Szenario `farbkarte-beim-gegner` stehen genau 30 Knöpfe „FarbkarteLegen“, je fünf Farbkarten an „anfang“ und „ende“ von schlange-1, schlange-2 und schlange-3, und keiner nennt „neue Schlange“.
- Nach dem Klick auf „FarbkarteLegen: Feuerkeim (rot-03) → schlange-3 ende“ steht als einziges Ereignis „KarteGespielt: Spieler 1 (spieler-1), rot-03 (FarbkarteLegen) → schlange-3 von KI-Gegner 1 (spieler-2), Stelle 2“, es gibt keinen Knopf „Reagieren“, und es entscheidet weiter Spieler 1.
- schlange-3 von KI-Gegner 1 lautet Feuerkeim, Feuerkeim, Feuerkeim, der Farbenschutz bleibt auf seiner Hand, und der Zwischenstand zeigt bei KI-Gegner 1 Gruppen 3, bei Spieler 1 Gruppen 0.

## Fehlgeschlagen, wenn

Ein Knopf „neue Schlange“ erscheint, ein Ende einer Schlange fehlt, nach dem Klick „KarteAngesagt“ oder „AbwehrGefragt“ steht, ein Knopf „Reagieren“ erscheint oder die drei roten Karten bei Spieler 1 statt bei KI-Gegner 1 zählen.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build (`npm run build:testhooks`, `vite preview --outDir dist-testhooks`), Stand ab `206ca15` |
| Ausgangslage prüfen | Seite `/dev?szenario=farbkarte-beim-gegner` zeigt „Schritt 0“ und „Spieler 1 entscheidet; das ist ein Mensch.“ |

## Testdaten

Szenario `farbkarte-beim-gegner` (Saat 51, zwei Spieler). Gespielte Karte: Feuerkeim rot-03.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Entwicklertisch, Abschnitt „Aktionen der Engine“ | Knöpfe unter „FarbkarteLegen“ zählen | | „FarbkarteLegen (30)“, kein Knopf mit „neue Schlange“ |
| 2 | Abschnitt „Aktionen der Engine“ | Knopf anklicken | „FarbkarteLegen: Feuerkeim (rot-03) → schlange-3 ende“ | „Schritt 1“; unter „Ereignisse des letzten Schritts (1)“ nur KarteGespielt mit „→ schlange-3 von KI-Gegner 1 (spieler-2), Stelle 2“ |
| 3 | Abschnitt „Aktionen der Engine“ | Knöpfe lesen | | nur „ZugBeenden“, kein „Reagieren“; neben „KI-Schritt“ steht „Spieler 1 entscheidet“ |
| 4 | Abschnitt „Spieler“, KI-Gegner 1 | Hand und Schlange lesen | | Hand enthält „Farbenschutz farbenschutz-04“; „Schlange 1 schlange-3“ zeigt dreimal Feuerkeim |
| 5 | Abschnitt „Wertung“, Zwischenstand | Spalte Gruppen lesen | | Spieler 1: 0, KI-Gegner 1: 3 |

## Technische Prüfung

`npx vitest run src/engine/__tests__/legen_farbkarte.test.ts src/entwicklung/szenarienLegen.test.ts` endet mit Exit 0.

## Nicht abgedeckte Grenzfälle

Farbkarte ohne jede Schlange am Tisch ist nur „neue Schlange“, geprüft in `zugablauf_ausspielen.test.ts` (E2). Eine Farbkarte in eine Schlange mit Fusion oder Blockade am Ende deckt `legen_farbkarte.test.ts` ab. Eine zweite Farbkarte im selben Zug nach dem Anlegen beim Gegner steht in TF-ENGINE-043.
