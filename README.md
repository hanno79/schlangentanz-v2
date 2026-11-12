# Schlangentanz v2

Digitale Fassung des Kartenspiels Schlangentanz: ein Mensch gegen 1–3 KI-Gegner im Browser.

This is **not** the old `schlangentanz-game` repository and not a Paperclip implementation path.

## Regelquelle

- Einzige verbindliche Regelquelle ist die Website: <https://schlangentanz.ch/rules>.
- `docs/GAME_SPEC.md` spiegelt sie wörtlich (Teil A), führt die Abweichungen der
  Engine als Arbeitsliste (Teil C) und offene Fragen an den Autor (Teil D).
- Dart, Release-Notizen und Slice-Pläne unter `docs/` sind keine Regelquelle.

## Project identity

- GitHub repo: `hanno79/schlangentanz-v2`
- Vercel project: `schlangentanz-v2` (Production: <https://schlangentanz-v2.vercel.app>)

## Workflow

- Hermes orchestrates and verifies gates.
- Claude Code implements small slices after tests/spec.
- Codex reviews adversarially.
- Dart tasks are backlog input, never rules.
- Paperclip remains historical/tracking context only.

Details: `CLAUDE.md` und `docs/WORKFLOW.md`.

## Commands

```bash
npm test -- --run
npm run typecheck
npm run build
npm run test:layout
npm run check:test-lines
npm run check:css-asserts
npm run dev
```

## Stand (12.11.2026)

Die Spec ist mit der Website abgeglichen, die Engine noch nicht: `docs/GAME_SPEC.md`
Teil C führt die bekannten Abweichungen. Das Spielbrett wird neu gebaut.
