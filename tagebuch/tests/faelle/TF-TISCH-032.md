---
id: TF-TISCH-032
titel: Die Schlangenhäutung lässt sich am Tisch in zwei Stufen spielen, mit genau den Abschnitten der Engine, und „Ausführen“ bleibt gesperrt, solange die Farbfolge gleich ist.
art: beides
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
skript: src/ui/tisch/Haeutung.test.tsx
aenderung: task/O7-haeutung-tisch (PR #78)
---

## Worum es geht

Die Engine zählt bei der Häutung jede neue Farbfolge eines Abschnitts als eigene Aktion auf. Am Tisch wählt man deshalb zuerst Schlange und Abschnitt und ordnet dann die Karten selbst, durch Antippen oder mit den Pfeiltasten. Gespielt werden darf nur, was die Engine erlaubt, und nur mit neuer Farbfolge (D26).

## Bestanden, wenn

Nach „Deine Schlange 1 wählen“ sind die Karten 1 bis 5 angeboten. Nach Karte 1 nur noch 3, 4 und 5, nach Karte 3 nur noch 1 und 5, genau wie die Abschnitte der Engine. Beim Ordnen ist „Ausführen“ gesperrt, und der Knopf verweist auf den Satz „Tippe zwei Karten an, um sie zu tauschen. Die Farbfolge ist noch dieselbe (D26).“, auch nachdem die beiden roten Karten getauscht sind. Nach den Tauschen 1 mit 3 und 2 mit 5 zeigt die Schlange Gelb, Gelb, Blau, Rot, Rot, die Ansage lautet „Schlangenhäutung, Karte 1–5 deiner Schlange 1: Gelb, Gelb, Blau, Rot, Rot.“, und „Ausführen“ spielt genau diese Aktion der Engine. „Abbrechen“ zeigt wieder Blau, Rot, Gelb, Rot, Gelb, ohne dass etwas gespielt ist. Keine Konsolenfehler, kein waagrechtes Scrollen, jedes Ziel mindestens 44 px und frei.

## Fehlgeschlagen, wenn

Eine Karte ist als Ende angeboten, die die Engine nicht nennt, „Ausführen“ geht bei unveränderter Farbfolge, der Grund fehlt oder ist nicht verknüpft, der gespeicherte Stand nach „Ausführen“ weicht vom Stand der Engine ab, oder nach „Abbrechen“ liegt die Schlange anders als vorher.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build (`npm run build:testhooks`), alle fünf Geräteklassen, Touch auf Tablet und Handy, Stand ab Commit 49a394c |

## Testdaten

Szenario `haeutung`: deine Schlange Blau, Rot, Gelb, Rot, Gelb; Schlange von KI-Gegner 1 Braun, Violett, Braun; Häutung auf deiner Hand.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser | Adresse öffnen | `/spiel?szenario=haeutung&tempo=sofort` | „Du bist dran“, deine Schlange Blau, Rot, Gelb, Rot, Gelb |
| 2 | Deine Hand | Schlangenhäutung antippen | | Zugleiste „Wähle die Schlange.“ |
| 3 | Deine Schlangen | „Deine Schlange 1 wählen“ antippen | | Alle fünf Karten gestrichelt angeboten, Satz „Wähle den Abschnitt: …“ |
| 4 | Deine Schlange 1 | Karte 1 antippen | | Karte 1 gedrückt, angeboten nur Karte 3, 4 und 5 |
| 5 | Deine Schlange 1 | Karte 1 noch einmal antippen, dann Karte 3 | | Erst wieder alle fünf, danach nur Karte 1 und 5 angeboten |
| 6 | Deine Schlange 1 | Karte 3 lösen, Karte 1 und Karte 5 antippen | | „Ausführen“ gesperrt, Satz endet mit „Die Farbfolge ist noch dieselbe (D26).“ |
| 7 | Deine Schlange 1 | Karte 2 und Karte 4 antippen | | Beide Rot getauscht, „Ausführen“ bleibt gesperrt |
| 8 | Deine Schlange 1 | Karte 1 und 3, dann Karte 2 und 5 antippen | | Schlange Gelb, Gelb, Blau, Rot, Rot; Ansage wie oben; „Ausführen“ frei |
| 9 | Zugleiste | „Abbrechen“ antippen | | Schlange wieder Blau, Rot, Gelb, Rot, Gelb, keine Ziele |
| 10 | Desktop | Schritte 2 bis 3 wiederholen, Karte 1 und 3 als Enden, Karte 1 fokussieren, zweimal Pfeil rechts | | Folge Rot, Gelb, Blau; Fokus auf Blau an Stelle 3; Ansage „Karte 1–3 … Rot, Gelb, Blau.“ |
| 11 | Zugleiste | „Ausführen“ | | Schlange bleibt in der neuen Folge, Häutung auf deiner Ablage |

## Technische Prüfung

Der gespeicherte Stand unter `schlangentanz-v2:partie` nach Schritt 11 gleicht `serialisiere(anwendeAktion(start, aktion))` für die aufgezählte Aktion mit dieser Farbfolge.

## Nicht abgedeckte Grenzfälle

Abwehr einer Häutung in deiner Schlange durch dich: baut O6. Mehr als eine Häutung auf der Hand: nicht geprüft, weil jede Häutung über dieselbe Auswahl läuft. Lange Schlange mit Sonderkarten: TF-TISCH-034. Drehen, Escape, Neuladen: TF-TISCH-035. Häutung ohne Ziel: TF-TISCH-036.
