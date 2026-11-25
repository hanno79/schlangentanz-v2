---
id: TF-KI-033
titel: Auch mit Saaten, die nicht im Test stehen, liegt die solide KI klar über den Schwellen des Plans K5.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-25
veraendert_daten: nein
aenderung: task/K5-staerkenachweis (PR #122)
grenzfall_von: TF-KI-032
---

## Worum es geht

Die Schwellen von K5 gelten für die festen Saaten im Test. Diese Probe misst mit anderen Partie- und KI-Saaten und anderer Abschnittsgrösse. So zeigt sich, ob das Ergebnis an den gewählten Saaten hängt.

## Bestanden, wenn

Zu zweit gegen die Zufalls-KI und gegen „erste erlaubte Aktion“ gewinnt die KI mindestens 80 % der Partien, zu viert gegen drei Zufalls-KIs mindestens 50 %. Jede Partie endet regulär. Geteilte Siege zählen mit, ihr Anteil wird mitgezählt.

## Fehlgeschlagen, wenn

Ein Lauf liegt unter 80 % beziehungsweise 50 %, oder eine Partie endet nicht regulär.

## Vorbedingungen

| Was | Wert |
|---|---|
| Ausgangslage | Worktree auf dem geprüften Stand, `npm ci` gelaufen |

## Testdaten

Abschnitte zu 25 Partien, KI-Saat je Abschnitt `kiSaat × 7 + Abschnitt`. 500 Partien zu zweit gegen die Zufalls-KI ab Saat 731'904'155 (kiSaat 402'118'773), 300 zu viert ab 913'377'402 (288'501'967), 300 zu viert mit Erweiterung ab 1'513'640'028 (77'204'119), 200 zu zweit mit Erweiterung gegen „erste erlaubte Aktion“ ab 1'202'334'455 (990'112'334).

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Konsole im Repo | die Probedateien aus dem Beleg unter `tests/` ablegen | `zz_pruefer_probe_k5.ts` und vier Dateien `zz_pruefer_k5_*.staerke.test.ts` | fünf neue Dateien |
| 2 | Konsole im Repo | Probe ausführen | `npx vitest run --mode staerke --reporter=verbose tests/zz_pruefer_k5` | vier Zeilen „Probe …“ mit Siegen, davon allein und geteilt, nicht beendet 0 |
| 3 | Konsole im Repo | Probedateien wieder löschen | `rm tests/zz_pruefer_*` | `git status` ohne Änderungen |

## Nicht abgedeckte Grenzfälle

Eine Probe mit 500 Partien gegen „erste erlaubte Aktion“ ohne Erweiterung fehlt, weil dieser Gegner in allen Läufen fast nie punktet.
