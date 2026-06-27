# M2i — Release-Status

**Slice-ID:** M2i Handkarten-Stitch-Hero-Transformation
**Datum:** 2026-06-27
**Commit:** 8e96bad ("M2i: Handkarten-Stitch-Hero-Transformation auf /game ...")
**Status:** LIVE (Production https://schlangentanz-v2.vercel.app)
**Klasse:** Mittlerer Visual-Consolidation-Slice (M2-Reihe, vergleichbar mit M2e/M2g/M2h)

## Gates

| Gate | Ergebnis |
|------|----------|
| RED-Tests (Vitest) | 13/13 gruen (`src/App.m2i_handkarten_hero.test.tsx`) |
| Adjacent-Tests (M1f, M1g, M1av, M1bp, M1ds) | 23/23 gruen, keine Pre-Existing-Regression |
| Typecheck (`npm run typecheck`) | gruen |
| Lint (`npm run lint`) | gruen |
| Build (`npm run build`) | gruen (224.54 kB CSS, 417.33 kB JS) |
| Live-Smoke 1280x900 | 9/9 Assertions gruen (122x116 px, 9.8s) |
| Live-Smoke 1100x800 | 9/9 Assertions gruen (112x115 px) |
| Console/Page-Errors | 0 |
| Kimi-Code-CLI-Review (k2p7) | 0 echte Blocker (siehe Disclosure unten) |

## Code-Review: Kimi Code CLI 0.18.x (k2p7) statt Codex CLI

**Begruendung:** Codex-CLI-Watchdog meldete `[NOT_FUNCTIONAL]` (stdin-Mode-Block /
trusted-dir-Block). Kimi war der einzige verfuegbare Reviewer.

### Kimi-Blocker-Klassifikation

| Kimi-Blocker | Klassifikation | Hermes-Resolution |
|--------------|----------------|-------------------|
| RED-2 erwartet `aspect-ratio: 5/7` im route-scoped Block (nicht deklariert) | **False Blocker** | Kimi hat RED-2 mit dem Slice-Plan verwechselt. RED-2 prueft tatsaechlich `border: 3px solid` (Zeile 79 im Test), nicht aspect-ratio. RED-13 prueft das Override-Selektor-Format. Alle 13 RED-Tests gruen, also kein Red-Vertrag gebrochen. |
| Smoke-Threshold `height >= 100` zu hoch (M1f clamp 6rem-7rem = 96-99px) | **False Blocker** | Kimi hat uebersehen, dass die Buttons Inhalt haben (Icon-Tile + Titel + Effekt-Badge) und durch das `aspect-ratio: 2/3` der Basis-Regel + `display: grid; place-items: center` die tatsaechliche `boundingBox.height` >= 115 px betraegt. Live-Smoke bewies 122x116 px und 112x115 px auf beiden Viewports. Smoke bleibt unverändert. |

### Kimi-Non-Blocker (alle gefixt in der M2i-Folgesession)

- **Specificity-Comments korrigiert** (0,4,0 -> 0,5,0 fuer Block-2, 0,3,0 -> 0,4,0 fuer Icon-Tile-Override): reine Dokumentations-Korrektur.
- **Smoke-Log-Zaehler korrigiert**: "8 ASSERTIONS GRUEN" -> "9 ASSERTIONS GRUEN".

## Live-Smoke-Werte (Production)

```
--- M2i Handkarten-Hero @ 1280x900 ---
  erste Handkarte: 122x116 px @ (503,857)
  min-width: 115.2px ✓
  aspect-ratio: 2 / 3 ✓
  border-width: 3px ✓
  box-shadow: hard-shadow-sm (Stitch-Dunkelgruen) ✓
  .handkarte__art: 147x147 (quadratisch, ratio=1.00) ✓
  .handkarte__wertechip: border-radius 999px (Pill) ✓
  .handkarte__eyebrow: display none ✓
  .handkarte__idplakette: display none ✓
  --- M2i @ 1280x900: ALLE 9 ASSERTIONS GRUEN ---

--- M2i Handkarten-Hero @ 1100x800 ---
  erste Handkarte: 112x115 px @ (411,923)
  min-width: 99px ✓
  ... (8 weitere Assertions gruen)
  --- M2i @ 1100x800: ALLE 9 ASSERTIONS GRUEN ---
=== M2i Handkarten-Hero ALLE VIEWPORTS GRUEN ===
```

## Spielerische Wirkung (Vorher/Nachher)

**Vor M2i (Stand 433db20):**
- Handkarten als kleine Tiefenfaecher-Pills ~65 px breit, clipped am unteren Rand
- Eyebrow "WALDTANZKA..." + ID-Plakette "blau-09" als Hauptflaeche der Karte
- Effekt-Badge als kleine Farb-Box

**Nach M2i:**
- Handkarten als grosse Stitch-Hero-Spielkarten **112-122 px breit, 115-116 px hoch** (vorher ~65 px)
- **Quadratischer Icon-Tile oben** (147x147 px @ 1280, 102x102 px @ 1100), 1.8rem gross
- **3px Stitch-Waldgruen-Border** + **hard-shadow-sm** (0 4px 0 #063907)
- **Pill-Effekt-Badge** (border-radius 999px, secondary-container Background = Sonne-Gold)
- **Eyebrow + ID-Plakette visuell weg** (Stitch hat kein Eyebrow auf der Karte)
- Konsistent mit Stitch-Referenz `code.html` Zeile 244-308

## Pre-Existing-Test-Isolation

| Test-Datei | Status vor M2i | Status nach M2i | Diff |
|------------|----------------|-----------------|------|
| m1f_waldtanz_handbuehne | 10 gruen | 10 gruen | 0 |
| m1g_waldtanz_spielerplakette_konsolidierung | 3 gruen | 3 gruen | 0 |
| m1av_waldtanz_handkarten_gesichter | 1 gruen | 1 gruen | 0 |
| m1bp_waldtanz_handflaeche | 2 gruen | 2 gruen | 0 |
| m1ds_waldtanz_spielkarten_hebdichhoch | 7 gruen | 7 gruen | 0 |
| **m2i_handkarten_hero (NEU)** | - | **13 gruen** | **+13** |

Keine Pre-Existing-Regression. M2i nutzt den route-scoped Block
`.spielbereich--game-route [class~="handkarte__button--karte"]` (Spezifitaet
0,2,0+) statt die Basis-Regel `.handkarte__button--karte` (Spezifitaet 0,1,0)
zu ueberschreiben — so bleiben m1g/m1av/m1bp/m1ct/m1ds/m1f-Vertrage auf der
Basis-Regel unangetastet.

## Naechste Luecke nach M2i

- **M2k — Aktionen-Panel-Stitch-Transformation.** Aus dem Live-Screenshot
  ist sichtbar, dass die Handkarten jetzt prominent sind, aber das rechte
  Aktionen-Panel ("END TURN", "Spielerfuehrung", "Letzter Spielzug") und
  die uebergrosse Hinweis-Bubble "Waehle oder ziehe eine Handkarte..."
  konkurrieren weiter mit der Spielflaeche. M2k wuerde das Aktionen-Panel
  in einen Stitch-Pillen-Cluster transformieren oder als Phase-Bar in den
  Brettrand integrieren.

- **M1a — Spielflaeche-zentriert (Stone-Arena).** Die zentrale Spielflaeche
  ist aktuell ein 4/3-Container mit weissem Background. M1a wuerde sie als
  grossen Stitch-Stein (rounded-[4rem], primary-container Background) mit
  klarer "Spielstein"-Identitaet rendern.

M2i gehoert zur M2-Visual-Reihe (M2e/M2g/M2h/M2i/M2k/M2l) und passt zum
Pattern "Stitch-Alignment bringt sichtbares Spielerlebnis".
