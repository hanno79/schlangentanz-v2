---
id: TF-ENGINE-087
titel: Die drei Protokolle des Golden Master mit Erweiterung folgen Teil A und D, und ihre Endwertungen 7 zu 56, 70 zu 4 zu 0 und 18 zu 32 zu 0 zu 10 lassen sich von Hand nachrechnen.
art: beides
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-25
veraendert_daten: nein
skript: src/engine/__tests__/golden_master.test.ts
aenderung: task/X7-abnahme-erweiterung (PR #120)
---

## Worum es geht

X7 friert drei Zufallspartien mit Erweiterung ein, zu zweit, zu dritt und zu viert. Bevor sie als Massstab gelten, liest ein Mensch die Partie zu zweit Zug für Zug gegen Teil A und D und die beiden anderen an jeder Stelle mit Aufgabe, Comeback-Karte, Risiko-Karte, Schlangenkorb, Abwehr, Verdoppler, Schlussrunde und Endwertung. Danach fällt jede Änderung auf, die den Verlauf verschiebt.

## Bestanden, wenn

Beim Lesen findet sich keine Stelle, die Teil A, B oder D widerspricht. Die Endwertungen ergeben von Hand: zu zweit Spieler 1 = 7 (Gelb×3 aus Regenbogenschlange, Gelb und Fusion aus zwei Grün = 0 + 1 + 6) und KI-Gegner 1 = 56 (Rot×3 = 4, Violett×3 = 6, Vielfalt 1, Aufgaben 4 + 9 + 5 + 8 + 6 + 7 + geheim 6 = 45); zu dritt 70, 4 und 0; zu viert 18, 32, 0 und 10. `npx vitest run src/engine/__tests__/golden_master.test.ts` endet mit 0.

## Fehlgeschlagen, wenn

Eine Aktion im Protokoll widerspricht Teil A oder einer Antwort aus Teil D, etwa eine zweite Risiko-Karte in derselben Runde (D50), eine Comeback-Karte ohne 5 Karten Rückstand zu Zugbeginn (A8.1, D48), eine Aufgabe, die jemand ausserhalb seines Zuges einlöst (A9), ein Korb, der danach noch im Spiel liegt (A7.10); oder die Handrechnung ergibt andere Summen; oder der Test endet nicht mit 0.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Repo auf dem geprüften Stand, `npm ci` gelaufen |

## Testdaten

`src/engine/__tests__/golden/erweiterung-2-spieler-saat-11.txt` (187 Schritte), `erweiterung-3-spieler-saat-39.txt` (186 Schritte) und `erweiterung-4-spieler-saat-41.txt` (181 Schritte).

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Datei `erweiterung-2-spieler-saat-11.txt`, Kopf | Aufbau lesen | – | je 5 Handkarten, 102 Karten im Stapel, 3 offene Aufgaben, Aufgabenstapel 10, je eine geheime Aufgabe, je Comeback bereit und 2 Risiko-Karten |
| 2 | dieselbe Datei, Schritte 3 bis 5 | Risiko-Karte mit Misserfolg lesen | – | die aufgedeckte Grube kommt auf den eigenen Ablagestapel (D51); Spieler 1 wählt den Gegner, der Gegner wählt „geplante“, die benannte Braun-Karte wechselt die Hand (D52) |
| 3 | dieselbe Datei, ganze Partie | jeden Schritt gegen Teil A und D lesen | – | höchstens eine Farb- und eine Sonderkarte je Zug, Risiko nicht regulär (A8.2), Nachziehen nur am eigenen Zugende oder zu Zugbeginn nach Abwehr, Kartenzahl im Stapel stimmt nach jedem Zug |
| 4 | dieselbe Datei, Schritte 73 bis 78 | Comeback lesen | – | Rückstand 4 gegen 9 Karten zu Zugbeginn; danach drei Farbkarten und eine Fusion, Spieler 1 zieht 4 |
| 5 | dieselbe Datei, Schritte 101 bis 103 | Aufgaben in Kette lesen | – | Farbvielfalt (Joker als Gelb), dann Farbkombination sofort; Farbenpracht erst am Zugende (D59) |
| 6 | dieselbe Datei, Schritt 180 | Schlangenkorb lesen | – | zwei Täusche Farbkarte gegen Farbkarte am selben Platz (D44), Korb danach „aus dem Spiel“ |
| 7 | Abschnitt „Endwertung (A11)“ der drei Dateien | Punkte von Hand rechnen | – | 7 zu 56; 70 zu 4 zu 0; 18 zu 32 zu 0 zu 10 |
| 8 | Konsole im Repo | Test ausführen | `npx vitest run src/engine/__tests__/golden_master.test.ts` | Exit 0 |

## Nicht abgedeckte Grenzfälle

Die Partien zu dritt und zu viert sind nur an den genannten Stellen gelesen, nicht Zug für Zug. Ob eine geheime Aufgabe schon in einem früheren eigenen Zug erfüllt war als im Protokoll vermerkt, lässt sich von Hand nur stichprobenweise prüfen; der Test vergleicht dafür die Zahl der vermerkten Erfüllungen mit der Endwertung.
