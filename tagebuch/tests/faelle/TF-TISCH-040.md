---
id: TF-TISCH-040
titel: Eine ganze Partie gegen die solide KI läuft bis zur Wertung, jeder Gegnerschritt steht einzeln im Protokoll, und am Tisch steht nie „Spieler 1“.
art: manuell
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-22
veraendert_daten: nein
aenderung: task/O6-gegnerzuege (PR #79)
---

## Worum es geht

O6 bringt die solide KI an den Tisch, das Protokoll, „Schneller“, die Abwehrfrage und das Aussetzen. In einer echten Partie müssen alle diese Teile zusammenspielen und am Ende die Wertung aus O8 erscheinen.

## Bestanden, wenn

Die Partie endet mit „KI-Gegner … gewinnt!“ (oder „Gleichstand“), „Zur Lobby“ und „Noch einmal“. Jeder Gegnerschritt steht mit Karte und Ziel in der Zugleiste und im Protokoll, etwa „KI-Gegner 1 spielt: Rot an das Ende deiner Schlange 1.“. Zwischen zwei Gegnerschritten vergehen etwa 700 ms, mit „Schneller“ etwa 250 ms. Kein Text auf der Seite enthält „Spieler 1“, die Konsole zeigt keinen Fehler, und die Seite ist nie breiter als das Fenster.

## Fehlgeschlagen, wenn

Die Partie bleibt stehen oder endet ohne Wertung, ein Gegnerschritt fehlt im Protokoll, „Spieler 1“ erscheint, die Konsole meldet einen Fehler oder die Seite scrollt waagrecht.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build, Stand ab Commit fde8e51, alle fünf Geräteklassen |

## Testdaten

`/spiel?seed=1&spieler=2&erweiterung=0` (KI-Saat fest über `kiSaatquelle`), weitere Saaten mit 3 und 4 Spielern und mit Erweiterung.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser | Adresse öffnen | `/spiel?seed=1&spieler=2&erweiterung=0` | „Du bist dran“, Protokoll „Noch kein Schritt“ |
| 2 | Deine Hand | in jedem Zug eine Karte, ein Ziel, „Ausführen“, „Zug beenden“ | | Gegnerschritte einzeln, je mit Satz in der Zugleiste |
| 3 | Zugleiste | während eines Gegnerzugs „Schneller“ drücken | | Knopf gedrückt, Gegnerschritte kommen schneller |
| 4 | Zugleiste | bei einer Abwehrfrage „Abwehren“ oder „Durchlassen“ wählen | | Frage mit Angreifer, Karte und Ziel |
| 5 | Tisch | bis zum Ende spielen | | Wertung mit „Noch einmal“ |
| 6 | Wertung | „Noch einmal“ | | neue Partie mit gleicher Spielerzahl, Protokoll „Noch kein Schritt“ |

## Nicht abgedeckte Grenzfälle

Ob eine Abwehr oder ein Aussetzen vorkommt, hängt vom Verlauf ab; beides prüfen TF-TISCH-037 und TF-TISCH-038 gezielt. Nach dem Neuladen beginnt das Protokoll leer; das ist bekannt und nicht Teil dieses Testfalls.
