---
id: TF-SPEC-028
titel: Wird D63, D66 oder D67 verfälscht oder fehlt im Website-Nachtrag der harte Umbruch nach einer Frage, schlagen die Spec-Tests fehl.
art: automatisch
regression: nein
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-24
veraendert_daten: nein
skript: tests/spec_documentation_teil_d.test.ts
aenderung: task/P0.5g-antworten-x2-x3 (PR #110, Iteration 2)
grenzfall_von: TF-SPEC-027
---

## Worum es geht

Iteration 2 von P0.5g ergänzt D63, D66 und D67 und verlangt einen harten Umbruch nach jeder Frage im Website-Nachtrag. Ein Test hält die Antwort des Autors nur fest, wenn er bei einer verfälschten Fassung anschlägt. Geprüft wird das mit absichtlich verfälschten Fassungen.

## Bestanden, wenn

Die Verfälschungen M1 bis M4, N1 bis N6 und B1 aus den Testdaten enden je mit Exit 1, und der rote Test nennt den verfälschten Eintrag. Nach dem Zurückholen der Dateien enden dieselben vier Testdateien mit Exit 0. M5 ist eine bekannte Lücke und kein Kriterium.

## Fehlgeschlagen, wenn

Eine der Verfälschungen M1 bis M4, N1 bis N6 oder B1 endet mit Exit 0, oder nach dem Zurücksetzen bleibt ein Test rot.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Arbeitskopie auf dem zu prüfenden Commit, `npm ci` gelaufen, Kopien von `docs/GAME_SPEC.md`, `docs/WEBSITE_NACHTRAG.md` und `docs/REGELFRAGEN.md` ausserhalb des Repos |

## Testdaten

Je eine Ersetzung, genau eine Fundstelle: M1 Satz „Die beiden Gruppen müssen beim Einlösen nicht mehr liegen; …“ aus D63 entfernt; M2 im Nachtrag zu D63 derselbe Satz durch „Die beiden Gruppen müssen beim Einlösen noch liegen.“ ersetzt; M3 Fragezeile „(D60)“ ohne die zwei Leerzeichen; M4 Fragezeile „(D14)“ mit nur einem Leerzeichen; M5 Fragezeile „(D60)“ mit Tabulator statt zwei Leerzeichen; N1 D66 Wahl „Nur nach dem zweiten“; N2 D66 „erst am Ende des zweiten Zuges geprüft“; N3 D67 „Nein:“ statt „Ja:“; N4 im Nachtrag zu D67 „Es braucht genau drei Karten.“ angehängt; N5 Datum D67 24.11.2026; N6 „(D66)“ im Nachtrag umbenannt; B1 Einleitung wieder „am 12.11.2026 umgesetzt“.

## Technische Prüfung

Für jede Ersetzung: anwenden, `npx vitest run tests/spec_documentation_teil_d.test.ts tests/spec_documentation_teil_b_c.test.ts tests/regelfragen_antworten.test.ts tests/spec_documentation_teil_e.test.ts`, Exit-Code und rote Tests notieren, Dateien aus den Kopien zurückholen. Erwartet: Exit 1 bei M1 bis M4, N1 bis N6 und B1, danach 141 bestandene Tests.
