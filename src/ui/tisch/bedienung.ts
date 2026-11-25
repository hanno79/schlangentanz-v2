import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { Korbziel, ReagierenAktion, SpielAktion, ZugBeendenAktion } from '../../engine'
import { auswahlstand, waehle, wahlSchluessel } from '../spiel/auswahl'
import type { Auswahl, Wahl, WahlDerArt } from '../spiel/auswahl'
import type { TischAnsicht } from '../spiel/tischAnsicht'
import { ABWEHRFRAGE } from './protokolltexte'

/*
Die Bedienung am Tisch (Plan O5): Karte antippen, dann Ziele antippen, dann
die Ansage bestätigen. Der Hook hält nur, was der Mensch angetippt hat; was
angeboten ist und wann eine Aktion fertig ist, sagt `auswahl` aus den Aktionen
der Engine (U3). Mit einem neuen Spielstand beginnt die Auswahl von vorn.

Bedienbar ist jede aufgezählte Aktion. Die Abwehr hat keine Karte und kein
Ziel am Tisch; die Abwehrfrage in der Zugleiste nimmt sie direkt aus den
aufgezählten Aktionen (O6, `ReaktionsDialog`). Die Schlangenhäutung kam mit
O7 dazu (`haeutung.ts`), mit O10 die Erweiterung: Karten der Auslage,
Entscheidungen (deren Art die Zerlegung mitnimmt) und der Tausch des
Schlangenkorbs. Einen Tausch tippt der Mensch in zwei Schritten an, erst die
Karte der Schlange, dann die Handkarte; die gemerkte Karte der Schlange hält
der Hook. Die Oberfläche baut keine Aktion selbst.
*/

/** Die Aktionen der Engine, die der Tisch über die Auswahl bedient; die Abwehr nimmt die Abwehrfrage selbst (O6). */
function bedienbareAktionen(aktionen: readonly SpielAktion[]): SpielAktion[] {
  return aktionen.filter((aktion) => aktion.typ !== 'Reagieren')
}

/**
 * Wahlen, die nicht am Tisch als Ziel stehen: Handkarte, Zug beenden, Abwerfen
 * (Dialog oder Hand), Abwehr (O6), die Reihenfolge der Häutung, die der Mensch
 * durch Tauschen legt (O7), „Zwei Karten abwerfen, drei ziehen“ (ein Knopf der
 * Zugleiste) und der Tausch des Korbs, den Schlange und Hand in zwei Schritten
 * zeigen (`TauschBedienung`).
 */
const KEIN_ZIEL: ReadonlySet<Wahl['art']> = new Set(['karte', 'zugBeenden', 'abwerfen', 'abwehren', 'durchlassen', 'reihenfolge', 'zweiAbwerfenDreiZiehen', 'tausch'])

type Tauschwahl = WahlDerArt<'tausch'>

/** D44: der Tausch des Schlangenkorbs in zwei Schritten, erst die Farbkarte der Schlange, dann die Handkarte. */
export interface TauschBedienung {
  /** Ob eine Karte der Schlange gemerkt ist und auf ihre Handkarte wartet. */
  hatGemerkt: boolean
  /** Wie die Karte der Schlange gerade steht: angeboten, gemerkt, schon getauscht, oder `null`, wenn sie kein Tausch nennt. */
  platz: (karteId: string) => 'angeboten' | 'gemerkt' | 'getauscht' | null
  /** Merkt die Karte der Schlange; ist sie schon getauscht, nimmt es den Tausch zurück. */
  tippePlatz: (ziel: Korbziel) => void
  /** Der Tausch, den diese Handkarte jetzt trifft: mit der gemerkten Karte der Schlange, oder ein getroffener, den sie zurücknimmt. */
  mitHandkarte: (handkarteId: string) => Tauschwahl | null
}

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
  /** Die Id der gewählten Karte, aus der Hand oder der Auslage, sonst `null`. */
  karteId: string | null
  /** Ob die Engine mit dieser Karte jetzt eine Aktion beginnen lässt, aus der Hand oder der Auslage. */
  spielbar: (karteId: string) => boolean
  /** Wie viele Karten der Mensch abwerfen muss (A5); 0, wenn er nicht abwirft. */
  abwerfen: number
  /** Ob der Mensch gerade seine Karten spielt: Er entscheidet, und es ist nicht das Abwerfen. */
  ausspielen: boolean
  /** Ob der Mensch gerade über eine Entscheidung der Erweiterung wählt (X3); dann gibt es kein „Zug beenden“. */
  entscheidet: boolean
  tausch: TauschBedienung
  /** „Zug beenden“, wenn die Engine es aufzählt, sonst `null`. */
  zugBeenden: ZugBeendenAktion | null
}

const LEER: Auswahl = []

const gleicherPlatz = (a: Korbziel, b: Korbziel) => a.schlangenId === b.schlangenId && a.karteId === b.karteId

/** Die Bedienung zu den Aktionen der Engine; `entscheidung` ist die Art der offenen Entscheidung, falls eine offen ist. */
export function useBedienung(alle: SpielAktion[], entscheidung: string | null = null): Bedienung {
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
  // Was am Anfang angeboten ist; spielbar ist jede Karte, mit der eine Aktion beginnt: Handkarten und Karten der Auslage (O10).
  const anfang = useMemo(() => auswahlstand(aktionen, LEER, entscheidung), [aktionen, entscheidung])
  const spielbareKarten = useMemo(() => new Set(anfang.angebote.flatMap((wahl) => (wahl.art === 'karte' ? [wahl.karteId] : []))), [anfang])
  // Die Auswahl gehört zu den Aktionen, für die sie getroffen wurde; ein neuer Stand beginnt leer.
  const [stand, setzeStand] = useState<{ fuer: SpielAktion[]; auswahl: Auswahl }>({ fuer: alle, auswahl: LEER })
  const auswahl = stand.fuer === alle ? stand.auswahl : LEER
  // Die gemerkte Karte der Schlange gilt nur für die Auswahl, zu der sie gemerkt wurde.
  const [gemerkt, setzeGemerkt] = useState<{ fuer: Auswahl; platz: Korbziel } | null>(null)
  const gemerkterPlatz = gemerkt !== null && gemerkt.fuer === auswahl ? gemerkt.platz : null

  const { angebote, fertig } = useMemo(() => (auswahl.length === 0 ? anfang : auswahlstand(aktionen, auswahl, entscheidung)), [anfang, aktionen, auswahl, entscheidung])
  const angeboteneSchluessel = useMemo(() => new Set(angebote.map(wahlSchluessel)), [angebote])
  const gewaehlteSchluessel = useMemo(() => new Set(auswahl.map(wahlSchluessel)), [auswahl])
  const ziele = useMemo(
    () => [...angebote, ...auswahl.filter((wahl) => !angeboteneSchluessel.has(wahlSchluessel(wahl)))].filter((wahl) => !KEIN_ZIEL.has(wahl.art)),
    [angebote, auswahl, angeboteneSchluessel],
  )

  const hebeAuf = useCallback(() => setzeStand({ fuer: alle, auswahl: LEER }), [alle])
  const tippe = useCallback((wahl: Wahl) => setzeStand({ fuer: alle, auswahl: waehle(aktionen, auswahl, wahl, entscheidung) }), [alle, aktionen, auswahl, entscheidung])

  const tausch = useMemo((): TauschBedienung => {
    const angeboten = angebote.filter((wahl): wahl is Tauschwahl => wahl.art === 'tausch')
    const getauscht = auswahl.filter((wahl): wahl is Tauschwahl => wahl.art === 'tausch')
    // Jede Karte jeder Schlange fragt nach ihrem Stand; deshalb einmal als Tabelle.
    const stand = new Map<string, 'angeboten' | 'gemerkt' | 'getauscht'>(angeboten.map((wahl) => [wahl.karteId, 'angeboten']))
    if (gemerkterPlatz !== null) stand.set(gemerkterPlatz.karteId, 'gemerkt')
    for (const wahl of getauscht) stand.set(wahl.karteId, 'getauscht')
    return {
      hatGemerkt: gemerkterPlatz !== null,
      platz: (karteId) => stand.get(karteId) ?? null,
      tippePlatz: (ziel) => {
        const frueher = getauscht.find((wahl) => gleicherPlatz(wahl, ziel))
        if (frueher !== undefined) tippe(frueher)
        else setzeGemerkt(gemerkterPlatz !== null && gleicherPlatz(gemerkterPlatz, ziel) ? null : { fuer: auswahl, platz: ziel })
      },
      mitHandkarte: (handkarteId) => {
        if (gemerkterPlatz !== null) return angeboten.find((wahl) => gleicherPlatz(wahl, gemerkterPlatz) && wahl.handkarteId === handkarteId) ?? null
        return getauscht.find((wahl) => wahl.handkarteId === handkarteId) ?? null
      },
    }
  }, [angebote, auswahl, gemerkterPlatz, tippe])

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
    entscheidet: aktionen.length > 0 && aktionen.every((aktion) => aktion.typ === 'Entscheiden'),
    tausch,
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

/** Das erste Ziel dieser Art in `ziele`, auf das `passt` zutrifft. */
export function zielDerArt<A extends Wahl['art']>(ziele: readonly Wahl[], art: A, passt: (wahl: WahlDerArt<A>) => boolean = () => true): WahlDerArt<A> | undefined {
  return ziele.find((wahl): wahl is WahlDerArt<A> => wahl.art === art && passt(wahl as WahlDerArt<A>))
}

export const istReaktion = (aktion: SpielAktion): aktion is ReagierenAktion => aktion.typ === 'Reagieren'

/** Ob die Abwehrfrage an dich offen ist: Eine angesagte Karte schwebt, und du entscheidest (A6, O6). */
export function abwehrfrageOffen(ansicht: TischAnsicht): boolean {
  return ansicht.status.schwebend?.entscheidet.ich === true && ansicht.aktionen.some(istReaktion)
}

/** Abwehren und Durchlassen der offenen Abwehrfrage aus den Aktionen der Engine (O6); Abwehren fehlt ohne Farbenschutz. */
export function reaktionenVon(ansicht: TischAnsicht): { abwehren: ReagierenAktion | undefined; durchlassen: ReagierenAktion } {
  const reaktionen = ansicht.aktionen.filter(istReaktion)
  const durchlassen = reaktionen.find((aktion) => aktion.farbenschutzId === null)
  if (durchlassen === undefined) throw new Error('Abwehrfrage: Die Engine bietet kein Durchlassen an; jeder Gefragte kann durchlassen (D33).')
  return { abwehren: reaktionen.find((aktion) => aktion.farbenschutzId !== null), durchlassen }
}

/** Der Hinweis zur Abwehrfrage, sichtbar unter der Frage und vom Ansager vorgelesen (O11 K2). */
export const schutzHinweis = (abwehren: ReagierenAktion | undefined): string => (abwehren === undefined ? ABWEHRFRAGE.ohneSchutz : ABWEHRFRAGE.mitSchutz)
