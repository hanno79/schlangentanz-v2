# Release Status — 15.06.2026 — M1an Quest-Zugkarten in der Hand

Status: **Release complete** auf `https://schlangentanz-v2.vercel.app`.

## Slice

M1an ist ein mittlerer Google-Stitch/Waldtanz-Vertical im Milestone `M1 Waldtanz Game Board`: Der Handfächer zeigt jetzt direkt, welche Karten eine offene Quest-Fährte durch einen legalen Schlangenbau-Zug voranbringen. Das macht die Handkarten spielentscheidender, ohne den ganzen Board-Screen neu zu bauen.

## Sichtbare Änderung

- Handkarten können ein `Quest-Zug`-Badge tragen.
- Die ausgewählte Handkarte zeigt zusätzlich zur `Brettzielkarte` eine `Questzielkarte` mit den betroffenen Quest-Fährten.
- Die Hinweise kommen engine-nah aus bereits legal enumerierten `NeueSchlangeStarten`-/`KarteAnlegen`-Aktionen und werden über `anwendeAktion` gegen den echten Engine-Pfad simuliert.
- Der Stil bleibt im Google-Stitch-Zielbild: pillige Badges, Sunny-Gold/Lime-Flächen, Dark-Forest-Border und Hard Shadow.

## Nicht enthalten

- Keine neuen Engine-Regeln.
- Keine Änderung an Drag-and-drop oder direkter Board-Ausführung.
- Keine Lobby-/Schlangenbuch-/Sieger-Party-Änderung.
- Keine A11y-Mikroslice-Arbeit ohne sichtbaren Spielwert.

## Verifikation

- Targeted: `npm test -- --run src/App.m1an_questzug_handkarten.test.tsx` → 1 Testdatei / 4 Tests bestanden.
- Adjacent: `npm test -- --run src/App.m1an_questzug_handkarten.test.tsx src/App.m1am_questfaehrten_aufgabentafel.test.tsx src/App.m1al_farbgruppenband_schlangenlichtung.test.tsx src/App.m1aa_zielkarte_vorschau.test.tsx` → 4 Testdateien / 11 Tests bestanden.
- Full Gates: `npm test -- --run` → 247 Testdateien / 796 Tests bestanden.
- `npm run check:test-lines` → alle Testdateien unter 500 Zeilen.
- `npm run typecheck` → grün.
- `npm run lint` → grün.
- `npm run build` → grün.
- `git diff --check` → grün.

## Review

- Claude Code Implementierung und `/simplify` waren durch `401 Invalid authentication credentials` blockiert; die Änderung wurde als enger manueller Fallback umgesetzt und manuell vereinfacht.
- Codex Review fand Blocker zu Startkreis-Zügen, Farbharmonie-Falschpositiven und Engine/UI-Boundary.
- Diese Blocker wurden test-first behoben.
- Codex Re-Review: `BLOCKERS: None`.

## Release

- Feature-Commit: `8a6a0a6 — M1an: Questzug-Hinweise auf Handkarten zeigen`.
- Push: `main -> origin/main` erfolgreich.
- Production Deploy: Vercel `READY`, stabile Alias `https://schlangentanz-v2.vercel.app`.
- Generic Production Smoke: `/` und `/game` HTTP 200, Kernregionen sichtbar.
- M1an Production Smoke: deterministischer Browser-Smoke bestätigt `Quest-Zug` im Handfächer, `Farbkombination +1`, 4 Quest-Badges, computed Badge-Radius `999px`, `borderTopWidth: 2px`, Sunny-Gold-Hintergrund `rgb(254, 203, 0)` und keine Console-/Page-Errors.

## Nächste mittlere Lücke

Als nächster sichtbarer Vertical bietet sich an, die Quest-Zughinweise stärker mit der Aufgabentafel/Board-Zielspur zu verbinden: Beim Auswählen einer Quest-Zugkarte sollte die passende Questkarte auf der `Waldtanz-Aufgabentafel` sichtbar mitleuchten, damit aus Badge → Zielkarte → Brettzone ein noch klarerer Spielerentscheidungsfluss wird.
