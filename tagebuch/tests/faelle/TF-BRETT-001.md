---
id: TF-BRETT-001
titel: Der Spieltisch zeigt jede Szene in allen fünf Geräteklassen ohne waagrechtes Scrollen, mit dir unten und jeder Karte erreichbar.
art: beides
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: ja
skript: tests/layout/tisch.spec.ts
aenderung: task/O4-spieltisch (PR #34)
---

## Worum es geht

Der Spieltisch unter `/spiel` zeigt eine gespeicherte Partie. Deine Hand und deine Schlangen stehen unten und bleiben dort, die Gegner oben. Auch beim Volltisch (4 Spieler, je 2 Schlangen mit 11 Karten) muss jede Karte zu erreichen sein, auf dem Handy wie auf dem Desktop.

## Bestanden, wenn

In jeder der fünf Klassen gilt für die Szenen Volltisch, Mittelspiel, geheime Hände, Angriff auf mich und neue Partie: `scrollWidth` gleich `clientWidth`; die Hand endet am unteren Fensterrand; jedes Kartenbild lässt sich ins Bild scrollen und ist dann ganz zu sehen; kein Knopf und kein Verweis ist kleiner als 44 px; keine Datei aus `/karten/*.webp` wird geladen (nur `/karten-klein/`); keine Konsolenfehler.

## Fehlgeschlagen, wenn

Die Seite ist breiter als das Fenster, die Hand rutscht nach oben oder unter den Rand, eine Karte bleibt auch nach dem Scrollen ganz oder teilweise verdeckt, ein Bedienelement ist unter 44 px, oder eine grosse Kartenfassung wird geladen.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Produktionsbuild (`npm run build`, `vite preview`), Playwright-Kontexte aus `scripts/pruefung/geraeteklassen.mjs` |
| Ausgangslage | Im Local Storage unter `schlangentanz-v2:partie` steht der serialisierte Zustand eines Szenarios aus `src/ui/tisch/__tests__/szenarien.ts` |

## Testdaten

Szenarien `volltisch`, `mittelspiel`, `geheimeHaende`, `angriffAufMich`, `neuePartie`, je mit `serialisiere()` aus der Engine.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser | Spielstand in den Local Storage legen, `/spiel` öffnen | Szenario | Tisch mit „Deine Hand“ unten |
| 2 | Tisch | Foto machen und ansehen | | Gegner oben, Statuszeile oben, Hand unten |
| 3 | Konsole | `scrollWidth` und `clientWidth` lesen | | gleich |
| 4 | Konsole | jedes Bild mit `scrollIntoView` holen, sichtbaren Anteil messen | | jedes Bild ganz sichtbar |
| 5 | Netzwerk | geladene Bilder lesen | | nur `/karten-klein/…` und die Rückseite |

## Zurücksetzen

Browserkontext schliessen; der Local Storage ist danach leer.

## Nicht abgedeckte Grenzfälle

Grosse Hand, 320 px, Mensch nicht auf Platz 1 und Drehen mit offener Grossansicht haben eigene Testfälle (TF-BRETT-005 bis TF-BRETT-008). Ein Volltisch mit drei Schlangen je Spieler ist nicht abgedeckt: Das Material lässt ihn nicht zu.
