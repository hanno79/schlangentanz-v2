import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import type { KartenAktion, Spielzustand } from '../../engine'
import { baukasten } from '../../engine/testing/szenario'
import type { Kartenwahl } from '../../engine/testing/szenario'
import { erzeugeZufall } from '../../engine/testing/zufall'
import { gespeichert } from '../spiel/__tests__/steuerung'
import { aktionMit, gespieltWurde, handRegion, spieleAm, tippe, zugleiste } from './__tests__/bedienen'

/*
O6, Kriterien 2 und 3: Greift dich ein Gegner mit einer Sonderkarte an, fragt
dich der Tisch, ob du abwehrst. Die Frage nennt Angreifer, Karte und Ziel, deine
Hand bleibt dabei zu sehen. „Abwehren“ gibt es nur, wenn ein Farbenschutz auf
deiner Hand liegt (A6, A7.2, D33). Nach der Abwehr hast du eine Karte weniger
und füllst erst zu Beginn deines nächsten Zuges auf (A6).
*/

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

/** KI-Gegner 1 hat eine Karte gegen dich angesagt; du entscheidest. */
function angriff(hand: Kartenwahl[], karte: Kartenwahl, ansage: (karteId: string, spielerId: string) => KartenAktion, schlangen: Kartenwahl[][] = []): Spielzustand {
  let bau = baukasten({ spielerzahl: 2, erweiterung: false, zufall: erzeugeZufall(41) }).hand(0, hand).hand(1, ['Blau', 'Rot', 'Gelb', 'Grün'])
  for (const schlange of schlangen) bau = bau.schlange(0, schlange)
  return bau.schwebend(1, karte, ansage, [0]).amZug(1).zustand()
}

const grubeAufDich = (hand: Kartenwahl[]) =>
  angriff(hand, 'Schlangengrube', (karteId, spielerId) => ({ typ: 'SchlangengrubeSpielen', spielerId, karteId, zielSpielerId: 'spieler-1' }))

const frage = () => within(zugleiste().getByRole('group', { name: 'Abwehrfrage' }))

describe('O6 K2: Die Abwehrfrage nennt Angreifer, Karte und Ziel; deine Hand bleibt sichtbar', () => {
  it('O6 K2/A7.6: Schlangengrube auf dich, du hältst einen Farbenschutz', () => {
    const start = grubeAufDich(['Farbenschutz', 'Rot', 'Blau', 'Gelb', 'Grün'])
    spieleAm(start)
    expect(frage().getByText('KI-Gegner 1 sagt an: Schlangengrube auf dich.')).toBeInTheDocument()
    expect(frage().getByRole('button', { name: 'Abwehren' })).toBeEnabled()
    expect(frage().getByRole('button', { name: 'Durchlassen' })).toBeEnabled()
    expect(zugleiste().queryByRole('button', { name: 'Zug beenden' }), 'während der Frage gibt es kein „Zug beenden“').toBeNull()
    expect(handRegion().getByRole('heading', { name: 'Deine Hand · 5 Karten' })).toBeInTheDocument()
    expect(within(handRegion().getByRole('list', { name: 'Handkarten' })).getAllByRole('img')).toHaveLength(5)
  })

  it('O6 K2/A7.4: Schlangenfrass auf eine Karte deiner Schlange: das Ziel steht in der Frage', () => {
    const start = angriff(
      ['Farbenschutz', 'Rot', 'Blau', 'Gelb', 'Grün'],
      'Schlangenfrass',
      (karteId, spielerId) => ({ typ: 'SchlangenfrassSpielen', spielerId, karteId, option: 'gegnerischeKarten', ziele: [{ schlangenId: 'schlange-1', karteId: 'violett-01' }] }),
      [[{ id: 'violett-01' }, 'Braun']],
    )
    expect(start.spieler[0].schlangen[0].karten[0].id, 'Testaufbau: Violett liegt vorn in deiner Schlange').toBe('violett-01')
    spieleAm(start)
    expect(frage().getByText('KI-Gegner 1 sagt an: Schlangenfrass frisst Violett aus deiner Schlange 1.')).toBeInTheDocument()
  })

  it('O6 K2/D33: ohne Farbenschutz auf der Hand gibt es nur „Durchlassen“', () => {
    const start = grubeAufDich(['Rot', 'Blau', 'Gelb', 'Grün', 'Violett'])
    spieleAm(start)
    expect(frage().queryByRole('button', { name: 'Abwehren' })).toBeNull()
    expect(frage().getByText('Du hast keinen Farbenschutz auf der Hand und kannst nur durchlassen.')).toBeInTheDocument()
    tippe(frage().getByRole('button', { name: 'Durchlassen' }))
    expect(gespieltWurde(start, aktionMit(start, (aktion) => aktion.typ === 'Reagieren'))).toBe(true)
    expect(gespeichert()!.ausliegendeGruben.map((grube) => grube.vor)).toEqual([0])
  })
})

describe('O6 K3: Nach der Abwehr eine Karte weniger, nicht sofort aufgefüllt', () => {
  it('O6 K3/A6/A7.2: „Abwehren“ spielt den Farbenschutz; die Hand hat 4 Karten, die Grube liegt beim Angreifer', () => {
    const start = grubeAufDich(['Farbenschutz', 'Rot', 'Blau', 'Gelb', 'Grün'])
    spieleAm(start)
    tippe(frage().getByRole('button', { name: 'Abwehren' }))
    const abwehr = aktionMit(start, (aktion) => aktion.typ === 'Reagieren' && aktion.farbenschutzId !== null)
    expect(gespieltWurde(start, abwehr), 'gespielt ist die Abwehr der Engine').toBe(true)
    expect(handRegion().getByRole('heading', { name: 'Deine Hand · 4 Karten' })).toBeInTheDocument()
    expect(within(handRegion().getByRole('list', { name: 'Handkarten' })).getAllByRole('img')).toHaveLength(4)
    expect(screen.queryByRole('group', { name: 'Abwehrfrage' }), 'die Frage ist beantwortet').toBeNull()
    const nachher = gespeichert()!
    expect(nachher.spieler[0].hand, 'A6: wer abwehrt, zieht nicht gleich nach').toHaveLength(4)
    expect(nachher.spieler[1].ablagestapel.map((karte) => (karte.typ === 'Sonderkarte' ? karte.name : karte.farbe))).toContain('Schlangengrube')
    expect(handRegion().getByText('Deine Ablage 1')).toBeInTheDocument()
  })
})
