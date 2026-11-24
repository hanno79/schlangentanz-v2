---
id: TF-DEV-057
titel: Eine Partie mit Erweiterung, in der der Schlangenkorb gespielt wird, läuft bis zum Ende, und unter /spiel bricht nichts ab, wenn die KI ihn spielt.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-24
veraendert_daten: nein
aenderung: task/X6-schlangenkorb (PR #116)
---

## Worum es geht

Am Entwicklertisch spielt Spieler 1 den Korb in einer Zufallspartie; die Partie muss ohne verletzte Invariante enden. Unter `/spiel` hält die KI den Korb; spielt sie ihn, muss der Tisch weiterlaufen und das Protokoll den Zug nennen.

## Bestanden, wenn

Die Partie mit Saat 22 endet mit „Partiephase Beendet“, nach jedem Schritt sind alle Invarianten erfüllt, der Korb steht unter „Aus dem Spiel“. Unter `/spiel?seed=13…` steht im Protokoll „KI-Gegner 1 spielt: Schlangenkorb des Glücks: 3 Karten ziehen und bis zu 2 davon ausspielen.“, danach ist der Mensch wieder dran, die Konsole ist leer.

## Fehlgeschlagen, wenn

Die Partie bleibt stehen, eine Invariante ist verletzt, `/spiel` zeigt einen Fehler oder die Konsole meldet einen.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build von 14eaa6cb auf Port 4191 |

## Testdaten

`/dev`, Saat 22, 2 Spieler, Erweiterung 1 (Spieler 1 hält den Korb); `/spiel?seed=13&spieler=2&erweiterung=1&tempo=sofort` (KI-Gegner 1 hält den Korb).

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | `/dev` | Saat, Spieler, Erweiterung setzen, „Partie starten“ | 22, 2, 1 | Korb unter den Handkarten von Spieler 1 |
| 2 | Aktionen der Engine | „→ ziehen“, Braun neue Schlange, Braun und Grün anlegen, ZugBeenden | | Hand danach 5 |
| 3 | Seite | weiterspielen bis Spielende: KI mit „KI-Schritt (solide)“, Spieler 1 eine angebotene Aktion | | nach jedem Schritt Invarianten erfüllt; Ende „Beendet“ |
| 4 | `/spiel?seed=13&spieler=2&erweiterung=1&tempo=sofort` | eine Farbkarte als neue Schlange legen, „Ausführen“, „Zug beenden“, „Durchlassen“ | | Protokoll nennt den Korb der KI, keine Konsolenfehler |

## Nicht abgedeckte Grenzfälle

Hält der Mensch unter `/spiel` nur den Korb, bietet der Tisch keine Aktion an (Prüfprotokoll X6, Hinweis 1); das gehört zu O10.
