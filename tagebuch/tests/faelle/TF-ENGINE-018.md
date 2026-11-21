---
id: TF-ENGINE-018
titel: Folgt auf drei Regenbogenschlangen eine Farbkarte derselben Gruppe, zählt deren Farbe für den Vielfaltbonus.
art: automatisch
regression: ja
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-20
veraendert_daten: nein
skript: src/engine/__tests__/regeln/A11_vielfalt.test.ts
aenderung: task/E10b-vielfalt-regenbogen (PR #52)
grenzfall_von: TF-ENGINE-017
---

## Worum es geht

Die Wertung entscheidet bei der dritten Karte einer Gruppe, ob ihre Farbe für den Vielfaltbonus zählt. Kommt die erste Farbkarte erst nach drei Regenbogenschlangen, muss die Farbe trotzdem zählen, denn die Gruppe enthält dann eine Farbkarte, so wie Rot, Regenbogenschlange, Rot in A11 (Vielfalt, Beispiel 2) eine rote Gruppe ist.

## Bestanden, wenn

Rot, Rot, Rot, Schlangenblockade, Regenbogenschlange, Regenbogenschlange, Regenbogenschlange, Grün ergibt mit Erweiterung die Gruppen Rot×3 = 3 und Grün×4 = 3, die Farben Rot und Grün, Vielfaltbonus 1 und zusammen 7 Punkte. Blau³ mit Regenbogenschlange ×3 und Rot dahinter ergibt die Farben Blau und Rot und Bonus 1.

## Fehlgeschlagen, wenn

Grün beziehungsweise Rot fehlt unter den Farben für den Vielfaltbonus oder der Bonus ist 0.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Arbeitskopie des Branches ab Commit 4c83fb0, `npm ci` gelaufen |

## Testdaten

Schlange: Rot ×3, Schlangenblockade, Regenbogenschlange ×3, Grün; zweite Auslage Blau ×3, Regenbogenschlange ×3, Rot.

## Technische Prüfung

`werteSchlangen(schlangen, true)` aus `src/engine/jokerGruppen.ts` liefert für die erste Auslage `vielfaltFarben` = `['Rot', 'Grün']`, `vielfaltBonus` = 1, `gruppenPunkte` = 6. Den zweiten Fall hält der Test „D32, A7.3: in einer Gruppe mit einer roten Karte zählt die Regenbogenschlange weiter als Rot“ in `A11_vielfalt.test.ts` fest; der erste lief im eigenen Abgleich des Prüfers E10b.

## Nicht abgedeckte Grenzfälle

Keine; die Regenbogenschlangen allein ohne Farbkarte prüft TF-ENGINE-017, in einer eigenen Schlange TF-ENGINE-019.
