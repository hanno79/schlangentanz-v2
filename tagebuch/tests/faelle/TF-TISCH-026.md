---
id: TF-TISCH-026
titel: Nach einer echten Partie führen „Noch einmal“, „Zur Lobby“, Neuladen, „Ergebnis ansehen“ und „Neue Partie“ jeweils dorthin, wo sie sollen, und „Noch einmal“ behält Gegnerzahl und Erweiterung.
art: beides
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
skript: src/ui/spiel/Spielseite.ergebnis.test.tsx
aenderung: task/O8-spielende (PR #77)
---

## Worum es geht

Ist eine Partie zu Ende, braucht der Spieler zwei Wege: dieselbe Partie noch einmal beginnen oder zurück in die Lobby. Die beendete Partie bleibt gespeichert, damit ein Neuladen die Wertung nicht verliert. Die Lobby darf sie aber nie zum Weiterspielen anbieten.

## Bestanden, wenn

Nach den Schritten steht nach dem letzten Zug die Wertung da. Neuladen zeigt dieselbe Wertung. Die Lobby zeigt „Letzte Partie: 1 Gegner, Erweiterung aus, beendet“ mit „Ergebnis ansehen“ und ohne „Weiterspielen“. „Ergebnis ansehen“ führt zur selben Wertung, „Neue Partie“ beginnt ohne Rückfrage. „Noch einmal“ nach `wertung-beispiele` beginnt eine Partie mit 3 Gegnern und Erweiterung, nach `wertung-beispiele-kette` mit 2 Gegnern ohne Erweiterung, jeweils mit leeren Schlangen und „Du bist dran“.

## Fehlgeschlagen, wenn

Nach dem letzten Zug bleibt der Tisch stehen, Neuladen verliert die Wertung, die Lobby bietet „Weiterspielen“ an, „Neue Partie“ fragt nach, oder „Noch einmal“ beginnt mit anderer Gegnerzahl oder Erweiterung.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build, Stand ab Commit 0b0d639 |
| Ausgangslage prüfen | Statuszeile „Du bist dran“, Nachziehstapel 2 |

## Testdaten

Adresse `/spiel?szenario=stapel-fast-leer` (zwei Spieler, zwei Karten im Stapel). Danach `/spiel?szenario=wertung-beispiele` und `/spiel?szenario=wertung-beispiele-kette`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser | Adresse öffnen | `/spiel?szenario=stapel-fast-leer` | „Du bist dran“, Stapel 2 |
| 2 | Deine Hand | eine Farbkarte antippen, dann „Neue Schlange“ | | Zugleiste „Beende deinen Zug.“ |
| 3 | Zugleiste | „Zug beenden“ antippen | | KI-Gegner 1 spielt, Abzeichen „Schlussrunde“, dann wieder „Du bist dran“ |
| 4 | Deine Hand | eine Farbkarte an „Neue Schlange“ oder an das Ende deiner Schlange legen, dann „Zug beenden“ | | Die Wertung erscheint mit beiden Spielern |
| 5 | Browser | neu laden | | Dieselbe Wertung |
| 6 | Wertung | „Zur Lobby“ antippen | | „Letzte Partie: 1 Gegner, Erweiterung aus, beendet“, Knopf „Ergebnis ansehen“, kein „Weiterspielen“ |
| 7 | Lobby | „Ergebnis ansehen“ antippen | | Dieselbe Wertung |
| 8 | Browser | Zurück, dann in der Lobby 3 Gegner und Erweiterung An wählen, „Neue Partie“ antippen | | Keine Rückfrage, Tisch mit drei Gegnern |
| 9 | Browser | Adresse öffnen | `/spiel?szenario=wertung-beispiele` | Wertung mit vier Spielern |
| 10 | Wertung | „Noch einmal“ antippen | | Tisch mit drei Gegnern, „Du bist dran“, „Deine Schlangen 0 Punkte“ |
| 11 | Browser | Adresse öffnen, dann „Noch einmal“ | `/spiel?szenario=wertung-beispiele-kette` | Tisch mit zwei Gegnern |

## Technische Prüfung

Nach Schritt 10 und 11 im Speicher `schlangentanz-v2:partie`: `partiephase` „Laufend“, Zahl der KI-Spieler 3 bzw. 2, `erweiterung` true bzw. false, alle Schlangen leer.

## Nicht abgedeckte Grenzfälle

Eine Abwehrfrage an dich in der Schlussrunde: Ohne Abwehrknöpfe (O6) hängt die Partie dort; in zwei von sechs Läufen spielte KI-Gegner 1 eine Schlangengrube auf dich. Zwei Tabs mit derselben Partie: bekannt aus O3 (TF-TISCH-010), nicht Teil von O8. Doppeltipp auf „Noch einmal“: TF-TISCH-031.
