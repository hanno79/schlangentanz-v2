---
id: TF-ENGINE-078
titel: Die Comeback-Karte verhält sich in sieben Randlagen, die die Regeltests nicht nennen, so wie A5, A7.6, A8.1, D25, D49 und D56 es verlangen.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-24
veraendert_daten: nein
aenderung: task/X4-comeback (PR #111)
grenzfall_von: TF-ENGINE-076
---

## Worum es geht

Sieben Randlagen der Comeback-Karte: nur noch eine Handkarte, mehr als 5 Karten am Zugende, eine abgewehrte erste Farbenfusion, ein Spieler mit Rückstand vor einer Schlangengrube, eine beendete Partie, gar kein Rückstand und drei Farbenschutz als Zusatzaktionen. Sie stehen nicht in den Kriterien, können in einer Partie aber vorkommen.

## Bestanden, wenn

Alle sieben Fälle der Grenzfall-Datei sind grün: G1 mit einer Handkarte kein Abwerfen, die Karte geht als Zusatzaktion; G2 nach zweimal Abwerfen und einer Karte hält der Spieler 6 Karten und muss eine abwerfen, eine Comeback-Aktion wird dann mit „Zug ist beendet“ abgelehnt; G3 nach abgewehrter Fusion keine zweite Fusion mit Wirkung; G4 der Spieler vor der Grube setzt aus, der nächste mit 7 Karten Rückstand hat die Bedingung erfüllt; G5 fremde Spieler-Id und beendete Partie werden abgelehnt; G6 0 gegen 0 und 9 gegen 4 sind nicht erfüllt; G7 drei Farbenschutz lassen sich nach dem Einsatz wirkungslos ablegen (heutiges Verhalten, Regelfrage offen).

## Fehlgeschlagen, wenn

Einer der sieben Fälle ist rot.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Repo auf 9e253382, `npm ci` gelaufen |

## Testdaten

Stellungen aus dem Baukasten in der Grenzfall-Datei, zwei oder drei Spieler mit Erweiterung.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Repo | Grenzfall-Datei aus dem Beleg als `src/engine/__tests__/x4_pruefer_grenzfaelle.test.ts` ablegen |  | Datei liegt neben `comeback_hilfen.ts` |
| 2 | Konsole | ausführen | `npx vitest run src/engine/__tests__/x4_pruefer_grenzfaelle.test.ts --reporter=verbose` | 7 Tests bestanden, Exit-Code 0 |
| 3 | Repo | Datei löschen |  | `git status` ist leer |
