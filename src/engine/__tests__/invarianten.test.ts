import { describe, expect, it } from 'vitest'
import { erstellePartie, pruefeInvarianten } from '../index'
import type { Spielzustand } from '../index'
import { baukasten } from '../testing/szenario'
import { erzeugeZufall } from '../testing/zufall'

const KARTEN = 'Jede Spielkarte liegt genau einmal an genau einem Ort'
const AUFGABEN = 'Jede Aufgabenkarte liegt genau einmal im Spiel'
const AUSLAGE = 'Jede Comeback- und Risiko-Karte liegt genau einmal im Spiel'
const ZWEI_SCHLANGEN = 'Kein Spieler hat mehr als 2 Schlangen'
const LEERE_SCHLANGE = 'Keine Schlange ist leer'
const IDS = 'Alle Ids sind eindeutig'
const FUSION = 'Jede Farbenfusion deckt zwei Farbkarten gleicher Farbe'
const VERWEISE = 'Alle Verweise auf Spieler und Karten sind gültig'
const PHASE = 'Partiephase und Schlussrunde passen zusammen'

function verletzte(zustand: Spielzustand): string[] {
  return pruefeInvarianten(zustand)
    .filter((befund) => befund.verletzt)
    .map((befund) => befund.name)
}

function detail(zustand: Spielzustand, name: string): string {
  return pruefeInvarianten(zustand).find((befund) => befund.name === name)?.detail ?? ''
}

function start(erweiterung = false, spielerzahl = 2): Spielzustand {
  return erstellePartie({ spielerzahl, erweiterung, zufall: erzeugeZufall(5) })
}

/** Ein gebauter Zustand mit Schlangen, Fusion, Grube und Ablage, an dem jede Prüfung etwas zu tun hat. */
function belebt(): Spielzustand {
  return baukasten({ spielerzahl: 3, erweiterung: true })
    .schlange(0, ['Blau', { fusion: ['Rot', 'Rot'] }, 'Gelb'])
    .schlange(1, ['Grün'])
    .ablage(2, ['Farbendieb'])
    .grube(1, 2)
    .haendeAuffuellen()
    .zustand()
}

describe('A1/A4: pruefeInvarianten', () => {
  it('A4: nennt jede Invariante mit Namen, auch die erfüllten', () => {
    expect(pruefeInvarianten(start()).map((befund) => befund.name)).toEqual([
      KARTEN,
      AUFGABEN,
      AUSLAGE,
      ZWEI_SCHLANGEN,
      LEERE_SCHLANGE,
      IDS,
      FUSION,
      VERWEISE,
      PHASE,
    ])
    expect(verletzte(start())).toEqual([])
    expect(verletzte(start(true, 4))).toEqual([])
    expect(verletzte(belebt())).toEqual([])
  })
})

describe('A1/A4: jede Karte genau einmal an genau einem Ort', () => {
  it('A4: eine doppelt liegende Karte wird mit Id gemeldet', () => {
    const zustand = start()
    const karte = zustand.spieler[0].hand[0]
    zustand.spieler[1].ablagestapel.push(karte)
    expect(verletzte(zustand)).toContain(KARTEN)
    expect(detail(zustand, KARTEN)).toContain(`${karte.id} (2×)`)
  })

  it('A4: eine verschwundene Karte wird mit Id gemeldet', () => {
    const zustand = start()
    const karte = zustand.nachziehstapel.pop()!
    expect(verletzte(zustand)).toEqual([KARTEN])
    expect(detail(zustand, KARTEN)).toContain(`Fehlt: ${karte.id}`)
  })

  it('A1: eine veränderte Karte wird gemeldet', () => {
    const zustand = start()
    const index = zustand.nachziehstapel.findIndex((karte) => karte.typ === 'Farbkarte')
    const karte = zustand.nachziehstapel[index]
    if (karte.typ !== 'Farbkarte') throw new Error('Testaufbau: Farbkarte erwartet')
    zustand.nachziehstapel[index] = { ...karte, punkte: karte.punkte + 1 }
    expect(verletzte(zustand)).toEqual([KARTEN])
    expect(detail(zustand, KARTEN)).toContain(`Verändert: ${karte.id}`)
  })

  it('A1: eine Erweiterungskarte in einer Partie ohne Erweiterung wird gemeldet', () => {
    const zustand = start()
    zustand.nachziehstapel.push({ typ: 'Sonderkarte', id: 'schlangenhaeutung-01', name: 'Schlangenhäutung' })
    expect(verletzte(zustand)).toEqual([KARTEN])
    expect(detail(zustand, KARTEN)).toContain('Unbekannt: schlangenhaeutung-01')
  })

  it('A7.7: auch Karten unter einer Fusion, in ausliegenden Gruben und aus dem Spiel zählen mit', () => {
    const zustand = belebt()
    const unter = zustand.spieler[0].schlangen[0].fusionen[0].unter[0]
    zustand.spieler[2].hand.push(unter)
    expect(detail(zustand, KARTEN)).toContain(`${unter.id} (2×)`)
    const grube = belebt()
    grube.ausDemSpiel.push(grube.ausliegendeGruben[0].karte)
    expect(detail(grube, KARTEN)).toContain(`${grube.ausliegendeGruben[0].karte.id} (2×)`)
  })
})

describe('A4/A9: jede Aufgabenkarte genau einmal', () => {
  it('A9: eine verschwundene Aufgabe wird gemeldet', () => {
    const zustand = start(true)
    const aufgabe = zustand.aufgabenStapel.pop()!
    expect(verletzte(zustand)).toEqual([AUFGABEN])
    expect(detail(zustand, AUFGABEN)).toContain(aufgabe.id)
  })

  it('A4: Aufgaben in einer Partie ohne Erweiterung werden gemeldet', () => {
    const zustand = start(false)
    zustand.offeneAufgaben.push({ ...start(true).offeneAufgaben[0] })
    expect(verletzte(zustand)).toEqual([AUFGABEN])
  })

  it('A4: mehr als 3 offene Aufgaben oder ein Spieler ohne geheime Aufgabe werden gemeldet', () => {
    const zuViele = start(true)
    zuViele.offeneAufgaben.push(zuViele.aufgabenStapel.shift()!)
    expect(verletzte(zuViele)).toEqual([AUFGABEN])
    const ohneGeheime = start(true)
    ohneGeheime.aufgabenStapel.push(ohneGeheime.spieler[1].geheimeAufgabe!)
    ohneGeheime.spieler[1].geheimeAufgabe = null
    expect(verletzte(ohneGeheime)).toEqual([AUFGABEN])
  })
})

describe('A4/A8: Comeback- und Risiko-Karten', () => {
  it('A8.2: eine doppelte oder fehlende Risiko-Karte wird gemeldet', () => {
    const doppelt = start(true)
    doppelt.spieler[1].risikoKarten.push(doppelt.spieler[0].risikoKarten[0])
    expect(verletzte(doppelt)).toContain(AUSLAGE)
    const fehlt = start(true)
    fehlt.spieler[0].risikoKarten.pop()
    expect(verletzte(fehlt)).toEqual([AUSLAGE])
  })

  it('A8.2: eine gespielte Risiko-Karte darf aus dem Spiel liegen', () => {
    const zustand = start(true)
    zustand.ausDemSpiel.push(zustand.spieler[0].risikoKarten.pop()!)
    expect(verletzte(zustand)).toEqual([])
  })

  it('A4: eine Comeback-Karte ohne Erweiterung wird gemeldet', () => {
    const zustand = start(false)
    zustand.spieler[0].comeback = { karte: { typ: 'Comeback', id: 'comeback-01' }, verbraucht: false }
    expect(verletzte(zustand)).toEqual([AUSLAGE])
  })
})

describe('A5: Schlangen', () => {
  it('A5: ein Spieler mit 3 Schlangen wird gemeldet', () => {
    const zustand = baukasten({ spielerzahl: 2, erweiterung: false })
      .schlange(0, ['Blau'])
      .schlange(0, ['Rot'])
      .aendere((z) => {
        const gelb = z.nachziehstapel.findIndex((karte) => karte.typ === 'Farbkarte' && karte.farbe === 'Gelb')
        z.spieler[0].schlangen.push({ id: 'schlange-99', karten: z.nachziehstapel.splice(gelb, 1), fusionen: [] })
      })
    expect(() => zustand.zustand()).toThrow(ZWEI_SCHLANGEN)
  })

  it('A5: eine leere Schlange wird gemeldet', () => {
    const zustand = belebt()
    const [blau, fusion, gelb] = zustand.spieler[0].schlangen[0].karten
    zustand.spieler[0].hand.push(blau, gelb)
    zustand.spieler[0].ablagestapel.push(fusion, ...zustand.spieler[0].schlangen[0].fusionen[0].unter)
    zustand.spieler[0].schlangen[0] = { ...zustand.spieler[0].schlangen[0], karten: [], fusionen: [] }
    expect(verletzte(zustand)).toEqual([LEERE_SCHLANGE])
  })
})

describe('A4: eindeutige Ids', () => {
  it('A4: zwei Schlangen mit derselben Id werden gemeldet', () => {
    const zustand = belebt()
    zustand.spieler[1].schlangen[0].id = zustand.spieler[0].schlangen[0].id
    expect(verletzte(zustand)).toEqual([IDS])
    expect(detail(zustand, IDS)).toContain(zustand.spieler[0].schlangen[0].id)
  })

  it('A4: zwei Spieler mit derselben Id und eine Schlange mit der Id einer Karte werden gemeldet', () => {
    const spieler = start()
    spieler.spieler[1].id = spieler.spieler[0].id
    expect(verletzte(spieler)).toContain(IDS)
    const schlange = belebt()
    schlange.spieler[1].schlangen[0].id = schlange.spieler[1].schlangen[0].karten[0].id
    expect(verletzte(schlange)).toEqual([IDS])
  })
})

describe('A7.7: Farbenfusion', () => {
  it('A7.7: eine Fusionskarte ohne die zwei Karten darunter wird gemeldet', () => {
    const zustand = belebt()
    const [fusion] = zustand.spieler[0].schlangen[0].fusionen
    zustand.spieler[0].ablagestapel.push(...fusion.unter)
    zustand.spieler[0].schlangen[0].fusionen = []
    expect(verletzte(zustand)).toEqual([FUSION])
  })

  it('A7.7: Karten unter einer Fusion, die nicht in der Schlange liegt, werden gemeldet', () => {
    const zustand = belebt()
    const schlange = zustand.spieler[0].schlangen[0]
    const fusionskarte = schlange.karten.splice(1, 1)[0]
    zustand.spieler[0].ablagestapel.push(fusionskarte)
    expect(verletzte(zustand)).toEqual([FUSION])
  })

  it('A7.7: zwei Karten verschiedener Farbe unter einer Fusion werden gemeldet', () => {
    const zustand = belebt()
    const schlange = zustand.spieler[0].schlangen[0]
    const gelb = schlange.karten[2]
    if (gelb.typ !== 'Farbkarte') throw new Error('Testaufbau: Farbkarte erwartet')
    const rot = schlange.fusionen[0].unter[1]
    schlange.fusionen[0].unter[1] = gelb
    schlange.karten[2] = rot
    expect(verletzte(zustand)).toEqual([FUSION])
  })
})

describe('A5/A6/A7.6: Verweise', () => {
  it('A5: ein Zug für einen Spieler, den es nicht gibt, wird gemeldet', () => {
    const zustand = start()
    zustand.zug.spielerIndex = 5
    expect(verletzte(zustand)).toEqual([VERWEISE])
  })

  it('A7.6: eine Schlangengrube vor einem Spieler, den es nicht gibt, wird gemeldet', () => {
    const zustand = belebt()
    zustand.ausliegendeGruben[0].vor = 9
    expect(verletzte(zustand)).toEqual([VERWEISE])
  })

  it('A6: eine schwebende Karte, die nicht zu ihrer Aktion passt, oder ein unbekannter Betroffener wird gemeldet', () => {
    const bau = () =>
      baukasten({ spielerzahl: 3, erweiterung: false })
        .schwebend(0, 'Schlangengrube', (karteId, spielerId) => ({ typ: 'SchlangengrubeSpielen', spielerId, karteId, zielSpielerId: 'spieler-2' }), [1])
        .zustand()
    const andereKarte = bau()
    andereKarte.schwebend!.aktion.karteId = 'schlangengrube-02'
    expect(verletzte(andereKarte)).toEqual([VERWEISE])
    const unbekannt = bau()
    unbekannt.schwebend!.ausstehend = [7]
    expect(verletzte(unbekannt)).toEqual([VERWEISE])
  })
})

describe('A10: Partiephase', () => {
  it('A10: eine laufende Partie mit Schlussrunden-Auslöser oder eine Schlussrunde ohne ihn wird gemeldet', () => {
    const laufend = start()
    laufend.schlussrundeAusloeser = 1
    expect(verletzte(laufend)).toEqual([PHASE])
    const schluss = start()
    schluss.partiephase = 'Schlussrunde'
    expect(verletzte(schluss)).toEqual([PHASE])
  })

  it('A10: eine beendete Partie mit schwebender Karte wird gemeldet', () => {
    const zustand = baukasten({ spielerzahl: 2, erweiterung: false })
      .schwebend(0, 'Verdoppler', (karteId, spielerId) => ({ typ: 'VerdopplerSpielen', spielerId, karteId }), [])
      .zustand()
    zustand.partiephase = 'Beendet'
    zustand.schlussrundeAusloeser = 0
    expect(verletzte(zustand)).toEqual([PHASE])
  })
})
