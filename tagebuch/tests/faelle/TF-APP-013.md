---
id: TF-APP-013
titel: Wird /spiel mit einem unlesbaren Spielstand direkt aufgerufen, sagt auch der Spieltisch, dass die Partie verworfen wurde.
art: beides
regression: ja
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: ja
skript: src/ui/lobby/Lobby.fehler.test.tsx
aenderung: task/O2-app-rahmen-lobby (PR #29), Commit 04091c2; an Format 2 angepasst mit task/E1-struktur (PR #31)
grenzfall_von: TF-APP-005
---

## Worum es geht

Wer ein Lesezeichen auf `/spiel` hat, kommt nicht über die Lobby. Ist sein Spielstand kaputt, muss der Spieltisch es genauso sagen wie die Lobby, sonst steht dort nur „Es läuft keine Partie“, und niemand erfährt, warum.

## Bestanden, wenn

`/spiel` zeigt unter „Spieltisch im Aufbau“ und „Es läuft keine Partie. Starte in der Lobby eine neue.“ den Kasten „Die gespeicherte Partie liess sich nicht laden. Der Spielstand ist beschädigt (Ungültiger Spielstand: Er ist kein gültiges JSON). Sie wurde verworfen; starte eine neue Partie.“ Darunter steht „Zurück zur Lobby“. Der Schlüssel `schlangentanz-v2:partie` ist danach `null`, die Konsole zeigt genau einen Fehler „Gespeicherte Partie beschädigt und verworfen: …“. Der Kasten passt in jeder Geräteklasse ins Fenster (waagrechter Überstand 0 px).

## Fehlgeschlagen, wenn

Der Spieltisch zeigt nur „Es läuft keine Partie“ ohne Kasten, der Schlüssel bleibt stehen, die Konsole bleibt leer, oder die Seite ist breiter als das Fenster.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Produktionsbuild, Seite `/regeln` offen |

## Testdaten

In der Konsole: `localStorage.setItem('schlangentanz-v2:partie', '{kaputt')`

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Entwicklerwerkzeuge, Konsole | kaputten Spielstand anlegen | Ausdruck aus den Testdaten | keine Ausgabe |
| 2 | Adresszeile | `/spiel` direkt öffnen | | Kasten mit „beschädigt“ und dem Grund in Klammern |
| 3 | Konsole | Meldungen ansehen | | ein Fehler „Gespeicherte Partie beschädigt und verworfen“ |
| 4 | Konsole | Speicher ansehen | `localStorage.getItem('schlangentanz-v2:partie')` | `null` |
| 5 | Spieltisch | „Zurück zur Lobby“ | | Lobby ohne Kasten und ohne „Weiterspielen“ |

## Zurücksetzen

`localStorage.clear()` in der Konsole; danach zeigt `/` die leere Lobby.
