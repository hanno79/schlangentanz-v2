# Release Checklist

Zuletzt abgehakt für **Release `7813abb` am 03.08.2026** — Belege im Abschnitt
„Evidence — 03.08.2026" in `docs/PLAYABILITY_GATE.md`.

Die Haken beziehen sich immer auf den zuletzt ausgelieferten Stand. Wer den
nächsten Release fährt, setzt sie zurück oder trägt den neuen Commit ein.

## Before release

- [ ] `docs/GAME_SPEC.md` spiegelt die Website, und Teil C (Abweichungen der
      Engine) ist leer — **offen.** Stand 12.11.2026: Die Spec ist abgeglichen,
      Teil C führt 13 Abweichungen. (Bis 12.11.2026 stand hier „locked"; die
      damals gesperrte Fassung beruhte auf einem älteren Stand der Website.)
- [x] Acceptance tests derived from spec — `tests/spec_documentation.test.ts`
      erzwingt den Wortlaut jeder Zusage
- [x] No copied old project/Paperclip code
- [x] `npm test -- --run` passes — 619 Tests in 70 Dateien
- [x] `npm run typecheck` passes
- [x] `npm run build` passes
- [x] Codex adversarial review has zero critical findings — nachgeholt am
      03.08.2026, zwei Funde (einer hoch, einer mittel), beide behoben; keine
      kritischen

Zusätzlich zu dieser Liste grün: `npm run test:layout` (34 Verträge),
`check:test-lines`, `check:css-asserts`, ESLint.

## Deployment

- [x] New GitHub repo is correct: `hanno79/schlangentanz-v2`
- [x] New Vercel project is correct: `schlangentanz-v2`
- [x] Deployment is linked to the new repo/project only
- [x] Production URL verified — `/` und `/game` je 200, `smoke:production` 1/1

## Evidence

- [x] Commit SHA recorded — `7813abb`
- [x] Test output recorded
- [x] Build output recorded — inkl. Bundle-Namen für den Abgleich
- [x] Production URL recorded
- [x] Known limitations recorded

## Wie der Deploy ausgelöst wird (ÄNDERUNG 03.08.2026)

Bis zu diesem Release lief jeder Deploy **von Hand über die Vercel-CLI**, obwohl
es wie Automatik aussah: Kein Commit im Repo hatte je einen Vercel-Commit-Status.
Am 03.08.2026 wurde das GitHub-Repo im Vercel-Projekt verbunden.

**Ein Deployment allein ist kein Beleg.** Maßgeblich ist der Abgleich der
ausgelieferten Bundle-Namen mit dem lokalen Release-Build:

```bash
curl -s https://schlangentanz-v2.vercel.app/game | grep -oE 'assets/index-[A-Za-z0-9_-]+\.(js|css)'
ls dist/assets/
```

Stimmen sie nicht überein, hängt Production zurück — genau das war am 03.08.2026
der Fall, während `main` längst grün war.
