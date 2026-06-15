# Release Status — 15.06.2026 — M1v Waldtanz-Gegnerfächer

## Slice
M1v ist ein mittlerer sichtbarer Google-Stitch/Waldtanz-Vertical innerhalb `M1 Waldtanz Game Board`: Gegnerische Hände werden im `Waldtanz-Spielerrahmen` nicht mehr als kleine generische Emoji-Reihe, sondern als verdeckte, peeking Kartenfächer mit Score-Plakette und sichtbarem Fächerlabel direkt am Spieltisch gezeigt.

## Warum kein Mikro-Slice und kein Big-Bang
- Kein Mikro-Slice: Der Slice verbessert ein zentrales Brettgefühl sichtbar — die Gegner sitzen nun als echte Tischplätze mit verdecktem Kartenfächer am Waldtanz-Tisch.
- Kein Big-Bang: Engine-Regeln, KI-Zugfluss, Sonderkarten-Ziele, Aktionsdock, Handkarten, Schlangenbereich, Lobby, Regeln und Ergebnisansicht bleiben unverändert.
- Der Slice vertieft die Google-Stitch-Board-Referenz (oben verdeckte Gegnerkarten, Score-Plaketten, tactile card backs), ohne eine neue Interaktionsklasse einzuführen.

## Umsetzung
- `src/components/WaldtanzSpielerrahmen.tsx`: Gegnerliste/Plätze erhalten Kartenfächer-Klassen; gegnerische Hände werden als verschachtelte, spielerbezogen beschriftete `ol`-Fächer mit verdeckten Kartenrücken gerendert; Schlangengrube-Zielbuttons bleiben unverändert erhalten.
- `src/App.css`: ergänzt peeking Fächerlayout, 3px Dark-Forest-Border, Hard Shadow, Kartenrücken-Gradienten, rotationsversetzte `nth-child`-Transforms und sichtbares `verdeckter Kartenfächer`-Label.
- `src/App.m5f_waldtanz_tischrunde.test.tsx`: direkte Gegnerplätze werden bewusst über `children` geprüft, damit die neuen verschachtelten Kartenlisten nicht als zusätzliche Gegner zählen.
- Neuer Test `src/App.m1v_waldtanz_gegnerfaecher.test.tsx` schützt DOM-Struktur, sichtbare Copy, Kartenanzahl und CSS-Vertrag.

## Verification lokal
- RED: `npm test -- --run src/App.m1v_waldtanz_gegnerfaecher.test.tsx` fiel initial erwartungsgemäß fehl, weil Kartenfächer-Markup/CSS fehlten.
- Claude Code / `/simplify`: `claude --model opusplan` war weiterhin durch `401 Invalid authentication credentials` blockiert; Implementierung und Simplify-Vorprüfung wurden als enger manueller Fallback durchgeführt und offen dokumentiert.
- Codex Review: Review-only auf uncommitted Diff inklusive untracked M1v-Test; `BLOCKERS: None`. Codex bestätigte verschachtelte Listen-Semantik, erhaltene Schlangengrube-Buttons, Testintegrität, CSS-Kaskade, Linienbudget und sichtbaren mittleren Slice-Zuschnitt.
- Targeted: `npm test -- --run src/App.m1v_waldtanz_gegnerfaecher.test.tsx src/App.m5f_waldtanz_tischrunde.test.tsx` → 2 Dateien / 3 Tests bestanden; Codex ergänzend: `src/App.m2e_schlangengrube_spielerziel.test.tsx` mit grün geprüft.
- Full Gates: `npm test -- --run` → 229 Dateien / 751 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` grün.

## Release
- Commit: `c264a6c — M1v: Gegnerfächer am Waldtanz-Tisch`.
- Push: `origin/main` aktualisiert.
- Production-Deploy: Vercel Production auf stabilem Alias `https://schlangentanz-v2.vercel.app` (`READY`).
- Generic Smoke: `SMOKE_BASE_URL=https://schlangentanz-v2.vercel.app node scripts/live_smoke.mjs` → `/` und `/game` HTTP 200, Kernregionen sichtbar, keine Console-/Page-Errors.
- M1v-Browser-Smoke: bestätigt auf Production `/` und `/game` HTTP 200, `.waldtanz-spielerrahmen__gegnerliste--kartenfaecher`, `.waldtanz-spielerrahmen__gegnerplatz--kartenfaecher`, `Verdeckter Kartenfächer von Spieler 2`, `5` Stitch-Kartenrücken, sichtbare Copy `verdeckter Kartenfächer`/`5 verdeckte Karten`, computed `borderTopWidth: 3px`, Hard Shadow `rgb(6, 57, 7)` und unterschiedliche Peeking-Transforms; keine Console-/Page-Errors.

## Nächste mittlere Lücke
Weiter in M1/M2: Die Tischplätze fühlen sich mehr nach Kartenspiel an. Als nächstes sollte eine weitere sichtbare Board-/Interaktionslücke gewählt werden — zum Beispiel direktere Gegnerkarten-/Reaktionsflächen oder ein mehrzügiger Playability-Flow — statt eine neue ARIA-/Copy-Mikroserie zu starten.
