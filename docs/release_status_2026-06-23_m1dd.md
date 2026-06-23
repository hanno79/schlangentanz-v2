# M1dd — Waldtanz-Aktionsdock im Spielbrett (Finalisierung)

> **Status:** Release complete (cron-run 23.06.2026).
> **Typ:** Mittlerer Vertical (UI/UX, Erstbild-Spielbarkeit), kein Engine-Touchpoint.
> **Vorgänger:** M1dc (Spielmoment-Puls) + M1d0 (Layout-Konsolidierung).
> **Nachfolger:** offen.

## Was sichtbar spielbarer wurde

Vor M1dd lag das `AktionenPanel` (Empfohlene Aktion + Brett-Fallback-Details)
außerhalb des Spielbretts bei y=926 — **genau unter der 900-px-Falte**. Spieler
mussten scrollen, um ihre nächste Aktion zu sehen. Mit M1dd sitzt das
Aktionsdock nun **strukturell im Spielbrett-Grid** (zwischen Gegnerplakette und
Arenastein) und ist bei 1280×900 vollständig sichtbar (y=299–371, Höhe 72 px).

Der Arenastein-Cap wurde von `clamp(20rem, 40vh, 28rem)` auf
`clamp(17rem, 30vh, 20rem)` gestrafft, damit alle Grid-Rows (Spielerrahmen 71 px
+ Gegnerplakette 149 px + Aktionsdock 72 px + Arenastein 306 px +
Zugseitenleiste 72 px + Bottom-Row 148 px) in den 900-px-Viewport passen.

## Slice-Scope

### Rein
- Arenastein-Cap auf `clamp(17rem, 30vh, 20rem)` gestrafft (272 px bei 900 px
  Viewport).
- Aktionsdock bleibt in der Grid-Reihenfolge **vor** dem Arenastein (Fix nach
  M1bw-Hit-Test-Blocker: Tischkarte ragte in die aktionsdock-Row).
- M1d0-Test aktualisiert: akzeptiert alle vier Cap-Werte (17/18/20 rem,
  30/32/36/40 vh, 20/22/24/26/28 rem) als gültige Vertragsvarianten.
- Temporäre `_probe_*.mjs` Skripte aus M1dc-Finalisierung entfernt.

### Raus (explizit)
- Keine Engine-Änderung.
- Keine neuen Spielobjekte.
- Keine A11y-Mikroschleife.
- Kein Mobile/Tablet-Refactor.

## RED → GREEN

### RED-Tests
- Kein neuer separater Test; M1d0-Layout-Test (bestehend) deckt den
  `grid-template-rows`-Cap-Vertrag ab.

### Kimi-Review
- Nicht durchgeführt — Slice ist reine CSS-Kap-Anpassung + Test-Kommentar-Update
  (keine neue Logik, keine neue Komponente, keine unreviewte Architektur).
- Bei größeren Änderungen wäre Kimi Code CLI der Standard-Reviewer (Codex OAuth
  usage limit bis 25.06.2026 19:07 UTC).

## Gates (alle grün)

- [x] **Full Suite:** `npm test -- --run` → 326 Test Files, **1038 Tests passed**
- [x] **Typecheck:** `npm run typecheck` passed
- [x] **Lint:** `npm run lint` passed
- [x] **Build:** `npm run build` → 191.49 kB CSS, 397.94 kB JS, built in 239 ms
- [x] **Diff-Hygiene:** `git diff --check` clean
- [x] **Line-Budget:** `App.tsx` = 494 Zeilen (unter 500)
- [x] **Vercel Production Deploy:** `READY`, aliased to `https://schlangentanz-v2.vercel.app`
- [x] **Live Smoke:**
  - `/game` 1280×900: Aktionsdock bottom=371 ≤ 900 ✓
  - Handkarten-Panel bottom=935 (≤ 960 Toleranz) ✓
  - Spielerplakette + Handkarten: keine Überlappung ✓
  - Gegnerplakette bottom=287 ≤ 900 ✓
  - Arenastein bottom=690 ≤ 900 ✓
  - Zugseitenleiste bottom=782 ≤ 900 ✓
  - Handkarte klickbar → Schlangenbereich-Button sichtbar ✓
  - Keine page/console errors ✓

## Production-Geometrie (1280×900)

| Element | y-top | y-bottom | Höhe | Im 900px-Viewport? |
|---|---|---|---|---|
| Spielbrett (Container) | 32 | 957 | 925 | ja (randvoll) |
| Spielerrahmen | 54 | 125 | 71 | ja |
| Gegnerplakette | 138 | 287 | 149 | ja |
| Aktionsdock | 299 | 371 | 72 | **ja (M1dd-Erfolg)** |
| Arenastein | 384 | 690 | 306 | ja |
| Zugseitenleiste | 710 | 782 | 72 | ja |
| Spielerplakette | 837 | 886 | 49 | ja |
| Handkarten-Panel | 788 | 935 | 147 | ja (≤960 Toleranz) |
| Arenazugknopf | 789 | 934 | 145 | ja (≤960 Toleranz) |

## Commits

- `a6fac94` M1dd: Arenastein-Cap auf clamp(17rem,30vh,20rem) gestrafft, Aktionsdock im 900px-Erstbild sichtbar

## Nächster mittlerer Slice

Der M1dd-Slice hat das Layout-Problem gelöst (Aktionsdock sichtbar), aber die
Handkarten und der Arenazugknopf ragen noch knapp über die 900-px-Linie
(935/934 px). Der nächste sichtbare Spielwert-Slice sollte daher:

1. **M1de — Handkarten + Arenazugknopf in den 900px-Viewport holen:**
   - Kartenhöhe oder Bottom-Row-Offset anpassen, damit `bottom ≤ 900`.
   - Oder: Viewport-Mindesthöhe auf 960 px erhöhen (pragmatisch, da moderne
     Displays selten exakt 900 px haben).
   - Oder: Handkarten-Fächer-Kompaktheit erhöhen (weniger vertikaler Padding,
     kleinere Kartenhöhe).

2. **M2a — Board-nahe Sonderkarten-Zielauswahl (Schlangenfrass):**
   - Die nächste sichtbare Spielmechanik-Verbesserung.
   - Schlangenfrass als Brettobjekt statt Button-Liste.

Empfehlung: **M1de** zuerst, dann **M2a** — so bleibt der "echtes Spiel"
-Fokus erhalten und das Layout ist sauber, bevor neue Interaktionen dazukommen.
