---
id: TF-ENGINE-034
titel: Auch mit vier Spielern, einer Fusion neben einer zweiten gefressenen Karte, einer leer gefressenen eigenen Blockade und in Zufallspartien voller Schlangenfrass lässt sich jeder Schritt aus den Ereignissen nachrechnen.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
aenderung: task/E6-schlangenfrass (PR #68)
grenzfall_von: TF-ENGINE-033
---

## Worum es geht

Die Grenzfälle stehen nicht in den Kriterien von E6. Sie prüfen die Reihenfolge auf dem Ablagestapel, wenn der Angreifer nicht Spieler 1 ist, die Positionen beim Fressen neben einer Fusion, eine leer gefressene Schlange bei Option b) und viele Schlangenfrass-Züge in echten Partien.

## Bestanden, wenn

- G1: Vier Spieler, Spieler 3 frisst je eine Karte von Spieler 2 und Spieler 4. Gefragt wird zuerst Spieler 4, dann Spieler 2. Lassen beide durch, liegt auf dem Ablagestapel von Spieler 3 zuerst der Schlangenfrass, dann die Karte von Spieler 4, dann die von Spieler 2. Wehrt Spieler 4 ab, bleibt seine Schlange ganz, und nur die Karte von Spieler 2 wird gefressen.
- G2: Rot, Fusion aus Blau und Blau, Gelb, Grün beim Gegner. Frisst c) die Fusion und die Gelb, bleibt Rot, Blau, Blau, Grün. Der Ablagestapel nennt danach die Fusion vor der Gelb.
- G3: Ist die eigene Blockade die einzige Karte einer Schlange, verschwindet die Schlange mit b), und `KartenVersetzt.aufgeloest` nennt ihre Id.
- G4: In sechs Zufallspartien, in denen der Schlangenfrass immer gewählt wird, sobald er angeboten ist, kommen Option a) und c) vor, und auch eine Abwehr. Jeder Schritt lässt sich nachrechnen, kein Ereignis nennt eine Handkarte, keine Invariante ist verletzt.
- G5: In den vier Zufallspartien des bestehenden Nachrechentests kommt der Schlangenfrass vor.
- In G1 bis G3 lässt sich jeder Schritt mit `spieleNach` nachrechnen.

## Fehlgeschlagen, wenn

Eine Reihenfolge, eine Position oder ein gemeldeter Ort nicht stimmt, ein Schritt nicht nachrechenbar ist oder ein Ereignis eine Handkarte nennt.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Worktree auf `task/E6-schlangenfrass`; die Prüferdatei liegt für den Lauf unter `src/engine/__tests__/` und wird danach wieder entfernt |

## Testdaten

G4: Saaten 101 bis 106, Spielerzahl `2 + Saat mod 3`, Erweiterung bei gerader Saat. G5: die Saaten 1 bis 4 aus `zugablauf_ereignisse.test.ts`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Git Bash im Worktree | Prüferdatei (Beleg `…-quelltext.txt` dieses Laufs) als `src/engine/__tests__/pruefer_e6_tmp.test.ts` ablegen | | Datei liegt nur für den Lauf dort |
| 2 | Git Bash im Worktree | Befehl unter „Technische Prüfung“ ausführen | | 5 passed, Zähler wie unten |
| 3 | Git Bash im Worktree | Prüferdatei wieder löschen | | `git status` zeigt ausserhalb von `tagebuch/` nichts |

## Technische Prüfung

`npx vitest --run --reporter=verbose src/engine/__tests__/pruefer_e6_tmp.test.ts`. Erwartet: 5 passed. In der Ausgabe stehen die Zähler: G4 mit 24 Schlangenfrass (19 c, 5 a, 0 b) und 4 Abwehren, G5 mit je 4 Zügen c) in den Saaten 1 bis 4.

## Nicht abgedeckte Grenzfälle

Option b) kommt in den Zufallspartien nicht vor, weil dort selten eine eigene Blockade liegt; b) prüfen G3 und die Regeltests. Ein Schlangenfrass im zweiten Zug nach einem Verdoppler ist nicht eigens geprüft; dort gilt der allgemeine Zugablauf aus E3.
