---
id: TF-KI-001
titel: Die Sicht eines Spielers enthält alles, was er am Tisch sehen darf, und die Ablagestapel vollständig.
art: automatisch
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-20
veraendert_daten: nein
skript: src/ki/sicht.test.ts
aenderung: task/K1-ki-schnittstelle
---

## Worum es geht

Die KI entscheidet nur nach ihrer Sicht (U5). Fehlt dort etwas, das am Tisch offen liegt, spielt sie schlechter als nötig; steht dort etwas, das sie nicht sehen darf, schummelt sie. Dieser Testfall prüft die erste Hälfte: Alles Offene ist da, auch jeder Ablagestapel in voller Länge (D28).

## Bestanden, wenn

Die Sicht von Spieler 2 im Testtisch (drei Spieler, mit Erweiterung) enthält seine 5 Handkarten, seine geheime Aufgabe samt Erfüllt-Status, alle Schlangen aller Spieler mit den zwei gelben Karten unter der Farbenfusion, alle drei Ablagestapel in ihrer Reihenfolge (der von KI-Gegner 1 mit 3 Karten), die Handgrösse jedes Spielers (Spieler 3: 6), die Grösse von Nachzieh- und Aufgabenstapel, die 3 offenen Aufgaben und die angesagte Schlangengrube mit Ziel `spieler-3` und dem ausstehenden Spieler 3. Ändert man etwas Offenes (Reihenfolge eines fremden Ablagestapels, eine fremde Handgrösse, die eigene Hand), ändert sich die Sicht.

## Fehlgeschlagen, wenn

Einer der Werte fehlt oder abweicht, etwa ein Ablagestapel nur mit seiner obersten Karte, oder die Sicht bleibt gleich, obwohl sich Offenes geändert hat.

## Vorbedingungen

| Was | Wert |
|---|---|
| Ausgangslage | Worktree auf dem geprüften Stand von `task/K1-ki-schnittstelle`, `npm ci` gelaufen |

## Testdaten

Testtisch `tisch()` in `src/ki/sicht.test.ts`: Saat 11, drei Spieler, Erweiterung, Schlangen mit Fusion und Blockade, drei Ablagestapel, eine Grube, Schlangenkorb aus dem Spiel, angesagte Schlangengrube.

## Technische Prüfung

`npx vitest run src/ki/sicht.test.ts` endet mit Exit 0, 14 Tests grün. Gegenprobe: In `src/ki/sicht.ts` `ablagestapel: spieler.ablagestapel` durch `spieler.ablagestapel.slice(-1)` ersetzen; dann wird „D28: alle Ablagestapel vollständig …“ rot.

## Nicht abgedeckte Grenzfälle

Verborgenes in Sicht und Aktionsliste prüft TF-KI-002. Zustände mit Abwehr (E4) und erfüllten Aufgaben (X1, X2) erzeugt die Engine heute noch nicht; sie gehören zu K2 bis K4, die dafür die Hilfe `mischeVerborgenes` mitbekommen. Leere Hand und leerer Nachziehstapel kommen in den 200 Zufallszuständen vor, sind aber nicht eigens benannt.
