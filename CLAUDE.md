# Schlangentanz v2 — Agent Instructions

## Scope
This repository is a **fresh greenfield rebuild** of Schlangentanz.

Do **not** copy or import code from:
- `/home/projects/schlangentanz-game`
- Paperclip workspaces or artifacts
- old Vercel project output

Old work may be read only as historical reference after explicit Hermes approval, but no code should be copied blindly.

## Roles
- Hermes: orchestrator, release manager, quality gatekeeper.
- Claude Code: builder for implementation slices.
- Codex: adversarial reviewer and verifier.
- Dart: backlog and requirements source.
- Paperclip: archived history/tracking only, **not** an implementation backend.

## Required workflow
1. Lock `docs/GAME_SPEC.md` before real game implementation.
2. Write acceptance tests before production game logic.
3. Implement in small slices.
4. Run tests, typecheck, and build after each slice.
5. Codex reviews every rules/engine slice before merge/release.
6. No release without `docs/PLAYABILITY_GATE.md` evidence.

## Commands
- `npm test -- --run`
- `npm run typecheck`
- `npm run build`
- `npm run dev`
