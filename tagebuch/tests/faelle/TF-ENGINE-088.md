---
id: TF-ENGINE-088
titel: Eine ganze Partie mit Erweiterung lässt sich am Entwicklertisch mit Klicks bis zum Ende spielen, und die angezeigte Endwertung stimmt mit der Rechnung von Hand überein.
art: manuell
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-25
veraendert_daten: nein
aenderung: task/X7-abnahme-erweiterung (PR #120)
---

## Worum es geht

Ein Mensch spielt am Entwicklertisch eine Partie mit Erweiterung zu zweit von der ersten Karte bis zur Endwertung. Seine eigenen Züge klickt er selbst, die Züge des KI-Gegners löst er mit dem Knopf „KI-Schritt“ aus. Dabei sollen Aufgaben, eine Comeback-Karte, Risiko-Karten und der Schlangenkorb vorkommen. Am Ende rechnet er die Endwertung aus den angezeigten Schlangen nach.

## Bestanden, wenn

Die Partie endet mit „Die Partie ist beendet.“ und null Aktionen. Unter „Invarianten“ steht in jedem angesehenen Schritt „alle erfüllt“, und die Konsole zeigt keinen Fehler. Die Endwertung aus den Schlangen von Hand stimmt mit der Tabelle „Endwertung“ überein (mit Saat 7: Spieler 1 = 13 Gruppenpunkte + 1 Vielfalt + 9 geheime Aufgabe = 23, KI-Gegner 1 = 0 + 0 + 21 Aufgaben = 21). Comeback-Karte, Risiko-Karte mit Erfolg und mit Misserfolg und mindestens eine erfüllte Aufgabe kommen vor.

## Fehlgeschlagen, wenn

Die Partie bleibt ohne Aktion stehen, bevor sie beendet ist, eine Invariante ist verletzt, die Konsole meldet einen Fehler oder die angezeigte Endwertung weicht von der Handrechnung ab.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build: `npm run build:testhooks`, dann `npx vite preview --outDir dist-testhooks --port <freier Port> --strictPort` |

## Testdaten

Adresse `/dev?seed=7&spieler=2&erweiterung=1`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser | Adresse öffnen | `/dev?seed=7&spieler=2&erweiterung=1` | Titel „Partie aus Saat 7, 2 Spieler, mit Erweiterung“, Schritt 0, „Spieler 1 entscheidet“ |
| 2 | „Aktionen der Engine“ | im eigenen Zug Karten wählen, dann „ZugBeenden“ | eine Farbkarte, wenn möglich eine Sonderkarte, Comeback und Risiko, sobald angeboten | die Lage zeigt „gespielt: … Farbkarte(n), … Sonderkarte(n)“ und Zusatzaktionen |
| 3 | Knopf „KI-Schritt“ | klicken, bis wieder „Spieler 1 entscheidet“ steht | – | greift die KI an, steht „Reagieren“ zur Wahl; „durchlassen“ oder Farbenschutz klicken |
| 4 | dieselbe Seite | Schritte 2 und 3 wiederholen | – | Nachziehstapel sinkt; „Schlussrunde“ wechselt auf „Am Zug“, sobald jemand die letzte Karte zieht |
| 5 | Kopf der Seite | Ende ablesen | – | „Die Partie ist beendet.“, Aktionen der Engine (0) |
| 6 | Abschnitte „Spieler“ und „Wertung“ | Endwertung von Hand rechnen | – | Summe je Spieler wie in der Tabelle „Endwertung“ |

## Nicht abgedeckte Grenzfälle

Gespielt ist eine Partie zu zweit; drei und vier Spieler deckt der Golden Master ab (TF-ENGINE-087). Die Abwehr mit Farbenschutz hat in dieser Partie die KI nicht ausgelöst, weil Spieler 1 keinen Farbenschutz hielt, als er angegriffen wurde.
