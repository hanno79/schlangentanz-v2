---
id: TF-APP-016
titel: Dreht man das Handy bei offener Rückfrage von hochkant auf quer, bleibt die Rückfrage im Bild.
art: beides
regression: nein
prioritaet: niedrig
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: ja
aenderung: task/P0.3c-fuenf-geraeteklassen (PR #32)
skript: tests/layout/lobby.spec.ts
grenzfall_von: TF-APP-003
---

## Worum es geht

Seit P0.3c gehört Handy quer (844×390) zu den Geräteklassen. Wer die Rückfrage vor einer neuen Partie offen hat und dabei das Handy dreht, soll sie danach noch sehen. Sonst wirkt die Lobby blockiert, obwohl die Rückfrage nur unter dem Bildrand liegt. Seit O2b misst das der Layout-Vertrag „O2b TF-APP-016: Lobby mit offener Rückfrage nach dem Drehen“ in allen fünf Klassen (jede dreht ihr Fenster), und `src/ui/lobby/Lobby.drehen.test.tsx` hält fest, dass die Lobby die offene Rückfrage bei jeder Grössenänderung ins Bild holt.

## Bestanden, wenn

Nach dem Drehen auf 844×390 liegt die Rückfrage (`role="alertdialog"`) ganz zwischen 0 und 390 px, ohne dass man scrollt. Die Seite ist nicht breiter als 844 px.

## Fehlgeschlagen, wenn

Die Rückfrage ist nach dem Drehen ganz oder teilweise unter 390 px und erst nach Scrollen zu sehen.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Produktionsbuild, Playwright-Kontext der Geräteklasse `handy-hochkant` aus `scripts/pruefung/geraeteklassen.mjs` |
| Ausgangslage | Local Storage leer |

## Testdaten

Fenster 390×844 mit Touch, danach `setViewportSize({ width: 844, height: 390 })`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Lobby | „Neue Partie“ antippen | | Spieltisch „Spieltisch im Aufbau“ |
| 2 | Lobby | Startseite neu öffnen, „Neue Partie“ antippen | `/` | Rückfrage „Es läuft schon eine Partie …“ sichtbar |
| 3 | Playwright | Fenster drehen | `setViewportSize({ width: 844, height: 390 })` | Lage der Rückfrage mit `getBoundingClientRect()` lesen |
| 4 | Lobby | „Abbrechen“ antippen | | „Weiterspielen“ ist noch da |

## Zurücksetzen

Local Storage löschen (`localStorage.clear()`); danach zeigt die Lobby kein „Weiterspielen“.
