---
id: TF-KI-039
titel: Auf Saaten, die die Testsuite nicht kennt, erfüllt die solide KI erreichbare Aufgaben, setzt Erweiterungskarten nicht ohne Nutzen ein und bildet mit Häutungen neue Gruppen.
art: automatisch
regression: nein
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-27
veraendert_daten: nein
skript: src/ki/strategien/solideKi_erweiterung_partien.test.ts
aenderung: task/K4-ki-erweiterung (PR #125)
---

## Worum es geht

Die Partietests der Suite prüfen K4 auf zwölf festen Saaten gegen Zufalls-KIs. Der Testfall zählt dieselben drei Kriterien unabhängig nach, auf 18 anderen Saaten und auch mit der soliden KI an allen Sitzen. Gezählt wird streng nach dem Wortlaut: Hält die KI zu Beginn ihres Zuges eine Karte, die eine freie Aufgabe sofort erfüllt, muss die Aufgabe bis zum Zugende an sie gehen.

## Bestanden, wenn

Alle 18 Partien enden. Die KI erfüllt in jedem Zug mit einer solchen Karte eine Aufgabe, oder jede Ausnahme ist begründet (Abwehr durch einen Gegner, Aufgabe nur mit einer Karte erreichbar, die sie im selben Zug nicht legen darf). Comeback, Risiko-Karte und Korb setzt sie im ersten Zug nur ein, wenn der Zug dadurch besser wird. Mehr als die Hälfte ihrer Häutungen in eigenen Schlangen bildet eine neue Gruppe, und keine zerstört eine, ohne eine Aufgabe zu bringen.

## Fehlgeschlagen, wenn

Sie lässt eine Aufgabe, die eine Handkarte sofort erfüllte, ohne Grund liegen, sie verbraucht Erweiterungskarten im ersten Zug ohne Nutzen, oder ihre Häutungen bilden keine neuen Gruppen.

## Vorbedingungen

| Was | Wert |
|---|---|
| Ausgangslage | Worktree auf dem geprüften Stand von `task/K4-ki-erweiterung`, `npm ci` gelaufen |

## Testdaten

18 Partien mit Erweiterung, Saat 77'100 bis 77'117, Spielerzahl 2 + (Nummer mod 3). Bei gerader Nummer die solide KI an allen Sitzen, sonst nur an Sitz 0 gegen Zufalls-KIs. KI-Zufall `erzeugeZufall(Saat × 7 + Sitz)`.

## Technische Prüfung

Die Probe `zz_pruefer_k4.test.ts` aus dem Beleg nach `src/ki/strategien/` legen und mit `npx vitest run src/ki/strategien/zz_pruefer_k4.test.ts` ausführen; danach wieder löschen. Sie schreibt ihre Zählung als JSON in die Datei aus `K4_PROBE_AUSGABE`.

## Nicht abgedeckte Grenzfälle

Wie gut die Risiko-Karten im Erwartungswert gewählt sind, lässt sich an einzelnen Partien nicht messen, weil die aufgedeckte Karte zufällig ist; dafür steht der Stärkenachweis K5 mit Erweiterung.
