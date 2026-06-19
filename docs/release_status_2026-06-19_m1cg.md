# Release-Status — 19.06.2026 — M1cg Waldtanz-Zugpfad-Waldsteine

## Scope

Mittlerer sichtbarer Google-Stitch/Waldtanz-Vertical innerhalb `M1 Waldtanz Game Board`: Der `Zugpfad` in der kompakten Unterholzleiste wirkt jetzt wie horizontale Waldstein-Spielsteine statt wie eine Mini-Statusliste. Das macht die Zugreihenfolge am Brett lesbarer, ohne Engine-Regeln, Aktionspfade, Drag-and-drop, Handkarten-Auswahl oder den Aktionsfallback zu verändern.

## Umsetzung

- `src/components/Zugpfad.tsx`: ergänzt route-/CSS-nutzbare Waldstein-Modifikator-Klassen für Zugpfad, Strecke und Stationen.
- `src/App.css`: verdichtet den `/game`-Zugpfad nach den generischen Zugpfad-Regeln cascade-sicher; Du/KI-Badges bleiben sichtbar, Name/Status/Phase werden im engen Steinmodus visuell demotet.
- `src/App.m1cg_waldtanz_zugpfad_waldsteine.test.tsx`: schützt Struktur, sichtbare Badges, CSS-Order/Cascade und Smoke-Wiring.
- `scripts/m1cg_zugpfad_waldsteine_smoke.mjs`: prüft `/` und `/game`, zwei Default-Spielsteine, horizontale Geometrie, kein internes Scrollen, aktiven Hit-Test, Rail-Containment und Browserfehlerfreiheit bei 1100px/1280px.
- `package.json`: bindet den M1cg-Smoke in `npm run smoke:production` ein.

## Verifikation

- Targeted/Adjacent: `npm test -- --run src/App.m1cg_waldtanz_zugpfad_waldsteine.test.tsx src/App.m1cf_waldtanz_unterholzleiste.test.tsx src/App.m5c_waldpfad_zugleiste.test.tsx tests/r107_live_smoke_script.test.ts` → 4 Testdateien / 9 Tests bestanden.
- Full Gates: `npm test -- --run` → 297 Testdateien / 901 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün.
- Lokaler Vite-Preview-Smoke: `SMOKE_BASE_URL=http://127.0.0.1:4179 npm run smoke:production` grün inklusive `M1cg Zugpfad-Waldsteine 1100px/1280px: 2 Spielsteine horizontal, TopDelta 6px, Rail ...`.
- Claude Code / `/simplify`: `claude --model opusplan` und die separate `/simplify`-Vorprüfung blieben durch `401 Invalid authentication credentials` blockiert; der Slice wurde als enger manueller Fallback mit RED-Test, manueller Simplify-/Cascade-Prüfung und Codex-Review umgesetzt.
- Codex Review/Re-Reviews: initiale Blocker zu CSS-Cascade und zu permissiver Produktions-Spielerzahl wurden test-first behoben. Nach Smoke-Blocker-Fixes bestätigte Codex final `BLOCKERS: None`.

## Release

- Feature-Commit: `0228e44 — M1cg Zugpfad als Waldstein-Spielsteine`.
- Push: `main -> origin/main` erfolgreich.
- Production Deploy: Vercel Production auf stabile Alias `https://schlangentanz-v2.vercel.app`, `READY`.
- Production Smoke: `npm run smoke:production` gegen `https://schlangentanz-v2.vercel.app` grün; `/` und `/game` HTTP 200, bestehende Waldtanz-Verträge M1bx/M1by/M1bz/M1ca/M1cb/M1cc/M1cd/M1ce/M1cf und neu M1cg bei 1100px/1280px; keine Console-/Page-Errors.

## Nächste mittlere Lücke

Die Unterholzleiste ist jetzt spielsteinartig. Der nächste sinnvolle mittlere Game-Board-Vertical sollte weiter echten Spielwert erzeugen, z. B. die `Waldtanz-Zugspur`/Aktionshistorie noch körperlicher als Pfad-/Spurenobjekt mit klarer letzter Brettaktion oder eine board-nahe Ziel-/Feedback-Fläche für die nächste häufige Sonderkartenentscheidung — nicht wieder ein isolierter A11y-/IDREF-Mikroslice.
