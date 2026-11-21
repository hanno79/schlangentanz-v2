---
id: TF-SPEC-019
titel: Wird in D34–D55 eine vorgeschlagene Möglichkeit durch eine andere ersetzt oder ein Satz einer Teilantwort gestrichen, schlagen die P0.5-Tests fehl.
art: manuell
regression: nein
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
aenderung: task/P0.5e-g-antworten (PR #75)
grenzfall_von: TF-SPEC-018
---

## Worum es geht

Die Tests zu D34–D55 sollen den Inhalt jeder Teilantwort festhalten, nicht nur, dass ein Eintrag da ist. Sonst kehrt eine spätere Änderung eine Regel der Erweiterung unbemerkt um, etwa eine zweite Farbenfusion im Korb-Zug.

## Bestanden, wenn

Jede Verfälschung unter „Testdaten“ führt einzeln zu Exit ungleich 0 bei `npx vitest run tests/regelfragen.test.ts tests/regelfragen_antworten.test.ts tests/spec_documentation_teil_d.test.ts tests/spec_documentation.test.ts`.

## Fehlgeschlagen, wenn

Mindestens eine Verfälschung bleibt grün (Exit 0).

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Arbeitskopie auf dem zu prüfenden Commit, `git status --short` leer |

## Testdaten

Je Zeile eine Verfälschung in `docs/GAME_SPEC.md`, Teil D, wo nichts anderes steht:

- D39 „Auch eine ungerade Kartenzahl ist erlaubt; die mittlere Karte ist die Achse und gehört zu keiner Hälfte.“ ersetzt durch „Die Kartenzahl muss gerade sein, damit es zwei gleiche Hälften gibt.“ (G6 a statt b)
- D51 „Die aufgedeckte Sonderkarte kommt auf den eigenen Ablagestapel, wie bei Aktion 3; der Spieler verliert die Karte.“ ersetzt durch „Die aufgedeckte Sonderkarte kommt auf die eigene Hand.“ (G19 b statt a)
- D51 „Die aufgedeckte Farbkarte kommt auf die eigene Hand, wie bei den Aktionen 1 und 2; die ersetzte Schlangenkarte kommt ebenfalls auf die eigene Hand, es ist ein Tausch.“ ersetzt durch „Die aufgedeckte Farbkarte kommt auf den eigenen Ablagestapel, die ersetzte Schlangenkarte auf die Hand; es ist ein Tausch.“ (G19 d statt c)
- D51 „die ersetzte Schlangenkarte kommt ebenfalls auf die eigene Hand, es ist ein Tausch.“ ersetzt durch „die ersetzte Schlangenkarte kommt auf den eigenen Ablagestapel, es ist ein Tausch.“ (G19 f statt e)
- D46 den Satz „Eine zweite Farbenfusion ist nicht erlaubt; „pro Zug nur eine Farbenfusion“ gilt weiter.“ streichen (G14 f fehlt)
- D46 denselben Satz ersetzen durch „Eine zweite Farbenfusion ist erlaubt, wenn sie als Zusatzaktion gespielt wird.“ (G14 e statt f)
- D49 den Satz „Mit weniger als zwei Handkarten ist sie nicht wählbar: Wer nur eine Karte hält, wählt eine andere Zusatzaktion.“ streichen (G17 a fehlt)
- D48 „, im zweiten Zug nach Verdoppler nur, wenn G15 das zulässt (D47)“ streichen (G16 f unvollständig)
- D38 „eine genügt, wenn sie von jeder Farbe zwei Karten hat.“ ersetzt durch „es braucht zwei Schlangen.“ (G5 d statt c)
- D42 „daneben ist keine weitere Sonderkarte erlaubt.“ ersetzt durch „daneben ist eine weitere Sonderkarte erlaubt.“ (G10 Folge von d statt c)
- D48 „ist sie erfüllt, darf die Karte irgendwann in diesem Zug eingesetzt werden“ ersetzt durch „die Karte darf nur gleich zu Zugbeginn, vor der ersten Karte, eingesetzt werden“ (G16 g statt f)
- D52 „Die zusätzliche Farbkarte kommt nur an ein Ende einer eigenen Schlange; für diese Aktion gilt D9 nicht.“ ersetzt durch „Die zusätzliche Farbkarte kommt an jedes Ende jeder Schlange (D9).“ (G20 h statt g)
- Spalte „Folge“ von D45 „X6“ ersetzt durch „X5“; von D37 „X2“ ersetzt durch „E9“
- in `docs/REGELFRAGEN.md` bei G21 „**Antwort:** a, d.“ ersetzt durch „**Antwort:** a, e.“

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Editor | eine Verfälschung aus „Testdaten“ eintragen | | nur die genannte Stelle geändert |
| 2 | Git Bash im Repo | Tests ausführen | `npx vitest run tests/regelfragen.test.ts tests/regelfragen_antworten.test.ts tests/spec_documentation_teil_d.test.ts tests/spec_documentation.test.ts; echo $?` | Exit ungleich 0 |
| 3 | dieselbe Konsole | zurücksetzen | `git checkout -- docs/GAME_SPEC.md docs/REGELFRAGEN.md` | `git status --short` leer |

## Nicht abgedeckte Grenzfälle

Der Zusatz in D43 „Nicht gespielte gezogene Karten bleiben auf der Hand; über 5 Karten wird am Zugende abgelegt (A5).“ stammt aus dem Fragenblock, nicht aus einer Möglichkeit, und gibt A5 wieder; eine Streichung muss nicht rot werden. Abschriften im Umsetzungsplan prüft `tests/regelfragen.test.ts` nur als Verweis „Gn → Dnn“ und Spalte „Antwort“, nicht inhaltlich; Regelquelle ist Teil D.
