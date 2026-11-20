---
id: TF-KI-005
titel: Eine KI kann nur eine Aktion spielen, die die Engine aufgezählt hat; selbst gebaute, veränderte oder veraltete Aktionen werden abgelehnt.
art: automatisch
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-20
veraendert_daten: nein
skript: src/ki/schritt.test.ts
aenderung: task/K1-ki-schnittstelle
---

## Worum es geht

Die KI soll aus der Liste der Engine wählen und nichts daran vorbei spielen (U3). Eine fehlerhafte oder böswillige KI darf weder eine eigene Aktion einschmuggeln noch eine angebotene umbauen noch über die Sicht den Zustand verändern.

## Bestanden, wenn

Eine nachgebaute Aktion (gleicher Inhalt, anderes Objekt), eine angehängte, eine eingetauschte, eine aus einer früheren Aufzählung, `undefined` und eine Zahl werden mit „… hat eine Aktion gewählt, die die Engine nicht aufgezählt hat“ abgelehnt. Verändert die KI die gewählte Aktion, die Liste oder ihre Sicht, wird trotzdem die Aktion der Engine gespielt, und der Zustand bleibt Zeichen für Zeichen gleich.

## Fehlgeschlagen, wenn

Eine nicht aufgezählte Aktion gespielt wird, eine veränderte Aktion durchkommt oder sich der Zustand durch Eingriffe der KI ändert.

## Vorbedingungen

| Was | Wert |
|---|---|
| Ausgangslage | Worktree auf dem geprüften Stand von `task/K1-ki-schnittstelle`, `npm ci` gelaufen |

## Testdaten

Partie zu zweit, Saat 5 (Umsetzer) und Saat 77 nach einem Zug von Spieler 1 (Prüfer).

## Technische Prüfung

`npx vitest run src/ki/schritt.test.ts` endet mit Exit 0, 11 Tests grün; dazu die drei Manipulationstests der Probe aus TF-KI-002. Gegenprobe: In `src/ki/schritt.ts` `return aufgezaehlt[stelle]` durch `return abschriften[stelle]` ersetzen; dann wird „U3: verändert die KI die gewählte Aktion, gilt trotzdem die aufgezählte“ rot.

## Nicht abgedeckte Grenzfälle

Eine KI, die eine Ausnahme wirft, ist nicht eigens geprüft; der Fehler geht dann unverändert an den Aufrufer, im Turnier mit Saat und Schritt in der Meldung.
