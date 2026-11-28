// @vitest-environment node
import { expect, it } from 'vitest'
import { anwendeAktion, ermittleAktionen, ermittleEntscheider, erstellePartie, erzeugeZufall, serialisiere } from '../../engine'
import type { SpielAktion, Spielzustand } from '../../engine'
import { writeFileSync } from 'node:fs'
import { kiWahl } from '../schritt'
import { entscheiderVon, sichtFuer } from '../sicht'
import { aufgabenwert, nachDurchlassen } from '../__tests__/stellungen'
import { STRATEGIEN } from '../strategien'
import type { Ki } from '../strategien/strategie'
import { bewerte } from '../strategien/bewertung'
import { planeZug } from '../strategien/zugsuche'
import { erstelleSuche } from '../strategien/suche'
import { schaetzeRisiko } from '../strategien/risiko'

// Prüfer K4 Iteration 3: Einzelfälle zu K4.1 aus den eigenen Partien nachrechnen.
const SAAT = Number(process.env.PRUEF_SAAT ?? 6_200_031)
const SPIELER = Number(process.env.PRUEF_SPIELER ?? 3)
const ALLE = process.env.PRUEF_ALLE === '1'
const GEWAEHLT = process.env.PRUEF_GEWAEHLT ?? ''
const ERFUELLEND = process.env.PRUEF_ERFUELLEND ?? ''
const AUS = process.env.PRUEF_AUS ?? ''
const SITZ = Number(process.env.PRUEF_SITZ ?? 0)

function wert(start: Spielzustand, zustand: Spielzustand, sitz: number): number {
  return bewerte(sichtFuer(zustand, sitz)) + aufgabenwert(start, zustand, sitz)
}

/** Spielt den Rest des eigenen Zuges mit der soliden KI; Gegner, die gefragt werden, wählen mit `gegner`. */
function zugende(zustand: Spielzustand, sitz: number, ki: Ki, gegner: (z: Spielzustand, a: SpielAktion[]) => SpielAktion): Spielzustand {
  let jetzt = zustand
  for (let i = 0; i < 20; i += 1) {
    if (jetzt.partiephase !== 'Laufend' || jetzt.zug.spielerIndex !== sitz) return jetzt
    const e = ermittleEntscheider(jetzt)
    if (e === null) return jetzt
    let a: SpielAktion
    if (e !== sitz) {
      const ak = ermittleAktionen(jetzt)
      a = ak.every((x) => x.typ === 'Reagieren') ? ak.find((x) => x.typ === 'Reagieren' && x.farbenschutzId === null)! : gegner(jetzt, ak)
    } else {
      a = kiWahl(jetzt, ki)!
      if (a.typ === 'ZugBeenden') return jetzt
    }
    jetzt = anwendeAktion(jetzt, a).zustand
  }
  return jetzt
}

it('Einzelfall', () => {
  const kiSaat = (sitz: number) => (SAAT * 31 + sitz * 97 + 7) >>> 0
  const kis: Ki[] = Array.from({ length: SPIELER }, (_, sitz) => (ALLE || sitz === 0 ? STRATEGIEN.solideKi(erzeugeZufall(kiSaat(sitz))) : STRATEGIEN.zufallsKi(erzeugeZufall(kiSaat(sitz)))))
  let zustand = erstellePartie({ spielerzahl: SPIELER, erweiterung: true, zufall: erzeugeZufall(SAAT) })
  let gefunden: Spielzustand | null = null
  for (let k = 0; k < 5000 && gefunden === null; k += 1) {
    const e = entscheiderVon(zustand)
    if (e === null) break
    const aktion = kiWahl(zustand, kis[e.index])!
    if (e.index === SITZ && JSON.stringify(aktion) === GEWAEHLT) gefunden = zustand
    else zustand = anwendeAktion(zustand, aktion).zustand
  }
  expect(gefunden, 'Stellung gefunden').not.toBeNull()
  const start = gefunden!
  if (AUS !== '') writeFileSync(AUS, serialisiere(start))
  const sitz = SITZ
  const sicht = sichtFuer(start, sitz)
  const aktionen = ermittleAktionen(start)
  const gewaehlt = aktionen.find((a) => JSON.stringify(a) === GEWAEHLT)!
  const erfuellend = aktionen.find((a) => JSON.stringify(a) === ERFUELLEND)!
  console.log(`Hand: ${sicht.hand.map((k) => (k.typ === 'Farbkarte' ? `${k.farbe}${k.punkte}(${k.id})` : k.name)).join(', ')}`)
  console.log(`Offene Aufgaben: ${sicht.offeneAufgaben.map((a) => a.name).join(', ')}; geheim ${sicht.geheimeAufgabe?.name} erfüllt=${sicht.geheimeAufgabeErfuellt}`)
  console.log(`Schlangen: ${sicht.spieler[0].schlangen.map((s) => `${s.id}[${s.karten.map((k) => (k.typ === 'Farbkarte' ? k.farbe[0] + k.punkte : k.name)).join(' ')}]`).join(' ')}`)
  console.log(`Wert jetzt ${wert(start, start, sitz).toFixed(2)}`)
  for (const s of [1, 2, 3, 4, 5]) console.log(`planeZug Saat ${s}: ${JSON.stringify(planeZug(sicht, aktionen, erzeugeZufall(s)).aktion)}`)
  const suche = erstelleSuche(sicht, erzeugeZufall(1))
  const risiko = schaetzeRisiko(sicht, aktionen, suche.schaetzrechnung)
  console.log(`schaetzeRisiko: ${JSON.stringify(risiko?.aktion)} wert ${risiko?.wert.toFixed(2)} jetzt ${risiko?.jetzt.toFixed(2)}`)
  // Interne Bewertung der Erfüllung samt bester zweiter Karte, durchgerechnet über alle zweiten Aktionen.
  for (const [name, aktion] of [['erfüllend', erfuellend], ['gewählt', gewaehlt]] as const) {
    if (aktion === undefined || aktion.typ === 'RisikoKarteSpielen') continue
    const f = suche.folge(suche.wurzel, sicht, aktion)
    const zweite = f.stellung.aktionen().filter((a) => a.typ !== 'ZugBeenden' && a.typ !== 'RisikoKarteSpielen').map((a) => suche.folge(f.stellung, f.stellung.sicht, a))
    const beste = zweite.reduce((b, x) => (b === undefined || x.wert > b.wert ? x : b), undefined as (typeof zweite)[number] | undefined)
    console.log(`${name}: intern ${f.wert.toFixed(2)}, beste zweite ${beste?.wert.toFixed(2)} mit ${JSON.stringify(beste?.aktion)}; echt ${wert(start, nachDurchlassen(start, aktion, sitz), sitz).toFixed(2)}`)
  }
  // Risiko-Karte: Erwartungswert des ganzen Zuges über jede ungesehene Karte als oberste Stapelkarte, Rest des Zuges durch die solide KI.
  if (gewaehlt.typ === 'RisikoKarteSpielen') {
    const fremd = start.spieler.flatMap((sp, i) => (i === sitz ? [] : sp.hand.map((k, j) => ({ i, j, k }))))
    const ungesehen = [...fremd.map((x) => x.k), ...start.nachziehstapel]
    for (const wahl of ['benannt', 'stapel'] as const) {
      let summe = 0
      let erfolge = 0
      let aufgabe = 0
      for (const karte of ungesehen) {
        const z = structuredClone(start)
        // Die Karte nach oben: Tausch mit der obersten Stapelkarte, wo immer sie verdeckt liegt.
        const oben = z.nachziehstapel[0]
        const imStapel = z.nachziehstapel.findIndex((k) => k.id === karte.id)
        if (imStapel >= 0) [z.nachziehstapel[0], z.nachziehstapel[imStapel]] = [z.nachziehstapel[imStapel], z.nachziehstapel[0]]
        else {
          const x = fremd.find((f) => f.k.id === karte.id)!
          z.spieler[x.i].hand[x.j] = oben
          z.nachziehstapel[0] = structuredClone(karte)
        }
        if (karte.typ === 'Farbkarte') erfolge += 1
        const nach = anwendeAktion(z, gewaehlt).zustand
        const gegner = (_: Spielzustand, a: SpielAktion[]) => {
          const ent = a.filter((x) => x.typ === 'Entscheiden')
          const t = JSON.stringify(ent)
          return (wahl === 'benannt' ? ent.find((x) => JSON.stringify(x).includes('benannt')) : ent.find((x) => JSON.stringify(x).includes('stapel'))) ?? (t.length > 0 ? ent[0] : a[0])
        }
        const ende = zugende(nach, sitz, STRATEGIEN.solideKi(erzeugeZufall(99)), gegner)
        summe += wert(start, ende, sitz)
        if (ende.spieler[sitz].erfuellteAufgaben.length > start.spieler[sitz].erfuellteAufgaben.length || aufgabenwert(start, ende, sitz) > 0) aufgabe += 1
      }
      console.log(`Risiko ganzer Zug, Gegner wählt ${wahl}: Erwartung ${(summe / ungesehen.length).toFixed(2)} über ${ungesehen.length} Karten, Farbkarten ${erfolge}, Aufgabe erfüllt in ${aufgabe}`)
    }
  }
}, 600_000)
