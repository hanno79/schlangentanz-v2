---
id: TF-KI-021
titel: Die solide KI aus K3 ist auf fremden Saaten gegen den Stand von K2 nicht messbar schwächer und bleibt je Schritt unter 64 Bewertungen und 500 ms.
art: automatisch
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-23
veraendert_daten: nein
skript: src/ki/strategien/staerke_k3.test.ts
aenderung: task/K3-angriff-abwehr (PR #101)
---

## Worum es geht

Die Umsetzung misst die Spielstärke gegen die Abschrift von K2 mit einem Spiegel auf denselben Saaten. Diese Probe wiederholt die Messung auf Saaten, die die Testsuite nicht kennt, und misst dazu Bewertungen und Rechenzeit je Schritt.

## Bestanden, wenn

In jeder Stichprobe liegt der mittlere Unterschied des Abstands zum besten Gegner (K3 minus Spiegel) zuzüglich zwei Standardfehlern bei 0 oder darüber. Über alle Schritte gemessener Partien bleibt `bewertungen.suche` bei höchstens 64 und die Zeit von `planeZug` unter 500 ms.

## Fehlgeschlagen, wenn

Eine Stichprobe darunter liegt, ein Schritt mehr als 64 Bewertungen braucht oder 500 ms überschreitet.

## Vorbedingungen

| Was | Wert |
|---|---|
| Ausgangslage | Worktree auf dem geprüften Stand von `task/K3-angriff-abwehr`, `npm ci` gelaufen |

## Testdaten

Stärke: 3 Spieler 60 Partien ab Saat 93'000, 2 Spieler mit Erweiterung 60 Partien ab 94'000, 4 Spieler 40 Partien ab 95'000, `kiSaat` 4'242 + Spielerzahl. Grenzen: 9 Partien nur mit der soliden KI ab Saat 67'000.

## Technische Prüfung

Probe aus dem Beleg unter `tests/` ablegen, `npx vitest run tests/zz_pruefer_k3.test.ts -t "Spielstärke|Grenzen"`. Zeilen „STAERKE …“ und „GRENZEN …“ in der Ausgabedatei.

## Nicht abgedeckte Grenzfälle

Die Rechenzeit ist auf einem Rechner gemessen, auf dem gleichzeitig andere Prüfungen liefen; sie ist eine obere Schätzung. Den eigentlichen Stärkenachweis macht K5.
