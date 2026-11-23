---
id: TF-KI-022
titel: Die solide KI spielt nach X3 dieselben Partien wie vor X3, weil X3 nur Felder anfügt, die im Basis-Spiel nichts entscheiden.
art: manuell
regression: nein
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-23
veraendert_daten: nein
aenderung: task/X3-zusatzaktionen (PR #108)
---

## Worum es geht

X3 soll das Basis-Spiel nicht ändern, auch nicht das Verhalten der soliden KI aus K2. Die KI liest den Zug aus ihrer Sicht, und der Zug hat seit X3 neue Felder. Die Probe spielt dieselben Partien vor und nach X3 und vergleicht jede Wahl.

## Bestanden, wenn

Über 12 Partien ohne und 6 mit Erweiterung (Saaten 73001–73012 und 74001–74006, KI-Saat × 13 + 5) sind Schrittzahl und SHA-256 über Sicht, Aktionen, Ereignisse und Spielstand auf 589e2a7 und 686159e gleich.

## Fehlgeschlagen, wenn

Schrittzahl oder Summe weichen ab, also wählt die KI in mindestens einem Schritt anders.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Repo, einmal auf 589e2a7 und einmal auf 686159e ausgecheckt |

## Testdaten

Saaten wie oben; Strategie `solideKi` aus `src/ki/strategien/index.ts`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Repo und Konsole | wie TF-ENGINE-066, Schritte 1 bis 3 |  | Dateien `basis.txt` und `x3.txt` |
| 2 | Konsole | die Zeilen „solideKi ohne Erweiterung“ und „solideKi mit Erweiterung“ vergleichen |  | Schritte und Summe gleich |
| 3 | Konsole | bei Abweichung das Aktionsprotokoll beider Stände vergleichen | `diff basis.txt.ki.txt x3.txt.ki.txt` | erste abweichende Zeile nennt Partie und Schritt |
| 4 | Repo | Probedatei löschen |  | `git status` ist leer |

## Technische Prüfung

Dieselbe Probedatei wie in TF-ENGINE-066; für die KI kommt je Schritt die Sicht des Entscheiders ohne die X3-Felder in die Summe, und jede gewählte Aktion wird mitgeschrieben, damit sich die erste Abweichung finden lässt.

## Nicht abgedeckte Grenzfälle

Partien mit Zusatzaktionen gibt es erst mit X4 bis X6.
