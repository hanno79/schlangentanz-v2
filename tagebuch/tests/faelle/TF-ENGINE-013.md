---
id: TF-ENGINE-013
titel: Setzt ein Spieler aus, nennt das Ereignis der Engine, welche Schlangengrube auf wessen Ablagestapel geht.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
aenderung: task/E2-zugablauf (PR #36)
grenzfall_von: TF-ENGINE-010
---

## Worum es geht

Die Oberfläche soll aus den Ereignissen zeigen können, was geschah, ohne zwei Zustände zu vergleichen (Plan E2, Kriterium 11). Beim Aussetzen wandert eine Schlangengrube auf den Ablagestapel dessen, der sie gespielt hat. Liegen zwei Gruben verschiedener Spieler vor demselben Spieler (D14), muss das Ereignis sagen, welche es war.

## Bestanden, wenn

Liegen vor Spieler 2 die Grube `schlangengrube-01` von Spieler 3 und `schlangengrube-02` von Spieler 1 und setzt Spieler 2 aus, nennt das Ereignis `Ausgesetzt` die Karte `schlangengrube-01` und den Ablagestapel von Spieler 3, oder ein eigenes Ereignis tut das.

## Fehlgeschlagen, wenn

Das Ereignis nur `{ typ: 'Ausgesetzt', spielerIndex: 1 }` lautet. Dann weiss die Oberfläche nicht, welche der beiden Gruben auf welchen Stapel ging, ohne den Zustand davor und danach zu vergleichen oder die Auswahlregel der Engine nachzubauen.

## Vorbedingungen

| Was | Wert |
|---|---|
| Ausgangslage | Worktree auf dem geprüften Stand von `task/E2-zugablauf`, `npm ci` gelaufen |

## Testdaten

Drei Spieler mit je 5 Karten (Blau, Rot, Gelb, Blau, Rot), Baukasten `.grube(2, 1).grube(0, 1)`, Spieler 1 legt eine Farbkarte und beendet den Zug.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Konsole im Repo | vorübergehende Testdatei `src/engine/__tests__/pruefer_e2_tmp.test.ts` anlegen, die den Zustand aus „Testdaten“ baut, eine Farbkarte legt, den Zug beendet und die Ereignisse ausgibt | Zustand aus „Testdaten“ | Datei liegt neben den Zugablauf-Tests |
| 2 | Konsole im Repo | Test P6 ausführen | `npx vitest run src/engine/__tests__/pruefer_e2_tmp.test.ts -t P6` | Logzeile „P6 Ereignisse“ zeigt das Ereignis `Ausgesetzt` |
| 3 | Konsole im Repo | Prüfdatei wieder löschen | | `git status` zeigt keine Änderung unter `src/` |
