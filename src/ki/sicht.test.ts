import { describe, expect, it } from 'vitest'
import { erzeugeZufall } from '../engine'
import type { Spielzustand } from '../engine'
import { baukasten } from '../engine/testing/szenario'
import { zufallszustand } from '../engine/testing/zufallszustand'
import { entscheiderVon, sichtFuer, spielerzahl } from './sicht'
import { alleTexte, mischeVerborgenes, verborgeneIds } from './__tests__/verborgenes'

/** Drei Spieler mit Erweiterung, Karten an jedem offenen Ort und eine angesagte Schlangengrube (A6), über die Spieler 2 entscheidet. */
function tisch(): Spielzustand {
  return baukasten({ spielerzahl: 3, erweiterung: true, zufall: erzeugeZufall(11) })
    .schlange(0, ['Blau', 'Blau', { fusion: ['Gelb', 'Gelb'] }, 'Rot'])
    .schlange(1, ['Rot', 'Schlangenblockade', 'Rot', 'Regenbogenschlange'])
    .ablage(0, ['Farbendieb', 'Grün'])
    .ablage(1, ['Braun', 'Verdoppler', 'Violett'])
    .ablage(2, ['Farbenschutz'])
    .grube(0, 2)
    .ausDemSpiel(['Schlangenkorb des Glücks'])
    .schwebend(
      1,
      'Schlangengrube',
      (karteId, spielerId) => ({ typ: 'SchlangengrubeSpielen', spielerId, karteId, zielSpielerId: 'spieler-3' }),
      [2],
    )
    .haendeAuffuellen()
    .hand(2, ['Blau'])
    .amZug(1)
    .zustand()
}

describe('K1 Kriterium 1: Was die Sicht enthält', () => {
  const zustand = tisch()
  const sicht = sichtFuer(zustand, 1)

  it('K1: die eigene Hand vollständig, die eigene geheime Aufgabe und ob sie erfüllt ist', () => {
    expect(sicht.ich).toBe(1)
    expect(sicht.hand).toEqual(zustand.spieler[1].hand)
    expect(sicht.hand.length, 'K1: Spieler 2 hält nach dem Auffüllen 5 Karten').toBe(5)
    expect(sicht.geheimeAufgabe).toEqual(zustand.spieler[1].geheimeAufgabe)
    expect(sicht.geheimeAufgabe, 'K1: mit Erweiterung hat jeder eine geheime Aufgabe (A4)').not.toBeNull()
    expect(sicht.geheimeAufgabeErfuellt).toBe(zustand.spieler[1].geheimeAufgabeErfuellt)
  })

  it('K1: alle Schlangen aller Spieler, mit den Karten unter einer Farbenfusion (A7.7)', () => {
    expect(sicht.spieler.map((spieler) => spieler.schlangen)).toEqual(zustand.spieler.map((spieler) => spieler.schlangen))
    expect(sicht.spieler[0].schlangen[0].fusionen[0].unter.map((karte) => karte.farbe)).toEqual(['Gelb', 'Gelb'])
  })

  it('D28: alle Ablagestapel vollständig, in ihrer Reihenfolge, nicht nur die oberste Karte', () => {
    expect(sicht.spieler.map((spieler) => spieler.ablagestapel)).toEqual(zustand.spieler.map((spieler) => spieler.ablagestapel))
    expect(sicht.spieler[1].ablagestapel.length, 'D28: der Ablagestapel von KI-Gegner 1 hat drei Karten').toBe(3)
  })

  it('K1: die Handgrösse jedes Spielers und die Grösse des Nachziehstapels, aber keine Karte daraus', () => {
    expect(sicht.spieler.map((spieler) => spieler.handgroesse)).toEqual(zustand.spieler.map((spieler) => spieler.hand.length))
    expect(sicht.spieler[2].handgroesse, 'K1: Spieler 3 hält 6 Karten').toBe(6)
    expect(sicht.nachziehstapelGroesse).toBe(zustand.nachziehstapel.length)
    expect(sicht.aufgabenstapelGroesse).toBe(zustand.aufgabenStapel.length)
  })

  it('K1: die offenen Aufgaben, die Auslage, erfüllte Aufgaben, ausliegende Gruben und was aus dem Spiel ist', () => {
    expect(sicht.offeneAufgaben).toEqual(zustand.offeneAufgaben)
    expect(sicht.offeneAufgaben).toHaveLength(3)
    expect(sicht.ausliegendeGruben).toEqual(zustand.ausliegendeGruben)
    expect(sicht.ausDemSpiel).toEqual(zustand.ausDemSpiel)
    zustand.spieler.forEach((spieler, index) => {
      expect(sicht.spieler[index]).toMatchObject({
        id: spieler.id,
        name: spieler.name,
        steuerung: spieler.steuerung,
        erfuellteAufgaben: spieler.erfuellteAufgaben,
        comeback: spieler.comeback,
        risikoKarten: spieler.risikoKarten,
        ausgespielteSonderkarten: spieler.ausgespielteSonderkarten,
        schlangenhaeutungDreiergruppen: spieler.schlangenhaeutungDreiergruppen,
      })
    })
  })

  it('A6/B2: die angesagte Aktion mit Karte, Ziel und wer noch entscheidet', () => {
    expect(sicht.angesagt).toEqual(zustand.schwebend)
    expect(sicht.angesagt?.aktion).toMatchObject({ typ: 'SchlangengrubeSpielen', zielSpielerId: 'spieler-3' })
    expect(sicht.angesagt?.ausstehend).toEqual([2])
    expect(sichtFuer(baukasten({ spielerzahl: 2, erweiterung: false }).haendeAuffuellen().zustand(), 0).angesagt).toBeNull()
  })

  it('K1: Partiephase, Zug, Schlussrunde und wer gerade entscheidet', () => {
    expect(sicht).toMatchObject({ erweiterung: true, partiephase: 'Laufend', zug: zustand.zug, schlussrundeAusloeser: null })
    expect(sicht.entscheider, 'A6: bei der angesagten Grube entscheidet Spieler 3, nicht der Spieler am Zug').toBe(2)
  })

  it('K2: wie viele Schlangen bisher angelegt wurden, auch wenn eine davon nicht mehr am Tisch liegt', () => {
    expect(sicht.schlangenZaehler, 'K2: zwei Schlangen im Testaufbau').toBe(2)
    const gefressen = baukasten({ spielerzahl: 2, erweiterung: false, zufall: erzeugeZufall(3) })
      .schlange(0, ['Blau'])
      .schlange(1, ['Rot'])
      .aendere((stand) => {
        // Wie nach einem Schlangenfrass: die letzte Karte auf dem Ablagestapel, die Schlange ist weg (A7.4).
        stand.spieler[1].ablagestapel.push(...stand.spieler[0].schlangen[0].karten)
        stand.spieler[0].schlangen = []
      })
      .zustand()
    expect(sichtFuer(gefressen, 1).schlangenZaehler, 'K2: schlange-1 ist weg, der Zähler bleibt 2').toBe(2)
  })
})

describe('K1 Kriterium 1: Was die Sicht nicht enthält', () => {
  it('B2: keine fremde Hand, keine Stapelreihenfolge, keine fremde geheime Aufgabe, für jeden Spieler', () => {
    const zustand = tisch()
    zustand.spieler.forEach((_, ich) => {
      const sicht = sichtFuer(zustand, ich)
      const verborgen = verborgeneIds(zustand, ich)
      expect(verborgen.length, `B2: Testaufbau, für Spieler ${ich} gibt es Verborgenes`).toBeGreaterThan(20)
      const texte = alleTexte(sicht)
      expect(verborgen.filter((id) => texte.has(id)), `B2: Sicht von Spieler ${ich} nennt Verborgenes`).toEqual([])
      for (const [index, spieler] of sicht.spieler.entries()) {
        expect(Object.keys(spieler), `B2: Spieler ${index} in der Sicht von ${ich}`).not.toContain('hand')
        expect(Object.keys(spieler)).not.toContain('geheimeAufgabe')
        expect(Object.keys(spieler)).not.toContain('geheimeAufgabeErfuellt')
      }
      expect(Object.keys(sicht)).not.toContain('nachziehstapel')
      expect(Object.keys(sicht)).not.toContain('aufgabenStapel')
    })
  })

  it('K1: zwei Zustände, die sich nur in Verborgenem unterscheiden, ergeben dieselbe Sicht (200 Zufallszustände)', () => {
    const zufall = erzeugeZufall(4711)
    let verschieden = 0
    for (let nummer = 0; nummer < 200; nummer += 1) {
      const zustand = zufallszustand(zufall)
      const ich = Math.floor(zufall() * zustand.spieler.length)
      const anders = mischeVerborgenes(zustand, ich, zufall)
      if (JSON.stringify(anders) !== JSON.stringify(zustand)) verschieden += 1
      expect(sichtFuer(anders, ich), `K1: Zustand ${nummer}, Sicht von Spieler ${ich}`).toEqual(sichtFuer(zustand, ich))
    }
    expect(verschieden, 'K1: Testaufbau, das Mischen verändert fast jeden Zustand').toBeGreaterThan(180)
  })

  it('K1 Gegenprobe: was offen liegt, ändert die Sicht', () => {
    const zustand = tisch()
    const vorher = sichtFuer(zustand, 0)

    const andereAblage = structuredClone(zustand)
    andereAblage.spieler[1].ablagestapel.reverse()
    expect(sichtFuer(andereAblage, 0), 'D28: die Reihenfolge eines fremden Ablagestapels ist sichtbar').not.toEqual(vorher)

    const kleinereHand = structuredClone(zustand)
    kleinereHand.nachziehstapel.unshift(kleinereHand.spieler[2].hand.pop()!)
    expect(sichtFuer(kleinereHand, 0), 'K1: eine fremde Handgrösse ist sichtbar').not.toEqual(vorher)

    const fuerZwei = mischeVerborgenes(zustand, 1, erzeugeZufall(3))
    expect(fuerZwei.spieler[0].hand, 'K1: Testaufbau, die Hand von Spieler 1 wurde mitgemischt').not.toEqual(zustand.spieler[0].hand)
    expect(sichtFuer(fuerZwei, 1), 'K1: für Spieler 2 ist die Hand von Spieler 1 verborgen').toEqual(sichtFuer(zustand, 1))
    expect(sichtFuer(fuerZwei, 0), 'K1: die eigene Hand sieht ihr Besitzer').not.toEqual(vorher)
  })
})

describe('K1: die Sicht ist eine Abschrift', () => {
  it('K1: wer die Sicht verändert, verändert den Zustand nicht', () => {
    const zustand = tisch()
    const roh = JSON.stringify(zustand)
    const sicht = sichtFuer(zustand, 1)
    sicht.hand.pop()
    sicht.spieler[0].schlangen[0].karten.pop()
    sicht.spieler[0].ablagestapel.pop()
    sicht.angesagt?.ausstehend.pop()
    sicht.offeneAufgaben.pop()
    expect(JSON.stringify(zustand)).toBe(roh)
  })

  it('K1: ein Spieler, den es nicht gibt, wird mit Grund abgelehnt', () => {
    const zustand = tisch()
    expect(() => sichtFuer(zustand, 3)).toThrow('Sicht: Einen Spieler an Stelle 3 gibt es bei 3 Spielern nicht.')
    expect(() => sichtFuer(zustand, -1)).toThrow('Sicht: Einen Spieler an Stelle -1 gibt es bei 3 Spielern nicht.')
    expect(() => sichtFuer(zustand, 1.5)).toThrow('Sicht: Einen Spieler an Stelle 1.5 gibt es bei 3 Spielern nicht.')
  })
})

describe('K1: wer entscheidet', () => {
  it('B2: zu Beginn entscheidet der Mensch; bei einer angesagten Karte der Gefragte; nach Spielende niemand', () => {
    expect(entscheiderVon(baukasten({ spielerzahl: 2, erweiterung: false }).haendeAuffuellen().zustand())).toEqual({ index: 0, name: 'Spieler 1', steuerung: 'Mensch' })
    expect(entscheiderVon(tisch())).toEqual({ index: 2, name: 'KI-Gegner 2', steuerung: 'KI' })
    expect(entscheiderVon(baukasten({ spielerzahl: 2, erweiterung: false }).beendet(0).zustand())).toBeNull()
  })

  it('A2: wie viele Spieler am Tisch sitzen', () => {
    expect(spielerzahl(tisch())).toBe(3)
  })
})
