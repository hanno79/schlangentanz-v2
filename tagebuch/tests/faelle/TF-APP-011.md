---
id: TF-APP-011
titel: Ein Doppelklick auf „Neue Partie“ legt nur einen Verlaufseintrag an, und einmal Zurück führt in die Lobby.
art: manuell
regression: nein
prioritaet: niedrig
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: ja
aenderung: task/O2-app-rahmen-lobby (PR #29)
grenzfall_von: TF-APP-002
---

## Worum es geht

Ungeduldige Spieler klicken zweimal. Entstünden dabei zwei Einträge für `/spiel`, müsste man zweimal Zurück drücken, um in die Lobby zu kommen.

## Bestanden, wenn

Nach einem Doppelklick ist `history.length` um genau 1 gewachsen, und einmal Browser-Zurück zeigt `/`.

## Fehlgeschlagen, wenn

`history.length` wächst um 2 oder mehr, oder nach einmal Zurück steht weiter `/spiel` da.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Produktionsbuild auf Port 4173, Local Storage leer, Desktop |

## Testdaten

Keine.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Konsole | Länge merken | `history.length` | Zahl n |
| 2 | Lobby | Doppelklick auf „Neue Partie“ | | `/spiel` |
| 3 | Konsole | Länge lesen | `history.length` | n + 1 |
| 4 | Browser | einmal Zurück | | Lobby |

## Zurücksetzen

Local Storage löschen.
