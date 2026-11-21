---
id: TF-KI-007
titel: Ein KI-Gegner wird bei einer Schlangengrube gefragt, ob er Farbenschutz hält oder nicht, und die Zufalls-KI verbraucht in beiden Fällen gleich viele Zufallszahlen.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
aenderung: task/E4-abwehr-grube (PR #54)
---

## Worum es geht

Mit D33 wird jeder Betroffene gefragt, auch eine KI ohne Farbenschutz. Geprüft wird, dass „KI-Schritt“ am Entwicklertisch in beiden Fällen eine Reaktion spielt und die Partie weitergeht, und dass die Zufalls-KI nicht über die Zahl ihrer Zufallsaufrufe verrät, ob sie zwei Möglichkeiten hatte oder nur eine.

## Bestanden, wenn

- Szenario `schlangengrube` (KI ohne Farbenschutz): „KI-Schritt“ spielt „Reagieren: durchlassen“, danach liegt die Grube vor KI-Gegner 1 und Spieler 1 entscheidet.
- Szenario `abwehr-schlangengrube` (KI mit Farbenschutz): „KI-Schritt“ spielt eine der beiden angebotenen Reaktionen; im Lauf vom 21.11.2026 liess sie durch, die Grube lag vor KI-Gegner 1, und nach dem Aussetzen hielt er seinen Farbenschutz noch.
- Mit Farbenschutz und ohne ruft die Zufalls-KI ihre Zufallsquelle gleich oft auf (je einmal) und wählt bei Wert 0.99 dieselbe Aktion „Reagieren: durchlassen“.

## Fehlgeschlagen, wenn

„KI-Schritt“ einen Fehler zeigt oder nichts tut, die Partie danach hängt oder die Zahl der Zufallsaufrufe sich unterscheidet.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build von `3dbb35b` auf Port 4196; für den Zähltest die Kopie des Stands wie in TF-ENGINE-024 |

## Testdaten

Szenarien `schlangengrube` und `abwehr-schlangengrube`; Zähltest mit drei Spielern, Hand von KI-Gegner 1 einmal Farbenschutz, Blau, Rot, Gelb, Grün und einmal Violett, Blau, Rot, Gelb, Grün.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser, `/dev?szenario=schlangengrube` | Grube auf KI-Gegner 1, dann „KI-Schritt“ | | Verlauf „KI-Schritt: Reagieren: durchlassen“, „Entscheidet: Spieler 1“ |
| 2 | Browser, `/dev?szenario=abwehr-schlangengrube` | Grube auf KI-Gegner 1, dann „KI-Schritt“, dann Farbkarte und „ZugBeenden“ | | eine Reaktion gespielt, Partie geht weiter |
| 3 | Konsole im Kopie-Ordner | Zähltest in `pruefer_e4.test.ts` ausführen | `npx vitest run src/engine/__tests__/pruefer_e4.test.ts` | Test „die Zufalls-KI verbraucht gleich viele Zufallszahlen …“ grün |

## Nicht abgedeckte Grenzfälle

Wie eine spätere, klügere KI (K3) entscheidet, ist hier nicht geprüft; dass sie nur ihre Sicht bekommt, hält der Architekturtest fest.
