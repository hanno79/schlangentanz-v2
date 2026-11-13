---
id: TF-APP-015
titel: Die Lobby legt die Partie mit Gegnerzahl und Erweiterung über die Engine an, und ein echter Spielstand im Format 1 wird als älteres Speicherformat verworfen.
art: manuell
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: ja
aenderung: task/E1-struktur (PR #31), Commit 96b1650
---

## Worum es geht

Bis E1 kannte die Engine keinen Erweiterungs-Schalter, und die Lobby merkte sich die Wahl unter einem eigenen Schlüssel. Seit E1 steht die Wahl im Spielstand selbst. Geprüft wird, dass jede Wahl in der Lobby genau die Partie ergibt, die A4 verlangt, und dass ein Spielstand der Fassung vor E1 sichtbar verworfen wird.

## Bestanden, wenn

Für 1, 2 und 3 Gegner, je mit und ohne Erweiterung, zeigt `/spiel` die gewählte Gegnerzahl und „Erweiterung an“ oder „aus“. Im Speicher liegt nur `schlangentanz-v2:partie` mit `version 2`, der gewählten Erweiterung, Gegnerzahl + 1 Spielern mit je 5 Handkarten und 108 (ohne) oder 112 (mit Erweiterung) minus 5 je Spieler Karten im Nachziehstapel: 98, 93, 88 ohne, 102, 97, 92 mit Erweiterung. Mit Erweiterung liegen 3 offene Aufgaben aus, jeder Spieler hat eine geheime, im Aufgabenstapel liegen 15 minus 3 minus Spielerzahl. Die Lobby zeigt danach „Laufende Partie: 3 Gegner, Erweiterung an“, „Weiterspielen“ und F5 zeigen dieselbe Partie. Ein Spielstand der Engine vor E1 (`version 1`, 10'804 Zeichen) ergibt auf `/` und `/spiel` den Kasten „… älteren Speicherformat …“ mit `role="alert"`, danach ist der Speicher leer, die Konsole zeigt genau eine Warnung und keinen Fehler, nach F5 ist der Kasten weg. In keiner Klasse scrollt eine Seite waagrecht.

## Fehlgeschlagen, wenn

`/spiel` zeigt eine andere Gegnerzahl oder Erweiterung, eine Kartenzahl weicht ab, der Schlüssel `schlangentanz-v2:erweiterung` taucht auf, der alte Spielstand wird geladen oder als „beschädigt“ gemeldet, die Konsole zeigt einen Fehler, oder `scrollWidth` ist grösser als `clientWidth`.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Produktionsbuild (`npm run build`, `npm run preview -- --port 4173 --strictPort`), `http://localhost:4173/` |
| Ausgangslage | leerer `localStorage` |

## Testdaten

Ein Spielstand der Engine vor E1: aus `origin/neuaufbau` vor dem Merge von E1 `erstelleEinzelspielerSpielzustand(2)` und `serialisiere` (10'804 Zeichen, `version: 1`).

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Lobby | Gegnerzahl tippen, bei Bedarf „Mit Erweiterung“, dann „Neue Partie“ | 1, 2 oder 3 Gegner, mit oder ohne Erweiterung | Adresse `/spiel`, Kästen „Gegner“ und „Erweiterung“ wie gewählt |
| 2 | Konsole | Spielstand lesen | `JSON.parse(localStorage.getItem('schlangentanz-v2:partie'))` | `version`, `erweiterung`, Spielerzahl, Handkarten, Nachziehstapel und Aufgaben wie unter „Bestanden, wenn“ |
| 3 | Konsole | Schlüssel lesen | `Object.keys(localStorage)` | nur `schlangentanz-v2:partie` |
| 4 | Spieltisch | Schritte 1 bis 3 für alle sechs Kombinationen; nach 3 Gegnern mit Erweiterung „Zurück zur Lobby“ | | „Laufende Partie: 3 Gegner, Erweiterung an“ |
| 5 | Lobby | „Weiterspielen“, dann F5 | | „Gegner 3“, „Erweiterung an“ |
| 6 | Konsole | alten Spielstand ablegen, dann `/` öffnen | Inhalt aus den Testdaten | Kasten „… älteren Speicherformat …“, kein „Weiterspielen“, eine Warnung |
| 7 | Konsole | Speicher lesen, dann F5 | `Object.keys(localStorage)` | `[]`, nach F5 kein Kasten |
| 8 | | Schritte 6 und 7 mit `/spiel` statt `/` | | wie oben |

## Zurücksetzen

`localStorage.clear()` in der Konsole; danach zeigt die Lobby kein „Weiterspielen“.

## Nicht abgedeckte Grenzfälle

Exotische und beschädigte Inhalte im Format 2 deckt TF-APP-014 ab, sobald seine Testdaten auf Format 2 umgestellt sind; Doppelklick und zweiter Tab TF-APP-011 und TF-APP-009.
