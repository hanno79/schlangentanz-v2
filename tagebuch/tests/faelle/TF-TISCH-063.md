---
id: TF-TISCH-063
titel: Der Layout-Vertrag O10b schlägt fehl, sobald tisch.css und quer.css wieder auf dem Stand vor der Korrektur stehen.
art: automatisch
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-27
veraendert_daten: ja
skript: tests/layout/erweiterung.hooks.spec.ts
aenderung: task/O10b-320-zugleiste (PR #129)
---

## Worum es geht

Geprüft wird mit einer Störprobe, ob die Messung für 320 × 568 den ursprünglichen Fehler erkennt. Bliebe sie mit der alten CSS grün, würde sie einen Rückfall nicht melden.

## Bestanden, wenn

Mit `src/ui/tisch/tisch.css` und `src/ui/tisch/quer.css` aus `origin/neuaufbau` endet `npx playwright test tests/layout/erweiterung.hooks.spec.ts -g "O10b"` mit Exit 1, in allen fünf Projekten rot, mit einer Meldung, die ein überdecktes Element der Zugleiste nennt. Nach dem Zurücksetzen ist `git status` leer.

## Fehlgeschlagen, wenn

Der Test bleibt mit der alten CSS grün, oder er scheitert aus einem anderen Grund als einem überdeckten oder unerreichbaren Element der Zugleiste.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Stand ab Commit 705a9cef, Ports 4173 und 4174 frei |

## Testdaten

Die beiden CSS-Dateien aus `origin/neuaufbau` (Commit 85defc23).

## Zurücksetzen

`git checkout HEAD -- src/ui/tisch/tisch.css src/ui/tisch/quer.css`; danach zeigt `git status --short` nichts an.

## Technische Prüfung

`git checkout origin/neuaufbau -- src/ui/tisch/tisch.css src/ui/tisch/quer.css`, dann `npx playwright test tests/layout/erweiterung.hooks.spec.ts -g "O10b"`. Erwartet: „5 failed“ und je Projekt die Meldung „Comeback-Karte, Start: 1 von 4 Knöpfen und Sätzen der Zugleiste nicht frei“, als Befund der Satz „Wähle eine Karte aus deiner Hand.“ mit „an der Mitte liegt ARTICLE.st-gegner“.

## Nicht abgedeckte Grenzfälle

Ein Rückfall nur in einem Teil der Korrektur (etwa nur `min-height: 0` an `.st-unten` wieder da, Tisch aber absolut) ist nicht einzeln gestört worden.
