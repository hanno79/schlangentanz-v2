---
id: TF-PRUEF-018
titel: Eine Seite ohne viewport-Meta-Tag lässt bildschirmfotos.mjs mit Exit 1 und dem Hinweis „980 px breit“ abbrechen, statt ein verkleinertes Bild abzulegen.
art: beides
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
skript: tests/pruefwerkzeuge.test.ts
aenderung: task/P0.3c-fuenf-geraeteklassen
grenzfall_von: TF-PRUEF-017
---

## Worum es geht

Ohne viewport-Meta-Tag legt Chromium eine Seite auf einem Touch-Gerät 980 px breit aus und verkleinert sie aufs Fenster. Das Bild zeigt dann nicht das Fenster der Klasse; bei Tablet hochkant und Handy quer war es zudem eine Zeile zu niedrig (768×1023, 844×389). Das Skript soll das klar sagen.

## Bestanden, wenn

Für die Adresse `data:text/html,<title>Probe</title><h1>Probe</h1>` endet das Skript mit Exit 1 und der Meldung „Tablet hochkant 768×1024, Touch: Die Seite legt sich 980 px breit aus statt 768 px (fehlt <meta name="viewport" content="width=device-width">?).“ Im Zielordner liegen nur `probe-desktop.png` und `probe-tablet-quer.png`: Bei 1280 und 1024 px Breite ist das Fenster breiter als 980 px, dort fällt das fehlende Meta-Tag nicht auf.

## Fehlgeschlagen, wenn

Exit 0, oder die Meldung nennt nur eine falsche Bildgrösse ohne die 980 px und den Hinweis auf das Meta-Tag.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Arbeitskopie auf dem zu prüfenden Commit nach `npm ci`; kein Server nötig |

## Testdaten

Adresse `data:text/html,<title>Probe</title><h1>Probe</h1>`, Name `probe`, Ziel ein leerer Ordner ausserhalb des Repos. Zum Vergleich dieselbe Adresse mit `<meta name="viewport" content="width=device-width, initial-scale=1">` davor.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Git Bash im Repo | Skript ohne Meta-Tag aufrufen | `node scripts/pruefung/bildschirmfotos.mjs 'data:text/html,<title>Probe</title><h1>Probe</h1>' --name probe --ziel <ordner>; echo $?` | Exit 1, Meldung mit „980 px breit“ und „viewport“ |
| 2 | dieselbe Konsole | Ordner ansehen | `ls <ordner>` | nur `probe-desktop.png` und `probe-tablet-quer.png` |
| 3 | dieselbe Konsole | Skript mit Meta-Tag aufrufen | `node scripts/pruefung/bildschirmfotos.mjs 'data:text/html,<meta name="viewport" content="width=device-width, initial-scale=1"><h1>Probe</h1>' --name probe --ziel <ordner>; echo $?` | Exit 0, fünf Bilder |
