# Release-Status R110 — DOM-sichere Detail-Titel-ID im HandkartenPanel

Author: rahn
Datum: 07.06.2026
Version: 1.0
Beschreibung: Lokaler Release-Nachweis für R110 — HandkartenPanel nutzt eine komponentenlokale Detail-Titel-ID statt einer statischen DOM-ID.

# ÄNDERUNG 07.06.2026: R110 dokumentiert einen kleinen UI-/A11y-Härtungs-Slice ohne Engine- oder Regeländerung.

## Ziel

R110 härtet die Detailansicht der ausgewählten Handkarte:

- Mehrfach gerenderte `HandkartenPanel`-Instanzen dürfen keine doppelte DOM-ID `handkarten-detail-titel` erzeugen.
- `aria-labelledby` des Detailbereichs muss genau ein IDREF-Token enthalten.
- Das referenzierte Titel-Element muss im DOM existieren.
- Sichtbare fachliche Karten-IDs bleiben unverändert, auch wenn sie Leerzeichen enthalten.
- Keine Engine-, Regel- oder Interaktionsänderung.

## Umgesetzt

- `src/components/HandkartenPanel.tsx`:
  - Version auf `1.1` erhöht.
  - `useId()` ergänzt.
  - Detailbereich nutzt `detailTitelId` für `aria-labelledby`.
  - Detailtitel nutzt dieselbe `detailTitelId` als `id`.
  - Sichtbare Texte und Kartenlabels bleiben unverändert.
- `src/App.r78_handkarten_auswahl.test.tsx`:
  - Version auf `1.1` erhöht.
  - R110-Regressionsfall ergänzt.
  - Rendert zwei `HandkartenPanel`-Instanzen mit ausgewählten Karten und whitespace-bearing Karten-IDs.
  - Prüft eindeutige `aria-labelledby`-Werte.
  - Prüft je IDREF genau ein Token und existierendes Ziel-Element.

## Relevante Dateien

- `src/components/HandkartenPanel.tsx`
- `src/App.r78_handkarten_auswahl.test.tsx`
- `docs/release_status_2026-06-07_r110.md`

## Tests und Gates

Ausgeführt lokal am 07.06.2026 vor Commit-Freigabe:

```bash
npm test -- src/App.r78_handkarten_auswahl.test.tsx --run
npm run typecheck
npm run lint
npm test -- --run
npm run build
```

Ergebnis:

- RED bestätigt: Neuer R110-Test schlug vorher fehl, weil zwei Detailbereiche dieselbe statische ID referenzierten (`new Set(titleIds).size` war `1` statt `2`).
- Fokussierter Test grün: `src/App.r78_handkarten_auswahl.test.tsx`, 3/3 Tests.
- Typecheck grün.
- Lint grün.
- Full Tests grün: 118 Testdateien, 596 Tests.
- Build grün: `vite build`, 37 Module transformiert.
- Dateilängen:
  - `src/components/HandkartenPanel.tsx`: 83 Zeilen.
  - `src/App.r78_handkarten_auswahl.test.tsx`: 92 Zeilen.

## Review

- Claude Code GREEN-Pass mit Modell `opusplan`:
  - `useId()` in `HandkartenPanel.tsx` ergänzt.
  - Statische Detail-Titel-ID ersetzt.
  - Fokussierter Test wurde grün.
- Claude Code `/simplify`:
  - Test nutzt vorhandenen `farbkarte()`-Helper.
  - Zweite Testkarte als Konstante extrahiert.
  - Keine Verhaltensänderung.
- Codex Review nach `/simplify`:
  - BLOCKERS: keine.
  - NON-BLOCKERS: Header-/Zeilenlängen-Hinweise; direkt bereinigt.
  - Import aus `./engine/__tests__/testHelpers` ist kein Blocker, weil er in mehreren App-Tests etabliert ist.

## Bewusst nicht im Scope

- Keine Engine-Änderung.
- Keine Regeländerung.
- Keine neue Handkarten-Interaktion.
- Keine Änderung sichtbarer fachlicher Labels.
- Keine Härtung weiterer Komponenten außerhalb von `HandkartenPanel.tsx`.

## Release-Status — lokal fertig, releasebereit

R110 ist lokal umgesetzt, reviewt und durch lokale Gates verifiziert.

Noch offen bis Release-Abschluss:

1. Commit-Freigabe durch Nutzer.
2. Commit auf `main`.
3. Push nach `origin/main`.
4. Production-Deploy auf Vercel.
5. Production-Smoke gegen `https://schlangentanz-v2.vercel.app` inklusive `/game` und Browser-Fehlerfreiheit.
6. Finaler Doku-/Dart-Sync von „lokal fertig“ auf „abgeschlossen und live verifiziert“.

## Abschluss lokal

Stand 07.06.2026 15:07 UTC: R110 ist lokal releasebereit. Keine offenen lokalen Gate-Blocker.
