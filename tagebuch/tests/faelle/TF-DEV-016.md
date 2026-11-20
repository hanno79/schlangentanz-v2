---
id: TF-DEV-016
titel: Am Entwicklertisch spielt ein Klick auf „KI-Schritt“ genau einen Schritt, und der Knopf ist gesperrt, solange ein Mensch entscheidet.
art: beides
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-20
veraendert_daten: nein
skript: src/entwicklung/Entwicklertisch.test.tsx
aenderung: task/K1-ki-schnittstelle
---

## Worum es geht

Mit dem Knopf „KI-Schritt“ lässt man am Entwicklertisch die Zufalls-KI für den Spieler wählen, der gerade entscheidet. Ein Klick darf genau eine Aktion ausführen, nie einen ganzen Zug auf einmal, und für den Menschen darf die KI nicht spielen.

## Bestanden, wenn

Bei Saat 1 mit zwei Spielern ist der Knopf zu Beginn gesperrt mit dem Hinweis „Spieler 1 entscheidet; das ist ein Mensch.“. Nach einer Karte und „ZugBeenden“ von Spieler 1 (Schritt 2) ist er frei mit „KI-Gegner 1 entscheidet; das ist eine KI.“. Der erste Klick führt zu Schritt 3 und dem Verlaufseintrag „KI-Schritt: FarbkarteLegen: Mondranke (violett-06) → neue Schlange“, der zweite zu Schritt 4 mit „KI-Schritt: ZugBeenden“. Danach ist der Knopf wieder gesperrt, ein Klick darauf ändert nichts. Zweimal „Schritt zurück“ und ein Klick ergeben wieder Schritt 3 mit violett-06. Keine Konsolenfehler, kein waagrechtes Scrollen.

## Fehlgeschlagen, wenn

Ein Klick mehr als einen Verlaufseintrag erzeugt, der Knopf frei ist, während der Mensch entscheidet, nach „Schritt zurück“ eine andere Aktion kommt oder eine Fehlermeldung erscheint.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build, `npm run preview:testhooks` auf Port 4174, Fenster 1280×900 |

## Testdaten

Adresse `/dev?seed=1&spieler=2`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | `/dev?seed=1&spieler=2` | Seite öffnen | | „Schritt 0“, Knopf „KI-Schritt“ grau, Hinweis „Spieler 1 entscheidet; das ist ein Mensch.“ |
| 2 | Aktionen der Engine | „FarbkarteLegen: Wasserwirbel (blau-12) → neue Schlange“ klicken, dann „ZugBeenden“ | | „Schritt 2“, Knopf frei, Hinweis „KI-Gegner 1 entscheidet; das ist eine KI.“ |
| 3 | Knopf „KI-Schritt“ | einmal klicken | | „Schritt 3“, Ereignis „KarteGespielt: KI-Gegner 1 (spieler-2), violett-06 (FarbkarteLegen) → schlange-2 …“, Hand von KI-Gegner 1 hat 4 Karten |
| 4 | Knopf „KI-Schritt“ | noch einmal klicken | | „Schritt 4“, Knopf grau, Hinweis „Spieler 1 entscheidet; das ist ein Mensch.“ |
| 5 | Knopf „KI-Schritt“ | auf den grauen Knopf klicken | | weiter „Schritt 4“, keine Fehlermeldung |
| 6 | Knopf „Schritt zurück“ | zweimal klicken, dann „KI-Schritt“ | | „Schritt 3“, letzter Verlaufseintrag „KI-Schritt: FarbkarteLegen: Mondranke (violett-06) → neue Schlange“ |

## Nicht abgedeckte Grenzfälle

Eine ganze Partie mit dem Knopf steht in TF-DEV-017, die angesagte Karte ohne Aktion in TF-DEV-018. Tablet-Klassen sind nicht eigens geprüft; der Entwicklertisch ist kein Oberflächen-Task, Desktop und Handy hochkant genügen nach Auftrag.
