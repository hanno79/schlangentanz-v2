---
id: TF-KI-020
titel: Die solide KI entscheidet in sieben gebauten Grenzfällen der Abwehr wie die Regeln D21 und D29 und Kriterium 4 von K3 es verlangen.
art: automatisch
regression: ja
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-23
veraendert_daten: nein
skript: src/ki/strategien/abwehr.test.ts
aenderung: task/K3-angriff-abwehr (PR #101)
grenzfall_von: TF-KI-019
---

## Worum es geht

Sieben Stellungen, die in Partien selten vorkommen: eine Grube in der Schlussrunde mit und ohne verbleibenden letzten Zug, eine Regenbogenschlange des Gegners, die der KI hilft, ein Farbendieb, der nur einen Punkt kostet, und einer, der dazu den Kettenbonus kostet. Jede Stellung baut der Baukasten der Engine, der Angreifer spielt seine Karte über die Engine, dann entscheidet die solide KI mit drei Saaten.

## Bestanden, wenn

G1 Farbendieb aus Blau ×4, 1 Punkt Verlust, laufend: durchlassen. G1b derselbe Diebstahl kostet zusätzlich den Kettenbonus (9 → 8): abwehren. G2 Regenbogenschlange vollendet ihr grünes Paar (0 → 6): durchlassen. G3 Grube in der Schlussrunde, sie hätte noch ihren letzten Zug: abwehren. G4 Grube in der Schlussrunde, sie hat keinen Zug mehr (D29): durchlassen. G5 Grube laufend: abwehren. G6 Schlangenfrass frisst zwei aus Grün ×3: abwehren. G7 Schlussrunde, Blockade hinter einem Paar, sie hat keinen Zug mehr: durchlassen. Alle drei Saaten gleich.

## Fehlgeschlagen, wenn

Eine der acht Entscheidungen abweicht oder die drei Saaten verschieden entscheiden.

## Vorbedingungen

| Was | Wert |
|---|---|
| Ausgangslage | Worktree auf dem geprüften Stand von `task/K3-angriff-abwehr`, `npm ci` gelaufen |

## Testdaten

Baukasten-Saaten 501 bis 508, Aufbau je Fall in der Probe unter „eigene Grenzfälle der Abwehr“. KI-Saaten 1, 2 und 3.

## Technische Prüfung

Probe aus dem Beleg unter `tests/` ablegen, `npx vitest run tests/zz_pruefer_k3.test.ts -t "Grenzfälle"`. Je Fall steht eine Zeile „G… {"wahlen":[…],"k2":[…],…}“ in der Ausgabedatei; `k2` ist zum Vergleich die Abschrift aus K2.

## Nicht abgedeckte Grenzfälle

Eine Grube in der Schlussrunde auf einen Spieler, der schon eine Grube vor sich liegen hat, und Angriffe mit der Erweiterung (Schlangenhäutung, Aufgaben) sind nicht gebaut.
