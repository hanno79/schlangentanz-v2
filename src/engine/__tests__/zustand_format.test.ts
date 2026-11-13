import { describe, expect, it } from 'vitest'
import { erstellePartie, serialisiere } from '../index'
import { baukasten } from '../testing/szenario'
import { erzeugeZufall } from '../testing/zufall'

function start(erweiterung: boolean) {
  return erstellePartie({ spielerzahl: 3, erweiterung, zufall: erzeugeZufall(3) })
}

describe('A1/A5/A10: Zustand im Format 2', () => {
  it('A1: der Zustand trägt Format 2 und den Erweiterungs-Schalter der Partie', () => {
    expect(start(false).version).toBe(2)
    expect(start(false).erweiterung).toBe(false)
    expect(start(true).erweiterung).toBe(true)
  })

  it('A5/A7.8: der Zug nennt den Spieler und den Teilzug 1 oder 2, dazu was in diesem Teilzug gespielt ist', () => {
    expect(start(false).zug).toEqual({
      spielerIndex: 0,
      teilzug: 1,
      gespielteFarbkarten: 0,
      gespielteSonderkarten: 0,
      verdopplerGespielt: false,
      farbenfusionGespielt: false,
      abschnitt: 'Ausspielen',
    })
    const zweiterZug = baukasten({ spielerzahl: 2, erweiterung: false }).amZug(1, 2).zustand()
    expect(zweiterZug.zug).toMatchObject({ spielerIndex: 1, teilzug: 2 })
  })

  it('A10: die Partiephase ist Laufend, Schlussrunde oder Beendet; die Schlussrunde kennt ihren Auslöser', () => {
    expect(start(false).partiephase).toBe('Laufend')
    const schluss = baukasten({ spielerzahl: 3, erweiterung: false }).schlussrunde(1).zustand()
    expect(schluss.partiephase).toBe('Schlussrunde')
    expect(schluss.schlussrundeAusloeser).toBe(1)
    const beendet = baukasten({ spielerzahl: 3, erweiterung: false }).beendet(2).zustand()
    expect(beendet.partiephase).toBe('Beendet')
  })

  it('A6/A7.6/A7.7/A7.10: schwebende Karte, ausliegende Schlangengruben, Karten unter einer Farbenfusion und Karten aus dem Spiel haben ihren Platz', () => {
    const zustand = baukasten({ spielerzahl: 3, erweiterung: true })
      .schlange(0, ['Blau', { fusion: ['Gelb', 'Gelb'] }])
      .grube(0, 2)
      .ausDemSpiel(['Schlangenkorb des Glücks'])
      .schwebend(1, 'Verdoppler', (karteId, spielerId) => ({ typ: 'VerdopplerSpielen', spielerId, karteId }), [])
      .zustand()

    const [fusion] = zustand.spieler[0].schlangen[0].fusionen
    expect(fusion.unter.map((karte) => karte.typ === 'Farbkarte' && karte.farbe)).toEqual(['Gelb', 'Gelb'])
    expect(zustand.spieler[0].schlangen[0].karten.map((karte) => (karte.typ === 'Sonderkarte' ? karte.name : karte.farbe))).toEqual([
      'Blau',
      'Farbenfusion',
    ])
    expect(zustand.ausliegendeGruben).toEqual([
      { karte: expect.objectContaining({ name: 'Schlangengrube' }), gespieltVon: 0, vor: 2 },
    ])
    expect(zustand.ausDemSpiel.map((karte) => karte.id)).toEqual(['schlangenkorb-des-gluecks-01'])
    expect(zustand.schwebend?.karte.name).toBe('Verdoppler')
    expect(zustand.schwebend?.aktion.typ).toBe('VerdopplerSpielen')
  })

  it('A4: entfernt sind Schlangenzustand, gemeinsamer Ablagestapel, Verdoppler-Bonus, Nachzieh-Berechtigte und Endspurt-Verdopplung', () => {
    const zustand = baukasten({ spielerzahl: 2, erweiterung: true }).schlange(0, ['Rot']).zustand()
    expect(Object.keys(zustand.spieler[0].schlangen[0]).sort()).toEqual(['fusionen', 'id', 'karten'])
    const json = serialisiere(zustand)
    for (const entfernt of [
      '"zustand"',
      '"verdopplerBonusAktiv"',
      '"nachziehBerechtigteIndizes"',
      '"endspurtVerdoppelteAufgabenIds"',
      '"pendingReaktion"',
      '"zugphase"',
      '"spielphase"',
    ]) {
      expect(json, `A4: Feld ${entfernt} gehört nicht mehr zum Zustand`).not.toContain(entfernt)
    }
    expect(Object.keys(zustand)).not.toContain('ablagestapel')
  })
})
