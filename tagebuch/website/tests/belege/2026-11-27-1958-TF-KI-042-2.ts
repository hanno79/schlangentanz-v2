// @vitest-environment node
// Probe des Prüfers K4, nicht für das Repo: Einzelfall Saat 77'105, Sitz 0, Zug 10 aus der Messung.
import { writeFileSync } from 'node:fs'
import { describe, it } from 'vitest'
import { anwendeAktion, berechneEndwertung, erfuelltAufgabe, ermittleAktionen, ermittleEntscheider, erstellePartie, erzeugeZufall } from '../../engine'
import type { SpielAktion, Spielzustand } from '../../engine'
import { STRATEGIEN } from './index'
import { kiWahl } from '../schritt'
import { sichtFuer } from '../sicht'
import { aufgabenwert, mitZweiterKarte, nachDurchlassen } from '../__tests__/stellungen'
import { bewerte } from './bewertung'

const SAAT = Number(process.env.K4_DETAIL_SAAT ?? 77_105)
const SPIELER = Number(process.env.K4_DETAIL_SPIELER ?? 4)
const ZUG = Number(process.env.K4_DETAIL_ZUG ?? 10)
const SITZ = 0

let START: Spielzustand | null = null
const wert = (z: Spielzustand) => (bewerte(sichtFuer(z, 0)) + aufgabenwert(START!, z, 0)).toFixed(2)
const wertung = (z: Spielzustand) => JSON.stringify(berechneEndwertung(z).spieler[0])
const kurz = (z: Spielzustand, sitz: number) => z.spieler[sitz].schlangen.map((s) => `${s.id}: ${s.karten.map((k) => (k.typ === 'Farbkarte' ? k.farbe : k.name)).join(' ')}`).join(' | ')

describe('Prüfer K4 Detail', () => {
  it('Einzelfall', () => {
    let zustand = erstellePartie({ spielerzahl: SPIELER, erweiterung: true, zufall: erzeugeZufall(SAAT) })
    const kis = Array.from({ length: SPIELER }, (_, sitz) => (sitz === SITZ ? STRATEGIEN.solideKi(erzeugeZufall(SAAT * 7 + sitz)) : STRATEGIEN.zufallsKi(erzeugeZufall(SAAT * 11 + sitz))))
    let zuege = 0
    let imZug = false
    const zeilen: string[] = []
    for (let n = 0; n < 6000; n += 1) {
      const sitz = ermittleEntscheider(zustand)
      if (sitz === null) break
      if (sitz === SITZ && zustand.zug.spielerIndex === SITZ && !imZug && zustand.zug.abschnitt === 'Ausspielen') {
        imZug = true
        zuege += 1
        if (zuege === ZUG) {
          START = zustand
          const s = zustand.spieler[SITZ]
          const frei = [...zustand.offeneAufgaben, ...(s.geheimeAufgabeErfuellt || s.geheimeAufgabe === null ? [] : [s.geheimeAufgabe])]
          zeilen.push(`Hand: ${s.hand.map((k) => (k.typ === 'Farbkarte' ? k.farbe : k.name)).join(', ')}`)
          zeilen.push(`Schlangen: ${kurz(zustand, SITZ)}`)
          zeilen.push(`Freie Aufgaben: ${frei.map((a) => `${a.name} (${a.punkte})`).join(', ')}; Häutungs-Dreiergruppen bisher ${s.schlangenhaeutungDreiergruppen}`)
          zeilen.push(`Punkte jetzt ${berechneEndwertung(zustand).spieler[SITZ].summe}`)
          const aktionen = ermittleAktionen(zustand)
          zeilen.push(`Aktionen ${aktionen.length}, davon Häutungen ${aktionen.filter((a) => a.typ === 'SchlangenhaeutungSpielen').length}`)
          const erfuellend = aktionen.flatMap((a) => {
            const d = nachDurchlassen(zustand, a, SITZ)
            const neu = frei.filter((auf) => erfuelltAufgabe(d, SITZ, auf))
            return neu.length === 0 ? [] : [{ a, d, neu }]
          })
          for (const { a, d, neu } of erfuellend.slice(0, 4)) zeilen.push(`ERFÜLLT ${neu.map((x) => x.name).join('+')} mit ${JSON.stringify(a)} → ${kurz(d, SITZ)}; Punkte ${berechneEndwertung(d).spieler[SITZ].summe}; Bewertung ${wert(d)}; beste mit zweiter Karte ${Math.max(...mitZweiterKarte(d, 0).map((x) => Number(wert(x)))).toFixed(2)}; Wertung ${wertung(d)}`)
          zeilen.push(`Erfüllende Aktionen insgesamt ${erfuellend.length}`)
        }
      }
      const aktion: SpielAktion = kiWahl(zustand, kis[sitz])!
      const nachher = anwendeAktion(zustand, aktion).zustand
      if (zuege === ZUG && sitz === SITZ && imZug) zeilen.push(`KI WÄHLT ${JSON.stringify(aktion)} → ${kurz(nachher, SITZ)}; Punkte ${berechneEndwertung(nachher).spieler[SITZ].summe}; Bewertung ${wert(nachher)}; Wertung ${wertung(nachher)}`)
      if (sitz === SITZ && aktion.typ === 'ZugBeenden') {
        imZug = false
        if (zuege === ZUG) break
      }
      zustand = nachher
    }
    void sichtFuer
    writeFileSync(process.env.K4_DETAIL_AUSGABE ?? 'detail.txt', zeilen.join('\n'))
  }, 300_000)
})
