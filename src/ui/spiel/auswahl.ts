import type { SchlangenfrassSpielenAktion, SpielAktion } from '../../engine'

/*
Von der Karte über die Ziele zur fertigen Aktion (Plan O3, DESIGN.md „Karte
wählen, dann Ziel wählen“). Die Auswahl baut keine Aktion (U3): Sie zerlegt
jede Aktion, die die Engine aufzählt, in die Wahlen, mit denen der Mensch sie
antippt, und bietet nur an, was zu einer dieser Aktionen führt. Fertig ist
eine Auswahl, wenn genau eine Aktion alle ihre Wahlen hat; geliefert wird dann
dieses Objekt der Engine, keine Abschrift.

Eine Aktion zerfällt in eine Folge, die der Reihe nach gewählt wird (Karte,
dann Ziel), und eine Menge, deren Glieder in beliebiger Reihenfolge kommen
(zwei Karten für Schlangenfrass oder Farbenfusion, die Karten zum Abwerfen).
Regeln stehen hier keine; welche Ziele es gibt, sagt allein die Engine.
*/

/** Was der Mensch antippt: ein Schritt auf dem Weg zu einer Aktion. */
export type Wahl =
  | { art: 'karte'; karteId: string }
  | { art: 'neueSchlange' }
  | { art: 'schlangenende'; schlangenId: string; seite: 'anfang' | 'ende' }
  | { art: 'schlange'; schlangenId: string }
  | { art: 'luecke'; schlangenId: string; position: number }
  | { art: 'schlangenkarte'; schlangenId: string; karteId: string }
  | { art: 'frass'; option: SchlangenfrassSpielenAktion['option'] }
  | { art: 'spieler'; spielerId: string }
  | { art: 'reihenfolge'; karteIds: string[] }
  | { art: 'ablage' }
  | { art: 'zugBeenden' }
  | { art: 'abwerfen'; karteId: string }
  | { art: 'abwehren'; farbenschutzId: string }
  | { art: 'durchlassen' }

/** Die bisher getroffenen Wahlen, in der Reihenfolge des Antippens. */
export type Auswahl = readonly Wahl[]

export interface Weg {
  /** Der Reihe nach zu wählen. */
  folge: Wahl[]
  /** Nach der Folge, in beliebiger Reihenfolge. */
  menge: Wahl[]
}

export interface Auswahlstand {
  /** Was als Nächstes gewählt werden kann, ohne Doppelte, in der Reihenfolge der Aktionen. */
  angebote: Wahl[]
  /** Die Aktion der Engine, die mit dieser Auswahl vollständig ist, sonst `null`. */
  fertig: SpielAktion | null
}

const karte = (karteId: string): Wahl => ({ art: 'karte', karteId })
const schlangenkarte = (ziel: { schlangenId: string; karteId: string }): Wahl => ({ art: 'schlangenkarte', schlangenId: ziel.schlangenId, karteId: ziel.karteId })

/** Die Wahlen, mit denen der Mensch diese Aktion antippt. */
export function wegZu(aktion: SpielAktion): Weg {
  switch (aktion.typ) {
    case 'FarbkarteLegen': {
      const { ziel } = aktion
      const wahl: Wahl = ziel.art === 'neueSchlange' ? { art: 'neueSchlange' } : { art: 'schlangenende', schlangenId: ziel.schlangenId, seite: ziel.seite }
      return { folge: [karte(aktion.karteId), wahl], menge: [] }
    }
    case 'RegenbogenschlangeLegen':
    case 'BlockadeLegen':
      return {
        folge: [karte(aktion.karteId), { art: 'schlange', schlangenId: aktion.schlangenId }, { art: 'luecke', schlangenId: aktion.schlangenId, position: aktion.position }],
        menge: [],
      }
    case 'FusionLegen':
      return { folge: [karte(aktion.karteId)], menge: aktion.kartenIds.map((karteId) => schlangenkarte({ schlangenId: aktion.schlangenId, karteId })) }
    case 'FarbendiebSpielen': {
      const { ziel } = aktion
      const platz: Wahl = ziel.art === 'neueSchlange' ? { art: 'neueSchlange' } : { art: 'luecke', schlangenId: ziel.schlangenId, position: ziel.position }
      return { folge: [karte(aktion.karteId), schlangenkarte(aktion.quelle), platz], menge: [] }
    }
    case 'SchlangenfrassSpielen':
      return { folge: [karte(aktion.karteId), { art: 'frass', option: aktion.option }], menge: aktion.ziele.map(schlangenkarte) }
    case 'SchlangengrubeSpielen':
      return { folge: [karte(aktion.karteId), { art: 'spieler', spielerId: aktion.zielSpielerId }], menge: [] }
    case 'VerdopplerSpielen':
      return { folge: [karte(aktion.karteId)], menge: [] }
    case 'SchlangenhaeutungSpielen':
      return {
        folge: [karte(aktion.karteId), { art: 'schlange', schlangenId: aktion.schlangenId }, { art: 'reihenfolge', karteIds: aktion.neueReihenfolge }],
        menge: [],
      }
    case 'SonderkarteWirkungslosAblegen':
      return { folge: [karte(aktion.karteId), { art: 'ablage' }], menge: [] }
    case 'ZugBeenden':
      return { folge: [{ art: 'zugBeenden' }], menge: [] }
    case 'UeberhandAbwerfen':
      return { folge: [], menge: aktion.karteIds.map((karteId): Wahl => ({ art: 'abwerfen', karteId })) }
    case 'Reagieren':
      return { folge: [aktion.farbenschutzId === null ? { art: 'durchlassen' } : { art: 'abwehren', farbenschutzId: aktion.farbenschutzId }], menge: [] }
  }
}

/** Gleiche Wahlen haben denselben Schlüssel; jede Wahl entsteht hier mit fester Reihenfolge ihrer Felder. */
const schluessel = (wahl: Wahl): string => JSON.stringify(wahl)

interface Eintrag {
  aktion: SpielAktion
  /** Die Folge als Paare aus Schlüssel und Wahl. */
  folge: [string, Wahl][]
  menge: Map<string, Wahl>
}

function eintraege(aktionen: readonly SpielAktion[]): Eintrag[] {
  return aktionen.map((aktion) => {
    const { folge, menge } = wegZu(aktion)
    return { aktion, folge: folge.map((wahl) => [schluessel(wahl), wahl]), menge: new Map(menge.map((wahl) => [schluessel(wahl), wahl])) }
  })
}

/** Ob die Auswahl auf dem Weg dieser Aktion liegt: erst ihre Folge, danach nur Glieder ihrer Menge. */
function passt(eintrag: Eintrag, gewaehlt: readonly string[]): boolean {
  return gewaehlt.every((wahl, stelle) => (stelle < eintrag.folge.length ? wahl === eintrag.folge[stelle][0] : eintrag.menge.has(wahl)))
}

/** Die Angebote nach Schlüssel und die vollständigen Aktionen zu einer Auswahl. */
function stand(liste: readonly Eintrag[], gewaehlt: readonly string[]): { angebote: Map<string, Wahl>; fertig: SpielAktion[] } {
  const getroffen = new Set(gewaehlt)
  const angebote = new Map<string, Wahl>()
  const fertig: SpielAktion[] = []
  for (const eintrag of liste) {
    if (!passt(eintrag, gewaehlt)) continue
    if (gewaehlt.length < eintrag.folge.length) {
      angebote.set(...eintrag.folge[gewaehlt.length])
      continue
    }
    let offen = 0
    for (const [wahl, objekt] of eintrag.menge) {
      if (getroffen.has(wahl)) continue
      angebote.set(wahl, objekt)
      offen += 1
    }
    if (offen === 0) fertig.push(eintrag.aktion)
  }
  return { angebote, fertig }
}

/** Was nach dieser Auswahl angeboten ist und ob sie eine Aktion vollständig beschreibt. */
export function auswahlstand(aktionen: readonly SpielAktion[], auswahl: Auswahl): Auswahlstand {
  const { angebote, fertig } = stand(eintraege(aktionen), auswahl.map(schluessel))
  if (fertig.length > 1) {
    throw new Error(`Auswahl: ${fertig.length} Aktionen passen zu derselben Auswahl; jede Aktion braucht einen eigenen Weg (O3).`)
  }
  return { angebote: [...angebote.values()], fertig: fertig[0] ?? null }
}

/**
 * Trifft eine Wahl. Ist sie schon getroffen, nimmt sie sie zurück: ein Ziel aus
 * der Menge allein, sonst alles ab ihr (dieselbe Karte noch einmal hebt die
 * Auswahl auf). Eine Karte, die erst am Anfang angeboten ist, beginnt eine neue
 * Auswahl. Alles andere ist nicht angeboten und wird abgelehnt.
 */
export function waehle(aktionen: readonly SpielAktion[], auswahl: Auswahl, wahl: Wahl): Auswahl {
  const liste = eintraege(aktionen)
  const gewaehlt = auswahl.map(schluessel)
  const neu = schluessel(wahl)
  const stelle = gewaehlt.indexOf(neu)
  if (stelle >= 0) {
    const inFolge = liste.some((eintrag) => passt(eintrag, gewaehlt) && stelle < eintrag.folge.length)
    return inFolge ? auswahl.slice(0, stelle) : auswahl.filter((_, index) => index !== stelle)
  }
  if (stand(liste, gewaehlt).angebote.has(neu)) return [...auswahl, wahl]
  if (stand(liste, []).angebote.has(neu)) return [wahl]
  throw new Error(`Auswahl: ${neu} ist nicht angeboten; angeboten sind nur Wahlen zu Aktionen der Engine (U3).`)
}
