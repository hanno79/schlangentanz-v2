# Slice-Plan M1dq — Waldtanz-Sonderkarten-Spielmoment-Bubble in der Handbühne

**Datum:** 26.06.2026
**Slice-ID:** M1dq (Fortsetzung der M1-Waldtanz-Game-Board-Reihe, nach M1dp)
**Vorgaenger:** `fb942a8 M1dp: Waldtanz-Gegnerlichtung als oberes Brettobjekt im Arenastein (lokal verifiziert, review-blockiert)`
**Klasse:** Game-Object-Affordance (M2a-Familie — Sonderkarten-Zielauswahl sichtbar machen)

## Beobachtung (Click-Simulator-Diagnose)

Auf `/game` (Viewport 1280x900) ergibt die Live-Probe:

- Die Sonderkarten-Infrastruktur (Schlangenfrass, Farbenfusion, Farbendieb, Farbenschutz) ist bereits
  voll funktional und die Legal-Targets werden auf dem Brett korrekt markiert
  (M1dl Dropzone-Pfeile, M1cm Zielwahl-Faehrten, M1co/M1cp Sprung).
- ABER: Wenn der Spieler eine Sonderkarte auswaehlt, gibt es **kein klar sichtbares
  "wo spiele ich diese Karte hin?"-Element in der Handbuehne**. Der Spieler
  muss die Spielhilfe im Seitenmenue lesen, dann auf dem Brett nach dem
  richtigen Ziel suchen, dann klicken.
- Die `Spielerfuehrung` im Seitenmenue zeigt zwar "Mini-Checkliste fuer deinen Zug"
  + "Klicke unten auf die empfohlene Aktion", aber das ist generischer Text,
  nicht der konkrete Spielmoment fuer eine ausgewaehlte Sonderkarte.
- Konsequenz: das Spiel fuehlt sich wie ein "Klick-Simulator" an, weil der
  Spieler zwischen Handbuehne (Auswahl) und Brett-Mitte (Ziel) hin- und
  herspringen muss, ohne einen klaren "Hier entlang"-Moment in der Hand.

User-Feedback: "Weg vom Button-geklickt-/Debuglisten-Gefühl hin zu echtem
Spielerlebnis. Mittlere, sichtbare Vertical Slices: groß genug für echten
Spielwert, klein genug für TDD, Review und Release."

## Ziel

Eine neue **`WaldtanzSonderkartenSpielmoment`-Bubble** wird in die `.handkarten-buehne`
integriert. Sie ist **nur sichtbar, wenn eine Sonderkarte ausgewaehlt ist UND mindestens
eine legale Sonderkarten-Aktion dafuer existiert**. Sie zeigt:

1. Den Sonderkarte-Namen (z.B. "Schlangenfrass")
2. Die Art des legalen Ziels (z.B. "→ ziele auf gegnerische Schlange" oder
   "→ Fusionspaar im Brett" oder "→ Beutekarte legen")
3. Einen kleinen Abwaerts-Pfeil als visuellen Anker zur Brettzone
4. Einen Link auf das erste legale Ziel (via aktueller `aktionszielId`-Mechanik)

Damit hat der Spieler einen klaren "Spielmoment"-Punkt direkt in der Handbuehne,
der ihm zeigt, welche Sonderkarte er haelt und wohin er sie spielen soll.
Die generische `Spielerfuehrung` im Seitenmenue bleibt als Fallback erhalten
(wird nicht entfernt), aber die neue Bubble ist die primaere kontextuelle
Spielmoment-Anzeige.

## Warum mittlerer Slice, weder Mikroslice noch Big-Bang

- **Nicht Mikroslice:** neue Komponente, neue Props, neue CSS-Regel, neue
  Smoke, neue RED-Tests, neuer `aktionszielId`-Linkpfad — das sind ~6-8
  Tool-Calls, deutlich mehr als ein A11y/IDREF-Mikroslice.
- **Nicht Big-Bang:** keine Engine-Regel-Aenderung, keine Layout-Budget-
  Aenderung (additive Bubble in existierender Buehne, kein Parent-Cap
  wird angefasst, keine Sibling-Order-Aenderung), keine Removal-Aktion.
- **Nicht Repeat:** bewusst andere Klasse als M1dm/M1dn/M1do (Click-Listen
  wegblenden) und M1di/M1d0 (Layout-Konsolidierung). Hier: Affirmation
  eines Spielmoments, nicht Negation einer Liste.
- **Spielwert sichtbar:** Wenn der Spieler die Sonderkarte in der Hand
  anklickt, sieht er jetzt direkt: "Schlangenfrass → auf gegnerische
  Schlange S2" und kann auf den Link klicken, um direkt zum Ziel zu
  springen. Das ist genau das "echte Spielerlebnis"-Gefuehl, das im
  Click-Simulator fehlt.

## Rein

- `src/components/WaldtanzSonderkartenSpielmoment.tsx` (neu, ~80 Zeilen)
- `src/components/HandkartenPanel.tsx` — Einbau der Bubble als Kind der `.handkarten-buehne`,
  nur sichtbar bei Sonderkarten-Auswahl
- `src/App.css` — neue Regel `.handkarten-buehne__spielmoment` mit Stitch-Pill-Style
  (3-px-Border, Hard-Shadow, Chunky-Font, lime-Glow bei aktiv)
- `src/App.m1dq_waldtanz_sonderkarten_spielmoment.test.tsx` (neu, 5-7 RED-Tests)
- `scripts/m1dq_waldtanz_sonderkarten_spielmoment_smoke.mjs` (neu, Production-Smoke)
- `package.json` — `smoke:production`-Kette um M1dq-Smoke erweitert (nach M1do, vor M3b)
- `docs/PLAYABILITY_GATE.md` — Evidence-Block fuer M1dq
- `docs/release_status_2026-06-26_m1dq.md` (neu)

## Raus

- Nichts. Die `Spielerfuehrung` im Seitenmenue bleibt als generische
  Fallback-Anzeige erhalten (kein Remove).

## Engine-Touchpoint

**Nein.** Keine Engine-Regel, kein Legal-Action-Filter, kein
`useLegaleAktionenNachTyp`-Aufruf. Die Bubble liest nur die bereits
uebergebene `legaleAktionen`-Prop und filtert clientseitig nach
Sonderkarten-Aktionen.

## Test-Strategie

RED-Tests in `src/App.m1dq_waldtanz_sonderkarten_spielmoment.test.tsx`:

1. **RED-1:** Bubble ist NICHT sichtbar, wenn keine Handkarte ausgewaehlt ist
2. **RED-2:** Bubble ist NICHT sichtbar, wenn eine Farbkarte ausgewaehlt ist
3. **RED-3:** Bubble IST sichtbar, wenn eine Sonderkarte (z.B. Schlangenfrass) ausgewaehlt ist
   und mindestens eine legale Sonderkarten-Aktion existiert
4. **RED-4:** Bubble enthaelt den Sonderkarte-Namen im Heading
5. **RED-5:** Bubble enthaelt die Ziel-Art-Beschreibung (z.B. "Schlangenfrass-Ziel")
6. **RED-6:** Bubble hat einen `<a>`-Link mit `href="#{aktionszielId}"` und das Ziel
   ist im DOM vorhanden (DOM-IDREF-Konsistenz, kein Whitespace-Token-Bug)
7. **RED-7:** CSS-Vertrag: `.handkarten-buehne__spielmoment` hat `border` + `box-shadow`
   + `font-family: var(--st-font-headline)` via `cssBlock()`-Helper

## Smoke-Strategie

`scripts/m1dq_waldtanz_sonderkarten_spielmoment_smoke.mjs`:

- Production-URL (https://schlangentanz-v2.vercel.app)
- Viewports: 1280x900 + 1100x800
- Prueft: Bubble-Heading im DOM, Sonderkarte-Name sichtbar, Ziel-Art-Text sichtbar,
  Bubble ist im 900-px-Viewport sichtbar (bottom <= 900)
- Smoke-Wiring: RED-Test in Test-File verifiziert, dass `smoke:production` Chain
  den M1dq-Script enthaelt
- Self-Test-Modus vorhanden (offline Konfig-Check)

## Vorbedingungen (Pre-Implementation Audit)

- `grep "handkarten-buehne__spielhandlung" src/components/HandkartenPanel.tsx` — die
  existierenden Pflicht-Abwurf/End-Turn-Spielhandlungs-Pillen muessen in der
  Sichtbarkeitslogik NICHT gebrochen werden
- `grep "aktionszielId" src/components/Spielerfuehrung.tsx` — der bestehende
  Aktionsziel-Link-Mechanismus dient als Vorlage
- `grep "Sonderkarte" src/engine/spielzustand.ts` — Verfuegbare Sonderkarte-Typen

## Pitfall-Vorbeugung

- **kein Layout-Budget-Risiko** (additiv in existierender Buehne, kein Parent-Cap)
- **kein Forbidden-Token-Bleed-Risiko** (Stitch-Standard-Token, keine
  forbidden-list aus M1dk beruehrt)
- **kein Cascade-Override-Risiko** (neue Klasse, kein Override einer Pre-Existing-Regel)
- **kein Whitespace-Token-Risiko bei IDREF** (Sonderkarte-Namen ohne Whitespace
  werden via `aktionszielId` durchgereicht, die bereits in
  `Spielerfuehrung.tsx` whitespace-sicher gehandhabt wird)
- **Umlaut-Drift-Kimi-Risiko**: alle Texte manuell mit korrekten Umlauten
  geschrieben (z.B. "Sonderkarte-Spielmoment-Bubble", "Ziel-Art",
  "Schaetzung" — nicht "Schaetzung")

## Akzeptanz

- RED-Tests gruen (7/7)
- Targeted-Test gruen
- Full-Suite gruen (oder bekannte Pre-Existing-Failures nur in M1ak/M1aw/M1da,
  dokumentiert)
- Typecheck, Lint, Build gruen
- Kimi-Review (Fallback, weil Codex OAuth usage limit) ohne Blocker
- Production-Smoke gruen auf 1280x900 + 1100x800
- Vercel Production-Deploy + Live-Smoke gruen
