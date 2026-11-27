---
id: TF-TISCH-044
titel: Eine Partie geht allein mit der Tastatur bis zur Wertung, und an jedem Tab-Halt ist der Fokus zu sehen.
art: manuell
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-25
veraendert_daten: ja
aenderung: task/O11-barrierefreiheit (PR #121)
---

## Worum es geht

Wer keine Maus und keinen Finger benutzt, spielt nur mit Tab, Umschalt+Tab, Enter, Leertaste, Escape und beim Ordnen der Häutung mit den Pfeiltasten. Jede Aktion muss so erreichbar sein, und man muss immer sehen, wo der Fokus steht.

## Bestanden, wenn

Eine Partie gegen einen Gegner läuft von „Neue Partie“ in der Lobby bis zur Wertung, ohne Maus und ohne Finger. Dabei kommt mindestens eine Abwehrfrage vor. An jedem Tab-Halt sieht das Element mit Fokus anders aus als ohne Fokus, und nach jeder eigenen Aktion steht der Fokus auf einem Element des Tischs, nie auf der leeren Seite.

## Fehlgeschlagen, wenn

Eine Aktion lässt sich nur mit Maus oder Finger auslösen, ein Tab-Halt zeigt keinen Fokus, oder nach einer Aktion steht der Fokus auf der leeren Seite.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Produktionsbuild, Stand ab Commit 5634c28 |
| Ausgangslage prüfen | Lobby ohne laufende Partie, „weniger Bewegung“ eingeschaltet |

## Testdaten

1 Gegner, mit Erweiterung. Die Karten kommen aus dem Zufall der Partie.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Lobby `/` | Tab bis zur Gegnerzahl, Tab bis „Mit Erweiterung“, Leertaste, Tab bis „Neue Partie“, Enter | | Fokusring an jedem Halt, der Tisch erscheint |
| 2 | Tisch, „Deine Hand“ | Tab bis zu einer bedienbaren Handkarte, Enter | | Karte ist gedrückt, die Zugleiste sagt, was zu tun ist |
| 3 | Tisch, Ziele | Tab oder Umschalt+Tab bis zu einem Ziel, Enter; dann bis „Ausführen“, Enter | | der Fokus springt nach „Ausführen“ auf „Zug beenden“ |
| 4 | Zugleiste | „Zug beenden“ mit Enter | | Fokus auf „Schneller“, danach auf deiner ersten spielbaren Handkarte |
| 5 | Zugleiste, Abwehrfrage | Tab bis „Abwehren“ oder „Durchlassen“, Enter oder Leertaste | | der Fokus bleibt im Tisch |
| 6 | Dialog „Zu viele Handkarten“, falls er kommt | Karten mit Leertaste wählen, „Ablegen“ mit Enter | | der Fokus bleibt sichtbar |
| 7 | Schritte 2 bis 6 | wiederholen | | bis die Wertung erscheint |
| 8 | Wertung | Tab bis „Noch einmal“ | | jeder Halt zeigt den Fokus |

## Zurücksetzen

Die Partie bleibt im Speicher des Browsers; ein frischer Browserkontext setzt sie zurück.

## Nicht abgedeckte Grenzfälle

Fokus und Vorlesen genau beim Spielende prüft TF-TISCH-045. Die Häutung ist in einer Zufallspartie selten; sie läuft mit der Tastatur im Szenario `haeutung-punkte` (`tastatur.hooks.spec.ts` und Browserprüfung im Protokoll O11).
