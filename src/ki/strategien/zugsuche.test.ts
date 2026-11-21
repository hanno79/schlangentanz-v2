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
import { jederNte, nachDurchlassen, partieZustaende, zufallszustaende } from '../__tests__/stellungen'
import { bewerte } from './bewertung'
import { erstelleSolideKi } from './solideKi'
import { erstelleZufallsKi } from './zufallsKi'
import { GRENZE_BEWERTUNGEN, planeZug } from './zugsuche'

/*
K2, Kriterien 7 und 8: Die Zugsuche entscheidet nur nach der Sicht, wählt nur, was
die Engine erlaubt, und bewertet je Schritt höchstens GRENZE Stellungen.
*/

/** Kriterium 8: die im Test festgelegte Grenze für die Bewertungen je Schritt. */
const GRENZE = 64

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

describe('K2 Kriterium 8: jede Aktion besteht die Prüfung der Engine, die Bewertungen je Schritt sind begrenzt', () => {
  it(`K2.8: die Zugsuche bewertet je Schritt höchstens ${GRENZE_BEWERTUNGEN} Stellungen, unter der Grenze des Tests (${GRENZE})`, () => {
    expect(GRENZE_BEWERTUNGEN).toBeLessThanOrEqual(GRENZE)
  })

  it('K2.8: späte Stellung, in der Farbendieb und Schlangenfrass über tausend Ziele haben: die Grenze hält, die Aktion ist erlaubt', () => {
    const bau = baukasten({ spielerzahl: 3, erweiterung: false, zufall: erzeugeZufall(91) })
    for (const [spieler, versatz] of [[0, 0], [0, 1], [1, 2], [1, 3], [2, 4], [2, 0]] as const) bau.schlange(spieler, bunteSchlange(9, versatz))
    const zustand = bau.hand(1, ['Farbendieb', 'Schlangenfrass', 'Regenbogenschlange', 'Schlangenblockade', 'Grün']).haendeAuffuellen().amZug(1).zustand()
    const aktionen = ermittleAktionen(zustand)
    expect(aktionen.filter((aktion) => aktion.typ === 'FarbendiebSpielen').length, 'K2.8: Farbendieb, 36 Karten × 20 Stellen').toBe(720)
    expect(aktionen.length, 'K2.8: über tausend Aktionen').toBeGreaterThan(1000)

    const plan = planeZug(sichtFuer(zustand, 1), aktionen, erzeugeZufall(1))
    expect(plan.bewertungen, 'K2.8: Bewertungen in diesem Schritt').toBeLessThanOrEqual(GRENZE)
    expect(pruefeAktion(zustand, plan.aktion)).toEqual({ erlaubt: true })
    expect(aktionen).toContain(plan.aktion)
  })

  it('K2.8: in Partien mit 2 bis 4 Spielern, mit und ohne Erweiterung, ist jede gewählte Aktion erlaubt und jeder Schritt unter der Grenze', () => {
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
          hoechstens = Math.max(hoechstens, plan.bewertungen)
          schritte += 1
          zustand = anwendeAktion(zustand, plan.aktion).zustand
        } else {
          zustand = anwendeAktion(zustand, kiWahl(zustand, gegner[entscheider])!).zustand
        }
      }
      expect(zustand.partiephase, `K2.8: Partie ${nummer} endet`).toBe('Beendet')
    }
    expect(schritte, 'K2.8: genug Schritte der soliden KI').toBeGreaterThan(300)
    expect(hoechstens, 'K2.8: höchste Zahl der Bewertungen in einem Schritt').toBeLessThanOrEqual(GRENZE)
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
  /** Die Bewertung nach jeder angebotenen Aktion, wenn Gegner durchlassen, wie die Zugsuche rechnet; „Zug beenden“ behält den Stand. */
  function bewertungen(zustand: Spielzustand, sitz: number, aktionen: readonly SpielAktion[]) {
    return aktionen.map((aktion) => ({
      aktion,
      wert: bewerte(sichtFuer(aktion.typ === 'ZugBeenden' ? zustand : nachDurchlassen(zustand, aktion, sitz), sitz)),
    }))
  }

  /** Eine Farbkarte ist schon gespielt; die KI an Stelle `sitz` wählt die Sonderkarte. */
  function waehltBeste(zustand: Spielzustand, sitz: number) {
    const aktionen = ermittleAktionen(zustand)
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
      .aendere((stand) => (stand.zug.gespielteFarbkarten = 1))
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
      .aendere((stand) => (stand.zug.gespielteFarbkarten = 1))
      .zustand()
    const { anzahl, beste, wertGewaehlt, rang } = waehltBeste(zustand, 1)
    expect(anzahl, 'A7.9: Häutungen in beiden Schlangen').toBeGreaterThan(16)
    expect(wertGewaehlt, `K2: gewählt auf Rang ${rang}`).toBeCloseTo(beste, 9)
  })
})
