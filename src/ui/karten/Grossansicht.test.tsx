import { beforeAll, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { dialogNachbilden } from '../../test/dialog'
import { Grossansicht } from './Grossansicht'
import { KARTENHILFEN, type Kartenhilfe } from './hilfe/kartenhilfe'
import { Kartentext } from './Kartentext'

/*
O9, Kriterium 1: Die Grossansicht einer Karte zeigt neben dem Bild ihren Text.
Die Komponente ist für Regelseite, Tisch (O4) und Kartenwahl (O5) gedacht und
bekommt deshalb nur die Karte und einen Weg zum Schliessen.
*/

beforeAll(dialogNachbilden)

const ETIKETT = /\s*\[Erweiterung\]$/

/** Alle Texte eines Kartentexts so, wie sie angezeigt werden: „[Erweiterung]“ wird zum Etikett. */
function angezeigteTexte(hilfe: Kartenhilfe): string[] {
  return [
    hilfe.kurz,
    ...hilfe.abschnitte.flatMap((abschnitt) => [
      ...(abschnitt.titel === undefined ? [] : [abschnitt.titel]),
      ...abschnitt.inhalt.flat(),
    ]),
  ].map((text) => text.replace(ETIKETT, ''))
}

const leerzeichen = (text: string | null) => (text ?? '').replace(/\s+/g, ' ')

describe('O9: Kartentext zeigt den Wortlaut der Spielanleitung (Kriterium 1)', () => {
  it.each(KARTENHILFEN.map((hilfe) => [hilfe.karte.id, hilfe] as const))(
    'O9: %s zeigt Kurztext, Zwischentitel, Absätze und Aufzählungen',
    (_, hilfe) => {
      const { container } = render(<Kartentext karte={hilfe.karte} />)
      const text = leerzeichen(container.textContent)
      const fehlend = angezeigteTexte(hilfe).filter((teil) => !text.includes(leerzeichen(teil)))
      expect(fehlend, `${hilfe.karte.id}: nicht angezeigt`).toEqual([])
    },
  )

  it('O9: ein Punkt mit „[Erweiterung]“ trägt das Etikett „Erweiterung“ statt der Klammer', () => {
    const regenbogen = KARTENHILFEN.find((h) => h.karte.typ === 'Sonderkarte' && h.karte.name === 'Regenbogenschlange')!
    render(<Kartentext karte={regenbogen.karte} />)
    const punkt = screen.getByText(/Die Farbe ist nie festgelegt und kann sich während des Spiels ändern/).closest('li')!
    expect(punkt.textContent).not.toContain('[Erweiterung]')
    expect(within(punkt).getByText('Erweiterung')).toBeInTheDocument()
  })

  it('O9: eine Aufgabe nennt ihre Punkte', () => {
    const lilaRiese = KARTENHILFEN.find((h) => h.karte.typ === 'Aufgabenkarte' && h.karte.name === 'Lila Riese')!
    render(<Kartentext karte={lilaRiese.karte} />)
    expect(screen.getByRole('heading', { name: 'Aufgabe Lila Riese' })).toBeInTheDocument()
    expect(screen.getByText('5 Punkte')).toBeInTheDocument()
    expect(screen.getByText('Bilde eine ununterbrochene Reihe aus min. 5 violetten Karten.')).toBeInTheDocument()
  })
})

describe('O9: Grossansicht einer Karte', () => {
  const farbendieb = KARTENHILFEN.find((h) => h.karte.typ === 'Sonderkarte' && h.karte.name === 'Farbendieb')!

  it('O9: zeigt als Dialog Bild, Text und „Schliessen“; der Dialog trägt den Namen der Karte', () => {
    render(<Grossansicht karte={farbendieb.karte} schliesse={() => {}} />)
    const dialog = screen.getByRole('dialog', { name: 'Farbendieb' })
    expect(within(dialog).getByRole('img', { name: 'Sonderkarte Farbendieb' })).toBeInTheDocument()
    expect(within(dialog).getByText(farbendieb.kurz)).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: 'Schliessen' })).toBeInTheDocument()
  })

  it('O9: „Schliessen“ schliesst den Dialog und meldet es dem Aufrufer', () => {
    const schliesse = vi.fn()
    render(<Grossansicht karte={farbendieb.karte} schliesse={schliesse} />)
    fireEvent.click(screen.getByRole('button', { name: 'Schliessen' }))
    expect(schliesse).toHaveBeenCalledTimes(1)
  })

  it('O9: ein Tippen neben den Dialog schliesst ihn, ein Tippen in den Text nicht', () => {
    const schliesse = vi.fn()
    render(<Grossansicht karte={farbendieb.karte} schliesse={schliesse} />)
    fireEvent.click(screen.getByText(farbendieb.kurz))
    expect(schliesse).not.toHaveBeenCalled()
    const dialog = screen.getByRole('dialog')
    dialog.getBoundingClientRect = () => DOMRect.fromRect({ x: 100, y: 100, width: 300, height: 400 })
    fireEvent.click(dialog, { clientX: 20, clientY: 20 })
    expect(schliesse).toHaveBeenCalledTimes(1)
  })
})
