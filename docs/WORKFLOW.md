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

## Test-Hooks (ÄNDERUNG 05.07.2026, C4)

Die Test-Hooks `window.__schlangentanzFixture` und der `?phase=`-URL-Hook sind
seit dem Audit-Fix C4 **nur im Dev-Build oder mit gesetztem `VITE_TEST_HOOKS=1`**
aktiv (siehe `src/testPhaseHook.ts` → `testHooksAktiv()`). In der normal
ausgelieferten Produktions-App sind sie deaktiviert.

- Die Live-Smokes (`scripts/*.mjs`) laufen gegen die Produktion und benötigen die
  Hooks. Damit sie weiter funktionieren, muss im Vercel-Projekt die Umgebungs-
  variable `VITE_TEST_HOOKS=1` gesetzt sein (Preview/Production nach Bedarf).
- Vitest-Tests brauchen keine Sonderkonfiguration: im Testlauf ist `import.meta.env.DEV`
  ohnehin `true`, sodass die Hooks dort aktiv bleiben.

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
