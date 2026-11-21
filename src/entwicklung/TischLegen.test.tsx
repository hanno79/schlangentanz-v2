import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import Entwicklertisch from './Entwicklertisch'

/*
E5: Regenbogenschlange und Blockade haben je Karte viele Ziele (jede Lücke jeder
Schlange). Damit man am Entwicklertisch das richtige anklickt, nennt die
Beschriftung des Knopfs Schlange und Stelle.
*/

function oeffne(adresse: string) {
  window.history.pushState({}, '', adresse)
  return render(<Entwicklertisch />)
}

describe('E5: Knöpfe zum Legen am Entwicklertisch', () => {
  it('A7.5: jeder Knopf BlockadeLegen nennt Schlange und Stelle', () => {
    oeffne('/dev?szenario=blockade-abwehr')
    const knoepfe = screen.getAllByRole('button', { name: /^BlockadeLegen: .*→ schlange-2, Stelle 1/ })
    expect(knoepfe, 'A7.5: je einer für die beiden Blockaden').toHaveLength(2)
    for (const knopf of knoepfe) {
      expect(JSON.parse(knopf.getAttribute('data-aktion')!)).toMatchObject({ typ: 'BlockadeLegen', schlangenId: 'schlange-2', position: 1 })
    }
    expect(screen.getAllByRole('button', { name: /^BlockadeLegen: .*→ schlange-\d, Stelle \d/ })).toHaveLength(18)
  })

  it('A7.3: jeder Knopf RegenbogenschlangeLegen nennt Schlange und Stelle', () => {
    oeffne('/dev?szenario=regenbogen')
    expect(screen.getAllByRole('button', { name: /^RegenbogenschlangeLegen: .*→ schlange-\d, Stelle \d/ })).toHaveLength(8)
  })
})
