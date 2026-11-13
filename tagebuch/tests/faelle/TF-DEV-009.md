---
id: TF-DEV-009
titel: Ein Schrägstrich am Ende der Adresse ändert nichts, /dev/szenarien/ zeigt die Liste wie /dev/szenarien.
art: beides
regression: nein
prioritaet: niedrig
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
skript: src/entwicklung/adresse.test.ts::P0.4: ein Schrägstrich am Ende ändert nichts, auch nicht bei /dev/szenarien/
aenderung: task/P0.4-entwicklertisch (PR #27, Iteration 2)
grenzfall_von: TF-DEV-004
---

## Worum es geht

Wer eine Adresse von Hand tippt oder aus einem anderen Werkzeug kopiert, hängt oft einen Schrägstrich an. Iteration 1 meldete bei `/dev/szenarien/` „Unbekannte Seite“, während `/dev/` ging. Der Tisch soll beide Schreibweisen gleich behandeln.

## Bestanden, wenn

`/dev/szenarien/` und `/dev/szenarien//` zeigen „Szenarien (8)“ wie `/dev/szenarien`. `/dev/` zeigt die Startseite, `/dev/?seed=1&spieler=2` die „Partie aus Saat 1, 2 Spieler“. `/dev/xyz` meldet weiterhin rot „Unbekannte Seite /dev/xyz. Es gibt /dev und /dev/szenarien.“

## Fehlgeschlagen, wenn

Eine der Adressen mit Schrägstrich am Ende eine rote Meldung „Unbekannte Seite …“ zeigt, oder `/dev/xyz` plötzlich etwas anderes als die rote Meldung zeigt.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build auf Port 4174 (`npm run build:testhooks`, `npm run preview:testhooks`) |

## Testdaten

Adressen `/dev/szenarien/`, `/dev/szenarien//`, `/dev/`, `/dev/?seed=1&spieler=2`, `/dev/xyz`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser | Adresse öffnen | `/dev/szenarien/` | Überschrift „Szenarien (8)“, acht Links |
| 2 | Browser | Adresse öffnen | `/dev/szenarien//` | wie Schritt 1 |
| 3 | Browser | Adresse öffnen | `/dev/` | Startseite mit Feld „Saat“ und Knopf „Partie starten“ |
| 4 | Browser | Adresse öffnen | `/dev/?seed=1&spieler=2` | „Partie aus Saat 1, 2 Spieler“ |
| 5 | Browser | Adresse öffnen | `/dev/xyz` | rote Meldung „Unbekannte Seite /dev/xyz …“ |
