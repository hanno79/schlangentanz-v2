---
id: TF-APP-009
titel: Legt ein zweiter Tab eine Partie an, fragt die Lobby im ersten Tab trotzdem nach, bevor sie sie überschreibt.
art: manuell
regression: nein
prioritaet: niedrig
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: ja
aenderung: task/O2-app-rahmen-lobby (PR #29)
grenzfall_von: TF-APP-003
---

## Worum es geht

Die Lobby liest den Spielstand nur beim Öffnen. Ist sie in einem Tab offen, während ein anderer Tab eine Partie anlegt, weiss sie davon nichts. Ob die Rückfrage aus Kriterium 2 auch dann gelten muss, ist offen.

## Bestanden, wenn

Nach „Neue Partie“ im ersten Tab erscheint die Rückfrage, und die Partie des zweiten Tabs bleibt bis zur Bestätigung erhalten.

## Fehlgeschlagen, wenn

Der erste Tab wechselt ohne Rückfrage auf `/spiel` und überschreibt die Partie des zweiten Tabs.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Produktionsbuild auf Port 4173, Local Storage leer |

## Testdaten

Tab A: Lobby ohne Partie. Tab B: 3 Gegner.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Tab A | `http://localhost:4173/` öffnen | | Lobby ohne „Laufende Partie“ |
| 2 | Tab B | dieselbe Adresse öffnen, „3 Gegner“, „Neue Partie“ | | `/spiel` mit „Gegner 3“ |
| 3 | Tab A | ohne Neuladen „Neue Partie“ | | Rückfrage oder Wechsel auf `/spiel` |

## Zurücksetzen

Local Storage löschen.
