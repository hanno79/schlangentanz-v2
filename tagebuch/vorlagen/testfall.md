---
id: <TF-BEREICH-NNN, gleich dem Dateinamen ohne .md, etwa TF-MOD-012; die nächste freie Nummer im Bereich>
titel: <ein Satz, der sagt, was gelten muss>
art: <manuell, automatisch oder beides>
regression: <ja oder nein: ja, wenn der Testfall auch ohne Änderung im Bereich regelmässig laufen soll>
prioritaet: <hoch, mittel oder niedrig>
herkunft: <aenderung, wenn eine Änderung den Testfall ausgelöst hat; nachtrag, wenn er ohne Änderung nachträglich entsteht>
angelegt: <JJJJ-MM-TT>
veraendert_daten: <ja oder nein: ja, wenn der Test Daten anlegt, ändert oder löscht>
skript: <nur bei art automatisch oder beides: Pfad relativ zur Projektwurzel, optional mit ::testname, etwa tests/e2e/test_module.py::test_kurswerte; sonst Zeile löschen>
aenderung: <nur bei herkunft aenderung: Commit, Branch oder Merge Request; sonst Zeile löschen>
eintrag: <optional: Dateiname des Tagebucheintrags, der zum Testfall führte, etwa 2026-10-22-module.md; sonst Zeile löschen>
issue: <optional: Kennung oder URL eines Fehlers oder Tickets; sonst Zeile löschen>
grenzfall_von: <nur bei einem Grenzfall: ID des normalen Testfalls im selben Bereich; sonst Zeile löschen>
status: <nur wenn der Testfall nicht mehr gilt: stillgelegt; sonst Zeile löschen>
---

## Worum es geht

<Zwei bis drei Sätze in Alltagssprache: was geprüft wird und warum es wichtig ist.>

## Bestanden, wenn

<Messbares Kriterium mit konkreten Werten, etwa: Das Budget bleibt 3'675.00 CHF. Lässt sich keines angeben, woran ein Mensch es beurteilt.>

## Fehlgeschlagen, wenn

<Was sichtbar wird, wenn es nicht stimmt, mit Werten.>

## Vorbedingungen

| Was | Wert |
|---|---|
| <Anwendung, Datenstand, Angemeldet als oder Ausgangslage prüfen; Zeilen ohne Bedeutung für den Testfall löschen> | <Instanz und Stand ab Commit, Datenstand, Benutzer und Rolle, oder was vor Schritt 1 zu sehen sein muss> |

## Testdaten

<Die konkreten Werte, mit denen gearbeitet wird: IDs, Namen, Beträge, Eingaben.>

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| <1, fortlaufend ohne Lücke; Abschnitt nur bei art manuell oder beides, sonst löschen> | <Menü, Seite, Maske oder Feld, so wie sie in der Oberfläche heissen> | <was der Tester tut: klicken, wählen, eingeben, lesen> | <was er eingibt, sonst leer> | <der erwartete sichtbare Zustand mit Werten> |

## Zurücksetzen

<Nur bei veraendert_daten ja, sonst Abschnitt löschen: wie der Ausgangszustand zurückkommt (ROLLBACK oder Rückstellung von Hand) und woran man sieht, dass es geklappt hat.>

## Technische Prüfung

<Pflicht bei art automatisch ohne Schritte, sonst optional; nicht für den Tester: Prüfung direkt an Datenbank oder API, etwa SQL in einer Transaktion mit ROLLBACK, mit erwarteter Ausgabe.>

## Nicht abgedeckte Grenzfälle

<Nur bei normalen Testfällen, bei einem Grenzfall Abschnitt löschen: jeder denkbare Grenzfall (NULL, 0, negativ, leer, Maximalwert, fehlende Rechte) ohne eigenen Testfall, mit Grund; Keine, wenn alle eigene Testfälle haben.>
