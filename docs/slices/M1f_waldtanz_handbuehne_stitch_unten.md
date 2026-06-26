# M1f — Waldtanz-Handkarten-Bühne als sichtbarer Stitch-Player's-Hand

> **Status:** In Arbeit (cron-run 26.06.2026, ~02:00 lokal).
> **Typ:** Mittlerer Vertical (UI/UX, Bottom-Row Stitch-Look), kein Engine-Touchpoint.
> **Vorgänger:** M1dk-Fix (3b27598, Phasen-Banner eng an Arenakopf), M1e (38db3c5, Spieluhr).
> **Nachfolger:** offen — naechster mittlerer Vertical nach Review.

## Befund (warum dieser Slice jetzt kommt)

Auf `https://schlangentanz-v2.vercel.app/game` bei 1280x900 ist die
**Handkarten-Bühne unterhalb der Schlangenlichtung im Erstbild
abgeschnitten** (Screenshot-Capture 26.06.2026 02:02 lokal):

- `.handkarten-buehne` und die `.handkarte`-Karten sitzen mit ihrer
  Unterkante jenseits von 900 px Viewport — die Spielerhand ist im
  Erstbild gar nicht oder nur angeschnitten sichtbar.
- Die Stitch-Referenz (`/tmp/schlangentanz_stitch_design/stitch/der_waldtanz_game_board/screen.png`)
  zeigt die Hand **vollstaendig sichtbar** als zentrale Spielereihe unter
  der Arena: drei chunky Stitch-Karten (Icon + Titel + Werte-Tag) in der
  Mitte, ein klar sichtbarer **End-Turn**-Pill rechts, Spielerplakette
  links.
- Im aktuellen Production-Screenshot sind die Handkarten zwar als
  Stitch-Stil-Karten (M1ct) gerendert (Symbol/Titel/Werteplakett
  sichtbar), aber sie liegen visuell unter dem Fold, waehrend die
  obere Haelfte des Bildes leer wirkt — der typische
  "Button-geklickt-Gefuehl"-Verdacht des Nutzers.

Der M1ct-Slice hat den Karten-Stil selbst geliefert; der M1e-Slice hat
die Spieluhr in den Brettschritt gehoben. Was fehlt ist die **sichtbare
Buehnen-Komposition** der drei Bottom-Row-Komponenten zu einem
echten "Player's Hand"-Erlebnis im Stitch-Stil.

## Slice-Scope

### Rein

1. **Eine klare untere Spielereihe** auf `/game`: Spielerplakette (links,
   kompakter Pill) + Handkarten-Faecher (Mitte, **alle Karten im
   900-px-Erstbild sichtbar und klickbar**) + End-Turn-Pille (rechts,
   Stitch-Pill mit Pfeil).
2. **Handkarten-Buehne-Container** (`<aside className="handkarten-buehne">`)
   bekommt einen expliziten **Stitch-Auftritt**: 3 px dark forest-green
   Border, hard block shadow (4 px versetzt), Hintergrund in
   `var(--st-color-surface-container-high)`, padding so dass die Buehne
   selbst als Brettzone lesbar ist.
3. **End-Turn-Pille** bekommt einen dedizierten `.handkarten-buehne__endturn-icon`-Pfeil
   + `font-weight: 900` und einen 3-px-Border (Stitch), damit sie auf
   900-px als klare Primaeraktion rechts unten sichtbar wird.
4. **Spielerplakette-Box** innerhalb der Buehne kompakter, ohne
   `position: absolute` — sie ist Teil der Buehne, nicht ein
   ueberlagerter Schwebepill.
5. **Handkarten-Hoehe** so gewaehlt, dass `bottom der Handkarten-Buehne
   <= 900 px` im 1280x900-Viewport (auch bei 1100x800). Karten-Faecher
   soll 5 Karten ohne Overflow zeigen.
6. **Akzeptanztest (Browser-Smoke + Vitest):**
   - Buehne-Box `bottom <= 900` fuer 1280x900.
   - Alle `.handkarte__button--karte` haben `bottom <= 900` und sind
     klickbar (Hit-Test auf mindestens 3 Karten).
   - End-Turn-Pille ist sichtbar (height >= 36 px) und im rechten
     Drittel der Buehne positioniert.
   - Spielerplakette ist Teil der Buehne (`handkarten-buehne__spielerplakette`
     als Kind von `.handkarten-buehne`).
   - 3-px-Border + Hard-Shadow auf Buehne vorhanden.

### Raus (explizit)

- **Keine Engine-Aenderung.** Karten-Logik, Sonderkarten, Schlangen,
  Wertung bleiben unangetastet.
- **Keine Regel-Aenderung** an `docs/GAME_SPEC.md`.
- **Keine Layout-Konsolidierung des gesamten Grids** (das war M1d0 —
  bleibt separat, hier nur Bottom-Row).
- **Keine M1ct-Karten-Innenkosmetik** (Symbol, Titel, Werte-Tag,
  Spielhinweis bleiben unveraendert).
- **Keine M1dk-Phasen-Banner-Aenderung** (Pillen-Stil bleibt).
- **Keine A11y-Mikroschleife** (User-Hinweis: keine Loops ohne
  Spielfortschritt). ARIA bleibt wie bestehend; nur sichtbare
  Komposition.
- **Kein Mobile/Tablet-Refactor** — nur Desktop >= 1100 px.

## Akzeptanzkriterien (Playability-Gate-relevant)

- [ ] `/game` 1280x900: `.handkarten-buehne` hat `bottom <= 900`.
- [ ] `/game` 1280x900: alle `.handkarte__button--karte` haben
      `bottom <= 900`.
- [ ] `/game` 1280x900: End-Turn-Pille ist sichtbar (height >= 36 px)
      im rechten Drittel.
- [ ] `.handkarten-buehne` hat 3-px-Border + 4-px-Hard-Shadow.
- [ ] Spielerplakette ist Kind der Buehne (nicht absolut positioniert
      ueber der Buehne).
- [ ] `/game` 1100x800: gleiches Verhalten, keine Scroll-Bar noetig.

## Implementierungs-Reihenfolge

1. **RED (Vitest):** Quell-CSS-Asserts + DOM-Asserts fuer:
   - `.handkarten-buehne` Border + Shadow.
   - Spielerplakette ist Kind der Buehne (DOM-Hierarchie).
   - End-Turn-Pille ist im rechten Drittel der Buehne.
2. **GREEN (Claude Code):** CSS-Anpassungen in `src/App.css`
   (gezielt die `.spielbereich--game-route .handkarten-buehne`-Regeln)
   und minimale JSX-Aenderung in `App.tsx`, falls die
   Spielerplakette noch ausserhalb der Buehne liegt.
3. **/simplify:** Claude Code Simplify-Pass.
4. **Review:** Kimi Code CLI `kimi -p "..."` (Watchdog hat Kimi als
   verfuegbaren Reviewer bestaetigt; Codex stdin-block).
5. **Smoke:** `scripts/m1f_waldtanz_handbuehne_smoke.mjs` schreiben
   und in `smoke:production`-Kette aufnehmen.
6. **Gates + Deploy + Release-Doku.**

## Files-Touchpoint

- `src/App.css` — `.spielbereich--game-route .handkarten-buehne*`
- `src/App.tsx` — minimal: ggf. JSX-Reihenfolge der Handkarten-Buehne
- `scripts/m1f_waldtanz_handbuehne_smoke.mjs` — neuer Smoke
- `package.json` — `smoke:production`-Skript-Kette um neuen Smoke
  erweitern
- `src/App.m1f_waldtanz_handbuehne.test.tsx` — neuer Vitest-RED-Test
- `docs/release_status_2026-06-26_m1f.md` — Release-Doku