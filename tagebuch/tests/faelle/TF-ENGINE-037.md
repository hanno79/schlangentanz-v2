---
id: TF-ENGINE-037
titel: Gespielte Farbenfusionen zwischen Regenbogenschlangen, nebeneinander und in Zufallspartien werten und melden sich richtig.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
aenderung: task/E7-farbenfusion (PR #65)
grenzfall_von: TF-ENGINE-036
---

## Worum es geht

Die Tests des Tasks legen die Fusion meist auf einfache Paare. Hier entsteht jede Fusion durch eine angebotene Aktion in Lagen, die dort fehlen: zwischen zwei Regenbogenschlangen, zwei Fusionen nebeneinander über zwei Züge, in der zweiten Schlange eines Gegners. Dazu kommen 120 Zufallspartien, in denen die Fusion bevorzugt gespielt wird.

## Bestanden, wenn

- Rot, Rot, Rot, Blockade, Regenbogenschlange, Grün, Grün, Regenbogenschlange mit Erweiterung: Nach der Fusion auf die beiden Grün gibt es zwei Gruppen, eine davon mit 6 Punkten, zusammen 9, und die Schlange zählt zwei Farben für den Vielfaltbonus (D30, D31, D32).
- Rot, Grün, Grün, Grün, Grün: Fusion auf Grün 1 und 2, im nächsten eigenen Zug Fusion auf Grün 3 und 4. Danach Rot, Farbenfusion, Farbenfusion, die Wertung `Rot×3=13`, keine Invariante verletzt, Speichern und Laden ändert nichts.
- Gegner mit Blau und Gelb, Gelb, Gelb: zwei Ziele; die Fusion auf Gelb 2 und 3 ändert nur die zweite Schlange.
- Zwei Karten aus verschiedenen Schlangen werden mit „liegt nicht in der Schlange“ abgelehnt.
- In 120 Zufallspartien (2 bis 4 Spieler, mit und ohne Erweiterung) stimmt nach jedem Schritt die nachgerechnete Lage, kein Ereignis nennt eine Handkarte, jede Partie endet, und jedes `KartenVersetzt` einer Fusion meldet die Karten darunter mit den Stellen 0 und 1.

## Fehlgeschlagen, wenn

Eine Punktzahl, eine Schlange oder ein Ereignis anders ausfällt als oben, eine Partie nicht endet oder ein Ereignis eine Handkarte nennt.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Worktree auf `task/E7-farbenfusion`, ab Commit `e48c49e` |

## Testdaten

Das Prüferskript liegt als Beleg beim Lauf; es wird für den Lauf nach `src/engine/__tests__/` kopiert und danach wieder entfernt.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Konsole im Repo | Prüferskript aus dem Beleg als `src/engine/__tests__/zz_e7_pruefer.test.ts` anlegen und ausführen | `npx vitest --run src/engine/__tests__/zz_e7_pruefer.test.ts` | Exit 0, „Tests 5 passed“ |
| 2 | Konsole im Repo | den Zufallslauf mit Ausgabe wiederholen | `npx vitest --run src/engine/__tests__/zz_e7_pruefer.test.ts -t Dauerlauf --silent=false` | „Fusionen mit UnterFusion-Meldung: 359“ |
| 3 | Konsole im Repo | Skript wieder löschen | | `git status` ohne die Datei |

## Nicht abgedeckte Grenzfälle

Eine Fusion, die gefressen wird, gehört zu E6. Ein Zustand mit gesetztem `farbenfusionGespielt` ohne gezählte Sonderkarte entsteht im Spiel nicht und ist nur im Regeltest von TF-ENGINE-036 geprüft.
