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
