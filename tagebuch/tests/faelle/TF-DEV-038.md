---
id: TF-DEV-038
titel: Am Entwicklertisch ist die Saat der KI für keinen Schritt gleich der Partiesaat, auch dort nicht, wo die Mischung sie ohne Ausweichen träfe, und die Suite wird rot, wenn das Ausweichen fehlt.
art: automatisch
regression: ja
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
skript: src/entwicklung/partie.test.ts
aenderung: task/K2-solide-ki (PR #71)
---

## Worum es geht

U5 verlangt für die KI eine eigene Saat, unabhängig von der Partie. Mischte der Rahmen beim Erraten mit der Partiesaat, erriete er Hände und Stapel genau. `kiSaatAmTisch(schritt, partiesaat)` legt die KI-Saat deshalb in die obere Hälfte der 32-Bit-Saaten und weicht dort der Partiesaat aus. Eine Partiesaat aus dieser Hälfte kann die Mischung bei bestimmten Schritten genau treffen; nur die letzte Zeile der Funktion verhindert dann den Gleichstand.

## Bestanden, wenn

`kiSaatAmTisch(22, 3736942547)` ergibt nicht 3736942547, ebenso an den Stellen (30, 4006315519) und (60, 4210738748). Wird die letzte Zeile der Funktion durch `return saat` ersetzt, wird mindestens ein Test in `src/entwicklung/partie.test.ts` rot.

## Fehlgeschlagen, wenn

Eine der drei Stellen die Partiesaat ergibt oder `partie.test.ts` mit entferntem Ausweichen grün bleibt.

## Vorbedingungen

| Was | Wert |
|---|---|
| Ausgangslage | Worktree auf dem geprüften Stand von `task/K2-solide-ki`, `npm ci` gelaufen |

## Testdaten

Schritt 22 mit Saat 3736942547, Schritt 30 mit 4006315519, Schritt 60 mit 4210738748. Gefunden mit `fixpunkt2.mjs` (Beleg), das die Mischung ohne die letzte Zeile nachbaut und Bit für Bit nach Saaten sucht, die sie auf sich selbst abbildet.

## Technische Prüfung

Die drei Aufrufe in einer Probe ausführen und die Ergebnisse mit der Partiesaat vergleichen. Dann in `src/entwicklung/partie.ts` die Zeile `return saat === partiesaat ? (saat ^ 1) >>> 0 : saat` durch `return saat` ersetzen, `npx vitest run src/entwicklung/partie.test.ts` ausführen (erwartet: Exit ungleich 0) und die Änderung mit `git checkout -- src/entwicklung/partie.ts` zurücknehmen.

## Nicht abgedeckte Grenzfälle

Saaten über 2^32 − 1 und negative Saaten lehnt die Adresse ab (`adresse.ts`); sie sind nicht geprüft. Szenarien haben keine Partiesaat und mischen mit Saaten unter 2^31.
