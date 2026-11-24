---
id: TF-DEV-054
titel: Die vier Risiko-Szenarien am Entwicklertisch zeigen die Knöpfe und Ergebnisse, die ihre Beschreibung erwartet.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-24
veraendert_daten: nein
aenderung: task/X5-risiko (PR #117)
---

## Worum es geht

Am Entwicklertisch lassen sich die Risiko-Karten in vier vorbereiteten Stellungen ausprobieren. Der Tester klickt die Schritte nach und vergleicht, was er sieht, mit dem Text „Erwartet“ des Szenarios.

## Bestanden, wenn

`risiko-erfolg`: sechs Risiko-Knöpfe; nach Aktion 2 mit Feuerkeim (rot-01) wird blau-02 aufgedeckt, „Erfolg“, dann sechs Knöpfe nur für schlange-1; nach dem Anlegen kein Risiko-Knopf mehr, „ZugBeenden“ da, Verdoppler noch da. `risiko-misserfolg`: Aktion 2 mit blau-05, Schlangenfrass auf den eigenen Ablagestapel, Wahl spieler-2 oder spieler-3, dann entscheidet KI-Gegner 1 mit „geplante“ oder „stapel“. `risiko-letzte-karte`: der Gegner zieht mit „stapel“ die letzte Karte, „SchlussrundeBegonnen: ausgelöst von Spieler 1“. `risiko-schlussrunde`: kein Risiko-Knopf. Überall „Invarianten (alle erfüllt)“ und keine Konsolenfehler.

## Fehlgeschlagen, wenn

Ein Knopf fehlt oder ist zu viel, ein Ergebnis weicht vom erwarteten Text ab, eine Invariante ist verletzt oder die Konsole meldet einen Fehler.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build des geprüften Stands mit `vite preview`, Fenster 1280×900 |

## Testdaten

Adressen `/dev?szenario=risiko-erfolg`, `risiko-misserfolg`, `risiko-letzte-karte`, `risiko-schlussrunde`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | `/dev?szenario=risiko-erfolg` | Knopf „RisikoKarteSpielen: Aktion 2 … benennt Feuerkeim (rot-01)“ klicken |  | Ereignis „aufgedeckt blau-02: Erfolg“, sechs Knöpfe „Entscheiden“ mit schlange-1 |
| 2 | dasselbe | „Entscheiden: Feuerkeim (rot-01) · schlange-1 · ende“ klicken |  | rot-01 am Ende von schlange-1, „ZugBeenden“ und „VerdopplerSpielen“ angeboten, kein Risiko-Knopf |
| 3 | `/dev?szenario=risiko-misserfolg` | Aktion 2 mit Wasserwirbel (blau-05) klicken, dann „Entscheiden: KI-Gegner 1 (spieler-2)“ |  | „KI-Gegner 1 entscheidet“, Knöpfe „geplante“ und „stapel“ |
| 4 | dasselbe | „KI-Schritt (solide)“ klicken |  | KI-Gegner 1 hält 6 Karten, darunter blau-05; Spieler 1 entscheidet wieder |
| 5 | `/dev?szenario=risiko-letzte-karte` | Aktion 2 mit blau-04, „spieler-2“, dann „Entscheiden: stapel“ |  | „SchlussrundeBegonnen: ausgelöst von Spieler 1“, Nachziehstapel 0 Karten |
| 6 | `/dev?szenario=risiko-schlussrunde` | Seite lesen |  | Partiephase Schlussrunde, beide Risiko-Karten offen vor Spieler 1, kein Knopf „RisikoKarteSpielen“ |

## Nicht abgedeckte Grenzfälle

Aktion 1, 3 und 4 sind in den Szenarien nur mit Tests geprüft, nicht mit Klicks; das deckt TF-ENGINE-080 ab.
