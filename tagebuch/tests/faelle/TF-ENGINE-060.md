---
id: TF-ENGINE-060
titel: Mit Erweiterung löst die Engine für den Spieler am Zug jede erfüllte Aufgabe ein, ersetzt sie vom Stapel, prüft die neue sofort mit und merkt sich die geheime Aufgabe verdeckt.
art: automatisch
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-23
veraendert_daten: nein
skript: src/engine/__tests__/regeln/A9_aufgaben_rahmen.test.ts
aenderung: task/X1-aufgaben-rahmen (PR #100)
---

## Worum es geht

Der Rahmen der Aufgabenkarten (A9, D5, D34, D35) entscheidet, wann geprüft wird und was beim Einlösen passiert. Geprüft wird nur für den Spieler am Zug, am Zugbeginn und nach jeder aufgelösten Aktion. Solange X2 die 15 Bedingungen nicht umgesetzt hat, prüfen die Tests den Rahmen mit Testbedingungen.

## Bestanden, wenn

Die drei Regeltestdateien `A9_aufgaben_rahmen.test.ts`, `A9_aufgaben_ereignisse.test.ts` und `A9_aufgaben_register.test.ts` sind grün. Dazu gehören: eine Kette über drei Aufgaben, zwei Aufgaben zugleich, der leere Stapel lässt den Platz leer, das Einlösen beim Gegner erst an seinem Zugbeginn, keine Prüfung während einer offenen Abwehr, ohne Erweiterung kein Aufruf einer Bedingung und kein Ereignis, das eine geheime Aufgabe nennt.

## Fehlgeschlagen, wenn

Ein Test ist rot, etwa weil eine aufgedeckte Aufgabe liegen bleibt, obwohl ihre Bedingung gilt, ein Mitspieler ausserhalb seines Zuges einlöst oder ein Ereignis die geheime Aufgabe verrät.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Repo mit `npm ci`, Stand ab Commit 0f83bf6 |

## Testdaten

Stellungen aus dem Baukasten (`aufgabenTisch`, zwei Spieler, Schlange Blau-Blau), Testbedingungen wie `schlangeAb(3)`, dazu 30 Zufallspartien mit Testbedingungen und 12 Zufallspartien mit Platzhaltern.

## Technische Prüfung

`npx vitest run src/engine/__tests__/regeln/A9_aufgaben_rahmen.test.ts src/engine/__tests__/regeln/A9_aufgaben_ereignisse.test.ts src/engine/__tests__/regeln/A9_aufgaben_register.test.ts` endet mit 0. Zwei Gegenproben in `src/engine/aufgaben/rahmen.ts` machen Tests rot: ohne Nachprüfung des ersetzten Platzes (D5) fünf Tests, ohne die Sperre bei schwebender Karte (A6) vier Tests.

## Nicht abgedeckte Grenzfälle

Der Prüfer von X1 hat mit einem temporären Test (nicht im Repo) belegt: Einlösen am Zugbeginn des Übernächsten nach Aussetzen, Prüfung zu Beginn des Verdoppler-Zweitzugs vor jeder Karte, Prüfung nach wirkungslos abgelegter Sonderkarte, gleiche KI-Sicht für Mitspieler, ob die fremde geheime Aufgabe erfüllt ist oder nicht, und das Speichern und Laden der verdeckt erfüllten Aufgabe. Für diese Fälle gibt es keinen dauerhaften Test. Echte Bedingungen der 15 Aufgaben und Joker prüft X2.
