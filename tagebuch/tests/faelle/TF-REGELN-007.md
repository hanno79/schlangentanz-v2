---
id: TF-REGELN-007
titel: Dreht man das Handy bei offener Grossansicht, bleibt sie offen und ordnet Bild und Text neu an.
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

Wer beim Lesen das Handy dreht, soll den Text nicht verlieren. Hochkant steht das Bild über dem Text, quer daneben.

## Bestanden, wenn

Nach dem Drehen von 390×844 auf 844×390 ist der Dialog noch offen, die Karte 220 px breit und ganz im Bild. Nach dem Zurückdrehen ist sie wieder 320 px breit, und nach „Schliessen“ liegt der Fokus auf dem Kartenknopf.

## Fehlgeschlagen, wenn

Der Dialog schliesst beim Drehen, ragt über den Rand, oder der Fokus geht nach dem Schliessen verloren.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Produktionsbuild, Playwright Chromium mit Touch, `setViewportSize` |

## Testdaten

Karte Farbenfusion.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | `/regeln`, 390×844 | Farbenfusion antippen | | Bild über dem Text |
| 2 | Dialog | Fenster auf 844×390 setzen | | Dialog offen, Bild links, Text rechts |
| 3 | Dialog | zurück auf 390×844, „Schliessen“ antippen | | Fokus auf „Farbenfusion: Text zeigen“ |
