---
id: TF-ENGINE-025
titel: Die Schlangengrube im zweiten Zug nach einem Verdoppler, in der Schlussrunde nach einem Verdoppler und ein beschädigter Spielstand mit offener Frage verhalten sich wie erwartet.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
aenderung: task/E4-abwehr-grube (PR #54)
grenzfall_von: TF-ENGINE-023
---

## Worum es geht

Drei Lagen, die in den Kriterien von E4 nicht stehen. Sie prüfen, ob die Grube mit dem zweiten Zug nach einem Verdoppler zusammenspielt, ob in der Schlussrunde der richtige Spieler seinen letzten Zug verliert, und was ein Spielstand auslöst, in dem die offene Frage niemanden mehr nennt.

## Bestanden, wenn

- G-F: Zwei Spieler. Spieler 1 spielt Verdoppler und eine Farbkarte, im zweiten Teilzug eine Grube auf Spieler 2, der durchlässt. Nach „Zug beenden“ setzt Spieler 2 genau einmal aus, und Spieler 1 beginnt mit Teilzug 1. Eine zweite Grube im neuen Zug lässt Spieler 2 noch einmal aussetzen.
- G-G: Drei Spieler in der Schlussrunde, Auslöser Spieler 1 am Zug. Verdoppler, „Zug beenden“, im zweiten Teilzug Grube auf Spieler 2, durchlassen, „Zug beenden“: Spieler 2 setzt aus (kein „GrubeOhneWirkung“), Spieler 3 spielt seinen letzten Zug, danach ist die Partie beendet und keine Grube liegt aus.
- G-C: Beim Laden eines Stands mit `schwebend.ausstehend` gleich `[0]` (Angreifer), `[9]` oder `[1, 1]` lehnt die Engine mit deutschem Grund ab. Der Stand mit `[]` wird geladen; das Ergebnis wird festgehalten.

## Fehlgeschlagen, wenn

G-F oder G-G anders ausgeht, etwa ein dritter Teilzug folgt, Spieler 2 zweimal für eine Grube aussetzt oder in G-G eine Grube übrig bleibt, oder wenn einer der drei beschädigten Stände in G-C ohne Meldung geladen wird.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Kopie des Stands `3dbb35b` wie in TF-ENGINE-024 |

## Testdaten

G-F: Hände Verdoppler, Schlangengrube, Schlangengrube, Blau, Rot und Blau, Rot, Gelb, Braun, Violett; sechs Gelb oben auf dem Stapel. G-G: Hand Verdoppler, Schlangengrube, Blau, Rot, Gelb; `.schlussrunde(0)`. G-C: Grube von Spieler 1 auf Spieler 2, gespeichert, `ausstehend` im JSON geändert.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Konsole im Kopie-Ordner | Prüfdateien `pruefer_grenz.test.ts` (G-F, G-G) und `pruefer_laden.test.ts` (G-C) anlegen | Lagen aus „Testdaten“ | Dateien liegen nur in der Kopie |
| 2 | Konsole im Kopie-Ordner | beide Dateien ausführen | `npx vitest run src/engine/__tests__/pruefer_grenz.test.ts src/engine/__tests__/pruefer_laden.test.ts` | Exit 0; `grenz.txt` und `laden.txt` mit den Ereignisfolgen und Meldungen aus „Bestanden, wenn“ |

## Nicht abgedeckte Grenzfälle

Zwei Gruben, die gleichzeitig vor einem Spieler liegen, während er einen Verdoppler spielt, sind nicht eigens geprüft, weil ein aussetzender Spieler keinen Verdoppler spielen kann.
