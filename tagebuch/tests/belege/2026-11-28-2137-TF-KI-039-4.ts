// @vitest-environment node
import { writeFileSync } from 'node:fs'
import { expect, it } from 'vitest'
import { anwendeAktion, ermittleAktionen, erstellePartie, erzeugeZufall, serialisiere } from '../../engine'
import type { Spielzustand } from '../../engine'
import { kiWahl } from '../schritt'
import { entscheiderVon, sichtFuer } from '../sicht'
import { aufgabenwert, gruppenzahl, mitZweiterKarte, nachDurchlassen } from '../__tests__/stellungen'
import { STRATEGIEN } from '../strategien'
import type { Ki } from '../strategien/strategie'
import { bewerte } from '../strategien/bewertung'
import { planeZug } from '../strategien/zugsuche'
import { erstelleSuche } from '../strategien/suche'

// Prüfer K4 Iteration 3: Einzelfall zu K2.1 mit Erweiterung nachrechnen (Gruppe vollenden).
const SAAT = Number(process.env.PRUEF_SAAT ?? 6_600_018)
const SPIELER = Number(process.env.PRUEF_SPIELER ?? 2)
const ALLE = process.env.PRUEF_ALLE === '1'
const SITZ = Number(process.env.PRUEF_SITZ ?? 1)
const GEWAEHLT_TYP = process.env.PRUEF_TYP ?? 'SchlangenfrassSpielen'
const AUS = process.env.PRUEF_AUS ?? ''

function wert(start: Spielzustand, z: Spielzustand, sitz: number): number {
  return bewerte(sichtFuer(z, sitz)) + aufgabenwert(start, z, sitz)
}

it('Einzelfall Gruppe', () => {
  const kiSaat = (sitz: number) => (SAAT * 31 + sitz * 97 + 7) >>> 0
  const kis: Ki[] = Array.from({ length: SPIELER }, (_, sitz) => (ALLE || sitz === 0 ? STRATEGIEN.solideKi(erzeugeZufall(kiSaat(sitz))) : STRATEGIEN.zufallsKi(erzeugeZufall(kiSaat(sitz)))))
  let zustand = erstellePartie({ spielerzahl: SPIELER, erweiterung: true, zufall: erzeugeZufall(SAAT) })
  const kandidaten: Spielzustand[] = []
  for (let k = 0; k < 5000; k += 1) {
    const e = entscheiderVon(zustand)
    if (e === null) break
    const aktion = kiWahl(zustand, kis[e.index])!
    if (e.index === SITZ && zustand.zug.spielerIndex === SITZ && aktion.typ === GEWAEHLT_TYP && zustand.entscheidung === null && zustand.schwebend === null) {
      const vorher = gruppenzahl(zustand, SITZ)
      if (ermittleAktionen(zustand).some((a) => a.typ !== 'ZugBeenden' && a.typ !== 'RisikoKarteSpielen' && gruppenzahl(nachDurchlassen(zustand, a, SITZ), SITZ) > vorher)) kandidaten.push(zustand)
    }
    zustand = anwendeAktion(zustand, aktion).zustand
  }
  expect(kandidaten.length).toBeGreaterThan(0)
  for (const start of kandidaten) {
    if (AUS !== '') writeFileSync(AUS, serialisiere(start))
    const sicht = sichtFuer(start, SITZ)
    const aktionen = ermittleAktionen(start)
    console.log(`--- Hand: ${sicht.hand.map((k) => (k.typ === 'Farbkarte' ? `${k.farbe}${k.punkte}(${k.id})` : k.name)).join(', ')}; Aktionen ${aktionen.length}; Wert jetzt ${wert(start, start, SITZ).toFixed(2)}`)
    console.log(`Schlangen: ${sicht.spieler[SITZ].schlangen.map((s) => `${s.id}[${s.karten.map((k) => (k.typ === 'Farbkarte' ? k.farbe[0] + k.punkte : k.name)).join(' ')}]`).join(' ')}`)
    const vorher = gruppenzahl(start, SITZ)
    const vollendend = aktionen.filter((a) => a.typ !== 'ZugBeenden' && a.typ !== 'RisikoKarteSpielen' && gruppenzahl(nachDurchlassen(start, a, SITZ), SITZ) > vorher)
    for (const a of vollendend.slice(0, 6)) {
      const d = nachDurchlassen(start, a, SITZ)
      const beste = Math.max(...mitZweiterKarte(d, SITZ).map((x) => wert(start, x, SITZ)))
      const zweite = ermittleAktionen(d).filter((x) => x.typ !== 'ZugBeenden' && x.typ !== 'UeberhandAbwerfen' && x.typ !== 'RisikoKarteSpielen')
      const arg = zweite.find((x) => Math.abs(wert(start, nachDurchlassen(d, x, SITZ), SITZ) - beste) < 1e-9)
      if (arg !== undefined) {
        const e = nachDurchlassen(d, arg, SITZ)
        console.log(`  danach: bewerte ${bewerte(sichtFuer(e, SITZ)).toFixed(2)}, aufgabenwert ${aufgabenwert(start, e, SITZ)}, Gruppen ${gruppenzahl(e, SITZ)}, Schlangen ${e.spieler[SITZ].schlangen.map((s) => s.karten.map((k) => (k.typ === 'Farbkarte' ? k.farbe[0] + k.punkte : k.name.slice(0, 6))).join(' ')).join(' | ')}`)
      }
      console.log(`vollendet: ${JSON.stringify(a).slice(0, 170)} -> ${wert(start, d, SITZ).toFixed(2)}, mit zweiter ${beste.toFixed(2)} über ${JSON.stringify(arg).slice(0, 200)}; Zug danach ${d.zug.spielerIndex} Teilzug ${d.zug.teilzug} ${d.zug.abschnitt}`)
    }
    const gew = planeZug(sicht, aktionen, erzeugeZufall(5))
    const d = nachDurchlassen(start, gew.aktion, SITZ)
    console.log(`planeZug: ${JSON.stringify(gew.aktion).slice(0, 220)} -> ${wert(start, d, SITZ).toFixed(2)}, mit zweiter ${Math.max(...mitZweiterKarte(d, SITZ).map((x) => wert(start, x, SITZ))).toFixed(2)}`)
    const suche = erstelleSuche(sicht, erzeugeZufall(5))
    for (const a of [gew.aktion, ...vollendend.slice(0, 3)]) {
      const f = suche.folge(suche.wurzel, sicht, a)
      const zweite = f.stellung.aktionen().filter((x) => x.typ !== 'ZugBeenden' && x.typ !== 'RisikoKarteSpielen').map((x) => suche.folge(f.stellung, f.stellung.sicht, x))
      const b = zweite.reduce((m, x) => (m === undefined || x.wert > m.wert ? x : m), undefined as (typeof zweite)[number] | undefined)
      console.log(`intern ${a.typ}: ${f.wert.toFixed(2)} verworfen=${f.verworfen}, beste zweite ${b?.wert.toFixed(2)} ${JSON.stringify(b?.aktion).slice(0, 140)}`)
    }
  }
}, 600_000)
