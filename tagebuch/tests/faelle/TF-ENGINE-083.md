---
id: TF-ENGINE-083
titel: Der Schlangenkorb des Glücks spielt seine vier Boni nach A7.10 und D42 bis D47 und kommt danach aus dem Spiel.
art: beides
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-24
veraendert_daten: nein
skript: src/engine/__tests__/regeln/A7.10_schlangenkorb.test.ts
aenderung: task/X6-schlangenkorb (PR #116)
---

## Worum es geht

Der Korb liegt nur mit Erweiterung einmal im Spiel. Wer ihn spielt, wählt einen von vier Boni: drei Karten ziehen und bis zu zwei davon zusätzlich spielen, bis zu zwei Farbkarten der eigenen Schlange gegen Handkarten tauschen, eine Sonderkarte entfernen oder zwei zusätzliche Aktionen. Danach liegt er aus dem Spiel und auf keinem Ablagestapel. Dazu gehören die Antworten des Autors vom 24.11.2026: abgeworfen kommt er auf den Ablagestapel, getauscht wird mindestens eine Karte, nach „Ziehe 3“ dürfen alle drei gezogenen Karten gespielt werden.

## Bestanden, wenn

Die fünf Regeltestdateien sind grün, und die eigenen Proben liefern: leerer und dreifacher Tausch abgelehnt, drei gezogene Farbkarten gespielt (`gespielteFarbkarten` 3), ein als Überzahl oder über „Zwei abwerfen, drei ziehen“ abgeworfener Korb liegt auf dem Ablagestapel, nach „aktionen“ lassen sich zwei Farbenschutz wirkungslos ablegen, mit nur dem Korb auf der Hand gibt es kein wirkungsloses Ablegen.

## Fehlgeschlagen, wenn

Ein Regeltest ist rot, oder eine der Proben zeigt einen anderen Wert, etwa einen angenommenen leeren Tausch oder einen Korb auf einem Ablagestapel nach seiner Nutzung.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Repo auf 14eaa6cb (`task/X6-schlangenkorb`) |

## Testdaten

Stellungen aus dem Baukasten mit zwei Spielern und Erweiterung; Spieler 1 hält den Korb, dazu je nach Probe Gelb, Grün, Violett und die Schlange Blau, Rot, Blau.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Konsole | Regeltests ausführen | `npx vitest run src/engine/__tests__/regeln/A7.10_` | 5 Dateien grün |
| 2 | `src/engine/__tests__/regeln/` | Probendatei anlegen (Beleg nennt jede Probe) | `zz_pruefer_x6.test.ts` | Datei vorhanden |
| 3 | Konsole | Proben ausführen | `npx vitest run src/engine/__tests__/regeln/zz_pruefer_x6.test.ts --reporter=verbose` | Zeilen „PROBE“ mit den Werten unter „Bestanden, wenn“ |
| 4 | Konsole | Probendatei löschen | | `git status` leer |

## Technische Prüfung

Zum Skript gehören die vier Dateien `A7.10_korb_ziehen`, `A7.10_korb_tauschen`, `A7.10_korb_entfernen` und `A7.10_korb_aktionen` im selben Ordner. `pruefeAktion` mit `bonus: { art: 'tauschen', tausch: [] }` liefert `{ erlaubt: false, grund: 'Ungültige Aktion SchlangenkorbSpielen: Feld bonus ist ungültig.' }`.

## Nicht abgedeckte Grenzfälle

Risiko-Karten neben dem Korb (D47 „Risiko-Karten zählen nicht dazu“) lassen sich erst nach dem Merge mit X5 prüfen. Die Bedienung durch den Menschen unter `/spiel` kommt mit O10.
