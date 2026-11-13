import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { serialisiere } from '../engine'
import Entwicklertisch from './Entwicklertisch'
import { starteEntwicklerPartie } from './partie'
import { findeSzenario, SZENARIEN } from './szenarien'

function oeffne(adresse: string) {
  window.history.pushState({}, '', adresse)
  return render(<Entwicklertisch />)
}

function zustandsText(): string {
  return screen.getByTestId('zustand-json').textContent ?? ''
}

function aktionsKnoepfe(): string[] {
  return screen.queryAllByRole('button').flatMap((knopf) => {
    const aktion = knopf.getAttribute('data-aktion')
    return aktion === null ? [] : [aktion]
  })
}

describe('E1: Entwicklertisch auf der neuen Aktionsschicht', () => {
  it('P0.4 K1: /dev?seed=1&spieler=2 zeigt genau die Partie aus Saat 1 mit zwei Spielern ohne Erweiterung', () => {
    oeffne('/dev?seed=1&spieler=2')
    expect(screen.getByTestId('entwicklertisch')).toBeInTheDocument()
    expect(zustandsText()).toBe(serialisiere(starteEntwicklerPartie(1, 2, false)))
    expect(screen.getAllByTestId('spieler')).toHaveLength(2)
    expect(screen.getByTestId('erweiterung')).toHaveTextContent('ohne')
  })

  it('E1: der Parameter erweiterung=1 baut die Partie mit Erweiterung', () => {
    oeffne('/dev?seed=1&spieler=3&erweiterung=1')
    expect(zustandsText()).toBe(serialisiere(starteEntwicklerPartie(1, 3, true)))
    expect(screen.getByTestId('erweiterung')).toHaveTextContent('mit')
    expect(screen.getByTestId('offene-aufgaben')).toHaveTextContent(starteEntwicklerPartie(1, 3, true).offeneAufgaben[0].name)
  })

  it('P0.4: zeigt alle Hände offen, mit jeder Karte beim Namen und ihrer Id', () => {
    oeffne('/dev?seed=1&spieler=3')
    const zustand = starteEntwicklerPartie(1, 3, false)
    const haende = screen.getAllByTestId('hand')
    expect(haende).toHaveLength(3)
    zustand.spieler.forEach((spieler, index) => {
      for (const karte of spieler.hand) {
        expect(within(haende[index]).getByText(karte.id, { exact: false })).toBeInTheDocument()
      }
    })
  })

  it('E1: zeigt Partiephase, Zug mit Teilzug, wer entscheidet, Stapel, Ablagestapel je Spieler und Wertung', () => {
    oeffne('/dev?seed=1&spieler=2')
    const zustand = starteEntwicklerPartie(1, 2, false)
    expect(screen.getByTestId('partiephase')).toHaveTextContent('Laufend')
    expect(screen.getByTestId('zug')).toHaveTextContent('Teilzug 1')
    expect(screen.getByTestId('entscheider')).toHaveTextContent(zustand.spieler[0].name)
    expect(screen.getByTestId('nachziehstapel')).toHaveTextContent(String(zustand.nachziehstapel.length))
    expect(screen.getAllByTestId('ablagestapel')).toHaveLength(2)
    expect(screen.getByTestId('wertung')).toBeInTheDocument()
  })

  it('E1: die Engine zählt nach E1 keine Aktion auf; der Tisch sagt das und baut keine eigene', () => {
    oeffne('/dev?seed=1&spieler=2')
    expect(aktionsKnoepfe()).toEqual([])
    expect(screen.getByTestId('keine-aktion')).toHaveTextContent('Die Engine zählt hier keine Aktion auf')
  })

  it('E1: das Szenario alle-orte zeigt Fusion, ausliegende Grube, schwebende Karte und Karten aus dem Spiel', () => {
    oeffne('/dev?szenario=alle-orte')
    const zustand = findeSzenario('alle-orte')!.erzeuge()
    expect(zustandsText()).toBe(serialisiere(zustand))
    const fusion = zustand.spieler[0].schlangen[0].fusionen[0]
    expect(screen.getByTestId('fusion')).toHaveTextContent(fusion.unter[0].id)
    expect(screen.getByTestId('gruben')).toHaveTextContent(zustand.ausliegendeGruben[0].karte.id)
    expect(screen.getByTestId('schwebend')).toHaveTextContent(zustand.schwebend!.karte.id)
    expect(screen.getByTestId('aus-dem-spiel')).toHaveTextContent(zustand.ausDemSpiel[0].id)
    expect(screen.getByTestId('entscheider')).toHaveTextContent(zustand.spieler[2].name)
  })

  it('P0.4: verletzte Invarianten stehen sichtbar als verletzt da', () => {
    oeffne('/dev?szenario=kaputt-doppelte-karte')
    const verletzt = screen.getAllByTestId('invariante').filter((e) => e.getAttribute('data-verletzt') === 'ja')
    expect(verletzt.map((eintrag) => eintrag.getAttribute('data-name'))).toEqual([
      'Jede Spielkarte liegt genau einmal an genau einem Ort',
      'Alle Ids sind eindeutig',
      'Der Spielstand übersteht Speichern und Laden unverändert',
    ])
    expect(verletzt[0]).toHaveTextContent('2×')
  })

  it('P0.4: /dev/szenarien listet alle Szenarien mit Beschreibung, Erwartung und Link', () => {
    oeffne('/dev/szenarien')
    const zeilen = screen.getAllByTestId('szenario')
    expect(zeilen).toHaveLength(SZENARIEN.length)
    SZENARIEN.forEach((szenario, index) => {
      expect(zeilen[index]).toHaveTextContent(szenario.beschreibung)
      expect(zeilen[index]).toHaveTextContent(szenario.erwartet)
      expect(within(zeilen[index]).getByRole('link')).toHaveAttribute('href', `/dev?szenario=${szenario.name}`)
    })
  })

  it('P0.4: ein unbekanntes Szenario zeigt den Grund', () => {
    oeffne('/dev?szenario=gibtsnicht')
    expect(screen.getByTestId('fehlermeldung')).toHaveTextContent('gibtsnicht')
  })

  it('P0.4: die Startseite bietet Szenarien und den Partiestart mit Erweiterungs-Schalter an', () => {
    oeffne('/dev')
    const links = screen.getAllByRole('link', { name: /Szenarien/ })
    expect(links.length).toBeGreaterThan(0)
    for (const link of links) expect(link).toHaveAttribute('href', '/dev/szenarien')
    expect(screen.getByRole('spinbutton', { name: /Saat/ })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: /Erweiterung/ })).toBeInTheDocument()
  })
})
