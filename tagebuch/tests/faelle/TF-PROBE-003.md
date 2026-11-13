---
id: TF-PROBE-003
titel: Dreht man das Handy von 390×844 auf 844×390 und zurück, wechselt die Anzeige von Handy zu Tablet und wieder zu Handy.
art: manuell
regression: nein
prioritaet: niedrig
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
aenderung: probe/PROBE-1-geraeteklasse (59a50e2)
grenzfall_von: TF-PROBE-001
---

## Worum es geht

Auf einem Handy ändert sich die Fensterbreite, wenn man es dreht. Quer ist ein 390×844-Handy 844 Pixel breit und gilt nach der Festlegung als Tablet. Geprüft wird, ob die Seite das beim Drehen ohne Neuladen nachzieht und Touch dabei an bleibt.

## Bestanden, wenn

Hochkant 390×844: „Geräteklasse: Handy“, „Touch: ja“, „Breite: 390 px“. Quer 844×390: „Geräteklasse: Tablet“, „Touch: ja“, „Breite: 844 px“, alles ohne waagrechtes Scrollen sichtbar. Wieder hochkant: „Geräteklasse: Handy“, „Breite: 390 px“. Der Zähler bleibt durchgehend auf dem Wert vor dem Drehen.

## Fehlgeschlagen, wenn

Nach dem Drehen steht weiter „Handy“ oder „Breite: 390 px“, Touch springt auf „nein“, der Zähler fällt auf 0, oder quer ist etwas abgeschnitten.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Produktionsbuild ab Commit 59a50e2 auf `http://localhost:4173/probe` |
| Ausgangslage prüfen | Browser mit Touch, Fenster 390×844 |

## Testdaten

Fenster 390×844, dann 844×390, dann 390×844.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Seite `/probe`, 390×844, Touch | „Neu messen“ einmal antippen | | „Geräteklasse: Handy“, „Touch: ja“, „Messungen: 1“ |
| 2 | Gerät oder Emulation | auf quer drehen, nicht neu laden | 844×390 | „Geräteklasse: Tablet“, „Touch: ja“, „Breite: 844 px“, „Messungen: 1“, nichts abgeschnitten |
| 3 | Gerät oder Emulation | zurück auf hochkant drehen | 390×844 | „Geräteklasse: Handy“, „Breite: 390 px“, „Messungen: 1“ |
