---
id: TF-APP-012
titel: Ein Spielstand im älteren Speicherformat wird beim Öffnen sichtbar verworfen und nur als Warnung protokolliert, nicht als Fehler gemeldet.
art: beides
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: ja
skript: src/ui/lobby/Lobby.fehler.test.tsx
aenderung: task/O2-app-rahmen-lobby (PR #29), Commit 04091c2
grenzfall_von: TF-APP-005
---

## Worum es geht

Nach jedem Wechsel des Speicherformats bringen wiederkehrende Spieler einen alten Spielstand mit. Den kann das Spiel nicht mehr lesen. Der Spieler soll erfahren, dass seine Partie deshalb weg ist. An den Fehlerdienst geht das aber nicht, sonst käme nach jedem Wechsel ein Bericht pro Spieler (Plan 2.3, O2 Kriterium 4).

## Bestanden, wenn

Nach dem Neuladen steht über der Gegnerwahl ein gelber Kasten mit rotem Rand: „Die gespeicherte Partie liess sich nicht laden. Sie stammt aus einem älteren Speicherformat, das diese Fassung des Spiels nicht mehr liest. Sie wurde verworfen; starte eine neue Partie.“ „Weiterspielen“ fehlt. Danach sind `schlangentanz-v2:partie` und `schlangentanz-v2:erweiterung` beide `null`. In der Konsole steht genau eine Warnung „Gespeicherte Partie im älteren Speicherformat verworfen: …“ und kein Fehler. Nach einem zweiten Neuladen ist der Kasten weg.

## Fehlgeschlagen, wenn

Kein Kasten erscheint, im Kasten steht „beschädigt“, einer der beiden Schlüssel ist noch da, die Konsole zeigt einen Fehler (rot) statt einer Warnung, oder der Kasten erscheint auch nach dem zweiten Neuladen.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Produktionsbuild (`npm run build`, `npm run preview`), Seite `/regeln` offen |

## Testdaten

In der Konsole: `localStorage.setItem('schlangentanz-v2:partie', '{"version":0,"spieler":[]}'); localStorage.setItem('schlangentanz-v2:erweiterung', '1')`. Gleiches Ergebnis erwartet mit `'{"version":-1}'`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Entwicklerwerkzeuge, Konsole | alten Spielstand anlegen | Ausdruck aus den Testdaten | keine Ausgabe |
| 2 | Adresszeile | `/` öffnen | | Kasten mit „älteren Speicherformat“, kein „Weiterspielen“ |
| 3 | Konsole | Meldungen ansehen | | eine Warnung, kein Fehler |
| 4 | Konsole | Speicher ansehen | `[localStorage.getItem('schlangentanz-v2:partie'), localStorage.getItem('schlangentanz-v2:erweiterung')]` | `[null, null]` |
| 5 | Browser | neu laden (F5) | | Lobby ohne Kasten |

## Zurücksetzen

`localStorage.clear()` in der Konsole; danach zeigt `/` die leere Lobby ohne „Laufende Partie“.
