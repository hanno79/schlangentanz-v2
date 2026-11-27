---
id: TF-KI-041
titel: Im ersten Zug mit einer gewöhnlichen Starthand setzt die solide KI eine Risiko-Karte nur ein, wenn das ihr Spiel messbar verbessert.
art: automatisch
regression: nein
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-27
veraendert_daten: nein
skript: src/ki/strategien/solideKi_erweiterung.test.ts
aenderung: task/K4-ki-erweiterung (PR #125)
grenzfall_von: TF-KI-039
---

## Worum es geht

K4 verlangt, dass die KI Risiko-Karten nicht im ersten Zug ohne Nutzen spielt. Das Szenario der Suite prüft dafür eine ausgesuchte Hand mit einer Farbkarte und vier Farbenschutz. Der Grenzfall nimmt gewöhnliche Starthände und misst, ob der frühe Einsatz der KI tatsächlich etwas bringt.

## Bestanden, wenn

Mit einer Hand aus fünf Farbkarten oder aus drei Farbkarten und zwei Sonderkarten spielt die KI im ersten Zug keine Risiko-Karte, oder sie tut es und gewinnt in Spiegelpartien zu zweit gegen dieselbe KI, der im ersten Zug die Risiko-Karten nicht angeboten werden, deutlich mehr als die Hälfte der Partien (mindestens 1'600 Partien, Abstand zu 50 % mehr als zwei Standardfehler).

## Fehlgeschlagen, wenn

Die KI spielt im ersten Zug fast immer eine Risiko-Karte, und die Spiegelpartien zeigen keinen Vorteil, der über den Zufall hinausgeht.

## Vorbedingungen

| Was | Wert |
|---|---|
| Ausgangslage | Worktree auf dem geprüften Stand von `task/K4-ki-erweiterung`, `npm ci` gelaufen |

## Testdaten

Starthände mit Saat 4'108 wie im Szenario `ki-risiko-ohne-nutzen`: Verdoppler, Farbendieb, Regenbogenschlange, 2 × Farbenschutz; Blau und 4 × Farbenschutz; Blau, Rot, Gelb, Grün, Braun; Blau, Blau, Rot, Farbendieb, Schlangenfrass. Je fünf KI-Saaten. Spiegelpartien: Saat 88'000 bis 88'199 und 88'200 bis 88'999, jede mit vertauschten Sitzen.

## Technische Prüfung

Die Proben `zz_pruefer_k4_szene.test.ts` und `zz_pruefer_k4_spiegel.test.ts` aus dem Beleg nach `src/ki/strategien/` legen, mit `npx vitest run` ausführen (Ausgabe über `K4_SZENE_AUSGABE`, `K4_SPIEGEL_AUSGABE`, `K4_SPIEGEL_SAATEN`, `K4_SPIEGEL_ERSTE`) und danach wieder löschen.
