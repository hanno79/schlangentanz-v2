---
id: TF-DEV-008
titel: Ist die Schlangenhäutung möglich, zeigt der Tisch sie als nicht aufgezählten Hinweis ohne Knopf.
art: manuell
regression: nein
prioritaet: niedrig
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
aenderung: task/P0.4-entwicklertisch (PR #27)
grenzfall_von: TF-DEV-002
---

## Worum es geht

Die heutige Engine meldet die Schlangenhäutung nur über `ermittleNichtEnumerierteAktionenHinweise` und zählt sie nicht auf. Der Tisch baut keine Aktion selbst (U3); er muss deshalb sichtbar sagen, dass es diese Möglichkeit gibt, damit niemand eine festgefahrene Partie für einen Fehler des Tischs hält. E1/E9 nehmen sie in die Aufzählung.

## Bestanden, wenn

In einer Partie, in der die Häutung möglich ist, steht unter den Aktionsknöpfen gelb „Die Engine meldet zusätzlich nicht aufgezählte Aktionen: Schlangenhaeutung. Sie haben keinen Knopf, weil der Tisch keine Aktion selbst baut (U3); E1 und E9 nehmen sie in die Aufzählung.“, und es gibt keinen Knopf mit Typ `SchlangenhaeutungSpielen`.

## Fehlgeschlagen, wenn

Der Hinweis fehlt, obwohl die Engine die Häutung meldet, oder der Tisch bietet einen selbst gebauten Häutungsknopf an.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build auf Port 4174 |

## Testdaten

`/dev?seed=6&spieler=2`, mit Klicks weitergespielt (Phasenschritte und Aktionsknöpfe), bis der Hinweis erscheint; im Prüflauf nach 147 Klicks in der Ausspielphase von spieler-2.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser | Adresse öffnen | `/dev?seed=6&spieler=2` | Partie aus Saat 6 |
| 2 | Tisch | abwechselnd Phasenschritte und Aktionsknöpfe klicken | | nach jedem Klick ändert sich der Schrittzähler |
| 3 | Abschnitt Aktionen | sobald gelber Hinweis erscheint, Text lesen | | Hinweis wie oben, kein Häutungsknopf |
