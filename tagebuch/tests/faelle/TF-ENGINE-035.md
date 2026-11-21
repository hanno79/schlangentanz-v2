---
id: TF-ENGINE-035
titel: Zufallspartien, in denen der Farbendieb gespielt und abgewehrt wird, lassen sich Schritt für Schritt aus den Ereignissen nachrechnen, und kein Ereignis nennt eine Handkarte.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
aenderung: task/E8-farbendieb (PR #67)
---

## Worum es geht

Die Oberfläche soll aus den Ereignissen der Engine nachvollziehen können, wohin der Farbendieb eine Karte versetzt hat, ohne Zustände zu vergleichen (E4b). Hier laufen ganze Zufallspartien, in denen der Farbendieb so oft wie möglich gespielt und abgewehrt wird. Jeder Schritt wird nachgerechnet. Dazu wird gezählt, ob der Farbendieb auch in den vier Zufallspartien des gemeinsamen Nachrechentests vorkommt.

## Bestanden, wenn

Alle 9 Partien mit Vorzug (Saaten 101 bis 109, je 2, 3 und 4 Spieler) enden, und jeder Schritt lässt sich mit `spieleNach` nachrechnen; `verrateneHandkarten` bleibt leer. Zusammen gibt es mehr als 10 KartenVersetzt nach einem Farbendieb und mindestens eine Abwehr. In den Partien des gemeinsamen Tests (Saaten 1 bis 4 aus `zugablauf_ereignisse.test.ts`) wird der Farbendieb mindestens einmal angesagt und wirkt mindestens einmal.

## Fehlgeschlagen, wenn

Ein Schritt lässt sich nicht nachrechnen (Meldung mit Saat und Schritt), ein Ereignis nennt eine Handkarte, eine Partie endet nicht nach 3'000 Schritten, oder in den Partien des gemeinsamen Tests kommt kein Farbendieb vor.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Worktree auf `task/E8-farbendieb`, Stand ab Commit `bb19f19`, `npm ci` gelaufen |
| Ausgangslage prüfen | `git status` leer |

## Testdaten

Prüfskript `zz_pruefer_e8.test.ts`, als Beleg des Laufs abgelegt (Teile M1, M2 und M3). Saaten 1 bis 4 wie im gemeinsamen Test, Saaten 101 bis 109 mit Vorzug für „FarbendiebSpielen“ und für die Abwehr mit Farbenschutz.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Konsole im Repo | Prüfskript aus dem Beleg nach `src/engine/__tests__/zz_pruefer_e8.test.ts` kopieren | – | Datei neu, sonst nichts geändert |
| 2 | Konsole im Repo | ausführen | `npx vitest run src/engine/__tests__/zz_pruefer_e8.test.ts --silent=false --reporter=verbose` | Exit 0; Zeile „M1“ mit `farbendiebe` ≥ 1 und `versetzt` ≥ 1 je Saat; Zeile „M2“ mit 9 Partien |
| 3 | Konsole im Repo | Prüfskript löschen | – | `git status` leer |

## Nicht abgedeckte Grenzfälle

Partien mit Erweiterung laufen nur für gerade Saaten mit. Ob die KI den Farbendieb sinnvoll einsetzt, ist Sache von K2/K3 und hier nicht geprüft.
