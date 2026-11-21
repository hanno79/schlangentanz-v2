---
id: TF-TISCH-013
titel: Jede Karte lässt sich am Tisch ohne Liste spielen, mit genau den Zielen der Engine und einer Ansage, die erst „Ausführen“ spielt.
art: manuell
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: ja
aenderung: task/O5-karten-spielen (PR #73)
---

## Worum es geht

Du spielst eine Karte, indem du sie in der Hand antippst und danach die markierten Ziele am Tisch. Markiert sein darf nur, was die Engine erlaubt. Ist alles gewählt, sagt die Zugleiste in einem Satz, was passieren wird, und erst „Ausführen“ verändert den Spielstand. Das soll für die Farbkarte und jede Sonderkarte der Basis gelten, mit der Maus und mit dem Finger, in allen fünf Geräteklassen.

## Bestanden, wenn

In jeder Klasse und für jeden der 14 Wege unter „Testdaten“ gilt: Nach dem Antippen der Karte sind genau die Ziele markiert, die der Entwicklertisch für dieses Szenario als Aktionen nennt (geprüft bei `farbkarte-beim-gegner`: Rot hat 6 Ziele, und bei `farbendieb`: erst die 2 Karten des Gegners, dann die Stellen 0, 1 und 2 deiner Schlange). Vor „Ausführen“ ist der gespeicherte Spielstand Zeichen für Zeichen derselbe wie beim Laden. Nach „Ausführen“ zeigt der Tisch das erwartete Ergebnis, etwa „Deine Schlange 1: 3 Karten, Farbgruppen Gelb (3)“ nach dem Farbendieb. Nach dem Verdoppler, einer Farbkarte und „Zug beenden“ steht in der Statuszeile „Zweiter Zug nach dem Verdoppler“. Jedes Ziel misst mindestens 44 × 44 px, die Seite scrollt nicht waagrecht, und die Konsole bleibt ohne Fehler.

## Fehlgeschlagen, wenn

Ein Ziel fehlt oder ist zu viel, der Spielstand ändert sich vor „Ausführen“, der Tisch zeigt nach dem Ausführen etwas anderes als die Engine, ein Ziel ist kleiner als 44 px oder an seiner Mitte von etwas anderem verdeckt, oder die Konsole meldet einen Fehler.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build (`npm run build:testhooks`), Playwright Chromium mit den Geräteklassen aus `scripts/pruefung/geraeteklassen.mjs`, Touch bei Tablet und Handy, Stand ab Commit 27d85d3 |
| Ausgangslage prüfen | Jeder Weg in einem neuen Browserkontext mit leerem Local Storage |

## Testdaten

Je Weg die Adresse `/spiel?szenario=<name>&tempo=sofort`, die Karte und die Ziele in dieser Reihenfolge:

| Weg | Szenario | Karte | Ziele |
|---|---|---|---|
| Farbkarte beim Gegner | `farbkarte-beim-gegner` | Farbkarte Rot, 1 Punkt | KI-Gegner 1, Schlange 1: Ende |
| Farbendieb | `farbendieb` | Sonderkarte Farbendieb | KI-Gegner 1, Schlange 1, Karte 2; Deine Schlange 1: hinter Karte 2 |
| Schlangenfrass a) | `frass-eigen` | Sonderkarte Schlangenfrass | a); Deine Schlange 1, Karte 4 |
| Schlangenfrass b) | `frass-eigen` | Sonderkarte Schlangenfrass | b); Deine Schlange 1, Karte 3 (Schlangenblockade) |
| Schlangenfrass c), zwei Spieler | `frass-zwei-spieler` | Sonderkarte Schlangenfrass | c); KI-Gegner 2, Karte 3; KI-Gegner 1, Karte 1 |
| Schlangenfrass c), ein Spieler | `frass-zwei-spieler` | Sonderkarte Schlangenfrass | c); KI-Gegner 2, Karte 1 und Karte 2 |
| Schlangenfrass a) auf Fusion | `frass-fusion` | Sonderkarte Schlangenfrass | a); Deine Schlange 1, Karte 2 (Farbenfusion) |
| Schlangenblockade | `blockade-abwehr` | Sonderkarte Schlangenblockade | KI-Gegner 1, Schlange 1 wählen; zwischen Karte 1 und 2 |
| Regenbogenschlange | `regenbogen` | Sonderkarte Regenbogenschlange | Deine Schlange 1 wählen; zwischen Karte 2 und 3 |
| Farbenfusion | `fusion-eigen` | Sonderkarte Farbenfusion | Deine Schlange 1, Karte 4, dann Karte 3 |
| Farbenfusion beim Gegner | `fusion-beim-gegner` | Sonderkarte Farbenfusion | das erste angebotene Kartenpaar |
| Schlangengrube | `schlangengrube` | Sonderkarte Schlangengrube | KI-Gegner 2 wählen |
| Verdoppler | `verdoppler` | Sonderkarte Verdoppler | keine; danach eine Farbkarte und „Zug beenden“ |
| Ohne Wirkung | `nur-sonderkarten` | Sonderkarte Farbendieb | Ohne Wirkung auf deine Ablage |

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser | Adresse des Wegs öffnen | `/spiel?szenario=<name>&tempo=sofort` | „Du bist dran“, Zugleiste „Wähle eine Karte aus deiner Hand.“ |
| 2 | Deine Hand | Karte des Wegs antippen | | Karte gedrückt und angehoben, Ziele gestrichelt markiert |
| 3 | Zugleiste (nur Schlangenfrass) | Möglichkeit antippen | a), b) oder c) | danach nur Karten dieser Möglichkeit markiert |
| 4 | Tisch | Ziele des Wegs der Reihe nach antippen | | gewählte Ziele in Tinte umrandet, am Ende „Ansage: …“ |
| 5 | Entwicklerwerkzeuge | Local Storage `schlangentanz-v2:partie` lesen | | unverändert seit Schritt 1 |
| 6 | Zugleiste | „Ausführen“ antippen | | Tisch zeigt das Ergebnis, Statuszeile passt |
| 7 | nur Verdoppler | eine Farbkarte an ein Ziel legen, „Ausführen“, „Zug beenden“ | | Statuszeile „Zweiter Zug nach dem Verdoppler“ |

## Zurücksetzen

Browserkontext schliessen; der Spielstand lebt nur im Local Storage dieses Kontexts.

## Nicht abgedeckte Grenzfälle

Schlangenfrass c) mit nur einer möglichen Karte: TF-TISCH-016. Drehen und Neuladen mitten in der Auswahl: TF-TISCH-017. Doppeltipp auf „Ausführen“: TF-TISCH-018. Lange Schlangen und volle Tische: TF-TISCH-015. Die Schlangenhäutung mit Ziel ist bis O7 gesperrt und die Abwehr kommt mit O6; beides wird hier nicht geprüft.
