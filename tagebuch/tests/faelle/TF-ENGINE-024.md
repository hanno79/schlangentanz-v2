---
id: TF-ENGINE-024
titel: Ob ein Betroffener Farbenschutz hält und durchlässt oder keinen hält, sehen Angreifer und Unbeteiligte in 300 Zufallspartien nicht, und ein eigener Dauerlauf über 300 Partien verletzt keine Regel der Abwehr.
art: manuell
regression: nein
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
aenderung: task/E4-abwehr-grube (PR #54)
grenzfall_von: TF-ENGINE-023
---

## Worum es geht

D33 soll verhindern, dass die Frage eine Handkarte verrät (B2). Der Test baut in zufälligen Lagen zu jeder angebotenen Schlangengrube ein Gegenstück, in dem nur die Hand des Ziels anders ist: Farbenschutz gegen Farbkarte getauscht oder umgekehrt. In beiden Lagen wird die Grube angesagt und durchgelassen. Für jeden Spieler ausser dem Ziel wird verglichen, was er erfährt. Dazu läuft ein eigener Dauerlauf mit Saaten, die die Tests des Umsetzers nicht verwenden.

## Bestanden, wenn

- Für jede verglichene Lage sind für Angreifer und Unbeteiligte gleich: alle Ereignisse, die eigene Sicht (`sichtFuer`), der Entscheider, die eigenen aufgezählten Aktionen und die Ablehnungsgründe für die Probeaktionen „Reagieren durchlassen“ und „Zug beenden“.
- Es werden mehr als 500 Lagen verglichen, davon mehr als 50 mit Farbenschutz beim Ziel.
- Im Dauerlauf (Saaten 9001 bis 9300, 2 bis 4 Spieler, mit und ohne Erweiterung) enden alle Partien, der Angreifer steht nie unter den Betroffenen, jeder Betroffene wird genau einmal und in der angesagten Reihenfolge gefragt, bevor die Karte wirkt, angeboten sind genau so viele Abwehren wie Farbenschutz auf der Hand, jede Grube und jeder Farbenschutz liegt danach auf dem richtigen Ablagestapel, und nach Spielende liegt keine Grube mehr aus.

## Fehlgeschlagen, wenn

Sich eine Beobachtung zwischen Lage und Gegenstück unterscheidet, eine Partie nicht endet oder eine der Prüfungen des Dauerlaufs anschlägt.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Kopie des Stands `3dbb35b` (`git archive`), `node_modules` des Worktrees verlinkt |

## Testdaten

Geheimnisvergleich: Saaten 5001 bis 5300, Spielerzahl `2 + Saat mod 3`, Erweiterung bei gerader Saat. Dauerlauf: Saaten 9001 bis 9300, Erweiterung bei ungerader Saat, Zufallswahl mit `erzeugeZufall(Saat xor 0x1234)`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Konsole | Stand `3dbb35b` in einen Ordner ausserhalb des Repos entpacken und `node_modules` verlinken | `git archive`, `tar -x`, Junction auf `node_modules` | Ordner enthält `src/engine` |
| 2 | Konsole im Kopie-Ordner | Prüfdatei `src/engine/__tests__/pruefer_e4.test.ts` mit beiden Prüfungen anlegen | Daten aus „Testdaten“ | Datei liegt nur in der Kopie |
| 3 | Konsole im Kopie-Ordner | Datei ausführen | `npx vitest run src/engine/__tests__/pruefer_e4.test.ts` | Exit 0, „Tests 3 passed“, Zähler in `zaehler.txt`: 4'299 Vergleiche, davon 591 mit Farbenschutz; Dauerlauf 867 Ansagen, 867 Fragen, 44 Abwehren, 800 Aussetzen, 23 Gruben ohne Wirkung |

## Nicht abgedeckte Grenzfälle

Lagen mit mehreren Betroffenen kommen im Zufall noch nicht vor, weil bis E4 nur die Schlangengrube Mitspieler trifft; sie deckt der Geheimnistest des Umsetzers über einen Spion ab. Den Zeitpunkt, zu dem eine Oberfläche die Frage anzeigt, prüft erst O6.
