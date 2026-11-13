---
id: TF-APP-002
titel: In der Lobby wählt man 1, 2 oder 3 Gegner und die Erweiterung, und „Neue Partie“ legt eine Partie an und öffnet /spiel.
art: beides
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: ja
skript: tests/layout/lobby.spec.ts
aenderung: task/O2-app-rahmen-lobby (PR #29)
---

## Worum es geht

Die Lobby ist die Startseite. Hier entscheidet der Spieler, gegen wie viele KI-Gegner er spielt und ob mit Erweiterung, und beginnt eine Partie (Plan O2, Kriterium 1). Geprüft wird in allen drei Geräteklassen, mit Maus und mit Finger.

## Bestanden, wenn

Die Lobby zeigt „1 Gegner“, „2 Gegner“, „3 Gegner“ (genau eines gewählt, anfangs 1), das Kästchen „Mit Erweiterung“ und den Knopf „Neue Partie“. Nach der Wahl „3 Gegner“, „Mit Erweiterung“ und einem Klick auf „Neue Partie“ steht die Adresse auf `/spiel`, der Titel ist „Spieltisch · Schlangentanz“, und die Seite zeigt „Gegner 3“ und „Erweiterung an“. Keine Seite ist breiter als das Fenster, jede Tippfläche misst mindestens 44 × 44 px.

## Fehlgeschlagen, wenn

Eine Wahl fehlt oder lässt sich nicht treffen, „Neue Partie“ bleibt auf `/`, `/spiel` zeigt eine andere Gegnerzahl, die Seite scrollt waagrecht, oder die Konsole zeigt einen Fehler.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | `npm run build`, dann `npm run preview -- --port 4173 --strictPort` |
| Ausgangslage | Speicher des Browsers leer (Entwicklerwerkzeuge, Anwendung, Local Storage löschen) |

## Testdaten

3 Gegner, Erweiterung an. In jeder Geräteklasse: Desktop 1280×900 Maus, Tablet quer 1024×768 Touch, Handy hochkant 390×844 Touch.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser | Adresse öffnen | `http://localhost:4173/` | Überschrift „Schlangentanz“, „1 Gegner“ grün gefüllt, „Neue Partie“, Verweis „Regeln“ |
| 2 | Lobby | auf „3 Gegner“ tippen | | „3 Gegner“ grün gefüllt, die anderen weiss |
| 3 | Lobby | auf „Mit Erweiterung“ tippen | | Häkchen gesetzt |
| 4 | Lobby | auf „Neue Partie“ tippen | | Adresse `/spiel`, „Spieltisch im Aufbau“, Kästen „Gegner 3“ und „Erweiterung an“ |

## Zurücksetzen

Local Storage löschen; danach zeigt `/` keine „Laufende Partie“.

## Nicht abgedeckte Grenzfälle

Doppelklick auf „Neue Partie“: TF-APP-011. Gedrehtes Handy: TF-APP-008.
