---
id: TF-SPEC-011
titel: Steht ein Satz der Website nur ausserhalb von Teil A im Dokument, meldet der Abgleich trotzdem eine Abweichung (Exit 1).
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
aenderung: task/P0.5c-website-abgleich (PR #38)
grenzfall_von: TF-SPEC-005
---

## Worum es geht

Die Abdeckungsprüfung sucht jede Zeile der Website im ganzen Dokument und nicht nur in Teil A. Steht ein Satz der Website nur in Teil D, darf der Abgleich trotzdem nicht „stimmt überein“ melden.

## Bestanden, wenn

Der Abgleich endet mit Exit 1, und der Satz „Gegen Farbkarten gibt es keine Abwehr“ (Website A7.2, im Dokument nur in Teil D) steht als `+`-Zeile in der Ausgabe der Gleichheitsprüfung.

## Fehlgeschlagen, wenn

Der Abgleich endet mit Exit 0, obwohl Teil A den Satz nicht enthält.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Arbeitskopie, Netzzugang; `docs/GAME_SPEC.md` enthält den Satz nur in Teil D (D10) |

## Testdaten

Satz „Gegen Farbkarten gibt es keine Abwehr“ aus den wichtigen Regeln des Farbenschutz-Dialogs der Website; in `docs/GAME_SPEC.md` nur in Zeile D10 von Teil D.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Git Bash im Repo | Prüfen, wo der Satz im Dokument steht | `grep -n "Gegen Farbkarten gibt es keine Abwehr" docs/GAME_SPEC.md` | nur eine Fundstelle, Zeile D10 in Teil D |
| 2 | Git Bash im Repo | Abgleich ausführen | `npm run abgleich:website; echo $?` | Diff enthält `+- Gegen Farbkarten gibt es keine Abwehr`, Exit 1; in der Liste „FEHLT:“ steht der Satz nicht, weil die Abdeckung das ganze Dokument durchsucht |
