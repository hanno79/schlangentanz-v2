---
id: TF-ENGINE-009
titel: Die Jokerwahl der Wertung erreicht in kniffligen Fällen dieselbe Summe wie ein unabhängiges Durchprobieren aller Farben.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
aenderung: task/E10-wertung (PR #33)
grenzfall_von: TF-ENGINE-007
---

## Worum es geht

Die Wertung wählt die Farben der Joker mit einer Suche, nicht durch Ausprobieren. Ein eigener, vom Umsetzer unabhängiger Vergleich probiert jede Farbbelegung durch und zeigt, ob die Suche in schwierigen Lagen dieselbe höchste Summe findet. Dazu gehört, dass der Zwischenstand eines Spielers nichts über die geheime Aufgabe eines anderen verrät.

## Bestanden, wenn

In allen Fällen unter „Testdaten“ ist die Summe der Wertung (Gruppenpunkte plus Vielfaltbonus) gleich der besten Summe des Durchprobierens, mit und ohne Erweiterung, und die Gruppen der Aufschlüsselung ergeben zusammen die gemeldeten Gruppenpunkte. Eine Wertung mit 8 Jokern in zwei Schlangen zu je 54 Karten dauert unter 100 ms. Der Zwischenstand aus Sicht von Spieler 1 ist zeichengleich, ob Spieler 2 seine geheime Aufgabe erfüllt hat oder nicht, und nennt sie nicht.

## Fehlgeschlagen, wenn

Die Wertung eine kleinere Summe meldet als das Durchprobieren, die Aufschlüsselung nicht aufgeht, eine Wertung mit 8 Jokern 100 ms oder länger braucht oder der Zwischenstand sich mit der fremden geheimen Aufgabe ändert.

## Vorbedingungen

| Was | Wert |
|---|---|
| Ausgangslage | Worktree auf dem geprüften Stand von `task/E10-wertung`, `npm ci` gelaufen |

## Testdaten

Zehn feste Auslagen: mehrere Joker nebeneinander, Joker zwischen zwei Gruppen, Joker zwischen zwei fertigen Gruppen, Vielfaltbonus gegen höhere Gruppenpunkte, Joker am Schlangenende (zählt nicht über das Ende), Joker an beiden Enden, zwei Schlangen mit abhängigem Bonus, Gruppen nur aus Jokern (G9 wörtlich), Fusion verbindet zwei Gruppen, 8 Joker eng beieinander. Dazu 300 Zufallsauslagen mit bis zu 6 Jokern (Saat 4711) und 1500 Zufallsauslagen auf der Suche nach einem Fall „weniger Gruppenpunkte, mehr Summe“ (Saat 99).

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Konsole im Repo | Prüfdatei aus dem Beleg als `src/engine/__tests__/zz_pruefer_e10.test.ts` ablegen | Inhalt des Belegs `E10-zz_pruefer_e10.test.ts.txt` | Datei liegt neben den Wertungstests |
| 2 | Konsole im Repo | ausführen | `npx vitest run src/engine/__tests__/zz_pruefer_e10.test.ts --reporter=verbose` | Exit 0, alle Tests grün, Zeilen mit `[E10P]` nennen Summe der Wertung und des Durchprobierens |
| 3 | Konsole im Repo | Prüfdatei wieder löschen | | `git status` zeigt keine Änderung |
