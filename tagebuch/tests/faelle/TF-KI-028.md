---
id: TF-KI-028
titel: Am Entwicklertisch vollendet „KI-Schritt (solide)“ in den K2.1-Szenarien die Gruppe und blockiert den Führenden, und unter /spiel läuft eine Partie mit der KI mehrere Züge ohne Fehler.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-24
veraendert_daten: nein
aenderung: task/K2b-gleichstand (PR #118)
---

## Worum es geht

K2b ändert die Zugsuche der soliden KI. Im Browser wird geprüft, dass sie in den Szenarien zu K2.1 und K3.2 weiter so spielt, wie die Szenarien es erwarten, und dass eine echte Partie am Spieltisch mit ihr läuft.

## Bestanden, wenn

`ki-dreiergruppe`: nach zwei Klicks steht im Verlauf „Mondranke (violett-09) → schlange-1 anfang“ und „ZugBeenden“, die Schlange ist Violett×3 = 6, die Endwertung 11. `ki-dreiergruppe-joker`: Regenbogenschlange an Stelle 0 von schlange-1, dann Braun, dann Zug beenden. `ki-dreiergruppe-ausnahme`: Grün an schlange-1, dann Zug beenden. `ki-blockade-fuehrender`: Blockade an schlange-2 Stelle 1; nach „durchlassen“ fällt Spieler 1 von 13 auf 4. Unter /spiel spielt KI-Gegner 1 in mehreren Zügen Karten, das Protokoll führt sie auf, die Partie erzeugt keine Konsolenfehler, und nichts scrollt waagrecht.

## Fehlgeschlagen, wenn

Ein Szenario zeigt einen anderen Verlauf oder andere Punkte, der Knopf wirft einen Fehler, oder unter /spiel bleibt die KI stehen oder die Seite meldet einen Fehler.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build (`npm run build:testhooks`), `npx vite preview --outDir dist-testhooks --port 4291 --strictPort` |
| Ausgangslage prüfen | `http://localhost:4291/dev/szenarien` listet 88 Szenarien |

## Testdaten

Szenarien `ki-dreiergruppe`, `ki-dreiergruppe-joker`, `ki-dreiergruppe-ausnahme`, `ki-blockade-fuehrender`; in der Lobby 1 Gegner ohne Erweiterung.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser | Adresse öffnen | `http://localhost:4291/dev?szenario=ki-dreiergruppe` | Knopf „KI-Schritt (solide)“ |
| 2 | Entwicklertisch | „KI-Schritt (solide)“ zweimal klicken |  | Abschnitt „Verlauf“ und „Aufschlüsselung der Endwertung“: Violett×3 = 6, Summe 11 |
| 3 | Entwicklertisch | dasselbe mit `ki-dreiergruppe-joker` und `ki-dreiergruppe-ausnahme` | dreimal klicken | Verlauf wie unter „Bestanden, wenn“ |
| 4 | Entwicklertisch | `ki-blockade-fuehrender` laden, einmal „KI-Schritt (solide)“, dann den Reagieren-Knopf mit `"farbenschutzId":null` |  | Endwertung Spieler 1 sinkt von 13 auf 4 |
| 5 | Lobby | `http://localhost:4291/`, „Neue Partie“ |  | Spieltisch „Du bist dran“ |
| 6 | Spieltisch | eine Farbkarte wählen, ein Ziel (+) wählen, „Ausführen“, „Zug beenden“; bei einer Ansage „Durchlassen“; viermal |  | Protokoll zeigt die Züge von KI-Gegner 1, der Stapel sinkt |
| 7 | Konsole des Browsers | Fehler lesen |  | keine Fehler aus der laufenden Partie |

## Nicht abgedeckte Grenzfälle

Die Gleichstand-Stellungen aus den Tests (Saat 651, Schlussrunde 7154) gibt es nicht als Szenario am Entwicklertisch; sie sind nur als gespeicherte Stellungen unter `src/ki/__tests__/stellungen/` geprüft. Touch-Geräte entfallen, weil keine Oberfläche geändert ist.
