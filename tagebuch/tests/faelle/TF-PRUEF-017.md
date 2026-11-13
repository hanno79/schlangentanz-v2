---
id: TF-PRUEF-017
titel: bildschirmfotos.mjs liefert für eine laufende Vorschau fünf Bilder in 1280×900, 1024×768, 768×1024, 390×844 und 844×390, Touch bei allen ausser Desktop.
art: beides
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
skript: tests/pruefwerkzeuge.test.ts
aenderung: task/P0.3c-fuenf-geraeteklassen
---

## Worum es geht

Seit dem 13.11.2026 prüfen Prüfer jede Oberfläche in fünf Geräteklassen: Tablet und Handy je hochkant und quer. Die Fotos dafür macht dieses Skript. Hat ein Bild die falsche Grösse oder fehlt Touch, beschreibt der Prüfer ein anderes Gerät als das verlangte.

## Bestanden, wenn

Das Skript endet mit Exit 0 und schreibt fünf Zeilen: `<name>-desktop.png` mit 1280×900 und „pointer: coarse nein“, `-tablet-quer.png` mit 1024×768, `-tablet-hochkant.png` mit 768×1024, `-handy-hochkant.png` mit 390×844 und `-handy-quer.png` mit 844×390, die vier letzten mit „Touch an, pointer: coarse ja“, alle mit „Konsolenfehler: 0“. `file` nennt dieselben Grössen. Jedes Bild zeigt die Lobby mit „Schlangentanz“, „Du gegen bis zu drei KI-Gegner“, den drei Gegner-Knöpfen, „Mit Erweiterung“ und „Neue Partie“.

## Fehlgeschlagen, wenn

Exit ungleich 0, ein Bild fehlt, eine Grösse weicht ab, Touch ist bei einer Tablet- oder Handyklasse aus, oder ein Bild ist leer.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Produktionsbuild (`npm run build`), Vorschau `npx vite preview --port 4183 --strictPort` läuft; Port vorher frei (PRUEFER_ANLEITUNG, Schritt 4) |
| Ausgangslage prüfen | kein Spielstand im Browser (das Skript öffnet je Klasse einen frischen Kontext) |

## Testdaten

Adresse `http://localhost:4183/`, Name `P0.3c-lobby`, Ziel ein Ordner ausserhalb des Repos, Wartebedingung `[data-testid="lobby"]`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Git Bash im Repo | Skript ausführen | `node scripts/pruefung/bildschirmfotos.mjs http://localhost:4183/ --name P0.3c-lobby --ziel <ordner> --warte-auf '[data-testid="lobby"]'; echo $?` | fünf Zeilen wie unter „Bestanden, wenn“, Exit 0 |
| 2 | dieselbe Konsole | Grössen nachlesen | `file <ordner>/P0.3c-lobby-*.png` | 1280 x 900, 1024 x 768, 768 x 1024, 390 x 844, 844 x 390 |
| 3 | Bildbetrachter | jedes Bild öffnen | | Lobby wie unter „Bestanden, wenn“; bei Handy quer endet das Bild unter „Neue Partie“ |
| 4 | Git Bash | Vorschau beenden (PID über `netstat -ano`, Befehlszeile prüfen) | | Port 4183 lauscht nicht mehr |

## Nicht abgedeckte Grenzfälle

Seite ohne viewport-Meta-Tag: eigener Testfall TF-PRUEF-018. Lobby mit laufender Partie in Handy quer: dort liegen „Neue Partie“ und „Regeln“ unter dem Bildrand; das ist ein Befund der Lobby, kein Fehler des Skripts, und steht in `tests/layout/geraeteklassen_ausnahmen.json` (TF-PRUEF-020). Falscher Aufruf, toter Server und falscher Browserpfad: TF-PRUEF-006, unverändert.
