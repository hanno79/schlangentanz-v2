import { expect } from 'vitest'
import { AKTIONSTYPEN, anwendeAktion, ermittleAktionen, ermittleEntscheider, pruefeAktion } from '../index'
import type { SpielAktion, Spielzustand } from '../index'
import { alleSpielkarten } from '../invarianten'
import { istFarbenschutz } from '../reaktion'
import { dauerlauf, ENGINE_MOTOR } from '../testing/dauerlauf'
import type { DauerlaufErgebnis, DauerlaufPartie, Motor, SchrittPruefer } from '../testing/dauerlauf'
import { erzeugeZufall } from '../testing/zufall'

/*
Die Prüfer des Dauerlaufs, gemeinsam für den Lauf in `npm test` (300 Partien,
Plan 3.6, Punkt 7) und den langen Lauf mit 2'000 Partien (E11, Kriterium 3,
`npm run test:dauerlauf`). Jeder Prüfer sieht jeden ausgeführten Schritt und
meldet einen Verstoss als Text; die Zähler zeigen dem Test, dass die geprüfte
Lage überhaupt vorkam.
*/

/** Zweite Züge nach einem Verdoppler (E3), davon in der Schlussrunde, und die letzten Züge der Schlussrunden (A10). */
export interface Zugzaehler {
  zweite: number
  zweiteInSchlussrunde: number
  letzte: number
}

export function neuerZugzaehler(): Zugzaehler {
  return { zweite: 0, zweiteInSchlussrunde: 0, letzte: 0 }
}

/** Wie oft der Dauerlauf eine Ansage, eine Frage, eine Abwehr, ein Aussetzen und eine Grube ohne Wirkung sah (E4). */
export type Reaktionen = Record<'KarteAngesagt' | 'AbwehrGefragt' | 'Abgewehrt' | 'Ausgesetzt' | 'GrubeOhneWirkung', number>

export function neueReaktionen(): Reaktionen {
  return { KarteAngesagt: 0, AbwehrGefragt: 0, Abgewehrt: 0, Ausgesetzt: 0, GrubeOhneWirkung: 0 }
}

/**
 * E4 (A6, A7.2, A7.6, D29, D33): Gefragt wird jeder Betroffene, im Uhrzeigersinn
 * und jeder einmal, nie der Angreifer; abwehren kann nur, wer Farbenschutz hält;
 * wer ausserhalb seines Zuges abwehrt, zieht nicht nach; der Farbenschutz liegt
 * danach auf seinem Ablagestapel; nach Spielende liegt keine Grube mehr aus.
 */
export function reaktionsPruefer(zaehler: Reaktionen): SchrittPruefer {
  /** Die Betroffenen der laufenden Ansage, die noch nicht gefragt wurden. */
  let ungefragt: number[] = []
  return (vorher, _aktion, { zustand, ereignisse }) => {
    const ziehenDarf = new Set([vorher.zug.spielerIndex])
    for (const ereignis of ereignisse) {
      if (ereignis.typ in zaehler) zaehler[ereignis.typ as keyof Reaktionen] += 1
      if (ereignis.typ === 'KarteAngesagt') ungefragt = [...ereignis.betroffene]
      if (ereignis.typ === 'AbwehrGefragt' && ereignis.spielerIndex !== ungefragt.shift()) return `D33: Spieler ${ereignis.spielerIndex} ist ausser der Reihe gefragt.`
      if (ereignis.typ === 'AnsageEntschieden' && ungefragt.length > 0) return `D33: Spieler ${ungefragt.join(', ')} wurden nicht gefragt.`
      if (ereignis.typ === 'ZugBegonnen') ziehenDarf.add(ereignis.spielerIndex)
      if (ereignis.typ === 'KartenGezogen' && !ziehenDarf.has(ereignis.spielerIndex)) return `A6: Spieler ${ereignis.spielerIndex} zieht ausserhalb seines Zuges.`
      if (ereignis.typ === 'Abgewehrt' && !zustand.spieler[ereignis.spielerIndex].ablagestapel.some((karte) => karte.id === ereignis.karteId)) {
        return `A7.2: Der Farbenschutz ${ereignis.karteId} liegt nicht auf dem Ablagestapel von Spieler ${ereignis.spielerIndex}.`
      }
    }
    const { schwebend } = zustand
    if (schwebend !== null) {
      const gefragt = schwebend.ausstehend[0]
      if (gefragt === undefined) return 'A6: Eine Karte schwebt, aber niemand ist gefragt.'
      if (zustand.spieler[gefragt].id === schwebend.aktion.spielerId) return 'A6: Der Angreifer ist bei seiner eigenen Karte gefragt.'
      const abwehren = ermittleAktionen(zustand).filter((aktion) => aktion.typ === 'Reagieren' && aktion.farbenschutzId !== null).length
      const farbenschutz = zustand.spieler[gefragt].hand.filter(istFarbenschutz).length
      if (abwehren !== farbenschutz) return `D33: Spieler ${gefragt} hält ${farbenschutz} Farbenschutz, angeboten sind ${abwehren} Abwehren.`
    }
    if (zustand.partiephase === 'Beendet' && zustand.ausliegendeGruben.length > 0) return 'D29: Nach Spielende liegt noch eine Grube aus.'
    return null
  }
}

/** Alle Prüfer nacheinander; der erste Befund zählt. */
export function allePruefer(...pruefer: SchrittPruefer[]): SchrittPruefer {
  return (vorher, aktion, ergebnis) => {
    for (const pruefe of pruefer) {
      const befund = pruefe(vorher, aktion, ergebnis)
      if (befund !== null) return befund
    }
    return null
  }
}

/**
 * Was der Dauerlauf je Partie zusätzlich zu den Invarianten prüft (E2): höchstens
 * eine Farbkarte und eine Sonderkarte je Zug (D12), höchstens 5 Handkarten nach
 * dem eigenen Zugende (A5), in der Schlussrunde zieht niemand, der Auslöser kommt
 * nicht mehr dran, und jeder andere hat genau einen letzten Zug (A10).
 *
 * Seit E3 (A7.8, D11): Ein zweiter Zug beginnt nur für denselben Spieler direkt
 * nach seinem ersten Zug mit Verdoppler, im zweiten Zug wird kein Verdoppler mit
 * Wirkung gespielt, und in der Schlussrunde zählen beide Züge als ein letzter Zug.
 */
export function regelPruefer(zaehler: Zugzaehler = neuerZugzaehler()): SchrittPruefer {
  /** Wer in der Schlussrunde seinen letzten Zug hatte, gespielt oder ausgesetzt (D21); `null` vor der Schlussrunde. */
  let letzteZuege: number[] | null = null
  return (vorher, aktion, { zustand, ereignisse }) => {
    const { zug } = zustand
    if (zug.gespielteFarbkarten > 1 || zug.gespielteSonderkarten > 1) return `D12: ${JSON.stringify(zug)}`
    if (aktion.typ === 'VerdopplerSpielen' && vorher.zug.teilzug === 2) return 'D11: Im zweiten Zug wirkt ein Verdoppler.'
    for (const ereignis of ereignisse) {
      if (ereignis.typ === 'ZugBegonnen' && ereignis.teilzug === 2) {
        const { spielerIndex, teilzug, verdopplerGespielt } = vorher.zug
        if (ereignis.spielerIndex !== spielerIndex || teilzug !== 1 || !verdopplerGespielt) {
          return `A7.8: zweiter Zug für ${ereignis.spielerIndex} nach ${JSON.stringify(vorher.zug)}.`
        }
        zaehler.zweite += 1
        if (letzteZuege !== null) zaehler.zweiteInSchlussrunde += 1
      } else if (ereignis.typ === 'SchlussrundeBegonnen') letzteZuege = []
      else if (letzteZuege === null) continue
      else if (ereignis.typ === 'KartenGezogen') return `A10: In der Schlussrunde zieht ${ereignis.spielerIndex} Karten.`
      else if (ereignis.typ === 'ZugBegonnen' || ereignis.typ === 'Ausgesetzt') {
        if (ereignis.spielerIndex === zustand.schlussrundeAusloeser) return 'A10: Der Auslöser ist noch einmal dran.'
        if (letzteZuege.includes(ereignis.spielerIndex)) return `A10: Spieler ${ereignis.spielerIndex} hat einen zweiten letzten Zug.`
        letzteZuege.push(ereignis.spielerIndex)
      } else if (ereignis.typ === 'PartieBeendet') {
        if (letzteZuege.length !== zustand.spieler.length - 1) return `A10: ${letzteZuege.length} statt ${zustand.spieler.length - 1} letzte Züge.`
        zaehler.letzte += letzteZuege.length
      }
    }
    const zugende = ereignisse.some((ereignis) => ereignis.typ === 'ZugBegonnen' || ereignis.typ === 'PartieBeendet')
    const hand = zustand.spieler[vorher.zug.spielerIndex].hand.length
    return zugende && hand > 5 ? `A5: Nach dem Zugende hält Spieler ${vorher.zug.spielerIndex} ${hand} Karten.` : null
  }
}

/** E11, Kriterium 3 (A10): Der Nachziehstapel ist genau dann leer, wenn die Schlussrunde läuft oder die Partie beendet ist. */
export const stapelPruefer: SchrittPruefer = (_vorher, _aktion, { zustand }) => {
  const leer = zustand.nachziehstapel.length === 0
  return leer === (zustand.partiephase !== 'Laufend') ? null : `A10: Partiephase ${zustand.partiephase} mit ${zustand.nachziehstapel.length} Karten im Nachziehstapel.`
}

/**
 * E11, Kriterium 4: So viele Aktionen zählt die Engine in einem Zustand der
 * Dauerläufe höchstens auf. Gemessen am 21.11.2026 in den rund 366'000
 * Zuständen der 2'000 Partien: höchstens 4'007 (2 Spieler mit Erweiterung,
 * meist Schlangenhäutungen); mit anderer Zuordnung der Spielerzahlen zu den
 * Saaten waren es 2'785. Den ungünstigsten Tisch misst `legal_actions_umfang.test.ts`.
 */
export const HOECHSTE_AKTIONSZAHL_IM_DAUERLAUF = 6_000

/** Die grösste Zahl aufgezählter Aktionen in einem Zustand des Laufs (E11, Kriterium 4). */
export interface Umfang {
  hoechste: number
  /** Saat-unabhängige Beschreibung der Lage mit den meisten Aktionen. */
  bei: string
}

/** Merkt sich die grösste Aufzählung; der Lauf zählt jeden Zustand ohnehin einmal auf (`testing/dauerlauf.ts`). */
function zaehlenderMotor(umfang: Umfang): Motor {
  return {
    ...ENGINE_MOTOR,
    aktionen: (zustand) => {
      const aktionen = ermittleAktionen(zustand)
      if (aktionen.length > umfang.hoechste) {
        umfang.hoechste = aktionen.length
        umfang.bei = `${zustand.spieler.length} Spieler, Erweiterung ${zustand.erweiterung}, Typen ${[...new Set(aktionen.map((aktion) => aktion.typ))].join(', ')}`
      }
      return aktionen
    },
  }
}

/** Wie oft der Lauf eine verfälschte Aktion vorlegte und wie oft je Art. */
export interface Verfaelschungen {
  abgelehnt: number
  jeArt: Record<string, number>
}

export function neueVerfaelschungen(): Verfaelschungen {
  return { abgelehnt: 0, jeArt: {} }
}

type Verfaelscher = (aktion: Record<string, unknown>, zustand: Spielzustand, zufall: () => number) => Record<string, unknown> | null

function waehle<T>(liste: readonly T[], zufall: () => number): T {
  return liste[Math.floor(zufall() * liste.length)]
}

/** Der erste Teil der Aktion mit diesem Feld: die Aktion selbst, `ziel`, `quelle` oder der erste Eintrag von `ziele`. */
function teilMit(aktion: Record<string, unknown>, feld: string): Record<string, unknown> | null {
  const kandidaten = [aktion, aktion.ziel, aktion.quelle, Array.isArray(aktion.ziele) ? aktion.ziele[0] : undefined]
  return (kandidaten.find((teil) => typeof teil === 'object' && teil !== null && feld in teil) as Record<string, unknown> | undefined) ?? null
}

/**
 * Verfälschungen, die nie eine erlaubte Aktion ergeben: Jede verletzt eine Regel
 * der Aktionsschicht (Plan E1, Kriterium 4) oder der Karte. Jede liefert eine
 * veränderte Kopie oder `null`, wenn sie auf diese Aktion nicht passt.
 */
const VERFAELSCHER: Readonly<Record<string, Verfaelscher>> = {
  'fremder Spieler': (aktion, zustand, zufall) => {
    const entscheider = ermittleEntscheider(zustand)
    const andere = zustand.spieler.filter((_, index) => index !== entscheider)
    return { ...aktion, spielerId: waehle(andere, zufall).id }
  },
  'unbekannter Spieler': (aktion) => ({ ...aktion, spielerId: 'spieler-9' }),
  'anderer Aktionstyp': (aktion, _zustand, zufall) => ({ ...aktion, typ: waehle(AKTIONSTYPEN.filter((typ) => typ !== aktion.typ), zufall) }),
  'Karte nicht auf der Hand': (aktion, zustand, zufall) => {
    if (!('karteId' in aktion)) return null
    const hand = new Set(zustand.spieler[ermittleEntscheider(zustand)!].hand.map((karte) => karte.id))
    return { ...aktion, karteId: waehle(alleSpielkarten(zustand).filter((karte) => !hand.has(karte.id)), zufall).id }
  },
  'fehlendes Feld': (aktion, _zustand, zufall) => {
    const felder = Object.keys(aktion).filter((feld) => feld !== 'typ')
    const weg = waehle(felder, zufall)
    return Object.fromEntries(Object.entries(aktion).filter(([feld]) => feld !== weg))
  },
  'fremdes Feld': (aktion) => ({ ...aktion, zusatz: 1 }),
  'unbekannte Schlange': (aktion) => {
    const kopie = structuredClone(aktion)
    const teil = teilMit(kopie, 'schlangenId')
    if (teil === null) return null
    teil.schlangenId = 'schlange-999'
    return kopie
  },
  'Stelle ausserhalb der Schlange': (aktion, _zustand, zufall) => {
    const kopie = structuredClone(aktion)
    const teil = teilMit(kopie, 'position')
    if (teil === null) return null
    teil.position = zufall() < 0.5 ? -1 : 999
    return kopie
  },
  'falsche Reaktion': (aktion, zustand, zufall) => {
    if (aktion.typ !== 'Reagieren') return null
    const andere = zustand.spieler[ermittleEntscheider(zustand)!].hand.filter((karte) => !istFarbenschutz(karte))
    return { ...aktion, farbenschutzId: andere.length > 0 ? waehle(andere, zufall).id : 'farbenschutz-99' }
  },
  'Karte doppelt genannt': (aktion) => {
    const kopie = structuredClone(aktion)
    for (const feld of ['karteIds', 'kartenIds', 'neueReihenfolge', 'ziele']) {
      const liste = kopie[feld]
      if (Array.isArray(liste) && liste.length > 0) {
        kopie[feld] = feld === 'kartenIds' ? [liste[1], liste[0]] : [...liste, liste[0]]
        return kopie
      }
    }
    return null
  },
}

/**
 * E11, Kriterium 3: In jedem Schritt wird die gewählte Aktion zufällig verfälscht.
 * Die Engine muss sie mit deutschem Grund ablehnen, und `anwendeAktion` wirft
 * denselben Grund (B2, U12). Erlaubt die Engine eine verfälschte Aktion, ist das
 * ein Verstoss: Sie ist dann weder aufgezählt noch von einer Regel gedeckt.
 */
export function verfaelschungsPruefer(zufall: () => number, zaehler: Verfaelschungen): SchrittPruefer {
  const arten = Object.keys(VERFAELSCHER)
  return (vorher, aktion) => {
    const passend = arten
      .map((art) => [art, VERFAELSCHER[art](aktion as unknown as Record<string, unknown>, vorher, zufall)] as const)
      .filter(([, verfaelscht]) => verfaelscht !== null)
    const [art, verfaelscht] = waehle(passend, zufall)
    const pruefung = pruefeAktion(vorher, verfaelscht as unknown as SpielAktion)
    if (pruefung.erlaubt) return `B2: verfälscht (${art}) und trotzdem erlaubt: ${JSON.stringify(verfaelscht)}`
    if (!/\p{L}{3,}/u.test(pruefung.grund)) return `U12: kein Grund für die Ablehnung von ${JSON.stringify(verfaelscht)}`
    try {
      anwendeAktion(vorher, verfaelscht as unknown as SpielAktion)
      return `B2: anwendeAktion führt die verfälschte Aktion (${art}) aus: ${JSON.stringify(verfaelscht)}`
    } catch (fehler) {
      if (!(fehler instanceof Error) || fehler.message !== pruefung.grund) return `B2: anwendeAktion wirft für ${art} einen anderen Grund als pruefeAktion.`
    }
    zaehler.abgelehnt += 1
    zaehler.jeArt[art] = (zaehler.jeArt[art] ?? 0) + 1
    return null
  }
}

/** Ein Lauf mit allen Prüfern und was sie gezählt haben. */
export interface GepruefterLauf {
  ergebnisse: DauerlaufErgebnis[]
  schritte: number
  zuege: Zugzaehler
  reaktionen: Reaktionen
  verfaelscht: Verfaelschungen
  umfang: Umfang
}

/** Spielt die Partien mit allen Prüfern dieser Datei; die Verfälschungen ziehen ihren Zufall aus `saat`. */
export function spieleGeprueft(partien: readonly DauerlaufPartie[], saat: number): GepruefterLauf {
  const zuege = neuerZugzaehler()
  const reaktionen = neueReaktionen()
  const verfaelscht = neueVerfaelschungen()
  const umfang: Umfang = { hoechste: 0, bei: '' }
  const zufall = erzeugeZufall(saat)
  const neuerPruefer = () => allePruefer(regelPruefer(zuege), reaktionsPruefer(reaktionen), stapelPruefer, verfaelschungsPruefer(zufall, verfaelscht))
  const ergebnisse = dauerlauf(partien, { motor: zaehlenderMotor(umfang), neuerPruefer })
  const schritte = ergebnisse.reduce((summe, ergebnis) => summe + ergebnis.schritte, 0)
  return { ergebnisse, schritte, zuege, reaktionen, verfaelscht, umfang }
}

/** Was jeder Lauf mit allen Prüfern erfüllt: jede Partie endet, jede Verfälschung ist abgelehnt, die Aktionszahl bleibt begrenzt. */
export function erwarteGeprueftenLauf(lauf: GepruefterLauf, titel: string): void {
  expect(lauf.ergebnisse.filter((ergebnis) => ergebnis.ausgang !== 'beendet'), `${titel}: Partien, die nicht regulär endeten`).toEqual([])
  expect(lauf.verfaelscht.abgelehnt, `${titel}: verfälschte Aktionen, in jedem Schritt eine, jede abgelehnt`).toBe(lauf.schritte)
  expect(lauf.umfang.hoechste, `${titel}: E11 Kriterium 4, höchste Aktionszahl (${lauf.umfang.bei})`).toBeLessThanOrEqual(HOECHSTE_AKTIONSZAHL_IM_DAUERLAUF)
}
