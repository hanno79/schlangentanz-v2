---
id: TF-ENGINE-012
titel: 300 Zufallspartien mit 2, 3 und 4 Spielern enden alle, ohne verletzte Invariante und ohne einen laufenden Zustand ohne Aktion.
art: automatisch
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
skript: src/engine/__tests__/dauerlauf.test.ts
aenderung: task/E2-zugablauf (PR #36)
grenzfall_von: TF-ENGINE-010
---

## Worum es geht

Der Dauerlauf spielt viele Partien mit Zufallszügen bis zum Ende. Er zeigt, ob die Engine irgendwo stecken bleibt (Handkarten, aber keine erlaubte Aktion), ob jede angebotene Aktion auch erlaubt ist und ob Material verloren geht. Der Prüfer lässt dazu einen eigenen, strengeren Lauf mit anderen Saaten laufen.

## Bestanden, wenn

Der Dauerlauf des Umsetzers (Saaten 1 bis 300) endet grün. Im eigenen Lauf (Saaten 1001 bis 1300, je 100 mit 2, 3 und 4 Spielern, mit und ohne Erweiterung) enden alle 300 Partien. Dabei zieht im laufenden Spiel nur, wer seinen Zug beendet oder beginnt, nach jedem Zugwechsel hält der abgebende und der neue Spieler genau 5 Karten, in der Schlussrunde zieht niemand, der Auslöser kommt nicht mehr dran, und es gibt genau N−1 letzte Züge.

## Fehlgeschlagen, wenn

Eine Partie nicht endet, eine Invariante verletzt ist, die Engine in einer laufenden Partie keine Aktion anbietet oder eine der Zusatzprüfungen etwas meldet.

## Vorbedingungen

| Was | Wert |
|---|---|
| Ausgangslage | Worktree auf dem geprüften Stand von `task/E2-zugablauf`, `npm ci` gelaufen |

## Testdaten

Saaten 1 bis 300 (Umsetzer) und 1001 bis 1300 (Prüfer); Zugwahl mit eigener Zufallsquelle.

## Technische Prüfung

`npx vitest run src/engine/__tests__/dauerlauf.test.ts` endet mit Exit 0. Für den eigenen Lauf vorübergehend eine Testdatei unter `src/engine/__tests__/` anlegen, die 300 Partien mit `erstellePartie`, `ermittleAktionen` und `anwendeAktion` spielt und die Zusatzprüfungen aus „Bestanden, wenn“ je Schritt auswertet (Beschreibung im Prüfprotokoll `docs/abnahme/E2.md`, Abschnitt „Dauerlauf“); erwartet „300 Partien beendet, Befunde 0“. Danach die Datei wieder löschen.
