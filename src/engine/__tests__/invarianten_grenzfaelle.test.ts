import { describe, expect, it } from 'vitest'
import { deserialisiere, erstellePartie, pruefeInvarianten, serialisiere } from '../index'
import type { KartenAktion, Spielzustand } from '../index'
import { baukasten } from '../testing/szenario'
import { erzeugeZufall } from '../testing/zufall'

/*
Grenzfälle aus dem Codex-Review zu E1: Zustände, die die Invarianten zuerst
durchliessen.
*/

const AUSLAGE = 'Jede Comeback- und Risiko-Karte liegt genau einmal im Spiel'
const IDS = 'Alle Ids sind eindeutig'
const FUSION = 'Jede Farbenfusion deckt zwei Farbkarten gleicher Farbe'
const VERWEISE = 'Alle Verweise auf Spieler und Karten sind gültig'
const PHASE = 'Partiephase und Schlussrunde passen zusammen'

function verletzte(zustand: Spielzustand): string[] {
  return pruefeInvarianten(zustand)
    .filter((befund) => befund.verletzt)
    .map((befund) => befund.name)
}

function start(erweiterung = false, spielerzahl = 2): Spielzustand {
  return erstellePartie({ spielerzahl, erweiterung, zufall: erzeugeZufall(8) })
}

function mitSchwebender(aktion: (karteId: string, spielerId: string) => KartenAktion, karte: 'Schlangengrube' | 'Schlangenblockade' = 'Schlangengrube') {
  return baukasten({ spielerzahl: 3, erweiterung: false }).schlange(1, ['Rot']).schwebend(0, karte, aktion, [1]).zustand()
}

describe('A2/A4: Grenzfälle der Invarianten', () => {
  it('A2: ein Spielstand mit einem oder fünf Spielern wird beim Laden abgelehnt', () => {
    const roh = JSON.parse(serialisiere(start())) as { spieler: unknown[] }
    expect(() => deserialisiere(JSON.stringify({ ...roh, spieler: roh.spieler.slice(0, 1) }))).toThrow(/2 bis 4 Spieler/)
    const fuenf = JSON.parse(serialisiere(start(false, 4))) as { spieler: unknown[] }
    expect(() => deserialisiere(JSON.stringify({ ...fuenf, spieler: [...fuenf.spieler, fuenf.spieler[0]] }))).toThrow(/2 bis 4 Spieler/)
  })

  it('A7.7/D20: zwei Sonderkarten unter einer Fusion werden gemeldet', () => {
    const zustand = baukasten({ spielerzahl: 2, erweiterung: false }).schlange(0, ['Blau', { fusion: ['Rot', 'Rot'] }]).zustand()
    const fusion = zustand.spieler[0].schlangen[0].fusionen[0]
    zustand.spieler[0].ablagestapel.push(...fusion.unter)
    const [verdoppler, dieb] = [
      zustand.nachziehstapel.findIndex((karte) => karte.typ === 'Sonderkarte' && karte.name === 'Verdoppler'),
      zustand.nachziehstapel.findIndex((karte) => karte.typ === 'Sonderkarte' && karte.name === 'Farbendieb'),
    ]
    const sonderkarten = [zustand.nachziehstapel[verdoppler], zustand.nachziehstapel[dieb]]
    zustand.nachziehstapel = zustand.nachziehstapel.filter((_, index) => index !== verdoppler && index !== dieb)
    fusion.unter = sonderkarten as unknown as typeof fusion.unter
    expect(verletzte(zustand)).toEqual([FUSION])
  })

  it('A6: eine schwebende Aktion gegen einen unbekannten Spieler oder eine unbekannte Schlange wird gemeldet', () => {
    const grube = mitSchwebender((karteId, spielerId) => ({ typ: 'SchlangengrubeSpielen', spielerId, karteId, zielSpielerId: 'spieler-2' }))
    expect(verletzte(grube)).toEqual([])
    if (grube.schwebend!.aktion.typ !== 'SchlangengrubeSpielen') throw new Error('Testaufbau')
    grube.schwebend!.aktion.zielSpielerId = 'niemand'
    expect(verletzte(grube)).toEqual([VERWEISE])

    const blockade = mitSchwebender(
      (karteId, spielerId) => ({ typ: 'BlockadeLegen', spielerId, karteId, schlangenId: 'schlange-1', position: 0 }),
      'Schlangenblockade',
    )
    expect(verletzte(blockade)).toEqual([])
    if (blockade.schwebend!.aktion.typ !== 'BlockadeLegen') throw new Error('Testaufbau')
    blockade.schwebend!.aktion.schlangenId = 'schlange-99'
    expect(verletzte(blockade)).toEqual([VERWEISE])
  })

  it('A6: eine schwebende Aktion, die eine Karte nennt, die nicht in der genannten Schlange liegt, wird gemeldet', () => {
    const fusion = baukasten({ spielerzahl: 3, erweiterung: false })
      .schlange(1, ['Rot', 'Rot'])
      .schwebend(
        0,
        'Farbenfusion',
        (karteId, spielerId) => ({ typ: 'FusionLegen', spielerId, karteId, schlangenId: 'schlange-1', kartenIds: ['rot-01', 'rot-02'] }),
        [1],
      )
      .zustand()
    expect(verletzte(fusion)).toEqual([])
    if (fusion.schwebend!.aktion.typ !== 'FusionLegen') throw new Error('Testaufbau')
    fusion.schwebend!.aktion.kartenIds = ['rot-01', 'rot-09']
    expect(verletzte(fusion)).toEqual([VERWEISE])
  })

  it('A6/A7.6: der Angreifer steht nie unter den Betroffenen, und eine Grube liegt nie vor dem, der sie gespielt hat', () => {
    const angreifer = mitSchwebender((karteId, spielerId) => ({ typ: 'SchlangengrubeSpielen', spielerId, karteId, zielSpielerId: 'spieler-2' }))
    angreifer.schwebend!.ausstehend = [0]
    expect(verletzte(angreifer)).toEqual([VERWEISE])
    const grube = baukasten({ spielerzahl: 2, erweiterung: false }).grube(1, 0).zustand()
    grube.ausliegendeGruben[0].vor = 1
    expect(verletzte(grube)).toEqual([VERWEISE])
  })

  it('A6: wer bei einer schwebenden Karte zweimal ausstehend steht, wird gemeldet', () => {
    const zustand = mitSchwebender((karteId, spielerId) => ({ typ: 'SchlangengrubeSpielen', spielerId, karteId, zielSpielerId: 'spieler-2' }))
    zustand.schwebend!.ausstehend = [1, 1]
    expect(verletzte(zustand)).toEqual([VERWEISE])
  })

  it('A6: ein unbekannter Aktionstyp der schwebenden Karte wird gemeldet, statt zu werfen', () => {
    const zustand = mitSchwebender((karteId, spielerId) => ({ typ: 'SchlangengrubeSpielen', spielerId, karteId, zielSpielerId: 'spieler-2' }))
    ;(zustand.schwebend!.aktion as { typ: string }).typ = 'Zaubern'
    expect(verletzte(zustand)).toEqual([VERWEISE])
  })

  it('A10: eine laufende Partie mit leerem Stapel und eine Schlussrunde mit vollem Stapel werden gemeldet', () => {
    const leer = baukasten({ spielerzahl: 2, erweiterung: false }).haendeAuffuellen().aendere((zustand) => {
      zustand.spieler[0].ablagestapel.push(...zustand.nachziehstapel.splice(0))
    })
    expect(() => leer.zustand()).toThrow(PHASE)
    const voll = start()
    voll.partiephase = 'Schlussrunde'
    voll.schlussrundeAusloeser = 0
    expect(verletzte(voll)).toEqual([PHASE])
  })

  it('A10: der Baukasten leert den Stapel für Schlussrunde und Ende auf die Ablagestapel', () => {
    const zustand = baukasten({ spielerzahl: 3, erweiterung: false }).haendeAuffuellen().schlussrunde(2).zustand()
    expect(zustand.nachziehstapel).toEqual([])
    expect(zustand.spieler.reduce((summe, spieler) => summe + spieler.ablagestapel.length, 0)).toBe(108 - 15)
  })

  it('A5: ein Schlangenzähler, der eine vergebene Schlangen-Id noch einmal erzeugen würde, wird gemeldet', () => {
    const zustand = baukasten({ spielerzahl: 2, erweiterung: false }).schlange(0, ['Blau']).zustand()
    zustand.schlangenZaehler = 0
    expect(verletzte(zustand)).toEqual([IDS])
  })

  it('A4/A8: eine Risiko-Karte auf dem Platz der Comeback-Karte wird gemeldet', () => {
    const zustand = start(true)
    const [spieler] = zustand.spieler
    const comeback = spieler.comeback!.karte
    spieler.comeback!.karte = spieler.risikoKarten[0]
    spieler.risikoKarten[0] = comeback
    expect(verletzte(zustand)).toEqual([AUSLAGE])
  })
})
