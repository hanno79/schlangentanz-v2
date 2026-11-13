---
id: TF-APP-008
titel: Auf dem gedrehten Handy (844×390) passt die Lobby mit laufender Partie und offener Rückfrage ganz ins Bild, ohne Scrollen.
art: beides
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: ja
aenderung: task/O2-app-rahmen-lobby (PR #29)
skript: tests/layout/lobby.spec.ts
grenzfall_von: TF-APP-003
---

## Worum es geht

Mit laufender Partie und offener Rückfrage ist die Lobby am längsten. Bis O2b war sie bei 390 px Höhe einspaltig und 623 px hoch, „Regeln“ lag unter dem Bildrand. Seit O2b steht sie im Querformat zweispaltig, und alles soll ohne Scrollen im Bild liegen. Den Zustand misst auch der Layout-Vertrag „O2: Lobby mit offener Rückfrage vor einer neuen Partie“ in `handy-quer`.

## Bestanden, wenn

Bei 844×390 mit Touch ist die Seite so breit wie das Fenster (844 px) und nicht höher als 390 px. „Weiterspielen“, die Gegnerzahl 1, 2 und 3, der Schalter „Mit Erweiterung“, die Rückfrage mit „Ja, neue Partie“ und „Abbrechen“ und „Regeln“ liegen ganz zwischen 0 und 390 px, jede Tippfläche ist mindestens 44 × 44 px.

## Fehlgeschlagen, wenn

Ein Bedienelement oder ein Teil der Rückfrage ragt unten über 390 px oder oben über 0 px hinaus, die Seite scrollt senkrecht oder steht seitlich über.

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
| 2 | Lobby | nichts wischen, nur ansehen | | Rückfrage, „Weiterspielen“ und „Regeln“ ganz sichtbar; die Seite lässt sich nicht verschieben |

## Zurücksetzen

Local Storage löschen.
