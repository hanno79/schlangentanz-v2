---
id: TF-REGELN-001
titel: /regeln verweist auf die Spielanleitung der Website und fasst einen Zug in fünf Schritten zusammen, in allen fünf Geräteklassen ohne waagrechtes Scrollen.
art: manuell
regression: nein
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
aenderung: task/O9-regelhilfe (PR #37)
---

## Worum es geht

Die Regelseite soll Spielern einen Zug kurz erklären und für alles Weitere auf die Website verweisen, denn nur die Website ist verbindlich. Sätze, die der Autor entschieden hat und die noch nicht auf der Website stehen, müssen als solche erkennbar sein.

## Bestanden, wenn

Der Knopf „Spielregeln auf schlangentanz.ch“ führt zu https://schlangentanz.ch/rules. Unter „Ein Zug in fünf Schritten“ stehen genau fünf nummerierte Schritte, „Aufgabe erfüllen“ trägt „Nur mit Erweiterung“, und jeder Satz aus Teil D trägt das Etikett „Ergänzung des Autors“. In jeder Klasse gilt scrollWidth gleich clientWidth, und die Konsole zeigt keinen Fehler.

## Fehlgeschlagen, wenn

Der Verweis fehlt oder zeigt woandershin, es sind mehr oder weniger als fünf Schritte, ein Satz aus Teil D steht ohne Etikett da, oder die Seite ist breiter als das Fenster.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Produktionsbuild (`npm run build`, `vite preview`), Playwright Chromium, Touch in den vier Touch-Klassen |

## Testdaten

Die fünf Geräteklassen aus `scripts/pruefung/geraeteklassen.mjs`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser | `/regeln` öffnen | | Titel „Regeln · Schlangentanz“, Knopf „Spielregeln auf schlangentanz.ch“ |
| 2 | Abschnitt „Ein Zug in fünf Schritten“ | lesen | | fünf Schritte, Etiketten „Ergänzung des Autors“ und „Nur mit Erweiterung“ |
| 3 | Konsole | `document.documentElement.scrollWidth` und `clientWidth` vergleichen | | gleich gross |

## Nicht abgedeckte Grenzfälle

Ob jeder Satz wörtlich in Teil A oder D steht, prüft `src/ui/regeln/zugschritte.test.ts` automatisch; dafür gibt es keinen eigenen Testfall.
