---
id: TF-KI-040
titel: Mit Erweiterung hängt die Wahl der soliden KI nicht von fremden Händen, der Stapelreihenfolge oder fremden geheimen Aufgaben ab, und ein eingebautes Leck macht die Tests rot.
art: automatisch
regression: nein
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-27
veraendert_daten: nein
skript: src/ki/strategien/solideKi_erweiterung_suche.test.ts
aenderung: task/K4-ki-erweiterung (PR #125)
---

## Worum es geht

K4 lässt die KI Risiko-Karten und verdecktes Ziehen über die Karten schätzen, die sie nicht sieht. Dafür liest der Rahmen in `src/ki/sicht.ts` die ungesehenen Karten aus dem erratenen Zustand. Geprüft wird zweierlei: Mischt man das Verdeckte neu, bleibt die Wahl gleich. Und gibt man der KI absichtlich die echte Reihenfolge des Verdeckten preis, schlagen die Tests der Suite an.

## Bestanden, wenn

In den Stellungen der Probe aus TF-KI-039 ändert das Neumischen fast jede Stellung, und keine einzige Wahl weicht ab. Wird in `Stellung.ungesehen()` die Ordnung nach Id entfernt, wird mindestens ein Test zu K2.7 oder K4 rot; nach dem Zurücksetzen ist `git status` leer.

## Fehlgeschlagen, wenn

Eine Wahl ändert sich nach dem Neumischen, oder das eingebaute Leck bleibt in allen Tests grün.

## Vorbedingungen

| Was | Wert |
|---|---|
| Ausgangslage | Worktree auf dem geprüften Stand von `task/K4-ki-erweiterung`, `npm ci` gelaufen |

## Testdaten

Bis zu 400 Stellungen aus den 18 Partien von TF-KI-039, jede fünfte Entscheidung der soliden KI mit mehr als einer Aktion; Mischzufall `erzeugeZufall(31'000 + n)`.

## Technische Prüfung

Teil 1 läuft in der Probe `zz_pruefer_k4.test.ts` mit (Feld `k27`). Teil 2: in `src/ki/sicht.ts`, Funktion `stellung`, bei `ungesehen` den Aufruf `.sort((a, b) => (a.id < b.id ? -1 : 1))` entfernen, dann `npx vitest run src/ki/sicht_erweiterung.test.ts src/ki/strategien/solideKi_erweiterung_suche.test.ts src/ki/strategien/solideKi_erweiterung_wahl.test.ts` ausführen, danach `git checkout -- src/ki/sicht.ts`.

## Nicht abgedeckte Grenzfälle

Ein Leck über die Partiesaat (U5, bekannte Grenze 1) lässt sich mit Neumischen nicht finden; dafür bleibt das Review der Strategien.
