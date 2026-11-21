---
id: TF-ENGINE-043
titel: Wird in den Kartendateien von E5 eine Regel verfälscht, wird mindestens ein Regeltest rot.
art: manuell
regression: nein
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
aenderung: task/E5-legen (PR #66)
---

## Worum es geht

Gegenprobe des Prüfers: Grüne Tests belegen wenig, solange unklar ist, ob sie eine falsche Regel bemerken. Verfälscht wird je eine Zeile in `farbkarte.ts` oder `schlangenstelle.ts`, danach wird die Datei zurückgesetzt.

## Bestanden, wenn

| Verfälschung | rot (Tests) |
|---|---|
| Farbkarte nur an „ende“, nicht an „anfang“ | 7 |
| Regenbogenschlange und Blockade nur in eigene Schlangen | 17 |
| Betroffen ist der nächste Spieler statt des Besitzers | 13 |
| Einfügen eine Stelle zu weit vorn | 13 |

Nach jedem Zurücksetzen zeigt `git status` keine Änderung.

## Fehlgeschlagen, wenn

Eine Verfälschung die Suite grün lässt.

## Vorbedingungen

| Was | Wert |
|---|---|
| Ausgangslage | Worktree auf `206ca15`, `npm ci` gelaufen, `git status` leer |

## Testdaten

1. `farbkarte.ts`: `(['anfang', 'ende'] as const)` in `ziele` wird `(['ende'] as const)`.
2. `schlangenstelle.ts`, `ziele`: vor `.flatMap` kommt `.filter(({ besitzer }) => besitzer === spielerIndex)`.
3. `schlangenstelle.ts`, `betroffene`: `[besitzer]` wird `[(besitzer + 1) % zustand.spieler.length]`.
4. `schlangenstelle.ts`, `wirke`: `splice(aktion.position, …)` wird `splice(Math.max(0, aktion.position - 1), …)`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Editor | Verfälschung 1 einsetzen | Testdaten 1 | nur diese Zeile geändert |
| 2 | Konsole im Repo | Tests ausführen | `npx vitest run src/engine src/entwicklung` | 7 rot, darunter „D9/A5: aufgezählt sind …“ |
| 3 | Konsole im Repo | zurücksetzen | `git checkout -- src/engine/karten/farbkarte.ts` | `git status` leer |
| 4 | Editor | Verfälschung 2 einsetzen | Testdaten 2 | nur diese Zeile geändert |
| 5 | Konsole im Repo | Tests ausführen | wie Schritt 2 | 17 rot |
| 6 | Konsole im Repo | zurücksetzen | `git checkout -- src/engine/karten/schlangenstelle.ts` | `git status` leer |
| 7 | Editor | Verfälschung 3 einsetzen | Testdaten 3 | nur diese Zeile geändert |
| 8 | Konsole im Repo | Tests ausführen | wie Schritt 2 | 13 rot |
| 9 | Konsole im Repo | zurücksetzen | wie Schritt 6 | `git status` leer |
| 10 | Editor | Verfälschung 4 einsetzen | Testdaten 4 | nur diese Zeile geändert |
| 11 | Konsole im Repo | Tests ausführen | wie Schritt 2 | 13 rot |
| 12 | Konsole im Repo | zurücksetzen | wie Schritt 6 | `git status` leer |

## Nicht abgedeckte Grenzfälle

Die Verfälschung „eigene Schlange gilt als betroffen“ (`betroffene` gibt immer `[besitzer]` zurück) ist wirkungsgleich, weil `reaktion.ts` den Angreifer ohnehin aus den Betroffenen nimmt; sie macht deshalb nichts rot und ist kein Befund.
