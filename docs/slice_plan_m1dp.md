# Slice-Plan M1dp — Waldtanz-Gegnerlichtung als oberes Brett-Cluster

**Datum:** 26.06.2026
**Slice-ID:** M1dp (Fortsetzung der M1-Waldtanz-Game-Board-Reihe)
**Vorgaenger:** `bb2ac15 M1do: Waldtanz-Sonnenstand-HUD auf /game visuell reduziert`
**Klasse:** Game-Object-Affordance + Layout-Konsolidierung (M1dj/M1di-Familie)

## Beobachtung (Click-Simulator-Diagnose)

Auf `/game` (Viewport 1280x900) ergibt die Live-Probe:

- Eigene Schlange (`schlangekarte--eigene`) sitzt mit 256x217 px in der Schlangenlichtung.
- Gegner-Schlangen sitzen am Ende von `Schlangenbereich.tsx` in einer
  `<section class="schlangen-gruppe schlangen-gruppe--gegnerfelder">`, die nur
  sichtbar wird, sobald mindestens ein Gegner eine Schlange hat.
- Es gibt **kein** eigenen, klar abgegrenzten Brettobjekt-Container für Gegner.
  Sie wirken wie ein Nachgedanke unten am Schlangenbereich.
- Auf `bodyH=1258` / `vh=900` rutschen die gegner-Schlangen leicht unter den
  ersten Viewport-Fold, was die "Click-Simulator"-Wahrnehmung verstärkt.

User-Feedback: "Weg vom Button-geklickt-/Debuglisten-Gefühl hin zu echtem
Spielerlebnis. Mittlere, sichtbare Vertical Slices: groß genug für echten
Spielwert, klein genug für TDD, Review und Release."

## Ziel

Die gegnerischen Schlangen ziehen aus der `schlangen-gruppe--gegnerfelder`
am Ende des Schlangenbereichs in ein **eigenes oberes Brett-Cluster** um,
das wie die eigene `WaldtanzSchlangenlichtung` (M1di) als sichtbarer
Waldtanz-Stein gerendert wird:

- 3 px dunkelgrüner Border, harter Block-Shadow, chunky Radius
- Header mit "Gegner-Schlangen" + Anzahl lebender Gegnerschlangen
- Jeder Gegner bekommt eine eigene Karte-Reihe mit Name + Punkten + Snake-Count
- Befindet sich **oberhalb** der eigenen Schlangenlichtung im Arenastein
- Engine-Aktionen (Schlangenblockade, Schlangenfrass, Farbendieb) bleiben
  unverändert nutzbar — die board-nahen Sonderkarten-Zielobjekte
  (Fessel/Beutekorb/Bissspur) ziehen mit um

## Warum mittlerer Slice, weder Mikroslice noch Big-Bang

- **Nicht Mikroslice:** neue Komponente + ~150–250 Zeilen CSS + Layout-Verschiebung
  in der App-Topologie, sichtbar veränderte Spielerfahrung
- **Nicht Big-Bang:** keine Engine-Regel-Änderung, keine neue Spielmechanik,
  nur Container-Wechsel und Stitch-Styling — vollständig reviewbar mit
  RED-Tests und Production-Smoke

## Rein

1. Neue Komponente `src/components/WaldtanzGegnerlichtung.tsx`:
   - nimmt `gegnerSpieler`, `ausgewaehlteHandkarteId`, alle 5 Sonderkarten-Aktionen,
     `aktionsLabel`, `onAktion`, `aktiverZielspurKey`, `letzteAktionZiel` entgegen
   - rendert pro Gegner eine `<section>` mit Name, Punkten, Snake-Count und der
     `<GegnerSchlangenListe>` (oder einem schlanken Wrapper)
2. Neue CSS-Klasse `.waldtanz-gegnerlichtung` mit Stitch-Border, Shadow, Header
3. `src/components/WaldtanzSchlangenlichtung.tsx` wird erweitert:
   - `WaldtanzGegnerlichtung` wird **als Geschwister** vor dem eigenen Spielfeld
     in der `spielflaeche` eingefügt
4. `src/components/Schlangenbereich.tsx`: die `<section class="schlangen-gruppe
   schlangen-gruppe--gegnerfelder">` am Ende wird entfernt (kein doppeltes Rendering)
5. `src/App.css`: 80–120 Zeilen neue Stitch-Regeln für `.waldtanz-gegnerlichtung*`

## Raus

- Die unklare "Gegnerische Schlangen"-Section am Ende des Schlangenbereichs.
  Sie wanderte in das neue obere Cluster.

## RED-Tests (src/App.m1dp_waldtanz_gegnerlichtung.test.tsx)

1. `WaldtanzGegnerlichtung rendert pro Gegner eine eigene Karte-Reihe mit Name`
2. `WaldtanzGegnerlichtung zeigt Gesamtzahl lebender Gegnerschlangen im Header`
3. `WaldtanzGegnerlichtung rendert gegnerische Schlangen als kartenartige Brettobjekte`
4. `WaldtanzGegnerlichtung uebertrifft gegnerSchlangenfallback: bei 0 Gegnern wird Hinweis-Text sichtbar, Section bleibt im DOM`
5. `App.tsx rendert die Gegnerlichtung vor der eigenen Schlangenlichtung im Arenastein`
6. `Schlangenbereich enthaelt nach Slice-Migration keine schlangen-gruppe--gegnerfelder Section mehr`
7. `App.css enthaelt .waldtanz-gegnerlichtung mit 3px Border, hard-shadow und chunky-Radius`

## CSS-Quelle-Vertrag (cssBlock-Pattern)

- `.waldtanz-gegnerlichtung { border: 3px solid var(--st-color-forest-shadow); border-radius: 1.75rem; background: var(--st-color-surface); box-shadow: 0 4px 0 0 var(--st-color-forest-shadow); }`
- `.waldtanz-gegnerlichtung__kopf h3 { font-family: 'Rubik', system-ui, sans-serif; font-weight: 800; }`
- `.waldtanz-gegnerlichtung__gegnerkarte { display: grid; grid-template-columns: minmax(6rem, auto) 1fr minmax(7rem, auto); gap: 0.75rem; align-items: center; padding: 0.65rem 0.85rem; border: 3px solid var(--st-color-forest-shadow); border-radius: 1.5rem; background: var(--st-color-surface-container-low); }`

## Production-Smoke (scripts/m1dp_waldtanz_gegnerlichtung_smoke.mjs)

- Auf 1280x900:
  - `.waldtanz-gegnerlichtung` ist sichtbar
  - liegt oberhalb der eigenen Schlangenlichtung (kleineres `y`)
  - enthält mindestens eine `.waldtanz-gegnerlichtung__gegnerkarte` sobald ein
    Gegner eine Schlange hat
  - 3 px Border, hard shadow, kein `display:none`
- Auf 1100x800: gleiche Verträge, da `.gegner-gruppe--gegnerfelder` als
  Quelle entfernt wurde
- Regression: M1do (Sonnenstand unsichtbar) bleibt grün

## Chain-Probe (vor CSS-Aenderung)

Erstes `_probe_m1dp.mjs` mit `getBoundingClientRect`-Walk der Arena-Kette
`arenastein → spielfeld → lichtung → gegner-gruppe` (alt) und
`arenastein → spielfeld → gegnerlichtung (neu) → lichtung (alt)`.
Baseline-Numbers kommen ins Commit, dannach CSS-Edit.

## Reihenfolge

1. RED-Tests schreiben (zuerst DOM-Asserts, dann CSS-Quelle-Asserts)
2. Komponente + CSS implementieren
3. Targeted-Run → Full-Suite
4. `/simplify` durch Claude
5. Kimi-Review (K2.7 — Code-Reviewer-Watchdog, da Codex NOT_FUNCTIONAL)
6. Commit + Push + Vercel Deploy + Production-Smoke
7. Release-Doku

## Akzeptanzkriterien

- Full-Suite grün
- Production-Smoke grün
- M1do-Smoke grün (Regression-Check)
- Auf `/game` sichtbar: oben im Brettrand-Stein liegt die Gegnerlichtung,
  darunter die eigene Schlangenlichtung — beide als gleichberechtigte
  Brettobjekte mit 3px Border und Hard Shadow
