# Implementation Plan

## Phase 0 — Toolchain gate

- Verify Hermes, Claude Code, Codex, Archon, Node/npm, Vercel.
- Record auth status and blockers.
- Paperclip remains outside the implementation path.

## Phase 1 — Dart backlog ingestion

- Locate Schlangentanz/Dart AI tasks.
- Reset relevant tasks to Todo only after confirming scope.
- Cluster tasks into rules, engine, UI/UX, audio, analytics, deployment, QA/security.
- Convert clusters into spec sections.

## Phase 2 — Spec lock

- Complete `docs/GAME_SPEC.md`.
- Resolve ambiguity with the user.
- Freeze initial release scope.

## Phase 3 — Acceptance tests first

- Create rule-contract tests from each spec rule.
- Create invalid-action tests.
- Create phase/state-machine tests.
- Create E2E playability scenarios.
- Verify initial tests fail for missing implementation.

## Phase 4 — Engine slices

1. State model and serialization
2. Legal action validator
3. Turn/phase state machine
4. Card/effect resolution
5. Scoring and end conditions

Each slice: failing tests → implementation → tests/build → Codex review → commit.

## Phase 5 — UI binding

- UI calls engine for legal actions.
- UI does not contain core game-rule logic.
- Add integration and Playwright tests.

## Phase 6 — Release gate

- All automated gates pass.
- Codex critical findings: zero.
- Production Vercel deploy verified.
- Human playability check completed.
