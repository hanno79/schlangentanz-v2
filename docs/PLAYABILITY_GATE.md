# Playability Gate

A route loading successfully is not enough. A green smoke test is not enough.

## Automated gates

- [ ] Unit tests pass
- [ ] Rule-contract tests pass
- [ ] Invalid-action tests pass
- [ ] State-machine tests pass
- [ ] Integration tests pass
- [ ] Playwright E2E gameplay scenarios pass
- [ ] Typecheck passes
- [ ] Production build passes

## Live production gates

- [ ] Production URL returns HTTP 200
- [ ] Game route loads without console errors
- [ ] New game can be started
- [ ] Legal actions are available only when legal
- [ ] Illegal actions are blocked with clear feedback
- [ ] A complete representative game can be played to end condition
- [ ] Scoring/end state matches spec

## Human gate

- [ ] User confirms the game is actually playable according to the locked spec
