---
id: TF-DEV-043
titel: Am Entwicklertisch lösen die sechs Szenarien aus X2 Paket A ihre Aufgabe mit echten Karten genau wie im Text „Erwartet“ ein, und eine Zufallspartie mit Erweiterung läuft bis zur Wertung.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-23
veraendert_daten: nein
aenderung: task/X2a-aufgaben-farbmengen (PR #107)
---

## Worum es geht

Die Szenarien `aufgabe-farbenpracht`, `aufgabe-farbharmonie`, `aufgabe-farbkombination`, `aufgabe-gelber-schatz`, `aufgabe-lila-riese` und `aufgabe-joker-zwei-farben` arbeiten ohne Testbedingung. Mit Klicks auf die Aktionsknöpfe soll man sehen, dass die Aufgabe nur mit der passenden Karte eingelöst wird, und dass eine ganze Partie mit Erweiterung ohne Fehler endet.

## Bestanden, wenn

Nach dem genannten Klick stehen unter „Ereignisse des letzten Schritts“ KarteGespielt, AufgabeErfuellt für Spieler 1 und AufgabeAufgedeckt mit der nächsten Aufgabe. Die Gegenklicks (Rot statt Grün, Regenbogenschlange an Stelle 0, Blau statt Violett) zeigen nur KarteGespielt. Alle Invarianten sind erfüllt, die Konsole ist leer, und die Seite scrollt nicht waagrecht. Die Partie aus Saat 11 mit drei Spielern endet mit „Partiephase Beendet“ und einer Wertung, deren Aufgabenpunkte zu den erfüllten Aufgaben passen.

## Fehlgeschlagen, wenn

Eine Aufgabe wird beim Gegenklick eingelöst, fehlt nach dem richtigen Klick, die nachgerückte Aufgabe stimmt nicht, oder die Partie bleibt hängen oder verletzt eine Invariante.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build (`npm run build:testhooks`, `vite preview --outDir dist-testhooks`), Stand ab Commit e0e8098 |

## Testdaten

Die sechs Szenarien, dazu `/dev?seed=11&spieler=3&erweiterung=1`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Adresse | öffnen | `/dev?szenario=aufgabe-farbenpracht` | offen Farbenpracht, Farbkombination, Lila Riese |
| 2 | Aktionen der Engine | „FarbkarteLegen: Feuerkeim (rot-03) → schlange-2 ende“ klicken | | nur KarteGespielt, Erfüllte Aufgaben: keine |
| 3 | Kopf | „Von vorn“, dann „FarbkarteLegen: Waldspross (gruen-02) → schlange-2 ende“ | | AufgabeErfuellt Farbenpracht, AufgabeAufgedeckt Gelber Schatz; Endwertung Aufg. 8 |
| 4 | Adresse | öffnen | `/dev?szenario=aufgabe-farbharmonie` | schlange-2 endet mit Violett, Violett |
| 5 | Aktionen der Engine | „RegenbogenschlangeLegen … → schlange-2 · Stelle 0“, dann „Von vorn“ und „… Stelle 8“ | | erst nur KarteGespielt, dann AufgabeErfuellt Farbharmonie, AufgabeAufgedeckt Gelber Schatz |
| 6 | Adresse | öffnen | `/dev?szenario=aufgabe-farbkombination` | KI-Gegner 1 hat vier rote Karten |
| 7 | Aktionen der Engine | „FarbkarteLegen: Wasserwirbel (blau-05) → schlange-1 ende“, dann „ZugBeenden“ | | AufgabeErfuellt Farbkombination für Spieler 1; KI-Gegner 1 am Zug, Erfüllte Aufgaben: keine |
| 8 | Adresse | öffnen | `/dev?szenario=aufgabe-gelber-schatz` | fünf gelbe, zwei violette Karten |
| 9 | Aktionen der Engine | „RegenbogenschlangeLegen … → schlange-1 · Stelle 5“ | | AufgabeErfuellt Gelber Schatz; Aufschlüsselung „Regenbogenschlange als Violett“, Aufgaben: Gelber Schatz 5, Summe 20 |
| 10 | Adresse | öffnen | `/dev?szenario=aufgabe-lila-riese` | vier violette Karten |
| 11 | Aktionen der Engine | „Wasserwirbel (blau-01) → schlange-1 anfang“, dann „Von vorn“ und „Mondranke (violett-05) → schlange-1 ende“ | | erst nur KarteGespielt, dann AufgabeErfuellt Lila Riese, AufgabeAufgedeckt Farbenpracht |
| 12 | Adresse | öffnen | `/dev?szenario=aufgabe-joker-zwei-farben` | fünf gelbe, vier violette Karten |
| 13 | Aktionen der Engine | „RegenbogenschlangeLegen … → schlange-1 · Stelle 5“ | | AufgabeErfuellt Gelber Schatz und Lila Riese in einem Schritt; offen Farbenpracht, Fusionsexperte, Farbharmonie |
| 14 | Adresse | öffnen | `/dev?seed=11&spieler=3&erweiterung=1` | Partie mit Erweiterung |
| 15 | Aktionen der Engine | als Spieler 1 je eine Aktion klicken, für die KI-Gegner „KI-Schritt (solide)“, bis die Partie endet | | Partiephase Beendet; Aufgabenpunkte in der Wertung gleich den erfüllten Aufgaben |

## Nicht abgedeckte Grenzfälle

Andere Geräteklassen als Desktop: Der Entwicklertisch ist ein Werkzeug für Prüfer, die Szenarien ändern keine Oberfläche des Spiels. Ein Szenario mit Farbenfusion als Joker zeigt der Entwicklertisch nicht; das belegen die Regeltests in TF-ENGINE-061.
