---
id: TF-ENGINE-079
titel: Verrät „Zwei Karten abwerfen, drei ziehen“ eine gezogene Karte in einem Ereignis oder im Zug, schlagen die B2-Tests an.
art: manuell
regression: nein
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-24
veraendert_daten: nein
aenderung: task/X4-comeback (PR #111)
---

## Worum es geht

Beim Abwerfen und Ziehen kommen drei Karten verdeckt auf die Hand. Kein Gegner darf ihre Ids sehen (B2). Die Probe baut absichtlich zwei Lecks ein und prüft, ob die Tests sie finden.

## Bestanden, wenn

Störprobe 1 (das Ereignis `KartenGezogen` trägt die Ids) macht den B2-Test in `A8.1_comeback_zusatzaktionen.test.ts` rot, Störprobe 2 (die Ids stehen in `zug.runde`) macht die B2-Tests in `A8.1_comeback_zusatzaktionen.test.ts` und `comeback_ki.test.ts` rot. Ohne Störung sind beide grün.

## Fehlgeschlagen, wenn

Ein B2-Test bleibt bei einer der beiden Störungen grün.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Repo auf 9e253382 |

## Testdaten

Die Stellungen der beiden Testdateien; Spieler 1 hält fünf Farbkarten, KI-Gegner 1 hat 6 Karten in der Schlange.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | `src/engine/erweiterung/comeback.ts`, `werfeZweiAbZieheDrei` | dem Ereignis `KartenGezogen` ein Feld `verraten` mit den Ids der zuletzt gezogenen Handkarten geben |  | Datei geändert |
| 2 | Konsole | Tests ausführen | `npx vitest run src/engine/__tests__/regeln/A8.1_comeback_zusatzaktionen.test.ts src/ki/strategien/comeback_ki.test.ts` | „B2: kein Ereignis und nicht die Sicht des Gegners …“ rot |
| 3 | Konsole | zurücksetzen | `git checkout -- src/engine/erweiterung/comeback.ts` | `git status` leer |
| 4 | `comeback.ts`, `werfeZweiAbZieheDrei` | nach dem Ziehen die Ids der gezogenen Karten in `zustand.zug.runde` schreiben |  | Datei geändert |
| 5 | Konsole | nur die B2-Tests ausführen | dieselben Dateien mit `-t B2` | beide B2-Tests rot |
| 6 | Konsole | zurücksetzen | `git checkout -- src/engine/erweiterung/comeback.ts` | `git status` leer |

## Nicht abgedeckte Grenzfälle

Ein Leck über den Ablagestapel gibt es nicht, weil die abgeworfenen Karten offen liegen dürfen. Lecks in der Oberfläche prüft O10.
