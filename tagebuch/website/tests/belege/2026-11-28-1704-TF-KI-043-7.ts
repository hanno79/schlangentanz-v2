// @vitest-environment node
import { appendFileSync } from 'node:fs'
import { describe, it } from 'vitest'
import { anwendeAktion, ermittleAktionen, erstellePartie, erzeugeZufall } from '../../engine'
import type { SpielAktion } from '../../engine'
import { kiWahl } from '../schritt'
import { entscheiderVon, sichtFuer } from '../sicht'
import { setztAuslageEin } from './eroeffnung'
import { STRATEGIEN } from './index'
import { besser, beste, erstelleSuche } from './suche'
import { schaetzeZiehen } from './ziehen'

/* Prüfer K4, Iteration 2: Nachrechnung des Plans beim Korb „aktionen“ im ersten Zug. Temporär. */

const SAATEN = (process.env.P2_SAATEN ?? '').split(',').filter(Boolean).map(Number)
const AUSGABE = process.env.P2_AUSGABE ?? 'x.txt'
const kurz = (a: SpielAktion) => JSON.stringify(a).slice(0, 160)

describe('Diagnose 3', () => {
  it('Plan beim Einsatz', () => {
    for (const saat of SAATEN) {
      const spielerzahl = 2 + (saat % 3)
      let zustand = erstellePartie({ spielerzahl, erweiterung: true, zufall: erzeugeZufall(saat) })
      const kis = Array.from({ length: spielerzahl }, (_, sitz) => STRATEGIEN.solideKi(erzeugeZufall((saat * 13 + sitz * 101 + 5) >>> 0)))
      for (let n = 0; n < 60; n += 1) {
        const entscheider = entscheiderVon(zustand)!
        const aktion = kiWahl(zustand, kis[entscheider.index])!
        if (setztAuslageEin(aktion) && aktion.typ !== 'RisikoKarteSpielen') {
          const sicht = sichtFuer(zustand, entscheider.index)
          const aktionen = ermittleAktionen(zustand)
          for (const s of [1, 2, 3]) {
            const suche = erstelleSuche(sicht, erzeugeZufall(s))
            const halten = suche.ergebnis(suche.wurzel)
            const folge = suche.folge(suche.wurzel, sicht, aktion)
            const zweite = beste(suche.kandidaten(folge.stellung, folge.stellung.sicht, folge.stellung.aktionen(), 8))
            const dritte = zweite === undefined ? undefined : beste(suche.kandidaten(zweite.stellung, zweite.stellung.sicht, zweite.stellung.aktionen(), 4))
            const gezogen = schaetzeZiehen(folge.stellung.sicht, folge.stellung.aktionen(), suche.schaetzrechnungAb(folge.stellung))
            appendFileSync(
              AUSGABE,
              `Saat ${saat} Sitz ${entscheider.index} KI-Saat ${s}: halten ${halten.wert.toFixed(2)} (Gruppen ${halten.gruppen}); nach ${aktion.typ} ${folge.wert.toFixed(2)}; zweite ${zweite ? kurz(zweite.aktion) : '-'} ${zweite?.wert.toFixed(2)} (Gruppen ${zweite?.gruppen}); dritte ${dritte ? kurz(dritte.aktion) : '-'} ${dritte?.wert.toFixed(2)} (besser ${dritte && zweite ? besser(dritte, zweite) : '-'}); ziehen ${gezogen ? kurz(gezogen.aktion) + ' ' + gezogen.wert.toFixed(2) : '-'}\n`,
            )
          }
          break
        }
        zustand = anwendeAktion(zustand, aktion).zustand
      }
    }
  }, 600_000)
})
