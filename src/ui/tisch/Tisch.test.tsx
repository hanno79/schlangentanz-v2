import { describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import type { Spielzustand } from '../../engine'
import { tischAnsicht } from '../spiel/tischAnsicht'
import { angriffAufMich, mittelspiel, neuePartie, volltisch } from './__tests__/szenarien'
import { Tisch } from './Tisch'

/*
O4: Der Spieltisch zeigt einen Spielstand, ohne ihn zu verändern. Der Mensch
sitzt unten, die Gegner oben, dazwischen die Tischmitte. Bedienung (O5) und
KI-Ablauf (O3, O6) kommen später; hier wird nur gezeichnet.
*/

function zeige(zustand: Spielzustand) {
  return render(<Tisch ansicht={tischAnsicht(zustand)} />)
}

const region = (name: string) => screen.getByRole('region', { name })
const gegnerKasten = (name: string) => screen.getByRole('article', { name })
const bilderIn = (element: HTMLElement) => within(element).queryAllByRole('img')

describe('O4 K1: Der Mensch sitzt unten, auch während eines KI-Zuges', () => {
  it('O4 K1: während KI-Gegner 2 am Zug ist, stehen deine Hand und deine Schlangen als „deine“ beschriftet da', () => {
    zeige(volltisch())
    expect(screen.getByRole('status')).toHaveTextContent('KI-Gegner 2 ist dran')

    const hand = region('Deine Hand')
    expect(within(hand).getByRole('heading')).toHaveTextContent(/Deine Hand/)
    expect(within(within(hand).getByRole('list', { name: 'Handkarten' })).getAllByRole('img')).toHaveLength(5)

    const schlangen = region('Deine Schlangen')
    expect(within(schlangen).getByRole('heading')).toHaveTextContent('Deine Schlangen')
    const listen = within(schlangen).getAllByRole('list')
    expect(listen.map((liste) => liste.getAttribute('aria-label')?.split(':')[0])).toEqual(['Deine Schlange 1', 'Deine Schlange 2'])
  })

  it('O4 K1: der eigene Bereich steht im Dokument nach der Tischfläche, also unten', () => {
    const { container } = zeige(volltisch())
    const flaeche = container.querySelector('.st-flaeche')
    const unten = container.querySelector('.st-unten')
    expect(flaeche, 'Tischfläche').not.toBeNull()
    expect(unten, 'eigener Bereich unten').not.toBeNull()
    expect(flaeche!.compareDocumentPosition(unten!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(within(unten as HTMLElement).getByRole('region', { name: 'Deine Hand' })).toBeInTheDocument()
    expect(within(flaeche as HTMLElement).getByRole('region', { name: 'Gegner' })).toBeInTheDocument()
  })
})

describe('O4: Gegner oben, Tischmitte, eigener Ablagestapel', () => {
  it('O4: jeder Gegner zeigt Name, Zahl der Handkarten, Schlangen und Ablagestapel', () => {
    zeige(mittelspiel())
    const gegner = within(region('Gegner')).getAllByRole('article')
    expect(gegner.map((kasten) => within(kasten).getByRole('heading').textContent)).toEqual(['KI-Gegner 1', 'KI-Gegner 2'])

    const ki1 = gegnerKasten('KI-Gegner 1')
    expect(ki1).toHaveTextContent('5 Handkarten')
    expect(ki1).toHaveTextContent('Ablage 2')
    expect(within(ki1).getByRole('img', { name: 'Farbkarte Rot, 1 Punkt' })).toBeInTheDocument()
    expect(within(ki1).getAllByRole('list')).toHaveLength(1)

    const ki2 = gegnerKasten('KI-Gegner 2')
    expect(ki2).toHaveTextContent('Ablage leer')
    expect(within(ki2).getAllByRole('list')).toHaveLength(2)
  })

  it('O4/B2: von fremden Handkarten steht nur die Zahl am Tisch, kein Bild', () => {
    zeige(mittelspiel())
    // Offen liegen nur Schlangen, Ablage und Grube: KI-Gegner 1 hat 5 Schlangenkarten und eine Ablage,
    // KI-Gegner 2 hat 4 + 3 Schlangenkarten und die Grube vor sich. Fünf Handkarten wären fünf Bilder mehr.
    expect(bilderIn(gegnerKasten('KI-Gegner 1'))).toHaveLength(6)
    expect(bilderIn(gegnerKasten('KI-Gegner 2'))).toHaveLength(8)
  })

  it('O4: die Tischmitte zeigt den Nachziehstapel mit seiner Anzahl', () => {
    const zustand = mittelspiel()
    zeige(zustand)
    const mitte = region('Tischmitte')
    expect(mitte).toHaveTextContent('Nachziehstapel')
    expect(mitte).toHaveTextContent(String(zustand.nachziehstapel.length))
    expect(within(mitte).getByRole('img', { name: 'Verdeckte Karte' })).toBeInTheDocument()
  })

  it('O4: ein leerer Nachziehstapel wird gesagt, nicht als leere Fläche gezeigt', () => {
    zeige(volltisch())
    expect(region('Tischmitte')).toHaveTextContent('Nachziehstapel leer')
  })

  it('O4: der eigene Ablagestapel steht unten bei der Hand', () => {
    zeige(mittelspiel())
    const hand = region('Deine Hand')
    expect(hand).toHaveTextContent('Deine Ablage 1')
    expect(within(hand).getByRole('img', { name: 'Sonderkarte Schlangenfrass' })).toBeInTheDocument()
  })

  it('O4: ohne Schlange sagt der Tisch es in einem Satz', () => {
    zeige(neuePartie())
    expect(region('Deine Schlangen')).toHaveTextContent('Noch keine Schlange')
    expect(gegnerKasten('KI-Gegner 1')).toHaveTextContent('Noch keine Schlange')
  })

  it('O4/A4: mit Erweiterung liegen die offenen Aufgaben und deine Auslage am Tisch, ohne nicht', () => {
    zeige(volltisch())
    expect(within(region('Offene Aufgaben')).getAllByRole('button')).toHaveLength(3)
    const auslage = region('Deine Auslage')
    expect(within(auslage).getByRole('button', { name: /^Deine geheime Aufgabe/ })).toBeInTheDocument()
    expect(within(auslage).getByRole('img', { name: 'Comeback-Karte' })).toBeInTheDocument()
    expect(within(auslage).getAllByRole('img', { name: 'Risiko-Belohnungs-Karte' })).toHaveLength(2)

    const ohne = mittelspiel()
    cleanup()
    zeige(ohne)
    expect(screen.queryByRole('region', { name: 'Offene Aufgaben' })).toBeNull()
    expect(screen.queryByRole('region', { name: 'Deine Auslage' })).toBeNull()
  })

  it('O4: der Tisch führt zurück zur Lobby', () => {
    zeige(mittelspiel())
    expect(screen.getByRole('link', { name: 'Zur Lobby' })).toHaveAttribute('href', '/')
  })
})

describe('O4 K3: Volltisch, jede Karte steht am Tisch', () => {
  it('O4 K3: 4 Spieler mit je 2 Schlangen zu 11 Karten, dazu die 2 Karten unter der Fusion', () => {
    const { container } = zeige(volltisch())
    const schlangen = Array.from(container.querySelectorAll('ol.st-schlange'))
    expect(schlangen).toHaveLength(8)
    for (const schlange of schlangen) {
      expect(schlange.querySelectorAll(':scope > li'), schlange.getAttribute('aria-label') ?? '').toHaveLength(11)
    }
    const bilderInSchlangen = schlangen.flatMap((schlange) => Array.from(schlange.querySelectorAll('img')))
    expect(bilderInSchlangen).toHaveLength(90)
    expect(within(region('Gegner')).getAllByRole('article')).toHaveLength(3)
  })
})

describe('O4 K4: Farbgruppen, Fusion und Grube sind sichtbar', () => {
  it('O4 K4/A11: Karten einer Farbgruppe tragen eine Markierung, und die Schlange nennt ihre Gruppen in Worten', () => {
    const { container } = zeige(volltisch())
    const ersteSchlange = screen.getByRole('list', { name: /^Deine Schlange 1:/ })
    expect(ersteSchlange.getAttribute('aria-label')).toBe('Deine Schlange 1: 11 Karten, Farbgruppen Blau (3), Rot (4), Gelb (3)')
    const glieder = Array.from(ersteSchlange.querySelectorAll(':scope > li'))
    expect(glieder.map((glied) => glied.getAttribute('data-gruppe'))).toEqual([
      'Blau', 'Blau', 'Blau', 'Rot', 'Rot', 'Rot', 'Rot', 'Gelb', 'Gelb', 'Gelb', null,
    ])
    expect(container.querySelectorAll('li.st-gruppe-anfang').length).toBe(container.querySelectorAll('li.st-gruppe-ende').length)
  })

  it('O4 K4/A7.7: eine Farbenfusion zeigt die zwei Karten darunter', () => {
    zeige(mittelspiel())
    const schlange = screen.getByRole('list', { name: /^Deine Schlange 2:/ })
    expect(within(schlange).getByRole('img', { name: 'Sonderkarte Farbenfusion' })).toBeInTheDocument()
    const unter = within(schlange).getByRole('group', { name: 'Unter der Farbenfusion' })
    expect(within(unter).getAllByRole('img', { name: 'Farbkarte Gelb, 1 Punkt' })).toHaveLength(2)
    expect(schlange.getAttribute('aria-label')).toContain('Farbgruppen Blau (3)')
  })

  it('O4 K4/A7.6: eine ausliegende Schlangengrube ist beim getroffenen Gegner sichtbar und nennt, von wem sie ist', () => {
    zeige(mittelspiel())
    const ki2 = gegnerKasten('KI-Gegner 2')
    expect(within(ki2).getByRole('img', { name: 'Sonderkarte Schlangengrube' })).toBeInTheDocument()
    expect(ki2).toHaveTextContent('Schlangengrube von dir')
    expect(within(gegnerKasten('KI-Gegner 1')).queryByRole('img', { name: 'Sonderkarte Schlangengrube' })).toBeNull()
  })

  it('O4 K4/A7.6: liegt die Grube vor dir, steht sie in deinem Bereich', () => {
    zeige(volltisch())
    expect(gegnerKasten('KI-Gegner 3')).toHaveTextContent('Schlangengrube von KI-Gegner 1')
    const zustand = mittelspiel()
    zustand.ausliegendeGruben[0].vor = 0
    zustand.ausliegendeGruben[0].gespieltVon = 1
    cleanup()
    zeige(zustand)
    expect(region('Deine Hand')).toHaveTextContent('Schlangengrube von KI-Gegner 1')
  })
})

describe('O4: Statuszeile', () => {
  it('O4: bist du am Zug, sagt sie es und was zu tun ist', () => {
    zeige(mittelspiel())
    const status = screen.getByRole('status')
    expect(status).toHaveTextContent('Du bist dran')
    expect(status).toHaveTextContent('Spiele Karten aus deiner Hand.')
  })

  it('O4/A7.8: im zweiten Zug nach einem Verdoppler sagt sie das', () => {
    const zustand = mittelspiel()
    zustand.zug.teilzug = 2
    zeige(zustand)
    expect(screen.getByRole('status')).toHaveTextContent('Zweiter Zug nach dem Verdoppler')
  })

  it('O4/A5: im Abschnitt Abwerfen sagt sie, dass du überzählige Karten ablegst', () => {
    const zustand = mittelspiel()
    zustand.zug.abschnitt = 'Abwerfen'
    zeige(zustand)
    expect(screen.getByRole('status')).toHaveTextContent('Lege überzählige Handkarten ab.')
  })

  it('O4/A6: schwebt eine Sonderkarte über dir, sagt sie, wer sie spielt und dass du entscheidest', () => {
    zeige(angriffAufMich())
    const status = screen.getByRole('status')
    expect(status).toHaveTextContent('KI-Gegner 1 spielt Schlangengrube')
    expect(status).toHaveTextContent('Du entscheidest, ob du abwehrst.')
  })

  it('O4/A10: Schlussrunde und Spielende stehen in der Statuszeile', () => {
    zeige(volltisch())
    expect(screen.getByRole('status')).toHaveTextContent('Schlussrunde')
    const beendet = volltisch()
    beendet.partiephase = 'Beendet'
    cleanup()
    zeige(beendet)
    expect(screen.getByRole('status')).toHaveTextContent('Die Partie ist beendet')
  })
})
