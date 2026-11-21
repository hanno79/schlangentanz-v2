---
id: TF-ENGINE-049
titel: Eine ganze Partie zu zweit lässt sich am Entwicklertisch mit Klicks bis zum Ende spielen, und die angezeigte Endwertung stimmt mit der Rechnung von Hand überein.
art: manuell
regression: nein
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
aenderung: task/E11-abnahme-basis (PR #72)
---

## Worum es geht

Mit E11 gilt die Basis-Engine als regelkonform (Meilenstein M1). Ein Mensch spielt dafür am Entwicklertisch eine vollständige Partie zu zweit und wählt die Züge beider Spieler selbst. Am Ende rechnet er die Punkte aus dem Endstand nach Teil A, Abschnitt A11, nach und vergleicht sie mit der Anzeige.

## Bestanden, wenn

Die Partie endet mit „Partiephase: Beendet“ und „Am Zug: niemand, die Partie ist beendet (A10)“. Der Spieler, der die letzte Karte zieht, kommt danach nicht mehr dran, der andere hat genau einen letzten Zug ohne Nachziehen. Die Summen der Endwertung stimmen je Spieler mit der Rechnung von Hand überein, Gruppen, Farbe jedes Jokers und Kettenbonus eingeschlossen. In der Konsole steht kein Fehler.

## Fehlgeschlagen, wenn

Die Partie bleibt stecken (keine Aktion, obwohl sie läuft), eine Invariante unter „Invarianten“ steht als verletzt, eine Summe weicht von der Rechnung ab, der Auslöser der Schlussrunde bekommt noch einen Zug oder in der Konsole steht ein Fehler.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build (`npm run build:testhooks`, `npm run preview:testhooks`), `http://localhost:4174/` |
| Ausgangslage prüfen | Kopfzeile „Partie aus Saat 42, 2 Spieler, ohne Erweiterung“, „Schritt 0“, Nachziehstapel 98 Karten |

## Testdaten

Saat 42, 2 Spieler, ohne Erweiterung. Der Ablauf der geprüften Partie (186 Schritte) liegt als Beleg beim Lauf.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser | Adresse öffnen | `http://localhost:4174/dev?seed=42&spieler=2&erweiterung=0` | Entwicklertisch mit „Aktionen der Engine“, Spieler 1 hat 5 Handkarten, KI-Gegner 1 hat 5 |
| 2 | Aktionen der Engine | für den Spieler, der unter „Entscheidet“ steht, einen Aktionsknopf anklicken; nie „KI-Schritt“ | – | „Ereignisse des letzten Schritts“ nennt die gespielte Karte; „Invarianten (alle erfüllt)“ |
| 3 | Aktionen der Engine | Schritt 2 wiederholen, bis keine Aktion mehr angeboten wird; dabei mindestens einmal abwehren, einen Verdoppler und eine Schlangengrube spielen | – | nach einer Abwehr zieht der Abwehrende erst zu Beginn seines nächsten Zuges; nach der Grube steht beim nächsten Zugwechsel „setzt aus“ |
| 4 | Lage | ablesen, wenn der Nachziehstapel leer ist | – | „Partiephase: Schlussrunde“, „Schlussrunde: ausgelöst von …“ |
| 5 | Lage | nach dem letzten Zug ablesen | – | „Partiephase: Beendet“, keine Aktionsknöpfe mehr |
| 6 | Spieler | Schlangen beider Spieler abschreiben und die Punkte nach A11 von Hand rechnen | – | Gruppen ab 3 Karten, Fusion mit der Summe der Karten darunter (D30), Regenbogenschlange 0 Punkte, längste reine Farbkette ab 3 Karten (D24) |
| 7 | Wertung › Endwertung | Summen mit der eigenen Rechnung vergleichen | – | gleiche Summe je Spieler und dieselbe Gewinnerzeile |

## Nicht abgedeckte Grenzfälle

Partien mit 3 und 4 Spielern und mit Erweiterung spielt dieser Testfall nicht von Hand; sie laufen im Dauerlauf und im Golden Master (TF-ENGINE-050, TF-ENGINE-051). Eine Partie, in der niemand eine Kette ab 3 Farbkarten hat, deckt der Regeltest „D24: hat niemand eine Kette ab 3 …“ ab.
