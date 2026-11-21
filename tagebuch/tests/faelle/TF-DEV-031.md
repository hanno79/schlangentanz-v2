---
id: TF-DEV-031
titel: Wird die Knopfbeschriftung des Entwicklertischs bei Stelle, Karten-Id oder Spieler verfälscht, werden die Beschriftungstests rot.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
aenderung: task/E5-legen (PR #66)
---

## Worum es geht

Die Tests zu `beschriftung.ts` sind nach dem Code entstanden. Ob sie Fehler fangen, zeigt erst eine Gegenprobe: je eine Zeile verfälschen, Tests ausführen, zurücksetzen.

## Bestanden, wenn

| Verfälschung in `beschriftung.ts` | rot (Tests in `src/entwicklung`) |
|---|---|
| „Stelle n+1“ statt „Stelle n“ | 4 (3 in `beschriftung.test.ts`, 1 in `TischLegen.test.tsx`) |
| Karte ohne Id, nur mit Namen | 10 |
| Spieler-Id auf den nächsten Spieler abgebildet | 1 (Schlangengrube) |

Nach jedem Zurücksetzen zeigt `git status` keine Änderung.

## Fehlgeschlagen, wenn

Eine der drei Verfälschungen alle Tests grün lässt.

## Vorbedingungen

| Was | Wert |
|---|---|
| Ausgangslage | Worktree auf `206ca15`, `npm ci` gelaufen, `git status` leer |

## Testdaten

1. ``return `Stelle ${String(wert)}` `` wird ``return `Stelle ${Number(wert) + 1}` ``.
2. ``return `${karteAnzeigename(karte)} (${karte.id})` `` wird `return karteAnzeigename(karte)`.
3. `name(tisch.zustand, spieler)` wird `name(tisch.zustand, (spieler + 1) % tisch.zustand.spieler.length)`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Editor | Verfälschung 1 in `src/entwicklung/beschriftung.ts` | Testdaten 1 | nur diese Zeile geändert |
| 2 | Konsole im Repo | Tests ausführen | `npx vitest run src/entwicklung` | 4 rot |
| 3 | Konsole im Repo | zurücksetzen | `git checkout -- src/entwicklung/beschriftung.ts` | `git status` leer |
| 4 | Editor | Verfälschung 2 | Testdaten 2 | nur diese Zeile geändert |
| 5 | Konsole im Repo | Tests ausführen | wie Schritt 2 | 10 rot |
| 6 | Konsole im Repo | zurücksetzen | wie Schritt 3 | `git status` leer |
| 7 | Editor | Verfälschung 3 | Testdaten 3 | nur diese Zeile geändert |
| 8 | Konsole im Repo | Tests ausführen | wie Schritt 2 | 1 rot |
| 9 | Konsole im Repo | zurücksetzen | wie Schritt 3 | `git status` leer |

## Nicht abgedeckte Grenzfälle

Lässt man in `kartenAmTisch` die Ablagestapel und die Karten unter Fusionen weg, bleibt alles grün (100 Tests). Das ist ungetesteter Code; heute nennt aber keine Aktion eine solche Karte, die Beschriftung zeigte dann nur die nackte Id.
