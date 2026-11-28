---
id: TF-KI-037
titel: Am Entwicklertisch spielt „KI-Schritt (solide)“ die zehn Szenarien zu K4 so, wie ihr Feld „erwartet“ es beschreibt.
art: manuell
regression: nein
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-27
veraendert_daten: nein
aenderung: task/K4-ki-erweiterung (PR #125)
---

## Worum es geht

K4 bringt der soliden KI die Erweiterung bei: Aufgaben, Comeback-Karte, Risiko-Karten, Schlangenkorb und Schlangenhäutung. Zu jedem dieser Fälle gibt es ein Szenario mit und eines ohne Nutzen. Am Entwicklertisch wird mit echten Klicks geprüft, dass die KI nutzt, was etwas bringt, und liegen lässt, was nichts bringt.

## Bestanden, wenn

`ki-aufgabe-offen`: Grün an schlange-1, im Verlauf „AufgabeErfuellt“ für Farbvielfalt. `ki-aufgabe-geheim`: Grün statt Gelb, nach „Zug beenden“ steht die geheime Aufgabe Farbenpracht auf „erfüllt“. `ki-comeback-nutzen`: Comeback-Karte eingesetzt, am Ende Grün ×3 und Blau ×3, Comeback „verbraucht“. `ki-comeback-ohne-nutzen`: Grün an Grün, Grün, kein Comeback. `ki-korb-tausch`: Korb mit „tauschen“, die Schlange ist Blau ×5. `ki-korb-ohne-nutzen`: Grün an Grün, Grün, der Korb bleibt auf der Hand. `ki-risiko-nutzen`: als erste Aktion eine Risiko-Karte mit Aktion 2 oder 3. `ki-risiko-ohne-nutzen`: keine Risiko-Karte, eine Sonderkarte. `ki-haeutung-tanz`: Häutung der letzten fünf Karten zu Rot ×3 und Violett ×3, Schlangentanz geht an KI-Gegner 1. `ki-haeutung-gruppe`: Häutung, danach drei blaue Karten nebeneinander.

## Fehlgeschlagen, wenn

Ein Szenario zeigt eine andere Aktion, als „erwartet“ beschreibt, ein Knopf meldet einen Fehler, oder ein Schritt dauert spürbar länger als eine Sekunde.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Entwicklungsserver aus dem Worktree, `npx vite --port 4297 --strictPort` |
| Ausgangslage prüfen | `http://localhost:4297/dev/szenarien` listet die Szenarien `ki-aufgabe-offen` bis `ki-haeutung-gruppe` |

## Testdaten

Die zehn Szenarien aus `src/entwicklung/szenarienKiErweiterung.ts`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser | Adresse öffnen | `http://localhost:4297/dev?szenario=ki-aufgabe-offen` | Knopf „KI-Schritt (solide)“, Abschnitt „erwartet“ |
| 2 | Entwicklertisch | „KI-Schritt (solide)“ klicken, bis „ZugBeenden“ im Verlauf steht; bei einer Wahl des Gegners erneut klicken |  | Verlauf und Zustand wie unter „Bestanden, wenn“ |
| 3 | Entwicklertisch | Schritte 1 und 2 mit den übrigen neun Szenarien wiederholen | Name in der Adresse ersetzen | je Szenario das Ergebnis aus „Bestanden, wenn“ |

## Nicht abgedeckte Grenzfälle

Die Risiko-Karte hängt von der aufgedeckten Karte ab; geprüft wird nur, dass die KI sie spielt, nicht, was danach kommt. Touch-Geräte entfallen, weil K4 keine Oberfläche ändert.
