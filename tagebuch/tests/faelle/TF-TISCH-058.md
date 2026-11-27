---
id: TF-TISCH-058
titel: Erfüllst du eine offene Aufgabe, meldet die Zugleiste sie, die nächste Aufgabe liegt offen, und die erfüllte steht in deiner Auslage.
art: manuell
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-27
veraendert_daten: ja
aenderung: task/O10-erweiterung-tisch (PR #124)
---

## Worum es geht

A9: Die erfüllte offene Aufgabe wandert zum Spieler und wird ersetzt. „Schlangenspass!“ wird nicht gerufen; das Spiel zeigt die Aufgabe sichtbar an (B2).

## Bestanden, wenn

Nach Violett an das Ende der Schlange mit vier violetten Karten steht in der Zugleiste in Erfolgsfarbe „Du erfüllst die Aufgabe Lila Riese. Neu offen liegt die Aufgabe Farbenpracht.“, im Protokoll dieselben zwei Sätze, unter „Offene Aufgaben“ Farbenpracht, Gelber Schatz, Farbharmonie und in „Deine Auslage“ unter „Erfüllte Aufgaben“ Lila Riese. Der Zwischenstand steigt auf 15 Punkte.

## Fehlgeschlagen, wenn

Die Meldung fehlt, Lila Riese liegt weiter offen, oder sie fehlt in der Auslage.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build, Stand ab Commit 4ad16f8 |

## Testdaten

Szenario `aufgabe-lila-riese`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Adresse | öffnen | `/spiel?szenario=aufgabe-lila-riese&tempo=sofort` | Offen: Lila Riese, Gelber Schatz, Farbharmonie |
| 2 | Hand, Schlange | Violett, „Deine Schlange 1: Ende“, „Ausführen“ | | Meldung, Aufgaben und Auslage wie oben |

## Zurücksetzen

Das Szenario setzt den Stand neu.

## Nicht abgedeckte Grenzfälle

Leerer Aufgabenstapel (`aufgaben-stapel-leer`) und eine Aufgabe, die ein Gegner erfüllt, sind nicht im Browser geprüft; die KI-Seite zeigt nur die Wertung der Handpartie (KI-Gegner 1 mit Lila Riese).
