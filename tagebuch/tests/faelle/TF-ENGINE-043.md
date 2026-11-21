---
id: TF-ENGINE-043
titel: Ungültige Stellen werden für Regenbogenschlange und Blockade abgelehnt, bei vier Spielern wird nur der Besitzer der Schlange gefragt, und solange eine Blockade schwebt oder eine Farbkarte beim Gegner liegt, bekommt der Angreifer keine weitere Farbkarte.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
aenderung: task/E5-legen (PR #66)
grenzfall_von: TF-ENGINE-042
---

## Worum es geht

Grenzfälle zum Legen, die der Task-Block nicht nennt: Stellen ausserhalb der Schlange (negativ, keine ganze Zahl, hinter dem Ende), die Abwehrfrage am Tisch mit vier Spielern, eine Aktion des Angreifers, während seine Ansage noch offen ist (A6), und ein Spieler ohne eigene Schlange, der seine Farbkarte beim Gegner anlegt und danach keine zweite bekommt (A5, D12).

## Bestanden, wenn

- Stelle -1, 0,5 und NaN werden für beide Karten mit „Feld position ist ungültig“ abgelehnt, Stelle 3 in einer Schlange mit zwei Karten mit „Die Stelle 3 gibt es in schlange-1 nicht: erlaubt sind 0 bis 2 (A7.3)“ beziehungsweise „(A7.5)“.
- Vier Spieler, alle drei Gegner mit Farbenschutz, Blockade in schlange-3 von Spieler 4: KarteAngesagt nennt `betroffene: [3]`, es entscheidet Spieler 4, alle angebotenen Aktionen gehören spieler-4; nach dem Abwehren entscheidet wieder Spieler 1, keine Invariante verletzt.
- Während die Blockade schwebt, lehnt die Engine eine Farbkarte von Spieler 1 ab mit „Die Schlangenblockade schwebt noch: Erst entscheiden die Betroffenen, ob sie abwehren (A6).“
- Spieler 1 ohne eigene Schlange legt Blau an die Schlange des Gegners; danach ist nur ZugBeenden angeboten, und Spieler 1 hat weiter keine Schlange.

## Fehlgeschlagen, wenn

Eine ungültige Stelle angenommen wird, ein anderer als Spieler 4 gefragt wird, der Angreifer während der offenen Frage handeln darf oder nach der Farbkarte beim Gegner eine zweite Farbkarte oder eine neue Schlange angeboten wird.

## Vorbedingungen

| Was | Wert |
|---|---|
| Ausgangslage | Worktree auf `206ca15`, `npm ci` gelaufen, `git status` leer |

## Testdaten

Prüfdatei `zz_pruefer_e5.test.ts` aus dem Beleg des Laufs (Abschnitte „Grenzfall 1“ bis „Grenzfall 4“), mit den Hilfen aus `legen_hilfen.ts` und `zugablauf_hilfen.ts`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Editor | Prüfdatei anlegen | Inhalt aus dem Beleg nach `src/engine/__tests__/zz_pruefer_e5.test.ts` | nur diese Datei neu |
| 2 | Konsole im Repo | Grenzfälle ausführen | `npx vitest run src/engine/__tests__/zz_pruefer_e5.test.ts -t Grenzfall --reporter=verbose --silent=false` | 7 grün; die ausgegebenen Meldungen wie unter „Bestanden, wenn“ |
| 3 | Konsole im Repo | Prüfdatei löschen | `rm src/engine/__tests__/zz_pruefer_e5.test.ts` | `git status` leer |
