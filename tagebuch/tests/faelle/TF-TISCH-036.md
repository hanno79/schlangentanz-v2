---
id: TF-TISCH-036
titel: Gibt es keinen Abschnitt für die Häutung, bietet der Tisch nur das Ablegen ohne Wirkung an.
art: manuell
regression: nein
prioritaet: niedrig
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
aenderung: task/O7-haeutung-tisch (PR #78)
grenzfall_von: TF-TISCH-032
---

## Worum es geht

Unterbrechen Sonderkarten jeden Lauf oder liegen nur gleiche Farben, hat die Häutung kein Ziel (A7.9 Beispiel 2, D26). Dann darf der Tisch keine Schlange anbieten, sondern nur die eigene Ablage.

## Bestanden, wenn

Nach dem Antippen der Häutung steht in der Zugleiste „Lege die Karte ohne Wirkung auf deine Ablage: Tippe die Ablage an.“, und das einzige Ziel ist „Ohne Wirkung auf deine Ablage“.

## Fehlgeschlagen, wenn

Eine Schlange ist zum Wählen angeboten oder die Ablage fehlt.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build, Desktop 1280 × 900 mit Maus, Stand ab Commit 49a394c |

## Testdaten

Szenario `haeutung-nicht-moeglich`: deine Schlange Blau, Violett, Schlangenblockade, Grün, Violett; KI-Gegner 1 Rot, Rot, Rot und Gelb, Blau, Regenbogenschlange, Grün, Braun.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser | Adresse öffnen | `/spiel?szenario=haeutung-nicht-moeglich` | „Du bist dran“ |
| 2 | Deine Hand | Schlangenhäutung anklicken | | Satz wie oben, einziges Ziel „Ohne Wirkung auf deine Ablage“ |
