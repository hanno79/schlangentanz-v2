# Release Checklist

## Before release

- [ ] `docs/GAME_SPEC.md` locked
- [ ] Acceptance tests derived from spec
- [ ] No copied old project/Paperclip code
- [ ] `npm test -- --run` passes
- [ ] `npm run typecheck` passes
- [ ] `npm run build` passes
- [ ] Codex adversarial review has zero critical findings

## Deployment

- [ ] New GitHub repo is correct: `hanno79/schlangentanz-v2`
- [ ] New Vercel project is correct: `schlangentanz-v2`
- [ ] Deployment is linked to the new repo/project only
- [ ] Production URL verified

## Evidence

- [ ] Commit SHA recorded
- [ ] Test output recorded
- [ ] Build output recorded
- [ ] Production URL recorded
- [ ] Known limitations recorded
