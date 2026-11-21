---
id: TF-DEV-033
titel: Am Entwicklertisch bietet das Szenario „haeutung-nicht-moeglich“ keine Häutung an, nur das wirkungslose Ablegen, und danach liegen alle Schlangen unverändert.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
aenderung: task/E9-haeutung (PR #69)
---

## Worum es geht

Das Szenario stellt Beispiel 2 der Website nach (A7.9): Eine Schlangenblockade trennt Blau, Violett von Grün, Violett, und nirgends liegen drei Farbkarten verschiedener Farbe in Folge. Dazu hat KI-Gegner 1 Rot, Rot, Rot (lässt sich nach D26 nicht anders ordnen) und Gelb, Blau, Regenbogenschlange, Grün, Braun. Die Häutung hat damit kein Ziel und darf nur wirkungslos abgelegt werden (D13).

## Bestanden, wenn

Am Start steht „Aktionen der Engine (29)“ mit FarbkarteLegen (28) und SonderkarteWirkungslosAblegen (1), kein Knopf „SchlangenhaeutungSpielen“. Nach dem Klick auf „SonderkarteWirkungslosAblegen: Schlangenhäutung (schlangenhaeutung-03)“ meldet die Engine „KarteGespielt … → Ablagestapel von Spieler 1, Stelle 0“, alle drei Schlangen liegen wie vorher, angeboten sind FarbkarteLegen (28) und ZugBeenden (1). Keine Konsolenfehler, kein waagrechtes Scrollen bei 1280 und 390 px Breite.

## Fehlgeschlagen, wenn

Ein Knopf „SchlangenhaeutungSpielen“ erscheint, das wirkungslose Ablegen fehlt, eine Schlange sich nach dem Ablegen verändert, eine Konsolenmeldung auf Fehlerstufe erscheint oder die Seite waagrecht übersteht.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build (`npm run build:testhooks`), ausgeliefert mit `vite preview`, Stand ab Commit `d750cda` |
| Ausgangslage prüfen | Adresse `/dev?szenario=haeutung-nicht-moeglich` zeigt „Aktionen der Engine (29)“ |

## Testdaten

Szenario `haeutung-nicht-moeglich` aus `src/entwicklung/szenarienHaeutung.ts`, Saat 42.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser, Fenster 1280×900 | Adresse öffnen | `/dev?szenario=haeutung-nicht-moeglich` | FarbkarteLegen (28), SonderkarteWirkungslosAblegen (1), kein SchlangenhaeutungSpielen |
| 2 | Spieler, KI-Gegner 1 | Schlangen lesen | – | schlange-1: Wasserwirbel, Mondranke, Schlangenblockade, Waldspross, Mondranke; schlange-2: Feuerkeim ×3; schlange-3: Sonnenblatt, Wasserwirbel, Regenbogenschlange, Waldspross, Wurzelpfad |
| 3 | Aktionen der Engine | „SonderkarteWirkungslosAblegen: Schlangenhäutung (schlangenhaeutung-03)“ klicken | – | Ereignis KarteGespielt → Ablagestapel von Spieler 1, Stelle 0; Schlangen wie in Schritt 2; Aktionen FarbkarteLegen (28) und ZugBeenden (1) |
| 4 | Browser, Fenster 390×844 mit Touch | Schritte 1 bis 3 mit Antippen wiederholen | – | dieselben Ergebnisse, Knopf umbrochen und lesbar, kein waagrechtes Scrollen |

## Nicht abgedeckte Grenzfälle

Eine Schlange ganz ohne Farbkarten kommt nicht vor, weil eine Schlange immer mit einer Farbkarte beginnt (A5). Der Tisch ganz ohne Schlange ist in `A7.9_schlangenhaeutung.test.ts` („D13: ohne Schlange am Tisch …“) abgedeckt.
