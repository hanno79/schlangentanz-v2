import type { Korbbonus, Korbtausch, Risikoaktion, SchlangenfrassSpielenAktion, SpielAktion } from '../../engine'
import { wegDerEntscheidung } from './entscheidungsarten'

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

Die Schlangenhäutung (O7) wählt nach der Schlange den Abschnitt und zuletzt
die neue Reihenfolge. Die Engine zählt je Abschnitt jede neue Farbfolge einmal
auf; der Mensch ordnet die Karten selbst, und `passendeReihenfolge` sucht die
aufgezählte Reihenfolge mit derselben Farbfolge.

Mit der Erweiterung (O10) wählt der Mensch eine Karte seiner Auslage wie eine
Handkarte: Die Comeback-Karte ist damit schon gewählt, bei der
Risiko-Belohnungs-Karte folgen die Aktion und bei Aktion 2 und 3 die benannte
Karte (A8.2). Eine Entscheidung zerfällt nach ihrer Art
(`entscheidungsarten.ts`); deshalb nimmt die Zerlegung die Art der offenen
Entscheidung mit.
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
  /** Die Karten eines Abschnitts der Schlangenhäutung, nach Id sortiert; wo sie liegen, sagt die Schlange am Tisch. */
  | { art: 'abschnitt'; schlangenId: string; karteIds: string[] }
  | { art: 'reihenfolge'; karteIds: string[] }
  | { art: 'ablage' }
  | { art: 'zugBeenden' }
  | { art: 'abwerfen'; karteId: string }
  | { art: 'abwehren'; farbenschutzId: string }
  | { art: 'durchlassen' }
  /** X3: eine feste Möglichkeit einer offenen Entscheidung (`entscheidungsarten.ts`). */
  | { art: 'entscheiden'; wahl: string }
  /** A8.2: eine der vier Risiko-Aktionen, nach der Risiko-Belohnungs-Karte. */
  | { art: 'risikoaktion'; nummer: Risikoaktion }
  /** A8.2, D52: die Karte, die eine Risiko-Aktion benennt: bei Aktion 2 eine Farbkarte der Hand, bei Aktion 3 eine der eigenen Schlange. */
  | { art: 'benannt'; karteId: string }
  /** X4, D49: „Zwei Karten abwerfen, drei ziehen“ als Zusatzaktion; die zwei Karten folgen als `abwerfen`. */
  | { art: 'zweiAbwerfenDreiZiehen' }
  /** X6: der Bonus des Schlangenkorbs (A7.10) und ein Tausch (D44): Farbkarte der Schlange und Handkarte an ihren Platz. */
  | { art: 'korbbonus'; bonus: Korbbonus['art'] }
  | ({ art: 'tausch' } & Korbtausch)

/** Die Wahl einer bestimmten Art. */
export type WahlDerArt<A extends Wahl['art']> = Extract<Wahl, { art: A }>

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

/** Die Wahlen, mit denen der Mensch diese Aktion antippt; `entscheidung` ist die Art der offenen Entscheidung, falls eine offen ist. */
export function wegZu(aktion: SpielAktion, entscheidung: string | null = null): Weg {
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
    case 'SchlangenhaeutungSpielen': {
      const { schlangenId, neueReihenfolge } = aktion
      return {
        folge: [
          karte(aktion.karteId),
          { art: 'schlange', schlangenId },
          { art: 'abschnitt', schlangenId, karteIds: [...neueReihenfolge].sort() },
          { art: 'reihenfolge', karteIds: neueReihenfolge },
        ],
        menge: [],
      }
    }
    case 'SonderkarteWirkungslosAblegen':
      return { folge: [karte(aktion.karteId), { art: 'ablage' }], menge: [] }
    case 'ZugBeenden':
      return { folge: [{ art: 'zugBeenden' }], menge: [] }
    case 'UeberhandAbwerfen':
      return { folge: [], menge: aktion.karteIds.map((karteId): Wahl => ({ art: 'abwerfen', karteId })) }
    case 'Reagieren':
      return { folge: [aktion.farbenschutzId === null ? { art: 'durchlassen' } : { art: 'abwehren', farbenschutzId: aktion.farbenschutzId }], menge: [] }
    case 'Entscheiden':
      return { folge: wegDerEntscheidung(entscheidung, aktion.wahl), menge: [] }
    case 'RisikoKarteSpielen': {
      const folge: Wahl[] = [karte(aktion.risikoKarteId), { art: 'risikoaktion', nummer: aktion.risikoAktion }]
      return { folge: aktion.benannt === null ? folge : [...folge, { art: 'benannt', karteId: aktion.benannt }], menge: [] }
    }
    case 'ComebackEinsetzen':
      return { folge: [karte(aktion.comebackId)], menge: [] }
    case 'ZweiAbwerfenDreiZiehen':
      return { folge: [{ art: 'zweiAbwerfenDreiZiehen' }], menge: aktion.karteIds.map((karteId): Wahl => ({ art: 'abwerfen', karteId })) }
    case 'SchlangenkorbSpielen': {
      const { bonus } = aktion
      const folge: Wahl[] = [karte(aktion.karteId), { art: 'korbbonus', bonus: bonus.art }]
      if (bonus.art === 'tauschen') {
        return { folge, menge: bonus.tausch.map(({ schlangenId, karteId, handkarteId }): Wahl => ({ art: 'tausch', schlangenId, karteId, handkarteId })) }
      }
      return { folge, menge: bonus.art === 'entfernen' ? [schlangenkarte(bonus.ziel)] : [] }
    }
  }
}

/** Gleiche Wahlen haben denselben Schlüssel; jede Wahl entsteht hier mit fester Reihenfolge ihrer Felder. */
export const wahlSchluessel = (wahl: Wahl): string => JSON.stringify(wahl)

interface Eintrag {
  aktion: SpielAktion
  /** Die Folge als Paare aus Schlüssel und Wahl. */
  folge: [string, Wahl][]
  menge: Map<string, Wahl>
}

/*
Die Wege einer Aktionsliste, je Liste einmal zerlegt: Eine Liste der Engine
ändert sich nicht, und mit der Schlangenhäutung hat sie oft Tausende Einträge,
die sonst bei jedem Antippen neu zerlegt würden. Zu einer Liste gehört genau
eine offene Entscheidung oder keine; ihre Art steht mit im Speicher.
*/
const zerlegt = new WeakMap<readonly SpielAktion[], { entscheidung: string | null; liste: Eintrag[] }>()

function eintraege(aktionen: readonly SpielAktion[], entscheidung: string | null): Eintrag[] {
  const bekannt = zerlegt.get(aktionen)
  if (bekannt !== undefined && bekannt.entscheidung === entscheidung) return bekannt.liste
  const liste = aktionen.map((aktion): Eintrag => {
    const { folge, menge } = wegZu(aktion, entscheidung)
    return { aktion, folge: folge.map((wahl) => [wahlSchluessel(wahl), wahl]), menge: new Map(menge.map((wahl) => [wahlSchluessel(wahl), wahl])) }
  })
  zerlegt.set(aktionen, { entscheidung, liste })
  return liste
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
export function auswahlstand(aktionen: readonly SpielAktion[], auswahl: Auswahl, entscheidung: string | null = null): Auswahlstand {
  const { angebote, fertig } = stand(eintraege(aktionen, entscheidung), auswahl.map(wahlSchluessel))
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
export function waehle(aktionen: readonly SpielAktion[], auswahl: Auswahl, wahl: Wahl, entscheidung: string | null = null): Auswahl {
  const liste = eintraege(aktionen, entscheidung)
  const gewaehlt = auswahl.map(wahlSchluessel)
  const neu = wahlSchluessel(wahl)
  const stelle = gewaehlt.indexOf(neu)
  if (stelle >= 0) {
    const inFolge = liste.some((eintrag) => passt(eintrag, gewaehlt) && stelle < eintrag.folge.length)
    return inFolge ? auswahl.slice(0, stelle) : auswahl.filter((_, index) => index !== stelle)
  }
  if (stand(liste, gewaehlt).angebote.has(neu)) return [...auswahl, wahl]
  if (stand(liste, []).angebote.has(neu)) return [wahl]
  throw new Error(`Auswahl: ${neu} ist nicht angeboten; angeboten sind nur Wahlen zu Aktionen der Engine (U3).`)
}

const sortiert = (ids: readonly string[]): string => [...ids].sort().join()

/**
 * Schlangenhäutung (O7): die angebotene Reihenfolge, deren Farbfolge der
 * Anordnung gleicht, die der Mensch gelegt hat. Gleichfarbige Karten dürfen
 * dabei anders liegen als in der aufgezählten Aktion, sie zählen gleich (A11).
 * `null`, wenn keine angeboten ist, weil die Farbfolge geblieben ist (D26).
 * Ordnet die Anordnung andere Karten als den gewählten Abschnitt, wirft sie.
 */
export function passendeReihenfolge(angebote: readonly Wahl[], anordnung: readonly string[], farbeVon: (karteId: string) => string): WahlDerArt<'reihenfolge'> | null {
  const reihenfolgen = angebote.filter((wahl): wahl is WahlDerArt<'reihenfolge'> => wahl.art === 'reihenfolge')
  if (reihenfolgen.length === 0) throw new Error('Auswahl: Es ist keine Reihenfolge angeboten; erst Schlange und Abschnitt der Schlangenhäutung wählen (O7).')
  const karten = sortiert(anordnung)
  const fremd = reihenfolgen.find((wahl) => sortiert(wahl.karteIds) !== karten)
  if (fremd !== undefined) {
    throw new Error(`Auswahl: Die Anordnung ${anordnung.join(', ')} ordnet nicht den gewählten Abschnitt ${fremd.karteIds.join(', ')} neu (O7).`)
  }
  const farben = anordnung.map(farbeVon).join()
  const passend = reihenfolgen.filter((wahl) => wahl.karteIds.map(farbeVon).join() === farben)
  if (passend.length > 1) throw new Error(`Auswahl: ${passend.length} Reihenfolgen haben die Farbfolge ${farben}; die Engine nennt jede Farbfolge eines Abschnitts einmal (O7).`)
  return passend[0] ?? null
}
