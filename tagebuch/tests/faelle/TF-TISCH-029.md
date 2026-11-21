---
id: TF-TISCH-029
titel: Dreht man das Handy auf der Wertung mit gescrollter Rangliste, bleiben Titel und beide Knöpfe ganz im Bild, und die Seite scrollt nicht waagrecht.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
aenderung: task/O8-spielende (PR #77)
grenzfall_von: TF-TISCH-024
---

## Worum es geht

Auf der Wertung scrollt nur die Rangliste. Dreht man das Handy, wird die Liste viel niedriger. Titel, „Zur Lobby“ und „Noch einmal“ müssen trotzdem erreichbar bleiben, und die Liste muss weiter scrollen.

## Bestanden, wenn

Nach dem Drehen von 390 × 844 auf 844 × 390 stehen Titel, „Zur Lobby“ und „Noch einmal“ ganz im Fenster. Die Rangliste ist 234 px hoch, steht nicht mehr ganz oben und zeigt „mehr ↑“ und „mehr ↓“. `scrollWidth` ist gleich `clientWidth`. Nach dem Zurückdrehen gilt dasselbe, und die Konsole meldet keinen Fehler.

## Fehlgeschlagen, wenn

Ein Knopf oder der Titel liegt nach dem Drehen ausserhalb des Fensters, die Rangliste lässt sich nicht mehr scrollen, oder die Seite wird breiter als das Fenster.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build, Handy hochkant 390 × 844 mit Touch, Stand ab Commit 0b0d639 |

## Testdaten

Adresse `/spiel?szenario=wertung-beispiele`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser | Adresse öffnen | `/spiel?szenario=wertung-beispiele` | Wertung mit vier Spielern, unten „mehr ↓“ |
| 2 | Rangliste | nach unten wischen, bis „3. Du“ zu sehen ist | | „mehr ↑“ erscheint |
| 3 | Gerät | quer drehen | | Titel, „Zur Lobby“ und „Noch einmal“ ganz zu sehen, Rangliste dazwischen mit „mehr ↑“ und „mehr ↓“ |
| 4 | Gerät | zurück hochkant drehen | | Knöpfe ganz zu sehen, nichts waagrecht verschoben |
