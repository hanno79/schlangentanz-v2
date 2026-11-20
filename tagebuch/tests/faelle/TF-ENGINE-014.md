---
id: TF-ENGINE-014
titel: Keine Karten-Id, die ein Ereignis in einem Zug nennt, liegt danach auf einer Hand.
art: manuell
regression: nein
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-20
veraendert_daten: nein
aenderung: task/E2-zugablauf (PR #36)
grenzfall_von: TF-ENGINE-010
---

## Worum es geht

Die Ereignisse der Engine gehen an die Oberfläche aller Spieler. Nennt ein Ereignis die Id einer Karte, die danach noch oder wieder auf einer Hand liegt, kann ein Spieler fremde Handkarten erfahren (B2, O4 Kriterium 2). Geprüft wird deshalb jedes Feld jedes Ereignisses, nicht nur `karteId` und `karteIds`.

## Bestanden, wenn

In sechs ganzen Zufallspartien (2, 3 und 4 Spieler, je zweimal, mit und ohne Erweiterung) liegt nach keinem Schritt und nach keinem Zug eine Karten-Id auf einer Hand, die in irgendeinem Ereignisfeld dieses Zuges steht. Gezählt werden dabei mindestens 60 Züge je Partie.

## Fehlgeschlagen, wenn

Auch nur eine genannte Id nach dem Schritt oder am Zugende auf einer Hand liegt, etwa weil `KartenGezogen` die gezogenen Karten nennt.

## Vorbedingungen

| Was | Wert |
|---|---|
| Ausgangslage | Worktree auf dem geprüften Stand von `task/E2-zugablauf`, `npm ci` gelaufen |

## Testdaten

Saaten 101 bis 106, Spielerzahl 2, 3, 4, 2, 3, 4; Erweiterung bei gerader Saat; Zugwahl mit der Zufallsquelle aus Saat × 7.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Konsole im Repo | vorübergehende Testdatei `src/engine/__tests__/pruefer_e2_tmp.test.ts` anlegen, die die Partien aus „Testdaten“ bis zum Ende spielt, alle Zeichenketten der Ereignisse sammelt, die Karten-Ids sind, und sie nach jedem Schritt und am Zugende mit den Händen vergleicht | Partien aus „Testdaten“ | Datei liegt neben den Zugablauf-Tests |
| 2 | Konsole im Repo | Datei ausführen | `npx vitest run src/engine/__tests__/pruefer_e2_tmp.test.ts --reporter=verbose` | je Partie eine Zeile „GEHEIM …: n Züge, m genannte Karten-Ids, keine auf einer Hand“, Exit 0 |
| 3 | Konsole im Repo | Prüfdatei wieder löschen | | `git status` zeigt keine Änderung unter `src/` |
