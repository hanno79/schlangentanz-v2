---
id: TF-PRUEF-006
titel: bildschirmfotos.mjs bricht bei falschem Aufruf, totem Server, fehlendem Element oder falschem PW_CHROMIUM_PFAD mit Meldung und Exit ungleich 0 ab.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
aenderung: task/P0.3-pruefwerkzeuge (PR #26)
grenzfall_von: TF-PRUEF-005
---

## Worum es geht

Ein Prüfer darf nie Bilder einer falschen oder leeren Seite beschreiben. Das Skript muss in diesen Fällen laut scheitern.

## Bestanden, wenn

Ohne `--name`: Exit 2 mit Aufrufhilfe. Adresse `http://localhost:4199/` ohne Server: Exit 1 mit `ERR_CONNECTION_REFUSED`. `--warte-auf '#gibt-es-nicht'`: Exit 1 nach 15 s Timeout. `PW_CHROMIUM_PFAD=/c/nichts/chrome.exe`: Exit 1 mit „dort liegt keine Datei“. `--warte-auf 'button'` bei laufender Vorschau: Exit 0 mit drei Bildern.

## Fehlgeschlagen, wenn

Einer der Fehlerfälle endet mit 0 oder schreibt Bilder.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Vorschau des Produktionsbuilds auf Port 4173, Port 4199 frei |

## Testdaten

Wie unter „Bestanden, wenn“.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Git Bash im Repo | ohne Namen aufrufen | `node scripts/pruefung/bildschirmfotos.mjs http://localhost:4173/ --ziel <ordner>; echo $?` | Exit 2, „--name fehlt.“ |
| 2 | dieselbe Konsole | toten Port | `node scripts/pruefung/bildschirmfotos.mjs http://localhost:4199/ --name x --ziel <ordner>; echo $?` | Exit 1, `ERR_CONNECTION_REFUSED` |
| 3 | dieselbe Konsole | fehlendes Element | `… --name x --ziel <ordner> --warte-auf '#gibt-es-nicht'; echo $?` | Exit 1, „Timeout 15000ms exceeded“ |
| 4 | dieselbe Konsole | falscher Browserpfad | `PW_CHROMIUM_PFAD=/c/nichts/chrome.exe node scripts/pruefung/bildschirmfotos.mjs http://localhost:4173/ --name x --ziel <ordner>; echo $?` | Exit 1, „dort liegt keine Datei“ |
| 5 | dieselbe Konsole | vorhandenes Element | `… --name P0.3-lobby2 --ziel <ordner> --warte-auf 'button'; echo $?` | Exit 0, drei Bilder; in `<ordner>` keine Datei `x-*.png` |
