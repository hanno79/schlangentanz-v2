---
id: TF-ENGINE-090
titel: Fehlt eine Datei des Golden Master mit Erweiterung, wird der Test rot und schreibt sie nicht selbst.
art: automatisch
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-25
veraendert_daten: nein
skript: src/engine/__tests__/golden_master.test.ts
aenderung: task/X7-abnahme-erweiterung (PR #120)
grenzfall_von: TF-ENGINE-087
---

## Worum es geht

Vitest legt eine fehlende Vergleichsdatei normalerweise selbst an. Damit würde ein Protokoll eingefroren, das niemand gelesen hat. Der Golden Master prüft deshalb zuerst, ob die Datei da ist. Der Grenzfall ist der Stand, an dem die drei Protokolle noch fehlen: der erste Commit von X7.

## Bestanden, wenn

Auf dem ersten Commit `9d10b49e` endet `npx vitest run src/engine/__tests__/golden_master.test.ts` mit Exit 1, die drei Partien mit Erweiterung melden „golden/erweiterung-…txt fehlt; eingefroren wird erst nach der Lektüre gegen Teil A“, und `git status` zeigt danach keine neue Datei unter `golden/`.

## Fehlgeschlagen, wenn

Der Test wird grün oder legt eine der drei Dateien an.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Repo mit `git switch --detach 9d10b49e`, danach zurück auf den geprüften Stand |

## Testdaten

Erster Commit von X7, `9d10b49e`, ohne die Dateien `golden/erweiterung-*.txt`.

## Technische Prüfung

`git switch --detach 9d10b49e`, `npx vitest run src/engine/__tests__/golden_master.test.ts src/engine/__tests__/regeln_abdeckung.test.ts src/engine/__tests__/dauerlauf.test.ts`, erwartet Exit 1 mit 10 roten Tests, `git status --short` leer, danach zurück auf den Prüfbranch.

## Nicht abgedeckte Grenzfälle

Eine Datei, die da ist, aber leer: dann vergleicht der Test gegen leeren Text und wird ebenfalls rot; ausgeführt ist das nicht.
