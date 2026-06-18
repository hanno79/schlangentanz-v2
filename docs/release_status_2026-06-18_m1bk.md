# Release-Status — 18.06.2026 M1bk Waldtanz-Zugtafel

## Scope

Mittlerer sichtbarer Google-Stitch/Waldtanz-Vertical innerhalb `M1 Waldtanz Game Board`: Der Bereich `Aktiver Spieler` bekommt vor den Entwicklungsdaten eine körperliche `Waldtanz-Zugtafel` mit Spieler, Zugführung, nächstem Pflichtschritt, Punkten, Handkarten, Schlangenanzahl, letzter Aktion und persönlicher Quest. Engine-Regeln, Aktionsenumeration, bestehende Aktionsbuttons, Spielerführung, Debug-/Entwicklungsdaten und Board-Interaktionen bleiben unverändert.

Warum kein Mikro-Slice: Die Änderung macht eine bisher debuglastige Kerninformation zu einem sichtbaren Spielobjekt im aktiven Spielerfluss. Warum kein Big-Bang: Es wird nur eine neue Anzeigefläche im bestehenden Aktiver-Spieler-Bereich ergänzt; keine Engine-, Layout-Großstruktur- oder Interaktionspfad-Änderung.

## TDD / Umsetzung

- RED: `src/App.m1bk_waldtanz_zugtafel.test.tsx` fiel initial erwartungsgemäß, weil `Waldtanz-Zugtafel` und der CSS-Vertrag fehlten.
- GREEN: `src/components/AktiverSpielerZugtafel.tsx` ergänzt die Zugtafel; `src/App.tsx` platziert sie zwischen `Aktionen` und `Entwicklungsdaten: Aktiver Spieler`; `src/App.css` ergänzt 3px-Stitch-Border, `var(--st-shadow-hard)`, runde Chips und den goldenen Pflichtschritt.
- Review-Fund: Codex fand eine doppelte sichtbare `Geheime Aufgabe:`-Zeile im breiten `Aktiver Spieler`-Bereich. Die Zugtafel nutzt jetzt `Persönliche Quest:`, während die Debug-Regressionen R50/R65 die alte Zeile weiter eindeutig in den Entwicklungsdaten finden.
- CSS-Guard-Fund aus Full-Suite: Die Zugtafel nutzte zunächst nicht definierte/breit verbotene CSS-Tokens; gefixt auf definierte Tokens `--st-color-background`, `--st-color-primary-container` und `--st-color-secondary-container`.

## Review

- Claude Code / `/simplify`: `claude --model opusplan` war durch `401 Invalid authentication credentials` blockiert; enger manueller Fallback plus manuelle Diff-/Line-Budget-Simplify-Prüfung wurde genutzt.
- Codex Review: initialer Blocker zu doppelter `Geheime Aufgabe:`-Copy behoben; finaler Re-Review nach CSS-Token-Fix: `BLOCKERS: None`, `NON-BLOCKERS: None`.

## Verifikation

- Targeted/Adjacent: `npm test -- --run src/App.m1bk_waldtanz_zugtafel.test.tsx src/App.r50.test.tsx src/App.r65.test.tsx src/App.m1b_aktionsdock_layout.test.tsx src/App.f27_sprungziel_fokus.test.tsx src/App.r147_aktiver_spieler_idref.test.tsx src/App.f10_debuggruppen.test.tsx` → 7 Testdateien / 10 Tests bestanden.
- CSS-Regression: `npm test -- --run src/App.m1bk_waldtanz_zugtafel.test.tsx src/App.m1k_waldtanz_aufgabentafel.test.tsx src/App.r50.test.tsx src/App.r65.test.tsx` → 4 Testdateien / 7 Tests bestanden.
- Full Gates: `npm test -- --run` → 276 Testdateien / 853 Tests bestanden; `npm run check:test-lines`; `npm run typecheck`; `npm run lint`; `npm run build`; `git diff --check`; `node scripts/live_smoke.mjs --self-test` jeweils grün.
- Build-Artefakte: `dist/assets/index-KNg1O2Oh.css`, `dist/assets/index-U6b5kRGQ.js`.

## Release

Finaler HEAD wird per Vercel Production auf die stabile Alias `https://schlangentanz-v2.vercel.app` deployt und dort per Browser-Smoke geprüft. Die dauerhafte Release-Referenz ist die stabile Alias, nicht eine ephemere Deployment-URL.

## Nächste mittlere Lücke

Nach M1bk bleibt als nächster spielwertiger Vertical entweder eine weitere konkrete Brett-/Sonderkarten-Interaktion mit physischem Zielobjekt oder ein M5-Playability-Flow, der mehrere reale Züge bis Endspurt/Sieger-Party stärker live absichert. Keine erneute mechanische A11y-/IDREF-Mikroserie starten.
