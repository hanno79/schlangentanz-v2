---
id: TF-ENGINE-082
titel: Partien ohne Erweiterung laufen mit den Risiko-Karten genau so wie vorher.
art: manuell
regression: nein
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-24
veraendert_daten: nein
aenderung: task/X5-risiko (PR #117)
---

## Worum es geht

Die Risiko-Karten gibt es nur mit Erweiterung. Eine Partie ohne Erweiterung darf sich deshalb in keinem Schritt ändern, weder bei den angebotenen Aktionen und Ereignissen noch im Endstand. Verglichen wird eine Prüfsumme über viele Partien auf `origin/neuaufbau` und auf dem Task-Stand.

## Bestanden, wenn

Die drei Prüfsummen sind auf beiden Ständen gleich: Zufallsaktionen über 60 Partien (Saaten 9101 bis 9160), Zufalls-KI über 30 Partien (Saaten 9201 bis 9230) und solide KI gegen Zufalls-KI über 4 Partien (Saaten 9301 bis 9304).

## Fehlgeschlagen, wenn

Eine der drei Prüfsummen unterscheidet sich.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Repo auf dem geprüften Stand von `task/X5-risiko`, dazu ein Abzug von `origin/neuaufbau` (`git archive`) mit verknüpftem `node_modules` |

## Testdaten

Prüfsummen-Datei aus dem Beleg; sie hasht je Schritt die Aktionsliste und die Ereignisse, am Ende den gespeicherten Zustand, bei den KI-Partien den Verlauf und die Punkte.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Abzug von `origin/neuaufbau` | Datei als `src/x5_pruefsumme.test.ts` ablegen und ausführen | `PRUEFSUMME_DATEI=<datei> npx vitest run src/x5_pruefsumme.test.ts` | Zeile `PRUEFSUMME …` in der Datei |
| 2 | Repo auf dem Task-Stand | dasselbe, danach die Datei wieder löschen | wie in Schritt 1 | dieselbe Zeile `PRUEFSUMME …`, `git status` leer |

## Nicht abgedeckte Grenzfälle

Partien mit Erweiterung ändern sich mit X5 absichtlich, weil die Zufalls-KI jetzt Risiko-Karten spielt; sie sind nicht verglichen. Die solide KI ist nur in 4 Partien verglichen, weil sie langsam rechnet; die Golden-Master-Tests und `solideKi_basis.test.ts` laufen zusätzlich in `npm test`.
