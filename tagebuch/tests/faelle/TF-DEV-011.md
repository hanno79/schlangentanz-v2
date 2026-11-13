---
id: TF-DEV-011
titel: erweiterung=1 baut am Entwicklertisch eine Partie mit Erweiterung, erweiterung=0 eine ohne.
art: manuell
regression: ja
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
aenderung: task/E1-struktur (PR #31)
---

## Worum es geht

Seit E1 kennt die Engine den Erweiterungs-Schalter. Der Entwicklertisch muss ihn aus der Adresse übernehmen, sonst prüft man am Tisch immer nur das Basis-Spiel. TF-DEV-006 hielt das Gegenteil fest, als die Engine den Schalter noch nicht kannte.

## Bestanden, wenn

`/dev?seed=8&spieler=3&erweiterung=1` zeigt „Erweiterung mit“, 97 Karten im Nachziehstapel, „Offene Aufgaben (3)“, „Aufgabenstapel: 9 Karten“ und je Spieler eine geheime Aufgabe, eine Comeback- und zwei Risiko-Karten. `/dev?seed=7&spieler=2&erweiterung=0` zeigt „Erweiterung ohne“, 98 im Nachziehstapel, keine Aufgaben, zweimal geladen dieselbe erste Handkarte. Alle Invarianten sind erfüllt.

## Fehlgeschlagen, wenn

Die Erweiterung fehlt trotz `erweiterung=1`, oder Aufgaben erscheinen ohne Erweiterung.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build, Port 4174 |

## Testdaten

Saat 8 mit 3 Spielern und Erweiterung, Saat 7 mit 2 Spielern ohne Erweiterung, Saat 5 mit der ungültigen Spielerzahl 5.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Adresszeile | öffnen | `/dev?seed=8&spieler=3&erweiterung=1` | Werte wie unter „Bestanden, wenn“ |
| 2 | Adresszeile | zweimal öffnen | `/dev?seed=7&spieler=2&erweiterung=0` | gleiche erste Handkarte, keine Aufgaben |
| 3 | Adresszeile | öffnen | `/dev?seed=5&spieler=5&erweiterung=0` | rote Meldung „Parameter spieler muss eine Zahl von 2 bis 4 sein“ |

## Nicht abgedeckte Grenzfälle

Keine.
