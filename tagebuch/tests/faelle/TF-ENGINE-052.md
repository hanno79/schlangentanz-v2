---
id: TF-ENGINE-052
titel: Jede Verfälschung, die E11 absichern soll, macht mindestens einen Test rot.
art: automatisch
regression: nein
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: ja
skript: src/engine/__tests__/regeln_abdeckung.test.ts
aenderung: task/E11-abnahme-basis (PR #72)
---

## Worum es geht

E11 sichert die Basis-Engine mit einem Meta-Test für die Regeltestdateien, einer neuen Invariante für schwebende Karten, dem Dauerlauf und dem Golden Master. Ob diese Sicherungen greifen, zeigt sich erst, wenn man den Code absichtlich verfälscht und ein Test rot werden muss.

## Bestanden, wenn

Jede der folgenden Verfälschungen lässt den genannten Befehl mit einem Exit-Code ungleich 0 enden: eine Regeltestdatei unter `regeln/` umbenannt (Meta-Test), die neue Prüfung auf eine schwebende Karte ohne Ausstehenden entfernt (Invariantentest), die Handgrenze auf 6 Karten verschoben (Dauerlauf meldet „A5: Nach dem Zugende hält Spieler … 6 Karten“), eine Karte beim Nachziehen nicht aus dem Stapel genommen (Dauerlauf meldet eine verletzte Invariante) und die Mindestlänge der Kette auf 2 gesenkt (Golden Master weicht ab). Nach dem Zurücksetzen zeigt `git status` keine Änderung.

## Fehlgeschlagen, wenn

Eine Verfälschung bleibt unbemerkt, also endet der Befehl trotz verfälschtem Code mit 0.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Repo auf dem geprüften Stand, `git status` ohne Änderung |

## Testdaten

Die Verfälschungen stehen im Abschnitt „Technische Prüfung“.

## Zurücksetzen

Nach jeder Verfälschung `git checkout -- <datei>` (beim Umbenennen `git mv` zurück) und `git status` prüfen: keine geänderte Datei.

## Technische Prüfung

| Verfälschung | Befehl | erwartet |
|---|---|---|
| `regeln/A7.2_farbenschutz.test.ts` umbenennen in `regeln/X7.2_farbenschutz.test.ts` | `npx vitest run src/engine/__tests__/regeln_abdeckung.test.ts` | rot: „E11: A7.2 hat eine Regeltestdatei unter regeln/“ |
| `src/engine/invarianten.ts`: Prüfung `schwebend.ausstehend.length === 0` entfernen | `npx vitest run src/engine/__tests__/invarianten_grenzfaelle.test.ts src/engine/__tests__/aktionen.test.ts` | rot: „A6/E4-H3: eine schwebende Karte ohne Ausstehenden …“ |
| `src/engine/zugablauf.ts`: Auffüllen und Abwerfen mit `HANDKARTEN + 1` | `npx vitest run src/engine/__tests__/dauerlauf.test.ts` | rot mit „A5: Nach dem Zugende hält Spieler … 6 Karten“ |
| `src/engine/zugablauf.ts`: `splice` beim Auffüllen durch `slice` ersetzen | `npx vitest run src/engine/__tests__/dauerlauf.test.ts` | rot mit „Jede Spielkarte liegt genau einmal …“ |
| `src/engine/scoring.ts`: `MINDEST_KETTENLAENGE` von 3 auf 2 | `npx vitest run src/engine/__tests__/golden_master.test.ts` | rot: Protokoll weicht vom eingefrorenen ab |

## Nicht abgedeckte Grenzfälle

Falsch benannte oder zusätzliche Dateien für den Meta-Test prüft TF-ENGINE-053, die Unabhängigkeit des Golden Masters von der Reihenfolge der Aufzählung TF-ENGINE-054. Eine Verfälschung der Erweiterungskarten gehört zu X7 und ist hier nicht geprüft.
