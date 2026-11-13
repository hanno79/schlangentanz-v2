---
id: TF-REGELN-004
titel: Jeder Kartentext steht wörtlich in Teil A der Spec, und der Test wird rot, wenn Text oder Spec abweichen.
art: automatisch
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
skript: src/ui/karten/hilfe/kartenhilfe.test.ts
aenderung: task/O9-regelhilfe (PR #37)
---

## Worum es geht

Die Regelhilfe darf nichts behaupten, was nicht in der Spielanleitung steht. Der Test liest dafür `docs/GAME_SPEC.md` selbst. Die Gegenprobe zeigt, dass er wirklich die Spec liest und nicht eine Kopie.

## Bestanden, wenn

`npx vitest run src/ui/karten src/ui/regeln` endet mit 0. Wird ein Satz in `src/ui/karten/hilfe/` verfälscht oder ein Satz in Teil A geändert, endet derselbe Befehl mit 1 und nennt die betroffene Karte.

## Fehlgeschlagen, wenn

Der Befehl endet ohne Änderung mit 1, oder er bleibt nach einer verfälschten Stelle grün.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Arbeitskopie auf dem geprüften Stand, `npm ci` gelaufen |

## Testdaten

Gegenproben: im Beispiel des Farbendiebs „blaue“ zu „rote“; in Teil A „Ablagestapel“ zu „Nachziehstapel“ (A7.4), „maximal 2 Schlangen“ zu „3“ (A5), „min. 6 gelben“ zu „7“ (A9).

## Technische Prüfung

`npx vitest run src/ui/karten src/ui/regeln`, danach jede Gegenprobe einzeln zurücksetzen und den Befehl wiederholen.

## Nicht abgedeckte Grenzfälle

Ein neuer Satz in Teil A ausserhalb von „Wichtige Regeln“ fällt dem Test nicht auf; das deckt TF-REGELN-005 ab.
