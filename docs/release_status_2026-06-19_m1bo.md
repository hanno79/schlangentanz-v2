# Release Status — 19.06.2026 — M1bo Waldtanz-Entwicklungsdaten-Schublade

## Status

Release abgeschlossen. Production und `origin/main` zeigen den finalen Stand auf der stabilen Alias <https://schlangentanz-v2.vercel.app>.

## Slice

M1bo ist ein mittlerer Google-Stitch/Waldtanz-Vertical: Auf `/game` dominieren nun die körperlichen Spielflächen, während die Entwicklungsdaten zu kompakten, geschlossenen Spielschubladen demotet sind. Die klassische offene Entwicklungsdaten-Ansicht außerhalb von `/game` bleibt erhalten.

## Sichtbarer Spielwert

- `Spielphase`, `Aktiver Spieler`, `Spielerstatus`, `Karten und Aufgaben` und `Punkteübersicht` sind auf `/game` eingeklappt und pillig/kompakt gestylt.
- Sonnenstand, Waldtanz-Spielhilfe, Schlangenbereich, Spielerbänke, Materialrucksack und Rangtafel bleiben sichtbar vor den Entwicklungsdaten.
- Die Startkreis-/Schlangenende-Smokes und Tests prüfen jetzt die sichtbare `Waldtanz-Zugtafel` statt versteckter Debug-Zeilen.

## Verifikation

- Targeted: `npm test -- --run src/App.m1bo_waldtanz_entwicklungsdaten_schublade.test.tsx src/App.m1be_waldtanz_startfaehrten.test.tsx src/App.m1bb_schlangenende_vorschau.test.tsx src/App.m1bn_waldtanz_spielhilfe.test.tsx` → 4 Testdateien / 12 Tests bestanden.
- Full: `npm test -- --run` → 280 Testdateien / 864 Tests bestanden.
- Gates: `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check`, `node scripts/live_smoke.mjs --self-test` grün.
- Lokaler Browser-Smoke: `SMOKE_BASE_URL=http://127.0.0.1:4179 npm run smoke:production` grün.
- Production-Smoke: `npm run smoke:production` grün auf <https://schlangentanz-v2.vercel.app> mit `/` und `/game` HTTP 200; M1bo meldet `5 Entwicklungsdaten-Schubladen eingeklappt`; keine Console-/Page-Errors.

## Commits

- `b014b91 — M1bo: Entwicklungsdaten als Spielschublade demoten`
- `b7cbdc4 — Smoke: Zugtafel statt Debugtext prüfen`

## Review / Abweichungen

Claude Code und `/simplify` waren weiterhin durch `401 Invalid authentication credentials` blockiert. Der Slice wurde eng manuell umgesetzt und von Codex reviewt; Review und Re-Review meldeten `BLOCKERS: None`.

## Nächste mittlere Lücke

Der nächste sinnvolle M1-Vertical sollte weiter sichtbaren Spielwert liefern statt erneut Debug-/A11y-Mikropolitur: entweder die noch verbleibenden Support-Flächen stärker als echte Spielobjekte rhythmisieren oder in M2 zu board-nahen Sonderkarten-Zielentscheidungen wechseln.
