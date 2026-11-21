---
id: TF-ENGINE-057
titel: Wirkt der Farbendieb mit einer Karte, die nicht in der genannten Schlange liegt, bricht die Engine mit „Die Karte … liegt nicht in der Schlange …“ ab, statt still eine andere Karte zu nehmen.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
aenderung: task/R1-kartenhilfen (PR #74)
grenzfall_von: TF-ENGINE-056
---

## Worum es geht

Seit R1 nimmt `nimmAusSchlange` in `src/engine/schlangen.ts` die Karte für Farbendieb und Schlangenfrass aus der Schlange. Liegt die Karte nicht dort, wirft die Funktion. Vorher nahm der Farbendieb in diesem Fall still die letzte Karte der Schlange. Ein erlaubter Zug kommt nicht dorthin, weil die Prüfung eine solche Aktion vorher ablehnt. Wird `wirke` an der Prüfung vorbei aufgerufen, muss der Fehler trotzdem sichtbar werden.

## Bestanden, wenn

Auf `35c1af7` endet der direkte Aufruf von `wirke` des Farbendiebs mit „Error: Die Karte blau-01 liegt nicht in der Schlange schlange-2.“, und `anwendeAktion` lehnt dieselbe Aktion mit demselben Text ab. Auf `cf0b3f1` kommt `wirke` ohne Fehler zurück und hat gelb-01 aus schlange-2 genommen; das belegt, dass der Fall vorher still durchging. In den 400 Partien und 1'500 Zufallszuständen aus TF-ENGINE-056 tritt keine Ausnahme auf.

## Fehlgeschlagen, wenn

`wirke` auf `35c1af7` ohne Fehler zurückkommt, `anwendeAktion` die Aktion ausführt, oder in einer Partie oder einem Zufallszustand eine Ausnahme mit „liegt nicht in der Schlange“ gemeldet wird.

## Vorbedingungen

| Was | Wert |
|---|---|
| Ausgangslage | Worktree mit `npm ci`; Basis `cf0b3f1` und Stand `35c1af7` lassen sich nacheinander auschecken |

## Testdaten

Baukasten zu zweit ohne Erweiterung: Spieler 1 hat schlange-1 mit blau-01 und hält farbendieb-01, Spieler 2 hat schlange-2 mit rot-01 und gelb-01. Die Aktion `FarbendiebSpielen` nennt als Quelle schlange-2, aber die Karte blau-01 von Spieler 1, Ziel „neueSchlange“. Das Prüfskript liegt dem Lauf als Beleg bei.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Konsole im Repo | Prüfskript aus dem Beleg als `src/engine/__tests__/zz_r1_grenzfaelle.test.ts` anlegen | Inhalt des Belegs | Datei ist nicht versioniert |
| 2 | Konsole im Repo | auf dem Stand des Branches ausführen | `R1_AUS=<ordner> R1_STAND=35c1af7 npx vitest run src/engine/__tests__/zz_r1_grenzfaelle.test.ts` | Exit 0; in `grenzfaelle-35c1af7.txt` unter „K4“ zweimal der Fehlertext |
| 3 | Konsole im Repo | Basis auschecken, wiederholen, zurück auf den Branch, Skript löschen | `git switch --detach cf0b3f1`, dann wie Schritt 2 mit `R1_STAND=cf0b3f1` | unter „K4 wirke“ steht „kein Fehler“, schlange-2 hat nur noch rot-01 |
