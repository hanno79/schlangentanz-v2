# R177 Release-Nachweis — Farbkarten sichtbar einfärben

## Status

R177 ist umgesetzt, getestet, reviewed, committed, gepusht, deployed und gegen den stabilen Production-Alias allgemein sowie slice-spezifisch live gesmoked. Der Slice ist bewusst kein weiterer Live-Region-/A11y-Mikroslice, sondern ein sichtbarer Playability-Schritt: Farbkarten wirken in Hand und Schlangenreihe erstmals als farbige Kartenflächen statt als generische Klickflächen.

## Scope

- Handkarten erhalten für alle sechs Farben farbspezifische CSS-Klassen `handkarte--farbe-*`.
- Karten in eigenen und gegnerischen Schlangenreihen erhalten passende `schlangekarte__karte--farbe-*`-Klassen.
- `src/kartenfarben.ts` zentralisiert die Abbildung von Engine-Farben auf CSS-sichere Klassensuffixe.
- `src/App.css` nutzt pro Kartenfarbe eigene CSS-Variablen für Fläche, Rand und Textkontrast.

## Nicht-Ziele

- Keine Engine-/Regeländerung.
- Keine Änderung an Aktionsauswahl, Drag-and-Drop-Logik oder Zugphasen.
- Keine weitere atomare Live-Region-Härtung.

## RED → GREEN

- RED: `npm test -- --run src/App.r177_farbige_kartenflaechen.test.tsx` fiel erwartungsgemäß fehl, weil Hand- und Schlangenkarten nur generische Farbkarten-Klassen hatten und keine sechs unterschiedlichen CSS-Flächen definiert waren.
- GREEN: Farbspezifische Klassen und CSS-Variablen für Handkarten und Schlangenkarten ergänzt.
- Neuer Test: `src/App.r177_farbige_kartenflaechen.test.tsx` prüft DOM-Klassen für alle sechs Farben in Hand und Schlangenreihe sowie unterschiedliche, konsistente CSS-Farbwerte.

## Claude Code / Simplify

Claude Code und die separate `/simplify`-Vorprüfung waren durch `401 Invalid authentication credentials` blockiert. Der Slice wurde daher manuell eng umgesetzt, anschließend objektiv getestet und mit Codex Review überprüft.

## Codex Review

Codex Review-only prüfte den aktuellen uncommitted Worktree inklusive untracked R177-Dateien.

- Erste Prüfung: keine Blocker; ein Non-Blocker bemängelte, dass die CSS-Werte im Test noch nicht auf Unterschiedlichkeit geprüft wurden.
- Nach Testhärtung: `BLOCKERS: none`, `NON-BLOCKERS: none`.

## Gates

- Fokustests: `npm test -- --run src/App.r177_farbige_kartenflaechen.test.tsx src/App.r77.test.tsx src/App.f13_spielbrett_layout.test.tsx src/App.f31_spieltisch_layout.test.tsx` → 4 Testdateien / 5 Tests bestanden.
- Vollsuite: `npm test -- --run` → 183 Testdateien / 672 Tests bestanden.
- `npm run check:test-lines` → bestanden (`Alle Testdateien bleiben unter 500 Zeilen.`).
- `npm run typecheck` → bestanden.
- `npm run lint` → bestanden.
- `npm run build` → bestanden (`✓ built in 237ms`).
- `git diff --check` → bestanden.
- Lokaler Smoke gegen Vite Preview: `SMOKE_BASE_URL=http://127.0.0.1:4173 npm run smoke:production` → `/` und `/game` HTTP 200; Kernregionen sichtbar; keine Console-/Page-Errors.

## Commit / Push

- Feature-Commit: `8aa268f — R177: Farbkarten sichtbar einfärben`.
- Push: `origin/main` aktualisiert.

## Deploy / Smoke

- Feature-Deploy: `vercel deploy --prod --yes --token=…` → Production-Alias `https://schlangentanz-v2.vercel.app` wurde als `READY`/`Aliased` bereitgestellt.
- Feature-Deployment-URL: `https://schlangentanz-v2-azj53aq4d-alfreds-projects-7e9df1b4.vercel.app`.
- Hinweis: Falls dieser Nachweis als Docs-Commit nach dem Feature-Deploy gepusht wird, wird der finale Docs-Sync-Deploy im Abschlussbericht erneut gegen den Production-Alias gesmoked, um selbstreferenziellen Doku-Commit-Churn zu vermeiden.
- Generischer Production-Smoke: `SMOKE_BASE_URL=https://schlangentanz-v2.vercel.app npm run smoke:production` → `/` und `/game` HTTP 200; Kernregionen `Spielstatus`, `Aktiver Spieler`, `Aktionen`, `Schlangenbereich` sichtbar; keine Console-/Page-Errors.
- R177 Browser-Smoke: Production-Alias `/game` bestätigt farbspezifische Handkartenflächen und nach Startaktion mindestens eine farbspezifische Schlangen-Kartenfläche (`handkartenFarbklassen: 4`, `schlangenFarbklassenNachStart: 1`).

## Nächster echter Spielwert-Schritt

Der nächste Slice sollte weiter vom Klick-Simulator wegführen: z. B. Aktionsbuttons für Start/Anlegen stärker in echte Board-Ziele überführen oder Sonderkarten-Aktionen visuell als Kartenaktion am Tisch darstellen, statt weitere generische UI-/A11y-Unterregionen zu härten.
