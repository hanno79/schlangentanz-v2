import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { useUeberlauf } from './ueberlauf'
import { Weiter } from './Weiter'

/*
O4, Hinweis 4 des Prüfprotokolls, für O5: `useUeberlauf` hing den
Scroll-Beobachter nur beim ersten Einhängen an. Wird die Liste ausgehängt und
neu eingehängt (die Hand wird leer und wieder gefüllt), folgte das Zeichen
„geht weiter“ dem Wischen nicht mehr.

jsdom kennt kein Layout. Der Test setzt deshalb die Masse der Liste und ihrer
Glieder von Hand: zehn Glieder zu 50 px, 100 px sichtbar.
*/

function Liste({ gefuellt }: { gefuellt: boolean }) {
  const [reihe, ueberlauf] = useUeberlauf<HTMLUListElement>()
  if (!gefuellt) return <p>leer</p>
  return (
    <div>
      <ul ref={reihe} data-testid="reihe">
        {Array.from({ length: 10 }, (_, index) => (
          <li key={index}>{index}</li>
        ))}
      </ul>
      <Weiter ueberlauf={ueberlauf} />
    </div>
  )
}

/** Gibt der Liste ein Layout: 100 px sichtbar, 500 px Inhalt, um `links` px gescrollt. */
function vermesse(liste: HTMLElement, links: number): void {
  Object.defineProperty(liste, 'clientWidth', { configurable: true, value: 100 })
  Object.defineProperty(liste, 'scrollWidth', { configurable: true, value: 500 })
  Object.defineProperty(liste, 'scrollLeft', { configurable: true, writable: true, value: links })
  liste.getBoundingClientRect = () => new DOMRect(0, 0, 100, 50)
  Array.from(liste.children).forEach((glied, index) => {
    glied.getBoundingClientRect = () => new DOMRect(index * 50 - links, 0, 50, 50)
  })
}

describe('O4 Hinweis 4/O5: Das Zeichen folgt dem Wischen, auch nachdem die Liste neu eingehängt wurde', () => {
  it('O5: nach Leeren und erneutem Füllen zeigt das Zeichen nach dem Scrollen links die Karten vor dem Rand', () => {
    const { rerender } = render(<Liste gefuellt />)
    rerender(<Liste gefuellt={false} />)
    rerender(<Liste gefuellt />)
    const liste = screen.getByTestId('reihe')
    vermesse(liste, 300)
    fireEvent.scroll(liste)
    expect(screen.getByText('‹ +6')).toBeInTheDocument()
  })
})
