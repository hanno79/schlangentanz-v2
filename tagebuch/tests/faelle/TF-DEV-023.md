---
id: TF-DEV-023
titel: Die Szenarien schlangengrube, abwehr-schlangengrube und doppelangriff laufen am Entwicklertisch mit Klicks so ab, wie ihre Beschreibung erwartet, auf dem Desktop und auf dem Handy hochkant.
art: manuell
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
aenderung: task/E4-abwehr-grube (PR #54)
---

## Worum es geht

Die drei Szenarien von E4 zeigen die Frage nach der Abwehr am Entwicklertisch. Ein Tester spielt sie mit Klicks durch und vergleicht die Knöpfe, die Ereignisse und die Lage mit dem Text „Erwartet“ des Szenarios. Dazu wehrt einmal der Mensch Spieler 1 selbst ab.

## Bestanden, wenn

- `schlangengrube`: Nach „SchlangengrubeSpielen … → KI-Gegner 1“ stehen KarteAngesagt und AbwehrGefragt da, „Entscheidet: KI-Gegner 1“ und genau ein Knopf „Reagieren: durchlassen“. Nach „KI-Schritt“: AnsageEntschieden „wirkt, niemand hat abgewehrt → vor KI-Gegner 1“. Nach einer Farbkarte und „ZugBeenden“: KartenGezogen (Spieler 1 zieht 2), Ausgesetzt (KI-Gegner 1, Grube auf den Ablagestapel von Spieler 1), ZugBegonnen (KI-Gegner 2); KI-Gegner 1 hält weiter 5 Karten.
- `abwehr-schlangengrube`: Nach der Ansage zwei Knöpfe „Reagieren: abwehren mit Farbenschutz (farbenschutz-02)“ und „Reagieren: durchlassen“. Nach dem Abwehren: Abgewehrt und AnsageEntschieden „ohne Wirkung … → Ablagestapel von Spieler 1“; Farbenschutz auf dem Ablagestapel von KI-Gegner 1, der 4 Karten hält. Nach Farbkarte und „ZugBeenden“ kein Ausgesetzt, KI-Gegner 1 zieht 1 Karte.
- `doppelangriff`: KI-Gegner 2 wehrt die erste Grube ab und hält 4 Karten; Spieler 1 zieht 2. Bei der zweiten Grube (von KI-Gegner 1) gibt es nur „Reagieren: durchlassen“; danach setzt KI-Gegner 2 aus und hält weiter 4 Karten. Spielt KI-Gegner 1 die Grube stattdessen auf Spieler 1, bekommt der Mensch zwei Abwehrknöpfe und behält nach der Abwehr einen Farbenschutz.
- In beiden Geräteklassen alle Invarianten erfüllt, kein Konsolenfehler, `scrollWidth` gleich `clientWidth`.

## Fehlgeschlagen, wenn

Ein Knopf fehlt oder zu viel da ist, ein Ereignis fehlt oder anders lautet, eine Karte auf dem falschen Stapel liegt, eine Invariante verletzt ist oder die Seite waagrecht scrollt.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build (`npm run build:testhooks`) von `3dbb35b`, `vite preview` auf Port 4196 |

## Testdaten

Adressen `/dev?szenario=schlangengrube`, `/dev?szenario=abwehr-schlangengrube`, `/dev?szenario=doppelangriff`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser, `/dev?szenario=schlangengrube` | Knopf „SchlangengrubeSpielen … → KI-Gegner 1“ klicken | | Ereignisse KarteAngesagt, AbwehrGefragt; nur „Reagieren: durchlassen“ |
| 2 | dieselbe Seite | „KI-Schritt“, dann erste Farbkarte, dann „ZugBeenden“ | | Werte wie unter „Bestanden, wenn“ |
| 3 | Browser, `/dev?szenario=abwehr-schlangengrube` | Grube auf KI-Gegner 1, dann „Reagieren: abwehren mit Farbenschutz“ | | Abgewehrt, AnsageEntschieden ohne Wirkung, Ablagestapel wie beschrieben |
| 4 | dieselbe Seite | Farbkarte, „ZugBeenden“ | | kein Ausgesetzt, KI-Gegner 1 zieht 1 |
| 5 | Browser, `/dev?szenario=doppelangriff` | Grube auf KI-Gegner 2, abwehren, Farbkarte, „ZugBeenden“, Grube von KI-Gegner 1 auf KI-Gegner 2, durchlassen, Farbkarte, „ZugBeenden“ | | Werte wie unter „Bestanden, wenn“ |
| 6 | dieselbe Seite | „Von vorn“, bis „ZugBeenden“ von Spieler 1 wie in Schritt 5, dann Grube von KI-Gegner 1 auf Spieler 1 und den ersten Abwehrknopf klicken | | drei Knöpfe für Spieler 1; danach ein Farbenschutz auf der Hand, einer auf seinem Ablagestapel |
| 7 | Playwright, Handy hochkant 390×844 mit Touch | Schritte 1 bis 5 mit `tap()` wiederholen | | dieselben Werte, `scrollWidth` 390 |

## Nicht abgedeckte Grenzfälle

Tablet und Handy quer sind nicht durchgespielt, weil E4 die Oberfläche des Entwicklertischs nicht verändert hat; das deckt `npm run test:layout` ab.
