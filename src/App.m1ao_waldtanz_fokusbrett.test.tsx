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
  it('begrenzt den /game-Arenastein als scrollbare Spielbrettfläche und hält die Hand direkt danach board-nah', () => {
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
    expect(routeArenaBlock).toMatch(/max-height:\s*clamp\(26rem,\s*60vh,\s*34rem\)/)
    expect(routeArenaBlock).toMatch(/padding-bottom:\s*clamp\(5\.6rem,\s*15vh,\s*8rem\)/)
    expect(routeArenaBlock).toMatch(/overflow:\s*auto/)
    expect(routeArenaBlock).toMatch(/scrollbar-gutter:\s*stable/)

    const routeZugleisteBlock = cssBlockForSelector('.spielbereich--game-route [class~="waldtanz-zugseitenleiste"]')
    expect(routeZugleisteBlock).toMatch(/grid-row:\s*4/)
    expect(routeZugleisteBlock).toMatch(/grid-template-columns:\s*repeat\(4,\s*minmax\(min\(100%,\s*11rem\),\s*1fr\)\)/)
    expect(routeZugleisteBlock).toMatch(/max-height:\s*clamp\(6\.5rem,\s*18vh,\s*9rem\)/)
    expect(routeZugleisteBlock).toMatch(/overflow:\s*auto/)

    const routeZugleistenKinderBlock = cssBlockForSelector('.spielbereich--game-route [class~="waldtanz-zugseitenleiste"] > *')
    expect(routeZugleistenKinderBlock).toMatch(/grid-column:\s*auto/)
    expect(routeZugleistenKinderBlock).toMatch(/grid-row:\s*auto/)

    const routeSpielerrahmenBlock = cssBlockForSelector('.spielbereich--game-route [class~="waldtanz-spielerrahmen"]')
    expect(routeSpielerrahmenBlock).toMatch(/max-height:\s*clamp\(8rem,\s*16vh,\s*10rem\)/)
    expect(routeSpielerrahmenBlock).toMatch(/overflow:\s*auto/)

    const routeSpielfeldBlock = cssBlockForSelector('.spielbereich--game-route [class~="waldtanz-arenastein__spielfeld"]')
    expect(routeSpielfeldBlock).toMatch(/grid-template-columns:\s*minmax\(0,\s*2\.55fr\) minmax\(9\.5rem,\s*0\.65fr\)/)
    expect(routeSpielfeldBlock).toMatch(/min-height:\s*0/)

    const routeLichtungBlock = cssBlockForSelector('.spielbereich--game-route [class~="waldtanz-arenastein__schlangenlichtung"]')
    expect(routeLichtungBlock).toMatch(/min-height:\s*min\(22rem,\s*48vh\)/)
    expect(routeLichtungBlock).toMatch(/grid-template-rows:\s*auto auto/)

    const routeWaldobjekteBlock = cssBlockForSelector('.spielbereich--game-route [class~="waldtanz-arenastein__waldobjekte"]')
    expect(routeWaldobjekteBlock).toMatch(/max-height:\s*min\(21rem,\s*40vh\)/)
    expect(routeWaldobjekteBlock).toMatch(/overflow:\s*auto/)

    const routeHandBlock = cssBlockForSelector('.spielbereich--game-route [class~="handkarten-panel"]')
    expect(routeHandBlock).toMatch(/grid-row:\s*3/)
    expect(routeHandBlock).toMatch(/align-self:\s*end/)
    expect(routeHandBlock).toMatch(/margin-top:\s*0/)
  })
})
