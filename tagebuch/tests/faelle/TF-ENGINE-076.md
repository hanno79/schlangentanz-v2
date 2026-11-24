---
id: TF-ENGINE-076
titel: Die Regeltests der Comeback-Karte (A8.1, D46 bis D49, D56, D57) laufen grün und werden rot, sobald man eine ihrer Regeln im Code umkehrt.
art: automatisch
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-24
veraendert_daten: nein
skript: src/engine/__tests__/regeln/A8.1_comeback.test.ts
aenderung: task/X4-comeback (PR #111)
---

## Worum es geht

Die Comeback-Karte gibt einem Spieler mit 5 Karten Rückstand zwei zusätzliche Aktionen. Die Regeltests halten Bedingung, Einsatz, Zusatzaktionen und „Zwei Karten abwerfen, drei ziehen“ fest. Geprüft wird, dass sie grün laufen und dass sie es merken, wenn jemand eine Regel im Code umdreht.

## Bestanden, wenn

Die drei Dateien `A8.1_comeback.test.ts` (27 Tests), `A8.1_comeback_zusatzaktionen.test.ts` (18 Tests) und `A8.1_comeback_dauerlauf.test.ts` (1 Test) enden mit Exit-Code 0. Jede der vier Gegenproben aus der Technischen Prüfung macht mindestens einen Test rot, ausser Gegenprobe 2 allein, die durch die Sperre aus D47 abgefangen wird.

## Fehlgeschlagen, wenn

Ein Test schlägt fehl, oder eine Gegenprobe (1, 3 oder 4) bleibt grün.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Repo auf `task/X4-comeback` ab Commit 9e253382, `npm ci` gelaufen |

## Testdaten

Keine eigenen; die Tests bauen ihre Stellungen mit dem Baukasten (`comeback_hilfen.ts`).

## Technische Prüfung

`npx vitest run src/engine/__tests__/regeln/A8.1_comeback.test.ts src/engine/__tests__/regeln/A8.1_comeback_zusatzaktionen.test.ts src/engine/__tests__/regeln/A8.1_comeback_dauerlauf.test.ts`: Exit-Code 0.

Gegenproben, jede einzeln, danach `git checkout -- <datei>`:

1. `src/engine/erweiterung/comeback.ts`, `comebackBedingungErfuellt`: `>= RUECKSTAND` zu `> RUECKSTAND`. Erwartet: 15 Tests in `A8.1_comeback.test.ts` rot, darunter „Rückstand 5 zu Zugbeginn“.
2. `src/engine/zugablauf.ts`, `beginneZug`: `teilzug === 1 && ` streichen. Erwartet: grün, weil die Sperre aus D47 (`zugerweiterungGesperrt`) den zweiten Zug ebenfalls abfängt.
3. Zusätzlich zu 2 in `comeback.ts`, `pruefeComebackEinsetzen`, die Zeile `if (gesperrt !== null) return gesperrt;` auskommentieren. Erwartet: 4 Tests rot (D47 Verdoppler, D48 zweiter Zug, D47 Korb, Szenario `comeback-verdoppler`).
4. `comeback.ts`, `zweiAbwerfenGesperrt`: die Schlussrunden-Sperre durch `if (false)` ersetzen. Erwartet: 2 Tests in `A8.1_comeback_zusatzaktionen.test.ts` rot.

## Nicht abgedeckte Grenzfälle

Die Grenzfälle eine Handkarte, Überhand am Zugende, abgewehrte Fusion, Aussetzen vor der Grube, beendete Partie, kein Rückstand und Farbenschutz als Zusatzaktion stehen in TF-ENGINE-078. Risiko-Karten neben der Comeback-Karte (D47: zählen nicht als Zugerweiterung) lassen sich erst mit X5 prüfen.
