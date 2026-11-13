---
id: TF-APP-004
titel: Vor, Zurück, Neuladen und direkter Aufruf zeigen zu jeder Adresse die richtige Seite.
art: beides
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: ja
skript: tests/layout/navigation.spec.ts
aenderung: task/O2-app-rahmen-lobby (PR #29)
---

## Worum es geht

Die App wechselt die Seiten ohne Neuladen. Die Knöpfe Vor und Zurück des Browsers, das Neuladen und ein Lesezeichen müssen trotzdem genau die Seite zeigen, die zur Adresse gehört (Plan O2, Kriterium 3).

## Bestanden, wenn

Zurück von `/spiel` zeigt die Lobby, Vor wieder `/spiel`. Der Verweis „Regeln“ führt auf `/regeln`, „Zurück zur Lobby“ auf `/`, zweimal Browser-Zurück danach auf `/regeln` und `/`. Direkt aufgerufen und neu geladen zeigen `/` die Lobby, `/spiel` und `/spiel/` „Spieltisch im Aufbau“, `/regeln` „Regeln“, `/unbekannt` und im Produktionsbuild `/dev` „Diese Seite gibt es nicht“. Der Fenstertitel passt jeweils zur Seite.

## Fehlgeschlagen, wenn

Nach Vor oder Zurück zeigt die Seite einen anderen Inhalt als die Adresse, ein Neuladen ergibt eine Fehlerseite des Servers oder eine leere Seite.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Produktionsbuild auf Port 4173 |

## Testdaten

Adressen `/`, `/spiel`, `/spiel/`, `/regeln`, `/unbekannt`, `/dev`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Lobby | „Neue Partie“ | | `/spiel` |
| 2 | Browser | Zurück, dann Vor, dann Zurück | | Lobby, Spieltisch, Lobby |
| 3 | Lobby | Verweis „Regeln“, dann „Zurück zur Lobby“ | | `/regeln`, dann `/` |
| 4 | Browser | zweimal Zurück | | `/regeln`, dann `/` |
| 5 | Browser | jede Adresse der Testdaten eintippen und danach F5 | | Inhalt wie unter „Bestanden, wenn“ |

## Zurücksetzen

Local Storage löschen.

## Nicht abgedeckte Grenzfälle

Die Umschreibung auf Vercel (`vercel.json`) ist nicht im Browser geprüft: Die Vercel-Vorschau verlangt eine Anmeldung.
