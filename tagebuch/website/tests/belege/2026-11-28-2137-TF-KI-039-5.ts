// @vitest-environment node
import { writeFileSync } from 'node:fs'
import { expect, it } from 'vitest'
import { anwendeAktion, ermittleAktionen, erstellePartie, erzeugeZufall } from '../../engine'
import type { Spielzustand } from '../../engine'
import { kiWahl } from '../schritt'
import { entscheiderVon, sichtFuer } from '../sicht'
import { aufgabenwert, gruppenzahl, nachDurchlassen } from '../__tests__/stellungen'
import { STRATEGIEN } from '../strategien'
import { bewerte } from '../strategien/bewertung'

// Prüfer K4 Iteration 3, Kriterium 3: Schlangenhäutungen in Partien mit Erweiterung, eigene Saaten.
const BASIS = Number(process.env.PRUEF_BASIS ?? 6_400_000)
const ANZAHL = Number(process.env.PRUEF_ANZAHL ?? 30)
const AUS = process.env.PRUEF_AUS ?? 'haeutung.json'

function wert(start: Spielzustand, zustand: Spielzustand, sitz: number): number {
  return bewerte(sichtFuer(zustand, sitz)) + aufgabenwert(start, zustand, sitz)
}

it('Prüfer K4.3', () => {
  let angebotenMitGruppe = 0
  let gespieltMitGruppe = 0
  let gespieltAndere = 0
  let eigeneHaeutungen = 0
  let eigeneMitNeuerGruppe = 0
  let senktBewertung = 0
  const andere: string[] = []
  for (let n = 0; n < ANZAHL; n += 1) {
    const saat = BASIS + n
    const spielerzahl = 2 + (n % 3)
    const kis = Array.from({ length: spielerzahl }, (_, sitz) => STRATEGIEN.solideKi(erzeugeZufall(saat * 5 + sitz)))
    let zustand = erstellePartie({ spielerzahl, erweiterung: true, zufall: erzeugeZufall(saat) })
    for (let k = 0; k < 5000; k += 1) {
      const e = entscheiderVon(zustand)
      if (e === null) break
      const sitz = e.index
      const aktion = kiWahl(zustand, kis[sitz])!
      if (sitz === zustand.zug.spielerIndex && zustand.entscheidung === null && zustand.schwebend === null) {
        const eigene = new Set(zustand.spieler[sitz].schlangen.map((s) => s.id))
        const haeutungen = ermittleAktionen(zustand).filter((a) => a.typ === 'SchlangenhaeutungSpielen' && eigene.has(a.schlangenId))
        const vorher = gruppenzahl(zustand, sitz)
        const mitGruppe = haeutungen.filter((a) => gruppenzahl(nachDurchlassen(zustand, a, sitz), sitz) > vorher)
        if (mitGruppe.length > 0) {
          angebotenMitGruppe += 1
          if (aktion.typ === 'SchlangenhaeutungSpielen') gespieltMitGruppe += 1
          else {
            gespieltAndere += 1
            if (andere.length < 15) andere.push(`Saat ${saat} Schritt ${k}: ${aktion.typ}`)
          }
        }
        if (aktion.typ === 'SchlangenhaeutungSpielen' && eigene.has(aktion.schlangenId)) {
          eigeneHaeutungen += 1
          const danach = nachDurchlassen(zustand, aktion, sitz)
          if (gruppenzahl(danach, sitz) > vorher) eigeneMitNeuerGruppe += 1
          if (wert(zustand, danach, sitz) < wert(zustand, zustand, sitz) - 1e-9) senktBewertung += 1
        }
      }
      zustand = anwendeAktion(zustand, aktion).zustand
    }
  }
  const ergebnis = { angebotenMitGruppe, gespieltMitGruppe, gespieltAndere, eigeneHaeutungen, eigeneMitNeuerGruppe, senktBewertung, andere }
  writeFileSync(AUS, JSON.stringify(ergebnis, null, 1))
  console.log(`K4.3: ${JSON.stringify({ ...ergebnis, andere: undefined })}`)
  expect(eigeneHaeutungen).toBeGreaterThanOrEqual(0)
}, 3_600_000)
