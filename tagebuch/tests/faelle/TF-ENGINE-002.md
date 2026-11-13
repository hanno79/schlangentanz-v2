---
id: TF-ENGINE-002
titel: Ein Test wird rot, wenn die Aufgaben nicht gemischt werden oder die Erweiterungskarten ungemischt unten im Stapel liegen.
art: automatisch
regression: ja
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
skript: src/engine/__tests__/material.test.ts
aenderung: task/E1-struktur (PR #31)
grenzfall_von: TF-ENGINE-001
---

## Worum es geht

A4 verlangt zwei Mischvorgänge, die man im Startzustand leicht übersieht: Die Aufgabenkarten werden getrennt gemischt, und Schlangenhäutung und Schlangenkorb kommen gemischt unter die Sonderkarten. Ohne Test kann ein späterer Umbau das unbemerkt brechen; dann bekäme jeder Spieler in jeder Partie dieselbe geheime Aufgabe.

## Bestanden, wenn

Jede der beiden Änderungen in `src/engine/state.ts` macht mindestens einen Test von `npm test` rot: (a) `mische(erstelleAufgabenStapel())` durch `erstelleAufgabenStapel()` ersetzt; (b) die vier Erweiterungskarten nach dem Mischen ungemischt unten an den Nachziehstapel gehängt.

## Fehlgeschlagen, wenn

Nach einer der beiden Änderungen bleiben alle Tests grün.

## Vorbedingungen

| Was | Wert |
|---|---|
| Ausgangslage | Worktree auf dem geprüften Stand von `task/E1-struktur`, `npm ci` gelaufen, keine offenen Änderungen |

## Testdaten

Die beiden Änderungen (a) und (b) unter „Technische Prüfung“.

## Technische Prüfung

Änderung (a) einbauen, `npx vitest run` ausführen, Exit-Code lesen, `git checkout -- src/engine/state.ts`. Dasselbe mit Änderung (b): Zeile `const nachziehstapel = mische(erstelleSpielkarten(erweiterung));` durch `const nachziehstapel = [...mische(erstelleSpielkarten(false)), ...erstelleSpielkarten(erweiterung).slice(108)];` ersetzen.
