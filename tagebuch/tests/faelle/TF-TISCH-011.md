---
id: TF-TISCH-011
titel: Auch 320 px breit zeigt der Tisch die Abwehrfrage ganz, ohne waagrechtes Scrollen.
art: manuell
regression: nein
prioritaet: niedrig
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: ja
aenderung: task/O3-partie-steuerung (PR #70)
grenzfall_von: TF-TISCH-006
---

## Worum es geht

320 px ist schmaler als jede Geräteklasse. Die Statuszeile mit Angreifer, Karte und Frage ist dort am engsten. Sie soll trotzdem ganz zu lesen sein.

## Bestanden, wenn

Bei 320 × 640 mit Touch steht „KI-Gegner 1 spielt Schlangengrube“ und „Du entscheidest, ob du abwehrst.“ vollständig da, „Zur Lobby“ ist ganz zu sehen, und `scrollWidth` ist gleich `clientWidth` (320).

## Fehlgeschlagen, wenn

Ein Teil der Statuszeile oder „Zur Lobby“ ist abgeschnitten oder verdeckt, oder die Seite scrollt waagrecht.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build, Playwright-Kontext „handy-hochkant“ (Touch) mit Fenster 320 × 640, Stand ab Commit 249aebb |
| Ausgangslage prüfen | Leerer Local Storage |

## Testdaten

Szenario `angriff-auf-dich`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser, 320 × 640 | Adresse öffnen | `/spiel?szenario=angriff-auf-dich` | Statuszeile mit Frage |
| 2 | Kopfleiste | Foto ansehen | | Text ganz, nichts überlappt |
| 3 | Konsole | `scrollWidth` und `clientWidth` von `document.documentElement` lesen | | beide 320 |

## Zurücksetzen

Kontext schliessen.
