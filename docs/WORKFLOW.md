# Schlangentanz v2 Workflow

This project starts cleanly in a new local folder, new GitHub repository, and new Vercel project.

- Local project: `/home/projects/schlangentanz-v2`
- GitHub repo: `hanno79/schlangentanz-v2`
- Vercel project: `schlangentanz-v2`

## Architecture of work

1. **Hermes orchestrates**
   - owns scope, gates, verification, GitHub/Vercel coordination
   - rejects “looks clickable” as completion evidence

2. **Claude Code builds**
   - uses small, spec-linked implementation slices
   - starts from failing tests for behavior changes

3. **Codex reviews adversarially**
   - checks rules, tests, edge cases, illegal actions, security, and production readiness

4. **Dart provides backlog input**
   - tasks are requirements candidates, not automatically truth
   - tasks must be normalized into `GAME_SPEC.md`

5. **Paperclip is not used for implementation**
   - old Paperclip activity is treated as historical context only

## Project separation rules

- Do not reuse the old repo remote.
- Do not reuse the old Vercel project.
- Do not mix old build artifacts or Paperclip output into this repo.
- Any referenced old behavior must be converted into explicit spec text and tests first.

## Gates

1. Toolchain gate
2. Backlog ingestion gate
3. Spec lock gate
4. Acceptance-test gate
5. Engine implementation gate
6. UI binding gate
7. Codex adversarial review gate
8. Vercel production gate
9. Human playability gate

## Test-Hooks (ÄNDERUNG 05.07.2026 C4, überarbeitet 30.07.2026 AP-1)

Die Test-Hooks `window.__schlangentanzFixture` und der `?phase=`-URL-Hook sind
**nur im Dev-Build oder mit gesetztem `VITE_TEST_HOOKS=1`** aktiv (siehe
`src/testPhaseHook.ts` → `testHooksAktiv()`).

> **`VITE_TEST_HOOKS` gehört ausschließlich in die Vercel-Preview-Umgebung —
> ausdrücklich NICHT in Production.**
>
> Bis AP-1 verlangte diese Doku die Variable auch in Production, damit sechs
> Smokes durchliefen. Damit war der Hook in der ausgelieferten App wieder
> erreichbar und konnte beliebige Spielzustände injizieren — der Sicherheitsgewinn
> von C4 war faktisch aufgehoben. Seit AP-1 laufen genau diese sechs Smokes in
> einer eigenen Kette gegen ein Preview-Deployment.

### Zwei Smoke-Ketten

| Script | Umfang | Ziel | Test-Hooks |
|---|---|---|---|
| `npm run smoke:production` | 77 Smokes | Production-URL | nicht nötig |
| `SMOKE_BASE_URL=<preview-url> npm run smoke:preview` | 6 Smokes | Preview-Deployment | erforderlich |

Die Preview-Kette enthält:

- `m1e_waldtanz_spieluhr_smoke.mjs` und `m1dh_waldtanz_spielhandlung_smoke.mjs` —
  navigieren nach `/game?phase=…` und asserten auf die erzwungene Phase.
- `m2a_…` und `m2d_…` — brechen hart ab, wenn `window.__schlangentanzFixture`
  fehlt.
- `m1dp_…` und `m1dq_…` — überspringen die Fixture-Injektion ohne Hook still und
  prüfen dann deutlich weniger. Sie laufen bewusst ebenfalls in der Preview-Kette,
  damit die fixture-gestützte Abdeckung an genau einer Stelle liegt, statt in
  Production unbemerkt auf eine Teilprüfung zusammenzufallen.

Alle sechs Skripte lesen `SMOKE_BASE_URL` bereits aus der Umgebung; ohne die
Variable liefen sie gegen die Production-URL und würden dort scheitern.

### Absicherung

- `src/App.hooks_production_guard.test.ts` schlägt fehl, sobald ein hook-abhängiger
  Smoke zurück in `smoke:production` wandert **oder** ein bestehender
  Production-Smoke neu einen Hook benutzt. Die Prüfung liest die Skript-Quelltexte,
  verlässt sich also nicht auf eine gepflegte Liste.
- `src/test/smokeKetten.ts` ist die einzige Stelle, die die Ketten aus
  `package.json` liest. Wiring-Tests fragen `istVerdrahtet(...)`, statt selbst auf
  einer der Ketten zu suchen — sonst bricht jeder Wechsel der Kette 20 Tests.

### Was im Production-Bundle steht

`testHooksAktiv()` kompiliert im Production-Build zu `return false` — geprüft am
Bundle vom 30.07.2026: `function Qr(){return!1}`. Der Installationspfad des Hooks
ist damit **statisch unerreichbar**.

Der Bezeichner `__schlangentanzFixture` ist im Bundle trotzdem noch als Zeichenkette
zu finden: Vite entfernt den toten Zweig hinter `if (… || !testHooksAktiv()) return`
nicht. Ein `grep` im Bundle ist deshalb **kein** taugliches Kriterium. Maßgeblich ist,
dass die Guard-Funktion zu `false` auflöst; wer das prüfen will, sucht nach der
kompilierten Guard-Funktion, nicht nach dem Hook-Namen.

### Vitest

Vitest-Tests brauchen keine Sonderkonfiguration: im Testlauf ist
`import.meta.env.DEV` ohnehin `true`, sodass die Hooks dort aktiv bleiben.

## Bewusst nicht implementiert (Stand 30.07.2026)

Damit diese Punkte nicht wiederholt als „toter Code" oder „vergessenes Feature"
aufschlagen, hier die bewussten Entscheidungen:

### Speichern/Laden einer Partie

`src/engine/serialization.ts` (rund 700 Zeilen inkl. sieben Migrationsschritten)
hat **keinen Produktionsaufrufer**. Es gibt kein Speichern/Laden; ein Reload
verwirft die laufende Partie. Das Modul ist Test-Infrastruktur: der
Vollpartie-Soak-Test prüft nach jedem Zug den Roundtrip
`deserialisiere(serialisiere(zustand))` und fängt damit strukturelle Engine-Fehler
früh ab. Die Migrationsschritte bleiben erhalten, weil sie ältere Testfixtures
lauffähig halten. Persistenz wäre ein eigener Slice inkl. Fehlerpfad für ungültige
gespeicherte Stände.

### Erweiterungskarten außerhalb des Spieldecks

`Comeback` (4), `Risiko-Belohnung` (8) und `Schlangenkorb des Glücks` (1) werden in
`src/engine/deck.ts` erzeugt, gelangen aber nicht ins gemischte Spieldeck. Ihr
einziger Zweck ist die Namensvalidierung in `serialization.ts`. Das digitale
Spieldeck umfasst 114 Karten: 110 Basiskarten plus die 4 Schlangenhäutung-Karten
der Erweiterung (Audit-Fix H1) — siehe `docs/GAME_SPEC.md` R1.1/R1.2.
