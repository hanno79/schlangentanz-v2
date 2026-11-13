---
id: TF-DESIGN-003
titel: Auf dem quer gehaltenen Handy (844×390) bleibt am Tisch genug Platz, um die Gegner zu sehen.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
aenderung: task/O1-gestaltung (PR #30)
grenzfall_von: TF-DESIGN-002
---

## Worum es geht

Wer das Handy dreht, hat 390 px Höhe. Die eigenen Schlangen, die Hand und die Zugleiste stehen unten fest; darüber scrollt die Tischfläche mit Gegnern, Stapel und Aufgaben. Ist der feste Teil zu hoch, bleibt für die Gegner fast nichts. Ob das Querformat gefordert ist, entscheiden Autor und Orchestrator.

## Bestanden, wenn

Bei 844×390 ist die Tischfläche (`.tisch-flaeche`) mindestens 120 px hoch, sodass mindestens eine Reihe Gegnerkarten ohne Scrollen zu sehen ist, und die Seite ist 844 px breit.

## Fehlgeschlagen, wenn

Die Tischfläche niedriger als 120 px ist; dann ihre Höhe und die Höhe des festen Teils (`.tisch-unten`) nennen.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build auf Port 4174, Playwright-Kontext 844×390 mit Touch |

## Testdaten

`/dev/entwurf/tisch` und `/dev/entwurf/tisch?karte=rot-01`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Playwright 844×390 | Tisch öffnen, Höhen von `.tisch-flaeche` und `.tisch-unten` messen | `/dev/entwurf/tisch` | Tischfläche mindestens 120 px |
| 2 | Playwright 844×390 | dasselbe mit gewählter Farbkarte | `/dev/entwurf/tisch?karte=rot-01` | Tischfläche mindestens 120 px |
