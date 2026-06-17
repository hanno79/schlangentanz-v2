# Release-Status 17.06.2026 — M2n Farbenfusion-Rankenring

## Status

Release abgeschlossen auf der stabilen Production-Alias: https://schlangentanz-v2.vercel.app

## Slice

M2n ist ein mittlerer, sichtbarer Board-Interaktions-Vertical im `M1/M2 Waldtanz Game Board`: Eine ausgewählte `Farbenfusion`-Karte erzeugt auf dem Schlangenpfad einen körperlichen `Farbenfusion-Rankenring` mit Icon, Eyebrow, Zauberkarten-Name, Karten-Paar und Punkten. Die Engine-Aktion bleibt Quelle der Wahrheit; die bisherige flache Text-Buttonfläche wurde durch ein Spielobjekt ersetzt.

## Umsetzung

- Refaktored Komponenten-Slice: `src/components/FarbenfusionPaarziel.tsx` ersetzt die flache `farbenfusion-paarziel`-Plakette durch das körperliche Spielobjekt `farbenfusion-rankenring` mit Icon, Eyebrow, Zauberkarten-Name, Karten-Paar und Punkten; Partner-Karte erhält den `Rankenpartner`-Chip.
- `src/components/Schlangenbereich.tsx` rendert den Rankenring bzw. Rankenpartner-Chip auf den passenden Schlangenkarten.
- `src/App.css` ergänzt Stitch-Spielobjekt-Vertrag: `--st-border-width-chunky`, `--st-radius-xl`, `--st-shadow-hard`, `--st-color-secondary-container` plus Sunny/Orange-Verlauf.
- `src/App.m2n_farbenfusion_rankenring.test.tsx` beweist sichtbaren Rankenring, eindeutigen Partner-Chip und echte Engine-Ausführung; schützt den CSS-Vertrag gegen flache Textplaketten.
- `src/App.m2g_farbenfusion_paarziel.test.tsx` wurde auf den neuen Rankenring-Vertrag aktualisiert und bleibt als Nachbarschaftsregression erhalten.

## Verifikation

- RED: `npm test -- --run src/App.m2n_farbenfusion_rankenring.test.tsx` scheiterte initial, weil Rankenring und CSS-Vertrag fehlten.
- Targeted: `npm test -- --run src/App.m2n_farbenfusion_rankenring.test.tsx src/App.m2g_farbenfusion_paarziel.test.tsx` → 2 Testdateien / Tests bestanden.
- Full Gates: `npm test -- --run` → 265 Testdateien / 830 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` grün.
- Build-Artefakte: `dist/assets/index-7lDV5o_J.css`, `dist/assets/index-CqQG1qY9.js`.

## Deploy und Smoke

- Feature-Commit: `<PLACEHOLDER_COMMIT>`.
- Production-Deploy: `<PLACEHOLDER_DEPLOY>`.
- Slice-Smoke: `<PLACEHOLDER_SMOKE>`.

## Nächste mittlere Lücke

Weiter Richtung echtes Spielgefühl: Die nächste sinnvolle mittlere Lücke ist ein weiterer spielwertiger Board-Interaktions-Vertical, z. B. die verbleibenden Sonderkarten-Ziele als konsistente Zauberwerkzeuge auf dem Brett vereinheitlichen oder ein körperliches Endspurt-/Sieger-Feedback-Objekt, das den bestehenden Rankenring-, Schutzschild-, Frass- und Fusion-Spielobjekten visuell ähnelt — ohne neue Engine-Regeln oder A11y-Mikroslice.
