---
id: TF-SPEC-002
titel: docs/REGELFRAGEN.md und Teil D sind in der GitHub-Ansicht ohne waagrechtes Scrollen lesbar, und die offenen G-Fragen lassen sich nach der Anleitung beantworten.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
aenderung: task/P0.5-regelfragen (PR #25)
---

## Worum es geht

Der Autor liest und beantwortet die Regelfragen in der GitHub-Ansicht. Sind Tabellen abgeschnitten oder die Anleitung unklar, kommen falsche oder unvollständige Antworten zurück.

## Bestanden, wenn

Bei 1280×900 zeigt die Seite keinen waagrechten Scrollbalken (`scrollWidth` gleich `clientWidth`), die Übersichtstabelle hat 39 Datenzeilen (F1–F15, F8a, G1–G23) mit gefüllter Spalte „Vorschlag“, jede G-Frage zeigt Frage, Fundstelle mit Zitat, Möglichkeiten mit Folge, „Vorschlag des Orchestrators“ sowie „Antwort: —“ und „Datum: —“, und die Teil-D-Tabelle in `GAME_SPEC.md` zeigt D14–D29 mit Datum 13.11.2026.

## Fehlgeschlagen, wenn

Eine Tabelle ist breiter als der Inhaltsbereich, Zellen sind abgeschnitten, oder eine G-Frage hat kein Antwortfeld.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | `https://github.com/hanno79/schlangentanz-v2/blob/task/P0.5-regelfragen/docs/REGELFRAGEN.md` und `…/docs/GAME_SPEC.md` |

## Testdaten

Branch `task/P0.5-regelfragen`; Abschnitte „Übersicht“, „F8a“ und „G14“ in `REGELFRAGEN.md`, Tabelle „Beantwortet“ in `GAME_SPEC.md`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser, 1280×900 | REGELFRAGEN.md öffnen, Vorschau | | Abschnitte „So antwortest du“ und „Übersicht“ oben |
| 2 | dieselbe Seite | zur Übersicht, zu F8a und zu G14 scrollen | | Tabelle ohne waagrechten Scrollbalken; G14 mit Möglichkeiten a–g und Antwort „—“ |
| 3 | Browser | GAME_SPEC.md öffnen, zu „Beantwortet“ scrollen | | D14–D29 mit Spalten Nr., Frage, Antwort, Folge, Datum lesbar |

## Nicht abgedeckte Grenzfälle

Handy- und Tablet-Breite: nicht geprüft, weil der Autor die Fragen am Rechner beantwortet; die Tabellen brechen in der GitHub-Ansicht um und würden schmaler nur länger.
