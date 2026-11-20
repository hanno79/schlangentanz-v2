---
id: TF-PRUEF-030
titel: Entfernt man eine Regel aus der KI-Grenze des Architekturtests, wird mindestens ein Test rot.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
aenderung: task/P0.3d-ki-grenze (PR #55)
grenzfall_von: TF-PRUEF-028
---

## Worum es geht

Jede Regel in `tests/architektur_ki_pruefung.ts` soll durch einen eigenen Test belegt sein. Sonst kann sie bei einer späteren Vereinfachung verschwinden, ohne dass es jemand merkt. Geprüft wird an zwei Regeln: der Liste der freigegebenen Engine-Funktionen und dem Verbot geerbter Methoden wie `valueOf` an globalen Objekten.

## Bestanden, wenn

Nimmt man `serialisiere` in `ERLAUBTE_ENGINE_EMPFAENGER` auf, wird „H2: serialisiere aus der Engine“ rot. Streicht man `valueOf` aus `GEERBT_VON_OBJECT`, wird ebenfalls mindestens ein Test in `tests/architektur_ki.test.ts` rot.

## Fehlgeschlagen, wenn

Nach einer der beiden Änderungen enden `npx vitest run tests/architektur.test.ts tests/architektur_ki.test.ts` mit 120 bestandenen Tests.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Repo-Stand ab `task/P0.3d-ki-grenze`, `npm ci` gelaufen |
| Ausgangslage | `git status` leer |

## Testdaten

Änderung 1: in `tests/architektur_ki_pruefung.ts` die Zeile `'serialisiere',` in `ERLAUBTE_ENGINE_EMPFAENGER` ergänzen. Änderung 2: dort `'valueOf', ` aus `GEERBT_VON_OBJECT` löschen.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Editor | Änderung 1 vornehmen | | |
| 2 | Konsole im Repo | Architekturtests laufen lassen | `npx vitest run tests/architektur.test.ts tests/architektur_ki.test.ts` | Exit 1, rot ist „H2: serialisiere aus der Engine“ |
| 3 | Konsole im Repo | zurücksetzen | `git checkout -- tests/architektur_ki_pruefung.ts` | `git status` leer |
| 4 | Editor | Änderung 2 vornehmen | | |
| 5 | Konsole im Repo | Architekturtests laufen lassen | `npx vitest run tests/architektur.test.ts tests/architektur_ki.test.ts` | Exit 1, mindestens ein roter Test |

## Zurücksetzen

`git checkout -- tests/architektur_ki_pruefung.ts`, danach `git status` leer.
