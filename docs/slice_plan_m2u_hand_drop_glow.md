# M2u — Handkarten-Drag-Glow auf Schlangenlichtung

**Datum:** 2026-06-28
**Slice-ID:** M2u
**Slice-Klasse:** Affordance-Mid-Slice (Drag-Reactive Brettobjekt)
**Autor:** Hermes autonomer Cron-Lauf

## Problem

Der Spieler hat Handkarten und soll sie auf dem Brett ablegen. Der
Schlangenlichtung-Spielfläche fehlt ein **sichtbares Drop-Feedback**:
der Spieler sieht nicht direkt, dass die ganze Lichtung "das Brett
ist, auf dem gespielt wird". Vorhandene Hinweise (M1dl Anlegeplatz,
M1df Steinkreis-Pulse, M1dq Spielmoment-Bubble) sind punktuell auf
einzelne Brettobjekte verteilt.

## Slice-Identifikation

- **Rein:** Wenn eine Handkarte per Drag (Mousedown + Move) aus der
  Handbühne gezogen wird, bekommt die `.waldtanz-schlangenlichtung`
  einen sichtbaren **Drop-Glow-Rim** (forest-green dashed border +
  sanftes Skalen-Pulsieren), der sagt "Hier wird gespielt".
  Beim Loslassen / Drop-Cancel verschwindet der Glow.
- **Raus:** Engine-Änderungen, neue Drop-Target-Logik, Layout-Reorg,
  M2a-Auto-Highlight (existiert bereits), M1dq-Spielmoment-Bubble
  (existiert bereits).

## Visuelle Wirkung

- **Vorher:** Handkarte wird gezogen → keine sichtbare Reaktion des
  Bretts → Spieler muss raten, wohin.
- **Nachher:** Handkarte wird gezogen → das gesamte Schlangenlichtung-
  Spielfeld bekommt einen pulsierenden forest-grünen Dashed-Border +
  Scale-Pulse (1 → 1.01 → 1, 1.2s loop). Der Spieler sieht: "Hier
  ist mein Spielbereich".

## Akzeptanz

- `data-drag-aktiv` Attribut auf `.waldtanz-schlangenlichtung` wenn
  Drag aktiv.
- CSS-Regel `.waldtanz-schlangenlichtung[data-drag-aktiv="true"]`
  enthält `animation: ...` mit einer forest-green pulse keyframe.
- Bei Drop / Cancel: Attribut weg, Animation stoppt.
- `prefers-reduced-motion: reduce` Override deaktiviert die Animation.
- RED-Tests: 4-6 RED-Tests (DOM-Attribut + CSS-Source + reduced-motion
  + Smoke-Wiring).
- Smoke-Skript misst `getComputedStyle.animationName` der
  Schlangenlichtung im Drag-Zustand vs Idle.

## Implementation

- `HandkartenPanel.tsx`: `onKarteDragStart` setzt einen
  `dragAktiv`-State, `onKarteDragEnd` setzt ihn zurück. State wird
  per React-Context oder Prop-Drilling an `WaldtanzSchlangenlichtung`
  weitergegeben (oder direkt am Container via DOM-Attribut).
- `WaldtanzSchlangenlichtung.tsx`: akzeptiert `dragAktiv` Prop,
  rendert `data-drag-aktiv={dragAktiv ? 'true' : 'false'}` (expliziter
  `'false'`-Default, damit RED-1 als Default-Assertion pruefbar bleibt).
- `App.css`: neue Regel mit Pulse-Keyframe und reduced-motion-Block.

## Workflow

1. RED-Tests in `src/App.m2u_hand_drop_glow.test.tsx`
2. Implementation in HandkartenPanel + Schlangenlichtung + App.css
3. Targeted Test + adjacent Test + typecheck + lint + build
4. Kimi-Review (Codex OAuth quota)
5. Commit + Push + Deploy + Live-Smoke
6. Release-Status-Doku

## Vorbedingungen

- M1dl Anlegeplatz-Dropzone existiert.
- M1df Steinkreis-Pulse existiert.
- M2a Sonderkarten-Auto-Highlight existiert.
- Aktueller HEAD: 5369c13 (M2s Release).
