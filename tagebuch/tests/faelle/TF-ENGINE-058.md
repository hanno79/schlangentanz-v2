---
id: TF-ENGINE-058
titel: Baukasten, Schlangenfrass und Farbendieb verhalten sich an den Rändern der gemeinsamen Schlangenhilfen nach R1 genau wie auf der Basis cf0b3f1.
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

R1 hat an drei Stellen die Reihenfolge im Code verschoben. Der Baukasten legt eine neue Schlange jetzt an, bevor er ihre Karten nimmt. Der Schlangenfrass frisst über dieselbe Hilfe wie der Farbendieb. Und der Farbendieb beginnt seine neue Schlange über `beginneSchlange`. Geprüft wird jeweils der Rand: ein Fehler mitten im Aufbau, die letzte Karte einer Schlange und eine gefressene Fusion.

## Bestanden, wenn

`grenzfaelle-35c1af7.txt` und `grenzfaelle-cf0b3f1.txt` unterscheiden sich nur in der Zeile unter „K4 wirke Farbendieb“, die TF-ENGINE-057 prüft. Auf beiden Ständen gilt: G1 meldet „Keine freie Karte mit der Id gibt-es-nicht“, danach hat Spieler 2 keine Schlange, der Zähler steht auf 1, und die nächste Schlange heisst schlange-2. G2 zeigt bei Spieler 2 rot-01, gruen-01, gruen-02, blau-01 ohne Fusion, bei Spieler 3 nur noch schlange-3 mit rot-02 und rot-03, auf dem Ablagestapel von Spieler 1 schlangenfrass-01, farbenfusion-01, gelb-01. G3 zeigt bei Spieler 1 schlange-2 mit rot-01, bei Spieler 2 keine Schlange, Zähler 2.

## Fehlgeschlagen, wenn

Die Dateien in einer anderen Zeile als unter K4 voneinander abweichen, nach dem Fehler in G1 eine leere oder halbe Schlange stehen bleibt oder der Zähler weitergezählt hat, oder in G2 oder G3 eine leere Schlange stehen bleibt.

## Vorbedingungen

| Was | Wert |
|---|---|
| Ausgangslage | Worktree mit `npm ci`; Basis `cf0b3f1` und Stand `35c1af7` lassen sich nacheinander auschecken |

## Testdaten

G1: Baukasten zu zweit, Spieler 1 hat eine Schlange mit Rot; dann eine Schlange für Spieler 2 aus Blau, Gelb und der Karte `gibt-es-nicht`. G2: zu dritt; Spieler 2 hat Rot, Farbenfusion auf Grün und Grün, Blau; Spieler 3 hat eine Schlange mit Gelb und eine mit Rot, Rot; Spieler 1 frisst mit Option c) die Fusion und das Gelb, beide lassen durch. G3: zu zweit; Spieler 1 hat keine Schlange, Spieler 2 nur Rot; Spieler 1 stiehlt das Rot in eine neue Schlange, Spieler 2 lässt durch. Das Prüfskript liegt dem Lauf als Beleg bei.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Konsole im Repo | Prüfskript aus dem Beleg als `src/engine/__tests__/zz_r1_grenzfaelle.test.ts` anlegen | Inhalt des Belegs | Datei ist nicht versioniert |
| 2 | Konsole im Repo | auf dem Stand des Branches ausführen | `R1_AUS=<ordner> R1_STAND=35c1af7 npx vitest run src/engine/__tests__/zz_r1_grenzfaelle.test.ts` | Exit 0 |
| 3 | Konsole im Repo | Basis auschecken und wiederholen | `git switch --detach cf0b3f1`, dann wie Schritt 2 mit `R1_STAND=cf0b3f1` | Exit 0 |
| 4 | Konsole im Repo | beide Dateien vergleichen, zurück auf den Branch, Skript löschen | `diff` | nur die Zeile unter K4 verschieden |
