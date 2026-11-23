---
id: TF-TISCH-043
titel: Nach X3 sieht /spiel in Desktop und Handy hochkant aus wie vorher, für eine neue Partie aus der Lobby und für die Abwehrfrage, ohne Konsolenfehler und ohne waagrechtes Scrollen.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-23
veraendert_daten: ja
aenderung: task/X3-zusatzaktionen (PR #108)
---

## Worum es geht

X3 ändert die Engine und die Auswahl am Tisch (neue Wahl „Entscheiden“, die der Tisch noch nicht bedient). Für das Basis-Spiel darf sich am Tisch nichts ändern.

## Bestanden, wenn

Nach „Neue Partie“ zeigt der Tisch „Du bist dran“, Stapel 98, fünf Handkarten und „Zug beenden“ mit Grund. Das Szenario `angriff-auf-dich` zeigt die Abwehrfrage mit „Durchlassen“ und „Abwehren“. In beiden Klassen ist `scrollWidth` gleich `clientWidth` (1280 und 390), und die Konsole hat keinen Fehler.

## Fehlgeschlagen, wenn

Ein Knopf fehlt, ein Text ist abgeschnitten, die Seite scrollt waagrecht, oder die Konsole meldet einen Fehler.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build, Stand ab Commit 686159e |

## Testdaten

1 Gegner, ohne Erweiterung; Szenario `angriff-auf-dich`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Lobby `/`, Desktop 1280×900 | „Neue Partie“ klicken | | Tisch „Du bist dran“, Stapel 98, Hand mit 5 Karten |
| 2 | Adresse, Desktop | öffnen | `/spiel?szenario=angriff-auf-dich&tempo=sofort` | Abwehrfrage „KI-Gegner 1 sagt an: Schlangengrube auf dich.“ mit „Durchlassen“ und „Abwehren“ |
| 3 | Lobby `/`, Handy hochkant 390×844 | „Neue Partie“ antippen | | wie Schritt 1, ohne waagrechtes Scrollen |
| 4 | Adresse, Handy hochkant | öffnen | `/spiel?szenario=angriff-auf-dich&tempo=sofort` | wie Schritt 2, beide Knöpfe ganz sichtbar |

## Zurücksetzen

Die Partie bleibt im Speicher des Browsers; eine neue Partie oder ein frischer Browserkontext setzt sie zurück.

## Nicht abgedeckte Grenzfälle

Die übrigen drei Geräteklassen prüft `npm run test:layout`; eine offene Entscheidung am Tisch prüft TF-DEV-047.
