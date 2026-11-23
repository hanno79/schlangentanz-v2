---
id: TF-SPEC-021
titel: Wird D56 oder D57 in Teil D auf die verworfene Möglichkeit umgestellt oder fehlt eine der beiden Zeilen, schlagen die Spec-Tests fehl.
art: manuell
regression: nein
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-23
veraendert_daten: nein
aenderung: task/P0.5f-rueckfragen-x3 (PR #105)
grenzfall_von: TF-SPEC-020
---

## Worum es geht

Die Tests zu D56 und D57 sollen die Wahl des Autors festhalten, nicht nur, dass es die Zeilen gibt. Sonst kann eine spätere Änderung aus „Ja“ ein „Nein“ machen, und X3 baut die verworfene Regel, ohne dass ein Test es merkt.

## Bestanden, wenn

Jede Verfälschung unter „Testdaten“ führt einzeln zu Exit ungleich 0 bei `npx vitest run tests/spec_documentation_teil_d.test.ts`, und die Meldung nennt D56 oder D57.

## Fehlgeschlagen, wenn

Mindestens eine Verfälschung bleibt grün (Exit 0).

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Arbeitskopie auf dem zu prüfenden Commit, `git status --short` leer |

## Testdaten

Je Zeile eine Verfälschung in `docs/GAME_SPEC.md`, Teil D:

- D57 „Ja: Wer mitten“ ersetzt durch „Nein: Wer mitten“ und „darf dabei auch die eben gezogenen Karten einsetzen“ ersetzt durch „darf die eben gezogenen Karten nur noch ausserhalb seines Zuges einsetzen“ (verworfene Möglichkeit „Nein, erst später“)
- D56 „Ja: Wer eine“ ersetzt durch „Nein: Wer eine“ und „„Ja, gespielt ist gespielt““ ersetzt durch „„Nein, nur eine wirksame““, zugleich die Zeile D57 gelöscht

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Editor | eine Verfälschung aus „Testdaten“ eintragen | | nur die genannte Stelle geändert |
| 2 | Git Bash im Repo | Tests ausführen | `npx vitest run tests/spec_documentation_teil_d.test.ts; echo $?` | Exit ungleich 0; fehlgeschlagener Test „P0.5f: D56 …“ oder „P0.5f: D57 …“ |
| 3 | dieselbe Konsole | zurücksetzen | `git checkout -- docs/GAME_SPEC.md` | `git status --short` leer |

## Nicht abgedeckte Grenzfälle

Im Website-Nachtrag prüfen die Tests Frage und Kernsätze, nicht den Anfang der Antwort: Wird dort nur „Ja:“ durch „Nein:“ ersetzt, bleibt der Test grün (am 23.11.2026 bei D57 ausprobiert). Weil die Kernsätze stehen bleiben müssen, entsteht so ein widersprüchlicher Eintrag, aber keine andere Regel; Quelle bleibt Teil D. Wird Teil D zusammen mit dem Test verfälscht, merkt das nur ein Mensch, der beides gegen die Rückfragen liest (TF-SPEC-020).
