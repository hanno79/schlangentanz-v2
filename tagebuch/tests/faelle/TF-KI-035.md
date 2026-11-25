---
id: TF-KI-035
titel: Nach K5 rechnet die solide KI je Schritt höchstens 64 Stellungen durch und braucht unter 500 ms, auch in der späten Stellung mit 1'500 Aktionen.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-25
veraendert_daten: nein
aenderung: task/K5-staerkenachweis (PR #122)
---

## Worum es geht

K5 ändert die solide KI nicht, aber die Registry bekommt eine dritte Strategie. Die Probe misst die Suchgrenzen aus K2.8 selbst nach, mit Zahlen statt nur grün oder rot.

## Bestanden, wenn

In der späten Stellung aus `zugsuche.test.ts` (1'500 Aktionen) bleibt jeder der drei Schritte unter 500 ms und bei höchstens 64 durchgerechneten Stellungen. In vier Partien, in denen die solide KI alle Sitze spielt, gilt dasselbe für jeden Schritt.

## Fehlgeschlagen, wenn

Ein Schritt braucht 500 ms oder mehr oder rechnet mehr als 64 Stellungen durch.

## Vorbedingungen

| Was | Wert |
|---|---|
| Ausgangslage | Worktree auf dem geprüften Stand, `npm ci` gelaufen, keine anderen Testläufe dieses Worktrees gleichzeitig |

## Testdaten

Späte Stellung: drei Spieler, Saat 91, Zufall 1, 2 und 3. Partien: 2 Spieler Saat 424'242, 3 Spieler mit Erweiterung 515'151, 4 Spieler mit Erweiterung 616'161, 4 Spieler 717'171.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Konsole im Repo | Probe aus dem Beleg als `tests/zz_pruefer_suche.test.ts` ablegen und ausführen | `npx vitest run tests/zz_pruefer_suche.test.ts --silent=false` | Zeilen „PRUEFER Späte Stellung …“ und „PRUEFER Vier Partien …“ |
| 2 | Konsole im Repo | Probe löschen | `rm tests/zz_pruefer_suche.test.ts` | `git status` ohne Änderungen |

## Nicht abgedeckte Grenzfälle

Die Zeit hängt von der Last des Rechners ab. Gemessen wurde, während ein anderer Prüfer im selben Repo Vorschau-Server laufen liess. Partien mit 1 oder 5 Spielern erlaubt die Engine nicht (A2).
