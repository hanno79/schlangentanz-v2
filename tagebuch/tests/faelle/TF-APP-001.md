---
id: TF-APP-001
titel: Die Startadresse / zeigt die Lobby und /game das Spiel, auch wenn es die Probe-Seite gibt.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
aenderung: probe/PROBE-1-geraeteklasse (59a50e2)
---

## Worum es geht

`src/main.tsx` entscheidet jetzt am Pfad, ob die Probe-Seite oder die App erscheint. Ein Fehler in dieser Weiche würde die ganze App treffen. Geprüft wird, dass die beiden üblichen Adressen weiter die App zeigen, in allen drei Geräteklassen.

## Bestanden, wenn

`/` zeigt in 1280×900, 1024×768 und 390×844 die Lobby: oben „DAS KARTENSPIEL“, „Schlangentanz“, „Bereit für deine nächste Schlange“, darunter „LOBBY CODE“ und den Code, „Bereit im sonnigen Nest“ und die Spielerplätze. `/game` zeigt den Spieltisch mit „Phase“ und „Karten ausspielen“. Nirgends steht „Probe-Seite“, die Konsole zeigt keinen Fehler.

## Fehlgeschlagen, wenn

Auf `/` oder `/game` erscheint die Probe-Seite, eine leere Seite oder eine Fehlermeldung, oder die Lobby sieht anders aus als vor der Änderung.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Produktionsbuild ab Commit 59a50e2 auf `http://localhost:4173` |

## Testdaten

Adressen `http://localhost:4173/` und `http://localhost:4173/game`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser, 1280×900 | Adresse öffnen | `http://localhost:4173/` | Lobby mit „Schlangentanz“, „LOBBY CODE“, „Bereit im sonnigen Nest“, Knöpfe „Duell starten (1 KI)“, „Waldparty starten (2 KI)“, „Große Runde starten (3 KI)“ |
| 2 | Browser mit Touch, 1024×768 | Adresse öffnen | `http://localhost:4173/` | dieselbe Lobby, alle drei Startknöpfe im Bild |
| 3 | Browser mit Touch, 390×844 | Adresse öffnen | `http://localhost:4173/` | dieselbe Lobby einspaltig, Spielerplätze untereinander |
| 4 | Browser, 1280×900 | Adresse öffnen | `http://localhost:4173/game` | Spieltisch mit „Phase“, „Karten ausspielen“, kein „Probe-Seite“ |

## Nicht abgedeckte Grenzfälle

Adressen, die `/probe` nur ähneln (`/probe/`, `/PROBE`): eigener Testfall TF-APP-002. `/probe?x=1` (Suchteil): bewusst nicht als eigener Testfall, die Weiche prüft nur den Pfad; im Prüfprotokoll PROBE-1 kurz geprüft.
