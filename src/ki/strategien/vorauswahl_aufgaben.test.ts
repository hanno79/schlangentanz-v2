// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { ermittleAktionen } from '../../engine'
import { erzeugeSzenario } from '../../entwicklung/szenarien'
import { sichtFuer } from '../sicht'
import type { SpielerSicht } from '../sicht'
import { ladeStellung } from '../__tests__/stellungen'
import { neuerMerker } from './bewertung'
import { folgeSicht, vorauswahl } from './vorauswahl'

/*
K4, Kriterium 1 in der Vorauswahl: Was eine Aktion für die Aufgaben bringt, sieht die
Vorauswahl in ihrer geschätzten Sicht, und die beste Aktion, die eine Aufgabe erfüllt, steht
vorn, auch wenn ihr Vorwert sonst niedrig ist.
*/

const KI = 1

describe('K4 Kriterium 1: die Vorauswahl und die Aufgaben', () => {
  it('A9 Schlangentanz, D37: ki-haeutung-tanz: nach der besten Häutung zählt die geschätzte Sicht zwei neue Dreiergruppen durch Häutung', () => {
    const start = erzeugeSzenario('ki-haeutung-tanz')
    const sicht = sichtFuer(start, KI)
    expect(sicht.spieler[KI].schlangenhaeutungDreiergruppen, 'Testaufbau: noch keine Dreiergruppe durch Häutung').toBe(0)
    const haeutungen = ermittleAktionen(start).filter((aktion) => aktion.typ === 'SchlangenhaeutungSpielen')
    const zaehler = haeutungen.map((aktion) => folgeSicht(sicht, aktion).spieler[KI].schlangenhaeutungDreiergruppen)
    expect(Math.max(...zaehler), `D37: Zähler nach ${haeutungen.length} Häutungen`).toBe(2)
  })

  it('K4.1: die beste Aktion, die eine Aufgabe erfüllt, steht vorn, auch mit dem niedrigsten Vorwert', () => {
    const start = ladeStellung('saat-810100-erster-zug-korb.json')
    const sicht = sichtFuer(start, start.zug.spielerIndex)
    const ich = sicht.ich
    const aktionen = ermittleAktionen(start).filter((aktion) => aktion.typ !== 'ZugBeenden')
    const anzahl = 2
    const ohneAufgaben = vorauswahl(sicht, aktionen, anzahl, neuerMerker(), () => 0).geordnet
    expect(ohneAufgaben.length, 'Testaufbau: mehr Aktionen als Plätze').toBeGreaterThan(anzahl + 2)
    // Eine erfundene Aufgabe, die nur die Aktion mit dem niedrigsten Vorwert erfüllt, und das knapp.
    const ziel = ohneAufgaben[ohneAufgaben.length - 1]
    const schluessel = (eigen: SpielerSicht) => JSON.stringify([eigen.schlangen, eigen.ausgespielteSonderkarten])
    const zielSchlangen = schluessel(folgeSicht(sicht, ziel).spieler[ich])
    const aufgaben = (eigen: SpielerSicht) => (schluessel(eigen) === zielSchlangen ? 0.001 : 0)
    const vorn = vorauswahl(sicht, aktionen, anzahl, neuerMerker(), aufgaben).geordnet.slice(0, anzahl)
    expect(
      vorn.map((aktion) => schluessel(folgeSicht(sicht, aktion).spieler[ich])),
      `K4.1: vorn ${JSON.stringify(vorn)}, erfüllt würde mit ${JSON.stringify(ziel)}`,
    ).toContain(zielSchlangen)
  })
})
