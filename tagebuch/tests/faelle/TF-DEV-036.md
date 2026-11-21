---
id: TF-DEV-036
titel: In den zehn Szenarien ki-* spielt der Knopf „KI-Schritt (solide)“ am Entwicklertisch genau das, was das Szenario unter „Erwartet“ nennt.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
aenderung: task/K2-solide-ki (PR #71)
---

## Worum es geht

K2 verlangt jedes Kriterium auch am Entwicklertisch. Die Szenarien `ki-*` stellen je eine Lage her, in der KI-Gegner 1 am Zug ist. Der Tester klickt den Knopf der soliden KI und liest im Verlauf ab, was sie gespielt hat.

## Bestanden, wenn

Der Verlauf jedes Szenarios zeigt den Zug aus „Erwartet“: etwa bei `ki-dreiergruppe` „FarbkarteLegen: Mondranke (violett-09) → schlange-1 anfang“ und danach „ZugBeenden“ mit 6 Gruppenpunkten, bei `ki-verdoppler` Rot, Verdoppler, „ZugBeenden“, Blau, „ZugBeenden“ und am Ende Rot×3 und Blau×3. Die Konsole zeigt keinen Fehler, die Seite ist nicht breiter als das Fenster.

## Fehlgeschlagen, wenn

Ein Szenario einen anderen Zug zeigt als erwartet, etwa eine Regenbogenschlange in schlange-2 bei `ki-regenbogen-eigene` oder eine Fusion bei `ki-fusion-senkt`, oder die Konsole einen Fehler meldet.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build (`npm run build:testhooks`), ausgeliefert mit `vite preview --outDir dist-testhooks`, Fenster 1280×900 |

## Testdaten

Szenarien `ki-dreiergruppe`, `ki-dreiergruppe-joker`, `ki-dreiergruppe-ausnahme`, `ki-farbe-und-sonderkarte`, `ki-regenbogen-eigene`, `ki-fusion-senkt`, `ki-grube-ohne-zug`, `ki-grube-schlussrunde`, `ki-wirkungslos`, `ki-verdoppler`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Adresszeile | Seite öffnen | `/dev?szenario=ki-dreiergruppe` | Überschrift „Szenario ki-dreiergruppe“, Hinweis „KI-Gegner 1 entscheidet; das ist eine KI.“ |
| 2 | Knopf „KI-Schritt (solide)“ | klicken, bis der Hinweis „Spieler 1 entscheidet; das ist ein Mensch.“ oder „Die Partie ist beendet.“ zeigt | | jeder Klick fügt im Verlauf genau eine Zeile „KI-Schritt (solide): …“ an |
| 3 | Abschnitt „Verlauf“ und „Wertung“ | lesen | | Züge und Summe wie unter „Erwartet“ im gelben Kasten des Szenarios |
| 4 | Adresszeile | Schritte 1 bis 3 für jedes weitere Szenario aus den Testdaten | `/dev?szenario=<name>` | wie oben |

## Nicht abgedeckte Grenzfälle

Andere Geräteklassen: Der Entwicklertisch ist ein Prüfwerkzeug, K2 ändert dort nur einen Knopf. Ein Szenario, in dem der Mensch abwehren muss, gibt es unter `ki-*` nicht.
