---
id: TF-TISCH-034
titel: In einer langen Schlange mit Farbenfusion, Blockade und Regenbogenschlange bietet die Häutung genau die Abschnittsenden der Engine an.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
aenderung: task/O7-haeutung-tisch (PR #78)
grenzfall_von: TF-TISCH-032
---

## Worum es geht

Sonderkarten unterbrechen einen Abschnitt (A7.9). In einer langen Schlange gibt es viele Abschnitte, die sich überlappen. Angeboten darf nur sein, was die Engine aufzählt, auch am Rand eines Laufs und vor einer Sonderkarte.

## Bestanden, wenn

In deiner Schlange mit 19 Karten sind genau die Karten 1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 14 und 16 als Enden angeboten (16 Abschnitte), nie die Fusion an Stelle 5, die Blockade an 13, die Regenbogenschlange an 17, Karte 15 oder die beiden Grün an 18 und 19. Nach jedem ersten Ende sind genau seine Partner aus den Aktionen der Engine angeboten. In der Schlange von KI-Gegner 1 mit 7 Farbkarten sind alle 7 Karten Enden (12 Abschnitte). Der Abschnitt 14 bis 16 (Gelb, Gelb, Blau), Blau nach vorn getauscht, spielt genau die aufgezählte Häutung.

## Fehlgeschlagen, wenn

Eine Sonderkarte oder eine Karte in der Mitte eines Laufs ist als Ende angeboten, ein Partner fehlt oder ist zu viel, oder der Stand nach „Ausführen“ weicht von der Engine ab.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build, alle fünf Geräteklassen, Stand ab Commit 49a394c |
| Ausgangslage prüfen | Spielstand mit dem Baukasten gebaut und unter `schlangentanz-v2:partie` gespeichert, dann `/spiel?tempo=sofort` |

## Testdaten

Baukasten, 2 Spieler, Erweiterung, Zufall 707. Deine Hand: Schlangenhäutung, Blau, Rot, Gelb, Grün. Deine Schlange: Rot, Blau, Gelb, Grün, Fusion (Rot+Rot), Violett, Braun, Rot, Blau, Gelb, Grün, Rot, Schlangenblockade, Gelb, Gelb, Blau, Regenbogenschlange, Grün, Grün. KI-Gegner 1: Grün, Grün, Blau, Rot, Gelb, Violett, Braun.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser | Spielstand laden | wie unter Testdaten | Tisch mit deiner langen Schlange, „Deine Schlangen 6 Punkte“ |
| 2 | Tisch | Häutung, „Deine Schlange 1 wählen“ | | angeboten Karte 1–4, 6–12, 14, 16 |
| 3 | Deine Schlange 1 | jedes angebotene Ende antippen, Partner ablesen, wieder lösen | | Partner wie in den Aktionen der Engine, zum Beispiel ab Karte 14 nur Karte 16 |
| 4 | Zugleiste | „Abbrechen“, dann dasselbe in „KI-Gegner 1, Schlange 1“ | | alle 7 Karten Enden |
| 5 | Deine Schlange 1 | Häutung, Schlange, Karte 14 und 16, dann 14 und 16 tauschen | | Ansage „Schlangenhäutung, Karte 14–16 deiner Schlange 1: Blau, Gelb, Gelb.“, Punkte vorher 6, nachher 6 |
| 6 | Zugleiste | „Ausführen“ | | Stand wie die Aktion der Engine |
