---
id: TF-PRUEF-031
titel: Eine Strategie, die der Architekturtest durchlässt, kommt auch zur Laufzeit nicht an fremde Hände oder an die Reihenfolge des Stapels.
art: manuell
regression: nein
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
aenderung: task/P0.3d-ki-grenze (PR #55)
grenzfall_von: TF-PRUEF-028
---

## Worum es geht

Seit P0.3d bekommt eine Strategie unter `src/ki/strategien/` nur Sicht, Aktionen und Zufall. Der Architekturtest prüft den Quelltext. Dieser Testfall prüft die Partie selbst: Er lässt Angriffsstrategien, die ohne Meldung und ohne Typfehler durchgehen, im echten Turnier spielen und vergleicht, was sie über fremde Hände zu wissen glauben, mit dem tatsächlichen Zustand.

## Bestanden, wenn

Jede Angriffsstrategie, die fremde Hände kennt, bekommt im Architekturtest eine Meldung. Bleibt eine ohne Meldung, nennt sie im Lauf keine fremde Handkarte öfter richtig, als Raten erlaubt: Seher und Handseher finden die Saat nicht, die Kollusions-Strategie kennt keine Handkarte des anderen Sitzes.

## Fehlgeschlagen, wenn

Eine Angriffsstrategie bleibt im Architekturtest ohne Meldung und nennt im Lauf die fremde Starthand vollständig richtig (etwa bei Saat 1 `blau-08, gruen-08, verdoppler-04, gruen-03, violett-06` für KI-Gegner 1) oder trifft fremde Handkarten in Serie.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Repo-Stand ab `task/P0.3d-ki-grenze`, `npm ci` gelaufen |
| Ausgangslage | `git status` leer |

## Testdaten

Drei Angriffsstrategien und eine Probe-Testdatei aus dem Prüfprotokoll P0.3d, Iteration 2: `zz_s10_seher.ts` (bestimmt die Partiesaat aus dem ersten eigenen Zufallswert und mischt den Stapel nach), `zz_s13_handseher.ts` (bestimmt die Saat aus der eigenen Starthand), `zz_s11_kollusion.ts` (zwei Instanzen teilen ihre Hände über eine `Map` auf Modulebene) und `tests/zz_pruef.test.ts`. Turnier mit Saaten 1 bis 4 (zwei Spieler) und 101 bis 103 (drei Spieler), ohne Erweiterung.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Konsole im Repo | Angriffsstrategien nach `src/ki/strategien/` und die Probe nach `tests/` kopieren | | `git status` zeigt nur die neuen Dateien |
| 2 | Konsole im Repo | Architekturtest laufen lassen | `npx vitest run tests/architektur.test.ts tests/architektur_ki.test.ts` | Exit 0 heisst: die Angriffe bleiben ohne Meldung |
| 3 | Konsole im Repo | Typprüfung der App | `npx tsc -p tsconfig.app.json --noEmit` | Exit 0 |
| 4 | Konsole im Repo | Probe laufen lassen | `npx vitest run tests/zz_pruef.test.ts --silent=false --reporter=verbose` | Zeilen `SEHER`, `HANDSEHER` und `KOLLUSION`: erkannte Saat und Hände gegen die echten |
| 5 | Konsole im Repo | Dateien wieder löschen | | `git status` leer |

## Nicht abgedeckte Grenzfälle

Partien mit Erweiterung und mit vier Spielern sind nicht eigens geprüft; der Seher mischt dort denselben Stapel, nur länger. Eine Strategie, die die Engine vollständig nachbaut und den ganzen Partieverlauf mitrechnet, ist nicht gebaut; die Starthand genügt als Beleg.
