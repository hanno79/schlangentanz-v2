---
id: TF-TISCH-053
titel: Hältst du nur den Schlangenkorb, spielst du ihn und kannst danach den Zug beenden; Tausch und Entfernen des Korbs sind bedienbar, auch die Abwehr gegen einen Korb der KI.
art: manuell
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-27
veraendert_daten: ja
aenderung: task/O10-erweiterung-tisch (PR #124)
---

## Worum es geht

Aus der Prüfung von X6: Mit nur dem Korb auf der Hand durfte die Partie nicht stehen. Geprüft werden der Korb allein, der Tausch mit zwei Karten, das Entfernen einer gegnerischen Sonderkarte und die Abwehrfrage, wenn eine KI den Korb gegen deine Schlange spielt.

## Bestanden, wenn

In `korb-allein` ist der Korb antippbar, die Zugleiste nennt „Ziehe 3 Karten, spiele 2“ und „Zwei zusätzliche Aktionen“; nach „Zwei zusätzliche Aktionen“ und „Ausführen“ ist die Hand leer und „Zug beenden“ bedienbar. In `korb-tauschen` ergibt Rot→Gelb und Blau→Grün die Ansage „Grün statt Blau … und Gelb statt Rot …“, danach Schlange Grün, Gelb, Blau und Hand Rot, Blau. In `korb-entfernen` wehrt KI-Gegner 1 ab oder lässt durch, und das Protokoll sagt es. Spielt die KI den Korb gegen deine Regenbogenschlange, fragt die Zugleiste „Durchlassen“ oder „Abwehren“.

## Fehlgeschlagen, wenn

Der Korb ist gesperrt, ein Bonus fehlt, „Zug beenden“ bleibt gesperrt, oder die Abwehrfrage erscheint nicht.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build, Stand ab Commit 4ad16f8 |

## Testdaten

Szenarien `korb-allein`, `korb-tauschen`, `korb-entfernen`; für die Abwehr der Stand von `korb-entfernen` mit getauschter Steuerung (Spieler 1 als KI, KI-Gegner 1 als Mensch) im Spielstand des Browsers.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Adresse | öffnen | `/spiel?szenario=korb-allein&tempo=sofort` | Hand · 1 Karte, „Zug beenden“ gesperrt |
| 2 | Hand, Zugleiste | Korb, „Zwei zusätzliche Aktionen“, „Ausführen“ | | Hand leer, „Zug beenden“ bedienbar |
| 3 | Adresse | öffnen | `/spiel?szenario=korb-tauschen&tempo=sofort` | |
| 4 | Hand, Schlange | Korb, „Tausche bis zu 2 Karten“, Rot in der Schlange, Gelb in der Hand, Blau in der Schlange, Grün in der Hand, „Ausführen“ | | Ansage und Ergebnis wie oben |
| 5 | Adresse | öffnen | `/spiel?szenario=korb-entfernen&tempo=sofort` | |
| 6 | Hand, Gegner | Korb, „Entferne eine Sonderkarte“, Farbenfusion von KI-Gegner 1, „Ausführen“ | | Protokoll nennt Abwehr oder Durchlassen |
| 7 | Browser | Spielstand mit getauschter Steuerung laden, `/spiel` | | Statuszeile „KI-Gegner 1 spielt Schlangenkorb des Glücks · Du entscheidest, ob du abwehrst.“ |

## Zurücksetzen

Jedes Szenario setzt den Stand neu.

## Nicht abgedeckte Grenzfälle

„Ziehe 3“ bei weniger als drei Karten im Stapel ist nicht im Browser geprüft (Szenario `korb-letzte-karten`). Ein Korb im zweiten Zug nach einem Verdoppler (`korb-zweiter-zug`) ist nicht im Browser geprüft.
