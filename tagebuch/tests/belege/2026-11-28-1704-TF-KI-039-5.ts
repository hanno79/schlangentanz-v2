// @vitest-environment node
import { describe, it } from 'vitest'
import { ermittleAktionen, erzeugeZufall, serialisiere } from '../../engine'
import type { SpielAktion, Spielzustand } from '../../engine'
import { appendFileSync, writeFileSync } from 'node:fs'
import { sichtFuer } from '../sicht'
import { aufgabenwert, entscheidungenVon, mitZweiterKarte, nachDurchlassen } from '../__tests__/stellungen'
import { bewerte } from './bewertung'
import { STRATEGIEN } from './index'
import { ziehtVerdeckt } from './ziehen'

/* Prüfer K4, Iteration 2: Diagnose der Verstösse aus der Kriterium-1-Probe. Temporär. */

const FAELLE = (process.env.P2_FAELLE ?? '').split(',').filter(Boolean).map((eintrag) => {
  const [saat, modus] = eintrag.split(':')
  return { saat: Number(saat), modus }
})
const verdeckt = (aktion: SpielAktion) => aktion.typ === 'RisikoKarteSpielen' || ziehtVerdeckt(aktion)
const OHNE = (aktion: SpielAktion) => aktion.typ !== 'ZugBeenden' && aktion.typ !== 'UeberhandAbwerfen' && !verdeckt(aktion)
const wert = (start: Spielzustand, z: Spielzustand) => bewerte(sichtFuer(z, 0)) + aufgabenwert(start, z, 0)
function aufgaben(start: Spielzustand, z: Spielzustand): number {
  const { erfuellteAufgaben, geheimeAufgabe, geheimeAufgabeErfuellt } = z.spieler[0]
  return erfuellteAufgaben.reduce((s, a) => s + a.punkte, 0) + (geheimeAufgabeErfuellt && geheimeAufgabe !== null ? geheimeAufgabe.punkte : 0) + aufgabenwert(start, z, 0)
}
const kurz = (a: SpielAktion) => JSON.stringify(a).slice(0, 300)

describe('Diagnose', () => {
  it('zeigt die Fälle', () => {
    for (const { saat, modus } of FAELLE) {
      const spielerzahl = 2 + (saat % 3)
      const kis = Array.from({ length: spielerzahl }, (_, sitz) =>
        sitz === 0 || modus === 'solide' ? STRATEGIEN.solideKi(erzeugeZufall((saat * 17 + sitz) >>> 0)) : STRATEGIEN.zufallsKi(erzeugeZufall((saat * 19 + sitz) >>> 0)),
      )
      const alle = entscheidungenVon({ spielerzahl, erweiterung: true, saat }, kis, 0).filter((e) => e.aktion.typ !== 'Reagieren')
      for (let i = 0; i < alle.length; i += 1) {
        const start = alle[i].vorher
        if (start.zug.spielerIndex !== 0 || start.schwebend !== null || start.entscheidung !== null) continue
        if (alle[i].aktion.typ === 'Entscheiden' || verdeckt(alle[i].aktion)) continue
        const vorher = aufgaben(start, start)
        const erfuellend = ermittleAktionen(start).filter(OHNE).map((a) => ({ a, danach: nachDurchlassen(start, a, 0) })).filter(({ danach }) => aufgaben(start, danach) > vorher)
        if (erfuellend.length === 0) continue
        const zug: SpielAktion[] = []
        let ende = start
        for (let j = i; j < alle.length && alle[j].vorher.zug.spielerIndex === 0; j += 1) {
          if (alle[j].aktion.typ === 'ZugBeenden' || verdeckt(alle[j].aktion)) break
          zug.push(alle[j].aktion)
          ende = alle[j].nachher
        }
        if (aufgaben(start, ende) > vorher) continue
        const besteGesamt = Math.max(...erfuellend.flatMap(({ danach }) => mitZweiterKarte(danach, 0)).map((d) => wert(start, d)))
        if (wert(start, ende) > besteGesamt + 1e-9) continue
        const zeilen: string[] = [`Saat ${saat} ${modus}, Entscheidung ${i}, offene Aufgaben ${start.offeneAufgaben.map((a) => a.name).join(', ')}, geheim ${start.spieler[0].geheimeAufgabe?.name} erfüllt=${start.spieler[0].geheimeAufgabeErfuellt}`]
        zeilen.push(`Hand: ${start.spieler[0].hand.map((k) => (k.typ === 'Farbkarte' ? k.farbe : k.name)).join(', ')}`)
        zeilen.push(`Schlangen: ${start.spieler[0].schlangen.map((s) => s.karten.map((k) => (k.typ === 'Farbkarte' ? k.farbe : k.name)).join('-')).join(' | ')}`)
        zeilen.push(`Erfüllte: ${start.spieler[0].erfuellteAufgaben.map((a) => a.name).join(', ')}; Ausgespielte Sonderkarten: ${start.spieler[0].ausgespielteSonderkarten.join(', ')}`)
        zeilen.push(`Wert Start ${wert(start, start).toFixed(3)}; KI-Zug ${zug.map(kurz).join(' / ')}; Wert Ende ${wert(start, ende).toFixed(3)}`)
        for (const { a, danach } of erfuellend.slice(0, 8)) {
          const zweite = mitZweiterKarte(danach, 0).map((d) => wert(start, d))
          zeilen.push(`ERFÜLLUNG ${kurz(a)}: allein ${wert(start, danach).toFixed(3)}, mit zweiter max ${Math.max(...zweite).toFixed(3)}, Aufgaben ${aufgaben(start, danach)} gegen ${vorher}`)
        }
        const geplant = zug.reduce((stand, aktion) => nachDurchlassen(stand, aktion, 0), start)
        zeilen.push(`Geplant (Gegner lassen durch): Wert ${wert(start, geplant).toFixed(3)}, Aufgaben ${aufgaben(start, geplant)}; abgewehrt im Spiel: ${alle.slice(i).some((e) => e.ereignisse.some((x) => JSON.stringify(x).includes('Abwehr') || JSON.stringify(x).includes('abgewehrt')))}`)
        zeilen.push(`Anzahl erfüllender Aktionen: ${erfuellend.length}, Aktionen gesamt ${ermittleAktionen(start).length}`)
        appendFileSync(process.env.P2_AUSGABE ?? 'x.txt', zeilen.join('\n') + '\n\n')
        if (process.env.P2_STELLUNG) writeFileSync(`${process.env.P2_STELLUNG}-${saat}-${i}.json`, serialisiere(start))
      }
    }
  }, 600_000)
})
