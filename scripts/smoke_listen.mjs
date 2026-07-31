/*
Author: Claude Code (G-8)
Datum: 31.07.2026
Version: 2.0
Beschreibung: Die Live-Smoke-Ketten als Listen.

Bis G-8 standen hier 91 Skripte, die das alte Waldtanz-Brett prüften —
Steinkreis, Lichtungsstein, Zauberpfad, Unterholzleiste, Waldsteine. Mit dem
Brett sind sie gegenstandslos geworden.

An ihre Stelle tritt `brett_smoke.mjs`. Er prüft nicht mehr einzelne
Brettobjekte, sondern ob ein Mensch mit einer Maus spielen kann — und stellt der
Seite dieselben vier Fragen wie `tests/layout/brett_waechter.spec.ts`. Genau das
haben die 91 zusammen nicht erwischt: Sie meldeten grün, während der
Startfährte-Knopf 481 px unter dem Bildrand lag.

- production: läuft gegen die Production-URL und braucht KEINE Test-Hooks.
- preview:    braucht VITE_TEST_HOOKS=1 und läuft gegen SMOKE_BASE_URL
              (siehe docs/WORKFLOW.md, Abschnitt "Test-Hooks").
*/

export const SMOKE_LISTEN = {
  production: ['scripts/brett_smoke.mjs'],
  /* Zurzeit leer: Kein Smoke braucht die Fixture-Hooks. Die Liste bleibt
     bestehen, damit AP-1 (keine Test-Hooks in Production) seine Trennung
     behält, sobald wieder einer dazukommt. */
  preview: [],
}
