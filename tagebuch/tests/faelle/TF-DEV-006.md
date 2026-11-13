---
id: TF-DEV-006
titel: erweiterung=1 wird angezeigt, ändert die Partie aber nicht, und der Tisch sagt das.
art: manuell
regression: nein
prioritaet: niedrig
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
aenderung: task/P0.4-entwicklertisch (PR #27)
grenzfall_von: TF-DEV-001
---

## Worum es geht

Die heutige Engine hat noch keinen Schalter für die Erweiterung (kommt mit X1). Der Tisch nimmt den Parameter an; damit niemand eine Basis-Partie für eine mit Erweiterung hält, muss er sichtbar sagen, dass der Wert nichts bewirkt.

## Bestanden, wenn

`/dev?seed=1&spieler=2&erweiterung=1` und `…&erweiterung=0` haben denselben Rohzustand. Der gelbe Hinweis nennt „Erweiterung angefordert: 1“ bzw. „0“ und „Die Engine kennt diesen Schalter noch nicht (kommt mit X1)“.

## Fehlgeschlagen, wenn

Der Hinweis fehlt oder nennt den falschen Wert, oder die Zustände unterscheiden sich, ohne dass die Engine einen Schalter hat.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build auf Port 4174 |

## Testdaten

Saat 1, 2 Spieler, `erweiterung` 0 und 1.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser | Adresse öffnen, Rohzustand kopieren | `/dev?seed=1&spieler=2&erweiterung=0` | Hinweis „Erweiterung angefordert: 0“ |
| 2 | Browser | Adresse öffnen, Rohzustand vergleichen | `/dev?seed=1&spieler=2&erweiterung=1` | Hinweis „Erweiterung angefordert: 1“, Rohzustand gleich |
