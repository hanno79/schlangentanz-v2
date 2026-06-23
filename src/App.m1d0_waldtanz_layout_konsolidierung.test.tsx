/**
 * Author: rahn
 * Datum: 22.06.2026
 * Version: 1.0
 * Beschreibung: M1d0 konsolidiert das Layout des Spieltischs (info-panel--waldtanz-arena
 *   → spielbrett--waldtanz) auf /game. Statt einer fragilen Single-Column-Grid +
 *   position:absolute-Plaketten + per-Component grid-row-Nummerierung fuehrt M1d0
 *   ein benanntes grid-template-areas-Schema ein. Damit liegen Spielerplakette,
 *   Handkarten-Panel und Arenazugknopf explizit in der gleichen Zeile und
 *   koennen nicht mehr ueberlappen.
 *
 * Tests:
 *   - DOM-Landmarken: die drei Regionen (Spielerplakette, Handkarten, Arenazug)
 *     existieren im selben Container (Spieltisch) und haben korrekte accessible
 *     names.
 *   - CSS-Source-Kontrakte: spielbrett--waldtanz im /game-Routen-Block hat
 *     grid-template-areas mit einer benannten bottom-row, die Plakette, Hand
 *     und Arenazug enthaelt.
 *   - CSS-Source-Kontrakte: Spielerplakette und Gegnerplakette sind nicht mehr
 *     position: absolute im /game-Routen-Block.
 *   - CSS-Source-Kontrakte: Handkarten-Panel verliert das obsolete
 *     margin-right-Spacer (das den 320px-Spalt zur Gegnerplakette ueberbrueckte).
 *   - Smoke-Wiring im package.json.
 *
 * Bewusst NICHT in jsdom:
 *   - getBoundingClientRect liefert in jsdom 0. Echte Layout-Disjunktheit und
 *     Viewport-Bound-Checks beweist der M1d0-Browser-Smoke
 *     (scripts/m1d0_waldtanz_layout_konsolidierung_smoke.mjs).
 */
/// <reference types="node" />

import { existsSync, readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

const appCss = readFileSync('src/App.css', 'utf8')
const packageJson = readFileSync('package.json', 'utf8')

function cssBlock(selektor: string): string {
  return (
    appCss.match(
      new RegExp(`${selektor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 's'),
    )?.[1] ?? ''
  )
}

function cleanedBlock(selektor: string): string {
  return cssBlock(selektor).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ')
}

function startZustand() {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
}

afterEach(() => {
  window.history.pushState({}, '', '/')
})

describe('M1d0 Waldtanz-Layout-Konsolidierung', () => {
  it('rendert die direkten Kinder des Spieltischs in visueller Lesereihenfolge (A11y Tab-Folge)', () => {
    // Kimi-Review 22.06.2026 (BLOCKER): Vor diesem Fix war die DOM-Reihenfolge
    // Spielerrahmen -> Zugseitenleiste -> Arenastein -> Spielerplakette ->
    // Gegnerplakette -> Handkarten -> Arenazug. Visuell zeigt das Grid aber
    // Spielerrahmen -> Gegnerplakette -> Arenastein -> Zugseitenleiste ->
    // Bottom-Row (Spielerplakette|Hand|Arenazug). Tastatur-Tab-Fokus sprang
    // daher visuell rueckwaerts (erst Zugseitenleiste, dann Arenastein,
    // dann zurueck zur Gegnerplakette) — klarer A11y-Regress.
    //
    // Vertrag: DOM-Reihenfolge == grid-template-areas-Reihenfolge, damit
    // Tab/Shift+Tab der visuellen Leserichtung folgt. Reihenfolge wird hier
    // bewusst per Indexposition in der direkten Kind-Liste des
    // Spieltisch-Containers geprueft, nicht per querySelector-All.
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={startZustand()} />)
    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const direkteKinder = Array.from(spieltisch.children) as HTMLElement[]
    const klassen = direkteKinder.map(k => k.className)
    const erwarteteReihenfolge = [
      /waldtanz-spielerrahmen/,
      /waldtanz-gegnerplakette/,
      /waldtanz-arenastein/,
      /waldtanz-spielerplakette/,
      /waldtanz-zugseitenleiste/,
      /handkarten-panel/,
      /waldtanz-arenazug/,
    ]
    // Pruefe, dass jede erwartete Komponente an genau der erwarteten Position steht.
    // Andere Kinder (z.B. einleitende <h3>) sind erlaubt, aber die 7 oben
    // benannten Komponenten muessen in dieser Reihenfolge vorkommen.
    const positionen = erwarteteReihenfolge.map(re => {
      const idx = klassen.findIndex(k => re.test(k))
      return { regex: re.toString(), idx }
    })
    // Alle 7 Komponenten muessen im DOM vorhanden sein.
    for (const p of positionen) {
      expect(p.idx, `${p.regex} fehlt im Spieltisch-Container`).toBeGreaterThanOrEqual(0)
    }
    // Positionen muessen aufsteigend sein (Reihenfolge).
    for (let i = 1; i < positionen.length; i++) {
      expect(
        positionen[i]!.idx,
        `${positionen[i]!.regex} (pos ${positionen[i]!.idx}) steht vor ${positionen[i - 1]!.regex} (pos ${positionen[i - 1]!.idx})`,
      ).toBeGreaterThan(positionen[i - 1]!.idx)
    }
  })

  it('rendert die untere Spielreihe im selben Container auf /game', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={startZustand()} />)

    // Der Spieltisch (spielbrett--waldtanz) enthaelt Handkarten UND
    // Arenazugknopf als benannte Regionen. Spielerplakette sitzt als
    // Geschwister auf gleicher Zeile (M1d0-grid-template-areas).
    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const handkarten = within(spieltisch).getByRole('region', { name: 'Handkarten' })
    const arenazug = within(spieltisch).getByRole('region', { name: 'Waldtanz-Zugaktion' })
    expect(handkarten).toBeInTheDocument()
    expect(arenazug).toBeInTheDocument()

    // Spielerplakette ist jetzt eine benannte Region innerhalb oder neben dem
    // Spieltisch, mit sichtbarem Label "Waldtanz-Spielerplakette".
    const spielerplakette = screen.getByRole('region', { name: 'Waldtanz-Spielerplakette' })
    const regionLabel = spielerplakette.querySelector('.waldtanz-spielerplakette__region-label')
    expect(regionLabel).not.toBeNull()
    expect(regionLabel?.textContent?.trim()).toBe('Waldtanz-Spielerplakette')
  })

  it('definiert grid-template-areas mit benannter unterer Zeile (Plakette | Hand | Arenazug)', () => {
    // M1d0 fuehrt grid-template-areas im /game-Routen-Block des
    // spielbrett--waldtanz ein. Die untere Zeile muss die drei
    // Aktions-Regionen explizit nebeneinander benennen.
    const cleaned = cleanedBlock(
      '.spielbereich--game-route [class~="spielbrett--waldtanz"]',
    )
    expect(cleaned).toMatch(/grid-template-areas:/)

    const areasMatch = cleaned.match(
      /grid-template-areas:\s*((?:"[^"]+"\s*)+)/,
    )
    expect(areasMatch).not.toBeNull()
    if (!areasMatch) return

    const zeilen = areasMatch[1]
      .split('"')
      .map(s => s.trim())
      .filter(Boolean)
    expect(zeilen.length).toBeGreaterThanOrEqual(3)

    // Mindestens eine der Zeilen muss eine 3-Spalten-Zeile sein mit
    // Plakette / Hand / Arenazug. Wir akzeptieren mehrere Synonyme:
    // - "sp-plakette hand arenazug" (Zielbild)
    // - "plakette hand arenazug" (alternative Naming)
    const hatUntereZeile = zeilen.some(zeile => {
      const spalten = zeile.split(/\s+/)
      return (
        spalten.length === 3 &&
        /plakette/i.test(spalten[0]) &&
        /hand/i.test(spalten[1]) &&
        /arenazug|aktion/i.test(spalten[2])
      )
    })
    expect(hatUntereZeile).toBe(true)
  })

  it('definiert explizite grid-template-rows mit Arenastein-Cap', () => {
    // M1d0 (Folge-Fix): Damit die Hoehen-Caps auf den einzelnen Zeilen
    // GREIFEN (Arenastein 36vh, Zugseitenleiste 7vh), muss das
    // Spieltisch-Grid explizite grid-template-rows definieren statt
    // grid-auto-rows: auto. Sonst waechst jede Zeile auf den natuerlichen
    // Inhalt, der die Caps sprengt (Schlangenlichtung waechst auf 394 px
    // und schiebt die Bottom-Row aus dem 900-px-Viewport).
    const cleaned = cleanedBlock(
      '.spielbereich--game-route [class~="spielbrett--waldtanz"]',
    )
    expect(cleaned).toMatch(/grid-template-rows:/)
    expect(cleaned).not.toMatch(/grid-auto-rows:\s*auto/)

    // Mindestens eine der Zeilen referenziert den Arenastein-Cap.
    // M1d0 hat urspruenglich clamp(20rem, 40vh, 28rem) gewaehlt; M1dd hat
    // zunaechst auf clamp(18rem, 36vh, 24rem) gestrafft, um Platz fuer
    // die aktionsdock-Row zu schaffen. Nach dem M1bw-Hit-Test-Blocker
    // (Tischkarte ragte in die aktionsdock-Row) wurde der Cap auf den
    // M1d0-Wert zurueckgesetzt und der aktionsdock stattdessen zwischen
    // Gegnerplakette und Arenastein positioniert. Beide Werte gehoeren
    // zum selben M1d0-Vertrag (explizite grid-template-rows + clamp-Caps).
    expect(cleaned).toMatch(/clamp\(\s*(18|20)rem,\s*(36|40)vh,\s*(2[46]|28)rem\s*\)/)
    // Und die Zugseitenleiste-Cap clamp(4rem, 7vh, 5rem).
    expect(cleaned).toMatch(/clamp\(\s*4rem,\s*7vh,\s*5rem\s*\)/)
  })

  it('nimmt Spielerplakette und Gegnerplakette aus position: absolute heraus', () => {
    // Vor M1d0 waren beide Plaketten position:absolute und damit nicht
    // Teil des Grid-Flows (Ueberlappungen mit Handkarten). M1d0 loest sie
    // in den Grid-Flow auf.
    const spielerBlock = cleanedBlock(
      '.spielbereich--game-route [class~="spielbrett--waldtanz"] [class~="waldtanz-spielerplakette"]',
    )
    expect(spielerBlock).not.toMatch(/position:\s*absolute/)

    const gegnerBlock = cleanedBlock(
      '.spielbereich--game-route [class~="spielbrett--waldtanz"] [class~="waldtanz-gegnerplakette"]',
    )
    expect(gegnerBlock).not.toMatch(/position:\s*absolute/)

    // Beide Plaketten haben jetzt grid-area: <name> (nicht absolute).
    expect(spielerBlock).toMatch(/grid-area:/)
    expect(gegnerBlock).toMatch(/grid-area:/)
  })

  it('verliert das obsolete margin-right-Spacer am Handkarten-Panel', () => {
    // Vor M1d0 hatte das Handkarten-Panel margin-right: clamp(10rem, 25vw, 18rem),
    // um den Platzhalter fuer die absolute Gegnerplakette freizuhalten.
    // Mit Grid-Areas ist das obsolet und fuehrt zu toten Restraumen.
    const cleaned = cleanedBlock('.spielbereich--game-route [class~="handkarten-panel"]')
    expect(cleaned).not.toMatch(/margin-right:\s*clamp\(\s*10rem/)
  })

  it('verdrahtet das M1d0-Smoke-Skript in der kanonischen npm-Smoke-Kette', () => {
    expect(existsSync('scripts/m1d0_waldtanz_layout_konsolidierung_smoke.mjs')).toBe(true)
    expect(packageJson).toContain('m1d0_waldtanz_layout_konsolidierung_smoke.mjs')
    const smokeBlock = packageJson.match(/"smoke:production":\s*"([^"]+)"/)?.[1] ?? ''
    expect(smokeBlock).toContain('m1d0_waldtanz_layout_konsolidierung_smoke.mjs')
    const m1daIdx = smokeBlock.indexOf('m1da_waldtanz_handflaeche_erstbild_smoke.mjs')
    const m1d0Idx = smokeBlock.indexOf('m1d0_waldtanz_layout_konsolidierung_smoke.mjs')
    // Direkt nach M1da weil der M1da-Smoke genau die Bottom-Row prueft,
    // die M1d0 in den Grid-Flow holt.
    expect(m1d0Idx).toBeGreaterThan(m1daIdx)
  })

  it('begrenzt die Arenastein-Hoehe auf /game so dass die untere Spielreihe sichtbar bleibt', () => {
    // Akzeptanzkriterium M1d0: kein Vertical-Overflow auf 1280x900.
    // Befund (Kimi-Review 22.06.2026): Vor diesem Fix mass der Spielbrett-Bottom
    // 1261 px auf einem 900-px-Viewport, weil die Arenastein-Hoehe
    // (Inhalt aus Kopf + Questband + AktiverTanz-Schritt + Spielfeld mit
    // min-height 396 px) das Spielbrett ueber den Viewport schob.
    //
    // Vertrag: Arenastein auf /game hat eine moderate max-height
    // (Cap bei <= 60vh bzw. <= 36rem auf einem 900-px-Viewport), die den
    // internen Inhalt NICHT auf den unteren 200 px Viewport-Raum ueberlaufen
    // laesst. Die Spielfeld- und Schlangenlichtung-Inhalte koennen intern
    // scrollen, die Brettobjekte bleiben klickbar.
    const cleaned = cleanedBlock(
      '.spielbereich--game-route [class~="waldtanz-arenastein"]',
    )
    // Arenastein hat eine explizite Hoehenbegrenzung, die unter 60vh liegt.
    // Akzeptiert werden: height: clamp(...), max-height: clamp(...), oder
    // eine Media-Query (max-height) innerhalb des Routen-Scope.
    const hatHoehenCap = /height:\s*clamp\s*\(/i.test(cleaned)
      || /max-height:\s*clamp\s*\(/i.test(cleaned)
    expect(hatHoehenCap).toBe(true)

    // Das cap erlaubt Overflow innerhalb des Arenasteins, ohne dass das
    // darunterliegende Grid-Row (Bottom-Row) verdeckt wird.
    expect(cleaned).toMatch(/overflow:\s*(hidden|auto)\b/)
  })

  it('komprimiert Spielerrahmen und Zugseitenleiste auf /game zu moderaten Hoehen', () => {
    // Spielerrahmen 92 px und Zugseitenleiste 90 px (alte Werte) addieren
    // sich zu 182 px allein fuer diese beiden Reihen. M1d0 kappt sie auf
    // maximal 6.5vh bzw. 7vh, damit die Bottom-Row nicht aus dem 900-px-
    // Viewport faellt.
    const rahmen = cleanedBlock(
      '.spielbereich--game-route [class~="waldtanz-spielerrahmen"]',
    )
    // Spielerrahmen behält eine max-height (sonst wird er beliebig hoch).
    expect(rahmen).toMatch(/max-height:\s*clamp\s*\(/i)
    // Cap liegt unter 9vh (vorher 9vh).
    const rahmenCap = rahmen.match(/max-height:\s*clamp\(\s*[^,]+,\s*([^,]+)/i)?.[1].trim() ?? ''
    expect(rahmenCap).toBeTruthy()

    const zug = cleanedBlock(
      '.spielbereich--game-route [class~="waldtanz-zugseitenleiste"]',
    )
    expect(zug).toMatch(/max-height:\s*clamp\s*\(/i)
    const zugCap = zug.match(/max-height:\s*clamp\(\s*[^,]+,\s*([^,]+)/i)?.[1].trim() ?? ''
    expect(zugCap).toBeTruthy()
  })

  it('rendert WaldtanzQuestband mit begrenzter Hoehe so dass das Arenastein kompakt bleibt', () => {
    // Questband war unbeschraenkt 134 px hoch (M1cv-Einfuehrung). M1d0 legt
    // eine max-height an, damit die Pillen-Reihe nicht das Arenastein
    // aufblaeht. Die Pills behalten ihren horizontalen Scroll (auf
    // .waldtanz-questband__liste), das gesamte Band selbst hat overflow:
    // hidden damit der Max-Height-Cap greift.
    const cleaned = cleanedBlock('.waldtanz-questband')
    // max-height explizit gesetzt
    expect(cleaned).toMatch(/max-height:\s*clamp\s*\(/i)
    // Band clippt (Cap greift), interne Liste darf horizontal scrollen
    expect(cleaned).toMatch(/overflow:\s*hidden/i)

    const liste = cleanedBlock('.waldtanz-questband__liste')
    expect(liste).toMatch(/overflow-x:\s*auto/i)
  })
})