---
id: TF-SPEC-005
titel: npm run abgleich:website lädt https://schlangentanz.ch/rules und meldet, welche Zeilen der Website in Teil A stehen.
art: automatisch
regression: ja
prioritaet: mittel
herkunft: nachtrag
angelegt: 2026-11-13
veraendert_daten: nein
skript: scripts/website_abgleich/abgleich.cjs
---

## Worum es geht

Die Website ist die einzige Regelquelle; der Abgleich zeigt, ob Teil A sie vollständig spiegelt. P0.5 Kriterium 2 verlangt nach der Website-Änderung volle Abdeckung.

## Bestanden, wenn

Der Befehl endet mit Exit 0 und meldet die Abdeckung der Website-Zeilen in Teil A.

## Fehlgeschlagen, wenn

Der Befehl meldet fehlende Zeilen oder bricht ab.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Arbeitskopie, Netzzugang zu schlangentanz.ch, Playwright-Chromium installiert |

## Testdaten

Live-Seite `https://schlangentanz.ch/rules` und `docs/GAME_SPEC.md` Teil A des geprüften Commits.

## Technische Prüfung

`npm run abgleich:website; echo $?` im Repo. Bricht er mit „FEHLER beim Laden der Website: page.waitForFunction: Timeout 20000ms exceeded“ ab, mit einem kleinen Playwright-Skript prüfen, ob `#root` nach dem Laden Text enthält, und die Seite im eingebauten Browser gegenprüfen.

## Nicht abgedeckte Grenzfälle

Website nicht erreichbar oder geändert, während Teil A unverändert ist: deckt der Abgleich selbst ab, kein eigener Testfall.
