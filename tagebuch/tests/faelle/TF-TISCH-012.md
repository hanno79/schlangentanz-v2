---
id: TF-TISCH-012
titel: In allen fünf Geräteklassen zeigt der Tisch Abwehrfrage, Spielende und deinen ersten Zug mit passender Statuszeile, ohne waagrechtes Scrollen.
art: manuell
regression: ja
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: ja
aenderung: task/O3-partie-steuerung (PR #70)
---

## Worum es geht

Die Partie-Steuerung bringt drei Lagen an den Tisch: Du musst über eine Abwehr entscheiden, die KI-Gegner spielen die Partie allein zu Ende, oder du bist am Zug und die KI wartet. In jeder Geräteklasse soll die Statuszeile sagen, was los ist, und die Seite soll ins Fenster passen.

## Bestanden, wenn

In jeder Klasse zeigt `angriff-auf-dich` „KI-Gegner 1 spielt Schlangengrube“ und „Du entscheidest, ob du abwehrst.“; über „Zur Lobby“ und „Weiterspielen“ kommt dieselbe Frage zurück. `schlussrunde-ohne-dich` endet mit „Die Partie ist beendet.“. Eine Partie aus Saat 7 mit vier Spielern zeigt „Du bist dran“, „Spiele Karten aus deiner Hand.“, drei Gegner mit je 5 Handkarten, Stapel 88, und nach zwei Sekunden ist der Stand unverändert. `scrollWidth` ist überall gleich `clientWidth`, die Konsole bleibt ohne Fehler.

## Fehlgeschlagen, wenn

Eine Statuszeile fehlt oder stimmt nicht, die KI spielt, während du dran bist, Text ist abgeschnitten, die Seite scrollt waagrecht, oder die Konsole meldet einen Fehler.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build, Playwright Chromium mit den Geräteklassen aus `scripts/pruefung/geraeteklassen.mjs`, Touch bei Tablet und Handy, Stand ab Commit 249aebb |
| Ausgangslage prüfen | Leerer Local Storage je Klasse |

## Testdaten

Adressen `/spiel?szenario=angriff-auf-dich`, `/spiel?szenario=schlussrunde-ohne-dich&tempo=sofort`, `/spiel?seed=7&spieler=4`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser, je Geräteklasse | Adresse öffnen | `/spiel?szenario=angriff-auf-dich` | Frage in der Statuszeile, fünf Handkarten |
| 2 | Kopfleiste | „Zur Lobby“ antippen oder klicken, dann „Weiterspielen“ | | dieselbe Frage, Adresse `/spiel` |
| 3 | Browser | Adresse öffnen | `/spiel?szenario=schlussrunde-ohne-dich&tempo=sofort` | „Die Partie ist beendet.“ |
| 4 | Browser | Adresse öffnen, zwei Sekunden warten | `/spiel?seed=7&spieler=4` | „Du bist dran“, Stapel 88, nichts ändert sich |
| 5 | Konsole | `scrollWidth` und `clientWidth` lesen, Konsole ansehen | | gleich, keine Fehler |

## Zurücksetzen

Kontext je Klasse schliessen.

## Nicht abgedeckte Grenzfälle

Breiten zwischen den Klassen: nicht geprüft, das Layout gehört zu O4 (TF-TISCH-001 bis TF-TISCH-004). 320 px: TF-TISCH-011. Drehen: TF-TISCH-008.
