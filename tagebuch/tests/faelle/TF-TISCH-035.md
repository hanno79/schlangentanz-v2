---
id: TF-TISCH-035
titel: Mitten im Ordnen einer Häutung überlebt die Anordnung das Drehen des Handys; Escape und Neuladen beginnen ohne Auswahl, und gespielt ist nichts.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
aenderung: task/O7-haeutung-tisch (PR #78)
grenzfall_von: TF-TISCH-032
---

## Worum es geht

Die gelegte Anordnung lebt nur im Browser, bis man ausführt. Dreht man das Handy, darf sie nicht verloren gehen. Escape oder Neuladen sollen sauber zum Anfang zurückführen, ohne halbe Häutung.

## Bestanden, wenn

Eine Karte zweimal antippen drückt sie und löst sie wieder. Nach Drehen von 390 × 844 auf 844 × 390 steht dieselbe Anordnung (Gelb, Rot, Blau, Rot, Gelb) mit derselben Ansage, alle Ziele frei. Escape zeigt Blau, Rot, Gelb, Rot, Gelb ohne Ziele. Neuladen mitten im Ordnen zeigt die Schlange wie gespeichert, ohne Auswahl, und der gespeicherte Stand ist unverändert.

## Fehlgeschlagen, wenn

Die Anordnung springt beim Drehen zurück, nach Escape oder Neuladen bleibt eine Auswahl stehen, oder der Spielstand hat sich geändert.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build, Handy hochkant 390 × 844 mit Touch, Stand ab Commit 49a394c |

## Testdaten

Szenario `haeutung`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser | Adresse öffnen | `/spiel?szenario=haeutung&tempo=sofort` | Schlange Blau, Rot, Gelb, Rot, Gelb |
| 2 | Tisch | Häutung, „Deine Schlange 1 wählen“, Karte 1 und 5, dann Karte 1 und 3 tauschen | | Gelb, Rot, Blau, Rot, Gelb; Ansage |
| 3 | Deine Schlange 1 | Karte 2 zweimal antippen | | erst gedrückt, dann nicht mehr |
| 4 | Gerät | auf 844 × 390 drehen | | gleiche Anordnung und Ansage, Ziele frei |
| 5 | Tastatur | Escape | | Blau, Rot, Gelb, Rot, Gelb, keine Ziele |
| 6 | Tisch | Schritt 2 wiederholen, dann Seite neu laden | | Blau, Rot, Gelb, Rot, Gelb, keine Auswahl, Spielstand unverändert |
