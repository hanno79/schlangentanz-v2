---
id: TF-KI-018
titel: Schlangenblockade und Farbendieb der soliden KI treffen in Partien die Stelle mit dem höchsten Punktverlust für den Führenden, gemessen in beiden Lesarten von K3 Kriterium 2.
art: automatisch
regression: nein
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-23
veraendert_daten: nein
skript: src/ki/strategien/solideKi_angriff_partien.test.ts
aenderung: task/K3-angriff-abwehr (PR #101)
---

## Worum es geht

Kriterium 2 von K3 lässt zwei Lesarten zu. Lesart A: Die KI wählt die Variante, bei der der führende Gegner die meisten Punkte verliert. Lesart B, wie die Umsetzung sie misst: Die KI wählt die Variante, nach der dem stärksten Gegner gegenüber ihr der kleinste Vorsprung bleibt. Welche gilt, entscheidet der Nutzer. Der Testfall zählt beide auf Saaten, die die Testsuite nicht kennt.

## Bestanden, wenn

Lesart B: In mindestens 80 % der Blockaden und Farbendiebe gegen Gegner ist der Vorsprung des stärksten Gegners danach der kleinste, den diese Karte zulässt. Lesart A: In mindestens 80 % ist der Verlust des führenden Gegners der höchste, den diese Karte zulässt. Die Grenze von 80 % entspricht der Ausnahmequote im Partientest der Suite.

## Fehlgeschlagen, wenn

Die Quote der gewählten Lesart unter 80 % liegt.

## Vorbedingungen

| Was | Wert |
|---|---|
| Ausgangslage | Worktree auf dem geprüften Stand von `task/K3-angriff-abwehr`, `npm ci` gelaufen |

## Testdaten

30 Partien nur mit der soliden KI an allen Sitzen, Saat 55'000 bis 55'029, Spielerzahl 2 + (Nummer mod 3), Erweiterung bei ungerader Nummer, KI-Zufall `erzeugeZufall(Saat × 7 + Sitz + 13)`. Gezählt wird jede Entscheidung jedes Sitzes.

## Technische Prüfung

Die Probe `zz_pruefer_k3.test.ts` aus dem Beleg unter `tests/` ablegen und mit `npx vitest run tests/zz_pruefer_k3.test.ts -t "zwei Lesarten"` ausführen. Sie schreibt die Zeile „K2-LESARTEN gesamt …, Lesart A …, Lesart B …“ und je Lesart bis zu sechs Abweichungen mit Punkten in die Datei, die in der Probe unter `aus` steht.

## Nicht abgedeckte Grenzfälle

Ist die KI selbst vorn, ist „der Führende“ in Lesart A der stärkste Gegner. Bei Gleichstand an der Spitze zählt der höchste Verlust unter den Führenden. Die Ausnahme der Suite für strikt besser bewertete Züge wendet die Probe nicht an.
