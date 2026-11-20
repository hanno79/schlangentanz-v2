---
id: TF-SPEC-013
titel: Teil D vermerkt D9, D10, D12 und D13 als von der Website übernommen, lässt D11 offen und löst den Widerspruch zwischen A7.8 und D23 nirgends stillschweigend auf.
art: manuell
regression: nein
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-20
veraendert_daten: nein
aenderung: task/P0.5d-teil-a-website (PR #50)
status: stillgelegt
---

## Worum es geht

Seit der Autor D9 bis D13 auf die Website gebracht hat, muss Teil D sagen, welche Antworten dort stehen. Wo die Website einer Antwort widerspricht (A7.8 „keinen weiteren Verdoppler spielen“ gegen D23 „wirkungslos ablegen“), darf niemand die Regel eigenmächtig in eine Richtung festlegen.

## Bestanden, wenn

In Teil D tragen D9, D10, D12 und D13 „Website übernommen am 13.11.2026.“ und nicht mehr „Website folgt“; D11 und D23 tragen weiter „Website folgt“. Der Widerspruch steht als offen in Teil D (Einleitung „Beantwortet“), in Teil C (C7) und im Verlauf von Teil E. Keine Datei in `src/` legt die Frage in eine Richtung fest, ohne den Satz als Ergänzung des Autors zu kennzeichnen.

## Fehlgeschlagen, wenn

Eine der vier Antworten trägt noch „Website folgt“, D11 oder D23 ist als übernommen markiert, oder der Widerspruch fehlt an allen drei Stellen.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Arbeitskopie des Branches, Website `https://schlangentanz.ch/rules` zum Vergleich |

## Testdaten

Website A7.8: „Im zweiten Zug darfst du keinen weiteren Verdoppler spielen“. D23: „Im zweiten Zug darf er wirkungslos auf den eigenen Ablagestapel; er zählt als Sonderkarte dieses Zuges, ein weiterer Zug folgt nicht.“

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Editor, `docs/GAME_SPEC.md`, Tabelle in Teil D | Zeilen D9 bis D13 und D23 lesen | | D9, D10, D12, D13: „Website übernommen am 13.11.2026.“; D11 und D23: „Website folgt.“ |
| 2 | Teil D, Absatz unter „Beantwortet“ | lesen | | nennt den Widerspruch zwischen A7.8 und D23 als offen beim Autor |
| 3 | Teil C, Zeile C7 | lesen | | Spalte „Soll“ nennt A7.8 und D23 und dass der Autor entscheidet |
| 4 | Git Bash im Repo | Fundstellen in `src/` suchen | `grep -rn "wirkungslos\|weiteren Verdoppler" src --include=*.ts` | Sätze zu D23 tragen die Quelle `D23` und damit das Etikett „Ergänzung des Autors“, der Satz aus A7.8 die Quelle Teil A |

## Nicht abgedeckte Grenzfälle

Ob D19 inzwischen ebenfalls auf der Website steht, prüft dieser Testfall nicht; das gehört nicht zu D9 bis D13. Den Fall „nur Verdoppler auf der Hand im zweiten Zug“ prüft die Engine (E3), nicht die Spec.

Stillgelegt am 20.11.2026 (Orchestrator): Der Fall erwartete den offenen Widerspruch zwischen A7.8 und D23; der Autor hat ihn am 20.11.2026 aufgelöst (D23 gilt). Nachfolger: TF-SPEC-016.
