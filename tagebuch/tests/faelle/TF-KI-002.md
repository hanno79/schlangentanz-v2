---
id: TF-KI-002
titel: Weder die Sicht noch die angebotenen Aktionen verraten eine fremde Handkarte, die Reihenfolge der Stapel oder eine fremde geheime Aufgabe.
art: automatisch
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-20
veraendert_daten: nein
skript: src/ki/sicht.test.ts
aenderung: task/K1-ki-schnittstelle
grenzfall_von: TF-KI-001
---

## Worum es geht

Das ist die zweite Hälfte von Kriterium 1: Verdeckt bleibt, was am Tisch verdeckt liegt (B2, A9). Geprüft werden die Sicht und die Liste der Aktionen, die die KI bekommt, denn B2 verbietet auch das mittelbare Verraten über angebotene Aktionen. Der Prüfer stört dazu das Verborgene mitten in echten Partien auf eigene Weise.

## Bestanden, wenn

In den Tests des Umsetzers kommt für jeden Spieler keine verborgene Id und kein verborgener Aufgabenname in der Sicht vor, und 200 Zufallszustände ergeben nach dem Neumischen des Verborgenen dieselbe Sicht. In der eigenen Probe des Prüfers (24 und 18 Zufallspartien mit 2, 3 und 4 Spielern, mit und ohne Erweiterung) nennt keine Sicht und keine Aktionsliste eine verborgene Id, keine Sicht teilt ein Objekt mit dem Zustand, und nach dem Tausch fremder Handkarten mit dem Stapel, dem Umdrehen der Stapel, dem Rotieren fremder geheimer Aufgaben und dem Umkippen ihres Erfüllt-Status bleiben Sicht, Aktionsliste und Wahl der Zufalls-KI gleich.

## Fehlgeschlagen, wenn

Eine verborgene Id in Sicht oder Aktionsliste auftaucht, eine Sicht nach dem Stören anders ist oder die Zufalls-KI danach anders wählt.

## Vorbedingungen

| Was | Wert |
|---|---|
| Ausgangslage | Worktree auf dem geprüften Stand von `task/K1-ki-schnittstelle`, `npm ci` gelaufen |

## Testdaten

Umsetzer: Saat 4711 für 200 Zufallszustände. Prüfer: Partien mit Saaten 900 bis 923 und 500 bis 517, Störung mit Saat 31337.

## Technische Prüfung

`npx vitest run src/ki/sicht.test.ts` endet mit Exit 0. Für die eigene Probe die Datei aus dem Beleg vorübergehend als `src/ki/pruefer_k1.test.ts` ablegen und `npx vitest run src/ki/pruefer_k1.test.ts --reporter=verbose --silent=false` ausführen; erwartet 8 Tests grün. Danach die Datei wieder löschen. Gegenprobe: `geheimeAufgabeErfuellt` jedes Spielers in die `SpielerSicht` schreiben; dann werden zwei Sichttests rot.
