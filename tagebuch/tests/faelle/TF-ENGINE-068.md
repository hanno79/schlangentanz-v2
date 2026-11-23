---
id: TF-ENGINE-068
titel: Eine abgewehrte Farbenfusion verbraucht nur die Fusion ihres Teilzugs; im zweiten Zug nach einem Verdoppler ist wieder eine Fusion erlaubt.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-23
veraendert_daten: nein
aenderung: task/X3-zusatzaktionen (PR #108)
---

## Worum es geht

D56 sagt, eine abgewehrte Fusion verbraucht die Fusion des Zuges. D27 sagt, im zweiten Zug nach einem Verdoppler ist wieder eine erlaubt. Beides muss zusammen gelten.

## Bestanden, wenn

Nach einer abgewehrten Fusion im ersten Teilzug bietet die Engine keinen Verdoppler mehr an (der Platz der Sonderkarte ist belegt). Spielt Spieler 1 stattdessen zuerst den Verdoppler und beendet den Teilzug, steht `teilzug` auf 2, und die Engine bietet mindestens eine FusionLegen an; alle Invarianten halten.

## Fehlgeschlagen, wenn

Im zweiten Teilzug fehlt jede FusionLegen, oder eine Invariante ist verletzt.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Repo auf 686159e |

## Testdaten

Zwei Spieler ohne Erweiterung; Spieler 1: Farbenfusion, Verdoppler, Farbenfusion, Schlange Rot-Rot; Gegner: Farbenschutz und vier Farbkarten, Schlange Blau-Blau.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Repo | Grenzfalldatei aus dem Beleg als `src/engine/__tests__/x3_pruefer_grenzfaelle.test.ts` ablegen |  | Datei liegt neben den anderen Engine-Tests |
| 2 | Konsole | ausführen | `npx vitest run src/engine/__tests__/x3_pruefer_grenzfaelle.test.ts --reporter=verbose` | Fall „G1“ grün |
| 3 | Repo | Grenzfalldatei löschen |  | `git status` ist leer |

## Technische Prüfung

Vitest-Fall „G1“ in einer Prüfdatei unter `src/engine/__tests__/`, mit `aktionen`, `fuehreAus` und `verletzteInvarianten` aus `zugablauf_hilfen.ts`.

## Nicht abgedeckte Grenzfälle

Eine abgewehrte Fusion im zweiten Teilzug und danach eine Zusatzaktion: in der Basis nicht erreichbar, Zusatzaktionen kommen mit X4 und X6.
