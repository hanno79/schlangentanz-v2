---
id: TF-APP-007
titel: Ist der gespeicherte Spielstand beim Öffnen unlesbar, sagt die App das sichtbar, statt die Partie still zu verwerfen.
art: manuell
regression: nein
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: ja
aenderung: task/O2-app-rahmen-lobby (PR #29)
grenzfall_von: TF-APP-005
---

## Worum es geht

Ein Spielstand kann unlesbar werden, etwa nach einem Update mit neuem Speicherformat. Das ist ein Fehler beim Start der App. Verschwindet die Partie dann ohne ein Wort, weiss der Spieler nicht, was passiert ist, und niemand erfährt davon (Plan O2, Kriterium 4).

## Bestanden, wenn

Nach dem Neuladen mit unlesbarem Spielstand zeigt die Seite eine sichtbare Meldung, dass der Spielstand nicht gelesen werden konnte, und der Fehler geht an den Fehlerdienst.

## Fehlgeschlagen, wenn

Die Lobby erscheint ohne jeden Hinweis, als hätte es nie eine Partie gegeben, und die Konsole bleibt leer.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Produktionsbuild auf Port 4173, Lobby offen |

## Testdaten

In der Konsole: `localStorage.setItem('schlangentanz-v2:partie', '{"version":1,"kaputt":true}'); localStorage.setItem('schlangentanz-v2:erweiterung', '1')`

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Entwicklerwerkzeuge, Konsole | unlesbaren Spielstand anlegen | Ausdruck aus den Testdaten | |
| 2 | Browser | Seite neu laden (F5) | | sichtbare Meldung zum Spielstand |
| 3 | Konsole | Speicher ansehen | `Object.keys(localStorage)` | kein verwaister Schlüssel `schlangentanz-v2:erweiterung` ohne Spielstand |

## Zurücksetzen

Local Storage löschen.
