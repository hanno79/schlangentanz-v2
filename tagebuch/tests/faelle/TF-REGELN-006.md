---
id: TF-REGELN-006
titel: Auch in einem 320 px schmalen Fenster scrollt /regeln nicht waagrecht, und die Grossansicht liegt ganz im Bild.
art: manuell
regression: nein
prioritaet: niedrig
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
grenzfall_von: TF-REGELN-003
aenderung: task/O9-regelhilfe (PR #37)
---

## Worum es geht

320 px ist schmaler als jede der fünf Geräteklassen (kleine ältere Handys). Die Seite und die Grossansicht sollen dort trotzdem ohne waagrechtes Scrollen funktionieren.

## Bestanden, wenn

Bei 320×568 mit Touch gilt scrollWidth gleich clientWidth (320), alle Knöpfe sind mindestens 44 px gross, und der Dialog von Risiko-Belohnung liegt zwischen 8 und 312 px ohne Überstand.

## Fehlgeschlagen, wenn

Die Seite oder der Dialog ist breiter als 320 px, oder ein Knopf ist kleiner als 44 px.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Produktionsbuild, Playwright Chromium mit Touch |

## Testdaten

Fenster 320×568.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | `/regeln` | öffnen, Breiten messen | | 320 = 320 |
| 2 | „Alle Karten“ | Risiko-Belohnung antippen | | Dialog ganz im Bild |
