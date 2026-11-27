---
id: TF-TISCH-055
titel: Die Möglichkeiten der Erweiterung in der Zugleiste halten ihren Text im Knopf, in allen fünf Geräteklassen und bei 568 × 320.
art: manuell
regression: ja
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-27
veraendert_daten: nein
aenderung: task/O10-erweiterung-tisch (PR #124)
---

## Worum es geht

Risiko-Aktionen, Boni des Korbs und Möglichkeiten einer Entscheidung stehen nebeneinander, mindestens 5rem breit; der Text soll im Knopf umbrechen (DESIGN.md, „Erweiterung“). Lange Wörter wie „Sonderkarte“, „zusätzliche“ oder „Nachziehstapel“ passen nicht immer in eine schmale Spalte.

## Bestanden, wenn

In jeder Lage ist für jeden sichtbaren Knopf der Zugleiste `scrollWidth` höchstens `clientWidth` + 1, und im Bild ragt kein Buchstabe über den gestrichelten Rand.

## Fehlgeschlagen, wenn

Ein Knopf hat breiteren Inhalt als Platz, oder im Bild steht Text auf oder hinter dem Rand.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build, Stand ab Commit 4ad16f8, Playwright Chromium, Touch ausser Desktop |

## Testdaten

Lagen: `risiko-du-beguenstigt` (Start), `risiko-erfolg` nach „Risiko spielen“, `korb-entfernen` nach dem Korb, `risiko-misserfolg` nach Aktion 1 und „Ausführen“, `comeback-bedingung` nach „Comeback einsetzen“. Fenster 1280 × 900, 1024 × 768, 768 × 1024, 390 × 844, 844 × 390 und 568 × 320.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Adresse | je Lage öffnen und die Knöpfe bis zur Lage antippen | siehe Testdaten | Zugleiste mit den Möglichkeiten |
| 2 | Zugleiste | Breite der Knöpfe messen und Bild ansehen | | kein Text über dem Rand |

## Technische Prüfung

Für jeden Knopf unter `[aria-label="Zugleiste"]` mit sichtbarem Rechteck: `scrollWidth > clientWidth + 1` ist ein Befund.

## Nicht abgedeckte Grenzfälle

Grössere Schrift im Browser (Zoom 200 %) ist nicht gemessen. Die Möglichkeiten von Aktion 4 mit vielen Karten der Ablage (D54) sind nicht gemessen.
