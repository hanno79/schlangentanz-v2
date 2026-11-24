---
id: TF-ENGINE-075
titel: Farbenpracht wird auch nach dem Abwerfen überzähliger Karten und am Ende des zweiten Verdoppler-Zuges eingelöst, aber nicht, wenn der Spieler die vom Gegner geschaffene Bedingung im eigenen Zug selbst zerstört.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-24
veraendert_daten: nein
aenderung: task/X2a-aufgaben-farbmengen (PR #107)
grenzfall_von: TF-ENGINE-074
---

## Worum es geht

Drei Zugenden, die die Tests des Umsetzers nicht abdecken. Hält ein Spieler am Zugende mehr als fünf Karten, endet sein Zug erst nach dem Abwerfen. Nach einem Verdoppler kann Farbenpracht erst im zweiten Zug entstehen. Und eine Bedingung, die ein Gegner geschaffen hat, zählt nur, wenn sie am Ende des eigenen Zuges noch gilt.

## Bestanden, wenn

Mit sieben Handkarten: nach „Zug beenden“ AbwerfenVerlangt ohne Aufgabenereignis, nach „UeberhandAbwerfen“ AufgabeErfuellt Farbenpracht vor ZugBegonnen. Mit Verdoppler und Grün erst im zweiten Zug: am Ende des ersten Zuges nichts, am Ende des zweiten AufgabeErfuellt. Legt Spieler 1 die fehlende grüne Karte in die Schlange von KI-Gegner 1 und fusioniert dieser im eigenen Zug zwei blaue Karten: kein Aufgabenereignis, KI-Gegner 1 hat keine Aufgabe.

## Fehlgeschlagen, wenn

Farbenpracht kommt schon beim AbwerfenVerlangt oder gar nicht, am Ende des ersten Verdoppler-Zuges, oder trotz der eigenen Fusion.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Repo mit `npm ci`, Stand ab Commit 4dcd05d |

## Testdaten

Schlange Blau, Blau, Rot, Rot, Gelb, Gelb, Violett, Violett, Braun, Braun, Grün; offen Farbenpracht, Lila Riese, Gelber Schatz.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Datei `src/engine/__tests__/regeln/tmp_zugende.test.ts` | anlegen; mit `tischMitHaenden(…, true)` und `legeAufgabenAus` Spieler 1 die Schlange geben, Grün mit `legeAn` legen, dann `ZugBeenden` und `UeberhandAbwerfen` ausführen | Hand Grün, Rot, Gelb, Blau, Braun, Violett, Rot | nach ZugBeenden AbwerfenVerlangt und kein Aufgabenereignis; nach dem Abwerfen AufgabeErfuellt vor ZugBegonnen |
| 2 | dieselbe Datei | Verdoppler spielen, Rot legen, ZugBeenden, im zweiten Zug Grün legen, ZugBeenden | Hand Verdoppler, Grün, Rot, Gelb, Braun | erst kein Aufgabenereignis, Teilzug 2; dann AufgabeErfuellt Farbenpracht, KI-Gegner 1 am Zug |
| 3 | dieselbe Datei | KI-Gegner 1 die Schlange geben, Spieler 1 legt Grün in `schlange-2` und beendet; KI-Gegner 1 legt eine Fusion auf seine zwei blauen Karten und beendet | Hand von KI-Gegner 1 Farbenfusion, Rot, Gelb, Blau, Braun | kein Aufgabenereignis, `erfuellteAufgaben` von KI-Gegner 1 leer |
| 4 | Kommandozeile | ausführen | `npx vitest run src/engine/__tests__/regeln/tmp_zugende.test.ts` | Exit 0; danach die Datei löschen |

## Technische Prüfung

Der temporäre Test des Prüfers liegt als Beleg am Lauf; erwartet sind 3 bestandene Tests. Ohne den Aufruf `pruefeAufgabenAmZugende` in `schliesseZugAb` werden Schritt 1 und 2 rot.

## Nicht abgedeckte Grenzfälle

Eine offene Entscheidung oder schwebende Karte am Zugende kann über die Aktionen nicht entstehen (`pruefeAktion` lehnt „Zug beenden“ und „Überhand abwerfen“ dann ab); dass die Prüfung in diesem Fall abbricht, prüft TF-ENGINE-074.
