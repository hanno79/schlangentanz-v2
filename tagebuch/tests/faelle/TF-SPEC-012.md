---
id: TF-SPEC-012
titel: Die Sätze, die der Autor in A5, A6, A7.2 und A7.8 auf der Website geändert hat, stehen in Teil A Wort für Wort gleich.
art: manuell
regression: nein
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-20
veraendert_daten: nein
aenderung: task/P0.5d-teil-a-website (PR #50)
---

## Worum es geht

Teil A von `docs/GAME_SPEC.md` soll die Spielanleitung der Website wörtlich wiedergeben. Der Abgleich prüft das maschinell; dieser Testfall prüft dieselben Abschnitte von Hand im Browser, damit ein Fehler im Werkzeug nicht unbemerkt bleibt.

## Bestanden, wenn

Jeder der 17 Sätze unter „Testdaten“ steht auf `https://schlangentanz.ch/rules` (Seite oder Karten-Dialog) und im passenden Abschnitt von Teil A mit denselben Wörtern und Satzzeichen.

## Fehlgeschlagen, wenn

Ein Satz fehlt auf einer der beiden Seiten oder weicht in einem Wort oder Satzzeichen ab.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Website `https://schlangentanz.ch/rules` (Bundle `index-EH-TKokX.js`), Arbeitskopie des Branches mit `docs/GAME_SPEC.md` |

## Testdaten

A5: „Eine Farbkarte, um eine eigene Schlange zu beginnen oder eine beliebige Schlange fortzusetzen, auch die eines Mitspielers (muss an einem Ende der Schlange angelegt werden)“, „Optional eine Sonderkarte, um deren Effekt auszulösen (kann an beliebiger Stelle jeder Schlange eingefügt werden, auch bei einem Mitspieler)“, „Welche, ist dir überlassen: Eine Sonderkarte allein genügt, auch wenn du eine Farbkarte hättest.“, „Du darfst auch eine Sonderkarte spielen, die dir gerade nichts bringt.“, „Hat sie kein mögliches Ziel, legst du sie ohne Wirkung auf deinen Ablagestapel; sie zählt dann als die Sonderkarte deines Zuges.“

A6: „Das gilt für jede Sonderkarte, die ein Mitspieler gegen ihn oder in seine Schlange spielt.“, „Gegen Farbkarten gibt es keine Abwehr.“, „Eine andere Karte als Farbenschutz ist als Reaktion nicht erlaubt.“

A7.2 (Dialog „Farbenschutz“): „Wehrt eine Sonderkarte eines Mitspielers ab“, „Eine defensive Karte, die als Reaktion auf jede Sonderkarte gespielt werden kann, die ein Mitspieler gegen dich oder in deine Schlange spielt.“, „Wirkt gegen jede Sonderkarte, die ein Mitspieler gegen dich oder in deine Schlange spielt, auch gegen Farbenfusion, Schlangenhäutung und Regenbogenschlange“, „Gegen Farbkarten gibt es keine Abwehr“

A7.8 (Dialog „Verdoppler“): „Du spielst ihn zusammen mit höchstens einer Farbkarte, die Reihenfolge ist frei.“, „Er läuft wie ein normaler Zug ab: mindestens eine Karte, höchstens eine Farbkarte und eine Sonderkarte.“, „Spiele den Verdoppler als Sonderkarte deines Zuges, mit höchstens einer Farbkarte davor oder danach“, „Spiele sofort einen zweiten Zug, der wie ein normaler Zug abläuft“, „Im zweiten Zug darfst du keinen weiteren Verdoppler spielen“

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser, `https://schlangentanz.ch/rules` | Seite öffnen und warten, bis der Text erscheint; bleibt sie weiss, einmal neu laden | | Abschnitt „Spielablauf“ ist sichtbar |
| 2 | Abschnitt „Spielablauf“, Punkt „Karten ausspielen“ und Absatz „Wichtig:“ | Die fünf Sätze zu A5 lesen | | alle fünf stehen dort, wörtlich wie unter „Testdaten“ |
| 3 | Abschnitt „Grundregeln für Sonderkarten“ | Den zweiten Punkt lesen | | die drei Sätze zu A6 stehen dort |
| 4 | Karte „Farbenschutz“, Knopf „Details zu Farbenschutz anzeigen“ | Dialog öffnen, Text und „Wichtige Regeln“ lesen | | die Kurzbeschreibung steht auf der Kachel, die drei übrigen Sätze zu A7.2 im Dialog |
| 5 | Karte „Verdoppler“, Knopf „Details zu Verdoppler anzeigen“ | Dialog öffnen, Text und „Wichtige Regeln“ lesen | | die fünf Sätze zu A7.8 stehen im Dialog, der letzte als letzter Punkt der „Wichtigen Regeln“ |
| 6 | Editor, `docs/GAME_SPEC.md` | Jeden der 17 Sätze suchen | | jeder steht in Teil A im genannten Abschnitt, Wort für Wort gleich |

## Nicht abgedeckte Grenzfälle

Abschnitte ausserhalb von A5, A6, A7.2 und A7.8 prüft hier niemand von Hand; das deckt der maschinelle Abgleich ab (TF-SPEC-005). Andere Sprachfassungen der Website gibt es nicht.
