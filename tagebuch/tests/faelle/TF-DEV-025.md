---
id: TF-DEV-025
titel: Der Entwicklertisch beschreibt die Orte der Ereignisse mit Stelle im Ablagestapel lesbar und plausibel, in den Szenarien verdoppler und schlangengrube und in einer Zufallspartie.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
aenderung: task/E4b-versetzt (PR #63)
---

## Worum es geht

Seit E4b nennt jeder Ort im Ablagestapel eine Stelle, und der Entwicklertisch kennt neue Orte (unter einer Fusion, Hand, Nachziehstapel) und das Ereignis KartenVersetzt. Der Text der Ereignisse muss lesbar bleiben, und die Stelle muss zur Zahl der Karten auf dem Stapel passen.

## Bestanden, wenn

- `verdoppler`: Nach „VerdopplerSpielen (verdoppler-03)“ steht „KarteGespielt: Spieler 1 (spieler-1), verdoppler-03 (VerdopplerSpielen) → Ablagestapel von Spieler 1 (spieler-1), Stelle 0“, darunter „Ablagestapel: 1 Karten“. Nach Rot, „ZugBeenden“ und dem wirkungslosen Ablegen von verdoppler-02 steht „… verdoppler-02 (SonderkarteWirkungslosAblegen) → Ablagestapel von Spieler 1 (spieler-1), Stelle 1“.
- `schlangengrube`: Nach „SchlangengrubeSpielen → KI-Gegner 1“ und „Reagieren“ steht „AnsageEntschieden: schlangengrube-03 von Spieler 1 (spieler-1) wirkt, niemand hat abgewehrt → vor KI-Gegner 1 (spieler-2)“; nach Farbkarte und „ZugBeenden“ KartenGezogen, Ausgesetzt und ZugBegonnen.
- `start-erweiterung`: 16 Schritte lang zeigt jedes KarteGespielt einen Ort mit Schlange und Stelle oder Ablagestapel und Stelle, die Stelle beginnt bei 0.
- Alle Invarianten erfüllt, kein Konsolenfehler, `scrollWidth` gleich `clientWidth` bei 1280×900.

## Fehlgeschlagen, wenn

Ein Ort fehlt, „undefined“ zeigt, eine Stelle nicht zur Zahl der Karten passt, ein Konsolenfehler auftritt oder die Seite waagrecht scrollt.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build (`npm run build:testhooks`), `vite preview --outDir dist-testhooks` auf einem freien Port, Fenster 1280×900 |

## Testdaten

Szenarien `verdoppler`, `schlangengrube` und `start-erweiterung` aus `/dev/szenarien`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser, `/dev?szenario=verdoppler` | Knopf „VerdopplerSpielen: Verdoppler (verdoppler-03)“ klicken | | unter „Ereignisse des letzten Schritts“ KarteGespielt mit „Ablagestapel von Spieler 1 (spieler-1), Stelle 0“ |
| 2 | Aktionen der Engine | „FarbkarteLegen: Feuerkeim (rot-05) → neue Schlange“, dann „ZugBeenden“ klicken | | ZugBegonnen Spieler 1, Teilzug 2 |
| 3 | Aktionen der Engine | „SonderkarteWirkungslosAblegen“ mit verdoppler-02 klicken | | KarteGespielt mit „Ablagestapel von Spieler 1 (spieler-1), Stelle 1“ |
| 4 | Browser, `/dev?szenario=schlangengrube` | „SchlangengrubeSpielen“ auf KI-Gegner 1 klicken, dann „Reagieren“ | | AnsageEntschieden „wirkt, niemand hat abgewehrt → vor KI-Gegner 1 (spieler-2)“ |
| 5 | Aktionen der Engine | eine Farbkarte, dann „ZugBeenden“ klicken | | KartenGezogen (Spieler 1 zieht 2), Ausgesetzt (KI-Gegner 1, Grube auf den Ablagestapel von Spieler 1), ZugBegonnen (KI-Gegner 2) |
| 6 | Browser, `/dev?szenario=start-erweiterung` | 16 Schritte: „KI-Schritt“, wenn er geht, sonst eine angebotene Aktion von Spieler 1 | | jedes Ereignis mit lesbarem Ort, Stellen ab 0 |
| 7 | Entwicklerwerkzeuge | Konsole und `scrollWidth`/`clientWidth` lesen | | keine Fehler, beide 1280 |

## Nicht abgedeckte Grenzfälle

Den Text von KartenVersetzt und die Orte „unter Fusion“, „Hand“ und „Nachziehstapel“ kann erst eine echte Karte aus E5 bis E9 auslösen; bis dahin sichert sie nur `typecheck`. Andere Geräteklassen sind nicht geprüft, weil E4b die Oberfläche ausser dem Entwicklertisch nicht ändert.
