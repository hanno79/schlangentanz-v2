---
id: TF-KI-008
titel: Die solide KI entscheidet nur nach ihrer Sicht; neu gemischte fremde Hände, Stapel und geheime Aufgaben ändern ihre Wahl nie, und eine Spion-Strategie kommt über Stellung und Sicht an nichts Verdecktes.
art: automatisch
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
skript: src/ki/strategien/zugsuche.test.ts
aenderung: task/K2-solide-ki (PR #71)
---

## Worum es geht

Kriterium 7 von K2: Die solide KI rechnet Züge auf einem erratenen Zustand durch, den der Rahmen aus ihrer Sicht füllt. Sie darf dabei nie an fremde Handkarten, die Reihenfolge des Nachziehstapels oder fremde geheime Aufgaben kommen, auch nicht über die Verweise der Stellung, die der Rahmen ihr gibt.

## Bestanden, wenn

Die Tests des Umsetzers in `zugsuche.test.ts` und `sicht_simulation.test.ts` sind grün. In der eigenen Probe des Prüfers bleibt die Wahl in allen Stellungen gleich, nachdem das Verdeckte mit einem eigenen Mischverfahren gestört wurde (Erwartung: 0 Abweichungen bei mindestens 200 Stellungen). Die Spion-Strategie teilt kein Objekt mit dem echten Zustand, sieht in keiner Sicht eine fremde Hand, errät fremde Handkarten und die oberste Stapelkarte nicht öfter als reines Raten, und ihre Wahl ändert sich bei gestörtem Verdeckten nicht.

## Fehlgeschlagen, wenn

Eine Wahl sich nach dem Stören ändert, die Spion-Strategie ein Objekt des echten Zustands erreicht oder fremde Karten deutlich öfter trifft, als reines Raten erwarten lässt.

## Vorbedingungen

| Was | Wert |
|---|---|
| Ausgangslage | Worktree auf dem geprüften Stand von `task/K2-solide-ki`, `npm ci` gelaufen |

## Testdaten

Stellungen aus 32 Partien der soliden KI gegen Zufalls-KIs (Saaten 9100 bis 9111, 9200 bis 9209, 9300 bis 9309), darunter Reaktionen, Schlussrunde und zweiter Teilzug. Störung mit einem eigenen linearen Kongruenzgenerator ab Saat 500 und 7000.

## Technische Prüfung

`npx vitest run src/ki/strategien/zugsuche.test.ts src/ki/sicht_simulation.test.ts` endet mit Exit 0. Für die eigene Probe die Datei aus dem Beleg vorübergehend als `tests/pruefer_k2.test.ts` ablegen und mit `PRUEFER_LOG=<datei> npx vitest run tests/pruefer_k2.test.ts` ausführen; die Ergebnisse stehen in der Logdatei. Danach die Datei wieder löschen.

## Nicht abgedeckte Grenzfälle

KI-Saat gleich Partiesaat steht als TF-KI-011. Eine Strategie, die die Partiesaat kennt, ist eine bekannte Grenze aus U5 und wird hier nicht geprüft.
