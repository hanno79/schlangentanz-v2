---
id: TF-KI-024
titel: Die Gleichstandsregel aus K2b ändert die Wahl der soliden KI nur dort, wo zwei durchgerechnete Pläne gleich bewertet sind, und hält die Suchgrenzen ein.
art: manuell
regression: nein
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-24
veraendert_daten: nein
aenderung: task/K2b-gleichstand (PR #118)
---

## Worum es geht

K2b ordnet gleich bewertete Pläne neu: zuerst nach der Zahl der eigenen Gruppen, dann nach den sicheren Punkten. Die Probe lässt an denselben Stellungen mit derselben KI-Saat die alte Zugsuche (Stand `origin/neuaufbau`) und die neue wählen und schaut sich jede Abweichung an. Nebenbei misst sie, wie viele Stellungen die Suche je Schritt durchrechnet und wie lange ein Schritt dauert.

## Bestanden, wenn

Ohne Erweiterung wählen alt und neu in jeder Stellung gleich. Jede Abweichung, auch mit Erweiterung, ist ein Gleichstand: Die Bewertungen der beiden Pläne liegen höchstens 1e-9 auseinander, und der neue Plan hat mehr Gruppen oder bei gleich vielen Gruppen mehr sichere Punkte. Die Suche rechnet je Schritt höchstens 64 Stellungen durch, die Vorauswahl bewertet nie mehr Aktionen als angeboten, kein Schritt dauert 500 ms oder länger, und ohne Erweiterung sind `sichtbarePunkte` und `eigenePunkte` überall gleich.

## Fehlgeschlagen, wenn

Ohne Erweiterung wählt die neue KI auch nur einmal anders, eine Abweichung hat Bewertungen, die mehr als 1e-9 auseinanderliegen, die Suche rechnet mehr als 64 Stellungen durch oder ein Schritt dauert 500 ms oder mehr.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Repo auf dem Stand des Task-Branches, dazu `zugsuche.ts` aus `origin/neuaufbau` als Abschrift |

## Testdaten

30 Partien ohne Erweiterung (Saat 31000 bis 31029) und 12 mit Erweiterung (Saat 31000 bis 31011), 2 bis 4 Spieler im Wechsel, die solide KI an Stelle 0, in jeder vierten Partie an allen Stellen; je Stellung KI-Saat 77 plus Nummer der Entscheidung.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Repo | alte Zugsuche ablegen | `git show origin/neuaufbau:src/ki/strategien/zugsuche.ts > src/ki/strategien/zz_alt_zugsuche.ts` | Datei liegt neben `zugsuche.ts` |
| 2 | Repo | Probe und Messkopie aus den Belegen als `src/ki/strategien/zz_pruefer_k2b.test.ts` und `zz_instr_zugsuche.ts` ablegen |  | drei neue Dateien unter `src/ki/strategien/` |
| 3 | Konsole | Probe ausführen | `K2B_AUS=<ordner> npx vitest run src/ki/strategien/zz_pruefer_k2b.test.ts -t "Wahl"` | Exit 0, in `<ordner>/wahl.json` ohne Erweiterung `abweichend: 0` |
| 4 | Datei `wahl.json` | Abweichungen mit Erweiterung lesen |  | je Eintrag `dw` höchstens 1e-9, gleiche `gruppen`, beim neuen Plan mehr `punkte` |
| 5 | Datei `wahl.json` | Grenzen lesen |  | `maxSuche` höchstens 64, `maxMs` unter 500, `vorauswahlUeber` 0, `sichtbarUngleich` 0 |
| 6 | Repo | die drei Dateien löschen |  | `git status` leer |

## Nicht abgedeckte Grenzfälle

Partien mit Erweiterung zu viert sind nur in wenigen Saaten dabei; dass die KI Aufgaben gezielt verfolgt, ist nicht K2b, sondern K4.
