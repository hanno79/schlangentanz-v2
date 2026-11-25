---
id: TF-TISCH-050
titel: In Handy quer bleibt der Tischfläche mit gewählter Karte und beim Ordnen der Häutung genug Höhe, und der Grund für ein gesperrtes „Zug beenden“ kommt nach „Abbrechen“ zurück.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-25
veraendert_daten: ja
aenderung: task/O11-barrierefreiheit (PR #121)
---

## Worum es geht

In Handy quer (844 × 390) nahm der dreizeilige Grund neben dem gesperrten „Zug beenden“ der Tischfläche die meiste Höhe. Seit O11 entfällt der gesperrte Knopf samt Grund, solange eine Karte gewählt ist. Geprüft wird, ob die Tischfläche dadurch Platz gewinnt und ob der Grund zurückkommt, sobald keine Karte mehr gewählt ist.

## Bestanden, wenn

Mit gewählter Karte misst die Tischfläche mindestens 200 px, beim Ordnen der Häutung mindestens 150 px. Nach „Abbrechen“ steht „Zug beenden“ wieder gesperrt da, mit dem Grund „Du musst erst mindestens eine Karte spielen; …“ daneben und als Beschreibung des Knopfs.

## Fehlgeschlagen, wenn

Die Tischfläche ist kleiner, oder der Grund fehlt nach „Abbrechen“.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build, Stand ab Commit 5634c28, Playwright Chromium mit Touch, Fenster 844 × 390 |

## Testdaten

Szenarien `farbkarte-beim-gegner` und `haeutung-punkte`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Adresse | öffnen | `/spiel?szenario=farbkarte-beim-gegner&tempo=sofort` | „Zug beenden“ gesperrt, Grund daneben |
| 2 | „Deine Hand“ | „Farbkarte Rot, 1 Punkt“ antippen | | „Zug beenden“ und Grund verschwinden, Tischfläche ≥ 200 px |
| 3 | Zugleiste | „Abbrechen“ | | „Zug beenden“ gesperrt mit Grund wieder da |
| 4 | Adresse | öffnen | `/spiel?szenario=haeutung-punkte&tempo=sofort` | |
| 5 | Tisch | Häutung, „Deine Schlange 1 wählen“, Karte 1 und Karte 3 antippen | | Tischfläche ≥ 150 px |

## Zurücksetzen

Ein neues Szenario setzt den Stand zurück.

## Nicht abgedeckte Grenzfälle

Ob Spieler verstehen, warum „Zug beenden“ während einer Auswahl fehlt, lässt sich nicht messen; das beurteilt ein Mensch. Ein bedienbares „Zug beenden“ mit gewählter Karte (etwa nach einem Verdoppler) ist nicht im Browser geprüft; die Regel in `quer.css` blendet nur `.st-mitgrund--gesperrt` aus.
