---
id: TF-ENGINE-065
titel: Frisst ein Mitspieler eine von zwei Fusionen, gilt Fusionsexperte nicht mehr, und eine früher gespielte Häutung löst eine später aufgedeckte Schlangentanz-Karte ein.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-23
veraendert_daten: nein
aenderung: task/X2c-aufgaben-sonderkarten (PR #109)
grenzfall_von: TF-ENGINE-064
---

## Worum es geht

Fusionsexperte liest die Liste der Fusionen einer Schlange, nicht die Karten selbst. Wird eine Fusion gefressen, muss diese Liste mitgehen. Der Zähler für Schlangentanz bleibt die ganze Partie stehen. Geprüft wird deshalb auch, was passiert, wenn Schlangentanz erst nach der Häutung offen liegt.

## Bestanden, wenn

Nach dem Schlangenfrass auf eine der beiden Fusionen des KI-Gegners hat seine Schlange genau 1 Fusion, und Fusionsexperte gilt für ihn nicht mehr. Nach der Häutung des Beispiels aus A9 steht der Zähler auf 2, ohne Ereignis. Im nächsten eigenen Zug legt Spieler 1 eine Regenbogenschlange als vierte Sonderkarte. Darauf folgen AufgabeErfuellt für Schlangenbeschwörer, das Aufdecken von Schlangentanz und AufgabeErfuellt für Schlangentanz.

## Fehlgeschlagen, wenn

Die gefressene Fusion zählt noch, oder Schlangentanz wird nach dem Aufdecken nicht eingelöst, obwohl der Zähler auf 2 steht.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Repo mit `npm ci`, Stand ab Commit b4942251 |

## Testdaten

Erster Fall: KI-Gegner 1 hat die Schlange Fusion (Rot, Rot), Gelb, Fusion (Blau, Blau), Spieler 1 hält einen Schlangenfrass und frisst Fusion und Gelb (Option c). Zweiter Fall: Spieler 1 hat die Schlangen aus dem Beispiel zu Schlangentanz und Gelb, Regenbogenschlange, Blockade, Fusion (Rot, Rot); offen liegen Schlangenbeschwörer, Lila Riese und Gelber Schatz, oben auf dem Aufgabenstapel Schlangentanz.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Konsole im Repo | Prüfdatei aus dem Beleg als `src/engine/__tests__/zz_pruefer_x2c_grenz_tmp.test.ts` ablegen | Inhalt des Belegs `…-TF-ENGINE-065-1.txt` | Datei liegt neben `aufgaben_c_hilfen.ts` |
| 2 | Konsole im Repo | ausführen | `npx vitest run src/engine/__tests__/zz_pruefer_x2c_grenz_tmp.test.ts --silent=false --reporter=verbose` | Exit 0, drei Tests grün, Zeile `GF1a fusionen 1 karten Rot Rot Farbenfusion`, Zeile `GF2 Ereignisse` mit aufgabe-08, aufgabe-12 aufgedeckt, aufgabe-12 erfüllt |
| 3 | Konsole im Repo | Prüfdatei wieder löschen | | `git status` zeigt sie nicht mehr |

## Technische Prüfung

Der dritte Test der Datei zeigt nur, dass die Engine keinen Diebstahl einer Fusion aufzählt (0 Aktionen); das gehört zu E8 und ist hier keine Bedingung. Ob das Einlösen mit einer Häutung aus einem früheren Zug den Regeln entspricht, ist eine offene Auslegung und steht im Prüfprotokoll X2c.
