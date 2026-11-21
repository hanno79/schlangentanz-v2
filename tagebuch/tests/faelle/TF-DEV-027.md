---
id: TF-DEV-027
titel: Im Szenario farbendieb stiehlt Spieler 1 am Entwicklertisch das Gelb von KI-Gegner 1 und hat danach drei gelbe Karten in seiner Schlange.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
aenderung: task/E8-farbendieb (PR #67)
---

## Worum es geht

Das Beispiel der Website zum Farbendieb (A7.1) wird am Entwicklertisch mit echten Klicks nachgespielt. Spieler 1 nimmt KI-Gegner 1 eine Karte aus der Schlange und legt sie in seine eigene. Geprüft wird, was die Engine anbietet, wer gefragt wird, welche Ereignisse erscheinen und wie die Schlangen danach aussehen.

## Bestanden, wenn

Am Anfang stehen genau 6 Knöpfe „FarbendiebSpielen“ und keiner „SonderkarteWirkungslosAblegen“. Nach dem Diebstahl von gelb-01 an Stelle 2 hat nur KI-Gegner 1 den Knopf „Reagieren: durchlassen“. Danach meldet KartenVersetzt „gelb-01: schlange-2 von KI-Gegner 1 (spieler-2), Stelle 1 → schlange-1 von Spieler 1 (spieler-1), Stelle 2“, Spieler 1 hat Gelb, Gelb, Gelb mit 3 Punkten im Zwischenstand, KI-Gegner 1 nur noch Blau, der Farbendieb liegt auf dem Ablagestapel von Spieler 1. Alle Invarianten sind erfüllt, die Konsole zeigt keinen Fehler.

## Fehlgeschlagen, wenn

Eine andere Zahl von Farbendieb-Knöpfen erscheint, ein Knopf eine neue Schlange oder eine fremde Schlange als Ziel nennt, KartenVersetzt fehlt oder eine andere Stelle nennt, das Gelb an einer anderen Stelle liegt, der Zwischenstand nicht 3 zeigt oder eine Invariante verletzt ist.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build (`npm run build:testhooks`), ausgeliefert mit `vite preview --outDir dist-testhooks`, Stand ab Commit `bb19f19` |
| Ausgangslage prüfen | Die Seite zeigt die Überschrift „Szenario farbendieb“ und „Schritt 0“ |

## Testdaten

Szenario `farbendieb`: Spieler 1 hat die Schlange gelb-05, gelb-12 und den Farbendieb farbendieb-02 auf der Hand; KI-Gegner 1 hat die Schlange blau-04, gelb-01 und keinen Farbenschutz.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser, 1280×900 | Adresse öffnen | `http://localhost:<port>/dev?szenario=farbendieb` | „Aktionen der Engine (18)“, darunter „FarbendiebSpielen (6)“ und „FarbkarteLegen (12)“ |
| 2 | Abschnitt „FarbendiebSpielen“ | mit der Maus über jeden Knopf fahren und den Tooltip lesen | – | Quelle blau-04 oder gelb-01 aus schlange-2, Ziel schlange-1 an Stelle 0, 1 oder 2; kein „neueSchlange“ |
| 3 | Abschnitt „FarbendiebSpielen“ | den Knopf klicken, dessen Tooltip `"karteId":"gelb-01"` und `"position":2` enthält | – | Ereignisse KarteAngesagt (trifft KI-Gegner 1) und AbwehrGefragt; einziger Knopf „Reagieren: durchlassen“ mit spieler-2 |
| 4 | Abschnitt „Reagieren“ | „Reagieren: durchlassen“ klicken | – | Ereignisse KartenVersetzt und AnsageEntschieden wie unter „Bestanden, wenn“ |
| 5 | Abschnitt „Spieler“ und „Wertung“ | Schlangen, Ablagestapel und Zwischenstand ablesen | – | Spieler 1: Sonnenblatt gelb-05, gelb-12, gelb-01; Ablagestapel Farbendieb; Zwischenstand Spieler 1 = 3; KI-Gegner 1: nur Wasserwirbel blau-04 |
| 6 | Entwicklerwerkzeuge, Konsole | Fehler ablesen | – | keine Fehlermeldung |

## Nicht abgedeckte Grenzfälle

Die Stellen 0 und 1 und das Blau als Beute werden hier nicht geklickt; sie prüfen die Engine-Tests `farbendieb.test.ts` („an eine beliebige Position: an Stelle %i …“). Tablet und Handy quer sind nicht nachgespielt, weil E8 die Oberfläche des Entwicklertischs nicht ändert und `npm run test:layout` sie misst.
