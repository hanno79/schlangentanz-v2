---
id: TF-PRUEF-019
titel: npm run test:layout fährt zehn Projekte, und jedes misst auf der Lobby Fenster, Ausrichtung, groben Zeiger und Touch seiner Geräteklasse.
art: automatisch
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
skript: tests/layout/geraeteklasse.spec.ts
aenderung: task/P0.3c-fuenf-geraeteklassen
---

## Worum es geht

Ein Layout-Vertrag misst das Fenster, das ihm das Playwright-Projekt gibt. Läuft das Projekt `handy-quer` ohne Touch oder hochkant, bleiben Verträge grün, die auf dem echten Gerät scheitern. Dieser Vertrag liest deshalb im Browser nach, welches Fenster und welcher Zeiger tatsächlich ankommen.

## Bestanden, wenn

`npx playwright test --list` zeigt die Projekte `desktop`, `tablet-quer`, `tablet-hochkant`, `handy-hochkant`, `handy-quer` und je eines mit `-testhooks`. Der Vertrag „P0.3c: Fenster, Ausrichtung, Zeiger und Touch entsprechen der Geräteklasse des Projekts“ ist in allen fünf Produktionsprojekten grün: `innerWidth`×`innerHeight` gleich dem Fenster der Klasse, `(orientation: portrait)` genau bei Tablet hochkant und Handy hochkant, `(pointer: coarse)` und `maxTouchPoints > 0` genau bei den vier Touch-Klassen, `devicePixelRatio` 1.

## Fehlgeschlagen, wenn

Ein Projekt fehlt, oder der Vertrag ist in einer Klasse rot.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Arbeitskopie auf dem zu prüfenden Commit nach `npm ci` |
| Ausgangslage prüfen | Ports 4173 und 4174 lauschen nicht |

## Testdaten

Keine.

## Technische Prüfung

`npx playwright test tests/layout/geraeteklasse.spec.ts; echo $?` endet mit 0 und „5 passed“. `npx playwright test --list | sed -n 's/^ *\[\([a-z-]*\)\].*/\1/p' | sort | uniq -c` nennt zehn Projekte. `npx vitest run tests/pruefwerkzeuge.test.ts -t "zehnmal"` ist grün.

## Nicht abgedeckte Grenzfälle

Die Testhook-Projekte misst der Vertrag nicht selbst; sie erhalten dieselben Optionen, was der Vitest „je Geräteklasse, also zehnmal …“ an der Konfiguration prüft. Breiten zwischen den Klassen (320, 767 px) gehören in die Grenzfälle eines Oberflächen-Tasks, nicht in diesen Vertrag.
