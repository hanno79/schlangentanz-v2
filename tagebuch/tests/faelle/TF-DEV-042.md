---
id: TF-DEV-042
titel: Unter /spiel gilt keine Testbedingung der Aufgaben-Szenarien, und im Produktionsbuild ist kein Szenario erreichbar.
art: manuell
regression: nein
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-23
veraendert_daten: nein
aenderung: task/X1-aufgaben-rahmen (PR #100)
grenzfall_von: TF-DEV-041
---

## Worum es geht

Die Testbedingungen der Aufgaben-Szenarien sind nur zum Prüfen da. Lädt man dasselbe Szenario unter `/spiel`, müssen die echten Aufgaben gelten, die heute noch nie erfüllt sind. Im Produktionsbuild darf weder `/dev` noch ein Szenario erreichbar sein.

## Bestanden, wenn

Unter `/spiel` des Testhook-Builds hat Spieler 1 nach dem Anlegen der dritten und nach dem Zug des KI-Gegners der vierten Karte keine erfüllte Aufgabe, die offenen Aufgaben bleiben Farbkombination, Fusionsexperte und Lila Riese, der Aufgabenstapel hat 10 Karten. Im Produktionsbuild zeigt `/dev` „Diese Seite gibt es nicht“ und `/spiel?szenario=…` „Es läuft keine Partie“.

## Fehlgeschlagen, wenn

Unter `/spiel` wird eine Aufgabe eingelöst oder eine geheime Aufgabe als erfüllt gespeichert, oder im Produktionsbuild lädt ein Szenario.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build unter http://localhost:4174 und Produktionsbuild unter http://localhost:4173, Stand ab Commit 0f83bf6 |

## Testdaten

Szenario `aufgaben-einloesen`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Adresse (Testhook-Build) | öffnen | `http://localhost:4174/spiel?szenario=aufgaben-einloesen` | Spieltisch, „Deine Schlangen“ zeigt zwei blaue Karten, drei offene Aufgaben |
| 2 | Deine Hand | blaue Karte antippen, dann das Plus rechts an der Schlange, dann „Ausführen“ | | Schlange mit drei blauen Karten; in den Entwicklerwerkzeugen zeigt `localStorage` unter `schlangentanz-v2:partie` keine erfüllte Aufgabe |
| 3 | Spieltisch | „Zug beenden“ klicken, KI-Gegner spielen lassen | | wieder „Du bist dran“, weiterhin keine erfüllte Aufgabe, offene Aufgaben unverändert, Aufgabenstapel 10 |
| 4 | Adresse (Produktionsbuild) | öffnen | `http://localhost:4173/dev?szenario=aufgaben-einloesen` | „Diese Seite gibt es nicht“ |
| 5 | Adresse (Produktionsbuild) | öffnen | `http://localhost:4173/spiel?szenario=aufgaben-einloesen` | „Es läuft keine Partie. Starte in der Lobby eine neue.“ |
