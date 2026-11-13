---
id: TF-APP-007
titel: Ist der gespeicherte Spielstand beim Öffnen unlesbar, sagt die App das sichtbar, statt die Partie still zu verwerfen.
art: manuell
regression: nein
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: ja
aenderung: task/O2-app-rahmen-lobby (PR #29); an Format 2 angepasst mit task/E1-struktur (PR #31)
grenzfall_von: TF-APP-005
---

## Worum es geht

Ein Spielstand kann beschädigt werden, etwa durch einen Fehler beim Schreiben oder eine fremde Änderung im Speicher. Das ist ein Fehler beim Start der App. Ein Stand aus einem älteren Speicherformat ist dagegen erwartet und wird nur als Warnung protokolliert (TF-APP-012). Verschwindet die Partie dann ohne ein Wort, weiss der Spieler nicht, was passiert ist, und niemand erfährt davon (Plan O2, Kriterium 4).

## Bestanden, wenn

Nach dem Neuladen mit unlesbarem Spielstand zeigt die Seite eine sichtbare Meldung, dass der Spielstand nicht gelesen werden konnte, und der Fehler geht an den Fehlerdienst.

## Fehlgeschlagen, wenn

Die Lobby erscheint ohne jeden Hinweis, als hätte es nie eine Partie gegeben, und die Konsole bleibt leer.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Produktionsbuild auf Port 4173, Lobby offen |

## Testdaten

In der Konsole: `localStorage.setItem('schlangentanz-v2:partie', '{"version":2,"kaputt":true}')`. Seit E1 ist 2 das aktuelle Speicherformat; mit `version` 1 wäre es ein älteres Format und kein Defekt.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Entwicklerwerkzeuge, Konsole | unlesbaren Spielstand anlegen | Ausdruck aus den Testdaten | |
| 2 | Browser | Seite neu laden (F5) | | sichtbare Meldung zum Spielstand |
| 3 | Konsole | Speicher ansehen | `localStorage.getItem('schlangentanz-v2:partie')` | `null`: der beschädigte Stand ist verworfen |

## Zurücksetzen

Local Storage löschen.
