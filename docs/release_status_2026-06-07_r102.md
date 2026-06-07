# Release-Status R102 — Schlangenhäutung lokale Reihenfolge-Auswahl

Datum: 07.06.2026
Autor: rahn
Version: R102

## Ziel

Kleiner Folgeslice nach R101: Die Schlangenhäutung-UI soll nicht nur feste Quick-Optionen anbieten, sondern eine erste lokale Auswahl erlauben.

R102 bleibt bewusst klein: keine freie Vollsortierung, kein Drag&Drop und keine Engine-Regeländerung. Der Slice erlaubt genau eine lokale Auswahl: Eine gewählte Karte der eigenen aktiven Schlange wird ans Ende gesetzt.

## Source of Truth

R102 nutzt den bestehenden Engine-Vertrag aus R98/R100/R101:

- `Schlangenhäutung` ordnet eine eigene aktive Schlange neu.
- Die neue Reihenfolge muss exakt dieselben Karten enthalten.
- Eine unveränderte Reihenfolge ist illegal.
- Die UI baut nur eine Kandidaten-Aktion; Legalität und Ausführung laufen über `pruefeAktion` und `anwendeAktion`/`spieleSchlangenhaeutung`.

## Umsetzung

- `src/components/SchlangenhaeutungReihenfolgeAuswahl.tsx`
  - Neue kleine UI-Komponente für den Hinweise-Bereich.
  - Zeigt `Schlangenhäutung-Reihenfolge-Auswahl` als eigene zugängliche Gruppe.
  - Pro eigener aktiver Schlange mit mehr als einer Karte:
    - Combobox: `Karte aus Schlange <id> ans Ende setzen`.
    - Button: `Schlangenhäutung: gewählte Karte aus Schlange <id> ans Ende setzen`.
  - Baut die neue Reihenfolge lokal als: alle anderen Karten in Originalreihenfolge + gewählte Karte am Ende.
  - Filtert über `pruefeAktion`; ungültige identische Reihenfolgen bleiben disabled.
- `src/components/AktionenPanel.tsx`
  - Verdrahtet die neue Komponente unter dem bestehenden Schlangenhäutung-Hinweis.
  - Bestehende R100/R101-Quick-Optionen bleiben erhalten.

## Tests

Neu:

- `src/App.r102_schlangenhaeutung_reihenfolge_auswahl.test.tsx`

Abgedeckt:

- UI zeigt die neue Gruppe `Schlangenhäutung-Reihenfolge-Auswahl` im Bereich `Weitere verfügbare Aktionen`.
- Die lokale Auswahlcopy ist sichtbar.
- Auswahl `blau-r102-1` in der Schlange `rot, blau, grün` und Klick auf den Ausführen-Button löst eine echte Engine-Aktion aus.
- Schlangenhäutung-Handkarte landet auf dem Ablagestapel.
- Ergebnis-Reihenfolge ist `rot, grün, blau`.

## Review

Claude Code:

- GREEN- und `/simplify`-Versuche waren weiterhin blockiert: `Failed to authenticate. API Error: 401 Invalid authentication credentials`.
- Umsetzung und Simplify-Prüfung wurden deshalb manuell durchgeführt.

Codex Review:

- Keine Blocker.
- Nichtblocker: Bestehende Quick-Option „erste Karte ans Ende“ und neue lokale Auswahl sind UX-seitig redundant, aber funktional für diesen Übergangsslice akzeptabel.
- A11y, Sicherheit, Engine-Vertrag und Line-Limits ohne Beanstandung.

## Verifikation

Ausgeführt am 07.06.2026:

```bash
npm test -- --run src/App.r102_schlangenhaeutung_reihenfolge_auswahl.test.tsx
npm test -- --run src/App.r102_schlangenhaeutung_reihenfolge_auswahl.test.tsx src/App.r101_schlangenhaeutung_erste_karte_ans_ende.test.tsx src/App.r100_schlangenhaeutung_umkehren.test.tsx src/App.r99_schlangenhaeutung_hinweis.test.tsx src/ui/schlangenhaeutungUiAktionen.test.ts
npm test -- --run
npm run typecheck
npm run lint
npm run build
npm run check:test-lines
git diff --check
```

Ergebnis:

- RED bestätigt: Gruppe `Schlangenhäutung-Reihenfolge-Auswahl` fehlte zuerst.
- Focused Tests grün: 5 Testdateien, 7 Tests.
- Volltest grün: 114 Testdateien, 589 Tests.
- Typecheck grün.
- Lint grün.
- Production-Build grün.
- Test-Dateilängencheck grün.
- `git diff --check` grün.
- Dateigrößen eingehalten:
  - `src/App.tsx`: 487 Zeilen.
  - `src/components/AktionenPanel.tsx`: 277 Zeilen.
  - `src/components/SchlangenhaeutungReihenfolgeAuswahl.tsx`: 102 Zeilen.
  - `src/App.r102_schlangenhaeutung_reihenfolge_auswahl.test.tsx`: 66 Zeilen.

## Bewusst nicht im Scope

- Keine frei sortierbare Reihenfolge.
- Kein Drag&Drop-Reordering.
- Keine Permutations-Enumeration in `ermittleLegaleAktionen`.
- Keine neue Engine-Regelmechanik.
- Keine Entfernung der R100/R101-Quick-Optionen.

## R102 Release abgeschlossen — 2026-06-07

- Commit Feature: `f219d84 R102: Schlangenhäutung-Reihenfolge-Auswahl ergänzen`
- Push: `main -> origin/main`
- Production: [https://schlangentanz-v2.vercel.app](https://schlangentanz-v2.vercel.app)
- Vercel Production-Alias: [https://schlangentanz-v2.vercel.app](https://schlangentanz-v2.vercel.app)
- Live Smoke:
  - `/` HTTP 200
  - `/game` HTTP 200
  - R102-Bundle-Strings `Schlangenhäutung-Reihenfolge-Auswahl`, `gewählte Karte aus Schlange` und `Wähle lokal eine Karte` im Production-Asset gefunden.
  - Playwright GUI Smoke auf Production erfolgreich.
  - Geprüfte Regionen: `Spielstatus`, `Aktiver Spieler`, `Aktionen`, `Schlangenbereich`.
  - Keine Console Errors.
  - Keine Page Errors.

## Nächster sinnvoller kleiner Schritt

Nach R102 kann die Redundanz reduziert werden: Entweder Quick-Optionen in die lokale Auswahl integrieren oder eine kleine Zwei-Schritt-Reihenfolge-Auswahl bauen, bevor Drag&Drop-Polish folgt.
