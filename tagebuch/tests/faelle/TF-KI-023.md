---
id: TF-KI-023
titel: Die mit X4 erweiterte Ausnahme in K3.2 greift nur in Partien mit Erweiterung, und nur dort, wo die Stellung selbst keine Comeback-Aktion enthält.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-24
veraendert_daten: nein
aenderung: task/X4-comeback (PR #111)
---

## Worum es geht

X4 hat im Test K3.2 die Ausnahme „nachweislich besser bewertet“ für Partien mit Erweiterung gelockert: Es genügt dort auch die Bewertung nach der besten zweiten Karte. Die Probe zählt, welche Fälle die alte Ausnahme nicht mehr trägt und ob Partien ohne Erweiterung unverändert sind.

## Bestanden, wenn

Ohne Erweiterung sind die Ausnahmen auf `origin/neuaufbau` und auf 9e253382 dieselben (Saat 42000 und 42008, je mit der alten Ausnahme erfüllt). Mit Erweiterung trägt die alte Ausnahme genau einen Fall nicht (Saat 42013, Farbendieb, Bewertung −6.55 gegen −5.85, nach der besten zweiten Karte −5.35 gegen −5.45), in dieser Stellung gibt es weder eine Zusatzaktion noch eine Comeback-Aktion, und die Ausnahmen bleiben unter der Grenze von 20 Prozent (6 von 39, Grenze 7).

## Fehlgeschlagen, wenn

Ein Fall ohne Erweiterung braucht die neue Ausnahme, mehr als ein Fall mit Erweiterung braucht sie, oder die Stellung des Falls enthält eine Comeback-Aktion.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Repo, einmal auf 9e253382 und einmal auf `origin/neuaufbau` (4eedf334) |

## Testdaten

Die 18 Partien aus `partienK3gegenK2(18, 42000)`, wie im Test K3.2.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Repo | Probedatei aus dem Beleg als `src/ki/strategien/x4_pruefer_k3.test.ts` ablegen |  | Datei liegt neben `solideKi_angriff_partien.test.ts` |
| 2 | Konsole | auf 9e253382 ausführen | `X4_K3_ZIEL=<ordner>/x4.txt npx vitest run src/ki/strategien/x4_pruefer_k3.test.ts` | Zeile „saat 42013 … alt ROT“, Schlusszeile „geprueft 39, ausnahmen 6, davon alt ok 5, nur vertieft ok 1“ |
| 3 | Konsole | auf `origin/neuaufbau` dasselbe | `git switch --detach origin/neuaufbau` | „geprueft 40, ausnahmen 4, davon alt ok 4, nur vertieft ok 0“; 42000 und 42008 gleich wie in Schritt 2 |
| 4 | Repo | Datei löschen, zurück auf den Prüfbranch |  | `git status` leer |

## Nicht abgedeckte Grenzfälle

Ob die solide KI die Comeback-Karte klug nutzt, ist K4 (Kriterium 2) und hier nicht geprüft.
