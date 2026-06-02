# Release-Status R57 — Aktive-Spieler-Kennzeichnung

Datum: 02.06.2026

## Ziel
Die Spielerübersicht soll den aktiven Spieler sichtbar als `am Zug` kennzeichnen und zusätzlich per `aria-current` zugänglich machen.

## Umsetzung
- `src/App.tsx` markiert den aktiven Eintrag in der Spielerübersicht mit `— am Zug`.
- Der aktive Eintrag erhält `aria-current="true"`.
- Bestehende UI-Tests wurden an die neue Sichtbarkeitsregel angepasst.

## Verifikation
- `npm test -- --run src/App.test.tsx src/App.r54.test.tsx src/App.r55.test.tsx src/App.r56.test.tsx src/App.r57.test.tsx` ✅
- `npm run typecheck` ✅
- `npm run lint` ✅
- `npm run build` ✅

## Verifikation
- Produktions-Deploy abgeschlossen.
- Live-Smoke gegen `https://schlangentanz-v2.vercel.app` bestanden: HTTP 200, sichtbare aktive-Spieler-Kennzeichnung `— am Zug`, `Nächste legale Aktion` aktualisiert sich nach Klick, keine Console-/Page-/Request-Fehler.
