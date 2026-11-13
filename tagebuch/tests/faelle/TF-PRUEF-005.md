---
id: TF-PRUEF-005
titel: bildschirmfotos.mjs liefert für eine laufende Vorschau drei Bilder in 1280×900, 1024×768 und 390×844, Touch bei Tablet und Handy.
art: beides
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
skript: tests/pruefwerkzeuge.test.ts
aenderung: task/P0.3-pruefwerkzeuge (PR #26)
---

## Worum es geht

Prüfer fotografieren jede Oberfläche in den drei Geräteklassen mit diesem Skript. Stimmen Grösse oder Touch nicht, beschreibt ein Prüfer ein falsches Gerät.

## Bestanden, wenn

Das Skript endet mit Exit 0, schreibt `<name>-desktop.png` (1280×900, „pointer: coarse nein“), `-tablet.png` (1024×768, „pointer: coarse ja“) und `-handy.png` (390×844, „pointer: coarse ja“), jeweils mit „Konsolenfehler: 0“, und die PNG-Dateien haben genau diese Grössen (`file *.png`). Die Bilder zeigen die Lobby vollständig gerendert.

## Fehlgeschlagen, wenn

Exit ungleich 0, ein Bild fehlt, eine Grösse weicht ab, Touch ist bei Tablet oder Handy aus, oder ein Bild ist leer.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Produktionsbuild (`npm run build`), Vorschau `npm run preview -- --port 4173 --strictPort` läuft, Port vorher frei |

## Testdaten

Adresse `http://localhost:4173/`, Name `P0.3-lobby`, Ziel ein Ordner ausserhalb des Repos.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Git Bash im Repo | Skript ausführen | `node scripts/pruefung/bildschirmfotos.mjs http://localhost:4173/ --name P0.3-lobby --ziel <ordner>; echo $?` | drei Zeilen wie unter „Bestanden, wenn“, Exit 0 |
| 2 | dieselbe Konsole | Grössen nachlesen | `file <ordner>/P0.3-lobby-*.png` | 1280 x 900, 1024 x 768, 390 x 844 |
| 3 | Bildbetrachter | jedes Bild öffnen | | Lobby mit Kopfleiste, Lobby-Code XK9-B4Z, Spielerplätzen; nichts leer oder abgeschnitten ausser am unteren Fensterrand |
| 4 | Konsole der Vorschau | Server beenden | Strg+C | Port 4173 frei |

## Nicht abgedeckte Grenzfälle

Gedrehtes Handy (844×390) bietet das Skript nicht an; es kennt nur die drei Klassen des Plans.
