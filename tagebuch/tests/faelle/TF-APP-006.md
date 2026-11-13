---
id: TF-APP-006
titel: Solange die Lobby offen ist, läuft keine Partie: Die App stellt keinen Zeitgeber und keinen Animationsrahmen.
art: automatisch
regression: ja
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
skript: src/ui/lobby/Lobby.hintergrund.test.tsx
aenderung: task/O2-app-rahmen-lobby (PR #29)
---

## Worum es geht

In der Lobby soll nichts rechnen, auch wenn ein Spielstand gespeichert ist; sonst würden KI-Züge im Hintergrund weiterlaufen (Plan O2, Kriterium 5).

## Bestanden, wenn

In 3 Sekunden Lobby, leer und mit gespeicherter Partie, stellt der Code der App 0 Zeitgeber (`setTimeout`, `setInterval`) und 0 Animationsrahmen (`requestAnimationFrame`). Aufrufe, die ein Browser-Zusatz in die Seite spritzt, zählen nicht; ihre Herkunft steht im Stapel.

## Fehlgeschlagen, wenn

Ein Aufruf mit Herkunft `localhost:4173/assets/index-*.js` erscheint.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Produktionsbuild auf Port 4173, Playwright Chromium |

## Testdaten

Ein Init-Skript, das die drei Funktionen umhüllt und je Aufruf die ersten Zeilen des Stapels merkt.

## Technische Prüfung

Playwright: `addInitScript` umhüllt `setTimeout`, `setInterval`, `requestAnimationFrame`; `goto('/')`, 3 s warten, Zähler und Stapel lesen. Danach mit Partie: „Neue Partie“, Browser-Zurück, Zähler auf 0 setzen, 3 s warten, lesen.

## Nicht abgedeckte Grenzfälle

Keine.
