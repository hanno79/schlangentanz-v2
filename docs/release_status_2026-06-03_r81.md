# Release Status 2026-06-03 R81 — Serialization-Hardening und Reaktionsvalidierung

Author: rahn
Datum: 03.06.2026
Version: 1.0
Beschreibung: Release-Status für den R81-Slice zur kanonischen Serialisierung von Farbenfusionen und Pending-Reaktionen.

## Scope

- Farbenfusion-Serialisierung ist materialkonsistent und runtime-validiert.
- Pending-Reaktionen werden beim Deserialisieren gegen reale Spieler-, Schlangen- und Kartenreferenzen geprüft.
- `zugpflichten.farbenfusionGespielt` wird migriert und als Boolean validiert.

## Umsetzung

- `src/engine/serialization.ts` validiert `schlange.farbenfusionen` gegen echte Farbenfusion-Karten, positive Punkte, Duplikate und verwaiste Einträge.
- `src/engine/serialization.ts` validiert Pending-Reaktionen gegen reale Zielschlangen/Zielkarten, echte Blockadekarten im Ablagestapel und gültige Verdoppler-Reaktionslisten.
- `src/engine/__tests__/serialization_r19.test.ts` enthält fokussierte Regressionen mit kanonischen Fixtures.
- Codex-Re-Review meldete nach dem Rest-Fix keine Blocker und keine Non-Blocker.

## Tests und Gates

- Targeted: `npm test -- --run src/engine/__tests__/serialization_r19.test.ts src/engine/__tests__/farbenfusion.test.ts src/engine/__tests__/turn_state_r78_reactions.test.ts src/engine/__tests__/schlangenblockade.test.ts src/engine/__tests__/schlangenfrass.test.ts` → 5 Testfiles / 52 Tests bestanden.
- Full Test: `npm test -- --run` → 56 Testfiles / 393 Tests bestanden.
- Typecheck: `npm run typecheck` bestanden.
- Lint: `npm run lint` bestanden.
- Build: `npm run build` bestanden.
- Diff-Check: `git diff --check` bestanden.

## Release

- Commit/Push: `0e323f4 — R81: Serialization und Reaktionsvalidierung härten` auf `origin/main`.
- Deploy: `vercel deploy --prod --yes --token=…` auf `https://schlangentanz-v2.vercel.app` bereitgestellt.
- Smoke: Production-Alias liefert HTTP 200; Playwright lädt Heading `Schlangentanz v2 Greenfield Rebuild` und Sonderkarten-Materialzeile ohne Console-/Page-/Request-Errors.
