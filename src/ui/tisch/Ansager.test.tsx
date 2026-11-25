import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import type { SpielAktion } from '../../engine'
import { baukasten } from '../../engine/testing/szenario'
import { erzeugeZufall } from '../../engine/testing/zufall'
import { erzeugeSzenario } from '../../entwicklung/szenarien'
import { STRATEGIEN } from '../../ki/strategien'
import type { Ki } from '../../ki/strategien/strategie'
import { warte } from '../spiel/__tests__/steuerung'
import { GEGNER_STRATEGIE, KI_PAUSE } from '../spiel/useSpiel'
import { ausfuehren, handkarte, spieleAm, tippe, tippeZiel } from './__tests__/bedienen'

/*
O11, Kriterium 2: Was am Tisch geschieht, wird vorgelesen: der Schritt eines
Gegners, ein Angriff auf dich und eine erfüllte Aufgabe. Dafür gibt es genau
eine Stelle, die vorliest (der Ansager); stünde derselbe Satz in zwei
vorlesenden Bereichen, hörte man ihn doppelt.
*/

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

function kiMit(...vorrang: ((aktion: SpielAktion) => boolean)[]): Ki {
  return {
    name: 'Test-KI',
    waehle: (_sicht, aktionen) => vorrang.map((passt) => aktionen.find(passt)).find((aktion) => aktion !== undefined) ?? aktionen[0],
  }
}

const ansager = () => screen.getByTestId('ansager')

/** Alle Bereiche, die ein Bildschirmleser bei einer Änderung von selbst vorliest. */
function vorlesendeBereiche(): Element[] {
  return Array.from(document.querySelectorAll('[aria-live], [role="status"], [role="alert"], [role="log"]')).filter((bereich) => {
    const live = bereich.getAttribute('aria-live')
    return live !== 'off' && bereich.closest('[aria-hidden="true"]') === null
  })
}

/** Wie viele vorlesende Bereiche diesen Satz enthalten. */
const vorgelesen = (satz: string) => vorlesendeBereiche().filter((bereich) => (bereich.textContent ?? '').includes(satz)).length

const anDeinEnde = (aktion: SpielAktion) => aktion.typ === 'FarbkarteLegen' && aktion.ziel.art === 'schlange' && aktion.ziel.schlangenId === 'schlange-1' && aktion.ziel.seite === 'ende'
const grubeAufDich = (aktion: SpielAktion) => aktion.typ === 'SchlangengrubeSpielen' && aktion.zielSpielerId === 'spieler-1'

describe('O11 K2: Ereignisse werden vorgelesen', () => {
  it('O11 K2: der Ansager liest vor und ist nicht vor dem Bildschirmleser versteckt', () => {
    spieleAm(erzeugeSzenario('farbkarte-beim-gegner'))
    expect(ansager()).toHaveAttribute('aria-live', 'polite')
    expect(ansager().closest('[aria-hidden="true"]')).toBeNull()
  })

  it('O11 K2: der Schritt eines Gegners wird vorgelesen, und zwar genau einmal', () => {
    vi.spyOn(STRATEGIEN, GEGNER_STRATEGIE).mockImplementation(() => kiMit(anDeinEnde))
    spieleAm(
      baukasten({ spielerzahl: 2, erweiterung: false, zufall: erzeugeZufall(81) })
        .hand(1, ['Rot', 'Blau', 'Gelb', 'Grün', 'Violett'])
        .schlange(0, ['Rot', 'Rot'])
        .haendeAuffuellen()
        .amZug(1)
        .zustand(),
    )
    warte(KI_PAUSE)
    const satz = 'KI-Gegner 1 spielt: Rot an das Ende deiner Schlange 1.'
    expect(ansager()).toHaveTextContent(satz)
    expect(vorgelesen(satz), `„${satz}“ steht in ${vorgelesen(satz)} vorlesenden Bereichen, erwartet genau einem`).toBe(1)
  })

  it('O11 K2: ein Angriff auf dich wird vorgelesen, mit der Frage, ob du abwehrst', () => {
    vi.spyOn(STRATEGIEN, GEGNER_STRATEGIE).mockImplementation(() => kiMit(grubeAufDich))
    spieleAm(
      baukasten({ spielerzahl: 2, erweiterung: false, zufall: erzeugeZufall(82) })
        .hand(0, ['Farbenschutz', 'Rot', 'Blau', 'Gelb', 'Grün'])
        .hand(1, ['Schlangengrube', 'Rot', 'Blau', 'Gelb', 'Grün'])
        .haendeAuffuellen()
        .amZug(1)
        .zustand(),
    )
    warte(KI_PAUSE)
    expect(ansager()).toHaveTextContent('KI-Gegner 1 sagt an: Schlangengrube auf dich.')
    expect(ansager()).toHaveTextContent('Abwehrfrage')
    expect(ansager()).toHaveTextContent('Mit einem Farbenschutz wehrst du sie ab.')
    expect(vorgelesen('KI-Gegner 1 sagt an: Schlangengrube auf dich.')).toBe(1)
  })

  it('O11 K2: eine erfüllte Aufgabe wird vorgelesen, ebenso die Aufgabe, die nachrückt', () => {
    spieleAm(erzeugeSzenario('aufgabe-lila-riese'))
    tippe(handkarte('Farbkarte Violett, 2 Punkte'))
    tippeZiel('Deine Schlange 1: Ende')
    ausfuehren()
    expect(ansager()).toHaveTextContent('Du erfüllst die Aufgabe Lila Riese.')
    expect(ansager()).toHaveTextContent('Neu offen liegt die Aufgabe Farbenpracht.')
  })

  it('O11 K2: was du als Nächstes tust, wird vorgelesen, sobald es sich ändert', () => {
    spieleAm(erzeugeSzenario('farbkarte-beim-gegner'))
    tippe(handkarte('Farbkarte Rot, 1 Punkt'))
    expect(ansager()).toHaveTextContent('Lege die Karte an ein Ende einer Schlange (+).')
    expect(vorgelesen('Lege die Karte an ein Ende einer Schlange (+).')).toBe(1)
  })
})
