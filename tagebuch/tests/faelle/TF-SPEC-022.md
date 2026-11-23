---
id: TF-SPEC-022
titel: D57 und sein Eintrag im Website-Nachtrag sagen, wie der Satz zu den zuletzt gezogenen Karten in A10 zu lesen ist, damit der Autor die Website klarstellen kann.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-23
veraendert_daten: nein
aenderung: task/P0.5f-rueckfragen-x3 (PR #105)
grenzfall_von: TF-SPEC-020
---

## Worum es geht

A10 sagt über den Spieler, der die letzte Karte zieht: „Seine zuletzt gezogenen Karten kann er nur noch ausserhalb seines Zuges einsetzen“. D57 erlaubt, mitten im Zug gezogene letzte Karten noch im selben Zug zu spielen. Wörtlich gelesen widersprechen sich die beiden Sätze. Übernimmt der Autor D57 auf die Website, ohne den Satz in A10 anzupassen, stehen dort zwei Regeln gegeneinander. Wie bei D23 und A7.8 muss deshalb in Teil D und im Nachtrag stehen, wie A10 zu lesen ist.

## Bestanden, wenn

D57 in Teil D und der Eintrag „(D57)“ in `docs/WEBSITE_NACHTRAG.md` nennen den Satz aus A10 und sagen, wie er zu lesen ist, etwa: Er betrifft die Karten, die der Spieler am Ende seines Zuges beim Auffüllen zieht. Im Nachtrag steht das ohne Verweis auf Teil D verständlich.

## Fehlgeschlagen, wenn

Weder D57 noch der Nachtrag nennen den Satz aus A10 oder sagen, wie er zu lesen ist. Ein Hinweis nur in der PR-Beschreibung oder in einem Commit genügt nicht, weil der Autor mit dem Nachtrag arbeitet.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Arbeitskopie auf dem zu prüfenden Commit |

## Testdaten

Satz der Website in A10: „Seine zuletzt gezogenen Karten kann er nur noch ausserhalb seines Zuges einsetzen, etwa einen Farbenschutz zur Abwehr.“ Vorbild für die Einordnung: D23 und sein Nachtrag-Eintrag, die „Im zweiten Zug darfst du keinen weiteren Verdoppler spielen“ (A7.8) zitieren und auslegen.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Git Bash im Repo | Fundstellen des Satzes suchen | `grep -n "zuletzt gezogenen\|ausserhalb seines Zuges" docs/GAME_SPEC.md docs/WEBSITE_NACHTRAG.md` | ausser in A10 auch in D57 oder im Nachtrag-Eintrag „(D57)“ |
| 2 | Editor, `docs/GAME_SPEC.md`, Teil D, Zeile D57 | Antwort lesen | | nennt A10 und sagt, wie der Satz zu lesen ist |
| 3 | Editor, `docs/WEBSITE_NACHTRAG.md`, Eintrag „(D57)“ | Antwort lesen | | wie Schritt 2, ohne Teil D verständlich |

## Nicht abgedeckte Grenzfälle

Ob der Autor die Website so anpasst, prüft erst `npm run abgleich:website` (TF-SPEC-005). Der Fall, dass jemand die letzte Karte beim Auffüllen zwischen den beiden Zügen eines Verdopplers zieht, ist nicht Gegenstand von D57; ihn hat die Abnahme von E3 (Hinweis H1) als durch A7.8 gedeckt beurteilt.
