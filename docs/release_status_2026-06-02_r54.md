# Release-Status 02.06.2026 — R54

## Kurzstatus
- R54 ist umgesetzt und live ausgerollt.
- Commit auf `main`: `fa59750`
- Produktion: `https://schlangentanz-v2.vercel.app`
- Deploy-Status: `Ready`

## Umgesetzte Änderungen
- Im Bereich **Aktiver Spieler** wird jetzt die **nächste legale Aktion** als Hinweis angezeigt.
- Der zuvor statische Text `Engine-Demo: Ausspielphase` wurde auf den echten `zustand.zugphase`-Wert umgestellt.
- Der neue UI-Test prüft den Hinweis und dessen Aktualisierung nach einer Aktion.

## Verifikation
- `npm test -- --run src/App.test.tsx src/App.r54.test.tsx` ✅
- `npm run typecheck` ✅
- `npm run lint` ✅
- `npm run build` ✅
- GitHub `HEAD == origin/main` ✅
- Vercel-Deploy + Alias-Smoke ✅

## Live-Smoke
- Heading sichtbar: `Schlangentanz v2 Greenfield Rebuild`
- Initialer Hinweis im aktiven Spielerbereich sichtbar
- Klick auf die erste legale Aktion aktualisiert den Hinweis korrekt
- Keine Console-, Page- oder Request-Fehler

## Nächster sinnvoller Slice
- Eine kompakte Erweiterung der **Aktiver Spieler**-Anzeige um die **aktuelle Gesamtwertung des aktiven Spielers**.
- Das ist rein visuell, nutzt vorhandene Engine-Wertung und lässt sich nach einem Klick gegen den aktualisierten Zustand prüfen.
