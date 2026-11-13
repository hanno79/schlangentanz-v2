---
id: TF-PRUEF-007
titel: Die Vorschau sieht im eingebauten Browser in allen drei Geräteklassen so aus wie auf den Fotos von bildschirmfotos.mjs.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
aenderung: task/P0.3-pruefwerkzeuge (PR #26)
---

## Worum es geht

Die Fotos des Skripts sind nur dann ein Beleg, wenn ein echter Browser in derselben Fenstergrösse dasselbe zeigt. Geprüft wird der Aufbau, nicht jedes Pixel (die Lobby hat Animationen, das Skript fotografiert mit reduzierter Bewegung).

## Bestanden, wenn

Bei 1280×900, 1024×768 und 390×844 zeigt der eingebaute Browser denselben Aufbau wie das zugehörige Foto: Kopfleiste „DAS KARTENSPIEL Schlangentanz Bereit für deine nächste Schlange“ mit drei Hinweisknöpfen, Lobby-Code „XK9-B4Z“, „Bereit im sonnigen Nest“, „Aktive Partie: Du + 1 KI“, Plätze Slippy Host (DU), Orange Crush (MUTIG), zweimal „frei“; bei Desktop und Tablet vier Plätze nebeneinander und drei Startknöpfe; beim Handy Kopfleiste zweizeilig, Hinweisknöpfe 2+1, Plätze untereinander. Kein waagrechtes Scrollen (`scrollWidth` höchstens Fensterbreite), keine Konsolenfehler.

## Fehlgeschlagen, wenn

Aufbau, Umbruch oder Reihenfolge weichen vom Foto ab, oder es gibt waagrechtes Scrollen oder Konsolenfehler.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Vorschau des Produktionsbuilds auf `http://localhost:4173/`, Fotos aus TF-PRUEF-005 liegen vor |

## Testdaten

Keine.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | eingebauter Browser der Desktop-App | Adresse öffnen, Fenster 1280×900 setzen, 3 s warten | `http://localhost:4173/` | Aufbau wie `P0.3-lobby-desktop.png` |
| 2 | derselbe Browser | Fenster 1024×768, neu laden | | Aufbau wie `P0.3-lobby-tablet.png` |
| 3 | derselbe Browser | Fenster 390×844, neu laden | | Aufbau wie `P0.3-lobby-handy.png`; `matchMedia('(pointer: coarse)')` trifft zu |
| 4 | Konsole des Browsers | Fehler lesen | | keine |
| 5 | derselbe Browser | Fenstergrösse zurücksetzen | | |

## Nicht abgedeckte Grenzfälle

Touch bei 1024×768: Der eingebaute Browser emuliert Touch erst unter 768 px Breite; Touch im Tablet prüft deshalb TF-PRUEF-008 mit Playwright. Pixelgleichheit: nicht geprüft, weil die Lobby im eingebauten Browser animiert ist.
