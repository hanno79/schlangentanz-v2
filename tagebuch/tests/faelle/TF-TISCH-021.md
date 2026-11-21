---
id: TF-TISCH-021
titel: Lehnt die Engine eine Aktion ab, zeigt die Zugleiste ihren eigenen deutschen Grund, und gespielt ist nichts.
art: manuell
regression: nein
prioritaet: niedrig
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
aenderung: task/O5-karten-spielen (PR #73)
---

## Worum es geht

Die Oberfläche bietet nur an, was die Engine aufzählt; eine Ablehnung entsteht nur, wenn Aufzählen und Prüfen auseinanderlaufen. Im Browser lässt sich das nicht auslösen. Der Komponententest des Umsetzers gibt der Prüfung einen erfundenen Grund vor. Hier prüft die echte `pruefeAktion` eine falsche Aktion, damit sichtbar wird, dass der Satz der Engine selbst ankommt.

## Bestanden, wenn

Nach Rot, „Neue Schlange“ und „Ausführen“ steht in der Zugleiste als Meldung „Eine neue Schlange geht nicht: Jeder Spieler hat höchstens 2 Schlangen (A5).“, und der gespeicherte Spielstand ist derselbe wie beim Laden.

## Fehlgeschlagen, wenn

Keine Meldung erscheint, die Meldung ist nicht der Satz der Engine, oder die Karte ist gespielt.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Vitest mit jsdom, Stand ab Commit 27d85d3 |
| Ausgangslage prüfen | Szenario `farbkarte-beim-gegner`: du hast schon zwei Schlangen |

## Testdaten

Zu den Aktionen der Engine kommt eine falsche: FarbkarteLegen mit deiner Rot und dem Ziel „neue Schlange“.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Testdatei | `ermittleAktionen` um die falsche Aktion ergänzen, `/spiel` mit dem Szenario rendern | `farbkarte-beim-gegner` | „Neue Schlange“ wird nach Rot angeboten |
| 2 | Deine Hand | „Farbkarte Rot, 1 Punkt“ antippen | | Ziele markiert |
| 3 | Deine Schlangen | „Neue Schlange“ antippen, dann „Ausführen“ | | Meldung in der Zugleiste |
| 4 | Speicher | Spielstand lesen | | unverändert |

## Technische Prüfung

Vorübergehende Testdatei unter `src/ui/tisch/`, die `ermittleAktionen` so ersetzt, dass sie die echte Liste plus die falsche Aktion liefert; `pruefeAktion` bleibt echt. Dann wie in `Ablehnung.test.tsx`: `spieleAm(erzeugeSzenario('farbkarte-beim-gegner'))`, Rot antippen, „Neue Schlange“ antippen, „Ausführen“. Erwartet: `getByRole('alert')` enthält den Satz oben, `roh()` gleich `serialisiere(start)`. Die Datei wird danach gelöscht.

## Nicht abgedeckte Grenzfälle

Eine Ablehnung im echten Spiel: lässt sich nicht herbeiführen, solange Aufzählen und Prüfen übereinstimmen.
