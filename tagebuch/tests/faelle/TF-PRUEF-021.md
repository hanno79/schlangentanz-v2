---
id: TF-PRUEF-021
titel: Ein Eintrag der Ausnahmeliste, dessen Vertrag es nicht gibt, macht die Prüfung der Liste rot.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
aenderung: task/P0.3c-fuenf-geraeteklassen (PR #32)
grenzfall_von: TF-PRUEF-020
---

## Worum es geht

Die Ausnahmeliste `tests/layout/geraeteklassen_ausnahmen.json` soll nur kleiner werden. Das klappt nur, wenn jeder Eintrag einen echten Vertrag trifft. Ein Eintrag mit einem Tippfehler im Testnamen trifft keinen: Playwright erwartet für ihn kein Scheitern und meldet auch nichts, wenn der Vertrag grün ist. So ein Eintrag bleibt in der Liste, bis ihn jemand beim Lesen bemerkt.

## Bestanden, wenn

Mit einem zusätzlichen Eintrag für `handy-quer` und den Vertrag `O2: Regelseite › kein Bedienelement liegt ausserhalb des Bildes` (mit „ss“; den Test gibt es nur mit Eszett) endet mindestens einer der beiden Läufe aus den Schritten 2 und 3 mit Exit 1 und nennt den Eintrag.

## Fehlgeschlagen, wenn

Beide Läufe enden mit Exit 0: Vitest mit 3 grünen Tests, Playwright mit 85 grünen Tests.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Arbeitskopie auf dem zu prüfenden Commit, `npm ci` gelaufen, Ports 4173 und 4174 frei |

## Testdaten

Zusätzlicher Eintrag am Ende von `ausnahmen`:
`{"datei": "tests/layout/lobby.spec.ts", "vertrag": "O2: Regelseite › kein Bedienelement liegt ausserhalb des Bildes", "klasse": "handy-quer", "befund": "Probe: Vertragsname mit ss"}`

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Editor | Eintrag aus „Testdaten“ in `tests/layout/geraeteklassen_ausnahmen.json` einfügen | Testdaten | gültiges JSON |
| 2 | Git Bash im Repo | Listenprüfung | `npx vitest run tests/geraeteklassen_ausnahmen.test.ts; echo $?` | Exit 1, der Eintrag wird genannt |
| 3 | Git Bash im Repo | Lobby-Verträge in Handy quer | `npx playwright test tests/layout/lobby.spec.ts --project=handy-quer; echo $?` | Exit 1, der Eintrag wird genannt |
| 4 | Git Bash im Repo | Liste zurücksetzen | `git checkout -- tests/layout/geraeteklassen_ausnahmen.json` | `git status` leer |
