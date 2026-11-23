---
id: TF-TISCH-037
titel: Greift dich ein KI-Gegner an, nennt die Abwehrfrage Angreifer, Karte und Ziel, deine Hand bleibt sichtbar, und nach „Abwehren“ hältst du eine Karte weniger, bis dein nächster Zug beginnt.
art: manuell
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-22
veraendert_daten: nein
aenderung: task/O6-gegnerzuege (PR #79)
---

## Worum es geht

Spielt ein Gegner eine Sonderkarte gegen dich, musst du entscheiden, ob du abwehrst (A6, A7.2, D33). Die Frage muss sagen, wer was wohin spielt, und deine Hand darf dabei nicht verdeckt sein. Wer abwehrt, zieht erst zu Beginn seines nächsten Zuges nach (A6, D18).

## Bestanden, wenn

In der Zugleiste steht „KI-Gegner 1 sagt an: Schlangengrube auf dich.“ mit den Knöpfen „Durchlassen“ und „Abwehren“, darüber gross die Schlangengrube. Unten steht „Deine Hand · 5 Karten“ mit allen fünf Karten im Bild, darunter ein Farbenschutz. Nach „Abwehren“ steht „Deine Hand · 4 Karten“ und im Protokoll „Du wehrst Schlangengrube mit Farbenschutz ab.“ und „Schlangengrube bleibt ohne Wirkung.“. Die Hand bleibt bei 4 Karten, solange KI-Gegner 1 spielt, und hat 5 Karten, sobald „Du ziehst 1 Karte.“ und „Du bist dran.“ im Protokoll stehen.

## Fehlgeschlagen, wenn

Die Frage nennt Angreifer, Karte oder Ziel nicht, die Hand ist verdeckt, „Abwehren“ fehlt trotz Farbenschutz, oder die Hand hat direkt nach dem Abwehren wieder 5 Karten.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build (`npm run build:testhooks`, `npm run preview:testhooks`), Stand ab Commit fde8e51 |
| Ausgangslage prüfen | Die Statuszeile sagt „KI-Gegner 1 spielt Schlangengrube / Du entscheidest, ob du abwehrst.“ |

## Testdaten

Szenario `angriff-auf-dich`: zwei Spieler, KI-Gegner 1 hat eine Schlangengrube auf dich angesagt, deine Hand hält einen Farbenschutz.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser | Adresse öffnen | `/spiel?szenario=angriff-auf-dich` | Abwehrfrage in der Zugleiste wie oben, Hand mit 5 Karten sichtbar |
| 2 | Zugleiste, Abwehrfrage | „Abwehren“ anklicken oder antippen | | „Deine Hand · 4 Karten“, „Deine Ablage 1“, Protokoll mit den zwei Sätzen |
| 3 | Tisch | etwa 1 s zusehen | | KI-Gegner 1 spielt eine Karte, die Hand bleibt bei 4 Karten |
| 4 | Tisch | warten, bis die Statuszeile „Du bist dran“ zeigt | | Protokoll „Du ziehst 1 Karte.“, Hand mit 5 Karten |

## Nicht abgedeckte Grenzfälle

Ohne Farbenschutz auf der Hand prüft TF-TISCH-040 mit. Neuladen während der Frage prüft TF-TISCH-042. Zwei Angriffe in einer Runde (A6, zweiter Angriff ohne nachgezogenen Farbenschutz) sind nicht eigens geprüft, weil kein Szenario dafür besteht; die Engine-Tests zu A6 decken die Regel ab.
