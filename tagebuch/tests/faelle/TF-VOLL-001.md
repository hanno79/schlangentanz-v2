---
id: TF-VOLL-001
titel: Die vier Basis-Vollpartien laufen über echte Klicks von der Lobby bis zur Wertung, ohne Konsolenfehler, ohne fremde Karte im Quelltext und mit der Endwertung der Engine.
art: automatisch
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-27
veraendert_daten: nein
skript: tests/vollpartien/vollpartie.spec.ts
aenderung: task/Z1-vollpartien (PR #123)
---

## Worum es geht

Ein Playwright-Lauf spielt als Mensch ganze Partien im Produktionsbuild: Basis zu zweit (Saat 2026) und zu viert (Saat 13), je auf Desktop 1280×900 und Handy hochkant 390×844 mit Tippen. Nach jedem Schritt prüft er Konsole, Seitenquelltext und die Kette der gespeicherten Stände gegen die Engine, am Ende die angezeigte Wertung.

## Bestanden, wenn

`npm run test:vollpartien` endet mit 0 und meldet 4 passed. Die Läufe berichten zu zweit 186 Schritte (96 von dir) mit „Du 5, KI-Gegner 1 53 (Sieger)“ und zu viert 173 Schritte (43 von dir) mit „Du 3, KI-Gegner 1 16 (Sieger), KI-Gegner 2 6, KI-Gegner 3 16 (Sieger)“, auf Desktop und Handy gleich. Port 4175 lauscht danach nicht mehr.

## Fehlgeschlagen, wenn

Ein Lauf scheitert, etwa mit „Konsolenfehler“, „Verborgene Karten im Seitenquelltext“, „Keine der N Aktionen“ oder einer abweichenden Wertung. Zahlen, die sich ohne Änderung an KI, Tisch oder Engine von den oben genannten unterscheiden, zählen auch als Fehler.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Quellstand ab Commit 2ad2cfde, eigener Produktionsbuild nach `dist-vollpartien` auf Port 4175 |
| Ausgangslage prüfen | `netstat -ano` zeigt auf Port 4175 keinen lauschenden Socket, `Z1_BASIS_URL` ist nicht gesetzt |

## Testdaten

Saaten 2026 (1 Gegner) und 13 (3 Gegner), ohne Erweiterung.

## Technische Prüfung

`npm run test:vollpartien` und für die Endwertungen `npx playwright test --config playwright.vollpartien.config.ts --reporter=json`; die Endwertung steht je Test in der Annotation `Z1`.

## Nicht abgedeckte Grenzfälle

Die vier Läufe mit Erweiterung warten auf O10 und M3. Gegen eine Vercel-Vorschau läuft der Test erst, wenn der Nutzer das Geheimnis angelegt hat (TF-VOLL-005 prüft nur die Konfiguration). Tablet und Handy quer spielt der Lauf nicht; der Plan verlangt Desktop und Handy. Wiederholbarkeit steht in TF-VOLL-002, ein gesetztes `VITE_TEST_HOOKS` in TF-VOLL-004.
