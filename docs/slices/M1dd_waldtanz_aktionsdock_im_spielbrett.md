# M1dd — Waldtanz-Aktionsdock-im-Spielbrett

> **Status:** Smoke-Blocker-Fix in-scope. Erst-Commit `91c6774` (M1dd-Aktionsdock
> in der Grid-Reihenfolge `arenastein → aktionsdock → zugseitenleiste`) wurde
> nach Production-Deploy revidiert, weil der M1bw-Hit-Test im Production-Alias
> fehlschlug (Tischkarte-DOM-Rect-Mittelpunkt lag im geclippten Arenastein-
> Bereich). Fix: Aktionsdock wandert **vor** den Arenastein, Arenastein-Cap
> zurück auf M1d0-Originalwert. Release-Status: `docs/release_status_2026-06-23_m1dd.md`
> wird nach Deploy geschrieben.
> **Typ:** Mittlerer Vertical (UI/UX, Erstbild-Spielbarkeit), kein Engine-Touchpoint.
> **Vorgänger:** M1d0 (Layout-Konsolidierung) + M1dc (Spielmoment-Puls).
> **Nachfolger:** offen.

## Befund (warum dieser Slice nötig ist)

User-Feedback 22.06.2026 + 23.06.2026:
> "Weg vom Button-geklickt-/Debuglisten-Gefühl hin zu echtem Spielerlebnis."

Auf `/game` (1280×900) wird das Spielbrett vollständig im Erstbild angezeigt
(Spielbrett y=32-926, also 894 px). Aber die `AktionenPanel` (Empfohlene Aktion
+ Brett-Fallback-Details) liegt aktuell AUSSERHALB des Spielbretts im
Parent-Container `info-panel--waldtanz-arena` und beginnt bei y=926 — also
**genau unter der 900-px-Falte**. Das Spielerlebnis fühlt sich an wie:

1. Spieler sieht oben die Arena mit Schlangen.
2. Spieler klickt Handkarte, Brettziele leuchten pulsierend (M1db + M1dc).
3. Spieler klickt Ziel, Aktion landet im Brettschritt-Stempel.
4. Spieler muss **scrollen**, um zu sehen, was die "Empfohlene Aktion" war
   oder welche "weiteren Aktionen" verfügbar sind.

Punkt 4 ist der "Click-Simulator"-Moment: die Spielerin spielt, aber die
**Aktionsauswahl ist unsichtbar**. Der Slice M1dd rückt das Aktionendock
strukturell in das Spielbrett und komprimiert es so, dass es im Erstbild
1280×900 mit-lesbar bleibt.

Aktuelle Maße (Stand 2a29a4f, Browser-Probe 23.06.2026 06:00 UTC):

| Element | y-Position | Höhe | Im Erstbild (y<900)? |
|---|---|---|---|
| Spielbrett (Container) | 32 – 926 | 894 px | ja (randvoll) |
| Spielerrahmen | 54 – 125 | 71 px | ja |
| Gegnerplakette | 138 – 287 | 149 px | ja |
| Arenastein | 299 – 659 | 360 px | ja |
| Zugseitenleiste | ~659 – 744 | ~85 px | ja |
| Bottom-Row (Plakette + Hand + Arenazug) | 744 – 904 | 160 px | ja |
| **Aktionen-Panel** | **926 – 1297** | **371 px** | **nein, komplett unter der Falte** |
| Aktiver-Spieler-Zugtafel (lobby) | – | – | ausgeblendet auf /game |

Quelle: Repo-Local Playwright-Probe `scripts/_probe_current.mjs` (vor Slice).

### Root-Cause-Hypothese

- `AktionenPanel` wird in `src/App.tsx:430` als **Geschwister** des
  `<section className="spielbrett spielbrett--waldtanz">` gerendert, nicht als
  Kind. Es sitzt damit im gemeinsamen Parent `info-panel--waldtanz-arena`,
  der keine Höhenrestriktion für das Aktionsdock hat.
- Die CSS-Regel `.spielbereich--game-route .aktionen-panel--waldtanz-dock
  { position: static; max-height: none; overflow: visible; }` deaktiviert den
  sonst wirksamen Sticky-Mechanismus.
- Die CSS-Regel `.spielbereich--game-route [class~="aktionen-panel--brettfallback"]
  { margin-top: 0; padding: 0.75rem; }` komprimiert das Padding, lässt aber die
  Inhaltshöhe (Empfohlene Aktion 189 px + Details-Summary 53 px = 242 px + Header)
  unangetastet.

### User-Mapping

"Was ist meine Empfohlene Aktion?" → muss ohne Scrollen sichtbar sein.
"Welche Brettschritt-Stempel sind schon da?" → Brettschritt-Stempel sitzt im
Arenastein und ist sichtbar — passt.
"Kann ich eine spezielle Karte spielen?" → Sonderkarten-Aktionen sind bereits
am Brett als Fährten sichtbar (M1cj/M1ck/M1cm) — passt.
"Was kann ich sonst noch tun?" → das ist der Aktionendock — soll **im
Erstbild** liegen.

## Slice-Scope

### Rein

1. **AktionenPanel wird strukturelles Kind des `spielbrett--waldtanz`-Grids**:
   in `src/App.tsx` zwischen `</HandkartenPanel>` und `</WaldtanzArenazugknopf>` ist
   es nicht mehr — nach dem M1bw-Hit-Test-Smoke-Blocker (Tischkarte ragte in
   die aktionsdock-Row) wurde die Position auf zwischen `</Gegnerplakette>`
   und `<Arenastein>` verlegt. Die Renderposition bleibt innerhalb des
   spielbrett--waldtanz-Containers, aber die Grid-Zeile `aktionsdock` sitzt
   jetzt VOR der `arenastein`-Zeile, damit der Arenastein-Cap bei 360 px
   bleiben kann und die Tischkarte (Brettschritt-Stempel) wieder
   vollstaendig im Arenastein-Renderbereich sichtbar ist.
2. **Neue Grid-Row `aktionsdock`** in `src/App.css` (`.spielbereich--game-route
   [class~="spielbrett--waldtanz"]`): `grid-template-areas` bekommt die Zeile
   **zwischen `gegner-plakette` und `arenastein`** (revidiert nach Smoke-Blocker,
   s. Punkt 1 oben); `grid-template-rows` bekommt `clamp(3.5rem, 8vh, 4.5rem)`
   als zusätzliche Row. Damit ist der Aktionsdock im Erstbild sichtbar und
   überlappt weder Handkarten noch Arenazugknopf. Der Arenastein-Cap bleibt
   bei `clamp(20rem, 40vh, 28rem)` (M1d0-Originalwert).
   (Erste Plan-Skizze war `clamp(5rem, 12vh, 8rem)` und Reihenfolge
   `arenastein` VOR `aktionsdock`; die Geometrie-Probe 23.06.2026 12:38 UTC
   hat gezeigt, dass die Tischkarte dann in die Aktionsdock-Row ragt und der
   M1bw-Hit-Test bricht. Kimi hat die Straffung auf 56-72 px als NON-BLOCKER
   #1 markiert.)
3. **Neue CSS-Klasse `.aktionen-panel--brettinline`**: definiert das kompakte
   Aussehen des Docks innerhalb des Spielbrett-Grids (`max-height:
   clamp(3.5rem, 8vh, 4.5rem); overflow: auto; gap: 0.35rem; padding: 0.4rem
   0.6rem; border-radius: 1.25rem`). Sie wird zusätzlich zu `--brettfallback`
   gesetzt.
4. **Aktionsdock-Höhe wird real getestet**: neuer RED-Test
   `src/App.m1dd_aktionsdock_im_spielbrett.test.tsx` mit CSS-Source- und
   DOM-Landmark-Asserts.
5. **Pre-Existing Smoke-Staleness-Sweep**: die nach M1d0 dokumentierten
   1-px-Überschreitungen in `scripts/m1bw_lichtung_entflechtung_smoke.mjs` und
   `scripts/m1by_spielbrettweite_smoke.mjs` werden im selben Slice auf
   ≤960 px korrigiert (real gemessen, dokumentiert in
   `docs/release_status_2026-06-23_m1dd.md` als "Pre-Existing Smoke-Staleness
   (in-scope)"). Der m1by-Handkarten-Puffer wurde während der Kimi-Review
   nachgereicht (NON-BLOCKER #2).
6. **M1dc Smoke-Blocker-Fix finalisieren**: der uncommitted Fix in
   `scripts/m1dc_spielmoment_pulse_smoke.mjs` (reducedMotion + Selector-Korrektur)
   wird mit übernommen.
7. **Probe-Skripte aufräumen**: die `_probe_*.mjs` / `_screenshot_*.mjs`
   Skripte aus der M1dc-Finalisierung werden gelöscht (sie waren temporär
   und sind nicht für die Reproduktion nötig).
8. **Neuer Browser-Smoke** `scripts/m1dd_aktionsdock_im_spielbrett_smoke.mjs`:
   beweist im echten Browser, dass das Aktionendock im Erstbild 1280×900
   sichtbar ist (Element-Rect.bottom ≤ 900, kein `position: absolute`).
9. **M1bw Hit-Test-Härtung (Smoke-Blocker-Fix-Revision)**: nach dem ersten
   M1dd-Deploy schlug der M1bw-Lichtungs-Smoke fehl, weil der Aktionsdock
   zwischen Arenastein und Zugseitenleiste saß, der Arenastein aber
   `overflow:hidden` mit Cap hat und der DOM-Rect-Mittelpunkt der Tischkarte
   im geclippten Bereich liegt. Fix: `sichtbarerRect()`-Helper in
   `scripts/m1bw_lichtung_entflechtung_smoke.mjs`, der auf den sichtbaren
   Schnittpunkt des Elements mit seinem nächsten `overflow:hidden`-Vorfahren
   klickt, nicht blind auf den DOM-Rect-Mittelpunkt. Documented as
   in-scope Pre-Existing Smoke-Staleness fix.

### Raus (explizit)

- **Keine Engine-Änderung.** Legal-Aktionen, Phasen, Wertung, Sonderkarten
  bleiben unangetastet.
- **Keine neuen Spielobjekte** (Plaketten, Buttons, Karten). M1dd ordnet nur,
  was M1ap/M1b/M1d0/M1dc bereits gebaut haben.
- **Keine A11y-Mikroschleife** (User-Hinweis: keine Loops ohne Spielfortschritt).
  Die Empfohlene-Aktion-Live-Region (R174) bleibt unverändert.
- **Keine Änderung an Spielregeln** (keine neuen Phasen, keine neuen Aktionen).
- **Keine Änderung am Arenazugknopf** (M1q-End-Turn-Knopf bleibt im Bottom-Row).
- **Keine Änderung an Handkarten-Stack** (M1bp/M1bc/M1cc bleiben).
- **Kein Big-Bang**: nur 1 Renderposition, 1 neue CSS-Klasse, 1 Grid-Zeile,
  Smoke-Fixes.

## Workflow (analog zu M1d0/M1dc)

1. **RED-Tests** schreiben (Datei `src/App.m1dd_aktionsdock_im_spielbrett.test.tsx`).
2. **Implementation** in `src/App.tsx` (Renderposition) und `src/App.css`
   (Grid-Template + neue Klasse).
3. **`/simplify`** als Pre-Check (CLAUDE.md-Workflow).
4. **Kimi-Code-Review** (`kimi -p "..."`) statt Codex (Codex OAuth usage limit
   bis 25.06.2026 19:07 UTC).
5. **Smoke-Sweep** für `m1bw`/`m1by`/`m1dc`/`m1dd` lokal.
6. **Full Gates**: `npm test -- --run`, `npm run check:test-lines`,
   `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check`.
7. **Vercel Deploy + Live-Smoke** auf `https://schlangentanz-v2.vercel.app/game`.
8. **Release-Doc** `docs/release_status_2026-06-23_m1dd.md` mit Vorher/Nachher
   Geometrie und Kimi-Review-Verweis.

## Akzeptanzkriterien (Playability-Gate-relevant)

- [ ] `npm test -- --run` grün; neuer M1dd-Test deckt Render-Position + CSS-Klasse ab.
- [ ] `npm run typecheck`, `npm run lint`, `npm run build` grün.
- [ ] `npm run smoke:production` grün; `m1bw`, `m1by`, `m1dc`, `m1dd` Smoke alle grün.
- [ ] `wc -l src/App.tsx` ≤ 500 Zeilen (Budget halten).
- [ ] Browser-Probe auf `/game` 1280×900: `aktionen-panel--brettinline.bottom ≤ 900`.
- [ ] Vercel Production-Deploy `READY`, Live-Smoke ohne console/page errors.
- [ ] Mind. ein Brettschritt (Handkarte → Startfährte → End-Turn → KI)
  weiterhin durchspielbar.

## Offene Punkte für User-Abnahme vor Slice-Start

1. **Soll M1dd den Aktionsdock auch ausserhalb von `/game` umstellen**, oder
   reicht die `/game`-Beschränkung via `aktionen-panel--brettinline`?
   → Vorschlag: nur auf `/game`, da auf `/` die volle Liste gewollt ist
   (M1b-Vertrag).
2. **Soll die Klasse `aktionen-panel--brettinline` heißen oder lieber
   `aktionen-panel--im-spielbrett`**? → Vorschlag: `aktionen-panel--brettinline`
   (kürzer, gleicher Wortstamm wie `aktionen-panel--brettfallback`).
3. **Vorher/Nachher-Screenshot** als Release-Evidence ok?