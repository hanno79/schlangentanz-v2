---
id: TF-TISCH-061
titel: Bei 320 × 568 bleibt die Zugleiste auch mit drei Gegnern frei, wenn du die Risiko-Karte spielst.
art: manuell
regression: nein
prioritaet: niedrig
herkunft: aenderung
angelegt: 2026-11-27
veraendert_daten: nein
aenderung: task/O10b-320-zugleiste (PR #129)
grenzfall_von: TF-TISCH-055
---

## Worum es geht

Mit drei Gegnern ist die Tischfläche am vollsten. Geprüft wird, ob die Zugleiste bei 320 × 568 auch dann frei bleibt und die Seite scrollt, statt Gegner über die Leiste zu legen.

## Bestanden, wenn

Nach „Risiko spielen“ liegen der Satz „Wähle die Risiko-Aktion.“, die vier Aktionen, „Zug beenden“, „Ansehen“ und „Abbrechen“ nach dem Scrollen frei: An ihrer Mitte liefert `document.elementFromPoint` das Element selbst. Die Seite ist höher als 568 px und nicht breiter als 320 px.

## Fehlgeschlagen, wenn

An der Mitte eines Knopfs oder Satzes der Zugleiste liegt ein Gegnerkasten, eine Schlange oder eine Handkarte, oder die Seite lässt sich nicht scrollen, obwohl Knöpfe unter dem Rand liegen.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build, Stand ab Commit 705a9cef, Fenster 320 × 568 mit Touch |

## Testdaten

`/spiel?seed=7&spieler=4&erweiterung=1` und `/spiel?seed=11&spieler=4&erweiterung=1`: neue Partie mit dir und drei KI-Gegnern, du beginnst.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Adresse | öffnen | `/spiel?seed=7&spieler=4&erweiterung=1` | Kopfleiste „Du bist dran“, Tischfläche mit KI-Gegner 1 bis 3, darunter die Zugleiste mit „Risiko spielen“ |
| 2 | Zugleiste | „Risiko spielen“ antippen | | „Wähle die Risiko-Aktion.“ und vier Aktionen; kein Gegnerkasten liegt über dem Satz |
| 3 | Seite | nach unten scrollen | | „Zug beenden“, „Ansehen“, „Abbrechen“ ganz zu sehen, darunter deine Schlangen und deine Hand |
| 4 | Adresse | dasselbe mit Saat 11 | `/spiel?seed=11&spieler=4&erweiterung=1` | wie Schritte 1 bis 3 |
