# Release Status — M1ap Aktionsfallback unter dem Brett

Datum: 15.06.2026  
Produktionsalias: https://schlangentanz-v2.vercel.app  
Feature-Commit: `8649160 — M1ap: Aktionsfallback unterordnen`

## Scope

Mittlerer sichtbarer Google-Stitch/Waldtanz-Vertical innerhalb `M1 Waldtanz Game Board`: Auf `/game` bleibt der Spieltisch primär. `Empfohlene Aktion` und `Phasenaktion` bleiben als schnelle Kontextsteuerung sichtbar, während die lange generische `Weitere Aktionen`-Liste plus `Phasenregeln` in einen geschlossenen `Brett-Fallback: weitere Aktionen und Regeln`-Bereich unter dem Brett wandert. Die offene Aktionsliste auf `/` und bestehende Engine-/Handler-Pfade bleiben unverändert.

## Warum mittlerer Vertical

- Kein A11y-/IDREF-Mikroslice: Die Änderung adressiert sichtbar das Buttonlisten-/Klicksimulator-Gefühl.
- Kein Big-Bang: Nur das Aktionsdock wird route-spezifisch untergeordnet; Board, Hand, Engine, Lobby, Regeln und Sieger-Party bleiben stabil.
- Spielwert: Der erste `/game`-Eindruck priorisiert Arena, Handkarten und board-nahe Schnellsteuerung statt einer dominanten allgemeinen Buttonliste.

## Bewusst nicht geändert

- Keine Engine-/Regeländerungen und keine neue Aktionsermittlung.
- Keine Entfernung der Fallback-Aktionen; sie bleiben über das Details-Fallback erreichbar.
- Keine Änderung der Labels/Handler für bestehende Aktionsbuttons.
- Keine weitere Layout-Cap-Schleife an Arenastein/Zugleiste.

## Verifikation

- RED: `npm test -- --run src/App.m1ap_aktionsfallback_untergeordnet.test.tsx` fiel initial wegen fehlender `/game`-Fallback-Klasse und fehlendem geschlossenem Details-Fallback fehl.
- GREEN/Adjacent: `npm test -- --run src/App.m1ap_aktionsfallback_untergeordnet.test.tsx src/App.m1b_aktionsdock_layout.test.tsx src/App.test.tsx -t 'R27 UI-Zug beenden|M1ap|M1b'` → 3 Testdateien / 4 relevante Tests bestanden.
- Claude Code / `/simplify`: `claude --model opusplan` und `/simplify` waren durch `401 Invalid authentication credentials` blockiert; enger manueller Fallback plus manuelle Simplify-Prüfung wurde genutzt.
- Codex Review/Re-Review: Initiale Blocker zu KI-no-reaction-Fallbackstatus und CSS-Source-Selector-Kollision wurden behoben; Re-Review: `BLOCKERS: None`.
- Full Gates: `npm test -- --run` → 249 Testdateien / 799 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` grün.
- Feature-Deploy: Vercel Production auf stabilem Alias `https://schlangentanz-v2.vercel.app` (`READY`).
- Production Smoke: `npm run smoke:production -- --url https://schlangentanz-v2.vercel.app` → `/` und `/game` HTTP 200, Kernregionen sichtbar.
- M1ap-Browser-Smoke auf Alias: `/game` hat `spielbereich--game-route`, Aktionen `aktionen-panel--brettfallback`, sichtbare Schnellzug-Regionen `Empfohlene Aktion` und `Phasenaktion`, geschlossenes `details.aktionen-fallback` mit Summary `Brett-Fallback: weitere Aktionen und Regeln`, enthaltene `Weitere Aktionen` + `Phasenregeln`, Handkarten weiterhin nach der Arena (`arenaBottom 875.234375`, `handTop 890.59375`); `/` hat kein Fallback-Details und behält offene `Weitere Aktionen`; keine Console-/Page-Errors.

## Nächste mittlere Lücke

Der generische Aktionsfallback dominiert `/game` nicht mehr. Als nächster spielwertiger Slice sollte wieder eine konkrete Brettentscheidung verbessert werden, nicht weitere Container-Politur: z.B. Spezialkarten-/Questziele noch stärker als direkt erkennbare Waldobjekt-Entscheidungen oder eine Mehrzug-Playability-Strecke, die zeigt, dass der kompakte Waldtanz vom ersten Zug in echte Schlangen-/Questplanung übergeht.
