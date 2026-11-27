---
id: TF-TISCH-052
titel: Als begünstigter Gegner wählst du zwischen der angesagten Karte und der obersten Stapelkarte, und die Wahl einer KI steht mit Namen im Protokoll.
art: manuell
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-27
veraendert_daten: ja
aenderung: task/O10-erweiterung-tisch (PR #124)
---

## Worum es geht

Scheitert Risiko-Aktion 2, wählt der begünstigte Gegner zwischen der angesagten Farbkarte und der obersten Stapelkarte (D52). Die angesagte Karte ist für alle offen (D77). Geprüft wird beides: der Mensch als Begünstigter und eine KI als Begünstigte.

## Bestanden, wenn

In `risiko-du-beguenstigt` steht „Du bist begünstigt: Nimm die angesagte Blau von KI-Gegner 1 oder die oberste Karte vom Nachziehstapel.“ mit den Knöpfen „Blau“ (mit Bild) und „Oberste Karte vom Nachziehstapel“, ohne „Zug beenden“. Nach „Blau“ und „Ausführen“ steht im Protokoll „Du wählst die angesagte Karte.“ und „Blau kommt auf deine Hand.“, die Hand hat 5 Karten. In `risiko-misserfolg` mit Aktion 2 und KI-Gegner 1 als Begünstigtem steht „KI-Gegner 1 wählt die angesagte Karte.“ oder die andere Wahl im Protokoll. Am Entwicklertisch steht in der Ereigniszeile „blau-10 (angesagt)“, nirgends „verdeckte Karte“.

## Fehlgeschlagen, wenn

Ein Knopf fehlt, „Zug beenden“ ist bedienbar, die Wahl der KI fehlt im Protokoll, oder eine andere fremde Handkarte steht im Quelltext.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build, Stand ab Commit 4ad16f8 |

## Testdaten

Szenarien `risiko-du-beguenstigt` und `risiko-misserfolg`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Adresse | öffnen | `/spiel?szenario=risiko-du-beguenstigt&tempo=sofort` | Frage und zwei Knöpfe, Statuszeile „KI-Gegner 1 ist dran · Du entscheidest.“ |
| 2 | Zugleiste | „Blau“, dann „Ausführen“ | | Ansage „Du nimmst Blau von KI-Gegner 1.“, danach Protokoll wie oben |
| 3 | Adresse | öffnen | `/spiel?szenario=risiko-misserfolg&tempo=sofort` | |
| 4 | Zugleiste, Hand | „Risiko spielen“, „Aktion 2“, Blau antippen, „Ausführen“ | | „Die Risiko-Aktion ist gescheitert …“ |
| 5 | Zugleiste | „KI-Gegner 1“, „Ausführen“ | | Protokoll nennt die Wahl von KI-Gegner 1 |
| 6 | Adresse | öffnen | `/dev?szenario=risiko-du-beguenstigt`, Knopf `Entscheiden … geplante` | Ereigniszeile „blau-10 (angesagt)“ |

## Zurücksetzen

Jedes Szenario setzt den Stand neu.

## Nicht abgedeckte Grenzfälle

Ein begünstigter Gegner bei leerem Nachziehstapel ist nach D55 ausgeschlossen, weil die Risiko-Karte dann nicht spielbar ist. Aktion 4 mit leerem Ablagestapel des Gegners (D79) ist nicht im Browser geprüft.
