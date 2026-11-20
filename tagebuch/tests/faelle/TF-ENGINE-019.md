---
id: TF-ENGINE-019
titel: Auch am Rand bleibt der Verdoppler bei genau einem zweiten Zug, nach Speichern und Laden, bei aussetzendem Gegner, bei direkter Aktion, nach einer anderen Sonderkarte und mit vier Spielern in der Schlussrunde.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-20
veraendert_daten: nein
aenderung: task/E3-verdoppler (PR #51)
grenzfall_von: TF-ENGINE-017
---

## Worum es geht

Fünf Lagen, die in den Abnahmekriterien von E3 nicht einzeln stehen. Sie prüfen, ob der zweite Zug einen Neustart der Seite übersteht, ob ein ausgesetzter Gegner den Spieler mit einem frischen Zug zurückbringt und ob der Verdoppler sich auch an den Grenzen des Zuges an die Regeln hält.

## Bestanden, wenn

- G-A: Nach Speichern und Laden mitten im zweiten Zug steht `teilzug` weiter auf 2, die angebotenen Aktionen sind dieselben, kein VerdopplerSpielen; nach Blau und „Zug beenden“ beginnt Spieler 2 mit Teilzug 1.
- G-B: Liegt eine Schlangengrube vor dem einzigen Gegner, folgt auf den zweiten Zug „Ausgesetzt“ für den Gegner und ZugBegonnen für Spieler 1 mit Teilzug 1, mit frischen Zählern und genau einem angebotenen VerdopplerSpielen.
- G-C: `anwendeAktion` mit VerdopplerSpielen im zweiten Zug wirft mit dem Grund „(A7.8, D11) … (D23)“; der Zustand ist danach Zeichen für Zeichen derselbe.
- G-D: Nach einem wirkungslos abgelegten Farbenschutz wird der Verdoppler im ersten Zug mit „schon eine Sonderkarte … (A5, D12)“ abgelehnt und nicht angeboten; nach „Zug beenden“ ist der Gegner mit Teilzug 1 dran.
- G-E: Vier Spieler in der Schlussrunde (Auslöser Spieler 1, am Zug Spieler 2): Die Zugfolge ist 2/2, 3/1, 4/1, 4/2 (Spieler/Teilzug), niemand zieht, danach ist die Partie beendet.

## Fehlgeschlagen, wenn

Einer der fünf Fälle anders ausgeht, etwa nach dem Laden ein Verdoppler mit Wirkung angeboten wird, nach dem Aussetzen ein Teilzug 2 folgt, der Zustand nach der Ablehnung verändert ist oder in der Schlussrunde jemand nachzieht oder zweimal einen letzten Zug bekommt.

## Vorbedingungen

| Was | Wert |
|---|---|
| Ausgangslage | Worktree auf dem geprüften Stand von `task/E3-verdoppler`, `npm ci` gelaufen |

## Testdaten

Szenario-Baukasten ohne Erweiterung. G-A: 2 Spieler, Hand Verdoppler, Blau, Verdoppler, Rot. G-B: 2 Spieler, `.grube(0, 1)`, Stapel oben Grün, Grün, Violett, Braun. G-C: 3 Spieler, Hand Verdoppler, Verdoppler, Rot. G-D: Hand Farbenschutz, Verdoppler, Rot. G-E: 4 Spieler, Hände Gelb Gelb / Verdoppler Blau Rot / Rot Rot / Verdoppler Grün Grün, `.schlussrunde(0).amZug(1)`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Konsole im Repo | vorübergehende Testdatei `src/engine/__tests__/pruefer_e3_grenz_tmp.test.ts` mit den Fällen G-A bis G-E anlegen | Lagen aus „Testdaten“ | Datei liegt neben `verdoppler.test.ts` |
| 2 | Konsole im Repo | Datei ausführen | `npx vitest run src/engine/__tests__/pruefer_e3_grenz_tmp.test.ts` | Zeilen „G-A“ bis „G-E“ mit den Werten aus „Bestanden, wenn“, Exit 0 |
| 3 | Konsole im Repo | Prüfdatei wieder löschen | | `git status` zeigt keine Änderung unter `src/` |

## Nicht abgedeckte Grenzfälle

Ein Verdoppler, dessen zweiter Zug eine Schlangengrube oder einen Schlangenfrass mit Abwehr enthält, lässt sich erst mit E4 und E6 prüfen.
