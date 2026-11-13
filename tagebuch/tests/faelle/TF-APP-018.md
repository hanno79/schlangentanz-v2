---
id: TF-APP-018
titel: Auf einem sehr kleinen Handy quer (568×320) liegt die Lobby mit laufender Partie oder offener Rückfrage ganz im Bild.
art: manuell
regression: nein
prioritaet: niedrig
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: ja
aenderung: task/O2b-lobby-flach (PR #35)
grenzfall_von: TF-APP-003
---

## Worum es geht

568×320 ist das kleinste verbreitete Querformat (iPhone SE der ersten Generation). Es ist kleiner als jede der fünf Geräteklassen. Ob die Lobby dort ohne Scrollen bedienbar sein muss, hat der Autor nicht festgelegt. Der Testfall hält fest, wie sie sich dort verhält.

## Bestanden, wenn

Bei 568×320 mit Touch liegen mit laufender Partie und mit offener Rückfrage alle Knöpfe und die ganze Rückfrage zwischen 0 und 320 px, und kein Knopftext bricht mitten im Wort um.

## Fehlgeschlagen, wenn

„Neue Partie“, „Weiterspielen“ oder ein Teil der Rückfrage liegt ausserhalb von 0 bis 320 px, oder ein Knopftext bricht mitten im Wort um (etwa „Abbreche“ / „n“).

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Produktionsbuild, Playwright Chromium mit Touch (`hasTouch`, `isMobile`) |
| Ausgangslage | Local Storage leer |

## Testdaten

Fenster 568×320.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Lobby | „Neue Partie“ antippen, Zurück | `/` | Lage von „Neue Partie“ |
| 2 | Lobby | „Neue Partie“ antippen | | Lage der Rückfrage und von „Weiterspielen“, Umbruch von „Abbrechen“ |

## Zurücksetzen

Local Storage löschen.
