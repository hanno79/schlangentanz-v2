/**
 * Author: rahn
 * Datum: 15.06.2026
 * Version: 1.0
 * Beschreibung: M1ao hält die /game-Waldtanz-Bühne kompakt, damit Arena und Handkarten wie im Google-Stitch-Board im ersten Spielbild zusammengehören.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

const appCss = readFileSync('src/App.css', 'utf8')

function cssBlockForSelector(selector: string) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return appCss.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''
}

describe('M1ao Waldtanz-Fokusbrett', () => {
  it('begrenzt den /game-Arenastein als sichtbare Spielbrettfläche und hält die Hand direkt danach board-nah', () => {
    window.history.pushState({}, '', '/game')
    render(<App />)

    const spielbereich = screen.getByRole('region', { name: 'Spielbereich' })
    const spieltisch = within(spielbereich).getByRole('region', { name: 'Spieltisch' })
    const arena = within(spieltisch).getByRole('region', { name: 'Waldtanz-Arenastein' })
    const handkarten = within(spieltisch).getByRole('region', { name: 'Handkarten' })
    const zugleiste = within(spieltisch).getByRole('complementary', { name: 'Zugleiste' })
    const schlangenlichtung = within(arena).getByRole('region', { name: 'Schlangenlichtung' })
    const waldobjekte = within(arena).getByRole('complementary', { name: 'Waldobjekte' })

    expect(spielbereich).toHaveClass('spielbereich--game-route')
    expect(spieltisch).toHaveClass('spielbrett--waldtanz')
    expect(within(zugleiste).getByRole('region', { name: 'Zugpfad' })).toBeVisible()
    expect(within(zugleiste).getByRole('region', { name: 'Gegnerzug' })).toBeVisible()
    expect(within(zugleiste).getByRole('region', { name: 'Zugkompass' })).toBeVisible()
    expect(within(zugleiste).getByRole('region', { name: 'Partiefortschritt' })).toBeVisible()
    const zugpfad = within(zugleiste).getByRole('region', { name: 'Zugpfad' })
    const gegnerzug = within(zugleiste).getByRole('region', { name: 'Gegnerzug' })
    expect(zugpfad.compareDocumentPosition(gegnerzug) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )
    expect(arena.compareDocumentPosition(handkarten) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )
    expect(schlangenlichtung).toBeVisible()
    expect(waldobjekte).toBeVisible()

    const routeArenaBlock = cssBlockForSelector('.spielbereich--game-route [class~="waldtanz-arenastein"]')
    // M1d0 22.06.2026: Arenastein-Hoehe wird nicht mehr per expliziter
    // height-clamp gepinnt; sie ergibt sich aus dem benannten Grid-Auto-Flow
    // (Grid-Zeile "arenastein") in Verbindung mit fester Arenastein-Hoehe
    // (clamp(28rem, 50vh, 30rem)). overflow:hidden statt visible, weil der
    // Schlangenbereich visuell geclippt wird.
    expect(routeArenaBlock).toMatch(/grid-area:\s*arenastein/)
    expect(routeArenaBlock).not.toMatch(/height:\s*clamp\(32\.5rem,\s*58vh,\s*33rem\)/)
    expect(routeArenaBlock).toMatch(/overflow:\s*hidden/)

    const routeZugleisteBlock = cssBlockForSelector('.spielbereich--game-route [class~="waldtanz-zugseitenleiste"]')
    // M1d0: Zugseitenleiste hat jetzt grid-area: zugseitenleiste statt
    // grid-row: 4. Die uebrigen Vertrags-Constraints (grid-template-columns,
    // max-height, overflow) bleiben unveraendert.
    expect(routeZugleisteBlock).toMatch(/grid-area:\s*zugseitenleiste/)
    expect(routeZugleisteBlock).toMatch(/grid-template-columns:\s*minmax\(6rem,\s*0\.65fr\)\s+repeat\(6,\s*minmax\(5\.1rem,\s*1fr\)\)/)
    // M1d0 22.06.2026: Zugseitenleiste auf 7vh komprimiert (vorher 12vh),
    // damit Arenastein und Bottom-Row in den 900-px-Viewport passen.
    expect(routeZugleisteBlock).toMatch(/max-height:\s*clamp\(4rem,\s*7vh,\s*5rem\)/)
    expect(routeZugleisteBlock).toMatch(/overflow:\s*hidden/)

    const routeZugleistenKinderBlock = cssBlockForSelector('.spielbereich--game-route [class~="waldtanz-zugseitenleiste"] > *')
    expect(routeZugleistenKinderBlock).toMatch(/grid-column:\s*auto/)
    expect(routeZugleistenKinderBlock).toMatch(/grid-row:\s*auto/)
    expect(routeZugleistenKinderBlock).toMatch(/max-height:\s*clamp\(4\.8rem,\s*10vh,\s*5\.8rem\)/)
    expect(routeZugleistenKinderBlock).toMatch(/overflow:\s*hidden/)

    const routeSpielerrahmenBlock = cssBlockForSelector('.spielbereich--game-route [class~="waldtanz-spielerrahmen"]')
    expect(routeSpielerrahmenBlock).toMatch(/grid-area:\s*spielerrahmen/)
    // M1d0 22.06.2026: Spielerrahmen auf 6vh komprimiert (vorher 9vh),
    // damit Spielerrahmen + Gegnerplakette + Arenastein + Bottom-Row
    // zusammen in den 900-px-Viewport passen.
    expect(routeSpielerrahmenBlock).toMatch(/max-height:\s*clamp\(3\.6rem,\s*6vh,\s*4\.6rem\)/)
    expect(routeSpielerrahmenBlock).toMatch(/overflow:\s*visible/)

    const routeSpielfeldBlock = cssBlockForSelector('.spielbereich--game-route [class~="waldtanz-arenastein__spielfeld"]')
    expect(routeSpielfeldBlock).toMatch(/grid-template-columns:\s*minmax\(0,\s*2\.55fr\) minmax\(9\.5rem,\s*0\.65fr\)/)
    expect(routeSpielfeldBlock).toMatch(/min-height:\s*0/)

    const routeLichtungBlock = cssBlockForSelector('.spielbereich--game-route [class~="waldtanz-arenastein__schlangenlichtung"]')
    // AENDERUNG 22.06.2026: M1cx reduziert die Schlangenlichtung-Mindesthoehe
    // von min(22rem, 48vh) auf min(18rem, 40vh), damit das Arenastein zusammen
    // mit Hand, Brettschritt-Stempel und Spielerplakette in das 900px-Erstbild passt.
    // AENDERUNG 23.06.2026 (M1d1): Die Schlangenlichtung bekommt flex:1 1 auto,
    // damit sie im Flex-Column-Arena den Restplatz fuellt. Die min-height sinkt
    // von min(18rem, 40vh) auf min(10rem, 24vh) als reine Bodenschwelle, da
    // flex:1 jetzt das Wachstum steuert. Beide Werte sind akzeptiert.
    // AENDERUNG 25.06.2026 (M1di): Schlangenlichtung als primary board surface —
    // min-height auf clamp(14rem, 32vh, 20rem) angehoben, grid-template-columns
    // entfernt (innere Struktur uebernimmt der neue M1di-Container). Akzeptiert
    // werden alle drei Werte aus der Evolutions-Kette.
    expect(routeLichtungBlock).toMatch(/min-height:\s*(min\((10rem,\s*24vh|18rem,\s*40vh)\)|clamp\(14rem,\s*32vh,\s*20rem\))/)
    expect(routeLichtungBlock).toMatch(/grid-template-rows:\s*auto auto/)

    const routeWaldobjekteBlock = cssBlockForSelector('.spielbereich--game-route [class~="waldtanz-arenastein__waldobjekte"]')
    expect(routeWaldobjekteBlock).toMatch(/max-height:\s*min\(21rem,\s*40vh\)/)
    expect(routeWaldobjekteBlock).toMatch(/overflow:\s*auto/)

    const routeHandBlock = cssBlockForSelector('.spielbereich--game-route [class~="handkarten-panel"]')
    // M1d0 22.06.2026: Handkarten-Panel ist jetzt Teil der benannten
    // Bottom-Row "sp-plakette hand arenazug" mit grid-area: hand statt
    // grid-row: 4 + align-self: end. Die explizite Positionierung entfaellt,
    // weil die benannten Grid-Areas die Lage strukturieren.
    expect(routeHandBlock).toMatch(/grid-area:\s*hand/)
    expect(routeHandBlock).not.toMatch(/grid-row:\s*4/)
    expect(routeHandBlock).not.toMatch(/align-self:\s*end/)
  })
})
