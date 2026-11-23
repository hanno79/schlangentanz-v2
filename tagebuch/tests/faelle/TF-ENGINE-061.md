---
id: TF-ENGINE-061
titel: Mit zufällig gewählten Aktionen liefert die Engine nach X3 je Schritt dieselben Aktionen, Ereignisse und Spielstände wie vor X3, ohne die neuen X3-Felder.
art: manuell
regression: nein
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-23
veraendert_daten: nein
aenderung: task/X3-zusatzaktionen (PR #108)
---

## Worum es geht

X3 verlegt die Zuggrenzen von Verdoppler und Farbenfusion in einen Rahmen und prüft die Schlussrunde nach jeder Aktion. Das Basis-Spiel darf sich dadurch nicht ändern. Die Probe spielt Partien mit eigenen Saaten vor und nach X3 und vergleicht eine Prüfsumme.

## Bestanden, wenn

Die SHA-256-Summen über 120 Partien ohne und 60 mit Erweiterung (Zufallswahl) und 30 Partien mit der Zufalls-KI sind auf der Merge-Basis 589e2a7 und auf 686159e gleich, mit gleicher Schrittzahl (21'625, 11'148, 5'387).

## Fehlgeschlagen, wenn

Eine Summe oder eine Schrittzahl weicht ab.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Repo, einmal auf 589e2a7 und einmal auf 686159e ausgecheckt |

## Testdaten

Saaten 70001–70120 (ohne), 71001–71060 (mit), 72001–72030 (Zufalls-KI), Spielerzahl reihum 2, 3, 4; Wahl-Zufall mit Saat × 7 + 3.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Repo | Probedatei aus dem Beleg als `src/engine/__tests__/x3_pruefer_probe.test.ts` ablegen |  | Datei liegt neben den anderen Engine-Tests |
| 2 | Konsole | auf 589e2a7 wechseln und ausführen | `git switch --detach 589e2a72`, dann `X3_PROBE_AUS=<ordner>/basis.txt npx vitest run src/engine/__tests__/x3_pruefer_probe.test.ts` | Exit-Code 0, fünf Zeilen mit Partien, Schritten und Summe |
| 3 | Konsole | auf 686159e wechseln und dasselbe ausführen | `git switch pruefung-X3`, Ausgabe nach `<ordner>/x3.txt` | Exit-Code 0 |
| 4 | Konsole | die ersten drei Zeilen beider Dateien vergleichen |  | Schritte und Summe gleich: 21'625, 11'148, 5'387 |
| 5 | Repo | Probedatei löschen |  | `git status` ist leer |

## Technische Prüfung

Eine Vitest-Datei unter `src/engine/__tests__/` spielt jede Partie mit `erstellePartie`, `ermittleAktionen` und `anwendeAktion` und füttert je Schritt die Aktionsliste, die Ereignisse und `serialisiere(zustand)` ohne `entscheidung`, `aufgedeckt`, `zug.zusatzaktionen`, `zug.verwendet` und `zug.runde` in einen SHA-256. Die Datei liegt nur während der Probe im Repo und wird danach gelöscht; ihr Inhalt steht im Beleg des Laufs.

## Nicht abgedeckte Grenzfälle

Die solide KI prüft TF-KI-022, weil sie zusätzlich die Sicht und die Zugsuche benutzt.
