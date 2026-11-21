---
id: TF-APP-019
titel: Zwei neue Partien mit denselben Einstellungen beginnen mit verschiedenen Starthänden, weil die Lobby keine feste Saat benutzt.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: ja
aenderung: task/P0.3d-ki-grenze (PR #55)
---

## Worum es geht

Eine KI-Strategie könnte die Saat einer Partie aus ihrer eigenen Starthand erraten, wenn die Saat klein und bekannt ist, und kennte dann alle Hände und den Stapel. Im Spiel darf das nicht gehen. Deshalb legt die Lobby jede Partie mit `Math.random` an und nie mit einer festen Saat. Geprüft wird das an zwei Partien hintereinander mit denselben Einstellungen.

## Bestanden, wenn

Nach zwei neuen Partien mit 1 Gegner ohne Erweiterung unterscheiden sich die beiden gespeicherten Partien in den Starthänden. Beide Spieler haben je 5 Karten, und der Nachziehstapel zeigt 98. Die Konsole meldet keinen Fehler.

## Fehlgeschlagen, wenn

Die zweite Partie hat dieselben Starthände und denselben Anfang des Nachziehstapels wie die erste, oder „Neue Partie“ öffnet `/spiel` nicht.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Produktionsbuild ab Commit `d3d1cb6`: `npm run build`, dann `npm run preview -- --port 4173 --strictPort`, Adresse `http://localhost:4173/` |
| Ausgangslage prüfen | Local Storage der Seite ist leer, die Lobby zeigt keine laufende Partie |

## Testdaten

Gegner 1, Erweiterung „Aus“. Local-Storage-Schlüssel `schlangentanz-v2:partie`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Lobby | „1“ bei „Gegner“ wählen, „Mit Erweiterung“ auf „Aus“ lassen, „Neue Partie“ klicken | | Adresse `/spiel`, „KI-Gegner 1 · 5 Handkarten“, „Nachziehstapel 98“, „Deine Hand · 5 Karten“ |
| 2 | Entwicklerwerkzeuge, Konsole | beide Hände und die ersten drei Karten des Stapels auslesen | `const s = JSON.parse(localStorage.getItem('schlangentanz-v2:partie')); [s.spieler.map(p => p.hand.map(k => k.id)), s.nachziehstapel.slice(0, 3).map(k => k.id)]` | zwei Listen mit je 5 Karten-Ids und drei Ids des Stapels; notieren |
| 3 | Spieltisch | „Zur Lobby“ klicken | | Lobby zeigt „Laufende Partie: 1 Gegner, Erweiterung aus“ |
| 4 | Lobby | „Neue Partie“ klicken, dann „Ja, neue Partie“ | | Adresse `/spiel`, wieder 5 Handkarten je Spieler und Stapel 98 |
| 5 | Entwicklerwerkzeuge, Konsole | dieselbe Zeile wie in Schritt 2 ausführen | wie Schritt 2 | die Hände unterscheiden sich von denen aus Schritt 2 |

## Zurücksetzen

Im Local Storage den Schlüssel `schlangentanz-v2:partie` löschen. Danach zeigt die Lobby keine laufende Partie mehr.

## Nicht abgedeckte Grenzfälle

Mit 2 und 3 Gegnern und mit Erweiterung ist nicht eigens geprüft, weil die Lobby für alle Einstellungen dieselbe Zeile `erstellePartie(…, zufall: Math.random)` aufruft. Dass zwei Partien zufällig doch gleich beginnen, ist bei rund 100 Karten so unwahrscheinlich, dass es nicht geprüft wird. Ob `Math.random` selbst gut genug mischt, prüft dieser Testfall nicht; das liegt bei der Plattform.
