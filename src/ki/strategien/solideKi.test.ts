// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { anwendeAktion, berechneEndwertung, berechneZwischenstand, ermittleAktionen, erzeugeZufall, werteSchlangen } from '../../engine'
import { baukasten } from '../../engine/testing/szenario'
import type { Ereignis, SpielAktion, Spielzustand } from '../../engine'
import { findeSzenario } from '../../entwicklung/szenarien'
import { naechsterKiSchritt } from '../schritt'
import { entscheiderVon, sichtFuer } from '../sicht'
import { aufgabenwert, entscheidungenVon, mitZweiterKarte, nachDurchlassen } from '../__tests__/stellungen'
import type { Entscheidung } from '../__tests__/stellungen'
import type { Schlangenglied } from '../../engine/testing/szenario'
import { bewerte } from './bewertung'
import { STRATEGIEN } from './index'
import { erstelleSolideKi } from './solideKi'
import { erstelleZufallsKi } from './zufallsKi'

/*
K2, Kriterien 1 bis 6, als Szenariotests: dieselben Szenarien stehen am
Entwicklertisch (`src/entwicklung/szenarienKi.ts`). In jedem ist KI-Gegner 1
(Stelle 1) am Zug; gespielt wird sein ganzer Zug. Dazu Eigenschaften, die in
Partien gegen die Zufalls-KI für jede Entscheidung der soliden KI gelten.
*/

const KI = 'spieler-2'

interface Zug {
  /** Die Aktionen von KI-Gegner 1 in diesem Zug, auch über einen Verdoppler hinweg. */
  aktionen: SpielAktion[]
  ereignisse: Ereignis[]
  zustand: Spielzustand
}

function szenario(name: string): Spielzustand {
  const gefunden = findeSzenario(name)
  if (gefunden === undefined) throw new Error(`Testaufbau: Szenario ${name} fehlt`)
  return gefunden.erzeuge()
}

/** Spielt den Zug von KI-Gegner 1 im Szenario `name` (oder ab `start`) mit der soliden KI; ein gefragter Mensch lässt durch. */
function spieleZug(name: string, saat = 1, start = szenario(name)): Zug {
  let zustand = start
  const ki = erstelleSolideKi(erzeugeZufall(saat))
  const zug: Zug = { aktionen: [], ereignisse: [], zustand }
  while (zustand.partiephase !== 'Beendet' && zustand.zug.spielerIndex === 1) {
    const entscheider = entscheiderVon(zustand)
    const aktion =
      entscheider?.steuerung === 'KI' ? naechsterKiSchritt(zustand, ki) : ermittleAktionen(zustand).find((angeboten) => angeboten.typ === 'Reagieren' && angeboten.farbenschutzId === null)
    if (aktion == null) throw new Error(`Testaufbau: In ${name} entscheidet ${entscheider?.name ?? 'niemand'} ohne Aktion.`)
    const schritt = anwendeAktion(zustand, aktion)
    if (aktion.spielerId === KI) zug.aktionen.push(aktion)
    zug.ereignisse.push(...schritt.ereignisse)
    zustand = schritt.zustand
  }
  return { ...zug, zustand }
}

/** Die Punkte, die der Spieler bei Spielende jetzt hätte, mit Kettenbonus (A11). */
function endpunkte(zustand: Spielzustand, sitz: number): number {
  return berechneEndwertung(zustand).spieler[sitz].summe
}

function punkte(zustand: Spielzustand, sitz: number): number {
  return berechneZwischenstand(zustand, zustand.spieler[sitz].id).spieler[sitz].summe
}

/** Wie viele Farbgruppen der Spieler hat (A11); eine vollendete Dreiergruppe erhöht die Zahl. */
function gruppenzahl(zustand: Spielzustand, sitz: number): number {
  return werteSchlangen(zustand.spieler[sitz].schlangen, zustand.erweiterung).schlangen.reduce((summe, schlange) => summe + schlange.gruppen.length, 0)
}

const farben = (zustand: Spielzustand, sitz: number) =>
  zustand.spieler[sitz].schlangen.map((schlange) => schlange.karten.map((karte) => (karte.typ === 'Farbkarte' ? karte.farbe : karte.name)))

const typen = (zug: Zug) => zug.aktionen.map((aktion) => aktion.typ)

/** Partien der soliden KI an Stelle 0 gegen Zufalls-KIs, 2 bis 4 Spieler, mit und ohne Erweiterung. */
const PARTIEN = [2, 2, 2, 2, 3, 3, 3, 4, 4, 4].map((spielerzahl, nummer) => ({ spielerzahl, erweiterung: nummer % 2 === 1, saat: 600 + nummer }))
const ENTSCHEIDUNGEN: Entscheidung[][] = PARTIEN.map((partie, nummer) =>
  entscheidungenVon(
    partie,
    Array.from({ length: partie.spielerzahl }, (_, sitz) => (sitz === 0 ? erstelleSolideKi(erzeugeZufall(nummer)) : erstelleZufallsKi(erzeugeZufall(100 * nummer + sitz)))),
    0,
  ),
)
const ALLE = ENTSCHEIDUNGEN.flat()

/** Die Entscheidungen einer Partie, Zug für Zug: ein Zug endet mit „Zug beenden“ oder dem Abwerfen danach. */
function zuege(entscheidungen: readonly Entscheidung[]): Entscheidung[][] {
  const ergebnis: Entscheidung[][] = [[]]
  for (const entscheidung of entscheidungen) {
    if (entscheidung.aktion.typ === 'Reagieren') continue
    ergebnis[ergebnis.length - 1].push(entscheidung)
    if (entscheidung.nachher.zug.spielerIndex !== 0 || entscheidung.nachher.partiephase === 'Beendet') ergebnis.push([])
  }
  return ergebnis.filter((zug) => zug.length > 0)
}

describe('K2: die solide KI steht in der Registry', () => {
  it('U5: STRATEGIEN.solideKi ist die Fabrik der soliden KI', () => {
    expect(STRATEGIEN.solideKi).toBe(erstelleSolideKi)
    expect(erstelleSolideKi(erzeugeZufall(1)).name).toBe('Solide KI')
  })

  it(`K2: in ${PARTIEN.length} Partien gegen die Zufalls-KI enden alle, und die solide KI gewinnt die meisten`, () => {
    const gewonnen = ENTSCHEIDUNGEN.filter((entscheidungen) => {
      const ende = entscheidungen[entscheidungen.length - 1].nachher
      const stand = PARTIEN.length > 0 ? berechneZwischenstand(ende, ende.spieler[0].id).spieler.map((spieler) => spieler.summe) : []
      return stand[0] === Math.max(...stand)
    })
    expect(gewonnen.length).toBeGreaterThanOrEqual(8)
  })
})

describe('K2 Kriterium 1: Kann sie mit einer Handkarte eine Dreiergruppe vollenden, tut sie es', () => {
  it('K2.1: ki-dreiergruppe: sie legt das Violett an ihr Paar, Gruppe mit 6 Punkten', () => {
    const zug = spieleZug('ki-dreiergruppe')
    expect(zug.aktionen[0], 'K2.1: erste Aktion').toMatchObject({ typ: 'FarbkarteLegen', ziel: { art: 'schlange', schlangenId: 'schlange-1' } })
    expect(farben(zug.zustand, 1)).toEqual([['Violett', 'Violett', 'Violett']])
    expect(punkte(zug.zustand, 1)).toBe(6)
  })

  it('K2.1: ki-dreiergruppe-joker: ohne passende Farbkarte vollendet sie die grüne Gruppe mit der Regenbogenschlange', () => {
    const zug = spieleZug('ki-dreiergruppe-joker')
    const regenbogen = zug.aktionen.find((aktion) => aktion.typ === 'RegenbogenschlangeLegen')
    expect(regenbogen, 'K2.1: sie spielt die Regenbogenschlange').toMatchObject({ schlangenId: 'schlange-1' })
    expect(punkte(zug.zustand, 1), 'K2.1: Grün, Grün, Regenbogenschlange bringt 6 (A7.3)').toBe(6)
  })

  it('K2.1, Ausnahme: ki-dreiergruppe-ausnahme: das Rot vollendete eine Gruppe (+2), das Grün bringt mehr (+3); sie legt das Grün', () => {
    const start = szenario('ki-dreiergruppe-ausnahme')
    /** Der Stand, nachdem die Farbkarte `farbe` hinten an die Schlange `schlangenId` gelegt ist. */
    const gelegt = (farbe: string, schlangenId: string) => {
      const aktion = ermittleAktionen(start).find(
        (angeboten) => angeboten.typ === 'FarbkarteLegen' && angeboten.karteId.startsWith(farbe) && angeboten.ziel.art === 'schlange' && angeboten.ziel.schlangenId === schlangenId && angeboten.ziel.seite === 'ende',
      )
      if (aktion === undefined) throw new Error(`Testaufbau: kein Knopf für ${farbe} an ${schlangenId}`)
      return anwendeAktion(start, aktion).zustand
    }
    const mitRot = gelegt('rot', 'schlange-2')
    expect(punkte(start, 1), 'K2.1: Grün 9 und Violett 6').toBe(15)
    expect(gruppenzahl(mitRot, 1) - gruppenzahl(start, 1), 'K2.1: das Rot vollendet eine Dreiergruppe').toBe(1)
    expect(punkte(mitRot, 1), 'K2.1: mit dem Rot wird die Fusion rot, 4 + 4 statt 6').toBe(17)
    expect(punkte(gelegt('gruen', 'schlange-1'), 1), 'K2.1: das Grün verlängert die grüne Gruppe').toBe(18)

    const zug = spieleZug('ki-dreiergruppe-ausnahme')
    expect(zug.aktionen[0], 'K2.1: sie legt das Grün').toMatchObject({ typ: 'FarbkarteLegen', ziel: { schlangenId: 'schlange-1' } })
    expect(punkte(zug.zustand, 1), 'K2.1: 18 statt 17').toBe(18)
  })

  /*
  K2.1 prüft die elf Partien mit ihren Saaten ohne Erweiterung (Entscheid des Orchestrators zu X6, 24.11.2026) und
  zusätzlich wieder die sechs mit Erweiterung, darunter die Partie aus dem Prüfprotokoll K2, Iteration 2, Hinweis 2
  (Saat 7154); seit K2b und dem Merge mit X5 ist die Aussage auch dort erfüllt. Seit K4 zählt jede Karte, auch der
  Schlangenkorb, und bewertet wird wie in der Zugsuche, mit den Aufgaben, die sie erfüllt und noch nicht hat
  (`aufgabenwert`, Plan K4, Kriterium 5).
  */
  const K2_1_PARTIEN: Entscheidung[][] = [
    ...PARTIEN.map((partie, nummer) =>
      partie.erweiterung
        ? entscheidungenVon(
            { ...partie, erweiterung: false },
            Array.from({ length: partie.spielerzahl }, (_, sitz) => (sitz === 0 ? erstelleSolideKi(erzeugeZufall(nummer)) : erstelleZufallsKi(erzeugeZufall(100 * nummer + sitz)))),
            0,
          )
        : ENTSCHEIDUNGEN[nummer],
    ),
    ...[false, true].map((erweiterung) =>
      entscheidungenVon({ spielerzahl: 2, erweiterung, saat: 7154 }, [erstelleSolideKi(erzeugeZufall(7154 * 13 + 3)), erstelleZufallsKi(erzeugeZufall(7154 * 7 + 1 + 11))], 0),
    ),
    ...ENTSCHEIDUNGEN.filter((_, nummer) => PARTIEN[nummer].erweiterung),
  ]

  /**
   * Der Stand, mit dem sie den (ersten Teil-)Zug beendet, vor dem Nachziehen (`beendet`: Stelle von „Zug beenden“),
   * so wie sie ihn gewählt hat: Ein Gegner, den eine ihrer Karten fragt, lässt durch, wie bei den Vollendungen, mit
   * denen der Zug verglichen wird (A6). Wehrt er in der Partie ab, sieht sie das bei der Wahl nicht (K2.7); gemessen
   * wird ihre Wahl, nicht die Abwehr (K2b, Befunde aus X6 und X5: geplant 40.00 und 27.80, nach der Abwehr 39.50 und
   * 27.30, beste Vollendung 39.60 und 27.40; `solideKi_gleichstand.test.ts`). Karten nach einer Abwehr stammen aus
   * dem Partieverlauf; hätte sie ohne Abwehr anders weitergespielt, ist die Messung dort nur eine Näherung.
   */
  function geplantesEnde(zug: readonly Entscheidung[], beendet: number): Spielzustand {
    const gespielt = zug.slice(0, beendet < 0 ? zug.length - 1 : beendet)
    return gespielt.reduce((stand, { aktion }) => nachDurchlassen(stand, aktion, 0), zug[0].vorher)
  }

  it('K2.1: in Partien vollendet sie in jedem Zug, in dem irgendeine Handkarte eine eigene Dreiergruppe vollenden kann, eine Gruppe oder spielt eine Vollendung, die abgewehrt wird, ausser ihr Zug ist strikt besser bewertet als jede Vollendung samt zweiter Karte (elf Partien ohne und sechs mit Erweiterung, Saat 7154 beide Male eingeschlossen)', () => {
    let geprueft = 0
    let vollendet = 0
    expect(K2_1_PARTIEN.map((partie) => partie[0].vorher.erweiterung).filter(Boolean), 'K2.1: sechs Partien mit Erweiterung').toHaveLength(6)
    for (const zug of K2_1_PARTIEN.flatMap(zuege)) {
      const start = zug[0].vorher
      const gruppen = gruppenzahl(start, 0)
      // Jede Karte zählt, auch Schlangenfrass, Fusion und Farbendieb; ein Gegner lässt eine angesagte Karte durch.
      const vollendend = ermittleAktionen(start)
        .filter((aktion) => aktion.typ !== 'ZugBeenden' && aktion.typ !== 'UeberhandAbwerfen' && aktion.typ !== 'RisikoKarteSpielen')
        .map((aktion) => nachDurchlassen(start, aktion, 0))
        .filter((danach) => gruppenzahl(danach, 0) > gruppen)
      if (vollendend.length === 0) continue
      geprueft += 1
      const beendet = zug.findIndex((entscheidung) => entscheidung.aktion.typ === 'ZugBeenden')
      const ende = geplantesEnde(zug, beendet)
      // Eine Vollendung, die sie gespielt hat und die ein Gegner mit Farbenschutz abwehrte, zählt als versucht (A6, A7.2).
      const ersterTeilzug = zug.slice(0, Math.max(0, beendet))
      const versucht = ersterTeilzug.some(({ aktion, vorher }) => gruppenzahl(nachDurchlassen(vorher, aktion, 0), 0) > gruppenzahl(vorher, 0))
      if (gruppenzahl(ende, 0) > gruppen || versucht) {
        vollendet += 1
        continue
      }
      // Eine Gruppe zu vollenden kann eine andere kosten, etwa wenn eine Fusion die Farbe wechseln müsste (A11); dann muss ihr Zug strikt besser
      // bewertet sein als die beste Vollendung samt der besten zweiten Karte desselben Zuges.
      const wert = (zustand: Spielzustand) => bewerte(sichtFuer(zustand, 0)) + aufgabenwert(start, zustand, 0)
      const besteVollendung = vollendend.flatMap((danach) => mitZweiterKarte(danach, 0)).reduce((beste, danach) => (wert(danach) > wert(beste) ? danach : beste))
      const zahlen = `Endwertung ${endpunkte(ende, 0)} gegen ${endpunkte(besteVollendung, 0)}, Bewertung ${wert(ende).toFixed(2)} gegen ${wert(besteVollendung).toFixed(2)}`
      expect(wert(ende), `K2.1: Zug ab ${JSON.stringify(zug[0].aktion)}: ${zahlen}`).toBeGreaterThan(wert(besteVollendung) + 1e-9)
    }
    // Jede Ausnahme ist oben einzeln belegt; die Mehrheit ist nur eine Probe, dass die Zählung greift.
    expect(vollendet, 'K2.1: in den meisten Zügen vollendet sie die Gruppe selbst').toBeGreaterThan(0.5 * geprueft)
    expect(geprueft, 'K2.1: genug solche Züge').toBeGreaterThan(30)
  }, 120_000)
})

describe('K2 Kriterium 2: passende Farbkarte und nützliche Sonderkarte, sie spielt beide', () => {
  it('K2.2: ki-farbe-und-sonderkarte: Blau an die blaue Schlange und die Regenbogenschlange an die braune, zusammen 7 Punkte', () => {
    const zug = spieleZug('ki-farbe-und-sonderkarte')
    expect([...typen(zug)].sort()).toEqual(['FarbkarteLegen', 'RegenbogenschlangeLegen', 'ZugBeenden'])
    expect(farben(zug.zustand, 1).map((schlange) => [...schlange].sort())).toEqual([
      ['Blau', 'Blau', 'Blau'],
      ['Braun', 'Braun', 'Regenbogenschlange'],
    ])
    expect(punkte(zug.zustand, 1)).toBe(7)
  })
})

describe('K2 Kriterium 3: keine Regenbogenschlange in eine gegnerische Schlange, wenn eine eigene sie aufnehmen kann', () => {
  it('K2.3: ki-regenbogen-eigene: auch wenn sie dort die längste Kette des Gegners unterbräche', () => {
    for (const saat of [1, 2, 3]) {
      const zug = spieleZug('ki-regenbogen-eigene', saat)
      const fremd = zug.aktionen.filter((aktion) => aktion.typ === 'RegenbogenschlangeLegen' && aktion.schlangenId === 'schlange-2')
      expect(fremd, `K2.3: Saat ${saat}`).toEqual([])
    }
  })

  it('K2.3: in Partien legt sie jede Regenbogenschlange in eine eigene Schlange, sobald sie eine hat', () => {
    const gelegt = ALLE.filter(({ aktion, vorher }) => aktion.typ === 'RegenbogenschlangeLegen' && vorher.spieler[0].schlangen.length > 0)
    for (const { aktion, vorher } of gelegt) {
      if (aktion.typ !== 'RegenbogenschlangeLegen') continue
      expect(vorher.spieler[0].schlangen.map((schlange) => schlange.id), 'K2.3').toContain(aktion.schlangenId)
    }
    expect(gelegt.length, 'K2.3: genug Regenbogenschlangen').toBeGreaterThan(5)
  })
})

describe('K2 Kriterium 4: keine Farbenfusion, die die eigenen Punkte senkt', () => {
  it('K2.4: ki-fusion-senkt: jede angebotene Fusion zerstörte ihre blaue Gruppe; sie spielt keine', () => {
    const start = szenario('ki-fusion-senkt')
    expect(ermittleAktionen(start).filter((aktion) => aktion.typ === 'FusionLegen'), 'K2.4: zwei Fusionen angeboten').toHaveLength(2)
    const zug = spieleZug('ki-fusion-senkt')
    expect(typen(zug)).not.toContain('FusionLegen')
    expect(punkte(zug.zustand, 1), 'K2.4: die blaue Gruppe bleibt').toBe(3)
  })

  it('K2.4: in Partien senkt keine ihrer Farbenfusionen die eigenen Punkte, den Kettenbonus eingeschlossen', () => {
    const fusionen = ALLE.filter(({ aktion }) => aktion.typ === 'FusionLegen')
    for (const { vorher, nachher } of fusionen) expect(endpunkte(nachher, 0), 'K2.4').toBeGreaterThanOrEqual(endpunkte(vorher, 0))
  })

  /** Schlussrunde zu zweit, Spieler 1 hat ausgelöst, KI-Gegner 1 spielt seinen letzten Zug mit dieser Hand. */
  function letzterZug(eigene: Schlangenglied[], hand: Schlangenglied[], gegner: Schlangenglied[] = []): Spielzustand {
    const bau = baukasten({ spielerzahl: 2, erweiterung: false, zufall: erzeugeZufall(212) }).schlange(1, eigene)
    if (gegner.length > 0) bau.schlange(0, gegner)
    return bau.hand(1, hand.filter((glied) => typeof glied === 'string')).schlussrunde(0).amZug(1).zustand()
  }
  const lange: Schlangenglied[] = [
    ...(['Rot', 'Blau', 'Gelb', 'Violett', 'Braun', 'Grün', 'Rot', 'Blau'] as const).flatMap((farbe) => [farbe, farbe, farbe]),
    'Schlangenblockade',
    'Gelb',
    'Gelb',
  ]

  it('K2.4, Codex-Gegenbeispiel 1: nur Fusionen auf der Hand, die meisten zerstören eine Gruppe; sie wählt eine, die nichts kostet', () => {
    const start = letzterZug(lange, ['Farbenfusion', 'Farbenfusion', 'Farbenfusion', 'Farbenfusion'])
    expect(endpunkte(start, 1), 'K2.4: acht Gruppen zu je 3 Karten').toBe(41)
    const zug = spieleZug('', 1, start)
    expect(endpunkte(zug.zustand, 1), `K2.4: gespielt ${JSON.stringify(zug.aktionen)}`).toBe(41)
  })

  it('K2.5, Codex-Gegenbeispiel 1: mit Fusion und Farbenschutz legt sie den Farbenschutz nicht wirkungslos ab, wenn eine Fusion nichts kostet', () => {
    const zug = spieleZug('', 1, letzterZug(lange, ['Farbenfusion', 'Farbenschutz']))
    expect(typen(zug)).not.toContain('SonderkarteWirkungslosAblegen')
    expect(endpunkte(zug.zustand, 1)).toBe(41)
  })

  it('K2.4, Codex-Gegenbeispiel 2: eine Fusion, die ihr den Kettenbonus nimmt, senkt ihre Punkte; sie fusioniert lieber beim Gegner', () => {
    const start = letzterZug(['Rot', 'Rot', 'Rot', 'Rot'], ['Farbenfusion', 'Farbenfusion', 'Farbenfusion', 'Farbenfusion'], ['Grün', 'Grün', 'Violett', 'Violett'])
    expect(endpunkte(start, 1), 'A11: 4 Punkte und der Kettenbonus').toBe(9)
    const zug = spieleZug('', 1, start)
    expect(endpunkte(zug.zustand, 1), `K2.4: gespielt ${JSON.stringify(zug.aktionen)}`).toBe(9)
  })
})

describe('K2 Kriterium 5: keine Karte wirkungslos, wenn ein besser bewerteter Zug möglich ist', () => {
  it('K2.5: ki-wirkungslos: statt Verdoppler oder Farbenschutz wirkungslos abzulegen, vollendet sie mit dem Rot ihre Gruppe', () => {
    const start = szenario('ki-wirkungslos')
    expect(ermittleAktionen(start).filter((aktion) => aktion.typ === 'SonderkarteWirkungslosAblegen'), 'D23, D25: zwei angeboten').toHaveLength(2)
    const zug = spieleZug('ki-wirkungslos')
    expect(typen(zug)).toEqual(['FarbkarteLegen', 'ZugBeenden'])
    expect(punkte(zug.zustand, 1)).toBe(3)
  })

  it('K2.5: ki-dreiergruppe: den Farbenschutz legt sie nicht wirkungslos ab', () => {
    expect(typen(spieleZug('ki-dreiergruppe'))).toEqual(['FarbkarteLegen', 'ZugBeenden'])
  })

  it('K2.5, F8a: ki-grube-ohne-zug: keine Schlangengrube auf den, der keinen Zug mehr hat (D29); sie vollendet ihre Gruppe, dann endet die Partie', () => {
    const start = szenario('ki-grube-ohne-zug')
    expect(ermittleAktionen(start).some((aktion) => aktion.typ === 'SchlangengrubeSpielen'), 'D29: die Engine bietet die Grube an').toBe(true)
    const zug = spieleZug('ki-grube-ohne-zug')
    expect(typen(zug)).toEqual(['FarbkarteLegen', 'ZugBeenden'])
    expect(zug.zustand.partiephase).toBe('Beendet')
    expect(punkte(zug.zustand, 1)).toBe(3)
  })

  it('K2.5, F8a: ki-grube-schlussrunde: eine Grube nur auf KI-Gegner 2, der noch einen Zug hat, nie auf Spieler 1', () => {
    for (const saat of [1, 2, 3]) {
      const gruben = spieleZug('ki-grube-schlussrunde', saat).aktionen.filter((aktion) => aktion.typ === 'SchlangengrubeSpielen')
      for (const grube of gruben) expect(grube, `F8a: Saat ${saat}`).toMatchObject({ zielSpielerId: 'spieler-3' })
    }
  })

  it('K2.5, F8a: nur Schlangengruben auf der Hand und niemand hat mehr einen Zug: sie spielt genau eine, weil es keinen anderen Zug gibt, und beendet dann', () => {
    const start = baukasten({ spielerzahl: 2, erweiterung: false, zufall: erzeugeZufall(211) })
      .schlange(1, ['Blau'])
      .hand(1, ['Schlangengrube', 'Schlangengrube'])
      .schlussrunde(0)
      .amZug(1)
      .zustand()
    expect([...new Set(ermittleAktionen(start).map((aktion) => aktion.typ))], 'D25: angeboten sind nur die Gruben, kein wirkungsloses Ablegen, kein Beenden').toEqual(['SchlangengrubeSpielen'])
    const zug = spieleZug('', 1, start)
    expect(typen(zug)).toEqual(['SchlangengrubeSpielen', 'ZugBeenden'])
    expect(zug.ereignisse.filter((ereignis) => ereignis.typ === 'GrubeOhneWirkung'), 'D29: die Grube geht ohne Wirkung ab').toHaveLength(1)
    expect(zug.zustand.partiephase).toBe('Beendet')
  })

  it('K2.5, F8a: letzter Zug mit Schlangengrube und Farbenschutz, niemand hat mehr einen Zug: sie legt den Farbenschutz ab, nicht die Grube', () => {
    const start = baukasten({ spielerzahl: 2, erweiterung: false, zufall: erzeugeZufall(213) })
      .schlange(1, ['Blau'])
      .hand(1, ['Schlangengrube', 'Farbenschutz'])
      .schlussrunde(0)
      .amZug(1)
      .zustand()
    expect([...new Set(ermittleAktionen(start).map((aktion) => aktion.typ))].sort(), 'D25, D29: beide angeboten').toEqual(['SchlangengrubeSpielen', 'SonderkarteWirkungslosAblegen'])
    const zug = spieleZug('', 1, start)
    expect(zug.aktionen, 'F8a: es gibt einen anderen Zug, also keine Grube ohne Wirkung').toMatchObject([{ typ: 'SonderkarteWirkungslosAblegen', karteId: expect.stringMatching(/^farbenschutz-/) }, { typ: 'ZugBeenden' }])
    expect(zug.ereignisse.filter((ereignis) => ereignis.typ === 'GrubeOhneWirkung')).toEqual([])
  })

  it('K2.5, K2.4: ki-fusion-senkt: eine Fusion, die ihre Punkte senkt, spielt sie nicht', () => {
    expect(typen(spieleZug('ki-fusion-senkt'))).not.toContain('FusionLegen')
  })

  it('K2.5, F8a: in Partien geht keine ihrer Schlangengruben ohne Wirkung ab', () => {
    const ohneWirkung = ALLE.filter(({ aktion, ereignisse }) =>
      ereignisse.some((ereignis) => ereignis.typ === 'GrubeOhneWirkung' && aktion.typ === 'SchlangengrubeSpielen' && ereignis.karteId === aktion.karteId),
    )
    expect(ohneWirkung.map(({ aktion }) => aktion)).toEqual([])
  })
})

describe('K2 Kriterium 6: mit Verdoppler nutzt sie den zweiten Zug', () => {
  it('K2.6: ki-verdoppler: Verdoppler und eine Gruppe im ersten Zug, die zweite Gruppe im zweiten', () => {
    const zug = spieleZug('ki-verdoppler')
    expect(typen(zug)).toContain('VerdopplerSpielen')
    const zweiter = zug.ereignisse.findIndex((ereignis) => ereignis.typ === 'ZugBegonnen' && ereignis.spielerIndex === 1 && ereignis.teilzug === 2)
    expect(zweiter, 'A7.8: der zweite Zug beginnt').toBeGreaterThan(-1)
    const imZweiten = zug.aktionen.slice(zug.aktionen.findIndex((aktion) => aktion.typ === 'ZugBeenden') + 1)
    expect(imZweiten.map((aktion) => aktion.typ), 'K2.6: im zweiten Zug legt sie eine Farbkarte').toEqual(['FarbkarteLegen', 'ZugBeenden'])
    expect(farben(zug.zustand, 1)).toEqual([
      ['Rot', 'Rot', 'Rot'],
      ['Blau', 'Blau', 'Blau'],
    ])
    expect(zug.zustand.zug.spielerIndex, 'K2.6: danach ist Spieler 1 dran').toBe(0)
  })

  it('K2.6: in Partien spielt sie nach jedem Verdoppler im zweiten Zug eine Karte mit Wirkung', () => {
    let geprueft = 0
    for (const entscheidungen of ENTSCHEIDUNGEN) {
      for (const [stelle, { aktion }] of entscheidungen.entries()) {
        if (aktion.typ !== 'VerdopplerSpielen') continue
        const danach = entscheidungen.slice(stelle + 1)
        const ende = danach.findIndex((eintrag) => eintrag.aktion.typ === 'ZugBeenden')
        const zweiter = danach.slice(ende + 1)
        const schluss = zweiter.findIndex((eintrag) => eintrag.aktion.typ === 'ZugBeenden')
        const karten = zweiter.slice(0, schluss < 0 ? undefined : schluss).map((eintrag) => eintrag.aktion.typ)
        geprueft += 1
        expect(karten.filter((typ) => typ !== 'Reagieren' && typ !== 'SonderkarteWirkungslosAblegen').length, `K2.6: nach ${aktion.karteId}`).toBeGreaterThan(0)
      }
    }
    expect(geprueft, 'K2.6: genug Verdoppler').toBeGreaterThan(5)
  })
})
