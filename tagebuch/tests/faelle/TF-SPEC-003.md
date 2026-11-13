---
id: TF-SPEC-003
titel: Wird der Regelinhalt einer Antwort in Teil D verfälscht, schlagen die P0.5-Tests fehl.
art: manuell
regression: nein
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
aenderung: task/P0.5-regelfragen (PR #25)
grenzfall_von: TF-SPEC-001
---

## Worum es geht

Teil D ist die Vorlage für die Engine. Die Tests sollen nicht nur das Vorhandensein einer Antwort, sondern ihren Inhalt festhalten, sonst kann eine spätere Änderung die Regel unbemerkt umkehren.

## Bestanden, wenn

Jede der drei Verfälschungen unten führt einzeln zu Exit ungleich 0 bei `npx vitest run tests/regelfragen.test.ts tests/regelfragen_antworten.test.ts`.

## Fehlgeschlagen, wenn

Mindestens eine Verfälschung bleibt grün (Exit 0).

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Arbeitskopie auf dem zu prüfenden Commit, `git status --short` leer |

## Testdaten

- D14 „Zwei Züge: Jede Schlangengrube kostet …“ ersetzt durch „Ein Zug: Die zweite Grube hat keine weitere Wirkung.“
- D24 „Eine Kette zählt erst ab 3 Farbkarten derselben Farbe nebeneinander, nicht schon ab 2;“ ersetzt durch „Eine Kette zählt schon ab 2 Farbkarten derselben Farbe nebeneinander;“ (Wortlaut des Autors bleibt stehen)
- D29 „Ja: Die Grube darf ihn treffen, bleibt aber ohne Wirkung und geht auf den Ablagestapel.“ ersetzt durch „Nein: Ein Spieler ohne weiteren Zug ist kein Ziel der Grube.“ (Wortlaut bleibt stehen)

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Editor | eine Verfälschung aus „Testdaten“ in `docs/GAME_SPEC.md` eintragen | | nur diese eine Zeile geändert |
| 2 | Git Bash im Repo | Tests ausführen | `npx vitest run tests/regelfragen.test.ts tests/regelfragen_antworten.test.ts; echo $?` | Exit ungleich 0 |
| 3 | dieselbe Konsole | zurücksetzen | `git checkout -- docs/GAME_SPEC.md` | `git status --short` leer |
