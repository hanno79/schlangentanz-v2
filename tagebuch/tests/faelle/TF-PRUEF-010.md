---
id: TF-PRUEF-010
titel: Wer in einer gelisteten Datei einen alten Verstoss gegen einen neuen tauscht, bekommt von npm run check:regeln Exit 1, obwohl die Anzahl gleich bleibt.
art: manuell
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
aenderung: task/P0.3b-pruefwerkzeuge-nachschaerfen (PR #28)
grenzfall_von: TF-PRUEF-009
---

## Worum es geht

Bis P0.3 zählte die Ausnahmeliste nur, wie viele Verstösse eine Datei haben darf. Wer einen alten behob und einen neuen einbaute, blieb grün. Jetzt steht jeder geduldete Verstoss mit seinem Merkmal in der Liste, und ein getauschter fällt auf.

## Bestanden, wenn

Schritt 2 endet mit Exit 1 und nennt den neuen Testnamen als Verstoss ohne passendes Merkmal und den alten als veraltet. Schritt 4 (Quelle und Liste getauscht, Vergleich mit einem Stand, dessen Liste schon Merkmale hat) endet mit Exit 1 und „wächst gegenüber“.

## Fehlgeschlagen, wenn

Schritt 2 oder Schritt 4 endet mit Exit 0.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | eigener Wegwerf-Branch auf dem zu prüfenden Commit, nach `npm ci` |
| Ausgangslage prüfen | `npm run check:regeln` endet mit 0 |

## Testdaten

In `src/engine/__tests__/color_groups.test.ts` (5 geduldete Verstösse) den Test `it('ignoriert Farbsequenzen mit weniger als drei Karten'` umbenennen in `it('ignoriert kurze Farbsequenzen'`. Für Schritt 3 in `scripts/check_regeln_ausnahmen.json` das Merkmal `Farbgruppen-Erkennung — R3.3 › ignoriert Farbsequenzen mit weniger als drei Karten` durch `Farbgruppen-Erkennung — R3.3 › ignoriert kurze Farbsequenzen` ersetzen. Vergleichsstand mit Merkmalen: der Task-Branch von P0.3b oder `origin/neuaufbau` nach dessen Merge.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Editor | Test umbenennen wie in „Testdaten“ | | Anzahl der Tests in der Datei bleibt 5 |
| 2 | Git Bash im Repo | Gate ausführen | `npm run check:regeln; echo $?` | Exit 1, „1 Verstösse ohne passendes Merkmal“, alter Name unter „Veraltete Ausnahmen“ |
| 3 | Editor | Merkmal in der Liste ebenso tauschen | | |
| 4 | Git Bash | Gate gegen einen Stand mit Merkmalen ausführen | `npm run check:regeln -- --vergleich origin/task/P0.3b-pruefwerkzeuge-nachschaerfen; echo $?` | Exit 1, „wächst gegenüber“, neues Merkmal genannt |
| 5 | Git Bash | zurücksetzen | `git checkout -- .` | `git status --short` leer |
