---
id: TF-PRUEF-016
titel: Die Startseite / zeigt im Produktionsbuild in allen drei Geräteklassen den Platzhalter ohne waagrechtes Scrollen und ohne Konsolenfehler.
art: manuell
regression: ja
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
aenderung: task/P0.3b-pruefwerkzeuge-nachschaerfen (PR #28)
---

## Worum es geht

Seit P0.4 zeigt `/` nur einen Platzhalter, bis die neue Oberfläche kommt. Ein Task, der keine Oberfläche ändert, darf daran nichts verschieben. Der Vergleich mit den Fotos aus dem Protokoll P0.4 zeigt das.

## Bestanden, wenn

`node scripts/pruefung/bildschirmfotos.mjs` endet mit Exit 0 und meldet je Klasse „Konsolenfehler: 0“, bei Tablet und Handy „pointer: coarse ja“. Jedes Bild zeigt die Überschrift „Schlangentanz“ und darunter „Das Spiel wird gerade neu gebaut. Hier gibt es bald wieder etwas zu spielen.“, zentriert, auf dem Handy auf zwei Zeilen umbrochen. `scrollWidth` ist in jeder Klasse gleich `clientWidth` (1280, 1024, 390). Die Bilder stimmen Pixel für Pixel mit `docs/abnahme/bilder/P0.4-platzhalter-<klasse>.png` überein.

## Fehlgeschlagen, wenn

Ein Text fehlt, ist abgeschnitten oder anders umbrochen, `scrollWidth` ist grösser als `clientWidth`, es gibt Konsolenfehler, oder ein Bild weicht vom P0.4-Foto ab.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | eigener Worktree auf dem zu prüfenden Commit, `npm run build` gelaufen |
| Ausgangslage prüfen | gewählter Port lauscht nicht (Portprüfung aus PRUEFER_ANLEITUNG, Schritt 4) |

## Testdaten

Port 4183 (frei gewählt, damit fremde Server auf 4173/4174 nicht stören), Name `P0.3b-platzhalter`, Ziel ein eigener Ordner im Scratchpad.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Git Bash, Hintergrundaufgabe | Vorschau starten | `npm run preview -- --port 4183 --strictPort` | „Local: http://localhost:4183/“ |
| 2 | Git Bash im Repo | Fotos machen | `node scripts/pruefung/bildschirmfotos.mjs http://localhost:4183/ --name P0.3b-platzhalter --ziel <scratchpad>` | Exit 0, drei Zeilen mit Grösse, Touch und „Konsolenfehler: 0“ |
| 3 | Bildbetrachter | drei Bilder ansehen | | Texte wie unter „Bestanden, wenn“, nichts abgeschnitten |
| 4 | Playwright-Skript nach PRUEFER_ANLEITUNG, Schritt 7 | je Klasse `scrollWidth` und `clientWidth` von `document.documentElement` lesen | | gleich |
| 5 | Python mit Pillow | Bilder mit den P0.4-Fotos vergleichen | `ImageChops.difference(a, b).getbbox()` | `None` in allen drei Klassen |
| 6 | Git Bash | Server beenden nach TF-PRUEF-015 | | Port 4183 lauscht nicht mehr |

## Nicht abgedeckte Grenzfälle

Breiten zwischen den Klassen: 320, 767, 768 und 844×390 (Handy quer) wurden mit `setViewportSize` gemessen, `scrollWidth` gleich der Breite; ein eigener Testfall lohnt erst, wenn `/` wieder eine echte Oberfläche hat. Testhook-Build: unverändert durch `npm run test:layout` geprüft.
