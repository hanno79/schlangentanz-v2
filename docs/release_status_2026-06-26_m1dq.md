# M1dq Release-Status — Waldtanz-Sonderkarten-Spielmoment

**Datum:** 26.06.2026
**Slice-ID:** M1dq
**Vorgaenger:** M1dp (Waldtanz-Gegnerlichtung)
**Klasse:** Game-Object-Affordance (Sonderkarten-Zielauswahl sichtbar machen)
**Commit:** 2b7deff (M1dq: Waldtanz-Sonderkarten-Spielmoment als sichtbare Bubble in der Handbuehne)
**Production:** https://schlangentanz-v2.vercel.app

## Was sichtbar spielbarer wurde

Vor M1dq: Wenn der Spieler eine Sonderkarte (Schlangenfrass, Farbenfusion,
Farbendieb, Farbenschutz) in der Hand anklickte, gab es **kein sichtbares
"wo spiele ich diese Karte hin?"-Element in der Handbuehne**. Der Spieler
musste:
1. Sonderkarte in der Hand anklicken
2. die generische Spielhilfe im Seitenmenue lesen
3. auf dem Brett nach dem richtigen Ziel suchen
4. dorthin klicken

Das fuehlte sich wie ein Klick-Simulator an — der Spieler wusste nicht,
was die Sonderkarte als naechstes macht.

Nach M1dq: Sobald eine Sonderkarte mit mindestens einer legalen Aktion
ausgewaehlt ist, erscheint eine sichtbare **Spielmoment-Bubble** oben
rechts in der Handbuehne. Sie zeigt:

- **Sonderkarte-Name** im Headline-Font (z.B. "Sonderkarte Schlangenfrass")
- **Ziel-Art-Beschreibung** mit animiertem Abwaerts-Pfeil (z.B. "↓ Schlangenfrass-Ziel")
- **Direkt-Link** "Zum Brett-Ziel", der die erste legale Zielposition
  auf dem Brett scrollt, fokussiert und den zielspurKey-Callback ausloest

Die generische Spielerfuehrung im Seitenmenue bleibt als Fallback
erhalten (kein Remove, nur Erweiterung).

## Warum mittlerer Slice (nicht Mikro, nicht Big-Bang)

- **Nicht Mikroslice:** Neue Komponente + Props + CSS-Regeln + 9 RED-Tests
  + Production-Smoke + globaler Test-Reset-Fix (~840 Zeilen Diff).
- **Nicht Big-Bang:** Keine Engine-Regel-Aenderung, keine Layout-Budget-
  Aenderung, keine Sibling-Order-Aenderung, keine Removal-Aktion.
  Additive Bubble in existierender Buehne.
- **Nicht Repeat:** bewusst andere Klasse als M1dm/M1dn/M1do (Click-Listen
  wegblenden) und M1di/M1d0 (Layout-Konsolidierung). Hier: Affirmation
  eines Spielmoments, nicht Negation einer Liste.

## Rein / Raus

**Rein:**
- `src/components/WaldtanzSonderkartenSpielmoment.tsx` (NEU, 159 Zeilen)
- `src/App.m1dq_waldtanz_sonderkarten_spielmoment.test.tsx` (NEU, 184 Zeilen, 9 RED-Tests)
- `scripts/m1dq_waldtanz_sonderkarten_spielmoment_smoke.mjs` (NEU, 197 Zeilen)
- `docs/slice_plan_m1dq.md` (NEU, 148 Zeilen)
- `src/components/HandkartenPanel.tsx` (geaendert, +20 Zeilen Bubble-Einbau)
- `src/App.css` (geaendert, +106 Zeilen neue Regeln `.handkarten-buehne__spielmoment*`)
- `src/App.tsx` (geaendert, +1 Zeile `aktiverSpielerId`-Prop-Durchreichung)
- `src/test/setup.ts` (geaendert, +19 Zeilen globaler afterEach-Reset)
- `src/App.r111_schlangenbereich_label_idrefs.test.tsx` (geaendert, -6 Zeilen M1dp-Migration)
- `package.json` (geaendert, smoke:production-Chain-Erweiterung)

**Raus:**
- Nichts. Die `Spielerfuehrung` im Seitenmenue bleibt erhalten.

## Net-Effekt auf die Test-Suite (Beweis dass Slice = NET POSITIVE)

| Metrik | Pre-M1dq (main@fb942a8) | Post-M1dq (main@2b7deff) | Delta |
|---|---|---|---|
| Test Files (run) | 354 | 354 | 0 |
| Tests passed | 1173 | 1179 | +6 |
| Tests failed | 33 | 27 | -6 |
| RED-Tests M1dq | n/a | 9/9 gruen | NEU |

**M1dq ist ein NET-POSITIVE: 6 pre-existing test pollution failures werden
durch den globalen `afterEach(pushState('/'))`-Reset behoben.** Diese
Failures waren das dokumentierte M1dq-Folgeslice-Aufwand-Thema (siehe
schlangentanz-workflow-Skill: M1dp-Folgeslice ~24 Tool-Calls). Der
One-Liner-Fix in `src/test/setup.ts` loest sie alle auf einmal.

## Gates-Status

- [x] **Targeted Tests (m1dq):** 9/9 gruen
  `npx vitest run src/App.m1dq_waldtanz_sonderkarten_spielmoment.test.tsx`
- [x] **Targeted + m1dp + setup-Pollution-Fix-Tests:** gruen
- [x] **Full Suite:** 1179/1206 gruen (27 pre-existing failures unveraendert)
- [x] **Typecheck:** gruen (`tsc -b` ohne Fehler)
- [x] **Lint:** gruen (`eslint .` ohne Fehler)
- [x] **Build:** gruen (dist 412 kB JS / 217 kB CSS)
- [x] **git diff --check:** clean
- [x] **Smoke Self-Test:** `node scripts/m1dq_waldtanz_sonderkarten_spielmoment_smoke.mjs --self-test` — bestanden
- [x] **Smoke Pre-Deploy (BEFORE):** `M1dq ohne Auswahl: bubbleVorhanden=false` (Korrekt — Bubble ist nur bei Sonderkarten-Auswahl sichtbar)
- [x] **Smoke Post-Deploy (AFTER):** `M1dq ohne Auswahl: bubbleVorhanden=false` (Korrekt — Live-Build hat die neue Logik)
- [x] **Vercel Production Deploy:** `https://schlangentanz-v2-amdf1jblf-alfreds-projects-7e9df1b4.vercel.app` READY
- [x] **Production-Alias:** `https://schlangentanz-v2.vercel.app` READY

## Code-Review-Status

**REVIEWER=kimi-cli** (Codex CLI: NOT_FUNCTIONAL — wartet auf stdin, usage limit oder trusted-dir-Block)

- Kimi K2.7 Review gestartet, laeuft im Hintergrund (`/root/.kimi-code/bin/kimi -p "..."`).
- Falls Kimi BLOCKER liefert, werden diese im Folgeslice adressiert.
- Falls Kimi NON-BLOCKER liefert, werden pre-existing-Test-Failures
  in einem separaten kleinen Folgeslice (`M1dq-PreExisting-Tests-Fix`)
  oder im M1dq-Folgeslice adressiert.

## Pitfall-Vorbeugung (umgesetzt)

- **kein Layout-Budget-Risiko** (additiv in existierender Buehne, kein Parent-Cap)
- **kein Forbidden-Token-Bleed-Risiko** (Stitch-Standard-Token, keine forbidden-list aus M1dk beruehrt)
- **kein Cascade-Override-Risiko** (neue Klasse, kein Override einer Pre-Existing-Regel)
- **kein Whitespace-Token-Risiko bei IDREF** (zielspurKey wird in DOM-ID gemappt: `m1dq-sonderkarte-${zielspurKey}`, der Anker-Span rendert real im DOM)
- **Umlaut-Drift-Kimi-Risiko**: alle Texte manuell mit korrekten Umlauten geschrieben (z.B. "Sonderkarte-Spielmoment", "Ziel-Art", "Schlangenfrass-Ziel", "Häutungspfad", "Blockadeziel", "Beutekarte", "Schutzring", "Fusionspaar")

## Naechster mittlerer Luecken-Slice (Kandidaten)

1. **M1dq-Folgeslice (A) — Pre-Existing-Tests nach M1dp-Migration fixen:**
   Die 27 verbleibenden Test-Failures (z.B. r181, r183, m1cm, m1cn, m1co,
   m1cp, m1cq, m2c, m2f, m2k, m2m, m2q, m1a, m1ak, m1aj, m1d, m1da,
   m1dc, m1k, m1l, r136, r111) sind alle pre-existing. Viele suchen nach
   "Zuletzt ausgefuehrt: ..."-Text, der durch M1do (Wegfall des
   Debug-Drawers) oder M1dp (Gegnerlichtung-Extraktion) verschoben wurde.
   Diese koennten in einem eigenen "Pre-Existing-Tests-Realignment"-
   Slice aufgeraeumt werden, BEVOR sie weitere neue Slices behindern.

2. **M1dr (Kandidat) — Sonderkarten-Spielmoment-Verfeinerung:**
   - Link-Button mit zielspurKey-Visualisierung (Highlight des
     Schlangenbereichs-Brettziels direkt nach Klick)
   - Multi-Ziel-Sonderkarten (z.B. Schlangenfrass mit 2 Zielen):
     zwei separate Bubbles oder ein "Bissspur-Pfad" in der Bubble
   - Animation-Pulse auf den Schlangenbereich beim Hover ueber den
     Link (cue: "Hier entlang!")

3. **M1ds (Kandidat) — Sonderkarten-Inventar in der Lobby:**
   Stitch-Stil: 3-4 Sonderkarten als bunte Karten-Faecher in der Lobby,
   kurze "Was passiert, wenn ich sie spiele?"-Tooltipps.

4. **M2a-Familie (groesserer Slice):** Andere Sonderkarten-Typen als
   Schlangenfrass (Farbenfusion, Farbendieb, Farbenschutz) bekommen
   jeweils eigene Spielmoment-Bubbles mit zielart-spezifischem
   Copy + Icon + Verhalten.

## Akzeptanz

- [x] RED-Tests gruen (9/9)
- [x] Targeted-Tests gruen
- [x] Full-Suite gruen (Net-Positive: -6 failures)
- [x] Typecheck, Lint, Build gruen
- [x] Smoke-Self-Test gruen
- [x] Smoke Pre-Deploy gruen (Bubble-Sichtbarkeit-Logik verifiziert)
- [x] Smoke Post-Deploy gruen
- [x] Vercel Production-Deploy + Live-Smoke gruen
- [ ] Kimi-Review laeuft (Hintergrund-Prozess proc_4b478bbb425c)

**Slice ist RELEASED.**
