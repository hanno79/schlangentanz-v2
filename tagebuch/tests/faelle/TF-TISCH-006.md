---
id: TF-TISCH-006
titel: Neu laden mitten in der Partie oder während einer Abwehrfrage an dich setzt die Partie genau dort fort, und solange du entscheidest, spielt keine KI weiter.
art: beides
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: ja
skript: tests/layout/spiel.hooks.spec.ts
aenderung: task/O3-partie-steuerung (PR #70)
---

## Worum es geht

Nach jedem Schritt steht der Spielstand im Speicher des Browsers. Wer neu lädt, soll genau dort weiterspielen, auch wenn gerade eine KI dich angreift und du entscheiden musst, ob du abwehrst. Solange du gefragt bist, darf die Steuerung nichts weiterspielen, aber auch nicht stumm hängen: Die Statuszeile sagt, was du entscheidest.

## Bestanden, wenn

Mitten in `schlussrunde-ohne-dich` zeigt die Seite nach dem Neuladen denselben Stand wie davor, und der nächste Schritt ist genau ein Zug weiter. In `angriff-auf-dich` steht vor und nach dem Neuladen „KI-Gegner 1 spielt Schlangengrube“ und „Du entscheidest, ob du abwehrst.“; vier Sekunden nach dem Neuladen ist der gespeicherte Stand unverändert und nichts wurde geschrieben.

## Fehlgeschlagen, wenn

Nach dem Neuladen fehlt ein Schritt, einer ist doppelt, die Partie beginnt von vorn, die Abwehrfrage ist weg, oder eine KI spielt weiter, obwohl du entscheiden musst.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build, Vorschau, Stand ab Commit 249aebb |
| Ausgangslage prüfen | Leerer Local Storage |

## Testdaten

Szenarien `schlussrunde-ohne-dich` und `angriff-auf-dich` (zwei Spieler, KI-Gegner 1 hat eine Schlangengrube auf dich angesagt, du hältst einen Farbenschutz).

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser | Adresse öffnen | `/spiel?szenario=schlussrunde-ohne-dich` | Statuszeile „KI-Gegner 1 ist dran“ |
| 2 | Tisch | zwei Schritte abwarten, Handkarten und Schlangen der Gegner notieren | | z. B. „KI-Gegner 2 ist dran“ |
| 3 | Browser | neu laden (F5) | | derselbe Stand wie notiert, Adresse `/spiel` |
| 4 | Tisch | einen Schritt abwarten | | genau eine Karte oder ein Zugwechsel mehr |
| 5 | Browser | Adresse öffnen | `/spiel?szenario=angriff-auf-dich` | „KI-Gegner 1 spielt Schlangengrube“, „Du entscheidest, ob du abwehrst.“ |
| 6 | Browser | neu laden, vier Sekunden warten | | dieselbe Statuszeile, deine fünf Handkarten, nichts ändert sich |

## Zurücksetzen

Local Storage der Seite leeren; danach zeigt `/spiel` „Es läuft keine Partie.“

## Nicht abgedeckte Grenzfälle

Drehen des Geräts während der Frage: TF-TISCH-008. Zwei Tabs mit derselben Partie: TF-TISCH-010. Schmaler als jede Geräteklasse: TF-TISCH-011. Neuladen während einer Abwehrfrage an eine KI: nicht im Browser geprüft, belegt im Vitest-Test „O3 K2/A6: ist eine KI gefragt, antwortet sie nach dem Neuladen auf die offene Frage“.
