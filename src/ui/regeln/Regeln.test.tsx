import { beforeAll, describe, expect, it } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { dialogNachbilden } from '../../test/dialog'
import { KARTENHILFEN } from '../karten/hilfe/kartenhilfe'
import Regeln from './Regeln'
import { istErgaenzungDesAutors, ZUGSCHRITTE } from './zugschritte'

/*
O9: Die Regelseite verweist auf die Website, fasst einen Zug in fünf Schritten
zusammen (Kriterium 2) und zeigt alle Karten; eine gewählte Karte zeigt ihren
Text (Kriterium 1).
*/

beforeAll(dialogNachbilden)

describe('O9: /regeln verweist auf die Website und fasst einen Zug zusammen (Kriterium 2)', () => {
  it('O9: der einzige Verweis auf die Website führt zu den Regeln auf schlangentanz.ch', () => {
    render(<Regeln />)
    const verweis = screen.getByRole('link', { name: /schlangentanz\.ch/ })
    expect(verweis).toHaveAttribute('href', 'https://schlangentanz.ch/rules')
  })

  it('O9/A5: „Ein Zug in fünf Schritten“ ist eine nummerierte Liste mit fünf Einträgen', () => {
    render(<Regeln />)
    const abschnitt = screen.getByRole('region', { name: 'Ein Zug in fünf Schritten' })
    const liste = within(abschnitt).getByRole('list')
    expect(liste.tagName).toBe('OL')
    const eintraege = within(liste).getAllByRole('listitem')
    expect(eintraege).toHaveLength(5)
    ZUGSCHRITTE.forEach((schritt, i) => {
      expect(within(eintraege[i]).getByRole('heading', { name: new RegExp(`^${schritt.titel}`) })).toBeInTheDocument()
    })
  })

  it('O9/U2: jede Ergänzung des Autors (Teil D) ist sichtbar gekennzeichnet, kein Satz der Website', () => {
    render(<Regeln />)
    const ergaenzungen = ZUGSCHRITTE.flatMap((schritt) => schritt.saetze).filter(istErgaenzungDesAutors)
    expect(ergaenzungen.length, 'Ergänzungen in der Zusammenfassung').toBeGreaterThan(0)
    expect(screen.getAllByText('Ergänzung des Autors', { selector: '.zugablauf__etikett' })).toHaveLength(
      ergaenzungen.length,
    )
    for (const satz of ergaenzungen) {
      const stelle = screen.getByText(satz.text)
      expect(stelle.closest('.zugablauf__ergaenzung'), `nicht gekennzeichnet: ${satz.text}`).not.toBeNull()
    }
    const website = ZUGSCHRITTE.flatMap((schritt) => schritt.saetze).filter((satz) => !istErgaenzungDesAutors(satz))
    for (const satz of website) {
      expect(screen.getByText(satz.text).closest('.zugablauf__ergaenzung'), `fälschlich gekennzeichnet: ${satz.text}`).toBeNull()
    }
    expect(screen.getByText(/noch nicht auf der Website/)).toBeInTheDocument()
  })

  it('O9: „Aufgabe erfüllen“ trägt den Hinweis „Nur mit Erweiterung“', () => {
    render(<Regeln />)
    const schritt = screen.getByRole('heading', { name: /^Aufgabe erfüllen/ })
    expect(schritt).toHaveTextContent('Nur mit Erweiterung')
  })

  it('O9: der Fuss führt zurück zur Lobby', () => {
    render(<Regeln />)
    expect(screen.getByRole('link', { name: 'Zurück zur Lobby' })).toHaveAttribute('href', '/')
  })
})

describe('O9: Kartenübersicht auf /regeln, jede Karte zeigt auf Wunsch ihren Text (Kriterium 1)', () => {
  it('O9: alle 33 Karten stehen als Knöpfe in der Übersicht', () => {
    render(<Regeln />)
    const uebersicht = screen.getByRole('region', { name: 'Alle Karten' })
    expect(within(uebersicht).getAllByRole('button')).toHaveLength(KARTENHILFEN.length)
  })

  it.each(KARTENHILFEN.map((hilfe) => [hilfe.karte.id, hilfe] as const))(
    'O9: %s: Antippen öffnet die Grossansicht mit dem Kurztext, „Schliessen“ schliesst sie',
    (_, hilfe) => {
      render(<Regeln />)
      const knoepfe = within(screen.getByRole('region', { name: 'Alle Karten' })).getAllByRole('button')
      const knopf = knoepfe[KARTENHILFEN.indexOf(hilfe)]
      expect(knopf).toHaveAttribute('aria-haspopup', 'dialog')
      fireEvent.click(knopf)
      const dialog = screen.getByRole('dialog')
      expect(within(dialog).getByText(hilfe.kurz)).toBeInTheDocument()
      fireEvent.click(within(dialog).getByRole('button', { name: 'Schliessen' }))
      expect(screen.queryByRole('dialog')).toBeNull()
    },
  )

  it('O9: der Knopf nennt die Karte und sagt, dass er ihren Text zeigt', () => {
    render(<Regeln />)
    expect(screen.getByRole('button', { name: 'Farbendieb: Text zeigen' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Lila Riese: Text zeigen' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Blau: Text zeigen' })).toBeInTheDocument()
  })
})
