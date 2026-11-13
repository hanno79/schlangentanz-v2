---
id: TF-APP-003
titel: Mit Spielstand bietet die Lobby „Weiterspielen“ und fragt vor einer neuen Partie nach; Abbrechen und Escape lassen den Spielstand unverändert.
art: beides
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: ja
skript: tests/layout/lobby.spec.ts
aenderung: task/O2-app-rahmen-lobby (PR #29)
---

## Worum es geht

Eine laufende Partie darf nicht aus Versehen verloren gehen. Gibt es einen Spielstand, zeigt die Lobby ihn mit „Weiterspielen“ an und fragt vor einer neuen Partie nach (Plan O2, Kriterium 2).

## Bestanden, wenn

Mit Spielstand zeigt die Lobby „Laufende Partie: 3 Gegner, Erweiterung an“ und „Weiterspielen“, das auf `/spiel` führt. „Neue Partie“ öffnet die Rückfrage „Es läuft schon eine Partie. Eine neue Partie überschreibt sie.“ mit „Ja, neue Partie“ und „Abbrechen“; der Fokus liegt auf „Abbrechen“. Nach „Abbrechen“ und nach Escape ist der Eintrag `schlangentanz-v2:partie` im Local Storage zeichengleich wie vorher. Nach „Ja, neue Partie“ mit „2 Gegner“ zeigt `/spiel` „Gegner 2“.

## Fehlgeschlagen, wenn

„Weiterspielen“ fehlt, „Neue Partie“ überschreibt ohne Rückfrage, Abbrechen oder Escape ändern den Spielstand, oder „Ja, neue Partie“ legt keine neue Partie an.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Produktionsbuild auf Port 4173 |
| Ausgangslage | Eine Partie mit 3 Gegnern und Erweiterung an, angelegt wie in TF-APP-002 |

## Testdaten

Vorhandene Partie: 3 Gegner, Erweiterung an. Neue Partie: 2 Gegner, Erweiterung aus.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser auf `/spiel` | Zurück-Knopf des Browsers | | Lobby mit Kasten „Laufende Partie: 3 Gegner, Erweiterung an“ und „Weiterspielen“ |
| 2 | Lobby | „Weiterspielen“ | | `/spiel` mit „Gegner 3“; dann wieder Browser-Zurück |
| 3 | Entwicklerwerkzeuge, Konsole | Spielstand merken | `v = localStorage.getItem('schlangentanz-v2:partie')` | |
| 4 | Lobby | „Neue Partie“ | | roter Kasten mit der Frage, Fokusrahmen auf „Abbrechen“ |
| 5 | Rückfrage | „Abbrechen“ | | Kasten weg, Fokus auf „Neue Partie“; `localStorage.getItem('schlangentanz-v2:partie') === v` ergibt `true` |
| 6 | Lobby | „Neue Partie“, dann Taste Escape | | Kasten weg; Vergleich wie in Schritt 5 ergibt `true` |
| 7 | Lobby | „2 Gegner“, „Neue Partie“, „Ja, neue Partie“ | | `/spiel` mit „Gegner 2“, „Erweiterung aus“ |

## Zurücksetzen

Local Storage löschen; danach zeigt `/` keine „Laufende Partie“.

## Nicht abgedeckte Grenzfälle

Rückfrage auf gedrehtem Handy: TF-APP-008 und TF-APP-016. Querformate zwischen den Geräteklassen: TF-APP-017; sehr kleines Handy quer (568×320): TF-APP-018. Zweiter Tab: TF-APP-009. Escape mit Fokus ausserhalb der Rückfrage: TF-APP-010.
