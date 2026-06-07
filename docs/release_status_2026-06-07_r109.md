# Release-Status R109 — DOM-sichere A11y-IDREFs im Schlangenbereich

Author: rahn
Datum: 07.06.2026
Version: 1.0
Beschreibung: Lokaler Release-Nachweis für R109 — Schlangenbereich nutzt komponentenlokale DOM-IDs für aria-describedby statt fachlicher Spieler- und Schlangen-IDs.

# ÄNDERUNG 07.06.2026: R109 dokumentiert einen kleinen UI-/A11y-Härtungs-Slice ohne Engine- oder Regeländerung.

## Ziel

R109 härtet die bestehenden A11y-Beschreibungsverknüpfungen im Schlangenbereich:

- `aria-describedby` darf nicht aus rohen fachlichen Spieler- oder Schlangen-IDs zusammengesetzt werden.
- Fachliche IDs mit Leerzeichen oder Sonderzeichen dürfen IDREF-Tokens nicht zerlegen.
- Startzone und eigene Schlange referenzieren jeweils genau ein echtes Beschreibungselement.
- Sichtbare/fachliche Labels bleiben unverändert.
- Keine Engine-, Regel- oder Interaktionsänderung.

## Umgesetzt

- `src/components/Schlangenbereich.tsx`:
  - Version auf `2.0` erhöht.
  - `useId()` ergänzt.
  - Startzone nutzt `${komponentenId}-startzone-hinweis` statt `schlange-startzone-hinweis-${aktiverSpieler.id}`.
  - Eigene Schlangen nutzen `${komponentenId}-schlange-${schlangeIndex}-anlegehilfe` statt `schlange-${schlange.id}-anlegehilfe`.
  - Sichtbare Labels und fachliche ARIA-Namen bleiben erhalten, z. B. `Neue Schlange starten` und `Schlange <schlange.id>`.
- `src/App.r109_schlangenbereich_dom_sichere_idrefs.test.tsx`:
  - Neuer Regressionstest mit Spieler-ID `spieler r109 mit leerzeichen`.
  - Neuer Regressionstest mit Schlangen-ID `schlange r109 mit leerzeichen`.
  - Prüft, dass `aria-describedby` genau ein Token enthält.
  - Prüft, dass das referenzierte Beschreibungselement im DOM existiert.
  - Prüft, dass die accessible description für Startzone und eigene Schlange erhalten bleibt.

## Relevante Dateien

- `src/components/Schlangenbereich.tsx`
- `src/App.r109_schlangenbereich_dom_sichere_idrefs.test.tsx`
- `docs/release_status_2026-06-07_r109.md`

## Tests und Gates

Ausgeführt lokal vor Commit-Freigabe:

```bash
npm test -- --run src/App.r109_schlangenbereich_dom_sichere_idrefs.test.tsx
npm test -- --run src/App.r109_schlangenbereich_dom_sichere_idrefs.test.tsx src/App.f35_schlangen_kartenreihe.test.tsx src/App.f36_drag_drop_schlange.test.tsx src/App.f36_drag_drop_schlange_status.test.tsx src/App.r108_schlangenhaeutung_tastatur_a11y.test.tsx
npm run typecheck
npm run lint
npm run check:test-lines
npm test -- --run
npm run build
```

Ergebnis:

- RED bestätigt: `aria-describedby` der Startzone zerfiel bei Spieler-ID mit Leerzeichen in 4 Tokens statt 1.
- Focused R109/F35/F36/R108 grün: 5 Testdateien, 25 Tests.
- Full Tests grün: 118 Testdateien, 595 Tests.
- Typecheck grün.
- Lint grün.
- Test-Dateilängencheck grün.
- Build grün.
- `git diff --check` grün.
- Dateilängen:
  - `src/components/Schlangenbereich.tsx`: 364 Zeilen.
  - `src/App.r109_schlangenbereich_dom_sichere_idrefs.test.tsx`: 61 Zeilen.

## Review

- Claude Code GREEN-Pass mit Modell `opusplan`:
  - `useId()` in `Schlangenbereich.tsx` ergänzt.
  - Startzone und eigene Schlangen auf komponentenlokale IDREFs umgestellt.
  - Fokussierter Test wurde grün.
- Claude Code `/simplify`:
  - Redundante TextContent-Assertion im R109-Test entfernt.
  - Keine Verhaltensänderung.
- Codex Review nach `/simplify`:
  - BLOCKERS: none
  - NON-BLOCKERS: none
  - Bestätigt: keine rohen fachlichen IDs mehr in `aria-describedby`/Beschreibung-`id`s im R109-Scope.
  - Bestätigt: IDs sind innerhalb des Renders eindeutig und stabil genug.
  - Bestätigt: Test deckt Startzone und eigene Schlange ab.
  - Bestätigt: Drag&Drop-/Klick-Verhalten und sichtbare Labels bleiben unverändert.

## Bewusst nicht im Scope

- Keine Engine-Änderung.
- Keine Regeländerung.
- Keine neue Drag&Drop- oder Klick-Interaktion.
- Keine Änderung an sichtbaren fachlichen Labels.
- Keine Härtung anderer Komponenten außerhalb von `Schlangenbereich.tsx`.

## Release-Status — lokal fertig, releasebereit

R109 ist lokal implementiert, reviewed und durch Full Gates verifiziert.

Noch nicht ausgeführt:

- Commit
- Push nach `origin/main`
- Production-Deploy
- Production-Smoke
- finaler Doku-Sync nach Live-Smoke

Grund: Projektregel verlangt Commit-Freigabe vor Versionierung.

## Nächster Release-Schritt

Nach Freigabe:

1. R109-Dateien stagen.
2. Commit mit deutscher Nachricht erstellen.
3. Nach `origin/main` pushen.
4. Production-Deploy über Vercel mit Token aus Shell-Umgebung ausführen.
5. `npm run smoke:production` gegen `https://schlangentanz-v2.vercel.app` ausführen.
6. Einen dynamischen First-Turn-Smoke gegen `/game` ausführen.
7. Release-Nachweis von `lokal fertig, releasebereit` auf `abgeschlossen` aktualisieren.
