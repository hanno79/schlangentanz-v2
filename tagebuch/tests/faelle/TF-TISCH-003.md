---
id: TF-TISCH-003
titel: Auch auf einem kleineren Handy quer (740 × 360) stehen deine Schlangen mit den Karten unter der Fusion ganz im Bild.
art: manuell
regression: nein
prioritaet: niedrig
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: ja
aenderung: task/O4-spieltisch (PR #34)
grenzfall_von: TF-TISCH-001
---

## Worum es geht

Die Geräteklasse Handy quer misst 844 × 390. Viele Handys sind quer etwas niedriger, etwa 740 × 360 oder 667 × 375. Dort ist für deine Schlangen weniger Höhe da. Das prüft, wie viel Reserve das Layout hat.

## Bestanden, wenn

Bei 740 × 360 mit Touch gilt im Volltisch: „Deine Schlangen“ hält in der Höhe nichts zurück (`scrollHeight − clientHeight` ≤ 1), und jedes Bild darin, auch die zwei halben Karten unter der Fusion, liegt ganz zwischen Ober- und Unterkante des Bereichs.

## Fehlgeschlagen, wenn

Der Bereich hält Höhe zurück oder ein Bild ragt über seine Unterkante hinaus.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Produktionsbuild, Playwright-Kontext „handy-hochkant“ mit Fenster 740 × 360 |
| Ausgangslage | Spielstand `volltisch()` im Local Storage |

## Testdaten

Szenario `volltisch()`: deine Schlange 2 trägt an Platz 10 eine Farbenfusion auf Gelb und Gelb.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser | Spielstand legen, `/spiel` bei 740 × 360 öffnen | | dein Platz rechts |
| 2 | Konsole | `scrollHeight` und `clientHeight` von „Deine Schlangen“ und die Lage jedes Bilds darin lesen | | nichts ragt hinaus |
| 3 | Deine Schlangen | Foto ansehen | | halbe gelbe Karten unter der Fusion ganz zu sehen |

## Zurücksetzen

Browserkontext schliessen.
