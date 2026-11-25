---
id: TF-TISCH-049
titel: Bei 568 × 320 liegt auch dann alles im Bild, wenn du am Zug bist und „Zug beenden“ mit Grund gesperrt ist oder eine Häutung ordnest.
art: manuell
regression: nein
prioritaet: niedrig
herkunft: aenderung
angelegt: 2026-11-25
veraendert_daten: ja
aenderung: task/O11-barrierefreiheit (PR #121)
grenzfall_von: TF-TISCH-001
---

## Worum es geht

TF-TISCH-004 misst 568 × 320 im Volltisch, wenn ein Gegner am Zug ist. Bist du selbst am Zug, steht in der Zugleiste der Grund, warum „Zug beenden“ gesperrt ist, und beim Ordnen der Häutung „Ausführen“. Beides braucht Höhe, die das Fenster kaum hat.

## Bestanden, wenn

Bei 568 × 320 mit Touch liegen Zugleiste und dein Platz (Schlangen, Hand) ganz zwischen 0 und 320 px oder lassen sich dorthin scrollen, „Ausführen“ der Häutung ist erreichbar, kein Text der Zugleiste wird verdeckt, und das Zeichen „mehr ↓“ liegt nicht auf „Zur Lobby“.

## Fehlgeschlagen, wenn

Ein Teil der Zugleiste, der Hand oder „Ausführen“ liegt unter 320 px und lässt sich nicht hinscrollen, oder ein Text wird verdeckt.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build, Stand ab Commit 5634c28, Playwright Chromium mit Touch (`hasTouch`, `isMobile`), Fenster 568 × 320 |

## Testdaten

Szenarien `farbkarte-beim-gegner` (du bist dran, noch keine Karte gespielt) und `haeutung-punkte`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Adresse | öffnen | `/spiel?szenario=farbkarte-beim-gegner&tempo=sofort` | „Du bist dran“, „Zug beenden“ gesperrt mit Grund |
| 2 | Konsole | Kästen von `.st-zugleiste`, `.st-unten`, `.st-hand-karten` und `document.scrollingElement.scrollHeight` lesen | | Unterkante höchstens 320 px oder die Seite scrollt |
| 3 | Bild | ansehen | | Satz der Zugleiste ganz, „mehr ↓“ nicht über „Zur Lobby“ |
| 4 | Adresse | öffnen | `/spiel?szenario=haeutung-punkte&tempo=sofort` | |
| 5 | Tisch | Häutung, „Deine Schlange 1 wählen“, Karte 1 und Karte 3 antippen | | „Ausführen“ im Bild oder erreichbar |

## Zurücksetzen

Ein neues Szenario setzt den Stand zurück.

## Nicht abgedeckte Grenzfälle

Andere sehr kleine Fenster (etwa 640 × 360) sind nicht geprüft. 568 × 320 liegt unter allen fünf Geräteklassen; ob es unterstützt werden muss, hat der Autor nicht festgelegt.
