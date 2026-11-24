---
id: TF-SPEC-025
titel: Wird eine der Antworten D48, D58 bis D65 auf eine nicht gewählte Möglichkeit umgestellt, ein Datum geändert oder Teil C zurückgedreht, schlagen die Spec-Tests fehl.
art: automatisch
regression: nein
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-23
veraendert_daten: nein
skript: tests/spec_documentation_teil_d.test.ts
aenderung: task/P0.5g-antworten-x2-x3 (PR #110)
grenzfall_von: TF-SPEC-024
---

## Worum es geht

Die Spec-Tests sollen festhalten, was der Autor am 23.11.2026 gewählt hat. Ein Test, der auch bei einer falschen Antwort grün bleibt, hält nichts fest. Geprüft wird deshalb mit absichtlich verfälschten Fassungen, ob die Tests sie erkennen.

## Bestanden, wenn

Jede der zwölf Verfälschungen aus den Testdaten führt zu Exit 1 mit einer Meldung, die den verfälschten Eintrag nennt. Danach sind die drei Dateien wieder im Originalzustand, und dieselben vier Testdateien enden mit Exit 0 und 134 bestandenen Tests.

## Fehlgeschlagen, wenn

Eine Verfälschung endet mit Exit 0, oder nach dem Zurücksetzen bleibt ein Test rot.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Arbeitskopie auf dem zu prüfenden Commit, `npm ci` gelaufen, Kopien von `docs/GAME_SPEC.md`, `docs/WEBSITE_NACHTRAG.md` und `docs/REGELFRAGEN.md` ausserhalb des Repos |

## Testdaten

Je eine Ersetzung, genau eine Fundstelle:
A D59 „Nur am Zugende“ → „Nach jeder Aktion“; B D63 „gilt das für „Schlangentanz“ die ganze Partie; die Häutung muss nicht im Zug des Einlösens liegen“ → „zählt für „Schlangentanz“ nur eine Häutung im selben Zug“; C D58 „Nein:“ → „Ja:“; D im Nachtrag bei D61 der Satz „Es braucht mindestens eine echte Farbkarte.“ angehängt; E D64 „Zwei Arten“ → „Zwei beliebige“; F in D48 die Rückfrage vom 23.11.2026 entfernt; G Fundstelle von C10 → `src/engine/aufgabenPruefung.ts`; H Zeile C21 wieder eingefügt; I in `docs/REGELFRAGEN.md` „D58–D65“ → „D58–D64“; J bei D56 „Ja:“ am Anfang entfernt; K Datum von D48 → 23.11.2026; L Datum von D65 → 22.11.2026.

## Technische Prüfung

Für jede Ersetzung: Ersetzung anwenden, `npx vitest run tests/spec_documentation_teil_d.test.ts tests/spec_documentation_teil_b_c.test.ts tests/regelfragen_antworten.test.ts tests/spec_documentation_teil_e.test.ts`, Exit-Code und fehlgeschlagene Tests notieren, die drei Dateien aus den Kopien zurückholen. Erwartet: zwölfmal Exit 1, danach Exit 0 mit 134 bestandenen Tests und `git status --short` ohne Änderung an `docs/`.
