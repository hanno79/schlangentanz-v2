---
id: TF-ENGINE-048
titel: Die Schlangenhäutung verhält sich in sieben Grenzfällen ausserhalb der Kriterien regelgerecht.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
aenderung: task/E9-haeutung (PR #69)
grenzfall_von: TF-ENGINE-046
---

## Worum es geht

Die Kriterien von E9 decken den gewöhnlichen Zug ab. Hier geht es um Lagen, die leicht übersehen werden: der zweite Zug nach einem Verdoppler, eine KI als Angreifer, zwei Häutungen auf der Hand, unförmige Ansagen, eine erlaubte, aber nicht aufgezählte Anordnung, Sonderkarten an beiden Enden des Abschnitts und eine lange Schlange.

## Bestanden, wenn

- G1: Im zweiten Zug nach einem Verdoppler (`teilzug` 2) wirkt die Häutung; danach `gespielteSonderkarten` 1 und keine zweite Häutung.
- G2: Spielt Spieler 2 die Häutung in die Schlange von Spieler 1, nennt `KarteAngesagt` `betroffene: [0]`; Spieler 1 wehrt ab, seine Schlange bleibt Blau, Rot, Gelb, die Häutung liegt bei Spieler 2, der Schritt ist nachrechenbar.
- G3: Mit zwei Häutungen auf der Hand und der Schlange Blau, Rot, Gelb gibt es 10 Häutungen, je 5 für jede Karte.
- G4: Leere `neueReihenfolge` und eine Zahl darin ergeben „Feld neueReihenfolge ist ungültig“; die Häutung selbst und eine Handkarte im Abschnitt ergeben „liegt nicht in der Schlange“; eine Farbkarte als gespielte Karte wird abgelehnt.
- G5: In Rot, Blau, Rot, Gelb ist die Anordnung zweites Rot, erstes Rot, Blau, Gelb nicht aufgezählt, aber erlaubt und wird genau so gelegt.
- G6: In Schlangenblockade, Blau, Rot, Gelb, Regenbogenschlange mit zwei Karten auf dem Ablagestapel wird der Abschnitt zu Gelb, Blau, Rot; Blockade und Regenbogenschlange bleiben an Stelle 0 und 4, `KarteGespielt` nennt Ablagestapel Stelle 2.
- G7: Eine Schlange aus 12 Farbkarten in sechs Farben bietet 1'209 Häutungen mit 791 verschiedenen Endlagen; jede ist erlaubt.

## Fehlgeschlagen, wenn

Eine der Erwartungen trifft nicht zu oder eine Ansage bringt die Engine zum Absturz statt zu einem deutschen Grund.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Worktree auf `task/E9-haeutung`, Stand ab Commit `d750cda`, `npm ci` gelaufen |
| Ausgangslage prüfen | `git status` leer |

## Testdaten

Prüfskript `zz_pruefer_e9.test.ts`, als Beleg des Laufs abgelegt (Block „Prüfer E9: eigene Grenzfälle“, Tests G1 bis G7).

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Konsole im Repo | Prüfskript aus dem Beleg nach `src/engine/__tests__/zz_pruefer_e9.test.ts` kopieren und den Pfad in `MESS` auf eine Datei ausserhalb des Repos setzen | – | Datei neu, sonst nichts geändert |
| 2 | Konsole im Repo | nur die Grenzfälle ausführen | `npx vitest run src/engine/__tests__/zz_pruefer_e9.test.ts -t "G[1-7]"` | Exit 0, G1 bis G7 bestanden |
| 3 | Datei aus `MESS` | lesen | – | Zeile „G7: 1209 Häutungen, 791 verschiedene Endlagen“ |
| 4 | Konsole im Repo | Prüfskript löschen | – | `git status` leer |
