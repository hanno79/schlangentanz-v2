---
id: TF-REGELN-002
titel: Die Kartenübersicht auf /regeln zeigt alle 33 Karten als Knöpfe, und jeder Kartenname ist ohne Umbruch mitten im Wort lesbar.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
aenderung: task/O9-regelhilfe (PR #37)
---

## Worum es geht

Unter „Alle Karten“ wählt man die Karte, deren Text man lesen will. Dafür muss man den Namen unter dem Bild lesen können, auch in Browsern ohne deutsche Silbentrennung.

## Bestanden, wenn

Es stehen 33 Knöpfe in vier Gruppen (6 Farbkarten, 10 Sonderkarten, 2 Zusatzkarten, 15 Aufgaben), jeder ist mindestens 44 × 44 px gross, und kein Name bricht mitten im Wort ohne Trennstrich um.

## Fehlgeschlagen, wenn

Ein Knopf fehlt, ist kleiner als 44 px, oder ein Name zerfällt in Bruchstücke wie „Farbensc“ / „hutz“ oder „Schlange“ / „nblockad“ / „e“.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Produktionsbuild; eingebauter Browser der Claude-Desktop-App (Chromium ohne deutsches Trennwörterbuch) und Playwright Chromium |

## Testdaten

Desktop 1280×900, dazu die vier Touch-Klassen.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | `/regeln` | zu „Alle Karten“ scrollen | | 33 Karten in vier Gruppen |
| 2 | Gruppe „Sonderkarten“ | Namen unter den Bildern lesen | | Umbruch nur zwischen Wörtern oder an einer Silbengrenze mit Trennstrich |

## Nicht abgedeckte Grenzfälle

Keine.
