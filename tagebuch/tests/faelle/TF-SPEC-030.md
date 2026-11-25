---
id: TF-SPEC-030
titel: Wird eine der Antworten D68 bis D79, die Präzisierung von D54, B1, B2 oder die leere Teil C verfälscht, schlagen die Spec-Tests fehl.
art: automatisch
regression: nein
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-25
veraendert_daten: nein
skript: tests/spec_documentation_teil_d.test.ts
aenderung: task/P0.5h-antworten-x4-x6 (PR #119)
grenzfall_von: TF-SPEC-029
---

## Worum es geht

Ein Test hält eine Antwort des Autors nur fest, wenn er bei einer verfälschten Fassung anschlägt. P0.5h bringt zwölf neue Antworten, verändert D54, B1, B2 und den Kopf von Teil C und leert die Tabelle in Teil C. Geprüft wird das mit absichtlich verfälschten Fassungen, darunter Grenzfälle wie eine Nummer, die nur als Teil einer längeren Nummer vorkommt.

## Bestanden, wenn

Die Verfälschungen G1 bis G20 aus den Testdaten enden je mit Exit 1, und der rote Test nennt die verfälschte Stelle. Nach dem Zurückholen der Dateien ist `git status --short` leer. L1 und L2 sind bekannte Lücken und kein Kriterium.

## Fehlgeschlagen, wenn

Eine der Verfälschungen G1 bis G20 endet mit Exit 0, oder nach dem Zurücksetzen bleibt eine Datei verändert.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Arbeitskopie auf dem zu prüfenden Commit, `npm ci` gelaufen, keine lokalen Änderungen |

## Testdaten

Je eine Ersetzung mit genau einer Fundstelle in `docs/GAME_SPEC.md` oder `docs/WEBSITE_NACHTRAG.md`: G1 D70 Wahl „Auch ohne Tausch“; G2 D72 „direkt nach dem Ziehen …, vor jeder anderen Aktion“; G3 D78 „freiwillig, er kann sie ablehnen“; G4 Zeile C14 wieder in Teil C; G5 „C10 und C14 (X2a, 24.11.2026)“ aus „Behoben und gestrichen“ entfernt; G6 B1 Vielfaltbonus „nein“; G7 Ausnahme in B2 entfernt; G8 Präzisierung durch D69 aus D54 entfernt; G9 alter Satz „der Satz dazu in A8.2 ist nur eine Klarstellung“ aus D54 entfernt; G10 „Abgeleitet aus A7.10“ in D70 umformuliert; G11 Zitat aus A8.2 in D69 verkürzt; G12 Datum D75 25.11.2026; G13 „(D71)“ im Nachtrag umbenannt; G14 B1 Schlangenkorb „nein“; G15 „C2 (E5, 21.11.2026)“ entfernt, sodass C2 nur noch in C20 bis C23 steckt; G16 Schlusssatz von Teil C nennt wieder `src/kiZug.ts`; G17 D74 „Ja:“ statt „Nein:“; G18 Nachtrag D77 mit „bleibt verdeckt“; G19 D68 ohne Verweis auf D46; G20 Einleitung Teil D „D68–D78“. Lücken: L1 in D71 „Daneben bleibt die Sonderkarte des Zuges frei (D42).“; L2 in D77 Satz zur anderen gelegten Karte entfernt.

## Technische Prüfung

Für jede Ersetzung: anwenden, `npx vitest run` über `tests/spec_documentation_teil_b_c.test.ts`, `tests/spec_documentation_teil_d.test.ts`, `tests/spec_documentation_teil_e.test.ts`, `tests/spec_documentation_teil_a.test.ts`, `tests/spec_documentation.test.ts`, `tests/regelfragen_antworten.test.ts` und `tests/regelfragen.test.ts`, Exit-Code und rote Tests notieren, die Datei mit `git checkout -- <datei>` zurückholen. Erwartet: Exit 1 bei G1 bis G20, ohne Ersetzung 548 bestandene Tests.
