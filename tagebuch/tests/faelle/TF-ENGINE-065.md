---
id: TF-ENGINE-065
titel: Gilt eine Zusatzaktion nur für eine gezogene Karte, hängt nicht von der Reihenfolge ab, ob eine zweite Farbkarte noch Platz hat.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-23
veraendert_daten: nein
aenderung: task/X3-zusatzaktionen (PR #108)
---

## Worum es geht

Der Rahmen verteilt gespielte Karten auf die Plätze des Zuges, statt zu zählen. Spielt man die gezogene Karte zuerst, belegt sie nicht endgültig den normalen Platz; eine nicht gezogene Karte muss danach trotzdem auf den normalen Platz passen.

## Bestanden, wenn

Mit einer Zusatzaktion „Farbkarte nur für Rot“: Nach Blau ist Rot noch spielbar, und nach Rot ist Blau noch spielbar.

## Fehlgeschlagen, wenn

In einer der beiden Reihenfolgen bietet die Engine die zweite Karte nicht an.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Repo auf 686159e |

## Testdaten

Zwei Spieler mit Erweiterung, Spieler 1 hält Rot und Blau; Zugerweiterung „Schlangenkorb“ mit einer Zusatzaktion `erlaubt: Farbkarte`, `nurKarten: [Rot]`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Repo | Grenzfalldatei aus dem Beleg als `src/engine/__tests__/x3_pruefer_grenzfaelle.test.ts` ablegen |  | Datei liegt neben den anderen Engine-Tests |
| 2 | Konsole | ausführen | `npx vitest run src/engine/__tests__/x3_pruefer_grenzfaelle.test.ts --reporter=verbose` | Fall „G3“ grün |
| 3 | Repo | Grenzfalldatei löschen |  | `git status` ist leer |

## Technische Prüfung

Vitest-Fall „G3“ mit `meldeZugerweiterung` aus `zuggrenzen.ts` und `aktionen` aus `zugablauf_hilfen.ts`.

## Nicht abgedeckte Grenzfälle

Drei und mehr Zusatzaktionen mit überlappenden Kartenlisten prüft der Regeltest „D43: jede Reihenfolge …“ nur mit zwei Plätzen; mehr bringt erst X6.
