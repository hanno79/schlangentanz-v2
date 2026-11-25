// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { anwendeAktion, ermittleAktionen, ermittleEntscheider, erzeugeZufall, pruefeAktion } from '../../engine'
import type { SpielAktion, Spielzustand } from '../../engine'
import { baukasten } from '../../engine/testing/szenario'
import type { Schlangenglied } from '../../engine/testing/szenario'
import { kiWahl } from '../schritt'
import { sichtFuer } from '../sicht'
import type { Ki } from './strategie'
import { mischeVerborgenes } from '../__tests__/verborgenes'
import { aufgabenwert, jederNte, nachDurchlassen, partieZustaende, zufallszustaende } from '../__tests__/stellungen'
import { bewerte } from './bewertung'
import { erstelleSolideKi } from './solideKi'
import { erstelleZufallsKi } from './zufallsKi'
import { GRENZE_SUCHE, planeZug } from './zugsuche'

/*
K2, Kriterien 7 und 8: Die Zugsuche entscheidet nur nach der Sicht, wählt nur, was
die Engine erlaubt, und bewertet je Schritt höchstens GRENZE Stellungen.
*/

/** Kriterium 8: die im Test festgelegte Grenze für die Stellungen, die die Suche je Schritt durchrechnet und bewertet. */
const GRENZE = 64
/** Kriterium 8: die im Test festgelegte Zeitgrenze je Schritt in der ungünstigsten Stellung; gemessen rund 56 ms. */
const ZEITGRENZE_MS = 500

const gemischteKis = (anzahl: number, saat: number): Ki[] =>
  Array.from({ length: anzahl }, (_, sitz) => (sitz % 2 === 0 ? erstelleSolideKi(erzeugeZufall(saat + sitz)) : erstelleZufallsKi(erzeugeZufall(saat + sitz))))

/**
 * Wer entscheidet und mehr als eine Aktion hat; nur dort hat die KI eine Wahl. Ein
 * Zufallszustand mit angesagter Karte, über die niemand mehr entscheidet, entsteht in
 * keiner Partie; dort lehnt die Engine selbst ihre aufgezählten Reaktionen ab.
 */
function mitWahl(zustand: Spielzustand): boolean {
  const unerreichbar = zustand.schwebend !== null && zustand.schwebend.ausstehend.length === 0
  return !unerreichbar && ermittleEntscheider(zustand) !== null && ermittleAktionen(zustand).length > 1
}

/** Eine Schlange aus `anzahl` Farbkarten in wechselnden Farben, je zwei gleiche nebeneinander. */
function bunteSchlange(anzahl: number, versatz: number): Schlangenglied[] {
  const farben = ['Blau', 'Rot', 'Gelb', 'Violett', 'Braun'] as const
  return Array.from({ length: anzahl }, (_, stelle) => farben[(Math.floor(stelle / 2) + versatz) % farben.length])
}

describe('K2 Kriterium 8: jede Aktion besteht die Prüfung der Engine; je Schritt sind die durchgerechneten Stellungen begrenzt, die Vorauswahl linear und die Zeit begrenzt', () => {
  it(`K2.8: die Zugsuche rechnet je Schritt höchstens ${GRENZE_SUCHE} Stellungen durch und bewertet sie, unter der Grenze des Tests (${GRENZE})`, () => {
    expect(GRENZE_SUCHE).toBeLessThanOrEqual(GRENZE)
  })

  it(`K2.8: späte Stellung mit über tausend Aktionen aus Farbendieb und Schlangenfrass: höchstens ${GRENZE} durchgerechnete Stellungen, die Vorauswahl bewertet jede angebotene Aktion höchstens einmal, unter ${ZEITGRENZE_MS} ms je Schritt, die Aktion ist erlaubt`, () => {
    const bau = baukasten({ spielerzahl: 3, erweiterung: false, zufall: erzeugeZufall(91) })
    for (const [spieler, versatz] of [[0, 0], [0, 1], [1, 2], [1, 3], [2, 4], [2, 0]] as const) bau.schlange(spieler, bunteSchlange(9, versatz))
    const zustand = bau.hand(1, ['Farbendieb', 'Schlangenfrass', 'Regenbogenschlange', 'Schlangenblockade', 'Grün']).haendeAuffuellen().amZug(1).zustand()
    const aktionen = ermittleAktionen(zustand)
    expect(aktionen.filter((aktion) => aktion.typ === 'FarbendiebSpielen').length, 'K2.8: Farbendieb, 36 Karten × 20 Stellen').toBe(720)
    expect(aktionen.length, 'K2.8: über tausend Aktionen').toBeGreaterThan(1000)

    const dauern: number[] = []
    const plaene = [1, 2, 3].map((saat) => {
      const beginn = performance.now()
      const plan = planeZug(sichtFuer(zustand, 1), aktionen, erzeugeZufall(saat))
      dauern.push(performance.now() - beginn)
      return plan
    })
    for (const plan of plaene) {
      const { suche, vorauswahl, angeboten } = plan.bewertungen
      expect(suche, 'K2.8: durchgerechnete und bewertete Stellungen in diesem Schritt').toBeLessThanOrEqual(GRENZE)
      expect(angeboten, 'K2.8: die über tausend Aktionen gehen durch die Vorauswahl').toBeGreaterThan(1000)
      expect(vorauswahl, `K2.8: Bewertungen in der Vorauswahl bei ${angeboten} angebotenen Aktionen`).toBeLessThanOrEqual(angeboten)
      expect(pruefeAktion(zustand, plan.aktion)).toEqual({ erlaubt: true })
      expect(aktionen).toContain(plan.aktion)
    }
    for (const dauer of dauern) expect(dauer, `K2.8: Millisekunden dieses Schritts bei ${aktionen.length} Aktionen`).toBeLessThan(ZEITGRENZE_MS)
  })

  it('K2.8: in Partien mit 2 bis 4 Spielern, mit und ohne Erweiterung, ist jede gewählte Aktion erlaubt; je Schritt höchstens 64 durchgerechnete Stellungen und in der Vorauswahl höchstens eine Bewertung je angebotener Aktion', () => {
    let schritte = 0
    let hoechstens = 0
    for (const [nummer, spielerzahl] of [2, 3, 4, 2, 3, 4].entries()) {
      let zustand: Spielzustand = partieZustaende({ spielerzahl, erweiterung: nummer >= 3, saat: 700 + nummer }, gemischteKis(spielerzahl, 10 * nummer))[0]
      const zufall = erzeugeZufall(nummer)
      const gegner = gemischteKis(spielerzahl, 50 + nummer)
      for (let schritt = 0; schritt < 5000 && zustand.partiephase !== 'Beendet'; schritt += 1) {
        const entscheider = ermittleEntscheider(zustand)
        if (entscheider === null) break
        if (entscheider % 2 === 0) {
          const aktionen = ermittleAktionen(zustand)
          const plan = planeZug(sichtFuer(zustand, entscheider), aktionen, zufall)
          expect(pruefeAktion(zustand, plan.aktion), `K2.8: Partie ${nummer}, Schritt ${schritt}`).toEqual({ erlaubt: true })
          expect(aktionen).toContain(plan.aktion)
          hoechstens = Math.max(hoechstens, plan.bewertungen.suche)
          expect(plan.bewertungen.vorauswahl, `K2.8: Vorauswahl, Partie ${nummer}, Schritt ${schritt}`).toBeLessThanOrEqual(plan.bewertungen.angeboten)
          schritte += 1
          zustand = anwendeAktion(zustand, plan.aktion).zustand
        } else {
          zustand = anwendeAktion(zustand, kiWahl(zustand, gegner[entscheider])!).zustand
        }
      }
      expect(zustand.partiephase, `K2.8: Partie ${nummer} endet`).toBe('Beendet')
    }
    expect(schritte, 'K2.8: genug Schritte der soliden KI').toBeGreaterThan(300)
    expect(hoechstens, 'K2.8: höchste Zahl durchgerechneter Stellungen in einem Schritt').toBeLessThanOrEqual(GRENZE)
  }, 120_000)
})

describe('K2 Kriterium 7: keine verdeckte Information', () => {
  /** 200 Stellungen mit einer Wahl: 100 Zufallszustände und 100 aus Partien der soliden KI gegen die Zufalls-KI. */
  const STELLUNGEN: Spielzustand[] = [
    ...zufallszustaende(400, 3000).filter(mitWahl).slice(0, 100),
    ...[
      { spielerzahl: 2, erweiterung: false, saat: 41 },
      { spielerzahl: 3, erweiterung: false, saat: 42 },
      { spielerzahl: 4, erweiterung: true, saat: 43 },
      { spielerzahl: 2, erweiterung: true, saat: 44 },
    ].flatMap((partie, nummer) => jederNte(partieZustaende(partie, gemischteKis(partie.spielerzahl, 20 * nummer)).filter(mitWahl), 3).slice(0, 25)),
  ]

  /** Wie oft das Mischen den Zustand tatsächlich verändert; sonst prüfte der Test nichts. */
  function vergleiche(waehle: (zustand: Spielzustand, nummer: number) => unknown) {
    let veraendert = 0
    const abweichend: number[] = []
    for (const [nummer, zustand] of STELLUNGEN.entries()) {
      const gemischt = mischeVerborgenes(zustand, ermittleEntscheider(zustand)!, erzeugeZufall(8000 + nummer))
      if (JSON.stringify(gemischt) !== JSON.stringify(zustand)) veraendert += 1
      if (JSON.stringify(waehle(gemischt, nummer)) !== JSON.stringify(waehle(zustand, nummer))) abweichend.push(nummer)
    }
    return { veraendert, abweichend }
  }

  it('K2.7: in 200 Zufallsstellungen bleibt die Entscheidung gleich, wenn fremde Hände, Stapelreihenfolge und fremde geheime Aufgaben neu gemischt werden', () => {
    expect(STELLUNGEN).toHaveLength(200)
    const { veraendert, abweichend } = vergleiche((zustand, nummer) => kiWahl(zustand, erstelleSolideKi(erzeugeZufall(nummer))))
    expect(veraendert, 'K2.7: das Mischen verändert fast jede Stellung').toBeGreaterThan(180)
    expect(abweichend, 'K2.7: in diesen Stellungen hängt die Wahl vom Verdeckten ab').toEqual([])
  }, 60_000)

  it('K2.7 Gegenprobe: eine KI, die heimlich den echten Zustand liest, fällt in demselben Vergleich auf', () => {
    /** Wählt nach der obersten Karte des echten Nachziehstapels; die bekommt sie am Rahmen vorbei. */
    const spion = (zustand: Spielzustand): Ki => ({
      name: 'Spion',
      waehle: (_sicht, aktionen) => aktionen[(zustand.nachziehstapel[0]?.id.length ?? 0) % aktionen.length],
    })
    const { abweichend } = vergleiche((zustand) => kiWahl(zustand, spion(zustand)))
    expect(abweichend.length, 'K2.7: der Vergleich bemerkt die verdeckte Information').toBeGreaterThan(20)
  }, 60_000)
})

describe('K2, Codex-Review Iteration 2: die Vorauswahl wirft keinen höher bewerteten Zug heraus', () => {
  /** Die Bewertung nach jeder angebotenen Aktion, wenn Gegner durchlassen, wie die Zugsuche rechnet, mit den noch einzulösenden Aufgaben (K4); „Zug beenden“ behält den Stand. */
  function bewertungen(zustand: Spielzustand, sitz: number, aktionen: readonly SpielAktion[]) {
    return aktionen.map((aktion) => {
      const danach = aktion.typ === 'ZugBeenden' ? zustand : nachDurchlassen(zustand, aktion, sitz)
      return { aktion, wert: bewerte(sichtFuer(danach, sitz)) + aufgabenwert(zustand, danach, sitz) }
    })
  }

  /**
   * Eine Farbkarte ist schon gespielt; die KI an Stelle `sitz` wählt die Sonderkarte. Ohne
   * Risiko-Karten: Deren Ausgang deckt die Engine erst auf, verglichen würde mit der echten
   * obersten Karte (K4, Kriterium 4); hier geht es um die Vorauswahl der Sonderkarten.
   */
  function waehltBeste(zustand: Spielzustand, sitz: number) {
    const aktionen = ermittleAktionen(zustand).filter((aktion) => aktion.typ !== 'RisikoKarteSpielen')
    const werte = bewertungen(zustand, sitz, aktionen)
    const beste = Math.max(...werte.map(({ wert }) => wert))
    const gewaehlt = planeZug(sichtFuer(zustand, sitz), aktionen, erzeugeZufall(1)).aktion
    const wertGewaehlt = werte.find(({ aktion }) => aktion === gewaehlt)?.wert
    return { anzahl: werte.length, beste, wertGewaehlt, rang: [...werte].sort((a, b) => b.wert - a.wert).findIndex(({ aktion }) => aktion === gewaehlt) }
  }

  it('K2: zu dritt, nur Schlangenfrass: der Angriff auf den Gegner, den die Bewertung vorn sieht, wird gewählt (Gegner zählen wie in der Bewertung)', () => {
    const violett: Schlangenglied[] = ['Violett', 'Violett', 'Violett', 'Gelb', 'Violett', 'Violett', 'Violett', 'Gelb', 'Violett', 'Violett', 'Violett', 'Gelb', 'Violett', 'Violett', 'Violett']
    const zustand = baukasten({ spielerzahl: 3, erweiterung: false, zufall: erzeugeZufall(301) })
      .schlange(1, ['Blau'])
      .schlange(0, Array.from({ length: 12 }, (): Schlangenglied => 'Braun'))
      .schlange(2, violett)
      .hand(1, ['Schlangenfrass'])
      .amZug(1)
      .gespielt(1, 0)
      .zustand()
    const { anzahl, beste, wertGewaehlt, rang } = waehltBeste(zustand, 1)
    expect(anzahl, 'K2: viele Paare für Schlangenfrass c)').toBeGreaterThan(200)
    expect(wertGewaehlt, `K2: gewählt auf Rang ${rang}`).toBeCloseTo(beste, 9)
  })

  it('K2: mit Erweiterung, nur Schlangenhäutung als Sonderkarte: die eigene Häutung, die die Bewertung vorn sieht, wird gewählt (Haltewerte der übrigen Hand zählen mit)', () => {
    const zustand = baukasten({ spielerzahl: 2, erweiterung: true, zufall: erzeugeZufall(302) })
      .schlange(1, ['Rot', 'Blau', 'Rot'])
      .schlange(0, ['Grün', 'Rot', 'Gelb', 'Grün', 'Braun'])
      .hand(1, ['Schlangenhäutung', 'Violett', 'Blau', 'Blau', 'Rot'])
      .amZug(1)
      .gespielt(1, 0)
      .zustand()
    const { anzahl, beste, wertGewaehlt, rang } = waehltBeste(zustand, 1)
    expect(anzahl, 'A7.9: Häutungen in beiden Schlangen').toBeGreaterThan(16)
    expect(wertGewaehlt, `K2: gewählt auf Rang ${rang}`).toBeCloseTo(beste, 9)
  })
})
