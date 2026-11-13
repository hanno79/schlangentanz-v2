import { describe, expect, it } from 'vitest'
import { deserialisiere, erstellePartie, pruefeInvarianten, serialisiere } from './engine'
import type { Spielzustand } from './engine'
import { baukasten } from './engine/testing/szenario'
import { erzeugeZufall } from './engine/testing/zufall'
import { zufallszustand } from './engine/testing/zufallszustand'
import { erstelleSpielkarten } from './engine/deck'
import { erstelleAufgabenStapel } from './engine/aufgabenKarten'
import { erstelleSpielzustand as altErstelle } from './zz_alt_engine_tmp/state'
import { serialisiere as altSerialisiere } from './zz_alt_engine_tmp/serialization'
import { ladeSpielstand, SPIELSTAND_SCHLUESSEL } from './spielstand'

const KARTEN = 'Jede Spielkarte liegt genau einmal an genau einem Ort'
const AUFGABEN = 'Jede Aufgabenkarte liegt genau einmal im Spiel'
const AUSLAGE = 'Jede Comeback- und Risiko-Karte liegt genau einmal im Spiel'
const ZWEI = 'Kein Spieler hat mehr als 2 Schlangen'
const LEER = 'Keine Schlange ist leer'
const IDS = 'Alle Ids sind eindeutig'

const verletzte = (z: Spielzustand) => pruefeInvarianten(z).filter((b) => b.verletzt).map((b) => `${b.name}: ${b.detail}`)
const namen = (z: Spielzustand) => pruefeInvarianten(z).filter((b) => b.verletzt).map((b) => b.name)

function belebt(): Spielzustand {
  return baukasten({ spielerzahl: 4, erweiterung: true, zufall: erzeugeZufall(77) })
    .schlange(1, ['Rot', { fusion: ['Gelb', 'Gelb'] }, 'Blau'])
    .schlange(2, ['Grün', 'Grün'])
    .schlange(2, ['Braun'])
    .ablage(3, ['Verdoppler'])
    .grube(3, 1)
    .ausDemSpiel(['Schlangenkorb des Glücks'])
    .haendeAuffuellen()
    .schwebend(0, 'Schlangenblockade', (karteId, spielerId) => ({ typ: 'BlockadeLegen', spielerId, karteId, schlangenId: 'schlange-2', position: 1 }), [2])
    .zustand()
}

describe('Prüfer E1: eigene Abzählung', () => {
  it('Material selbst abgezählt aus A1', () => {
    const zaehle = (erw: boolean) => {
      const k = erstelleSpielkarten(erw)
      const z: Record<string, number> = {}
      for (const c of k) { const a = c.typ === 'Farbkarte' ? c.farbe : c.name; z[a] = (z[a] ?? 0) + 1 }
      return { n: k.length, z, farb: k.filter((c) => c.typ === 'Farbkarte').length, sonder: k.filter((c) => c.typ === 'Sonderkarte').length }
    }
    const b = zaehle(false), e = zaehle(true)
    console.log('BASIS', JSON.stringify(b)); console.log('ERW', JSON.stringify(e))
    expect([b.n, b.farb, b.sonder]).toEqual([108, 78, 30])
    expect([e.n, e.farb, e.sonder]).toEqual([112, 78, 34])
    expect(erstelleAufgabenStapel()).toHaveLength(15)
    // Erweiterung 31 Spielkarten = 3 Häutung + 1 Korb + 15 Aufgaben + 4 Comeback + 8 Risiko
    const p4 = erstellePartie({ spielerzahl: 4, erweiterung: true, zufall: erzeugeZufall(1) })
    const auslage = p4.spieler.flatMap((s) => [s.comeback!.karte, ...s.risikoKarten])
    expect(4 + 15 + auslage.length).toBe(31)
    expect(112 + 15 + auslage.length).toBe(139)
  })
})

describe('Prüfer E1: Gegenproben je Invariante', () => {
  it('belebter Zustand ist sauber', () => expect(verletzte(belebt())).toEqual([]))

  it('K7a: Karte in zwei Schlangen verschiedener Spieler', () => {
    const z = belebt()
    z.spieler[2].schlangen[1].karten.push(z.spieler[1].schlangen[0].karten[0])
    expect(namen(z)).toContain(KARTEN)
  })
  it('K7a: Karte unter der Fusion fehlt (nur eine Karte darunter wird entfernt)', () => {
    const z = belebt()
    const f = z.spieler[1].schlangen[0].fusionen[0]
    ;(f as { unter: unknown[] }).unter = [f.unter[0]]
    expect(namen(z)).toContain(KARTEN)
  })
  it('K7a: schwebende Karte zusätzlich im Ablagestapel', () => {
    const z = belebt()
    z.spieler[0].ablagestapel.push(z.schwebend!.karte)
    expect(namen(z)).toEqual(expect.arrayContaining([KARTEN]))
  })
  it('K7a: Karte aus dem Spiel zusätzlich auf der Hand', () => {
    const z = belebt()
    z.spieler[3].hand.push(z.ausDemSpiel[0] as never)
    expect(namen(z)).toEqual(expect.arrayContaining([KARTEN]))
  })
  it('K7a: ausliegende Grube zusätzlich im Nachziehstapel', () => {
    const z = belebt()
    z.nachziehstapel.unshift(z.ausliegendeGruben[0].karte)
    expect(namen(z)).toEqual(expect.arrayContaining([KARTEN]))
  })
  it('K7a (nicht in den Tests): Sonderkarte mit getauschtem Namen bei gleicher Id', () => {
    const z = belebt()
    const i = z.spieler[3].ablagestapel.findIndex((k) => k.typ === 'Sonderkarte')
    z.spieler[3].ablagestapel[i] = { typ: 'Sonderkarte', id: z.spieler[3].ablagestapel[i].id, name: 'Farbenschutz' }
    expect(namen(z)).toEqual(expect.arrayContaining([KARTEN]))
    console.log('NAMENSTAUSCH', verletzte(z))
  })
  it('K7a (nicht in den Tests): dieselbe Karte zweimal in derselben Hand', () => {
    const z = belebt()
    z.spieler[1].hand.push(z.spieler[1].hand[0])
    expect(namen(z)).toEqual(expect.arrayContaining([KARTEN]))
    console.log('HAND2X', verletzte(z))
  })
  it('K7a (nicht in den Tests): erfundene Karte blau-16 im Stapel', () => {
    const z = belebt()
    z.nachziehstapel.push({ typ: 'Farbkarte', id: 'blau-16', farbe: 'Blau', punkte: 1 })
    expect(namen(z)).toEqual(expect.arrayContaining([KARTEN]))
  })
  it('K7a (nicht in den Tests): Aufgabe gleichzeitig offen und erfüllt', () => {
    const z = belebt()
    z.spieler[0].erfuellteAufgaben.push(z.offeneAufgaben[0])
    expect(namen(z)).toEqual(expect.arrayContaining([AUFGABEN]))
  })
  it('K7a (nicht in den Tests): Risiko-Karte gleichzeitig vor Spieler und aus dem Spiel', () => {
    const z = belebt()
    z.ausDemSpiel.push(z.spieler[2].risikoKarten[0])
    expect(namen(z)).toEqual(expect.arrayContaining([AUSLAGE]))
  })
  it('K7b: dritte Schlange bei Spieler 3 (aus echtem Material)', () => {
    const z = belebt()
    const i = z.nachziehstapel.findIndex((k) => k.typ === 'Farbkarte')
    z.spieler[2].schlangen.push({ id: 'schlange-50', karten: z.nachziehstapel.splice(i, 1), fusionen: [] })
    z.schlangenZaehler = 50
    expect(namen(z)).toEqual([ZWEI])
  })
  it('K7c: zweite Schlange leer', () => {
    const z = belebt()
    z.spieler[3].hand.push(...z.spieler[2].schlangen[1].karten)
    z.spieler[2].schlangen[1].karten = []
    expect(namen(z)).toEqual([LEER])
  })
  it('K7d: Spieler-Id gleich Karten-Id; Schlangen-Id gleich Spieler-Id; zwei Aufgaben mit derselben Id', () => {
    const a = belebt(); a.spieler[3].id = 'gruen-01'
    expect(namen(a)).toEqual(expect.arrayContaining([IDS]))
    const b = belebt(); b.spieler[2].schlangen[0].id = b.spieler[0].id
    expect(namen(b)).toEqual(expect.arrayContaining([IDS]))
    const c = belebt(); c.offeneAufgaben[1] = { ...c.offeneAufgaben[1], id: c.offeneAufgaben[0].id }
    expect(namen(c)).toEqual(expect.arrayContaining([IDS]))
    console.log('IDS', verletzte(a), verletzte(b), verletzte(c))
  })
  it('Nicht verlangt, nur beobachtet: was die Invarianten nicht melden', () => {
    const grubeSelbst = belebt(); grubeSelbst.ausliegendeGruben[0].vor = grubeSelbst.ausliegendeGruben[0].gespieltVon
    const angreiferBetroffen = belebt(); angreiferBetroffen.schwebend!.ausstehend = [0]
    const aufgabeFehltOffen = belebt(); aufgabeFehltOffen.spieler[0].erfuellteAufgaben.push(aufgabeFehltOffen.offeneAufgaben.shift()!)
    const farbkarteAusDemSpiel = belebt(); farbkarteAusDemSpiel.ausDemSpiel.push(farbkarteAusDemSpiel.nachziehstapel.pop()!)
    const zaehler = belebt(); zaehler.zug.gespielteFarbkarten = 7
    const verbrauchtOhne = belebt(); verbrauchtOhne.zug.verdopplerGespielt = true; verbrauchtOhne.zug.teilzug = 1
    console.log('NICHT GEMELDET', JSON.stringify({
      grubeVorSichSelbst: namen(grubeSelbst),
      angreiferAlsBetroffener: namen(angreiferBetroffen),
      nurZweiOffeneTrotzStapel: namen(aufgabeFehltOffen),
      farbkarteAusDemSpiel: namen(farbkarteAusDemSpiel),
      sieben_Farbkarten_im_Teilzug: namen(zaehler),
    }))
  })
})

describe('Prüfer E1: Kriterien 5, 6, 8', () => {
  it('K5: gleiche Saat gleicher Anfang (alle 6), Aufgaben hängen von der Saat ab', () => {
    for (const sp of [2, 3, 4]) for (const erw of [false, true]) {
      const a = erstellePartie({ spielerzahl: sp, erweiterung: erw, zufall: erzeugeZufall(4242) })
      const b = erstellePartie({ spielerzahl: sp, erweiterung: erw, zufall: erzeugeZufall(4242) })
      expect(serialisiere(a)).toBe(serialisiere(b))
    }
    const reihen = new Set<string>()
    for (let s = 1; s <= 20; s++) {
      const z = erstellePartie({ spielerzahl: 2, erweiterung: true, zufall: erzeugeZufall(s) })
      reihen.add(z.offeneAufgaben.map((a) => a.id).join(','))
    }
    console.log('VERSCHIEDENE OFFENE AUFGABEN UEBER 20 SAATEN', reihen.size)
    expect(reihen.size).toBeGreaterThan(1)
  })
  it('K6: 200 weitere Zufallszustände (Saat 5000–5199) und alle Startpartien rund', () => {
    for (let s = 5000; s < 5200; s++) {
      const z = zufallszustand(erzeugeZufall(s))
      expect(deserialisiere(serialisiere(z))).toEqual(z)
    }
    for (const sp of [2, 3, 4]) for (const erw of [false, true]) {
      const z = erstellePartie({ spielerzahl: sp, erweiterung: erw, zufall: erzeugeZufall(sp * 10 + Number(erw)) })
      expect(deserialisiere(serialisiere(z))).toEqual(z)
    }
  })
  it('K6: echter Spielstand der alten Engine (Format 1) wird abgelehnt und vom Spielstand-Lader verworfen', () => {
    const alt = altSerialisiere(altErstelle(3, erzeugeZufall(9)))
    expect(JSON.parse(alt).version).toBe(1)
    expect(() => deserialisiere(alt)).toThrow(/Format 1/)
    localStorage.setItem(SPIELSTAND_SCHLUESSEL, alt)
    expect(ladeSpielstand()).toBeNull()
    expect(localStorage.getItem(SPIELSTAND_SCHLUESSEL)).toBeNull()
    console.log('ALT', alt.slice(0, 120))
  })
  it('K8: Baukasten erfindet nichts', () => {
    expect(() => baukasten({ spielerzahl: 2, erweiterung: false }).hand(0, [{ id: 'blau-16' }])).toThrow(/blau-16/)
    expect(() => baukasten({ spielerzahl: 2, erweiterung: false }).hand(0, ['Schlangenkorb des Glücks'])).toThrow()
    expect(() => baukasten({ spielerzahl: 3, erweiterung: true }).schlange(0, Array(10).fill('Grün'))).toThrow(/Grün/)
    expect(() => baukasten({ spielerzahl: 2, erweiterung: false }).grube(0, 1).grube(0, 1).grube(1, 0).grube(1, 0)).toThrow(/Schlangengrube/)
    expect(() => baukasten({ spielerzahl: 2, erweiterung: false }).aendere((z) => z.spieler[0].hand.push({ typ: 'Farbkarte', id: 'erfunden', farbe: 'Rot', punkte: 1 })).zustand()).toThrow(/Unbekannt: erfunden/)
    // Fusion aus zwei verschiedenen Farben über den Baukasten
    expect(() => baukasten({ spielerzahl: 2, erweiterung: false }).schlange(0, [{ fusion: ['Rot', 'Blau'] }]).zustand()).toThrow(/Farbenfusion/)
  })
})
