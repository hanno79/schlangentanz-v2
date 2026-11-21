---
id: TF-TISCH-009
titel: Wer mitten in den KI-Zügen zur Lobby geht, hält die KI an; „Weiterspielen“ setzt mit genau dem nächsten Schritt nach etwa 700 ms fort.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: ja
aenderung: task/O3-partie-steuerung (PR #70)
grenzfall_von: TF-TISCH-005
---

## Worum es geht

Verlässt der Mensch den Tisch, während die KI gerade zieht, darf in der Lobby nichts weiterlaufen. Kommt er zurück, soll die Partie mit dem nächsten Schritt weitergehen, ohne dass einer fehlt oder doppelt kommt.

## Bestanden, wenn

In der Lobby wird drei Sekunden lang nichts gespeichert. Nach „Weiterspielen“ folgt nach 680 bis 800 ms genau ein Schritt: Beim Gegner am Zug ist eine Handkarte weniger und eine Karte mehr in einer Schlange oder auf dem Ablagestapel, oder der Zug ist an den nächsten Spieler gegangen.

## Fehlgeschlagen, wenn

Die KI spielt in der Lobby weiter, nach „Weiterspielen“ kommt sofort ein Schritt oder gar keiner, oder es fehlen beziehungsweise doppeln sich Schritte.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build, Desktop 1280 × 900, ohne „weniger Bewegung“, Stand ab Commit 249aebb |
| Ausgangslage prüfen | Leerer Local Storage |

## Testdaten

Szenario `schlussrunde-ohne-dich`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser | Adresse öffnen | `/spiel?szenario=schlussrunde-ohne-dich` | „KI-Gegner 1 ist dran“ |
| 2 | Tisch | zwei KI-Schritte abwarten, dann 0,3 s später „Zur Lobby“ klicken | | Lobby mit „Weiterspielen“ |
| 3 | Lobby | drei Sekunden warten | | nichts ändert sich, Stand im Speicher gleich |
| 4 | Lobby | „Weiterspielen“ klicken | | Tisch zeigt den Stand von Schritt 2, nach etwa 0,7 s genau ein weiterer Schritt |

## Zurücksetzen

Local Storage leeren oder Kontext schliessen.
