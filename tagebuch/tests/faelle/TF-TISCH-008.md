---
id: TF-TISCH-008
titel: Dreht man das Handy während einer Abwehrfrage an dich, bleibt die Frage stehen und keine KI spielt weiter.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: ja
aenderung: task/O3-partie-steuerung (PR #70)
grenzfall_von: TF-TISCH-006
---

## Worum es geht

Beim Drehen des Handys zeichnet die Seite neu. Dabei darf die Steuerung weder die offene Abwehrfrage verlieren noch die KI weiterspielen lassen.

## Bestanden, wenn

Nach dem Drehen von 390 × 844 auf 844 × 390 und zurück steht weiter „KI-Gegner 1 spielt Schlangengrube“ und „Du entscheidest, ob du abwehrst.“, der gespeicherte Stand ist unverändert, und die Seite ist so breit wie das Fenster (`scrollWidth` 390, `clientWidth` 390).

## Fehlgeschlagen, wenn

Die Frage verschwindet, eine KI macht einen Schritt, oder die Seite lässt sich waagrecht scrollen.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build, Playwright-Kontext „handy-hochkant“ (Touch), ohne „weniger Bewegung“, Stand ab Commit 249aebb |
| Ausgangslage prüfen | Leerer Local Storage |

## Testdaten

Szenario `angriff-auf-dich`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser, 390 × 844 | Adresse öffnen | `/spiel?szenario=angriff-auf-dich` | „Du entscheidest, ob du abwehrst.“ |
| 2 | Gerät | quer drehen (844 × 390), 2,5 s warten | | dieselbe Frage, Tisch quer |
| 3 | Gerät | zurück hochkant drehen, 1,5 s warten | | dieselbe Frage, keine waagrechte Scrollleiste |
| 4 | Entwicklerwerkzeuge | Local Storage mit dem Stand aus Schritt 1 vergleichen | | unverändert |

## Zurücksetzen

Local Storage leeren oder Kontext schliessen.
