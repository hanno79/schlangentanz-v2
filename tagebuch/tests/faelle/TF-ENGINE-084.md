---
id: TF-ENGINE-084
titel: Verfälscht man den Schlangenkorb, schlagen seine Tests an, und die mit ihm gezogenen oder zurückgetauschten Karten bleiben dem Gegner verborgen.
art: manuell
regression: nein
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-24
veraendert_daten: nein
aenderung: task/X6-schlangenkorb (PR #116)
---

## Worum es geht

Gegenproben zeigen, ob die Tests eine falsche Regel bemerken. Störproben zeigen, ob ein Gegner nach „Ziehe 3“ oder nach dem Zurücktauschen einer gelegten Karte eine Handkarte erkennen kann (B2).

## Bestanden, wenn

Gegenprobe 1 (der Korb landet wirkungslos auf dem Ablagestapel) macht 2 Tests rot, Gegenprobe 2 (`ZIEHEN = 2`) macht 4 Tests rot. Die KI-Sicht des Gegners ist für zwei Stapel mit verschiedenen obersten Karten gleich und enthält keine gezogene Id, auch nicht die Id einer zurückgetauschten Karte.

## Fehlgeschlagen, wenn

Eine der beiden Gegenproben bleibt grün, oder die Sicht des Gegners unterscheidet sich zwischen den Stapeln oder nennt eine Handkarte.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Repo auf 14eaa6cb |

## Testdaten

Stapel oben Rot, Gelb, Grün gegen Rot, Braun, Schlangenblockade; Spieler 1 hält Korb und Blau.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | `src/engine/zugablauf.ts`, `legeOhneWirkungAb` | Namen des Korbs in der Bedingung verfälschen | `Schlangenkorb des GlückX` | Datei geändert |
| 2 | Konsole | Korb-Tests ausführen | `npx vitest run src/engine/__tests__/regeln/A7.10_` | 2 rot (D45/D10 abgewehrt, D13/D54 wirkungslos) |
| 3 | Konsole | zurücksetzen | `git checkout -- src/engine/zugablauf.ts` | `git status` leer |
| 4 | `src/engine/karten/schlangenkorb.ts` | Konstante ändern | `const ZIEHEN = 2;` | Datei geändert |
| 5 | Konsole | Korb-Tests ausführen | wie Schritt 2 | 4 rot in `A7.10_korb_ziehen.test.ts` |
| 6 | Konsole | zurücksetzen | `git checkout -- src/engine/karten/schlangenkorb.ts` | `git status` leer |
| 7 | Probendatei aus TF-ENGINE-083 | Störproben ausführen | `-t B2` | beide B2-Proben grün |

## Nicht abgedeckte Grenzfälle

Die Grenze „ein bis zwei Tausche“ in `aktionen/pruefen.ts` hält kein Test fest; eine dritte Gegenprobe dort bleibt grün (Prüfprotokoll X6, Hinweis 2).
