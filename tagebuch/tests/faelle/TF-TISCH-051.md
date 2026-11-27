---
id: TF-TISCH-051
titel: Eine ganze Partie mit Erweiterung lässt sich am Desktop von Hand spielen, mit Risiko-Karte, Gegnerwahl und geheimer Aufgabe, und keine fremde Handkarte steht im Seitenquelltext.
art: manuell
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-27
veraendert_daten: ja
aenderung: task/O10-erweiterung-tisch (PR #124)
---

## Worum es geht

Mit der Erweiterung kommen Risiko-Karten, Comeback-Karte, Schlangenkorb und Aufgaben an den Tisch. Ein Mensch spielt eine ganze Partie gegen zwei KI-Gegner und setzt dabei die Risiko-Karte zweimal ein, einmal mit Erfolg und einmal mit Misserfolg. Geprüft wird, dass er nie festhängt, dass jede Entscheidung bedienbar ist und dass das Protokoll sagt, was geschah.

## Bestanden, wenn

Die Partie endet mit der Wertung. Risiko-Aktion 2 mit Erfolg zeigt die Ansage mit der angesagten Karte, im Protokoll die aufgedeckte Karte mit Punkten und „Erfolg“, danach legt der Mensch die zusätzliche Farbkarte mit Karte und Ende an. Risiko-Aktion 1 mit Misserfolg zeigt die aufgedeckte Sonderkarte unter „Aufgedeckt“ und fragt nach dem Gegner; „Zug beenden“ steht dabei nicht da. Eine erfüllte geheime Aufgabe zeigt in „Deine Auslage“ „geheim, erfüllt“. Nach jedem Schritt steht keine Id einer fremden Handkarte im Seitenquelltext, und die Seite ist nie breiter als 1280 px.

## Fehlgeschlagen, wenn

Die Partie bleibt stehen, eine Entscheidung hat keinen Knopf, das Protokoll nennt eine offene Karte als „verdeckte Karte“, oder eine fremde Handkarten-Id steht im Quelltext.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build, eigener Vorschau-Server, Stand ab Commit 4ad16f8 |
| Ausgangslage prüfen | Lobby zeigt „Mit Erweiterung“ und „2 Gegner“ |

## Testdaten

Lobby: 2 Gegner, Erweiterung an. Fenster 1280 × 900.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Lobby | „2 Gegner“, Schalter „Mit Erweiterung“ an, „Neue Partie“ | | Tisch mit „Deine Auslage“ und „Offene Aufgaben“ |
| 2 | Deine Hand | eine Farbkarte, „Neue Schlange“, „Ausführen“ | | Schlange liegt, „Risiko spielen“ in der Zugleiste |
| 3 | Zugleiste | „Risiko spielen“, „Aktion 2: Farbkarte spielen“, eine Farbkarte der Hand antippen | | Ansage „Risiko-Belohnungs-Karte: Aktion 2 …, angesagt: <Farbe>.“ |
| 4 | Zugleiste | „Ausführen“ | | bei Erfolg: „Erfolg: Lege eine Farbkarte deiner Hand an ein Ende deiner Schlange.“, Statuszeile „Du entscheidest.“ |
| 5 | Hand, Schlange | Farbkarte, Ende der Schlange, „Ausführen“ | | Protokoll „Du legst eine zusätzliche Farbkarte an.“ |
| 6 | Zugleiste | im nächsten Zug „Risiko spielen“, „Aktion 1: Karten ziehen“, „Ausführen“ | | bei Misserfolg Karte unter „Aufgedeckt“, Knöpfe „KI-Gegner 1“, „KI-Gegner 2“ |
| 7 | Zugleiste | einen Gegner wählen, „Ausführen“ | | Protokoll „Du wählst … als begünstigten Gegner.“ und „<Karte> kommt auf die Hand von …“ |
| 8 | Tisch | weiterspielen bis zur Wertung | | Seite bleibt 1280 px breit; Wertung mit Aufgaben je Spieler |

## Zurücksetzen

„Zur Lobby“ und eine neue Partie; der Spielstand liegt nur im Browser.

## Nicht abgedeckte Grenzfälle

Ob Aufdecken Erfolg oder Misserfolg bringt, hängt vom Stapel ab; ist es nicht so gekommen wie in den Schritten, deckt TF-TISCH-052 die andere Seite über ein Szenario ab. Die Comeback-Karte kommt in einer normalen Partie selten in Frage; sie hat TF-TISCH-054. Den Korb zieht der Mensch nicht in jeder Partie; er hat TF-TISCH-053.
