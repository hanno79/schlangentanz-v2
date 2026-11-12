import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { serialisiere, starteAusspielphase } from '../engine'
import Entwicklertisch from './Entwicklertisch'
import { aufgezaehlteAktionen, starteEntwicklerPartie } from './partie'
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

describe('P0.4: Entwicklertisch', () => {
  it('P0.4 K1: /dev?seed=1&spieler=2 zeigt genau die Partie aus Saat 1 mit zwei Spielern', () => {
    oeffne('/dev?seed=1&spieler=2')
    expect(screen.getByTestId('entwicklertisch')).toBeInTheDocument()
    expect(zustandsText()).toBe(serialisiere(starteEntwicklerPartie(1, 2)))
    expect(screen.getAllByTestId('spieler')).toHaveLength(2)
  })

  it('P0.4: zeigt alle Hände offen, mit jeder Karte beim Namen und ihrer Id', () => {
    oeffne('/dev?seed=1&spieler=3')
    const zustand = starteEntwicklerPartie(1, 3)
    const haende = screen.getAllByTestId('hand')
    expect(haende).toHaveLength(3)
    zustand.spieler.forEach((spieler, index) => {
      for (const karte of spieler.hand) {
        expect(within(haende[index]).getByText(karte.id, { exact: false })).toBeInTheDocument()
      }
    })
  })

  it('P0.4: zeigt Phase, Stapel, Aufgaben und Wertung', () => {
    oeffne('/dev?seed=1&spieler=2')
    const zustand = starteEntwicklerPartie(1, 2)
    expect(screen.getByTestId('zugphase')).toHaveTextContent('Nachziehphase')
    expect(screen.getByTestId('nachziehstapel')).toHaveTextContent(String(zustand.nachziehstapel.length))
    expect(screen.getByTestId('ablagestapel')).toHaveTextContent('0')
    expect(screen.getByTestId('offene-aufgaben')).toHaveTextContent(zustand.offeneAufgaben[0].name)
    expect(screen.getByTestId('wertung')).toBeInTheDocument()
  })

  it('P0.4 K2: jede aufgezählte Aktion ist ein Knopf, und ein Klick ändert den Zustand', () => {
    oeffne('/dev?seed=1&spieler=2')
    expect(aktionsKnoepfe()).toEqual([])
    fireEvent.click(screen.getByRole('button', { name: 'Ausspielphase starten' }))

    const erwartet = aufgezaehlteAktionen(starteAusspielphase(starteEntwicklerPartie(1, 2)))
    expect(aktionsKnoepfe()).toEqual(erwartet.map((aktion) => JSON.stringify(aktion)))

    const vorher = zustandsText()
    const ersterKnopf = screen.getAllByRole('button').find((knopf) => knopf.hasAttribute('data-aktion'))!
    fireEvent.click(ersterKnopf)
    expect(zustandsText()).not.toBe(vorher)
  })

  it('P0.4 K2: im Reaktionsfenster sind die Reaktionen der Engine die Knöpfe', () => {
    oeffne('/dev?szenario=reaktionsfenster')
    const zustand = findeSzenario('reaktionsfenster')!.erzeuge()
    expect(aktionsKnoepfe()).toEqual(aufgezaehlteAktionen(zustand).map((aktion) => JSON.stringify(aktion)))
    const vorher = zustandsText()
    fireEvent.click(screen.getAllByRole('button').find((knopf) => knopf.hasAttribute('data-aktion'))!)
    expect(zustandsText()).not.toBe(vorher)
  })

  it('P0.4: lehnt die Engine einen Schritt ab, steht ihr Grund da und der Zustand bleibt', () => {
    oeffne('/dev?szenario=ausspielphase')
    const vorher = zustandsText()
    fireEvent.click(screen.getByRole('button', { name: 'Ausspielphase beenden' }))
    expect(screen.getByTestId('fehlermeldung')).toHaveTextContent('mindestens einer gespielten Karte')
    expect(zustandsText()).toBe(vorher)
  })

  it('P0.4: „Schritt zurück“ stellt den vorigen Zustand wieder her', () => {
    oeffne('/dev?seed=1&spieler=2')
    const vorher = zustandsText()
    fireEvent.click(screen.getByRole('button', { name: 'Ausspielphase starten' }))
    expect(zustandsText()).not.toBe(vorher)
    fireEvent.click(screen.getByRole('button', { name: 'Schritt zurück' }))
    expect(zustandsText()).toBe(vorher)
  })

  it('P0.4: verletzte Invarianten stehen sichtbar als verletzt da', () => {
    oeffne('/dev?szenario=kaputt-doppelte-karte')
    const verletzt = screen.getAllByTestId('invariante').filter((e) => e.getAttribute('data-verletzt') === 'ja')
    expect(verletzt).toHaveLength(1)
    expect(verletzt[0]).toHaveTextContent('Jede Spielkarte liegt genau einmal im Spiel')
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

  it('P0.4: ein unbekanntes Szenario oder eine ungültige Adresse zeigt den Grund', () => {
    oeffne('/dev?szenario=gibtsnicht')
    expect(screen.getByTestId('fehlermeldung')).toHaveTextContent('gibtsnicht')
  })

  it('P0.4: die Startseite bietet Szenarien und den Partiestart an', () => {
    oeffne('/dev')
    expect(screen.getByRole('link', { name: /Szenarien/ })).toHaveAttribute('href', '/dev/szenarien')
    expect(screen.getByRole('spinbutton', { name: /Saat/ })).toBeInTheDocument()
  })

  it('P0.4: der Parameter erweiterung wird angezeigt, mit dem Hinweis, dass die Engine ihn noch nicht kennt', () => {
    oeffne('/dev?seed=1&spieler=2&erweiterung=1')
    expect(screen.getByTestId('hinweis-erweiterung')).toHaveTextContent('Erweiterung')
    expect(zustandsText()).toBe(serialisiere(starteEntwicklerPartie(1, 2)))
  })
})
