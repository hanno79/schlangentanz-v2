---
id: TF-DEV-018
titel: Entscheidet eine KI über eine angesagte Karte, für die die Engine noch keine Aktion aufzählt, zeigt „KI-Schritt“ den Grund und der Zustand bleibt.
art: manuell
regression: nein
prioritaet: niedrig
herkunft: aenderung
angelegt: 2026-11-20
veraendert_daten: nein
aenderung: task/K1-ki-schnittstelle
grenzfall_von: TF-DEV-016
---

## Worum es geht

Bis E4 zählt die Engine keine Reaktion auf eine angesagte Sonderkarte auf. Im Szenario `alle-orte` entscheidet KI-Gegner 2 über eine schwebende Schlangengrube. Der Knopf darf dann nichts erfinden, sondern muss den Grund nennen und den Zustand stehen lassen.

## Bestanden, wenn

Der Knopf ist frei („KI-Gegner 2 entscheidet; das ist eine KI.“). Nach dem Klick steht „Abgelehnt: KI-Schritt: KI-Gegner 2 entscheidet, aber die Engine zählt keine Aktion auf (Plan E2, Kriterium 12).“, die Anzeige bleibt bei „Schritt 0“, der Verlauf hat nur „Start“, und die Konsole zeigt keinen Fehler.

## Fehlgeschlagen, wenn

Der Schritt eine Aktion ausführt, der Verlauf wächst, keine Meldung erscheint oder die Seite abstürzt.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build, `npm run preview:testhooks` auf Port 4174, Fenster 1280×900 |

## Testdaten

Adresse `/dev?szenario=alle-orte`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | `/dev?szenario=alle-orte` | Seite öffnen | | „Schritt 0“, „Aktionen der Engine (0)“, Hinweis „KI-Gegner 2 entscheidet; das ist eine KI.“ |
| 2 | Knopf „KI-Schritt“ | klicken | | rote Meldung „Abgelehnt: KI-Schritt: KI-Gegner 2 entscheidet, aber die Engine zählt keine Aktion auf (Plan E2, Kriterium 12).“, weiter „Schritt 0“ |
