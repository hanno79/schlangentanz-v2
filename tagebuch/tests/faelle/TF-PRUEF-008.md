---
id: TF-PRUEF-008
titel: Die Playwright-Projekte desktop, tablet und handy messen 1280×900, 1024×768 und 390×844, mit pointer coarse nur bei Tablet und Handy.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
aenderung: task/P0.3-pruefwerkzeuge (PR #26)
grenzfall_von: TF-PRUEF-007
status: stillgelegt
---

## Worum es geht

Heute laufen alle Layout-Verträge nur in `desktop`; die Projekte `tablet` und `handy` haben 0 Tests. Ob sie wirklich das richtige Gerät liefern, zeigt erst ein Vertrag, der dort läuft.

Stillgelegt mit P0.3c: Die Projekte heissen jetzt `tablet-quer` und `handy-hochkant`, dazu kommen `tablet-hochkant` und `handy-quer`. Dieselbe Messung macht seither der feste Vertrag `tests/layout/geraeteklasse.spec.ts` in allen fünf Klassen (TF-PRUEF-019).

## Bestanden, wenn

Eine vorübergehende Spec misst in jedem der drei Projekte `innerWidth`, `innerHeight`, `(pointer: coarse)` und `devicePixelRatio` und findet desktop 1280/900/nein/1, tablet 1024/768/ja/1, handy 390/844/ja/1; `npx playwright test <spec>` endet mit Exit 0, 3 passed.

## Fehlgeschlagen, wenn

Ein Wert weicht ab oder der Lauf endet nicht mit 0.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Arbeitskopie auf dem zu prüfenden Commit, Ports 4173 und 4174 frei |

## Testdaten

`tests/layout/pruefer_geraet.spec.ts`, die die vier Werte mit `page.evaluate` liest und je Projekt mit der erwarteten Klasse vergleicht.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Git Bash im Repo | Ports prüfen | `netstat -ano \| grep -E ':417[34] '` | ohne LISTEN |
| 2 | Editor | Spec aus „Testdaten“ anlegen | | |
| 3 | Git Bash im Repo | Spec ausführen | `npx playwright test tests/layout/pruefer_geraet.spec.ts; echo $?` | Exit 0, 3 passed, Werte wie oben |
| 4 | dieselbe Konsole | Spec löschen | `rm tests/layout/pruefer_geraet.spec.ts` | `git status --short` leer, Ports frei |
