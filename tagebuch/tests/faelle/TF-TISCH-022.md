---
id: TF-TISCH-022
titel: Ab 1000 px Breite kostet der Grund neben „Zug beenden“ die Tischfläche keine Höhe, solange du eine Karte wählst.
art: manuell
regression: nein
prioritaet: niedrig
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
aenderung: task/O5-karten-spielen (PR #73)
grenzfall_von: TF-TISCH-020
---

## Worum es geht

Tablet quer ist die engste Geräteklasse. Damit der Grund neben dem gesperrten „Zug beenden“ dort nicht drei Zeilen Höhe frisst, wird die Zugleiste ab 1000 px breiter. Geprüft wird genau an der Grenze, bei 999 und 1000 px, und bei 1024 px.

## Bestanden, wenn

Bei 1000 × 768 und 1024 × 768 ist die Zugleiste 416 px breit, und die Tischfläche hat in `blockade-abwehr` ohne Karte und mit gewählter Karte 421 px, mit Ansage mindestens 400 px. Bei 999 × 768 ist die Zugleiste 352 px breit. In allen drei Breiten ist keine Bedienfläche kleiner als 44 px, und die Seite scrollt nicht waagrecht.

## Fehlgeschlagen, wenn

Bei 1000 oder 1024 px schrumpft die Tischfläche mit gewählter Karte unter 400 px, eine Bedienfläche ist kleiner als 44 px oder `scrollWidth` ist grösser als `clientWidth`.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build, Playwright Chromium mit Touch, Fenster 999 × 768, 1000 × 768 und 1024 × 768 (`setViewportSize`), Stand ab Commit 6915756 |

## Testdaten

Adresse `/spiel?szenario=blockade-abwehr&tempo=sofort`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser | Adresse in 1000 × 768 öffnen | | Zugleiste 416 px breit, Tischfläche 421 px hoch |
| 2 | Deine Hand | „Sonderkarte Schlangenblockade“ antippen | | Tischfläche weiter 421 px, daneben der Grund neben „Zug beenden“ |
| 3 | Tisch | „KI-Gegner 1, Schlange 1 wählen“ und „KI-Gegner 1, Schlange 1: zwischen Karte 1 und 2“ antippen | | Ansage, Tischfläche mindestens 400 px |
| 4 | Browser | Schritte 1 bis 3 in 1024 × 768 und 999 × 768 wiederholen | | 1024 wie 1000; bei 999 ist die Zugleiste 352 px breit |
