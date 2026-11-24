---
id: TF-DEV-047
titel: Im Szenario entscheidung-gegner wählt Spieler 1 einen Gegner, der entscheidet danach selbst, und wer mehr als fünf Karten bekommt, wirft erst an seinem eigenen Zugende ab.
art: manuell
regression: nein
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-23
veraendert_daten: nein
aenderung: task/X3-zusatzaktionen (PR #108)
---

## Worum es geht

Bei einem Misserfolg der Risiko-Karte wählt der Spieler einen Gegner, und der wählt danach selbst (A8.2, D52). Die Engine muss sagen, wer gerade entscheidet, und nur dessen Wahl anbieten. Bekommt der Gegner so mehr als fünf Karten, baut er sie erst an seinem eigenen Zugende ab.

## Bestanden, wenn

Zu Beginn bietet die Engine genau zwei Aktionen an: „Entscheiden: KI-Gegner 1 (spieler-2)“ und „Entscheiden: KI-Gegner 2 (spieler-3)“. Nach der Wahl von spieler-3 zeigt „Entscheidet“ KI-Gegner 2 mit den Wahlen „aufgedeckte“ und „stapel“, am Zug bleibt Spieler 1. Nach „aufgedeckte“ hält KI-Gegner 2 sieben Karten, das Ereignis nennt nur „verdeckte Karte“, und die Entscheidung ist „keine“. Nach Zug von Spieler 1 und KI-Gegner 1 beginnt KI-Gegner 2 ohne Nachziehen und bekommt nach seiner Karte „AbwerfenVerlangt: … 1 Karte(n)“. Alle Invarianten sind erfüllt.

## Fehlgeschlagen, wenn

Ein anderer Spieler als der Entscheider bekommt eine Aktion, eine Handkarten-Id steht im Ereignis, KI-Gegner 2 wirft schon am Zugende von Spieler 1 ab, oder eine Invariante ist verletzt.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build, Stand ab Commit 686159e |

## Testdaten

Szenario `entscheidung-gegner`: drei Spieler, Violett (violett-06) liegt aufgedeckt, KI-Gegner 2 hält sechs Karten.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Adresse | öffnen | `/dev?szenario=entscheidung-gegner` | „Aktionen der Engine (2)“, beide „Entscheiden“ für spieler-1; Lage „Aufgedeckt: Mondranke (Violett, 2) violett-06“ |
| 2 | Aktionen der Engine | klicken | „Entscheiden: KI-Gegner 2 (spieler-3)“ | Ereignisse „Entschieden“ und „EntscheidungVerlangt“; „Entscheidet: KI-Gegner 2“; „Am Zug: Spieler 1“ |
| 3 | Aktionen der Engine | klicken | „Entscheiden: aufgedeckte“ | „KartenVersetzt … verdeckte Karte: aufgedeckt, Stelle 0 → Hand von KI-Gegner 2“; Hand KI-Gegner 2 (7) |
| 4 | Aktionen der Engine | eine Farbkarte auf „neue Schlange“, dann „ZugBeenden“ klicken | | „ZugBegonnen: KI-Gegner 1“ |
| 5 | Kopf | viermal „KI-Schritt (solide)“ klicken | | KI-Gegner 2 beginnt ohne „KartenGezogen“, spielt eine Karte, dann „AbwerfenVerlangt: KI-Gegner 2 (spieler-3) muss 1 Karte(n) abwerfen“ |

## Nicht abgedeckte Grenzfälle

Speichern und Laden mitten in der Entscheidung prüft TF-DEV-050 unter `/spiel`, weil der Entwicklertisch beim Neuladen das Szenario neu anlegt. Die Wahl „stapel“ prüft TF-DEV-048.
