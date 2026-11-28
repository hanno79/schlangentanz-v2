// @vitest-environment node
import { writeFileSync } from 'node:fs'
import { expect, it } from 'vitest'
import { anwendeAktion, ermittleAktionen, ermittleEntscheider, erstellePartie, erzeugeZufall } from '../../engine'
import type { SpielAktion, Spielzustand } from '../../engine'
import { kiWahl } from '../schritt'
import { entscheiderVon, sichtFuer } from '../sicht'
import { aufgabenwert, gruppenzahl, mitZweiterKarte, nachDurchlassen } from '../__tests__/stellungen'
import { STRATEGIEN } from '../strategien'
import type { Ki } from '../strategien/strategie'
import { bewerte, sichtbarePunkte } from '../strategien/bewertung'
import { ziehtVerdeckt } from '../strategien/ziehen'

/*
Prüfer K4 Iteration 3, Kriterium 1 (und mit PRUEF_ZIEL=gruppe K2.1 in Partien mit Erweiterung).
Symmetrisch: Der gewählte erste Schritt und jede Erfüllung werden gleich bewertet, je mit der
besten zweiten Karte und mit der Fortsetzung durch die solide KI; Gegner lassen durch, wie in der
Zugsuche. Erfüllt oder versucht zählt über den ganzen Zug, auch nach einer Risiko-Karte. Beginnt
der Zug mit einer verdeckten Aktion, rechnet die Prüfung den ganzen Zug über jede ungesehene
Karte als oberste Stapelkarte durch (Gegner wählt bei Risiko-Aktion 2 die benannte Karte oder
die Stapelkarte).
*/
const BASIS = Number(process.env.PRUEF_BASIS ?? 6_500_000)
const ANZAHL = Number(process.env.PRUEF_ANZAHL ?? 30)
const AUS = process.env.PRUEF_AUS ?? 'aufgaben2.json'
const ZIEL = process.env.PRUEF_ZIEL ?? 'aufgabe'

const verdeckt = (a: SpielAktion) => a.typ === 'RisikoKarteSpielen' || ziehtVerdeckt(a)
const EIGENE_KARTE = (a: SpielAktion) => a.typ !== 'ZugBeenden' && a.typ !== 'UeberhandAbwerfen' && a.typ !== 'Entscheiden' && a.typ !== 'Reagieren'
const OHNE_VERDECKTES = (a: SpielAktion) => EIGENE_KARTE(a) && !verdeckt(a)

function ziel(start: Spielzustand, zustand: Spielzustand, sitz: number): number {
  if (ZIEL === 'gruppe') return gruppenzahl(zustand, sitz)
  const { erfuellteAufgaben, geheimeAufgabe, geheimeAufgabeErfuellt } = zustand.spieler[sitz]
  const geheim = geheimeAufgabeErfuellt && geheimeAufgabe !== null ? geheimeAufgabe.punkte : 0
  return erfuellteAufgaben.reduce((s, a) => s + a.punkte, 0) + geheim + aufgabenwert(start, zustand, sitz)
}
function wert(start: Spielzustand, zustand: Spielzustand, sitz: number): number {
  return bewerte(sichtFuer(zustand, sitz)) + aufgabenwert(start, zustand, sitz)
}
function punkte(start: Spielzustand, zustand: Spielzustand, sitz: number): number {
  return sichtbarePunkte(sichtFuer(zustand, sitz)) + aufgabenwert(start, zustand, sitz)
}

/** Der Rest des eigenen Zuges (beide Teilzüge) durch `ki`; Gegner lassen durch, bei einer Wahl nach `gegner`. Der Stand vor dem letzten „Zug beenden“. */
function rest(zustand: Spielzustand, sitz: number, ki: Ki, gegner: (a: SpielAktion[]) => SpielAktion = (a) => a[0]): Spielzustand {
  let jetzt = zustand
  for (let i = 0; i < 25; i += 1) {
    if (jetzt.partiephase !== 'Laufend' || jetzt.zug.spielerIndex !== sitz) return jetzt
    const e = ermittleEntscheider(jetzt)
    if (e === null) return jetzt
    if (e !== sitz) {
      const ak = ermittleAktionen(jetzt)
      jetzt = anwendeAktion(jetzt, ak.every((x) => x.typ === 'Reagieren') ? ak.find((x) => x.typ === 'Reagieren' && x.farbenschutzId === null)! : gegner(ak)).zustand
      continue
    }
    const a = kiWahl(jetzt, ki)!
    if (a.typ === 'UeberhandAbwerfen') return jetzt
    const nach = anwendeAktion(jetzt, a).zustand
    if (a.typ === 'ZugBeenden' && !(nach.zug.spielerIndex === sitz && nach.zug.teilzug === 2)) return jetzt
    jetzt = nach
  }
  return jetzt
}

/** Bester Wert eines ersten Schritts: mit bester zweiter Karte oder mit der Fortsetzung durch die KI. */
function planwert(start: Spielzustand, aktion: SpielAktion, sitz: number, ki: () => Ki): number {
  const danach = nachDurchlassen(start, aktion, sitz)
  return Math.max(...mitZweiterKarte(danach, sitz).map((d) => wert(start, d, sitz)), wert(start, rest(danach, sitz, ki()), sitz))
}

/** Erwartung des ganzen Zuges ab einer verdeckten Aktion, über jede ungesehene Karte oben auf dem Stapel. */
function erwartung(start: Spielzustand, aktion: SpielAktion, sitz: number, ki: () => Ki, wahl: 'benannt' | 'stapel'): { wert: number; erfuellt: number; n: number } {
  const fremd = start.spieler.flatMap((sp, i) => (i === sitz ? [] : sp.hand.map((k, j) => ({ i, j, k }))))
  const ungesehen = [...fremd.map((x) => x.k), ...start.nachziehstapel]
  let summe = 0
  let erfuellt = 0
  const basis = ziel(start, start, sitz)
  for (const karte of ungesehen) {
    const z = structuredClone(start)
    const oben = z.nachziehstapel[0]
    const imStapel = z.nachziehstapel.findIndex((k) => k.id === karte.id)
    if (imStapel >= 0) [z.nachziehstapel[0], z.nachziehstapel[imStapel]] = [z.nachziehstapel[imStapel], z.nachziehstapel[0]]
    else {
      const x = fremd.find((f) => f.k.id === karte.id)!
      z.spieler[x.i].hand[x.j] = oben
      z.nachziehstapel[0] = structuredClone(karte)
    }
    const nach = anwendeAktion(z, aktion).zustand
    const gegner = (a: SpielAktion[]) => a.find((x) => JSON.stringify(x).includes(wahl === 'benannt' ? 'benannt' : 'stapel')) ?? a[0]
    const ende = rest(nach, sitz, ki(), gegner)
    summe += wert(start, ende, sitz)
    if (ziel(start, ende, sitz) > basis) erfuellt += 1
  }
  return { wert: summe / ungesehen.length, erfuellt, n: ungesehen.length }
}

interface Schritt {
  sitz: number
  vorher: Spielzustand
  aktion: SpielAktion
  nachher: Spielzustand
}

it(`Prüfer ${ZIEL} in Partien, symmetrisch`, () => {
  const faelle: unknown[] = []
  const zahl = { entscheidungen: 0, mitZiel: 0, erfuellt: 0, gedeckt: 0, gesperrtK24: 0, gleich: 0, ungedeckt: 0, verdecktGedeckt: 0, verdecktNurGuenstig: 0, verdecktUngedeckt: 0 }
  for (let n = 0; n < ANZAHL; n += 1) {
    const saat = BASIS + n
    const spielerzahl = 2 + (n % 3)
    const alleSolide = n % 2 === 0
    const kiSaat = (sitz: number) => (saat * 31 + sitz * 97 + 7) >>> 0
    const kis: Ki[] = Array.from({ length: spielerzahl }, (_, sitz) => (alleSolide || sitz === 0 ? STRATEGIEN.solideKi(erzeugeZufall(kiSaat(sitz))) : STRATEGIEN.zufallsKi(erzeugeZufall(kiSaat(sitz)))))
    const ki = (sitz: number) => () => STRATEGIEN.solideKi(erzeugeZufall(kiSaat(sitz) + 1))
    let zustand = erstellePartie({ spielerzahl, erweiterung: process.env.PRUEF_ERWEITERUNG !== '0', zufall: erzeugeZufall(saat) })
    const zuege: Schritt[][] = []
    for (let k = 0; k < 5000; k += 1) {
      const e = entscheiderVon(zustand)
      if (e === null) break
      const aktion = kiWahl(zustand, kis[e.index])!
      const nachher = anwendeAktion(zustand, aktion).zustand
      if (e.index === zustand.zug.spielerIndex && aktion.typ !== 'Reagieren') {
        const letzter = zuege[zuege.length - 1]
        const vorige = letzter?.[letzter.length - 1].aktion.typ
        const neu = letzter === undefined || letzter[0].sitz !== e.index || vorige === 'UeberhandAbwerfen' || (vorige === 'ZugBeenden' && zustand.zug.teilzug === 1)
        if (neu) zuege.push([{ sitz: e.index, vorher: zustand, aktion, nachher }])
        else letzter.push({ sitz: e.index, vorher: zustand, aktion, nachher })
      }
      zustand = nachher
    }
    for (const zug of zuege) {
      const sitz = zug[0].sitz
      if (!(alleSolide || sitz === 0)) continue
      zug.forEach((schritt, i) => {
        if (!EIGENE_KARTE(schritt.aktion)) return
        const start = schritt.vorher
        if (start.entscheidung !== null || start.schwebend !== null) return
        zahl.entscheidungen += 1
        const basis = ziel(start, start, sitz)
        const erfuellend = ermittleAktionen(start)
          .filter(OHNE_VERDECKTES)
          .map((a) => ({ a, danach: nachDurchlassen(start, a, sitz) }))
          .filter(({ danach }) => ziel(start, danach, sitz) > basis)
        if (erfuellend.length === 0) return
        zahl.mitZiel += 1
        const weiter = zug.slice(i)
        // Erfüllt oder versucht im ganzen Zug, auch nach einer verdeckten Karte; ein Versuch zählt, auch wenn ein Gegner abwehrt.
        const versucht = weiter.some(({ aktion, vorher }) => OHNE_VERDECKTES(aktion) && vorher.entscheidung === null && ziel(start, nachDurchlassen(vorher, aktion, sitz), sitz) > ziel(start, vorher, sitz))
        // Auch über eine Wahl nach der Risiko-Karte (zusätzliche Farbkarte) oder am Zugende (D59) erfüllt.
        if (versucht || ziel(start, zug[zug.length - 1].nachher, sitz) > basis) {
          zahl.erfuellt += 1
          return
        }
        // K2.4: eine Farbenfusion, die die eigenen Punkte senkt, ist gesperrt; gilt das für jede Erfüllung, ist die Ausnahme durch K2.4 gedeckt.
        const erlaubt = erfuellend.filter(({ a, danach }) => a.typ !== 'FusionLegen' || punkte(start, danach, sitz) >= punkte(start, start, sitz))
        const besteErfuellung = Math.max(...erfuellend.map(({ a }) => planwert(start, a, sitz, ki(sitz))))
        const besteErlaubte = erlaubt.length === 0 ? -Infinity : Math.max(...erlaubt.map(({ a }) => planwert(start, a, sitz, ki(sitz))))
        const fall: Record<string, unknown> = { saat, spielerzahl, alleSolide, sitz, stelle: i, gewaehlt: JSON.stringify(schritt.aktion), ablauf: weiter.map(({ aktion }) => aktion.typ), besteErfuellung, besteErlaubte }
        if (verdeckt(schritt.aktion)) {
          const b = erwartung(start, schritt.aktion, sitz, ki(sitz), 'benannt')
          const s = schritt.aktion.typ === 'RisikoKarteSpielen' && schritt.aktion.risikoAktion === 2 ? erwartung(start, schritt.aktion, sitz, ki(sitz), 'stapel') : b
          Object.assign(fall, { erwartungBenannt: b.wert, erwartungStapel: s.wert, erfuelltBenannt: `${b.erfuellt}/${b.n}`, erfuelltStapel: `${s.erfuellt}/${s.n}` })
          const vergleich = besteErlaubte
          fall.urteil = Math.min(b.wert, s.wert) > vergleich + 1e-9 ? 'verdeckt gedeckt' : Math.max(b.wert, s.wert) > vergleich + 1e-9 ? 'VERDECKT NUR BEI GÜNSTIGER GEGNERWAHL' : 'VERDECKT UNGEDECKT'
          if (fall.urteil === 'verdeckt gedeckt') zahl.verdecktGedeckt += 1
          else if (fall.urteil === 'VERDECKT UNGEDECKT') zahl.verdecktUngedeckt += 1
          else zahl.verdecktNurGuenstig += 1
        } else {
          const gewaehlt = planwert(start, schritt.aktion, sitz, ki(sitz))
          fall.gewaehltWert = gewaehlt
          if (gewaehlt > besteErfuellung + 1e-9) {
            zahl.gedeckt += 1
            fall.urteil = 'gedeckt'
          } else if (gewaehlt > besteErlaubte + 1e-9) {
            zahl.gesperrtK24 += 1
            fall.urteil = 'gedeckt durch K2.4'
          } else if (Math.abs(gewaehlt - besteErlaubte) <= 1e-9) {
            zahl.gleich += 1
            fall.urteil = 'gleich'
          } else {
            zahl.ungedeckt += 1
            fall.urteil = 'UNGEDECKT'
          }
        }
        faelle.push(fall)
      })
    }
  }
  writeFileSync(AUS, JSON.stringify({ basis: BASIS, anzahl: ANZAHL, ziel: ZIEL, ...zahl, faelle }, null, 1))
  console.log(`${ZIEL} Saaten ${BASIS}..${BASIS + ANZAHL - 1}: ${JSON.stringify(zahl)}`)
  expect(zahl.entscheidungen).toBeGreaterThan(0)
}, 7_200_000)
