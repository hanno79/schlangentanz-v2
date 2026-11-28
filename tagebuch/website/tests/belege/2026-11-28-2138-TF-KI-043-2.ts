// @vitest-environment node
import { writeFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { ermittleAktionen, erzeugeZufall } from '../../engine'
import type { SpielAktion, Spielzustand } from '../../engine'
import { sichtFuer } from '../sicht'
import { aufgabenwert, ersteZuege, gruppenzahl } from '../__tests__/stellungen'
import type { Zugschritt } from '../__tests__/stellungen'
import { bewerte } from '../strategien/bewertung'
import { ERSTZUG_HALTEN, setztAuslageEin } from '../strategien/eroeffnung'
import { schaetzeRisiko } from '../strategien/risiko'
import { erstelleSuche } from '../strategien/suche'
import { schaetzeZiehen, ziehtVerdeckt } from '../strategien/ziehen'

// Prüfer K4 Iteration 3, Kriterium 2 an Zufallsstarthänden, eigene Saaten.
const BASIS = Number(process.env.PRUEF_BASIS ?? 4_300_000)
const ANZAHL = Number(process.env.PRUEF_ANZAHL ?? 300)
const AUS = process.env.PRUEF_AUS ?? 'erstzug.json'

function wert(start: Spielzustand, zustand: Spielzustand): number {
  const sitz = start.zug.spielerIndex
  return bewerte(sichtFuer(zustand, sitz)) + aufgabenwert(start, zustand, sitz)
}
function aufgabenErfuellt(vorher: Spielzustand, nachher: Spielzustand, sitz: number): boolean {
  const a = vorher.spieler[sitz]
  const b = nachher.spieler[sitz]
  return b.erfuellteAufgaben.length > a.erfuellteAufgaben.length || (b.geheimeAufgabeErfuellt && !a.geheimeAufgabeErfuellt)
}
function erwartet(vorher: Spielzustand, aktion: SpielAktion, halteStand: Spielzustand): number {
  const sitz = halteStand.zug.spielerIndex
  const sicht = sichtFuer(vorher, sitz)
  const aktionen = ermittleAktionen(vorher)
  const suche = erstelleSuche(sicht, erzeugeZufall(1))
  const halten = erstelleSuche(sichtFuer(halteStand, sitz), erzeugeZufall(1))
  const basis = halten.ergebnis(halten.wurzel).wert
  if (aktion.typ === 'RisikoKarteSpielen') {
    const r = schaetzeRisiko(sicht, aktionen, suche.schaetzrechnung)!
    return r.wert - basis
  }
  return schaetzeZiehen(sicht, aktionen, suche.schaetzrechnung)!.wert - basis
}

interface Befund {
  saat: number
  sitz: number
  stelle: number
  aktion: string
  ablauf: string[]
  gruppeAbKarte: boolean
  aufgabeAbKarte: boolean
  anstiegAbKarte: number | null
  erwarteterAnstieg: number | null
  gruppeImZug: boolean
  aufgabeImZug: boolean
  urteil: string
}

describe('Prüfer K4.2', () => {
  it('erste Züge an Zufallsstarthänden', () => {
    const befunde: Befund[] = []
    let zuege = 0
    let mitKarte = 0
    let angeboten = 0
    for (let n = 0; n < ANZAHL; n += 1) {
      const saat = BASIS + n
      const spielerzahl = 2 + (n % 3)
      for (const zug of ersteZuege(saat, spielerzahl, (sitz) => (saat * 17 + sitz * 29 + 11) >>> 0)) {
        zuege += 1
        if (zug.some(({ vorher }) => ermittleAktionen(vorher).some(setztAuslageEin))) angeboten += 1
        if (zug.some(({ aktion }) => setztAuslageEin(aktion))) mitKarte += 1
        zug.forEach(({ aktion, vorher }, stelle) => {
          if (!setztAuslageEin(aktion)) return
          befunde.push(pruefe(saat, zug, stelle, vorher))
        })
      }
    }
    const ohne = befunde.filter((b) => b.urteil === 'OHNE GRUND')
    writeFileSync(AUS, JSON.stringify({ basis: BASIS, anzahl: ANZAHL, zuege, angeboten, mitKarte, einsaetze: befunde.length, ohneGrund: ohne.length, befunde }, null, 1))
    console.log(`Saaten ${BASIS}..${BASIS + ANZAHL - 1}: ${zuege} erste Züge, Karte angeboten in ${angeboten}, eingesetzt in ${mitKarte}, Einsätze ${befunde.length}, ohne Grund ${ohne.length}`)
    expect(zuege).toBeGreaterThan(0)
  }, 3_600_000)
})

function pruefe(saat: number, zug: readonly Zugschritt[], stelle: number, vorher: Spielzustand): Befund {
  const sitz = vorher.zug.spielerIndex
  const aktion = zug[stelle].aktion
  const rest = zug.slice(stelle)
  const zugende = zug[zug.length - 1].nachher
  const gruppeImZug = gruppenzahl(zugende, sitz) > gruppenzahl(zug[0].vorher, sitz)
  const aufgabeImZug = aufgabenErfuellt(zug[0].vorher, zugende, sitz)
  const gruppeAbKarte = gruppenzahl(zugende, sitz) > gruppenzahl(vorher, sitz)
  const aufgabeAbKarte = aufgabenErfuellt(vorher, zugende, sitz)
  let erwarteterAnstieg: number | null = null
  let anstiegAbKarte: number | null = null
  if (aktion.typ === 'RisikoKarteSpielen' || ziehtVerdeckt(aktion)) {
    erwarteterAnstieg = erwartet(vorher, aktion, vorher)
  } else {
    const spaeter = rest.findIndex(({ aktion: a }, i) => i > 0 && (a.typ === 'RisikoKarteSpielen' || ziehtVerdeckt(a)))
    if (spaeter >= 0) erwarteterAnstieg = erwartet(rest[spaeter].vorher, rest[spaeter].aktion, vorher)
    const ende = spaeter >= 0 ? rest[spaeter].vorher : (rest.find(({ aktion: a }, i) => i > 0 && a.typ === 'ZugBeenden')?.vorher ?? rest[rest.length - 1].nachher)
    anstiegAbKarte = wert(vorher, ende) - wert(vorher, vorher)
  }
  const grund =
    gruppeAbKarte ? 'Gruppe' : aufgabeAbKarte ? 'Aufgabe' : anstiegAbKarte !== null && anstiegAbKarte > ERSTZUG_HALTEN ? 'Anstieg' : erwarteterAnstieg !== null && erwarteterAnstieg > ERSTZUG_HALTEN ? 'erwarteter Anstieg' : 'OHNE GRUND'
  return {
    saat,
    sitz,
    stelle,
    aktion: JSON.stringify(aktion),
    ablauf: zug.map(({ aktion: a }) => a.typ),
    gruppeAbKarte,
    aufgabeAbKarte,
    anstiegAbKarte,
    erwarteterAnstieg,
    gruppeImZug,
    aufgabeImZug,
    urteil: grund,
  }
}
