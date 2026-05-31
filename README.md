# Schlangentanz v2

Fresh greenfield rebuild of Schlangentanz.

This is **not** the old `schlangentanz-game` repository and not a Paperclip implementation path.

## Project identity

- Local path: `/home/projects/schlangentanz-v2`
- GitHub repo: `hanno79/schlangentanz-v2`
- Vercel project: `schlangentanz-v2`

## Workflow

- Hermes orchestrates and verifies gates.
- Claude Code implements small slices after tests/spec.
- Codex reviews adversarially.
- Dart tasks become backlog input.
- Paperclip remains historical/tracking context only.

## Commands

```bash
npm test -- --run
npm run typecheck
npm run build
npm run dev
```

## Next step

Fill and sign off `docs/GAME_SPEC.md`, then derive failing acceptance tests before implementing game logic.
