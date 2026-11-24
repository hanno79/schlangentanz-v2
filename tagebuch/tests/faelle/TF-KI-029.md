---
id: TF-KI-029
titel: Mit Risiko-Karten nennt weder die Sicht noch ein Ereignis, eine offene Entscheidung oder eine verdeckte Wahl eine Karte, die ein anderer Spieler nicht sehen darf.
art: manuell
regression: nein
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-24
veraendert_daten: nein
aenderung: task/X5-risiko (PR #117)
---

## Worum es geht

Risiko-Karten ziehen Karten verdeckt, legen Karten zurück auf die Hand und fragen Wahlen aus der eigenen Hand ab. Keine dieser Stellen darf einem anderen Spieler eine verdeckte Karte verraten (B2). Offen ist nur die Farbkarte, die ein Spieler für Aktion 2 ansagt (D52), und die Karte, die offen aufgedeckt wurde.

## Bestanden, wenn

Die Störprobe über 40 Zufallspartien mit Erweiterung (Saaten 8701 bis 8740, 2 bis 4 Spieler) meldet keine verdeckte Karten-Id in Ereignissen, Sicht, Entscheidungsdaten und verdeckten Wahlen. Ausgenommen sind die für Aktion 2 angesagte Karte und Unterschiede, die nur entstehen, weil das Prüfwerkzeug eine öffentlich auf die Hand zurückgetauschte Karte wegmischt.

## Fehlgeschlagen, wenn

Die Störprobe nennt eine andere Karten-Id, etwa eine gezogene Karte im Ereignis oder eine Handkarte in den `optionen` einer Entscheidung.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Repo auf dem geprüften Stand von `task/X5-risiko`, `npm ci` gelaufen |

## Testdaten

Störproben-Datei aus dem Beleg; Zufallsaktionen mit Saat `saat * 7 + 3`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Repo | Datei als `src/x5_stoerprobe.test.ts` ablegen und ausführen | `PRUEFSUMME_DATEI=<datei> npx vitest run src/x5_stoerprobe.test.ts` | Zeile `STOERPROBE …` mit der Zahl der Befunde |
| 2 | Ausgabedatei | Befunde lesen |  | nur die zwei Ausnahmen aus „Bestanden, wenn“ |
| 3 | Repo | Datei löschen |  | `git status` ist leer |

## Nicht abgedeckte Grenzfälle

Die Sicht des Menschen am Spieltisch (O10) gibt es noch nicht; geprüft ist die Sicht der KI und alles, was Ereignisse an alle melden.
