---
id: TF-TISCH-062
titel: Bei 320 × 568 liegt der Fokus in der Zugleiste beim Weitertabben immer sichtbar und frei.
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

Beim Spielen mit der Tastatur holt der Browser das Element mit dem Fokus ins Bild. Seit die Seite bei 320 × 568 scrollt, muss das für jeden Knopf der Zugleiste klappen, und über dem Knopf darf dann nichts liegen.

## Bestanden, wenn

In 40 Schritten mit Tab liegt jedes fokussierte Element der Zugleiste ganz im Fenster, und an seiner Mitte liefert `document.elementFromPoint` das Element selbst.

## Fehlgeschlagen, wenn

Ein Knopf der Zugleiste mit Fokus liegt ausserhalb des Fensters oder unter einer Schlange, einer Handkarte oder einem Gegnerkasten; vor der Korrektur traf das „Ansehen“ und „Abbrechen“.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build, Stand ab Commit 705a9cef, Fenster 320 × 568 |

## Testdaten

Szenario `korb-entfernen`, Schlangenkorb gewählt.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Adresse | öffnen | `/spiel?szenario=korb-entfernen&tempo=sofort` | Tisch mit „Wähle eine Karte aus deiner Hand.“ |
| 2 | Deine Hand | Schlangenkorb antippen | | „Wähle einen der Boni des Schlangenkorbs.“ mit vier Boni |
| 3 | Tastatur | 40-mal Tab drücken | Tab | jeder Knopf der Zugleiste mit Fokusring ist ganz zu sehen und nicht von Karten überdeckt |
