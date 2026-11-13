---
id: TF-DEV-005
titel: Ungültige Adressen unter /dev zeigen eine rote Meldung mit Grund statt einer anderen Partie.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
aenderung: task/P0.4-entwicklertisch (PR #27)
grenzfall_von: TF-DEV-001
---

## Worum es geht

Wird eine falsche Saat still ersetzt, glaubt ein Prüfer, er sehe die verlangte Partie. Geprüft werden Werte genau auf und neben den Grenzen.

## Bestanden, wenn

`seed=0` und `seed=4294967295` (mit 2 bzw. 3 Spielern) zeigen eine Partie. Jede der folgenden Adressen zeigt eine rote Meldung mit Grund und keine Partie: `seed=4294967296`, `seed=-1`, `seed=abc`, `seed=1.5`, `spieler=1`, `spieler=5`, `spieler=2.0`, fehlendes `spieler`, fehlendes `seed`, `erweiterung=2`, `szenario=gibtsnicht`, `szenario=`, `szenario=spielende&seed=1`, Pfad `/dev/xyz`. `/devx` zeigt den Platzhalter.

## Fehlgeschlagen, wenn

Eine der ungültigen Adressen zeigt eine Partie, eine leere Seite oder einen Konsolenfehler.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build auf Port 4174 |

## Testdaten

Die Parameter unter „Bestanden, wenn“, jeweils an `http://localhost:4174/dev?` angehängt.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser | Adresse öffnen | `/dev?seed=0&spieler=2` | „Partie aus Saat 0, 2 Spieler“ |
| 2 | Browser | Adresse öffnen | `/dev?seed=4294967296&spieler=2` | rot: „Parameter seed muss eine ganze Zahl von 0 bis 4294967295 sein, erhalten: „4294967296““ |
| 3 | Browser | Adresse öffnen | `/dev?seed=1&spieler=5` | rot: „Parameter spieler muss eine Zahl von 2 bis 4 sein …“ |
| 4 | Browser | Adresse öffnen | `/dev?szenario=gibtsnicht` | rot: „Unbekanntes Szenario „gibtsnicht“ …“ |
| 5 | Browser | übrige Adressen der Liste öffnen | | jeweils rote Meldung |
