# Release-Status R108 — Schlangenhäutung Tastatur- und A11y-Polish

Author: rahn
Datum: 07.06.2026
Version: 1.0
Beschreibung: Lokaler Release-Nachweis für R108 — semantische Tastaturhilfe, Live-Vorschau und DOM-sichere aria-describedby-Verknüpfung in der Schlangenhäutung-Reihenfolge-Auswahl.

# ÄNDERUNG 07.06.2026: R108 dokumentiert einen kleinen UI-/A11y-Slice für die bestehende Schlangenhäutung-Auswahl.

## Ziel

R108 verbessert die bestehende Schlangenhäutung-Reihenfolge-Auswahl ohne neue Spielmechanik:

- Jede auswählbare Schlange wird als eigene semantische Gruppe angekündigt.
- Die lokale Kartenauswahl erhält eine explizite Tastaturhilfe.
- Die Vorschau für „Karte ans Ende“ wird als `role="status"` bereitgestellt.
- Select und Ausführen-Button referenzieren Tastaturhilfe und Vorschau per `aria-describedby`.
- `aria-describedby` nutzt DOM-sichere IDREFs, auch wenn eine fachliche Schlangen-ID Leerzeichen enthält.

## Umgesetzt

- `src/components/SchlangenhaeutungReihenfolgeAuswahl.tsx`:
  - Version auf `1.3` erhöht.
  - `useId()` ergänzt, damit IDREF-Tokens komponentenlokal eindeutig sind.
  - Pro Schlange eine Gruppe mit `role="group"` und Name `Schlangenhäutung für Schlange <id>` ergänzt.
  - Tastaturhinweis sichtbar ergänzt:
    - `Tastatur: Mit Tab zur Kartenauswahl wechseln, mit Pfeiltasten eine Karte wählen und danach den Ausführen-Button aktivieren.`
  - Vorschau „Neue Reihenfolge nach Karte ans Ende“ als `role="status"` mit sprechendem `aria-label` markiert.
  - Select und „Gewählte Karte ans Ende setzen“-Button per `aria-describedby` mit Tastaturhilfe und Vorschau verbunden.
- `src/App.r108_schlangenhaeutung_tastatur_a11y.test.tsx`:
  - Neuer R108-Regressionstest für semantische Gruppe, Tastaturhilfe, Live-Vorschau und accessible descriptions.
  - Review-Regression für Schlangen-ID mit Leerzeichen: `aria-describedby` muss genau zwei existierende IDREFs enthalten.

## Relevante Dateien

- `src/components/SchlangenhaeutungReihenfolgeAuswahl.tsx`
- `src/App.r108_schlangenhaeutung_tastatur_a11y.test.tsx`
- `docs/release_status_2026-06-07_r108.md`

## Tests und Gates

Ausgeführt lokal vor Commit-Freigabe:

```bash
npm test -- --run src/App.r108_schlangenhaeutung_tastatur_a11y.test.tsx
npm test -- --run src/App.r108_schlangenhaeutung_tastatur_a11y.test.tsx src/App.r102_schlangenhaeutung_reihenfolge_auswahl.test.tsx src/App.r104_schlangenhaeutung_umkehr_in_auswahl.test.tsx src/App.r105_schlangenhaeutung_reihenfolge_vorschau.test.tsx
npm run typecheck
npm run lint
npm run check:test-lines
npm test -- --run
npm run build
```

Ergebnis:

- RED bestätigt für initial fehlende semantische Gruppe/Live-Vorschau.
- RED bestätigt für Review-Blocker: rohe Schlangen-ID mit Leerzeichen zerlegte `aria-describedby` in 8 Tokens statt 2.
- Focused R108/R102/R104/R105 grün: 4 Testdateien, 5 Tests.
- Full Tests grün: 117 Testdateien, 594 Tests.
- Typecheck grün.
- Lint grün.
- Test-Dateilängencheck grün.
- Build grün.

## Review

- Claude Code GREEN-Pass mit Modell `opusplan`: semantische Gruppe, Tastaturhilfe, Live-Vorschau und `aria-describedby` ergänzt.
- Claude Code `/simplify`: doppelte `aria-describedby`-Zusammensetzung auf lokale Variable reduziert.
- Codex Review nach erstem GREEN:
  - BLOCKER: `aria-describedby`-IDs wurden direkt aus `schlange.id` gebildet; gültige fachliche IDs mit Leerzeichen brechen IDREF-Tokens.
- Umgesetzter Review-Fix:
  - neuer RED-Test mit Schlangen-ID `schlange r108 mit leerzeichen`,
  - DOM-sichere IDs per `useId()` plus gerendertem Schlangenindex,
  - sichtbare/fachliche Labels behalten weiterhin die echte Schlangen-ID.
- Claude Code `/simplify` nach Review-Fix:
  - keine Änderungen vorgenommen.
- Codex Re-Review:
  - BLOCKERS: none
  - Bestätigt: `aria-describedby` nutzt keine rohen fachlichen IDs mehr.
  - Bestätigt: IDs sind eindeutig pro Komponente und Schlange.
  - Bestätigt: Whitespace-ID-Regression ist aussagekräftig.
  - Bestätigt: React-Hooks sind gültig.
  - Bestätigt: R102/R104/R105-Verhalten bleibt erhalten.

## Bewusst nicht im Scope

- Keine Engine-Änderung.
- Keine neue Schlangenhäutung-Mechanik.
- Kein Drag&Drop-/Sortiermodell.
- Keine Änderung an Schlangenhäutung-Regelprüfung.
- Nicht im R108-Scope: ähnliche IDREF-Härtung in anderen Komponenten wie `Schlangenbereich.tsx`; das wäre ein separater kleiner Slice.

## Release-Status — abgeschlossen

# ÄNDERUNG 07.06.2026: Nach Commit, Push, Production-Deploy und Live-Smoke wurde der Release-Nachweis auf den verifizierten Produktionsstand aktualisiert.

R108 ist committed, gepusht, deployed und live verifiziert.

- R108-Implementierungscommit: `ba8041d947ce2db4d31a9fa173d0860999835736`
- Branch: `main`
- GitHub-Remote: `origin/main`
- Verifizierter Production-Alias: `https://schlangentanz-v2.vercel.app`
- Vercel-Ergebnis beim Release-Deploy: `READY`
- Hinweis: Dieser Release-Nachweis ist Teil des anschließenden Doku-Sync-Commits; nach dem Doku-Sync wird `main` erneut deployed und der Production-Alias erneut gesmoked.

## Production-Smoke

Ausgeführt gegen `https://schlangentanz-v2.vercel.app`:

```bash
node scripts/live_smoke.mjs
```

Ergebnis:

- `/` liefert HTTP 200.
- `/game` liefert HTTP 200.
- Browser-Kernregionen sichtbar:
  - `Spielstatus`
  - `Aktiver Spieler`
  - `Aktionen`
  - `Schlangenbereich`
- Keine `pageerror`- oder `console.error`-Meldungen im Browser-Smoke.

Zusätzlicher dynamischer First-Turn-Production-Smoke:

- Route: `https://schlangentanz-v2.vercel.app/game`
- Titel: `schlangentanz-v2`
- Ausgeführte Live-Aktion: `Neue Schlange starten mit Karte rot-11`
- `Zuletzt ausgeführt` sichtbar: ja
- Eigene Schlange mit gespielter Karte sichtbar: ja
- Browserfehler: `[]`
