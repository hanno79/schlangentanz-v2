---
id: TF-DEV-044
titel: In einer Zufallspartie mit Erweiterung am Entwicklertisch werden Aufgaben aus Paket B eingelöst, und die Partie endet ohne verletzte Invariante und ohne Konsolenfehler.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-23
veraendert_daten: nein
aenderung: task/X2b-aufgaben-muster (PR #106)
---

## Worum es geht

Vor Paket B waren diese fünf Aufgaben Platzhalter und wurden in echten Partien nie eingelöst. Geprüft wird, ob sie in einer echten Partie eingelöst werden. Dazu wird eine Partie aus einer Saat am Entwicklertisch bis zum Ende geklickt. Die KI-Gegner ziehen mit „KI-Schritt (solide)“, für Spieler 1 wird ein beliebiger Aktionsknopf geklickt.

## Bestanden, wenn

Die Partie endet mit Partiephase „Beendet“, unter „Invarianten“ steht nach jedem Schritt „alle erfüllt“, die Konsole bleibt ohne Fehler, und die Seite ist bei 1280 px nicht breiter als das Fenster. Bei Saat 4714 mit 2 Spielern löst KI-Gegner 1 in Schritt 46 Vielfaltskönig und in Schritt 87 Schlangenbändiger ein. Die Endwertung zeigt bei ihm Aufg. 16, Gruppen 74, Vielfalt 4, Kette 5, Summe 99.

## Fehlgeschlagen, wenn

Eine Invariante verletzt ist, die Partie nicht endet, eine Aufgabe eingelöst wird, die in der Schlange nicht erfüllt ist, oder die Endwertung Aufgabenpunkte zeigt, die nicht zu „Erfüllte Aufgaben“ passen.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build (`npm run build:testhooks`, dann `vite preview --outDir dist-testhooks`), Stand ab Commit e028a82c |

## Testdaten

Saaten 4711 bis 4718, 2 Spieler (4712 mit 3, 4713 mit 4). Spieler 1 klickt mit einem Zufallszähler, der mit der Saat beginnt, zu 85 % eine Aktion ausser „ZugBeenden“. Das Playwright-Skript `zufallspartie.mjs` liegt dem Lauf als Beleg bei.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Adresse | öffnen | `/dev?seed=4714&spieler=2&erweiterung=1` | Titel „Partie aus Saat 4714, 2 Spieler, mit Erweiterung“ |
| 2 | oben | entscheidet eine KI: „KI-Schritt (solide)“ klicken, sonst einen Knopf unter „Aktionen der Engine“ | | „Invarianten (alle erfüllt)“ nach jedem Klick |
| 3 | Ereignisse des letzten Schritts | Schritt 2 wiederholen bis Partiephase „Beendet“ | | in Schritt 46 „AufgabeErfuellt: KI-Gegner 1 (spieler-2) nimmt Vielfaltskönig (aufgabe-05)“ |
| 4 | Wertung | Endwertung lesen | | KI-Gegner 1: Gruppen 74, Vielfalt 4, Kette 5, Aufg. 16, Summe 99; Aufschlüsselung „Aufgaben: Vielfaltskönig 9, Schlangenbändiger 7“ |

## Nicht abgedeckte Grenzfälle

Spieler 1 klickt zufällig und löst deshalb selten etwas ein. Farbvielfalt und Symmetriemeister kamen in diesen acht Partien nicht als eingelöste offene Aufgabe vor, Farbvielfalt nur als geheime. Dass alle fünf in Partien vorkommen, belegen die 300 Zufallspartien in TF-ENGINE-062.
