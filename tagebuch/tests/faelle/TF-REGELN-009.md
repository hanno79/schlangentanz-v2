---
id: TF-REGELN-009
titel: Gibt man einem Satz der Zugschritte, der wörtlich in Teil A steht, eine Quelle aus Teil D, schlagen die Tests der Regelseite fehl.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-20
veraendert_daten: nein
aenderung: task/P0.5d-teil-a-website (PR #50)
grenzfall_von: TF-REGELN-008
---

## Worum es geht

Ein veraltetes Etikett „Ergänzung des Autors“ würde behaupten, ein Satz stehe noch nicht auf der Website. Der neue Test soll das merken, sobald ein Satz aus Teil D wörtlich in Teil A angekommen ist.

## Bestanden, wenn

Mit der Quelle `D10` statt `A6` beim Satz „Gegen Farbkarten gibt es keine Abwehr.“ in `src/ui/regeln/zugschritte.ts` endet `npx vitest run src/ui/regeln` mit 1, und rot sind „P0.5d/U2: „Sonderkarte ansagen“: eine Ergänzung aus Teil D steht noch nicht wörtlich in Teil A …“ und „P0.5d: was die Website seit dem 13.11.2026 selbst sagt …“.

## Fehlgeschlagen, wenn

Der Befehl endet mit 0.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Arbeitskopie des Branches, `npm ci` gelaufen |

## Testdaten

`src/ui/regeln/zugschritte.ts` Zeile 65: `{ text: 'Gegen Farbkarten gibt es keine Abwehr.', quelle: 'A6' }`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Editor, `src/ui/regeln/zugschritte.ts` Zeile 65 | Quelle ändern | `quelle: 'D10'` | |
| 2 | Git Bash im Repo | Tests ausführen | `npx vitest run src/ui/regeln; echo $?` | Exit 1, die zwei roten Tests aus „Bestanden, wenn“ |
| 3 | Git Bash im Repo | zurücksetzen | `git checkout -- src/ui/regeln/zugschritte.ts` | `git status` leer |
