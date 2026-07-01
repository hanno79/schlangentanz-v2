# Release-Status M3h-Folgeslice — M3c-Test-Migration + M3f-W5 Last-in-Chain-Dispens + M3h:7 Sibling-Test + M3h-Smoke-Threshold

**Datum:** 01.07.2026
**Slice-Klasse:** Half-Finished-Slice-Finalisierung (M3h-Folgeslice), Code-Complete-but-Uncommitted-Recovery + Pitfall-Discipline.
**Reviewer:** Codex CLI gpt-5.5 (Watchdog-Status OK, Kimi rate-limited; Codex OAuth quota reaktiviert).

## Problem

M3h `cb4c824` war bereits in main committed + deployed, aber der Cron-Lauf hat 4 modifizierte Test-/Source-Files hinterlassen, die **nicht committed** waren:

1. `src/components/SonnigesNestLobby.tsx` — strukturelle JSX-Änderung: `.lobby-slot__name` aus `.lobby-avatar` als Sibling rausgezogen (Pitfall #50: runder Border mit overflow:hidden schnitt die Pille geometrisch ab, Vision zeigte "Slippy Hos..." statt "Slippy Host").
2. `src/App.m3c_sonniges_nest_player_cards.test.tsx` — M3c-Test selektierte Namen via `avatar.querySelector('.lobby-slot__name')`, was nach M3h's Pitfall-50-Fix nicht mehr funktioniert.
3. `src/App.m3h_stitch_lobby_avatar.test.tsx` — neuer RED-Test M3h:7 (Sibling-Structure-Assert), der die JSX-Änderung zementiert.
4. `src/App.m3f_smoke_wiring.test.ts` — M3f-W5 Last-in-Chain-Discipline-Migration (Pitfall #14, Preventive-Form): von "ist exakt letzter Schritt" auf "ist in der Kette + M3h danach".

Plus: nach Production-Deploy der M3h-Sibling-Änderung war der M3h-Live-Smoke rot auf `body.scrollHeight <= 1100` (jetzt 1191), weil die Sibling-Struktur +91 px Scroll-Höhe kostet. Akzeptanz-Threshold musste an die neue Realität angepasst werden (Pitfall #34: Smoke-Threshold-Math-Korrektur, NICHT CSS-Wert senken).

## Stitch-Referenz

Kein neuer Design-Surface — alle Änderungen sind strukturelle + Test-Discipline-Migrationen. M3h selbst lieferte die Stitch-Player-Card-Visuals (Host-Badge "DU", Schwierigkeit im Flow, Forest-Boden-Streifen). Folgeslice härtet die Tests ab.

## Rein

### 1) JSX-Sibling-Restrukturierung (`SonnigesNestLobby.tsx`)

`SchlangeAvatar` nimmt kein `name`-Prop mehr entgegen. Der `<span className="lobby-slot__name">` wird in `SonnigesNestLobby` direkt als Sibling des `<SchlangeAvatar>` gerendert. Border-Clipping-Fix per JSX-Strukturänderung, nicht CSS-Override.

### 2) M3c-Test-Migration (`src/App.m3c_sonniges_nest_player_cards.test.tsx`)

```ts
// Vorher
const namen = Array.from(avatars).map((avatar) =>
  avatar.querySelector('.lobby-slot__name')?.textContent?.trim() ?? '',
)
// Nachher: Selektiere Namen ueber die Slots, nicht ueber die Avatare
const slots = container.querySelectorAll('.lobby-slot')
const namen = Array.from(slots).map(
  (slot) => slot.querySelector('.lobby-slot__name')?.textContent?.trim() ?? '',
)
```

### 3) M3h:7 Sibling-Structure-Test (Pitfall #50-Schutz)

```ts
it('M3h:7 — Name-Pille ist SIBLING vom Avatar (nicht Child), damit sie nicht vom runden Border abgeschnitten wird', () => {
  const slots = container.querySelectorAll('.lobby-slot')
  slots.forEach((slot) => {
    const avatar = slot.querySelector('.lobby-avatar')
    const name = slot.querySelector('.lobby-slot__name')
    expect(avatar).not.toBeNull()
    expect(name).not.toBeNull()
    // Die Name-Pille darf NICHT innerhalb des Avatars liegen.
    expect(avatar?.contains(name as Node)).toBe(false)
  })
})
```

### 4) M3f-W5 Last-in-Chain-Dispens (Pitfall #14, Preventive-Migration)

```ts
// Vorher: exakter letzter Schritt
expect(last).toContain('m3f_brettrund_waldobjekte_smoke.mjs')
// Nachher: member + index + Order-Constraint
expect(chain).toContain('m3f_brettrund_waldobjekte_smoke.mjs')
const m3fIndex = steps.findIndex((s) => s.includes('m3f_brettrund_waldobjekte_smoke.mjs'))
expect(m3fIndex).toBeGreaterThanOrEqual(0)
const m3hIndex = steps.findIndex((s) => s.includes('m3h_stitch_lobby_avatar_smoke.mjs'))
expect(m3hIndex).toBeGreaterThan(m3fIndex)
```

### 5) M3h-Smoke-Threshold-Anpassung (Pitfall #34)

`body.scrollHeight <= 1100` → `<= 1200` (neue Realität nach Sibling-Spalt, dokumentiert im Smoke-Header-Kommentar).

## Raus

- **KEINE** Engine-Änderungen
- **KEINE** CSS-Änderungen (alle Stil-Anpassungen sind in M3h `cb4c824` schon enthalten)
- **KEINE** neuen Komponenten
- **KEINE** Änderung an `useState`/Hooks
- **KEINE** Migration des `name`-Props zu optional (bleibt entfernt — die Komponente braucht es nicht mehr)

## Geometrie-Arithmetik

| Element | Vorher (Child im Avatar) | Nachher (Sibling) | Delta |
|---|---|---|---|
| `.lobby-avatar` | 150×150 (flex container, name inside) | 150×150 (nur SVG + ggf. Host-Badge) | -1px height |
| `.lobby-slot` (Flex-Column) | name war 5-10 px innerhalb des 150-px-Avatars | name ist eigene Flex-Item, 17-20 px hoch | +9-15 px |
| 4 Slots gestapelt | +0 px (alle kompakt) | +36-60 px (4 × 9-15) | +36-60 px total |
| `body.scrollHeight` | 1100 px (M3g-Vertrag) | 1191 px (M3h-Sibling-Spalt) | +91 px |

Threshold-Anpassung: 1100 → 1200 (10 px Puffer über dem 1191-Messwert, damit kleine zukünftige Spalten-Justierungen den Smoke nicht brechen).

## Gates

| Gate | Status |
|---|---|
| `npm run typecheck` | ✓ grün |
| `npm run lint` | ✓ grün |
| `npm run build` | ✓ grün, 245.66 kB CSS + 426.24 kB JS |
| `npx vitest run src/App.m3c_sonniges_nest_player_cards.test.tsx src/App.m3f_smoke_wiring.test.ts src/App.m3h_stitch_lobby_avatar.test.tsx` | ✓ 24/24 grün |
| `node scripts/m3h_stitch_lobby_avatar_smoke.mjs` (Production) | ✓ 14/14 grün, body.scrollHeight=1191 |
| `node scripts/m3c_sonniges_nest_player_cards_smoke.mjs` (Production) | ✓ 11/11 grün (Name-Pillen gefunden, Host ohne Difficulty) |
| `git diff --check` | ✓ grün |

## Commits

| Hash | Commit |
|---|---|
| `e5f06f6` | M3h-Folgeslice: M3c-Test-Migration + M3f-W5 Last-in-Chain-Dispens + M3h:7 Sibling-Test |
| `69d352e` | M3h-Folgeslice (Smoke-Threshold): 1100→1200 wegen M3h-Sibling-Spalt (Pitfall #34) |

## Deploy

- Vercel Production Alias: `https://schlangentanz-v2.vercel.app` (HEAD = `69d352e`)
- Production-Build bestätigt, 0 page-/console-errors, alle M3h-Smoke-Asserts grün
- Zweimaliges Deploy nötig: einmal für die JSX-Test-Migration (`e5f06f6`), einmal für die Smoke-Threshold-Anpassung (`69d352e`)

## Bekannte Probleme

- `body.scrollHeight` ist 91 px höher als der M3g-Vertrag von 1100 px. Akzeptabel, weil die Sibling-Struktur die Pitfall-50-Clipping-Bug fixt (sichtbarer Spielername statt "Slippy Hos..."-Truncation). Trade-off explizit akzeptiert.
- M3h-Doku vom 2026-07-01 `cb4c824` ist noch nicht ergänzt um die Folgeslice-Migrationen. Falls der nächste Cron-Lauf das als "lokal-fertig-review-blockiert" wertet, hier ist der Stand: **vollständig committed + deployed + smoke-grün**.

## Nächste mittlere Lücke Richtung echtes Spiel

Die Lobby ist jetzt visuell + strukturell auf Stitch-Niveau: Host-Badge "DU", Schwierigkeit im Flow, Forest-Boden-Streifen, sichtbare Spielernamen. **Nächste mittlere Stitch-Slice-Kandidaten aus M3g-Doku aktualisiert:**

- **M4 Waldtanz-Game-Board-Stitch-Promotion:** das zentrale Spielfeld `/game` ist funktional korrekt (R180 Farbenfusion, Sonderkarten-Brettziel, M1dk Phasen-Banner), aber visuell noch nicht im "Saturday-morning-cartoon" Stitch-Stil. Schlangen-Reihen + Handkarten + Brettrand + Magiekreise + Aktions-Dock konsolidieren zu einer sichtbaren Waldtanz-Arena.
- **M5 Endgame/Sieger-Party-Stitch:** Ergebnisse-Ansicht aus `die_sieger_party_results` — "Sieg im Sonnenwald"-Feier.
- **M6 Echte Mehrzug-Partie E2E:** Playwright-Test, der eine komplette Schlangentanz-Partie gegen die Spec durchspielt.

Empfehlung: **M4 zuerst** — das Game-Board auf `/game` ist die zentrale Spielerfahrung, alles andere baut darauf auf. M3h-Folgeslice hat die Lobby-Schicht abgeschlossen, jetzt fehlt die Spiel-Schicht.
