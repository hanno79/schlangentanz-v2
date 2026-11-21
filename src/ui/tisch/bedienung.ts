import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { SpielAktion, ZugBeendenAktion } from '../../engine'
import { auswahlstand, waehle, wahlSchluessel } from '../spiel/auswahl'
import type { Auswahl, Wahl } from '../spiel/auswahl'

/*
Die Bedienung am Tisch (Plan O5): Karte antippen, dann Ziele antippen, dann
die Ansage bestätigen. Der Hook hält nur, was der Mensch angetippt hat; was
angeboten ist und wann eine Aktion fertig ist, sagt `auswahl` aus den Aktionen
der Engine (U3). Mit einem neuen Spielstand beginnt die Auswahl von vorn.

Bedienbar sind alle aufgezählten Aktionen ausser der Abwehr, die O6 baut; die
Schlangenhäutung kam mit O7 dazu (`haeutung.ts`). Die Oberfläche lässt die
Abwehr nur weg, sie baut keine Aktion selbst.
*/

const NOCH_NICHT_BEDIENBAR: ReadonlySet<SpielAktion['typ']> = new Set(['Reagieren'])

/** Die Aktionen der Engine, die der Tisch bedienbar macht. */
function bedienbareAktionen(aktionen: readonly SpielAktion[]): SpielAktion[] {
  return aktionen.filter((aktion) => !NOCH_NICHT_BEDIENBAR.has(aktion.typ))
}

/**
 * Wahlen, die nicht am Tisch als Ziel stehen: Handkarte, Zug beenden, Abwerfen
 * (Dialog), Abwehr (O6) und die Reihenfolge der Häutung, die der Mensch durch
 * Tauschen legt (O7).
 */
const KEIN_ZIEL: ReadonlySet<Wahl['art']> = new Set(['karte', 'zugBeenden', 'abwerfen', 'abwehren', 'durchlassen', 'reihenfolge'])

export interface Bedienung {
  /** Die bedienbaren Aktionen der Engine. */
  aktionen: SpielAktion[]
  auswahl: Auswahl
  /** Was jetzt angetippt werden kann, auch Handkarten und „Zug beenden“. */
  angebote: Wahl[]
  /** Die Aktion der Engine, die die Auswahl vollständig beschreibt; sonst `null`. */
  fertig: SpielAktion | null
  /** Die Ziele am Tisch und in der Zugleiste: angeboten oder schon gewählt. */
  ziele: Wahl[]
  angeboten: (wahl: Wahl) => boolean
  gewaehlt: (wahl: Wahl) => boolean
  /** Trifft eine Wahl; eine gewählte nimmt sie zurück (`waehle`). */
  tippe: (wahl: Wahl) => void
  hebeAuf: () => void
  /** Die Id der gewählten Handkarte, sonst `null`. */
  karteId: string | null
  /** Ob die Engine diese Handkarte jetzt spielen lässt. */
  spielbar: (karteId: string) => boolean
  /** Wie viele Karten der Mensch abwerfen muss (A5); 0, wenn er nicht abwirft. */
  abwerfen: number
  /** Ob der Mensch gerade seine Karten spielt: Er entscheidet, und es ist nicht das Abwerfen. */
  ausspielen: boolean
  /** „Zug beenden“, wenn die Engine es aufzählt, sonst `null`. */
  zugBeenden: ZugBeendenAktion | null
}

const LEER: Auswahl = []

export function useBedienung(alle: SpielAktion[]): Bedienung {
  const aktionen = useMemo(() => bedienbareAktionen(alle), [alle])
  const { abwerfen, zugBeenden } = useMemo(() => {
    let anzahl = 0
    let beenden: ZugBeendenAktion | null = null
    for (const aktion of aktionen) {
      if (aktion.typ === 'UeberhandAbwerfen') anzahl = aktion.karteIds.length
      if (aktion.typ === 'ZugBeenden') beenden = aktion
    }
    return { abwerfen: anzahl, zugBeenden: beenden }
  }, [aktionen])
  const spielbareKarten = useMemo(() => new Set(aktionen.flatMap((aktion) => ('karteId' in aktion ? [aktion.karteId] : []))), [aktionen])
  // Die Auswahl gehört zu den Aktionen, für die sie getroffen wurde; ein neuer Stand beginnt leer.
  const [stand, setzeStand] = useState<{ fuer: SpielAktion[]; auswahl: Auswahl }>({ fuer: alle, auswahl: LEER })
  const auswahl = stand.fuer === alle ? stand.auswahl : LEER

  const { angebote, fertig } = useMemo(() => auswahlstand(aktionen, auswahl), [aktionen, auswahl])
  const angeboteneSchluessel = useMemo(() => new Set(angebote.map(wahlSchluessel)), [angebote])
  const gewaehlteSchluessel = useMemo(() => new Set(auswahl.map(wahlSchluessel)), [auswahl])
  const ziele = useMemo(
    () => [...angebote, ...auswahl.filter((wahl) => !angeboteneSchluessel.has(wahlSchluessel(wahl)))].filter((wahl) => !KEIN_ZIEL.has(wahl.art)),
    [angebote, auswahl, angeboteneSchluessel],
  )

  const hebeAuf = useCallback(() => setzeStand({ fuer: alle, auswahl: LEER }), [alle])
  const tippe = useCallback((wahl: Wahl) => setzeStand({ fuer: alle, auswahl: waehle(aktionen, auswahl, wahl) }), [alle, aktionen, auswahl])

  // Escape hebt die Auswahl auf (O5 K1), nicht aber, solange ein Dialog offen ist: Dort schliesst Escape den Dialog.
  const etwasGewaehlt = auswahl.length > 0
  useEffect(() => {
    if (!etwasGewaehlt) return
    const beiTaste = (ereignis: KeyboardEvent) => {
      if (ereignis.key !== 'Escape' || ereignis.defaultPrevented) return
      if (document.querySelector('dialog[open]') !== null) return
      hebeAuf()
    }
    document.addEventListener('keydown', beiTaste)
    return () => document.removeEventListener('keydown', beiTaste)
  }, [etwasGewaehlt, hebeAuf])

  const erste = auswahl[0]
  return {
    aktionen,
    auswahl,
    angebote,
    fertig,
    ziele,
    angeboten: (wahl) => angeboteneSchluessel.has(wahlSchluessel(wahl)),
    gewaehlt: (wahl) => gewaehlteSchluessel.has(wahlSchluessel(wahl)),
    tippe,
    hebeAuf,
    karteId: erste?.art === 'karte' ? erste.karteId : null,
    spielbar: (karteId) => spielbareKarten.has(karteId),
    abwerfen,
    ausspielen: aktionen.length > 0 && abwerfen === 0,
    zugBeenden,
  }
}

export const ZielKontext = createContext<Bedienung | null>(null)

/** Die Bedienung des Tischs; `null`, wenn der Tisch nur zeigt. */
export function useZiele(): Bedienung | null {
  return useContext(ZielKontext)
}

/** Die Ziele, die zu dieser Schlange gehören. */
export function zieleDerSchlange(bedienung: Bedienung | null, schlangenId: string): Wahl[] {
  return bedienung === null ? [] : bedienung.ziele.filter((wahl) => 'schlangenId' in wahl && wahl.schlangenId === schlangenId)
}

type WahlDerArt<A extends Wahl['art']> = Extract<Wahl, { art: A }>

/** Das erste Ziel dieser Art in `ziele`, auf das `passt` zutrifft. */
export function zielDerArt<A extends Wahl['art']>(ziele: readonly Wahl[], art: A, passt: (wahl: WahlDerArt<A>) => boolean = () => true): WahlDerArt<A> | undefined {
  return ziele.find((wahl): wahl is WahlDerArt<A> => wahl.art === art && passt(wahl as WahlDerArt<A>))
}
