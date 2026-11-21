---
id: TF-ENGINE-029
titel: Gehen mehrere Karten auf eine Hand oder in den Nachziehstapel, nennt KartenVersetzt keine Id und bleibt gleich, egal wie die Karten danach verdeckt liegen.
art: manuell
regression: nein
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
aenderung: task/E4b-versetzt (PR #63)
grenzfall_von: TF-ENGINE-026
---

## Worum es geht

Handkarten der KI-Gegner und die Reihenfolge im Nachziehstapel sind geheim (B2). Das Ereignis geht an die Oberfläche aller Spieler. Es darf deshalb weder die Id einer Karte nennen, die verdeckt landet, noch über die Reihenfolge seiner Einträge verraten, in welcher Folge die Karten in Hand oder Stapel liegen.

## Bestanden, wenn

Zwei Läufe, die dieselben fünf Karten verdeckt ablegen (zwei offene auf die Hand von Spieler 2, eine offene und eine aus Spieler 2s Hand in den Stapel, eine aus der fremden Schlange in den Stapel), aber in verschiedener Reihenfolge und an verschiedenen Stellen im Stapel, ergeben genau dasselbe `KartenVersetzt`. Jeder der fünf Einträge hat `karteId: null`, und die Id der Handkarte steht nirgends im Ereignis.

## Fehlgeschlagen, wenn

Die beiden Ereignisse sich unterscheiden oder eine Id einer verdeckt liegenden Karte im Ereignis steht.

## Vorbedingungen

| Was | Wert |
|---|---|
| Ausgangslage | Worktree auf dem geprüften Stand von `task/E4b-versetzt`, `npm ci` gelaufen |

## Testdaten

Zwei Spieler mit Erweiterung, Spieler 1 mit Schlange Blau, Rot, Gelb, Grün, Spieler 2 mit Schlange Violett, Gelb und Hand Blau, Rot, Gelb, Blau, Rot. Lauf 1 legt Blau, Rot ans Ende der Hand und Violett, Gelb, Handkarte oben auf den Stapel; Lauf 2 legt Rot, Blau an den Anfang der Hand, Gelb an Stelle 7 und Handkarte, Violett oben auf den Stapel. Die Prüfdatei liegt dem Lauf als Beleg bei (Test „P4“).

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Konsole im Repo | Prüfdatei aus dem Beleg als `src/engine/__tests__/zz_pruefer_e4b_probe.test.ts` anlegen | Inhalt des Belegs | Datei liegt neben `kartenversetzt.test.ts` |
| 2 | Konsole im Repo | Test P4 mit Ausgabe ausführen | `npx vitest run src/engine/__tests__/zz_pruefer_e4b_probe.test.ts -t P4 --silent=false` | Exit 0; ausgegeben wird ein Ereignis mit fünf Einträgen, jeder mit `"karteId":null` |
| 3 | Konsole im Repo | Prüfdatei wieder löschen | | `git status` zeigt nichts |
