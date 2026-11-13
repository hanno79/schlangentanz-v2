---
id: TF-APP-005
titel: Wirft die Engine beim Anlegen einer Partie, zeigt die App den Grund und führt zurück in eine bedienbare Lobby.
art: beides
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: ja
skript: src/ui/lobby/Lobby.fehler.test.tsx
aenderung: task/O2-app-rahmen-lobby (PR #29)
---

## Worum es geht

Scheitert der Start einer Partie, darf keine weisse Seite entstehen. Der Spieler sieht, dass etwas schiefging und warum, und kommt zurück in die Lobby (Plan O2, Kriterium 4).

## Bestanden, wenn

Nach dem Klick auf „Neue Partie“ mit gestörter Zufallsquelle steht „Hier ist ein Fehler aufgetreten“ mit dem Grund „Prüffehler: Zufallsquelle nicht verfügbar“ in Rot und dem Knopf „Zurück zur Lobby“. Die Adresse bleibt `/`, kein Spielstand ist gespeichert. Die Konsole zeigt „Fehler beim Zeichnen: Error: Prüffehler …“. „Zurück zur Lobby“ zeigt wieder die Lobby.

## Fehlgeschlagen, wenn

Die Seite bleibt weiss, wechselt auf `/spiel`, zeigt keinen Grund, oder „Zurück zur Lobby“ führt nicht in die Lobby.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Produktionsbuild auf Port 4173, Lobby offen, Local Storage leer |

## Testdaten

In der Konsole: `Math.random = () => { throw new Error('Prüffehler: Zufallsquelle nicht verfügbar') }`

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Entwicklerwerkzeuge, Konsole | Zufallsquelle stören | Ausdruck aus den Testdaten | keine Ausgabe |
| 2 | Lobby | „Neue Partie“ | | Fehlerseite mit Grund, Adresse `/` |
| 3 | Fehlerseite | „Zurück zur Lobby“ | | Lobby ohne „Laufende Partie“ |

## Zurücksetzen

Seite neu laden (stellt `Math.random` wieder her), Local Storage löschen.

## Nicht abgedeckte Grenzfälle

Unlesbarer Spielstand beim Laden: TF-APP-007 (beschädigt, Lobby), TF-APP-012 (älteres Speicherformat), TF-APP-013 (direkter Aufruf von `/spiel`), TF-APP-014 (exotische und sehr grosse Inhalte).
