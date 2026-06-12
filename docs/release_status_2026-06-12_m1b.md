# Release Status — 12.06.2026 M1b Waldtanz-Aktionsdock

## Slice

M1b innerhalb des Google-Stitch-Meilensteins `M1 Waldtanz Game Board`.

Ziel: Der `/game`-Screen soll nach M1a nicht wieder durch eine dominante Buttonliste geprägt werden. Schnelle Kontextaktionen sitzen jetzt als board-naher Dock direkt unter dem Spieltisch; die längere Aktionsliste bleibt als Fallback erhalten, aber visuell nachgeordnet.

## Warum mittlerer Vertical

- Mehr als ein Mikro-Slice: Die Aktionshierarchie im zentralen Spielbereich wurde sichtbar neu gewichtet; `Empfohlene Aktion` und `Phasenaktion` bilden eine schnelle Kontrollfläche direkt am Board.
- Kein Big-Bang: Engine-Regeln, Aktionshandler, Sonderkarten-Ziele, Hand/Schlangen-Interaktion, Debugdetails und Nebenbereiche bleiben unverändert.
- Direkt gegen die Google-Stitch-Richtung: chunky Forest-Dock, weniger Listen-Zentrum, weiterhin echte bedienbare Fallbacks.

## Scope

- `Aktionen` erhält die Dock-Klasse `aktionen-panel--waldtanz-dock` und bleibt direkt nach `Spieltisch`.
- `Empfohlene Aktion` und `Phasenaktion` werden in `.aktionen-dock__schnellzug` zusammengeführt.
- `Weitere Aktionen` bleibt als eigene Region nach den Schnellaktionen und enthält weiterhin Regelprüfungs-Copy sowie die vorhandenen Buttons.
- CSS reduziert die Dominanz der Fallback-Liste (`max-height`, Scroll-Containment, kompaktere Aktionsspalten) und macht das Panel sticky/board-nah.

## Bewusst ausgeschlossen

- Keine Engine-/Regeländerung.
- Keine neue Sonderkarten-Zielauswahl.
- Kein Drag-and-drop-Umbau.
- Kein Lobby-/Regelbuch-/Ergebnis-Screen.
- Keine rein mechanische A11y-/IDREF-/Live-Region-Härtung.

## Workflow-Evidenz

- RED: `npm test -- --run src/App.m1b_aktionsdock_layout.test.tsx` fiel initial erwartungsgemäß fehl, weil das Aktionenpanel nur `info-panel` war und Schnellzug-/Dock-Struktur fehlte.
- Claude Code GREEN: blockiert durch `401 Invalid authentication credentials`; enger manueller Fallback gemäß Workflow genutzt.
- Claude `/simplify`: ebenfalls durch `401 Invalid authentication credentials` blockiert; manuelle Simplify-Prüfung + Tests.
- Codex Review: `BLOCKERS: None`; Codex bestätigte erhaltene Labels, Handler, IDREF-/Fokus-Ziele, Live-Region-Attribute und den mittelgroßen sichtbaren Scope.

## Lokale Gates

- Targeted/Regression: `npm test -- --run src/App.m1b_aktionsdock_layout.test.tsx src/App.r173_aktionen_live_region_atomic.test.tsx src/App.r174_empfohlene_aktion_live_region_atomic.test.tsx src/App.r175_weitere_aktionen_live_region_atomic.test.tsx src/App.r176_phasenaktion_live_region_atomic.test.tsx src/App.f27_sprungziel_fokus.test.tsx` → 6 Testdateien / 6 Tests bestanden.
- Codex-Zusatzregression: 13 relevante Aktionen-/A11y-/Layout-Testdateien / 17 Tests bestanden.
- Full tests: `npm test -- --run` → 189 Testdateien / 680 Tests bestanden.
- Test-Line-Gate: `npm run check:test-lines` → alle Testdateien unter 500 Zeilen.
- Typecheck: `npm run typecheck` bestanden.
- Lint: `npm run lint` bestanden.
- Build: `npm run build` bestanden.
- Diff hygiene: `git diff --check` bestanden.

## Commit / Deploy / Smoke

- Feature-Commit: `92c380c — M1b: Waldtanz-Aktionsdock verdichten`.
- Production-Deploy: Vercel `READY`, Alias `https://schlangentanz-v2.vercel.app`.
- Production-Smoke nach Feature-Commit:
  - `/` HTTP 200.
  - `/game` HTTP 200.
  - Browser-Smoke ohne Console-/Page-Errors.
  - Live bestätigt: `Aktionen` hat `aktionen-panel--waldtanz-dock`, `position: sticky`, bleibt direkt nach `Spieltisch`, Schnellzug enthält `Empfohlene Aktion` und `Phasenaktion`, Reihenfolge `Empfohlen → Phasenaktion → Weitere Aktionen`, Fallback-Copy sichtbar, `Weitere Aktionen` scroll-contained.

## Ergebnis

Die primäre Spielersteuerung fühlt sich stärker wie ein Board-naher Waldtanz-Dock an: die schnelle Entscheidung und der Phasenabschluss liegen zusammen am Spielbrett, während die lange Buttonliste als kontrollierter Fallback untergeordnet bleibt. Damit bewegt sich M1 weiter weg vom Klicklisten-/Debuggefühl, ohne bestehende Engine-Aktionen zu verlieren.

## Nächste mittlere Lücke

M1c: Status/Spieler/Material/Wertung stärker als kompakte Stitch-Plaketten/Sidebars ausprägen und Entwicklungsdaten visuell weiter aus dem Vordergrund nehmen, ohne sie zu entfernen. Danach M2a/M2b: weitere board-nahe Sonderkarten-Zielauswahl für Farbenfusion/Schlangenfrass-Folgeschritte bzw. Farbendieb/Farbenschutz.
