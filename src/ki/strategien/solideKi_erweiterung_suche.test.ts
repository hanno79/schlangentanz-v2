// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { anwendeAktion, ermittleAktionen, ermittleEntscheider, erstellePartie, erzeugeZufall, pruefeAktion } from '../../engine'
import type { SpielAktion, Spielzustand } from '../../engine'
import { baukasten } from '../../engine/testing/szenario'
import type { Schlangenglied } from '../../engine/testing/szenario'
import { kiWahl } from '../schritt'
import { sichtFuer } from '../sicht'
import { mischeVerborgenes } from '../__tests__/verborgenes'
import { partieZustaende } from '../__tests__/stellungen'
import type { Ki } from './strategie'
import { erstelleSolideKi } from './solideKi'
import { planeZug } from './zugsuche'

/*
K4, Kriterium 4: K2.7 (keine verdeckte Information) und K2.8 (jede Aktion erlaubt,
die Suche begrenzt) gelten auch mit den Aktionen der Erweiterung: Risiko-Karten samt
ihren Entscheidungen, Comeback-Karte, Schlangenkorb mit seinen Boni und „Zwei Karten
abwerfen, drei ziehen“. Die Stellungen stammen aus Partien, in denen die solide KI an
jeder Stelle sitzt, damit diese Aktionen oft vorkommen.
*/

const GRENZE = 64
const ZEITGRENZE_MS = 500

/** Aktionen, die es nur mit Erweiterung gibt. */
const ERWEITERUNG = new Set<SpielAktion['typ']>(['RisikoKarteSpielen', 'Entscheiden', 'ComebackEinsetzen', 'ZweiAbwerfenDreiZiehen', 'SchlangenkorbSpielen'])

const solideAnJederStelle = (spielerzahl: number, saat: number): Ki[] => Array.from({ length: spielerzahl }, (_, sitz) => erstelleSolideKi(erzeugeZufall(saat * 10 + sitz)))

/** Wer entscheidet, hat mehr als eine Aktion, und eine davon gibt es nur mit Erweiterung. */
function mitErweiterungswahl(zustand: Spielzustand): boolean {
  const aktionen = ermittleAktionen(zustand)
  return ermittleEntscheider(zustand) !== null && aktionen.length > 1 && aktionen.some((aktion) => ERWEITERUNG.has(aktion.typ))
}

const STELLUNGEN: Spielzustand[] = [2, 3, 4, 2, 3, 4].flatMap((spielerzahl, nummer) =>
  partieZustaende({ spielerzahl, erweiterung: true, saat: 5100 + nummer }, solideAnJederStelle(spielerzahl, nummer)).filter(mitErweiterungswahl),
)

describe('K4 Kriterium 4, K2.7 mit Erweiterung: keine verdeckte Information', () => {
  it('K4.4, K2.7: in jeder Stellung mit einer Wahl der Erweiterung bleibt die Entscheidung gleich, wenn fremde Hände, Stapelreihenfolge und fremde geheime Aufgaben neu gemischt werden', () => {
    expect(STELLUNGEN.length, 'Testaufbau: genug Stellungen').toBeGreaterThan(100)
    for (const typ of ['RisikoKarteSpielen', 'Entscheiden', 'SchlangenkorbSpielen'] as const) {
      expect(STELLUNGEN.filter((zustand) => ermittleAktionen(zustand).some((aktion) => aktion.typ === typ)).length, `Testaufbau: Stellungen mit ${typ}`).toBeGreaterThan(5)
    }
    let veraendert = 0
    const abweichend: number[] = []
    for (const [nummer, zustand] of STELLUNGEN.entries()) {
      const gemischt = mischeVerborgenes(zustand, ermittleEntscheider(zustand)!, erzeugeZufall(8500 + nummer))
      if (JSON.stringify(gemischt) !== JSON.stringify(zustand)) veraendert += 1
      const wahl = (stand: Spielzustand) => JSON.stringify(kiWahl(stand, erstelleSolideKi(erzeugeZufall(nummer))))
      if (wahl(gemischt) !== wahl(zustand)) abweichend.push(nummer)
    }
    expect(veraendert, 'K2.7: das Mischen verändert fast jede Stellung').toBeGreaterThan(0.9 * STELLUNGEN.length)
    expect(abweichend, 'K2.7: in diesen Stellungen hängt die Wahl vom Verdeckten ab').toEqual([])
  }, 240_000)
})

/** Eine Schlange aus `anzahl` Farbkarten in wechselnden Farben, je zwei gleiche nebeneinander. */
function bunteSchlange(anzahl: number, versatz: number): Schlangenglied[] {
  const farben = ['Blau', 'Rot', 'Gelb', 'Violett', 'Braun'] as const
  return Array.from({ length: anzahl }, (_, stelle) => farben[(Math.floor(stelle / 2) + versatz) % farben.length])
}

describe('K4 Kriterium 4, K2.8 mit Erweiterung: jede Aktion erlaubt, die Suche begrenzt', () => {
  it(`K4.4, K2.8: Schlangenkorb in einer späten Stellung mit Tausenden Tauschen: höchstens ${GRENZE} durchgerechnete Stellungen, die Vorauswahl bewertet jede angebotene Aktion höchstens einmal, unter ${ZEITGRENZE_MS} ms je Schritt, die Aktion ist erlaubt`, () => {
    const zustand = baukasten({ spielerzahl: 2, erweiterung: true, zufall: erzeugeZufall(94) })
      .schlange(1, bunteSchlange(18, 0))
      .schlange(1, bunteSchlange(18, 2))
      .schlange(0, bunteSchlange(10, 1))
      .hand(1, ['Schlangenkorb des Glücks', 'Blau', 'Rot', 'Gelb', 'Grün'])
      .haendeAuffuellen()
      .amZug(1)
      .zugbeginn()
      .zustand()
    const aktionen = ermittleAktionen(zustand)
    const tausche = aktionen.filter((aktion) => aktion.typ === 'SchlangenkorbSpielen' && aktion.bonus.art === 'tauschen')
    expect(tausche.length, 'Testaufbau: Tausende Korb-Tausche (D44)').toBeGreaterThan(5000)
    for (const saat of [1, 2, 3]) {
      const beginn = performance.now()
      const plan = planeZug(sichtFuer(zustand, 1), aktionen, erzeugeZufall(saat))
      const dauer = performance.now() - beginn
      const { suche, vorauswahl, angeboten } = plan.bewertungen
      expect(suche, 'K2.8: durchgerechnete und bewertete Stellungen').toBeLessThanOrEqual(GRENZE)
      expect(vorauswahl, `K2.8: Bewertungen in der Vorauswahl bei ${angeboten} angebotenen Aktionen`).toBeLessThanOrEqual(angeboten)
      expect(pruefeAktion(zustand, plan.aktion)).toEqual({ erlaubt: true })
      expect(aktionen).toContain(plan.aktion)
      expect(dauer, `K2.8: Millisekunden dieses Schritts bei ${aktionen.length} Aktionen`).toBeLessThan(ZEITGRENZE_MS)
    }
  })

  it(`K4.4, K2.8: in Partien mit Erweiterung, die solide KI an jeder Stelle: jede gewählte Aktion ist erlaubt, je Schritt höchstens ${GRENZE} durchgerechnete Stellungen und in der Vorauswahl höchstens eine Bewertung je angebotener Aktion`, () => {
    let schritte = 0
    const gesehen = new Set<SpielAktion['typ']>()
    for (const [nummer, spielerzahl] of [2, 3, 4].entries()) {
      let zustand = erstellePartie({ spielerzahl, erweiterung: true, zufall: erzeugeZufall(5200 + nummer) })
      const zufall = erzeugeZufall(5300 + nummer)
      for (let schritt = 0; schritt < 5000 && zustand.partiephase !== 'Beendet'; schritt += 1) {
        const entscheider = ermittleEntscheider(zustand)
        if (entscheider === null) break
        const aktionen = ermittleAktionen(zustand)
        const plan = planeZug(sichtFuer(zustand, entscheider), aktionen, zufall)
        expect(pruefeAktion(zustand, plan.aktion), `K2.8: Partie ${nummer}, Schritt ${schritt}`).toEqual({ erlaubt: true })
        expect(aktionen).toContain(plan.aktion)
        expect(plan.bewertungen.suche, `K2.8: Partie ${nummer}, Schritt ${schritt}`).toBeLessThanOrEqual(GRENZE)
        expect(plan.bewertungen.vorauswahl, `K2.8: Vorauswahl, Partie ${nummer}, Schritt ${schritt}`).toBeLessThanOrEqual(plan.bewertungen.angeboten)
        gesehen.add(plan.aktion.typ)
        schritte += 1
        zustand = anwendeAktion(zustand, plan.aktion).zustand
      }
      expect(zustand.partiephase, `K2.8: Partie ${nummer} endet`).toBe('Beendet')
    }
    expect(schritte, 'K2.8: genug Schritte der soliden KI').toBeGreaterThan(300)
    expect([...gesehen].filter((typ) => ERWEITERUNG.has(typ)).sort(), 'Testaufbau: Aktionen der Erweiterung kamen vor').toEqual(expect.arrayContaining(['Entscheiden', 'RisikoKarteSpielen', 'SchlangenkorbSpielen']))
  }, 240_000)
})
