---
id: TF-ENGINE-081
titel: Die Risiko-Karten verhalten sich in sechs Randlagen, die die Regeltests nicht nennen, so wie A8.2, D52 bis D55 und D57 es verlangen.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-24
veraendert_daten: nein
aenderung: task/X5-risiko (PR #117)
grenzfall_von: TF-ENGINE-080
---

## Worum es geht

Sechs Randlagen: Aktion 4 deckt die letzte Stapelkarte auf, einmal mit Erfolg und leerem eigenem Ablagestapel, einmal mit Misserfolg und einem Gegner ohne Ablagestapel. Dazu ein Tausch mit der eben aufgedeckten Karte, Aktion 2 mit nur einem Gegner samt Speichern und Laden, Aktion 3 in der zweiten eigenen Schlange und eine Risiko-Aktion in einer Partie ohne Erweiterung.

## Bestanden, wenn

Alle sechs Fälle der Grenzfall-Datei sind grün. G1: keine Entscheidung, die aufgedeckte Karte liegt auf der Hand, „SchlussrundeBegonnen“ nennt Spieler 1, er kann sie noch legen. G2: Spieler 1 wählt zwischen spieler-2 und spieler-3, der Gewählte bekommt nichts, Spieler 1 ist wieder dran. G3: die aufgedeckte Karte liegt vorn in der Schlange, die ersetzte auf der Hand, kein Gegner sieht ihre Id im Zug. G4: genau eine Gegnerwahl, nach dem Laden dieselben Aktionen, der Gegner nimmt die geplante Karte. G5: „dahinter“ hängt die Karte ans Ende der zweiten Schlange. G6: Ablehnung „nicht in der eigenen Auslage“.

## Fehlgeschlagen, wenn

Einer der sechs Fälle ist rot oder die Engine wirft einen Fehler.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Repo auf dem geprüften Stand von `task/X5-risiko`, `npm ci` gelaufen |

## Testdaten

Tische aus `risikoTisch` (drei Spieler mit Erweiterung, bei G4 zwei); die Grenzfall-Datei liegt dem Lauf als Beleg bei.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Repo | Grenzfall-Datei aus dem Beleg als `src/engine/__tests__/x5_pruefer_grenzfaelle.test.ts` ablegen |  | Datei liegt neben `risiko_hilfen.ts` |
| 2 | Konsole | ausführen | `npx vitest run src/engine/__tests__/x5_pruefer_grenzfaelle.test.ts --reporter=verbose` | 6 Tests bestanden, Exit-Code 0 |
| 3 | Repo | Datei löschen |  | `git status` ist leer |
