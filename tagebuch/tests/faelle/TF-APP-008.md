---
id: TF-APP-008
titel: Auf dem gedrehten Handy (844×390) passt die Lobby mit laufender Partie und offener Rückfrage ohne waagrechtes Scrollen.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: ja
aenderung: task/O2-app-rahmen-lobby (PR #29)
grenzfall_von: TF-APP-003
---

## Worum es geht

Die drei Geräteklassen decken das quer gehaltene Handy nicht ab. Mit laufender Partie und offener Rückfrage ist die Lobby am längsten; bei nur 390 px Höhe muss sie senkrecht scrollen, darf aber nicht seitlich überstehen.

## Bestanden, wenn

Bei 844×390 mit Touch ist die Seite 0 px breiter als das Fenster, sie ist 623 px hoch und scrollt senkrecht, und „Ja, neue Partie“ und „Abbrechen“ lassen sich antippen.

## Fehlgeschlagen, wenn

Die Seite steht seitlich über, die Knöpfe der Rückfrage sind verdeckt oder abgeschnitten.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Produktionsbuild auf Port 4173, Fenster 844×390 mit Touch |
| Ausgangslage | Eine Partie ist gespeichert |

## Testdaten

Fenster 844×390, Touch.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Lobby | „Neue Partie“ antippen | | Rückfrage erscheint unter „Mit Erweiterung“ |
| 2 | Lobby | nach unten wischen | | Rückfrage und „Regeln“ ganz sichtbar, kein seitliches Verschieben |

## Zurücksetzen

Local Storage löschen.
