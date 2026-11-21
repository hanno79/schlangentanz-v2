---
id: TF-DEV-034
titel: Der Entwicklertisch bleibt in Zufallspartien mit Erweiterung bedienbar, auch wenn die Engine über 2'000 Häutungen auf einmal anbietet.
art: manuell
regression: nein
prioritaet: niedrig
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
aenderung: task/E9-haeutung (PR #69)
---

## Worum es geht

In langen Schlangen bietet die Engine für eine Schlangenhäutung jede Umordnung jedes Abschnitts einzeln an, oft weit über tausend Knöpfe. Hier wird gemessen, ob ein Klick am Entwicklertisch dann noch flüssig wirkt und ob Partien mit Klicks bis zum Ende laufen.

## Bestanden, wenn

Alle vier Partien (Saat 2 und 5 mit 2 Spielern, Saat 7 mit 3, Saat 11 mit 4, je mit Erweiterung) enden mit Klicks. Kein Klick braucht bis zum nächsten Bild länger als 1 Sekunde, der Median liegt unter 100 ms. Keine Meldung „Abgelehnt“, keine verletzte Invariante, keine Konsolenfehler, kein waagrechtes Überstehen.

## Fehlgeschlagen, wenn

Eine Partie bleibt hängen, ein Klick braucht länger als 1 Sekunde, eine Meldung „Abgelehnt“ oder eine verletzte Invariante erscheint, die Konsole meldet einen Fehler, oder die Seite steht waagrecht über.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build (`npm run build:testhooks`), ausgeliefert mit `vite preview`, Stand ab Commit `d750cda` |
| Ausgangslage prüfen | `/dev?seed=2&spieler=2&erweiterung=1` zeigt „Aktionen der Engine (…)“ |

## Testdaten

Playwright-Skript `e9_browser.mjs` (Teil „partien“), als Beleg des Laufs abgelegt. Es klickt „KI-Schritt“, wenn eine KI entscheidet; sonst mit 85 % eine angebotene Häutung, sonst einen zufälligen Knopf. Gemessen wird die Zeit vom Klick bis nach dem zweiten `requestAnimationFrame`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Konsole | Testhook-Build ausliefern | `npx vite preview --outDir dist-testhooks --port 4189 --strictPort` | Server lauscht auf 4189 |
| 2 | Konsole | Skript ausführen | `node e9_browser.mjs http://localhost:4189 <ordner> partien` | vier Zeilen „Partie Saat …“, jede mit „beendet true“ |
| 3 | `<ordner>/browser.txt` | Werte lesen | – | „Klick Median“ und „KI-Schritt Median“ unter 100 ms, „max“ unter 1'000 ms, „Abgelehnt-Meldungen 0“, „Treffer „verletzt“ 0“, „waagrechtes Überstehen max 0 px“, „Konsolenfehler keine“ |
| 4 | Konsole | Server beenden | – | Port 4189 frei |

## Nicht abgedeckte Grenzfälle

Ein künstlicher Tisch mit rund 18'000 Häutungen (Prüfskript, Teil M2) lief nur in der Engine, nicht am Entwicklertisch; in den Zufallspartien kamen höchstens 2'167 Knöpfe vor. Handy-Grössen sind für die Leistung nicht gemessen.
