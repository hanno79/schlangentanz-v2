---
id: TF-TISCH-019
titel: Eine Partie unter /spiel lässt sich mit echten Klicks und Taps spielen, bis sie endet oder die Abwehrfrage an dich wartet, ohne Konsolenfehler und ohne waagrechtes Scrollen.
art: manuell
regression: ja
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: ja
aenderung: task/O5-karten-spielen (PR #73)
---

## Worum es geht

Die Szenarien prüfen einzelne Karten. In einer echten Partie wechseln sich deine Züge und die der KI ab, und die Hand ändert sich nach jedem Zug. Hier wird gespielt, wie ein Mensch spielt: Karte antippen, Ziel antippen, „Ausführen“, irgendwann „Zug beenden“. Bis O6 die Abwehr bringt, endet das spätestens bei der ersten Sonderkarte, die eine KI gegen dich spielt.

## Bestanden, wenn

In jeder Partie führt jede angetippte spielbare Karte über markierte Ziele zu einer Ansage und „Ausführen“, keine Aktion wird abgelehnt, „Zug beenden“ beendet den Zug, und die Partie läuft, bis sie endet oder die Statuszeile „Du entscheidest, ob du abwehrst.“ zeigt. Die Konsole meldet weder Fehler noch Warnungen, und `scrollWidth` ist bei jedem Schritt gleich `clientWidth`.

## Fehlgeschlagen, wenn

Eine Karte bleibt ohne Ziel und ohne „Ausführen“, die Engine lehnt eine Aktion ab, die Partie hängt, obwohl du dran bist und weder Karte noch „Zug beenden“ bedienbar ist, oder die Konsole meldet einen Fehler.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build, Chromium: eingebauter Browser der Desktop-App (Klicks) und Playwright mit den fünf Geräteklassen (Klicks und Taps), Stand ab Commit 27d85d3 |
| Ausgangslage prüfen | Leerer Local Storage |

## Testdaten

Saaten und Spielerzahlen: 4711 und 99 mit 2 Spielern (Desktop, Handy hochkant), 7, 2024 und 31 mit 4 Spielern (Tablet quer, Handy quer, Tablet hochkant). Karten und Ziele zufällig aus den angebotenen, mit fester Saat des Prüfskripts.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser | Partie öffnen | `/spiel?seed=<saat>&spieler=<n>&tempo=sofort` | „Du bist dran“ |
| 2 | Deine Hand | eine spielbare Karte antippen | | Ziele markiert oder Möglichkeiten in der Zugleiste |
| 3 | Tisch, Zugleiste | markierte Ziele antippen, bis die Ansage steht, dann „Ausführen“ | | Tisch zeigt das Ergebnis |
| 4 | Zugleiste | „Zug beenden“ antippen, sobald es frei ist und du nicht weiterspielen willst | | KI spielt, danach bist du wieder dran |
| 5 | Browser | Schritte 2 bis 4 wiederholen, bis die Partie endet oder die Abwehrfrage kommt | | keine Ablehnung, keine Konsolenmeldung |

## Zurücksetzen

Browserkontext schliessen.

## Nicht abgedeckte Grenzfälle

Partieende und Wertung: O8. Abwehr: O6. Schlangenhäutung mit Ziel: O7; hält der Mensch nur noch Häutungen mit Ziel, ist bis dahin nichts bedienbar.
