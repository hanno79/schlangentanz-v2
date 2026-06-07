# Release-Status R100 — Schlangenhäutung UI-Fallback

Datum: 07.06.2026
Autor: rahn
Version: R100

## Ziel

Kleiner Folgeslice nach R99: Die Schlangenhäutung soll nicht nur als nicht-enumerierter Hinweis sichtbar sein, sondern erstmals über die UI einen echten Engine-Pfad auslösen können.

R100 bleibt bewusst klein: keine vollständige Sortier-/Drag&Drop-UI, sondern ein sicherer Fallback pro eigener aktiver Schlange, der die Kartenreihenfolge umkehrt und dann `SchlangenhaeutungSpielen` über die bestehende Engine-Validierung ausführt.

## Source of Truth

R100 ändert keine neue Regelmechanik gegenüber R98/R99. Die aktuelle Regelquelle bleibt https://schlangentanz.ch/rules; der Slice nutzt ausschließlich den bereits verifizierten R98-Vertrag:

- `Schlangenhäutung` ordnet eine eigene aktive Schlange neu.
- Die neue Reihenfolge muss dieselben Karten enthalten.
- Die Aktion läuft über `pruefeAktion` und `spieleSchlangenhaeutung`.

## Umsetzung

- Neuer UI-Helper `erstelleSchlangenhaeutungUmkehrAktionen` in `src/ui/schlangenhaeutungUiAktionen.ts`.
- Helper erzeugt pro eigener aktiver Schlange mit mehr als einer Karte einen Umkehr-Kandidaten.
- Jeder Kandidat wird vor Anzeige über `pruefeAktion(zustand, aktion).erlaubt` gefiltert.
- `AktionenPanel` zeigt im Bereich `Weitere verfügbare Aktionen` einen semantischen Fallback-Button:
  - `Schlangenhäutung: Schlange <id> umkehren`
- Button ruft `onAktionAusfuehren` auf und nutzt damit den bestehenden App-/Engine-Pfad:
  - `onAktionAusfuehren`
  - `anwendeAktion`
  - `pruefeAktion`
  - `spieleSchlangenhaeutung`
- `aktionsLabel` kennt nun `SchlangenhaeutungSpielen`, damit Debug-/Statusausgaben nicht mehr auf `Unbekannte Aktion` fallen.

## Tests

Neu:

- `src/App.r100_schlangenhaeutung_umkehren.test.tsx`
- `src/ui/schlangenhaeutungUiAktionen.test.ts`

Abgedeckt:

- UI zeigt einen eindeutigen Fallback-Button im Hinweise-Bereich.
- Klick auf den Button kehrt die eigene Schlange um.
- Schlangenhäutung-Handkarte landet auf dem Ablagestapel.
- Debug-/Statusausgabe zeigt die echte Schlangenhäutung-Aktion.
- Helper erzeugt keine UI-Kandidaten, wenn `pruefeAktion` die Aktion in der aktuellen Phase verbietet.

## Review

Erster unabhängiger Review: keine Release-Blocker, aber sinnvolle Härtungen:

- Helper sollte Kandidaten über `pruefeAktion` filtern.
- Fallback-Button-Gruppe sollte eine echte semantische Gruppierung haben.

Fix:

- RED-Test für illegale Phase ergänzt.
- Helper filtert über `pruefeAktion`.
- Fallback-Gruppe nutzt `role="group"` mit `aria-label="Schlangenhäutung-Fallbacks"`.

Zweiter unabhängiger Review: keine Release-Blocker.

## Verifikation

Ausgeführt am 07.06.2026:

```bash
npm test -- --run src/App.r100_schlangenhaeutung_umkehren.test.tsx
npm test -- --run src/ui/schlangenhaeutungUiAktionen.test.ts src/App.r100_schlangenhaeutung_umkehren.test.tsx src/App.r99_schlangenhaeutung_hinweis.test.tsx
npm test -- --run src/App.r100_schlangenhaeutung_umkehren.test.tsx src/App.r99_schlangenhaeutung_hinweis.test.tsx src/engine/__tests__/turn_state_r98_schlangenhaeutung.test.ts src/engine/__tests__/legal_actions_enumerator_sonderkarten.test.ts
npm run build
npm test -- --run
npm run check:test-lines
git diff --check
```

Ergebnis:

- RED bestätigt: R100-Button fehlte zuerst.
- Zieltest grün.
- Helper-Regression grün.
- Targeted Regressionen grün: 26/26 Tests.
- Production-Build grün.
- Volltest grün: 112 Testdateien, 585 Tests bestanden.
- Test-Dateilängencheck grün.
- `git diff --check` grün.
- Dateigrößen eingehalten:
  - `src/App.tsx`: 487 Zeilen.
  - `src/components/AktionenPanel.tsx`: 269 Zeilen.
  - `src/ui/schlangenhaeutungUiAktionen.ts`: 30 Zeilen.

## Bewusst nicht im Scope

- Keine frei sortierbare Reihenfolge.
- Kein Drag&Drop-Reordering.
- Keine Permutations-Enumeration in `ermittleLegaleAktionen`.
- Keine neue Engine-Regelmechanik gegenüber R98.

## Nächster sinnvoller kleiner Schritt

Die Umkehr-Fallback-Aktion zu einer echten Reihenfolge-Auswahl ausbauen: zunächst eine lokale, testbare Kartenreihenfolge-Auswahl für eine ausgewählte eigene Schlange, danach erst Drag&Drop-Polish.
