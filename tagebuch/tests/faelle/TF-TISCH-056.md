---
id: TF-TISCH-056
titel: Abwehr gegen den Korb einer KI, eine Risiko-Entscheidung und ein Korb-Bonus gehen allein mit der Tastatur, mit sichtbarem Fokus.
art: manuell
regression: ja
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-27
veraendert_daten: ja
aenderung: task/O10-erweiterung-tisch (PR #124)
---

## Worum es geht

O11 verlangt, dass jede Aktion allein mit der Tastatur geht und der Fokus immer sichtbar ist. Mit O10 kommen die Knöpfe der Erweiterung dazu.

## Bestanden, wenn

Mit Tab, Umschalt+Tab und Enter lassen sich ausführen: „Abwehren“ gegen den Korb von KI-Gegner 1; „Risiko spielen“, „Aktion 3: Karten tauschen“, Grün in deiner Schlange benennen, „Ausführen“, bei Misserfolg „Hinter Grün legen“, „Ausführen“; Korb, „Ziehe 3 Karten, spiele 2“, „Ausführen“. Bei jedem Halt ist `:focus-visible` wahr, und im Bild ist ein Rahmen um den Knopf zu sehen.

## Fehlgeschlagen, wenn

Ein Knopf ist mit Tab nicht erreichbar, Enter löst ihn nicht aus, oder der Fokus ist nicht zu sehen.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build, Stand ab Commit 4ad16f8, Fenster 1280 × 900 |

## Testdaten

Stand aus `korb-entfernen` mit getauschter Steuerung (wie TF-TISCH-053, Schritt 7); Szenario `korb-ziehen`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Zugleiste | Umschalt+Tab bis „Abwehren“, Enter | | Protokoll „Du wehrst Schlangenkorb des Glücks mit Farbenschutz ab.“ |
| 2 | Zugleiste | Enter auf „Risiko spielen“, Tab bis „Aktion 3: Karten tauschen“, Enter | | „Wähle die Farbkarte deiner Schlange, die du tauschen willst.“ |
| 3 | Deine Schlange | Tab bis „Deine Schlange 1, Karte 1: Farbkarte Grün, 3 Punkte“, Enter; Umschalt+Tab bis „Ausführen“, Enter | | Ansage „… angesagt: Grün.“, danach Ergebnis im Protokoll |
| 4 | Zugleiste | bei Misserfolg Tab bis „Hinter Grün legen“, Enter, Tab bis „Ausführen“, Enter | | „Gelb kommt in deine Schlange 1.“ |
| 5 | Adresse | `/spiel?szenario=korb-ziehen&tempo=sofort`, Tab bis zum Korb, Enter, Umschalt+Tab bis „Ziehe 3 Karten, spiele 2“, Enter, Tab bis „Ausführen“, Enter | | Statuszeile „2 Zusatzaktionen“, Hand mit drei neuen Karten |

## Zurücksetzen

Ein neues Szenario setzt den Stand zurück.

## Nicht abgedeckte Grenzfälle

Der Ausgang der Risiko-Karte hängt am Stapel; bei Erfolg folgt statt Schritt 4 der Tausch oder „kein Tausch“. Vorlesen mit einem echten Bildschirmleser ist nicht geprüft.
