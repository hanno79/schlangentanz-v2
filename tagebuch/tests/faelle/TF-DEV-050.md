---
id: TF-DEV-050
titel: Lädt man /spiel mitten in einer offenen Entscheidung neu, steht im gespeicherten Spielstand dieselbe Entscheidung mit derselben aufgedeckten Karte.
art: manuell
regression: nein
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-23
veraendert_daten: ja
aenderung: task/X3-zusatzaktionen (PR #108)
---

## Worum es geht

Eine Partie muss sich mitten in einer Entscheidung speichern und laden lassen (X3, Kriterium 3). Der Entwicklertisch legt beim Neuladen das Szenario neu an; den gespeicherten Spielstand hat nur der Spieltisch unter `/spiel`.

## Bestanden, wenn

Vor und nach dem Neuladen steht unter `localStorage["schlangentanz-v2:partie"]` dieselbe Entscheidung: Art „Test: Gegner wählen“, Entscheider 0, Optionen spieler-2 und spieler-3, aufgedeckt violett-06, am Zug Spieler 1. Der Tisch lädt ohne Konsolenfehler.

## Fehlgeschlagen, wenn

Nach dem Neuladen fehlt die Entscheidung oder die aufgedeckte Karte, der Tisch zeigt einen Fehler, oder die Konsole meldet einen.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build, Desktop 1280×900, Stand ab Commit 686159e |

## Testdaten

Szenario `entscheidung-gegner`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Adresse | öffnen | `/spiel?szenario=entscheidung-gegner&tempo=sofort` | Kopf „Du bist dran“ |
| 2 | Entwicklerwerkzeuge, Speicher | `localStorage` lesen | Schlüssel `schlangentanz-v2:partie` | `entscheidung.art` „Test: Gegner wählen“, `aufgedeckt` mit violett-06 |
| 3 | Browser | Seite neu laden | | wieder „Du bist dran“ |
| 4 | Entwicklerwerkzeuge, Speicher | `localStorage` erneut lesen | | Inhalt gleich wie in Schritt 2 |

## Zurücksetzen

In der Lobby eine neue Partie starten oder `localStorage` leeren; danach zeigt `/spiel` keine Entscheidung mehr.

## Nicht abgedeckte Grenzfälle

Bedienen lässt sich die Entscheidung am Tisch noch nicht; das baut O10. Neuladen vor der Wahl des Gegners prüfen die Engine-Tests (`entscheidung.test.ts`, „X3/E4 Kriterium 8“).
